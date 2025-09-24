import React, { useState } from 'react';
import styles from './CalendarView.module.css';

const CalendarView = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button 
          className={styles.navButton}
          onClick={() => navigateMonth(-1)}
        >
          ‹
        </button>
        <h2 className={styles.monthYear}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button 
          className={styles.navButton}
          onClick={() => navigateMonth(1)}
        >
          ›
        </button>
        <button 
          className={styles.todayButton}
          onClick={goToToday}
        >
          Today
        </button>
      </div>

      <div className={styles.calendarGrid}>
        <div className={styles.dayHeaders}>
          {dayNames.map(day => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.daysGrid}>
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = day && day.toDateString() === today.toDateString();
            const isCurrentMonth = day && day.getMonth() === currentDate.getMonth();

            return (
              <div 
                key={index} 
                className={`${styles.dayCell} ${
                  !day ? styles.emptyDay : ''
                } ${
                  isToday ? styles.today : ''
                } ${
                  !isCurrentMonth ? styles.otherMonth : ''
                }`}
              >
                {day && (
                  <>
                    <div className={styles.dayNumber}>
                      {day.getDate()}
                    </div>
                    <div className={styles.dayEvents}>
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className={styles.eventDot}
                          title={event.title}
                          onClick={() => onEventClick(event)}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <div className={styles.moreEvents}>
                          +{dayEvents.length - 3}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot}></div>
          <span>Event</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.today}`}></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
