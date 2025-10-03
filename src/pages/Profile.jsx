import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import EventCard from '../components/card/EventCard';
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mock user data (replace with actual API call)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockUser = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Computer Science',
        year: 'TE',
        role: 'student'
      };
      setUser(mockUser);
      
      // Fetch registered events (mock data)
      const mockEvents = [
        {
          _id: '1',
          title: 'Hackathon 2023',
          description: 'Annual coding competition',
          date: new Date('2023-12-15'),
          venue: 'Main Auditorium',
          committee: 'CodeClub',
          image: '/src/assets/card-default.jpg',
          category: 'Technical'
        },
        {
          _id: '2',
          title: 'Cultural Fest',
          description: 'Annual cultural festival',
          date: new Date('2023-11-20'),
          venue: 'College Ground',
          committee: 'Cultural Committee',
          image: '/src/assets/card-default.jpg',
          category: 'Cultural'
        }
      ];
      setRegisteredEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCancelRegistration = (eventId) => {
    // Mock API call to cancel registration
    setRegisteredEvents(prev => prev.filter(event => event._id !== eventId));
    toast.success('Registration cancelled successfully');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>My Profile</h1>
      </div>
      
      <div className={styles.profileCard}>
        <div className={styles.profileInfo}>
          <h2>{user.name}</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Year:</strong> {user.year}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      </div>
      
      <div className={styles.eventsSection}>
        <h2>My Registered Events</h2>
        {registeredEvents.length === 0 ? (
          <div className={styles.noEvents}>
            <p>You haven't registered for any events yet.</p>
            <button 
              className={styles.browseButton}
              onClick={() => navigate('/events')}
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {registeredEvents.map(event => (
              <div key={event._id} className={styles.eventCardWrapper}>
                <EventCard event={event} />
                <button 
                  className={styles.cancelButton}
                  onClick={() => handleCancelRegistration(event._id)}
                >
                  Cancel Registration
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;