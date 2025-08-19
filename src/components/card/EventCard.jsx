import React from "react";
import styles from "./EventCard.module.css";
import CardImage from "../../assets/japaneasy2001.jpg";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useNavigate } from "react-router-dom";

const EventCard = React.memo(function EventCard({ event }) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/events/${event.id}`, { state: { event } });
  };
  return (
    <article className={styles.card} onClick={handleClick} role="button" tabIndex={0}>
      <div className={styles.imageWrapper}>
        <LazyLoadImage
          src={event.image}
          alt={event.title}
          className={styles.image}
          effect="blur" // Blur effect while loading
          width={80}
          height={80}
        />
      </div>
      <div className={styles.details}>
        <div className={styles.meta}>
          <time dateTime={new Date(event.date).toISOString()}>{event.date}</time>
          <span className={styles.dot}>•</span>
          <span>{event.readTime}</span>
        </div>
        <h3 className={styles.title}>{event.title}</h3>
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
      </div>
    </article>
  );
});

export default EventCard;
