import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth0 } from '@auth0/auth0-react';
import { FixedSizeGrid as Grid } from "react-window";
import styles from "./Events.module.css";
import EventCard from "../components/card/EventCard";
import SearchRow from "../components/SearchRow/SearchRow";
import CompactSearchBar from "../components/CompactSearchBar/CompactSearchBar";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import BackToTop from "../components/BackToTop/BackToTop";
import CalendarView from "../components/CalendarView/CalendarView";
import NotificationPreferences from "../components/NotificationPreferences/NotificationPreferences";
import EventFeedback from "../components/EventFeedback/EventFeedback";
import EventCardSkeleton from "../components/LoadingSkeleton/EventCardSkeleton";
import { IoIosNotifications } from "react-icons/io";
import { RiFeedbackLine } from "react-icons/ri";
import { ImCalendar } from "react-icons/im";
import { BsFillGrid3X3GapFill } from "react-icons/bs";

const Events = () => {
  const navigate = useNavigate();
  const { user: auth0User, isAuthenticated } = useAuth0();
  const GUTTER = 16;

  // State for MongoDB events
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Existing state
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [filters, setFilters] = useState({
    category: 'All',
    format: 'All',
    price: 'All',
    department: 'All',
    timeSlot: 'All',
    dateRange: { start: '', end: '' }
  });
  const [sortBy, setSortBy] = useState('date-asc');
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarkedEvents, setBookmarkedEvents] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState(null);
  
  const events = allEvents;

  // Fetch events from MongoDB
 // ...existing code...

// Fetch events from MongoDB
const fetchEvents = async () => {
  try {
    setLoading(true);
    console.log('Fetching events from backend...');
    
    const response = await fetch('http://localhost:5000/api/events');
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    const data = await response.json();
    console.log('Fetched events:', data);
    
    // Fix: Extract events array from response
    const eventsData = data.events || data; // Handle both response formats
    
    // Transform MongoDB data to match your existing component structure
    const transformedEvents = eventsData.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0], // Format: YYYY-MM-DD
      time: new Date(event.date).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      venue: event.venue,
      category: event.category,
      image: event.image || '',
      author: event.author,
      authorId: event.authorId,
      registrationCount: event.registrationCount || 0,
      status: event.status,
      // Add default values for existing component compatibility
      format: 'In-Person', // Default value
      price: 'Free', // Default value
      department: 'General', // Default value
      tags: [event.category], // Use category as tag
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));
    
    setAllEvents(transformedEvents);
  } catch (err) {
    console.error('Error fetching events:', err);
    setError(err.message);
    toast.error('Failed to load events');
  } finally {
    setLoading(false);
  }
};

// ...existing code...
  // Register for event
  const handleRegister = async (eventId) => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        toast.error('Please complete your profile first');
        navigate('/profile');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast.success('Successfully registered for the event!');
        fetchEvents(); // Refresh events to update registration count
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to register for event');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Network error. Please try again.');
    }
  };

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Responsive columns logic
  const getColumnCount = () => {
    if (typeof window === "undefined") return 1;
    if (window.innerWidth < 480) return 1;
    if (window.innerWidth < 900) return 2;
    if (window.innerWidth < 1200) return 3;
    return 4;
  };
  
  const [columnCount, setColumnCount] = React.useState(getColumnCount());
  
  React.useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rowCount = Math.ceil(events.length / columnCount);
  const useVirtual = events.length > 8;

  // Cell renderer for react-window Grid
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const idx = rowIndex * columnCount + columnIndex;
    if (idx >= filteredAndSortedEvents.length) return null;
    return (
      <div
        style={{
          ...style,
          left: style.left + GUTTER / 2,
          top: style.top + GUTTER / 2,
        }}
      >
        <EventCard 
          key={filteredAndSortedEvents[idx].id} 
          event={filteredAndSortedEvents[idx]} 
          // onRegister={() => handleRegister(filteredAndSortedEvents[idx].id)}
        />
      </div>
    );
  };

  // Filtering and sorting logic
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      // Search filter
      if (search && !event.title.toLowerCase().includes(search.toLowerCase()) &&
          !event.description?.toLowerCase().includes(search.toLowerCase()) &&
          !event.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))) {
        return false;
      }

      // Category filter
      if (filters.category !== 'All' && event.category !== filters.category) {
        return false;
      }

      // Format filter
      if (filters.format !== 'All' && event.format !== filters.format) {
        return false;
      }

      // Price filter
      if (filters.price !== 'All') {
        if (filters.price === 'Free' && event.price !== 'Free') {
          return false;
        }
        if (filters.price === 'Paid' && event.price === 'Free') {
          return false;
        }
      }

      // Department filter
      if (filters.department !== 'All' && event.department !== filters.department) {
        return false;
      }

      // Time slot filter
      if (filters.timeSlot !== 'All') {
        const eventTime = event.time;
        const hour = parseInt(eventTime.split(':')[0]);
        const period = eventTime.split(' ')[1];
        const hour24 = period === 'PM' && hour !== 12 ? hour + 12 : (period === 'AM' && hour === 12 ? 0 : hour);
        
        if (filters.timeSlot === 'Morning (6AM-12PM)' && (hour24 < 6 || hour24 >= 12)) {
          return false;
        }
        if (filters.timeSlot === 'Afternoon (12PM-6PM)' && (hour24 < 12 || hour24 >= 18)) {
          return false;
        }
        if (filters.timeSlot === 'Evening (6PM-12AM)' && (hour24 < 18 || hour24 >= 24)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const eventDate = new Date(event.date);
        if (filters.dateRange.start && eventDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && eventDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'popularity':
          return (b.registrationCount || 0) - (a.registrationCount || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, search, filters, sortBy]);

  // Event handlers
  const handleClearFilters = () => {
    setFilters({
      category: 'All',
      format: 'All',
      price: 'All',
      department: 'All',
      timeSlot: 'All',
      dateRange: { start: '', end: '' }
    });
    setSearch('');
  };

  const handleEventClick = (event) => {
    navigate(`/events/${event.id}`);
  };

  const handleFeedbackClick = (event) => {
    setSelectedEventForFeedback(event);
    setShowFeedback(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.eventsContainer}>
        <div className={styles.eventsContent}>
          <Breadcrumb />
          <div className={styles.eventsTextContent}>
            <h2 className={styles.eventsTitle}>Loading Events...</h2>
          </div>
          <div className={styles.eventsCardsContent}>
            {Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.eventsContainer}>
        <div className={styles.eventsContent}>
          <Breadcrumb />
          <div className={styles.eventsTextContent}>
            <h2 className={styles.eventsTitle}>Error Loading Events</h2>
            <p className={styles.eventsDescription}>
              {error}
            </p>
            <button 
              className={styles.clearFiltersButton}
              onClick={fetchEvents}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
// Add this in your EventDetails.jsx right before the return statement:
// console.log("Event object:", event);
// console.log("Event image URL:", event?.image);
// console.log("Image src being used:", event.image || "/default-event-image.jpg");
  return (
    <>
      <div className={styles.eventsContainer}>
        <div className={styles.eventsContent}>
          <Breadcrumb />
          
          <div className={styles.eventsTextContent}>
            <h2 className={styles.eventsTitle}>Discover Campus Events</h2>
            <p className={styles.eventsDescription}>
              Explore all upcoming campus events in one place, posted directly by
              your college committees.
            </p>
            <div className={styles.eventsStats}>
              <span className={styles.eventsCount}>
                {filteredAndSortedEvents.length} events found
              </span>
              {/* Create Event Button for authenticated users */}
              {isAuthenticated && (
                <button
                  onClick={() => navigate('/create-event')}
                  className={styles.createEventButton}
                >
                  + Create New Event
                </button>
              )}
            </div>
          </div>

          <SearchRow
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
          />

          <CompactSearchBar
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
          />

          <div className={styles.viewControls}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <BsFillGrid3X3GapFill /> Grid View
              </button>
              <button
                className={`${styles.viewButton} ${viewMode === 'calendar' ? styles.active : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <ImCalendar /> Calendar View
              </button>
            </div>
            <div className={styles.actionButtons}>
              <button
                className={styles.actionButton}
                onClick={() => setShowNotificationPrefs(true)}
                title="Notification Preferences"
              >
                <IoIosNotifications />
              </button>
              <button
                className={styles.actionButton}
                onClick={() => setShowFeedback(true)}
                title="Give Feedback"
              >
                <RiFeedbackLine />
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className={styles.eventsCardsContent}>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <EventCardSkeleton key={index} />
                ))
              ) : filteredAndSortedEvents.length > 0 ? (
                useVirtual ? (
                  <Grid
                    columnCount={columnCount}
                    columnWidth={300 + GUTTER}
                    height={600}
                    rowCount={Math.ceil(filteredAndSortedEvents.length / columnCount)}
                    rowHeight={400 + GUTTER}
                    width="100%"
                    style={{
                      paddingLeft: GUTTER / 2,
                      paddingTop: GUTTER / 2,
                    }}
                  >
                    {Cell}
                  </Grid>
                ) : (
                  filteredAndSortedEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      // onRegister={() => handleRegister(event.id)}
                    />
                  ))
                )
              ) : (
                <div className={styles.noResults}>
                  <h3>No events found</h3>
                  <p>Try adjusting your search criteria or filters.</p>
                  <button 
                    className={styles.clearFiltersButton}
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <CalendarView
              events={filteredAndSortedEvents}
              onEventClick={handleEventClick}
            />
          )}
        </div>
      </div>
      <BackToTop />
      
      <NotificationPreferences
        isOpen={showNotificationPrefs}
        onClose={() => setShowNotificationPrefs(false)}
      />
      
      <EventFeedback
        eventId={selectedEventForFeedback?.id}
        isOpen={showFeedback}
        onClose={() => {
          setShowFeedback(false);
          setSelectedEventForFeedback(null);
        }}
      />
    </>
  );
};

export default Events;