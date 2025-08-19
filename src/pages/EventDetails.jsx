import React from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import styles from "./Events.module.css";

const EventDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const event = location.state?.event;

  if (!event) {
    return (
      <div className={styles.eventsContainer} style={{ padding: "2rem", color: "#fff" }}>
        <h2>Event not found</h2>
        <p>We couldn’t load this event’s details. Go back to the events page.</p>
        <Link to="/events" style={{ color: "#61dafb" }}>Back to Events</Link>
      </div>
    );
  }

  return (
    <div className={styles.eventsContainer} style={{ padding: "2rem" }}>
      <div className={styles.eventsContent}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", color: "#fff" }}>
          <img
            src={event.image}
            alt={event.title}
            style={{ width: "100%", maxWidth: 900, borderRadius: 12 }}
          />
          <div>
            <div style={{ opacity: 0.8, marginBottom: 8 }}>
              <time dateTime={new Date(event.date).toISOString()}>{event.date}</time>
              <span style={{ margin: "0 8px" }}>•</span>
              <span>{event.readTime}</span>
            </div>
            <h1 style={{ margin: 0 }}>{event.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, opacity: 0.9 }}>
              <img src={event.authorImage} alt={event.author} width={28} height={28} style={{ borderRadius: "50%" }} />
              <span>{event.author}</span>
            </div>
          </div>
          <div style={{ lineHeight: 1.7, opacity: 0.95 }}>
            <p>
              This is a sample event description. Replace this with real event details once the
              backend is connected: agenda, speakers, venue, timing, registration links, and any
              special notes for attendees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

