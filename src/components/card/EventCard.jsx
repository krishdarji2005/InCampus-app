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
    // Create calendar event data
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    const calendarData = {
      title: event.title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      location: event.location,
      description: event.description || event.title
    };

    // Create .ics file content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InCampus//Event Calendar//EN
BEGIN:VEVENT
UID:${event.id}@incampus.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description || event.title}
LOCATION:${event.location}
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
      case 'Academic':
        return '#3b82f6';
      case 'Professional':
        return '#10b981';
      case 'Social':
        return '#f59e0b';
      case 'Sports':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <article className={styles.card} onClick={handleClick} role="button" tabIndex={0}>
      <div className={styles.imageWrapper}>
        <LazyLoadImage
          src={event.image}
          alt={event.title}
          className={styles.image}
          effect="blur"
          width={100}
          height={100}
        />
        <div className={styles.formatBadge}>
          <span className={styles.formatIcon}>{getFormatIcon()}</span>
          <span className={styles.formatText}>{event.format}</span>
        </div>
      </div>
      <div className={styles.details}>
        <div className={styles.meta}>
          <time dateTime={new Date(event.date).toISOString()}>{event.date}</time>
          <span className={styles.dot}>•</span>
          <span>{event.time}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.price}>{event.price}</span>
        </div>
        <h3 className={styles.title}>{event.title}</h3>
        <div className={styles.location}>
          <span className={styles.locationIcon}> {<GrMapLocation/>} </span>
          <span>{event.location}</span>
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
            src={event.authorImage}
            alt={event.author}
            className={styles.avatar}
            width={20}
            height={20}
          />
          <span>{event.author}</span>
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
        </div>
      </div>
    </article>
  );
});

export default EventCard;
