import React from "react";
import { MdArrowOutward } from "react-icons/md";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import InCampusFinalLogoo from "../assets/InCampusFinalLogoo.svg"
const Navbar = () => {
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
              <NavLink to="/">
                Events <MdArrowOutward />
              </NavLink>
            </li>
            <li >
              <NavLink to="/contact" className={styles.signIn}>Sign In</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;