import React, { useState, useRef, useEffect } from "react";
import { MdArrowOutward, MdPerson, MdSettings, MdLogout } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import InCampusFinalLogoo from "../assets/InCampusFinalLogoo.svg";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { loginWithRedirect, isAuthenticated, user, isLoading, logout, error } =
    useAuth0();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debug - log user object to see what we're working with
  useEffect(() => {
    if (user) {
      console.log("Auth0 User Object:", user);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Enhanced user data extraction
  const getUserDisplayName = () => {
    if (!user) return "User";

    // Priority: name > nickname > given_name > email (before @)
    if (user.name && user.name !== user.email) {
      return user.name;
    }
    if (user.nickname && user.nickname !== user.email) {
      return user.nickname;
    }
    if (user.given_name) {
      return user.given_name;
    }
    // If all else fails, use email before @ symbol
    if (user.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const getUserEmail = () => {
    if (!user) return "";
    // Make sure we return the full email
    return user.email || "";
  };

  const getUserProfileImage = () => {
    if (!user) return null;

    // Priority: picture > user_metadata.picture > fallback to initials
    if (user.picture && user.picture !== "") {
      return user.picture;
    }
    if (user.user_metadata && user.user_metadata.picture) {
      return user.user_metadata.picture;
    }
    // Return null to show initials fallback
    return null;
  };

  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    const names = displayName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setShowDropdown(false);
  };

  if (isLoading) return <div className={styles.navContainer}>Loading...</div>;
  if (error)
    return (
      <div className={styles.navContainer} style={{ color: "red" }}>
        Auth Error
      </div>
    );

  return (
    <div className={styles.navContainer}>
      <div className={styles.navContent}>
        <div className={styles.logo}>
          <NavLink to="/">
            <img src={InCampusFinalLogoo} alt="" />
            <span>InCampus</span>
          </NavLink>
        </div>
        <nav>
          <ul className={styles.navLinks}>
            <li>
              <NavLink to="/committees">Communities</NavLink>
            </li>
            <li>
              <NavLink to="/events">
                Events <MdArrowOutward />
              </NavLink>
            </li>
            <li>
              {!isAuthenticated ? (
                <button
                  className={styles.signIn}
                  onClick={() => loginWithRedirect()}
                >
                  Sign In
                </button>
              ) : (
                <div className={styles.profileContainer} ref={dropdownRef}>
                  <div
                    className={styles.profileButton}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {getUserProfileImage() ? (
                      <img
                        src={getUserProfileImage()}
                        alt="profile"
                        className={styles.profileImage}
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={styles.profileImageFallback}
                      style={{
                        display: getUserProfileImage() ? "none" : "flex",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      {getUserInitials()}
                    </div>
                    <span className={styles.userName}>
                      {getUserDisplayName()}
                    </span>
                  </div>

                  {showDropdown && (
                    <div className={styles.profileDropdown}>
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownUserInfo}>
                          <strong className={styles.dropdownUserName}>
                            {getUserDisplayName()}
                          </strong>
                          <small
                            className={styles.dropdownUserEmail}
                            title={getUserEmail()}
                          >
                            {getUserEmail()}
                          </small>
                        </div>
                      </div>
                      <div className={styles.dropdownDivider}></div>
                      <div
                        className={styles.dropdownItem}
                        onClick={handleProfileClick}
                      >
                        <MdPerson /> Profile
                      </div>
                      <div className={styles.dropdownItem}>
                        <MdSettings /> Settings
                      </div>
                      <div className={styles.dropdownDivider}></div>
                      <div
                        className={styles.dropdownItem}
                        onClick={() =>
                          logout({ returnTo: window.location.origin })
                        }
                      >
                        <MdLogout /> Sign Out
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
