// Backend/src/controller/dashboardController.js
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const ExcelJS = require('exceljs');
const mongoose = require('mongoose');

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const { organizerId } = req.params;
    
    console.log('Fetching analytics for organizer:', organizerId);

    // Get events created by this organizer
    const events = await Event.find({ createdBy: organizerId })
      .populate('registeredUsers.userId', 'name email department year');

    // Calculate basic stats
    const totalEvents = events.length;
    const totalRegistrations = events.reduce((sum, event) => {
      return sum + (event.registeredUsers ? event.registeredUsers.filter(reg => reg.status !== 'cancelled').length : 0);
    }, 0);
    
    const now = new Date();
    const activeEvents = events.filter(event => 
      event.status === 'active' || (new Date(event.date) > now && event.status !== 'cancelled')
    ).length;
    
    const upcomingEvents = events.filter(event => new Date(event.date) > now).length;

    // Registration trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const registrationTrends = [];
    const monthlyStats = {};

    events.forEach(event => {
      if (event.registeredUsers) {
        event.registeredUsers.forEach(reg => {
          const regDate = new Date(reg.registeredAt);
          if (regDate >= sixMonthsAgo && reg.status !== 'cancelled') {
            const monthKey = regDate.toISOString().substring(0, 7); // YYYY-MM format
            monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
          }
        });
      }
    });

    // Convert to array format for charts
    Object.keys(monthlyStats).sort().forEach(month => {
      registrationTrends.push({
        _id: { date: month },
        count: monthlyStats[month]
      });
    });

    // Category distribution
    const categoryStats = {};
    events.forEach(event => {
      const category = event.type || event.category || 'Other';
      if (!categoryStats[category]) {
        categoryStats[category] = { _id: category, count: 0, totalRegistrations: 0 };
      }
      categoryStats[category].count += 1;
      categoryStats[category].totalRegistrations += event.registeredUsers ? 
        event.registeredUsers.filter(reg => reg.status !== 'cancelled').length : 0;
    });

    // Recent registrations (last 10)
    const allRegistrations = [];
    for (const event of events) {
      if (event.registeredUsers) {
        for (const reg of event.registeredUsers) {
          if (reg.status !== 'cancelled' && reg.userId) {
            allRegistrations.push({
              userName: reg.userId.name || 'Unknown',
              userEmail: reg.userId.email || '',
              eventTitle: event.title,
              eventId: event._id,
              registeredAt: reg.registeredAt,
              status: reg.status
            });
          }
        }
      }
    }

    const recentRegistrations = allRegistrations
      .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
      .slice(0, 10);

    // Calculate average completion rate
    const eventsWithRegistrations = events.filter(e => e.maxParticipants > 0);
    const avgCompletionRate = eventsWithRegistrations.length > 0 
      ? Math.round(eventsWithRegistrations.reduce((sum, event) => {
          const regCount = event.registeredUsers ? event.registeredUsers.filter(reg => reg.status !== 'cancelled').length : 0;
          return sum + (regCount / event.maxParticipants) * 100;
        }, 0) / eventsWithRegistrations.length)
      : 0;

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalEvents,
          totalRegistrations,
          activeEvents,
          upcomingEvents,
          completionRate: avgCompletionRate
        },
        registrationTrends,
        categoryStats: Object.values(categoryStats),
        recentRegistrations
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get organizer's events with filtering
const getOrganizerEvents = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { page = 1, limit = 10, status, category, search } = req.query;

    console.log('Fetching events for organizer:', organizerId);

    const query = { createdBy: organizerId };
    
    if (status && status !== 'all') {
      if (status === 'active') {
        query.$or = [
          { status: 'active' },
          { date: { $gt: new Date() } }
        ];
      } else {
        query.status = status;
      }
    }
    
    if (category && category !== 'all') {
      query.$or = [
        { category: category },
        { type: category }
      ];
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .populate('registeredUsers.userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    // Transform events to include registration count
    const transformedEvents = events.map(event => ({
      _id: event._id,
      title: event.title,
      date: event.date,
      venue: event.venue,
      category: event.category || event.type,
      status: new Date(event.date) > new Date() ? 'upcoming' : 
              event.status === 'cancelled' ? 'cancelled' : 'completed',
      registrationCount: event.registeredUsers ? 
        event.registeredUsers.filter(reg => reg.status !== 'cancelled').length : 0,
      maxParticipants: event.maxParticipants || 100,
      createdAt: event.createdAt
    }));

    res.status(200).json({
      success: true,
      events: transformedEvents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Export registrations to Excel
const exportRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('registeredUsers.userId', 'name email phone department year rollNumber');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Event Registrations');

    // Add event info header
    worksheet.addRow(['EVENT REGISTRATIONS REPORT']);
    worksheet.addRow([]);
    worksheet.addRow(['Event Name:', event.title]);
    worksheet.addRow(['Date:', new Date(event.date).toLocaleDateString()]);
    worksheet.addRow(['Venue:', event.venue]);
    worksheet.addRow(['Category:', event.type || event.category]);
    worksheet.addRow(['Total Registrations:', event.registeredUsers ? event.registeredUsers.filter(reg => reg.status !== 'cancelled').length : 0]);
    worksheet.addRow(['Max Participants:', event.maxParticipants]);
    worksheet.addRow([]);

    // Style the header
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };

    // Add data headers
    const headers = [
      'S.No.',
      'Name',
      'Email',
      'Phone',
      'Department',
      'Year',
      'Roll Number',
      'Registration Date',
      'Status'
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Add registration data
    const activeRegistrations = event.registeredUsers ? event.registeredUsers.filter(reg => reg.status !== 'cancelled') : [];
    activeRegistrations.forEach((registration, index) => {
      const user = registration.userId;
      worksheet.addRow([
        index + 1,
        user?.name || 'N/A',
        user?.email || 'N/A',
        user?.phone || 'Not Provided',
        user?.department || 'Not Specified',
        user?.year || 'Not Specified',
        user?.rollNumber || 'Not Provided',
        new Date(registration.registeredAt).toLocaleDateString(),
        registration.status || 'registered'
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });

    // Set response headers
    const fileName = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Send file
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export registrations',
      error: error.message
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { organizerId } = req.body;

    const event = await Event.findOneAndDelete({ 
      _id: eventId, 
      createdBy: organizerId 
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to delete this event'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getOrganizerEvents,
  exportRegistrations,
  deleteEvent
};