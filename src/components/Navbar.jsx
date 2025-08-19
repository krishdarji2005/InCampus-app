import React from "react";
import { MdArrowOutward } from "react-icons/md";
import { NavLink } from "react-router-dom";
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
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  {/* {console.log(user)} */}
                  
                  <img src={user?.picture} alt="profile" style={{width:32,height:32,borderRadius:'50%'}} />
                  <span style={{color:'white',fontWeight:300}}>{user?.name}</span>
                  <button className={styles.signIn} onClick={() => logout({ returnTo: window.location.origin })}>Sign Out</button>
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
