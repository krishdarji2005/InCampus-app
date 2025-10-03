import React, { useState, useRef, useEffect } from "react";
import { MdArrowOutward, MdPerson, MdSettings, MdLogout } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import InCampusFinalLogoo from "../assets/InCampusFinalLogoo.svg";
import { useAuth0, User } from "@auth0/auth0-react";



const Navbar = () => {
  const {
    loginWithRedirect,
    isAuthenticated,
    user,
    isLoading,
    logout,
    error
  } = useAuth0();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleProfileClick = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  if (isLoading) return <div className={styles.navContainer}>Loading...</div>;
  if (error) return <div className={styles.navContainer} style={{color:'red'}}>Auth Error</div>;

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
              <NavLink to="/">Communities</NavLink>
            </li>
            <li>
              <NavLink to="/events">
                Events <MdArrowOutward />
              </NavLink>
            </li>
            <li>
              {!isAuthenticated ? (
                <button className={styles.signIn} onClick={() => loginWithRedirect()}>Sign In</button>
              ) : (
                <div className={styles.profileContainer} ref={dropdownRef}>
                  <div 
                    className={styles.profileButton} 
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <img src={user.picture} alt="profile" className={styles.profileImage} />
                    <span className={styles.userName}>{user?.name}</span>
                  </div>
                  
                  {showDropdown && (
                    <div className={styles.profileDropdown}>
                      <div className={styles.dropdownItem} onClick={handleProfileClick}>
                        <MdPerson /> Profile
                      </div>
                      <div className={styles.dropdownItem}>
                        <MdSettings /> Settings
                      </div>
                      <div className={styles.dropdownDivider}></div>
                      <div 
                        className={styles.dropdownItem} 
                        onClick={() => logout({ returnTo: window.location.origin })}
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
