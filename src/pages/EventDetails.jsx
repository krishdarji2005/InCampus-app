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

  // Add user state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoadingUser(true);
        const userId = localStorage.getItem("userId");

        if (!userId) {
          console.log("No userId found in localStorage");
          setIsLoadingUser(false);
          return;
        }

        console.log("Fetching user data for userId:", userId);

        const response = await fetch(
          `http://localhost:5000/api/users/${userId}`
        );
        const data = await response.json();

        console.log("User fetch response:", data);

        if (data.success && data.user) {
          setCurrentUser(data.user);
          console.log("User data set:", data.user);
        } else {
          // If user doesn't exist in database, create a basic profile from available data
          console.log("User not found in database, creating basic profile...");
          const basicUser = {
            _id: userId,
            name: localStorage.getItem("userName") || "",
            email: localStorage.getItem("userEmail") || "",
            phone: "",
            department: "",
            year: "",
          };
          setCurrentUser(basicUser);
          console.log("Basic user profile created:", basicUser);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Create a basic user profile even on error
        const userId = localStorage.getItem("userId");
        if (userId) {
          const basicUser = {
            _id: userId,
            name: localStorage.getItem("userName") || "",
            email: localStorage.getItem("userEmail") || "",
            phone: "",
            department: "",
            year: "",
          };
          setCurrentUser(basicUser);
        }
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

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
              _id: eventData._id, // Keep _id for backend compatibility
              id: eventData._id,
              title: eventData.title,
              description: eventData.description,
              date: eventData.date, // Keep original date format for backend
              time:
                eventData.time ||
                new Date(eventData.date).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                }),
              venue: eventData.venue,
              type: eventData.type, // Add type for registration modal
              category: eventData.category || eventData.type,
              image: eventData.image || eventData.imageUrl || "",
              author: eventData.author,
              authorId: eventData.authorId,
              maxParticipants: eventData.maxParticipants || 100,
              registeredUsers: eventData.registeredUsers || [],
              registrationCount:
                eventData.registrationCount ||
                eventData.registeredUsers?.length ||
                0,
              status: eventData.status,
              additionalDocumentInfo: eventData.additionalDocumentInfo,
            };

            setEvent(transformedEvent);
            setRegistrationCount(transformedEvent.registrationCount);
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

  // Debug logging
  console.log("Current event state:", event);
  console.log("Current user state:", currentUser);
  console.log("Is loading user:", isLoadingUser);

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

  // Updated registration submit handler for new backend format
  const handleRegistrationSubmit = async (registrationData) => {
    try {
      console.log("Registration submitted with data:", registrationData);

      // Update local state
      setHasRequestedToJoin(true);
      setRegistrationCount((prev) => prev + 1);

      // Close modal
      setIsRegistrationModalOpen(false);

      // The actual registration is handled in the RegistrationModal component
      // This is just for UI updates after successful registration
    } catch (error) {
      console.error("Error handling registration:", error);
      toast.error("Registration failed. Please try again.");
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

  const handleRegisterClick = () => {
    const userId = localStorage.getItem("userId");

    // Since auth0 is handling authentication, if we're here, user should be logged in
    if (!userId) {
      toast.error("Authentication error. Please refresh and try again.");
      return;
    }

    // If we're still loading user data, wait
    if (isLoadingUser) {
      toast.info("Loading user data...");
      return;
    }

    // Always open the registration modal - it will handle profile completion
    setIsRegistrationModalOpen(true);
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
                  e.target.src =
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
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
                  onClick={handleRegisterClick}
                  disabled={hasRequestedToJoin || isLoadingUser}
                >
                  {isLoadingUser
                    ? "Loading..."
                    : hasRequestedToJoin
                    ? "Registered"
                    : "Request to Join"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of your existing content remains the same */}
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
                    Please upload your ID image and any additional documents as
                    required. Your registration is subject to verification.
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
                  {event.author?.charAt(0).toUpperCase() || "E"}
                </div>
                <div className={styles.organizerDetails}>
                  <h4>{event.author || "Event Organizer"}</h4>
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
                  <span className={styles.detailValue}>
                    {event.category || event.type}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Format</span>
                  <span className={styles.detailValue}>In-Person</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Price</span>
                  <span className={styles.detailValue}>Free</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Max Participants</span>
                  <span className={styles.detailValue}>
                    {event.maxParticipants || "Unlimited"}
                  </span>
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

      {/* Registration Modal - Now with user prop */}
      {isRegistrationModalOpen && (
        <RegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          event={event}
          user={currentUser} // Pass user even if incomplete
          onSubmit={handleRegistrationSubmit}
        />
      )}
    </div>
  );
};

export default EventDetails;
