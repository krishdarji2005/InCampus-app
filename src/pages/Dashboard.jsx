// src/pages/Dashboard.jsx - Fixed imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaArrowUp,
  FaSearch,
  FaBell,
  FaCog,
  FaPercentage,
  FaChartBar,
  FaFilter
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const organizerId = localStorage.getItem('userId');

  useEffect(() => {
    if (organizerId) {
      fetchDashboardData();
      fetchEvents();
    } else {
      toast.error('Please log in to view dashboard');
      navigate('/');
    }
  }, [organizerId, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/dashboard/analytics/${organizerId}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        category: categoryFilter,
        search: searchTerm,
        limit: '20'
      });

      const response = await fetch(`http://localhost:5000/api/dashboard/organizer/${organizerId}/events?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
      } else {
        toast.error('Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (organizerId) {
      const timeoutId = setTimeout(() => {
        fetchEvents();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, statusFilter, categoryFilter, organizerId]);

  const handleExportRegistrations = async (eventId, eventTitle) => {
    try {
      toast.info('Preparing download...');
      
      const response = await fetch(`http://localhost:5000/api/dashboard/events/${eventId}/export`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_registrations.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Registration data downloaded successfully!');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting registrations:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/dashboard/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizerId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Event deleted successfully');
        fetchEvents();
        fetchDashboardData();
      } else {
        toast.error(data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return styles.upcoming;
      case 'active': return styles.active;
      case 'completed': return styles.completed;
      case 'cancelled': return styles.cancelled;
      default: return styles.active;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p className={styles.loadingText}>Loading your dashboard...</p>
      </div>
    );
  }

  const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Enhanced Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.welcomeSection}>
              <h1>Dashboard</h1>
              <p className={styles.subtitle}>
                Welcome back, {currentUser.name?.split(' ')[0] || 'Organizer'}
              </p>
              <p className={styles.description}>
                Manage your events and track performance
              </p>
            </div>
            <div className={styles.headerActions}>
              <button 
                className={styles.primaryButton}
                onClick={() => navigate('/create-event')}
              >
                <FaPlus />
                New Event
              </button>
              {/* <button className={styles.iconButton} title="Notifications">
                <FaBell />
                <span className={styles.notificationDot}></span>
              </button>
              <button className={styles.iconButton} title="Settings">
                <FaCog />
              </button> */}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FaCalendarAlt />
              </div>
              <div className={styles.statTrend}>
                <FaArrowUp />
                <span>+12%</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <h3>{analytics?.overview?.totalEvents || 0}</h3>
              <p>Total Events</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FaUsers />
              </div>
              <div className={styles.statTrend}>
                <FaArrowUp />
                <span>+24%</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <h3>{analytics?.overview?.totalRegistrations || 0}</h3>
              <p>Total Registrations</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FaChartLine />
              </div>
              <div className={styles.statTrend}>
                <FaArrowUp />
                <span>+8%</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <h3>{analytics?.overview?.activeEvents || 0}</h3>
              <p>Active Events</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FaPercentage />
              </div>
              <div className={styles.statTrend}>
                <FaArrowUp />
                <span>+5%</span>
              </div>
            </div>
            <div className={styles.statContent}>
              <h3>{analytics?.overview?.completionRate || 0}%</h3>
              <p>Fill Rate</p>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className={styles.chartsSection}>
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <div>
                <h3>Registration Trends</h3>
                <p className={styles.chartSubtitle}>Monthly registration overview</p>
              </div>
              <select className={styles.filterSelect} defaultValue="6months">
                <option value="6months">Last 6 months</option>
                <option value="3months">Last 3 months</option>
                <option value="1year">Last year</option>
              </select>
            </div>
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analytics?.registrationTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.5} />
                  <XAxis 
                    dataKey="_id.date" 
                    stroke="#64748b"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: '#1e293b'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <div>
                <h3>Events by Category</h3>
                <p className={styles.chartSubtitle}>Distribution overview</p>
              </div>
            </div>
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 90 }}>
                  <Pie
                    data={analytics?.categoryStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={70}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analytics?.categoryStats || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: '#1e293b'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Enhanced Events Section */}
        <div className={styles.eventsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Events</h2>
              <p className={styles.sectionSubtitle}>Manage your events ({events.length})</p>
            </div>
            <div className={styles.sectionActions}>
              <div className={styles.searchBox}>
                <FaSearch />
                <input 
                  type="text" 
                  placeholder="Search events..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className={styles.filterGroup}>
                <select 
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <select 
                  className={styles.filterSelect}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Academic">Academic</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
            </div>
          </div>

          {eventsLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.loader}></div>
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <FaCalendarAlt />
              </div>
              <h3>No Events Found</h3>
              <p>
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters to see more events.'
                  : "You haven't created any events yet. Create your first event to get started!"}
              </p>
              <button 
                className={styles.primaryButton}
                onClick={() => navigate('/create-event')}
              >
                <FaPlus />
                Create Event
              </button>
            </div>
          ) : (
            <div className={styles.eventsTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderCell}>Event</div>
                <div className={styles.tableHeaderCell}>Date</div>
                <div className={styles.tableHeaderCell}>Venue</div>
                <div className={styles.tableHeaderCell}>Registration</div>
                <div className={styles.tableHeaderCell}>Status</div>
                <div className={styles.tableHeaderCell}>Actions</div>
              </div>
              <div className={styles.tableBody}>
                {events.map(event => (
                  <div key={event._id} className={styles.tableRow}>
                    <div className={styles.tableCell}>
                      <div className={styles.eventInfo}>
                        <div className={styles.eventAvatar}>
                          {event.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.eventTitle}>{event.title}</div>
                          <div className={styles.eventCategory}>{event.category}</div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.tableCell}>
                      <div className={styles.eventDate}>
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className={styles.tableCell}>
                      <div className={styles.eventVenue}>{event.venue}</div>
                    </div>
                    <div className={styles.tableCell}>
                      <div className={styles.registrationInfo}>
                        <div className={styles.registrationCount}>
                          {event.registrationCount}/{event.maxParticipants}
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{ 
                              width: `${Math.min((event.registrationCount / event.maxParticipants) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={styles.tableCell}>
                      <span className={`${styles.statusBadge} ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.actionButton}
                          onClick={() => navigate(`/events/${event._id}`)}
                          title="View Event"
                        >
                          <FaEye />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleExportRegistrations(event._id, event.title)}
                          title="Export Data"
                        >
                          <FaDownload />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => navigate(`/events/${event._id}/edit`)}
                          title="Edit Event"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleDeleteEvent(event._id, event.title)}
                          title="Delete Event"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Recent Activity */}
        {analytics?.recentRegistrations && analytics.recentRegistrations.length > 0 && (
          <div className={styles.activitySection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Recent Activity</h2>
                <p className={styles.sectionSubtitle}>Latest registrations</p>
              </div>
            </div>
            <div className={styles.activityList}>
              {analytics.recentRegistrations.slice(0, 5).map((reg, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityAvatar}>
                    {reg.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      <strong>{reg.userName}</strong> registered for <strong>{reg.eventTitle}</strong>
                    </div>
                    <div className={styles.activityTime}>
                      {new Date(reg.registeredAt).toLocaleDateString()} at {new Date(reg.registeredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  <div className={styles.activityDot}></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;