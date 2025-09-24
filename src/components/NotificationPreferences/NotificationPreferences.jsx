import React, { useState } from 'react';
import styles from './NotificationPreferences.module.css';

const NotificationPreferences = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    emailReminders: true,
    pushNotifications: false,
    eventUpdates: true,
    newEvents: true,
    reminderTime: '24', // hours before event
    categories: {
      Academic: true,
      Professional: true,
      Social: false,
      Sports: false
    }
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategoryChange = (category, value) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }));
  };

  const handleSave = () => {
    // Save preferences to localStorage or send to backend
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Notification Preferences</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.section}>
            <h4>Notification Types</h4>
            <div className={styles.preferenceItem}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.emailReminders}
                  onChange={(e) => handlePreferenceChange('emailReminders', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
              <div className={styles.preferenceText}>
                <span className={styles.preferenceTitle}>Email Reminders</span>
                <span className={styles.preferenceDescription}>
                  Get email notifications for upcoming events
                </span>
              </div>
            </div>

            <div className={styles.preferenceItem}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
              <div className={styles.preferenceText}>
                <span className={styles.preferenceTitle}>Push Notifications</span>
                <span className={styles.preferenceDescription}>
                  Receive browser push notifications
                </span>
              </div>
            </div>

            <div className={styles.preferenceItem}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.eventUpdates}
                  onChange={(e) => handlePreferenceChange('eventUpdates', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
              <div className={styles.preferenceText}>
                <span className={styles.preferenceTitle}>Event Updates</span>
                <span className={styles.preferenceDescription}>
                  Notifications when events you're interested in are updated
                </span>
              </div>
            </div>

            <div className={styles.preferenceItem}>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={preferences.newEvents}
                  onChange={(e) => handlePreferenceChange('newEvents', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
              <div className={styles.preferenceText}>
                <span className={styles.preferenceTitle}>New Events</span>
                <span className={styles.preferenceDescription}>
                  Get notified about new events matching your interests
                </span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Reminder Timing</h4>
            <div className={styles.reminderTime}>
              <label>Remind me</label>
              <select
                value={preferences.reminderTime}
                onChange={(e) => handlePreferenceChange('reminderTime', e.target.value)}
                className={styles.timeSelect}
              >
                <option value="1">1 hour before</option>
                <option value="6">6 hours before</option>
                <option value="24">1 day before</option>
                <option value="168">1 week before</option>
              </select>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Event Categories</h4>
            <div className={styles.categories}>
              {Object.entries(preferences.categories).map(([category, enabled]) => (
                <div key={category} className={styles.categoryItem}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <span className={styles.categoryName}>{category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
