import React, { useState } from "react";
import styles from "./EventCard.module.css";
import CardImage from "../../assets/japaneasy2001.jpg";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useNavigate } from "react-router-dom";
import { IoBookmark } from "react-icons/io5";
import { IoBookmarkOutline } from "react-icons/io5";
import { GrMapLocation } from "react-icons/gr";
import { TbCalendarPlus } from "react-icons/tb";
import { MdPeople } from "react-icons/md";

const EventCard = React.memo(function EventCard({ event }) {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const handleClick = () => {
    navigate(`/events/${event.id}`, { state: { event } });
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleAddToCalendar = (e) => {
    e.stopPropagation();
    
    // Combine date and time for proper calendar entry
    const eventDateTime = new Date(`${event.date}T${convertTimeTo24Hour(event.time)}`);
    const endDateTime = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    // Create .ics file content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InCampus//Event Calendar//EN
BEGIN:VEVENT
UID:${event.id}@incampus.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${eventDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description || event.title}
LOCATION:${event.venue}
END:VEVENT
END:VCALENDAR`;

    // Download the .ics file
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Helper function to convert 12-hour time to 24-hour format
  const convertTimeTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };

  const getFormatIcon = () => {
    switch (event.format) {
      case 'Virtual':
        return '💻';
      case 'Hybrid':
        return '🔄';
      default:
        return '📍';
    }
  };

  const getCategoryColor = () => {
    switch (event.category) {
      case 'Technical':
        return '#3b82f6';
      case 'Cultural':
        return '#10b981';
      case 'Sports':
        return '#ef4444';
      case 'Academic':
        return '#8b5cf6';
      case 'Workshop':
        return '#f59e0b';
      case 'Seminar':
        return '#06b6d4';
      case 'Competition':
        return '#ec4899';
      case 'Social':
        return '#84cc16';
      case 'Art & Craft':
        return '#f97316';
      case 'Music':
        return '#a855f7';
      case 'Dance':
        return '#e11d48';
      case 'Literature':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <article className={styles.card} onClick={handleClick} role="button" tabIndex={0}>
      <div className={styles.imageWrapper}>
        <LazyLoadImage
          src={event.image || CardImage}
          alt={event.title}
          className={styles.image}
          effect="blur"
          width={100}
          height={100}
          onError={(e) => {
            e.target.src = CardImage;
          }}
        />
        <div className={styles.formatBadge}>
          <span className={styles.formatIcon}>{getFormatIcon()}</span>
          <span className={styles.formatText}>{event.format}</span>
        </div>
      </div>
      <div className={styles.details}>
        <div className={styles.meta}>
          <time dateTime={new Date(event.date).toISOString()}>
            {formatDate(event.date)}
          </time>
          <span className={styles.dot}>•</span>
          <span>{event.time}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.price}>{event.price}</span>
        </div>
        
        <h3 className={styles.title}>{event.title}</h3>
        
        <p className={styles.description}>
          {event.description && event.description.length > 100
            ? `${event.description.substring(0, 100)}...`
            : event.description
          }
        </p>
        
        <div className={styles.location}>
          <span className={styles.locationIcon}><GrMapLocation/></span>
          <span>{event.venue}</span>
        </div>
        
        <div className={styles.category}>
          <span 
            className={styles.categoryTag}
            style={{ backgroundColor: getCategoryColor() }}
          >
            {event.category}
          </span>
        </div>
        
        <div className={styles.author}>
          <img
            src={event.authorImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(event.author)}&background=8b5cf6&color=fff`}
            alt={event.author}
            className={styles.avatar}
            width={20}
            height={20}
          />
          <span>{event.author}</span>
        </div>

        {/* Registration count */}
        <div className={styles.registrationInfo}>
          <MdPeople className={styles.peopleIcon} />
          <span>{event.registrationCount || 0} registered</span>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={`${styles.actionButton} ${isBookmarked ? styles.bookmarked : ''}`}
            onClick={handleBookmark}
            title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          >
            {isBookmarked ? <IoBookmark /> : <IoBookmarkOutline />}
          </button>
          
          <button 
            className={styles.actionButton}
            onClick={handleAddToCalendar}
            title="Add to calendar"
          >
            <TbCalendarPlus />
          </button>
          
          {/* View Details button instead of Register */}
          <button 
            className={styles.viewDetailsButton}
            onClick={handleClick}
            title="View event details"
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
});

export default EventCard;