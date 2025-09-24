import React, { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import styles from "./EventDetails.module.css";
import { PiCalendarDots } from "react-icons/pi";
import { MdOutlineLocationOn } from "react-icons/md";
import { GiTeacher } from "react-icons/gi";
import { MdLockClock } from "react-icons/md";
import { FaTwitter, FaLinkedin, FaCopy, FaWhatsapp, FaInstagram, FaTelegram } from "react-icons/fa";
import { getEventById } from "../data/events";
import RegistrationModal from "../components/RegistrationModal/RegistrationModal";
import EventDetailsSkeleton from "../components/LoadingSkeleton/EventDetailsSkeleton";
import { toast } from 'react-toastify';
const EventDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const eventFromNav = location.state?.event;
  const [event, setEvent] = useState(eventFromNav || null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [hasRequestedToJoin, setHasRequestedToJoin] = useState(false);
  const [isLoading, setIsLoading] = useState(!eventFromNav);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fallback: if no event in navigation state, load by id
  useEffect(() => {
    if (!eventFromNav && id) {
      setIsLoading(true);
      // Simulate loading delay for better UX
      setTimeout(() => {
        const numericId = Number(id);
        const found = getEventById(numericId);
        if (found) {
          setEvent(found);
        }
        setIsLoading(false);
      }, 800);
    }
  }, [eventFromNav, id]);

  // Load subscribe state from localStorage when event is available
  useEffect(() => {
    if (event?.author && typeof window !== 'undefined') {
      const savedState = localStorage.getItem(`subscribe_${event.author}`);
      setIsSubscribed(savedState === 'true');
    }
  }, [event?.author]);

  // Show loading skeleton while loading
  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  // Show not found if no event after loading
  if (!event) {
    return (
      <div className={styles.eventsContainer} style={{ padding: "2rem", color: "#fff" }}>
        <h2>Event not found</h2>
        <p>We couldn't load this event's details. Go back to the events page.</p>
        <Link to="/events" style={{ color: "#61dafb" }}>Back to Events</Link>
      </div>
    );
  }

  const handleSubscribe = () => {
    const newSubscribeState = !isSubscribed;
    setIsSubscribed(newSubscribeState);
    
    // Save to localStorage
    if (event?.author) {
      localStorage.setItem(`subscribe_${event.author}`, newSubscribeState.toString());
      
      // Show toast notification
      toast.success(
        newSubscribeState 
          ? `Subscribed to ${event.author}!` 
          : `Unsubscribed from ${event.author}`,
        {
          position: "top-right",
          autoClose: 2000,
        }
      );
    }
  };

  const handleRequestToJoin = () => {
    setIsRegistrationModalOpen(true);
  };

  const handleRegistrationSubmit = (formData) => {
    console.log("Registration submitted:", formData);
    setHasRequestedToJoin(true);
    // Here you would typically send the data to your backend
  };

  const handleShare = async (platform) => {
    const eventUrl = `${window.location.origin}/events/${id}`;
    const shareText = `Check out this event: ${event?.title}`;
    
    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(eventUrl);
          toast.success("Event link copied to clipboard!", {
            position: "top-right",
            autoClose: 2000,
          });
          break;
          
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`;
          window.open(twitterUrl, '_blank', 'width=600,height=400');
          break;
          
        case 'linkedin':
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
          window.open(linkedinUrl, '_blank', 'width=600,height=400');
          break;
          
        case 'whatsapp':
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + eventUrl)}`;
          window.open(whatsappUrl, '_blank');
          break;
          
        case 'instagram':
          // Instagram doesn't support direct URL sharing, so we'll copy the text
          const instagramText = `${shareText}\n${eventUrl}`;
          await navigator.clipboard.writeText(instagramText);
          toast.info("Event details copied! Paste in your Instagram story or post.", {
            position: "top-right",
            autoClose: 4000,
          });
          break;
          
        case 'telegram':
          const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareText)}`;
          window.open(telegramUrl, '_blank', 'width=600,height=400');
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error("Failed to share. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className={styles.eventsContainer}>
      <div className={styles.eventsContent}>
        {/* Header with back navigation */}
        <div className={styles.header}>
          <Link to="/events" className={styles.backButton}>
            ← Back to Events
          </Link>
        </div>

        <div className={styles.eventDetailLayout}>
          {/* Main Content Column */}
          <div className={styles.mainColumn}>
            {/* Event Title and Basic Info */}
            <div className={styles.eventHeader}>
              <div className={styles.eventCategory}>TECH CONFERENCE</div>
              <h1 className={styles.eventTitle}>{event.title}</h1>
              <div className={styles.eventMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}><PiCalendarDots size="1.1em"/></span>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Date & Time</span>
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    <span>10:00 AM - 6:00 PM</span>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}><MdOutlineLocationOn size="1.1em"/></span>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Location</span>
                    <span>Campus Venue</span>
                    <span>University Campus</span>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}><GiTeacher size="1.1em"/></span>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Host</span>
                    <span>{event.author}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Section */}
            <div className={styles.registrationSection}>
              <h2 className={styles.sectionTitle}>Join this event</h2>
              <div className={styles.approvalBox}>
                <div className={styles.approvalIcon}><MdLockClock size="1.5em"/></div>
                <div className={styles.approvalText}>
                  <strong>Approval Required</strong>
                  <p>Your registration is subject to approval by the host.</p>
                </div>
              </div>
              <button 
                className={`${styles.joinBtn} ${hasRequestedToJoin ? styles.joinBtnDisabled : ''}`} 
                onClick={handleRequestToJoin}
                disabled={hasRequestedToJoin}
              >
                {hasRequestedToJoin ? 'Request Submitted' : 'Request to Join'}
              </button>
            </div>

            {/* About Event Section */}
            <div className={styles.aboutSection}>
              <h2 className={styles.sectionTitle}>About this event</h2>
              <p className={styles.eventDescription}>
                {event.title} is a {event.readTime} event featuring {event.author} as the main speaker. This event promises to deliver valuable insights and networking opportunities for all attendees.
              </p>
              
              <h3 className={styles.subTitle}>What to expect</h3>
              <ul className={styles.expectationsList}>
                <li>Engaging presentations and discussions led by {event.author}</li>
                <li>Networking opportunities with fellow students and professionals</li>
                <li>Interactive sessions and hands-on activities</li>
                <li>Q&A sessions to address your questions and concerns</li>
              </ul>
              
              <p className={styles.registrationNote}>
                This event is open to all students who register ahead of time. Please keep your registration up to date so that someone from the waitlist can attend in your place if you are no longer able to.
              </p>
            </div>

            {/* Location Section */}
            <div className={styles.locationSection}>
              <h2 className={styles.sectionTitle}>Location</h2>
              <div className={styles.venueDetails}>
                <h3 className={styles.venueName}>Campus Venue</h3>
                <p className={styles.venueAddress}>
                  University Campus, Main Building, Conference Hall A, {event.author}'s Department
                </p>
              </div>
              <div className={styles.mapContainer}>
                <div className={styles.mapPlaceholder}>
                  <div className={styles.mapContent}>
                    <span className={styles.mapIcon}>🗺️</span>
                    <span className={styles.mapText}>View on Google Maps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className={styles.sidebar}>
            {/* Organizer Info */}
            <div className={styles.organizerCard}>
              <h3 className={styles.cardTitle}>Organized by</h3>
              <div className={styles.organizerInfo}>
                <div className={styles.orgIcon}>{event.author.charAt(0)}</div>
                <div className={styles.orgDetails}>
                  <span className={styles.orgName}>{event.author}</span>
                  <span className={styles.orgFollowers}>1.2k followers</span>
                </div>
              </div>
              <button 
                className={`${styles.subscribeBtn} ${isSubscribed ? styles.subscribed : ''}`}
                onClick={handleSubscribe}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
              <p className={styles.orgDescription}>
                Events that help talented folks learn, earn, and build on Solana around the world.
              </p>
            </div>

            {/* Event Details Card */}
            <div className={styles.detailsCard}>
              <h3 className={styles.cardTitle}>Event details</h3>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}><PiCalendarDots /></span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Date</span>
                  <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>⏰</span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Time</span>
                  <span>10:00 AM - 6:00 PM</span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}><MdOutlineLocationOn size="1.5em"/></span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Location</span>
                  <span>Campus Venue, University Campus</span>
                </div>
              </div>
            </div>

            {/* Share Event */}
            <div className={styles.shareCard}>
              <h3 className={styles.cardTitle}>Share this event</h3>
              <div className={styles.socialIcons}>
                <button 
                  className={styles.socialIconButton}
                  onClick={() => handleShare('twitter')}
                  title="Share on Twitter"
                  aria-label="Share on Twitter"
                >
                  <FaTwitter size={18} />
                </button>
                <button 
                  className={styles.socialIconButton}
                  onClick={() => handleShare('linkedin')}
                  title="Share on LinkedIn"
                  aria-label="Share on LinkedIn"
                >
                  <FaLinkedin size={18} />
                </button>
                <button 
                  className={styles.socialIconButton}
                  onClick={() => handleShare('whatsapp')}
                  title="Share on WhatsApp"
                  aria-label="Share on WhatsApp"
                >
                  <FaWhatsapp size={18} />
                </button>
                <button 
                  className={styles.socialIconButton}
                  onClick={() => handleShare('telegram')}
                  title="Share on Telegram"
                  aria-label="Share on Telegram"
                >
                  <FaTelegram size={18} />
                </button>
                <button 
                  className={styles.socialIconButton}
                  onClick={() => handleShare('instagram')}
                  title="Copy for Instagram"
                  aria-label="Copy for Instagram"
                >
                  <FaInstagram size={18} />
                </button>
                <button 
                  className={styles.socialIconButton}
                  onClick={() => handleShare('copy')}
                  title="Copy link to clipboard"
                  aria-label="Copy link to clipboard"
                >
                  <FaCopy size={16} />
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
        eventTitle={event?.title}
        onSubmit={handleRegistrationSubmit}
      />
    </div>
  );
};

export default EventDetails;