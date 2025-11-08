import React, { useState, useRef, useEffect } from "react";
import {
  MdArrowOutward,
  MdPerson,
  MdSettings,
  MdLogout,
  MdDashboard,
  MdClose,
  MdMenu,
} from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import InCampusFinalLogoo from "../assets/InCampusFinalLogoo.svg";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { loginWithRedirect, isAuthenticated, user, isLoading, logout, error } =
    useAuth0();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const navigate = useNavigate();

  // Debug - log user object to see what we're working with
  useEffect(() => {
    if (user) {
      console.log("Auth0 User Object:", user);
    }
  }, [user]);

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown when clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

      // Close mobile menu when clicking outside
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
      setShowDropdown(false);
    };

    // Listen for navigation changes
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  // Enhanced user data extraction
  const getUserDisplayName = () => {
    if (!user) return "User";

    if (user.name && user.name !== user.email) {
      return user.name;
    }
    if (user.nickname && user.nickname !== user.email) {
      return user.nickname;
    }
    if (user.given_name) {
      return user.given_name;
    }
    if (user.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const getUserEmail = () => {
    if (!user) return "";
    return user.email || "";
  };

  const getUserProfileImage = () => {
    if (!user) return null;

    if (user.picture && user.picture !== "") {
      return user.picture;
    }
    if (user.user_metadata && user.user_metadata.picture) {
      return user.user_metadata.picture;
    }
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
    setIsMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate("/profile?edit=true");
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
  };

  // Enhanced mobile menu toggle with better state management
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setShowDropdown(false);
  };

  // Simplified close function
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Enhanced nav click handler
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
  };

  // Enhanced overlay click handler
  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not its children
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false);
    }
  };

  if (isLoading) return <div className={styles.navContainer}>Loading...</div>;
  if (error)
    return (
      <div className={styles.navContainer} style={{ color: "red" }}>
        Auth Error
      </div>
    );

  return (
    <>
      <div className={styles.navContainer}>
        <div className={styles.navContent}>
          {/* Logo */}
          <div className={styles.logo}>
            <NavLink to="/" onClick={handleMobileNavClick}>
              <img src={InCampusFinalLogoo} alt="InCampus Logo" />
              <span>InCampus</span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            <ul className={styles.navLinks}>
              <li>
                <NavLink
                  to="/events"
                  className={({ isActive }) =>
                    isActive ? styles.activeLink : ""
                  }
                >
                  Events <MdArrowOutward />
                </NavLink>
              </li>
              {isAuthenticated && (
                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive ? styles.activeLink : ""
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
              )}
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
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={styles.profileImageFallback}
                        style={{
                          display: getUserProfileImage() ? "none" : "flex",
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
                        <div className={styles.dropdownContent}>
                          <div className={styles.dropdownHeader}>
                            <div className={styles.dropdownUserAvatar}>
                              {getUserProfileImage() ? (
                                <img
                                  src={getUserProfileImage()}
                                  alt="profile"
                                  className={styles.dropdownAvatarImage}
                                />
                              ) : (
                                <div className={styles.dropdownAvatarFallback}>
                                  {getUserInitials()}
                                </div>
                              )}
                            </div>
                            <div className={styles.dropdownUserInfo}>
                              <span className={styles.dropdownUserName}>
                                {getUserDisplayName()}
                              </span>
                              <span className={styles.dropdownUserEmail}>
                                {getUserEmail()}
                              </span>
                            </div>
                          </div>

                          <div className={styles.dropdownDivider}></div>

                          <div className={styles.dropdownMenu}>
                            <div
                              className={styles.dropdownItem}
                              onClick={handleProfileClick}
                            >
                              <div className={styles.dropdownItemIcon}>
                                <MdPerson />
                              </div>
                              <div className={styles.dropdownItemContent}>
                                <span className={styles.dropdownItemTitle}>
                                  Profile
                                </span>
                                <span className={styles.dropdownItemSubtitle}>
                                  View your profile
                                </span>
                              </div>
                            </div>

                            <div
                              className={styles.dropdownItem}
                              onClick={handleDashboardClick}
                            >
                              <div className={styles.dropdownItemIcon}>
                                <MdDashboard />
                              </div>
                              <div className={styles.dropdownItemContent}>
                                <span className={styles.dropdownItemTitle}>
                                  Dashboard
                                </span>
                                <span className={styles.dropdownItemSubtitle}>
                                  Manage your events
                                </span>
                              </div>
                            </div>

                            <div
                              className={styles.dropdownItem}
                              onClick={handleSettingsClick}
                            >
                              <div className={styles.dropdownItemIcon}>
                                <MdSettings />
                              </div>
                              <div className={styles.dropdownItemContent}>
                                <span className={styles.dropdownItemTitle}>
                                  Edit Profile
                                </span>
                                <span className={styles.dropdownItemSubtitle}>
                                  Update your information
                                </span>
                              </div>
                            </div>

                            <div className={styles.dropdownDivider}></div>

                            <div
                              className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                              onClick={() =>
                                logout({ returnTo: window.location.origin })
                              }
                            >
                              <div className={styles.dropdownItemIcon}>
                                <MdLogout />
                              </div>
                              <div className={styles.dropdownItemContent}>
                                <span className={styles.dropdownItemTitle}>
                                  Sign Out
                                </span>
                                <span className={styles.dropdownItemSubtitle}>
                                  Sign out of your account
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuButtonRef}
            className={styles.mobileMenuButton}
            onClick={handleMobileMenuToggle}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            type="button"
          >
            <div
              className={`${styles.hamburgerIcon} ${
                isMobileMenuOpen ? styles.open : ""
              }`}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={handleOverlayClick}>
          <div
            className={styles.mobileMenu}
            ref={mobileMenuRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className={styles.mobileMenuHeader}>
              <div className={styles.mobileMenuLogo}>
                <img src={InCampusFinalLogoo} alt="InCampus Logo" />
                <span>InCampus</span>
              </div>
              <button
                className={styles.mobileMenuClose}
                onClick={closeMobileMenu}
                aria-label="Close menu"
                type="button"
              >
                <MdClose />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className={styles.mobileMenuContent}>
              {/* User Profile Section for Mobile */}
              {isAuthenticated && (
                <div className={styles.mobileUserSection}>
                  <div className={styles.mobileUserAvatar}>
                    {getUserProfileImage() ? (
                      <img
                        src={getUserProfileImage()}
                        alt="profile"
                        className={styles.mobileUserImage}
                      />
                    ) : (
                      <div className={styles.mobileUserImageFallback}>
                        {getUserInitials()}
                      </div>
                    )}
                  </div>
                  <div className={styles.mobileUserInfo}>
                    <span className={styles.mobileUserName}>
                      {getUserDisplayName()}
                    </span>
                    <span className={styles.mobileUserEmail}>
                      {getUserEmail()}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Navigation Links */}
              <nav className={styles.mobileNavigation}>
                <ul className={styles.mobileNavLinks}>
                  <li>
                    <NavLink
                      to="/events"
                      onClick={handleMobileNavClick}
                      className={({ isActive }) =>
                        `${styles.mobileNavLink} ${
                          isActive ? styles.activeMobileLink : ""
                        }`
                      }
                    >
                      <div className={styles.mobileNavLinkIcon}>
                        <MdArrowOutward />
                      </div>
                      <span>Events</span>
                    </NavLink>
                  </li>

                  {isAuthenticated && (
                    <>
                      <li>
                        <NavLink
                          to="/dashboard"
                          onClick={handleMobileNavClick}
                          className={({ isActive }) =>
                            `${styles.mobileNavLink} ${
                              isActive ? styles.activeMobileLink : ""
                            }`
                          }
                        >
                          <div className={styles.mobileNavLinkIcon}>
                            <MdDashboard />
                          </div>
                          <span>Dashboard</span>
                        </NavLink>
                      </li>

                      <li>
                        <button
                          className={styles.mobileNavLink}
                          onClick={handleProfileClick}
                          type="button"
                        >
                          <div className={styles.mobileNavLinkIcon}>
                            <MdPerson />
                          </div>
                          <span>Profile</span>
                        </button>
                      </li>

                      <li>
                        <button
                          className={styles.mobileNavLink}
                          onClick={handleSettingsClick}
                          type="button"
                        >
                          <div className={styles.mobileNavLinkIcon}>
                            <MdSettings />
                          </div>
                          <span>Edit Profile</span>
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </nav>

              {/* Mobile Auth Section */}
              <div className={styles.mobileAuthSection}>
                {!isAuthenticated ? (
                  <button
                    className={styles.mobileSignInButton}
                    onClick={() => {
                      loginWithRedirect();
                      setIsMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    Sign In
                  </button>
                ) : (
                  <button
                    className={styles.mobileSignOutButton}
                    onClick={() => {
                      logout({ returnTo: window.location.origin });
                      setIsMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    <MdLogout />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
