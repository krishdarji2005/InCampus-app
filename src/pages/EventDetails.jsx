import React, { useState, useEffect } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import styles from "./EventDetails.module.css";
import { PiCalendarDots } from "react-icons/pi";
import { MdOutlineLocationOn, MdPeople, MdSchedule } from "react-icons/md";
import { IoMdShare } from "react-icons/io";
import {
  FaTwitter,
  FaLinkedin,
  FaCopy,
  FaWhatsapp,
  FaInstagram,
  FaTelegram,
} from "react-icons/fa";
import { BsArrowLeft } from "react-icons/bs";
import RegistrationModal from "../components/RegistrationModal/RegistrationModal";
import EventDetailsSkeleton from "../components/LoadingSkeleton/EventDetailsSkeleton";
import { toast } from "react-toastify";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const eventFromNav = location.state?.event;

  const [event, setEvent] = useState(eventFromNav || null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [hasRequestedToJoin, setHasRequestedToJoin] = useState(false);
  const [isLoading, setIsLoading] = useState(!eventFromNav);
  const [registrationCount, setRegistrationCount] = useState(0);

  // Fetch event data from MongoDB if not passed via navigation
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventFromNav && id) {
        try {
          setIsLoading(true);
          const response = await fetch(
            `http://localhost:5000/api/events/${id}`
          );

          if (response.ok) {
            const data = await response.json();
            const eventData = data.event || data;

            // Transform the data to match expected format
            const transformedEvent = {
              id: eventData._id,
              title: eventData.title,
              description: eventData.description,
              date: new Date(eventData.date).toISOString().split("T")[0],
              time: new Date(eventData.date).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              venue: eventData.venue,
              category: eventData.category,
              image: eventData.image || "",
              author: eventData.author,
              authorId: eventData.authorId,
              registrationCount: eventData.registrationCount || 0,
              status: eventData.status,
            };

            setEvent(transformedEvent);
            setRegistrationCount(eventData.registrationCount || 0);
          } else {
            toast.error("Failed to load event details");
          }
        } catch (error) {
          console.error("Error fetching event:", error);
          toast.error("Failed to load event details");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEvent();
  }, [eventFromNav, id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  console.log("Current event state:", event);
  console.log("Event image URL:", event?.image);
  console.log("Event type:", typeof event);

  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  if (!event) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h2>Event not found</h2>
          <p>We couldn't load this event's details.</p>
          <Link to="/events">Back to Events</Link>
        </div>
      </div>
    );
  }

  const handleRegistrationSubmit = async (formData) => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("Please complete your profile first");
        navigate("/profile");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/events/${event.id}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            name: formData.name,
            email: formData.email,
            department: formData.department,
            year: formData.year,
            reason: formData.reason,
            phone: formData.phone,
          }),
        }
      );

      if (response.ok) {
        setHasRequestedToJoin(true);
        setRegistrationCount((prev) => prev + 1);
        toast.success("Successfully registered for the event!");
        setIsRegistrationModalOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to register for event");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const handleShare = async (platform) => {
    const eventUrl = `${window.location.origin}/events/${id}`;
    const shareText = `Check out this event: ${event?.title}`;

    try {
      switch (platform) {
        case "copy":
          await navigator.clipboard.writeText(eventUrl);
          toast.success("Event link copied to clipboard!");
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              shareText
            )}&url=${encodeURIComponent(eventUrl)}`,
            "_blank"
          );
          break;
        case "linkedin":
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              eventUrl
            )}`,
            "_blank"
          );
          break;
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(
              shareText + " " + eventUrl
            )}`,
            "_blank"
          );
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error("Failed to share. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <button
            onClick={() => navigate("/events")}
            className={styles.backButton}
          >
            <BsArrowLeft size={16} />
            Back to Events
          </button>
        </div>

        {/* Event Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.eventBadge}>
              <span className={styles.badgeIcon}>📘</span>
              <span>Featured Event</span>
            </div>
            <h1 className={styles.eventTitle}>{event.title}</h1>
           
            <div className={styles.eventImageContainer}>
              <img
                src={
                  event.image ||
                  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                }
                alt={event.title}
                className={styles.eventImage}
                onError={(e) => {
                  console.log("Image failed to load:", e.target.src);
                  console.log("Event object:", event);
                  console.log("Event image field:", event.image);
                  e.target.src =
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
                }}
                onLoad={() => {
                  console.log("Image loaded successfully");
                  console.log("Final image src:", event.image);
                }}
              />
            </div>
            <div className={styles.eventMeta}>
              <div className={styles.metaItem}>
                <PiCalendarDots className={styles.metaIcon} />
                <div>
                  <div className={styles.metaLabel}>Date</div>
                  <div className={styles.metaValue}>
                    {formatDate(event.date)}
                  </div>
                </div>
              </div>

              <div className={styles.metaItem}>
                <MdSchedule className={styles.metaIcon} />
                <div>
                  <div className={styles.metaLabel}>Time</div>
                  <div className={styles.metaValue}>{event.time}</div>
                </div>
              </div>

              <div className={styles.metaItem}>
                <MdOutlineLocationOn className={styles.metaIcon} />
                <div>
                  <div className={styles.metaLabel}>Location</div>
                  <div className={styles.metaValue}>{event.venue}</div>
                </div>
              </div>
            </div>
            <div className={styles.registrationInfo}>
              <div className={styles.attendeeCount}>
                <MdPeople className={styles.attendeeIcon} />
                <span>{registrationCount} attending</span>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={styles.shareButton}
                  onClick={() => handleShare("copy")}
                >
                  <IoMdShare size={16} />
                  Share
                </button>

                <button
                  className={`${styles.registerButton} ${
                    hasRequestedToJoin ? styles.registered : ""
                  }`}
                  onClick={() => setIsRegistrationModalOpen(true)}
                  disabled={hasRequestedToJoin}
                >
                  {hasRequestedToJoin ? "Registered" : "Request to Join"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.leftColumn}>
            {/* About Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>About Event</h2>
              <div className={styles.aboutContent}>
                <p className={styles.description}>{event.description}</p>

                <div className={styles.highlights}>
                  <h3>What to expect:</h3>
                  <ul>
                    <li>Engaging presentations and interactive sessions</li>
                    <li>
                      Networking opportunities with peers and professionals
                    </li>
                    <li>Hands-on workshops and practical exercises</li>
                    <li>Q&A sessions with industry experts</li>
                  </ul>
                </div>

                <div className={styles.noteBox}>
                  <h4>Registration</h4>
                  <p>
                    Approval Required: Your registration is subject to approval
                    by the host.
                  </p>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Location</h2>
              <div className={styles.locationContent}>
                <div className={styles.venueInfo}>
                  <h3>{event.venue}</h3>
                  <p>University Campus, Main Building</p>
                </div>
                <div className={styles.mapPlaceholder}>
                  <div className={styles.mapContent}>
                    <span>🗺️</span>
                    <span>View on Google Maps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            {/* Organizer Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Hosted by</h3>
              <div className={styles.organizerInfo}>
                <div className={styles.organizerAvatar}>
                  {event.author.charAt(0).toUpperCase()}
                </div>
                <div className={styles.organizerDetails}>
                  <h4>{event.author}</h4>
                  <p>Event Organizer</p>
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Event Details</h3>
              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Category</span>
                  <span className={styles.detailValue}>{event.category}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Format</span>
                  <span className={styles.detailValue}>In-Person</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Price</span>
                  <span className={styles.detailValue}>Free</span>
                </div>
              </div>
            </div>

            {/* Share Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Share Event</h3>
              <div className={styles.shareButtons}>
                <button
                  onClick={() => handleShare("twitter")}
                  className={styles.shareBtn}
                >
                  <FaTwitter />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className={styles.shareBtn}
                >
                  <FaLinkedin />
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className={styles.shareBtn}
                >
                  <FaWhatsapp />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className={styles.shareBtn}
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        event={event}
        onSubmit={handleRegistrationSubmit}
      />
    </div>
  );
};

export default EventDetails;
