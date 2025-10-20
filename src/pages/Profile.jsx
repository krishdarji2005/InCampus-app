import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import styles from "./Profile.module.css";
import EventCard from "../components/card/EventCard";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaGraduationCap,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEdit,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaUserTie,
  FaCog,
  FaBell,
} from "react-icons/fa";
import EditProfile from "../components/EditProfile/EditProfile";

const Profile = () => {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth0();
  const [showEditModal, setShowEditModal] = useState(false);
  const [user, setUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking");
  const navigate = useNavigate();

  // Check if backend server is running
  const checkServerStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/health", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setServerStatus("online");
        return true;
      } else {
        setServerStatus("offline");
        return false;
      }
    } catch (error) {
      console.error("Server is not running:", error);
      setServerStatus("offline");
      return false;
    }
  };

  // Get current user data from Auth0 and localStorage
  const getCurrentUser = () => {
    if (auth0User) {
      return auth0User;
    }

    try {
      const storedUser = localStorage.getItem("auth_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  };

  // Create or get user from backend
  const createOrGetUserInBackend = async (authUser) => {
    try {
      console.log("Looking for user with email:", authUser.email);

      const findResponse = await fetch(
        `http://localhost:5000/api/users/profile?email=${encodeURIComponent(
          authUser.email
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (findResponse.ok) {
        const existingUserData = await findResponse.json();
        console.log("Found existing user:", existingUserData);

        const user = existingUserData.user || existingUserData;
        localStorage.setItem("userId", user._id);
        console.log("Stored userId in localStorage:", user._id);

        return user;
      }

      console.log("User not found, creating new user...");

      const createResponse = await fetch(
        "http://localhost:5000/api/users/google-auth",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: authUser.name || authUser.given_name || "New User",
            email: authUser.email,
            profilePic: authUser.picture || "",
            googleId: authUser.sub,
          }),
        }
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(
          errorData.message || "Failed to create user in backend"
        );
      }

      const newUserData = await createResponse.json();
      console.log("Created new user:", newUserData);

      const newUser = newUserData.user || newUserData;
      localStorage.setItem("userId", newUser._id);
      console.log("Stored new userId in localStorage:", newUser._id);

      return newUser;
    } catch (error) {
      console.error("Error creating/getting user in backend:", error);
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (authLoading) {
        console.log("Auth0 still loading, waiting...");
        return;
      }

      if (!isAuthenticated) {
        setError("Please log in to view your profile");
        setLoading(false);
        return;
      }

      const isServerOnline = await checkServerStatus();
      if (!isServerOnline) {
        setError(
          "Backend server is not running. Please start the server and try again."
        );
        setLoading(false);
        return;
      }

      const authUser = getCurrentUser();

      if (!authUser || !authUser.email) {
        console.log("No user data available, waiting for Auth0...");
        setTimeout(() => {
          const retryAuthUser = getCurrentUser();
          if (!retryAuthUser) {
            setError("No user data found. Please try logging in again.");
          }
        }, 2000);
        return;
      }

      console.log("Auth user data available:", authUser.email);

      const backendUser = await createOrGetUserInBackend(authUser);
      localStorage.setItem("userId", backendUser._id);

      setUser(backendUser);
      setRegisteredEvents(backendUser.registeredEvents || []);
    } catch (err) {
      console.error("Error fetching profile:", err);

      if (err.message.includes("fetch")) {
        setError(
          "Cannot connect to server. Please make sure the backend is running on http://localhost:5000"
        );
      } else {
        setError(err.message);
      }

      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(
      "Auth loading:",
      authLoading,
      "Authenticated:",
      isAuthenticated,
      "User:",
      !!auth0User
    );

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [authLoading, isAuthenticated, auth0User]);

  const handleCancelRegistration = async (eventId) => {
    try {
      const backendUserId = localStorage.getItem("userId");

      if (!backendUserId) {
        toast.error("User not found");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/register`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: backendUserId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel registration");
      }

      setRegisteredEvents((prev) =>
        prev.filter((event) => event._id !== eventId)
      );
      toast.success("Registration cancelled successfully");
    } catch (err) {
      console.error("Error cancelling registration:", err);
      toast.error("Failed to cancel registration");
    }
  };

  const getProfileCompletionPercentage = () => {
    if (!user) return 0;

    const requiredFields = [
      { field: user.name, weight: 1 },
      { field: user.email, weight: 1 },
      { field: user.department, weight: 1 },
      { field: user.year, weight: 1 },
      { field: user.phone, weight: 1 },
      { field: user.bio, weight: 1 },
      { field: user.rollNumber, weight: 1 },
      { field: user.interests && user.interests.length > 0, weight: 1 },
    ];

    const completedFields = requiredFields.filter(({ field }) => {
      if (typeof field === "string") {
        return field && field.trim().length > 0;
      }
      return Boolean(field);
    }).length;

    const percentage = Math.round(
      (completedFields / requiredFields.length) * 100
    );
    console.log("Profile completion:", {
      completedFields,
      total: requiredFields.length,
      percentage,
    });

    return percentage;
  };

  // FIXED: Proper profile update handler
  const handleProfileUpdate = (updatedUser) => {
    console.log("Profile updated:", updatedUser);
    setUser(updatedUser);
    localStorage.setItem("userId", updatedUser._id);

    // Trigger re-render by forcing state update
    setTimeout(() => {
      const newCompletionPercentage = getProfileCompletionPercentage();
      console.log("New completion percentage:", newCompletionPercentage);

      // Check if profile should be marked as completed
      if (newCompletionPercentage === 100 && !updatedUser.isOnboardingComplete) {
        updateOnboardingStatus(updatedUser._id);
      }
    }, 100);
  };

  const updateOnboardingStatus = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/profile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isOnboardingComplete: true,
            profileCompleted: true,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        toast.success("Profile completed! 🎉");
      }
    } catch (error) {
      console.error("Error updating onboarding status:", error);
    }
  };

  const renderSocialLinks = () => {
    if (!user?.socialLinks) return null;

    const links = [
      { key: "linkedin", icon: FaLinkedin, color: "#0077b5" },
      { key: "github", icon: FaGithub, color: "#333" },
      { key: "portfolio", icon: FaGlobe, color: "#10b981" },
    ];

    const activeSocialLinks = links.filter(
      (link) => user.socialLinks[link.key]
    );

    if (activeSocialLinks.length === 0) return null;

    return (
      <div className={styles.socialLinks}>
        {activeSocialLinks.map(({ key, icon: Icon, color }) => (
          <a
            key={key}
            href={user.socialLinks[key]}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            style={{ "--link-color": color }}
          >
            <Icon />
          </a>
        ))}
      </div>
    );
  };

  // Loading States
  if (authLoading || (loading && !error)) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>
            {authLoading ? "Loading authentication..." : "Loading profile..."}
          </p>
          {serverStatus === "checking" && <p>Checking server status...</p>}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <h2>Authentication Required</h2>
          <p>Please log in to view your profile</p>
          <button
            className={styles.actionButton}
            onClick={() => (window.location.href = "/")}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <FaExclamationTriangle className={styles.errorIcon} />
          <h2>Error Loading Profile</h2>
          <p>{error}</p>
          {serverStatus === "offline" && (
            <div className={styles.serverErrorDetails}>
              <h3>Backend Server Not Running</h3>
              <p>To fix this issue:</p>
              <ol>
                <li>Open a terminal</li>
                <li>
                  Navigate to:{" "}
                  <code>c:\Users\dipes\Desktop\kd\InCampus-app\Backend</code>
                </li>
                <li>
                  Run: <code>npm start</code> or <code>node server.js</code>
                </li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
          <div className={styles.errorActions}>
            <button
              className={styles.actionButton}
              onClick={() => fetchUserProfile()}
            >
              Try Again
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Loading user data...</p>
        </div>
      </div>
    );
  }

  const completionPercentage = getProfileCompletionPercentage();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.profileHero}>
            <div className={styles.profileImageContainer}>
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.profileImagePlaceholder}>
                  <FaUser />
                </div>
              )}
            </div>

            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>{user.name}</h1>
              <p className={styles.profileRole}>
                {user.department && user.year
                  ? `${user.year} - ${user.department}`
                  : "Student at K.J. Somaiya Institute of Technology"}
              </p>
              {renderSocialLinks()}
            </div>

            <div className={styles.profileActions}>
              <button
                className={styles.editButton}
                onClick={() => setShowEditModal(true)}
              >
                <FaEdit /> Edit Profile
              </button>
              <button className={styles.settingsButton}>
                <FaCog />
              </button>
            </div>
          </div>

          {/* Debug - Remove this after testing
          {process.env.NODE_ENV === "development" && (
            <div
              style={{
                background: "#333",
                padding: "1rem",
                margin: "1rem 0",
                borderRadius: "8px",
              }}
            >
              <h4>Debug - Profile Completion</h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                <div>
                  Name: {user.name ? "✅" : "❌"} ({user.name})
                </div>
                <div>
                  Email: {user.email ? "✅" : "❌"} ({user.email})
                </div>
                <div>
                  Department: {user.department ? "✅" : "❌"} ({user.department})
                </div>
                <div>
                  Year: {user.year ? "✅" : "❌"} ({user.year})
                </div>
                <div>
                  Phone: {user.phone ? "✅" : "❌"} ({user.phone})
                </div>
                <div>
                  Bio: {user.bio ? "✅" : "❌"} ({user.bio?.substring(0, 20)}...)
                </div>
                <div>
                  Roll Number: {user.rollNumber ? "✅" : "❌"} ({user.rollNumber})
                </div>
                <div>
                  Interests: {user.interests?.length > 0 ? "✅" : "❌"} (
                  {user.interests?.length} items)
                </div>
              </div>
              <div style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
                Completion: {completionPercentage}%
              </div>
            </div>
          )} */}

          {/* Profile Completion Status */}
          {!user.isOnboardingComplete && (
            <div className={styles.completionBanner}>
              <div className={styles.bannerContent}>
                <div className={styles.bannerIcon}>
                  <FaExclamationTriangle />
                </div>
                <div className={styles.bannerText}>
                  <h3>Complete Your Profile</h3>
                  <p>
                    Complete your profile setup to get personalized event
                    recommendations and improve your experience.
                  </p>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>
                    {completionPercentage}% Complete
                  </span>
                </div>
                <button
                  className={styles.completeButton}
                  onClick={() => {
                    console.log("Navigating to onboarding with userId:", user._id);
                    localStorage.setItem("userId", user._id);
                    navigate("/onboarding");
                  }}
                >
                  Complete Setup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className={styles.mainContent}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Personal Information */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FaUser className={styles.sectionIcon} />
                Personal Information
              </h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <FaEnvelope className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{user.email}</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <FaPhone className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Phone</span>
                    <span className={styles.infoValue}>
                      {user.phone || (
                        <span className={styles.notSpecified}>Not specified</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <FaMapMarkerAlt className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>College</span>
                    <span className={styles.infoValue}>
                      {user.college || "K.J. Somaiya Institute of Technology"}
                    </span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <FaGraduationCap className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Department</span>
                    <span className={styles.infoValue}>
                      {user.department || (
                        <span className={styles.notSpecified}>Not specified</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <FaCalendarAlt className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Academic Year</span>
                    <span className={styles.infoValue}>
                      {user.year || (
                        <span className={styles.notSpecified}>Not specified</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <FaUserTie className={styles.infoIcon} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>Roll Number</span>
                    <span className={styles.infoValue}>
                      {user.rollNumber || (
                        <span className={styles.notSpecified}>Not specified</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className={styles.bioSection}>
                  <h3>About</h3>
                  <p className={styles.bioText}>{user.bio}</p>
                </div>
              )}

              {user.interests && user.interests.length > 0 && (
                <div className={styles.interestsSection}>
                  <h3>Interests</h3>
                  <div className={styles.interestTags}>
                    {user.interests.map((interest, index) => (
                      <span key={index} className={styles.interestTag}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Registered Events */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FaCalendarAlt className={styles.sectionIcon} />
                My Events ({registeredEvents.length})
              </h2>

              {registeredEvents.length === 0 ? (
                <div className={styles.noEvents}>
                  <div className={styles.noEventsIcon}>
                    <FaCalendarAlt />
                  </div>
                  <h3>No Events Yet</h3>
                  <p>
                    You haven't registered for any events yet. Discover amazing
                    events happening on campus!
                  </p>
                  <button
                    className={styles.browseEventsButton}
                    onClick={() => navigate("/events")}
                  >
                    Browse Events
                  </button>
                </div>
              ) : (
                <div className={styles.eventsGrid}>
                  {registeredEvents.map((event) => (
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

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Profile Status */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Profile Status</h3>
              <div className={styles.statusList}>
                <div className={styles.statusItem}>
                  <div
                    className={`${styles.statusIcon} ${
                      user.profileCompleted ? styles.complete : styles.incomplete
                    }`}
                  >
                    <FaCheckCircle />
                  </div>
                  <div className={styles.statusContent}>
                    <span className={styles.statusLabel}>Profile Complete</span>
                    <span className={styles.statusValue}>
                      {user.profileCompleted ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                <div className={styles.statusItem}>
                  <div
                    className={`${styles.statusIcon} ${
                      user.isOnboardingComplete ? styles.complete : styles.incomplete
                    }`}
                  >
                    <FaCheckCircle />
                  </div>
                  <div className={styles.statusContent}>
                    <span className={styles.statusLabel}>Onboarding</span>
                    <span className={styles.statusValue}>
                      {user.isOnboardingComplete ? "Complete" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.completionProgress}>
                <div className={styles.progressInfo}>
                  <span>Profile Completion</span>
                  <span>{completionPercentage}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Quick Actions</h3>
              <div className={styles.quickActions}>
                <button
                  className={styles.quickActionButton}
                  onClick={() => setShowEditModal(true)}
                >
                  <FaEdit />
                  <span>Edit Profile</span>
                </button>
                <button className={styles.quickActionButton}>
                  <FaBell />
                  <span>Notifications</span>
                </button>
                <button
                  className={styles.quickActionButton}
                  onClick={() => navigate("/events")}
                >
                  <FaCalendarAlt />
                  <span>Browse Events</span>
                </button>
                <button className={styles.quickActionButton}>
                  <FaCog />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Account Details */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Account Details</h3>
              <div className={styles.accountDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Member Since</span>
                  <span className={styles.detailValue}>
                    {new Date(user.createdAt || Date.now()).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Account Type</span>
                  <span className={styles.detailValue}>{user.role || "Student"}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Events Registered</span>
                  <span className={styles.detailValue}>{registeredEvents.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfile
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Profile;