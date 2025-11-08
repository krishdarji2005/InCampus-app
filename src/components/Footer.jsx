import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles.colSm12ColMd6}>
            <h6>About InCampus</h6>
            <p className={styles.textJustify}>
              <strong>InCampus</strong> is your all-in-one platform to explore
              and join campus events. From workshops and seminars to cultural
              nights and competitions, every official college activity is
              curated in one place.
            </p>
            <p className={styles.textJustify}>
              No more scattered links, group chats, or missed updates — just{" "}
              <strong>easy discovery</strong> and
              <strong> one-tap registrations</strong> for everything happening
              across campus.
            </p>
          </div>

          <div className={styles.colXs6ColMd3}>
            <h6>Event Categories</h6>
            <ul className={styles.footerLinks}>
              <li>
                <Link to="/events?category=Academic">Academic</Link>
              </li>
              <li>
                <Link to="/events?category=Workshop">Workshops</Link>
              </li>
              <li>
                <Link to="/events?category=Cultural">Cultural</Link>
              </li>
              <li>
                <Link to="/events?category=Sports">Sports</Link>
              </li>
              <li>
                <Link to="/events?category=Technical">Technical</Link>
              </li>
              <li>
                <Link to="/events?category=Competition">Competitions</Link>
              </li>
            </ul>
          </div>

          <div className={styles.colXs6ColMd3}>
            <h6>Quick Links</h6>
            <ul className={styles.footerLinks}>
              <li>
                <Link to="/profile">My Profile</Link>
              </li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/create-event">Create Event</Link>
              </li>
              <li>
                <Link to="/events">Browse Events</Link>
              </li>
              <li>
                <Link to="/">Home</Link>
              </li>
            </ul>
          </div>
        </div>
        <hr />
      </div>
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles.colMd8ColSm6ColXs12}>
            <p className={styles.copyrightText}>
              Copyright &copy; {new Date().getFullYear()} All Rights Reserved by
              <Link to="/"> InCampus</Link>.
            </p>
          </div>

          <div className={styles.colMd4ColSm6ColXs12}>
            <ul className={styles.socialIcons}>
              <li>
                <a
                  className={styles.facebook}
                  href="https://facebook.com/incampus"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FaFacebook />
                </a>
              </li>
              <li>
                <a
                  className={styles.twitter}
                  href="https://twitter.com/incampus"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <FaTwitter />
                </a>
              </li>
              <li>
                <a
                  className={styles.instagram}
                  href="https://instagram.com/incampus"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              </li>
              <li>
                <a
                  className={styles.linkedin}
                  href="https://linkedin.com/company/incampus"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
