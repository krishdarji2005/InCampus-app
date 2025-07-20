import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
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
              and join campus events. From bootcamps and workshops to cultural
              nights and club meetups, every official college activity is
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
                <a href="/academic">Academic</a>
              </li>
              <li>
                <a href="/workshops">Workshops</a>
              </li>
              <li>
                <a href="/social">Social Events</a>
              </li>
              <li>
                <a href="/sports">Sports</a>
              </li>
              <li>
                <a href="/cultural">Cultural</a>
              </li>
              <li>
                <a href="/volunteering">Volunteering</a>
              </li>
            </ul>
          </div>

          <div className={styles.colXs6ColMd3}>
            <h6>Quick Links</h6>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="/organizers">For Organizers</a>
              </li>
              <li>
                <a href="/privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms">Terms of Use</a>
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
              <a href="/"> InCampus</a>.
            </p>
          </div>

          <div className={styles.colMd4ColSm6ColXs12}>
            <ul className={styles.socialIcons}>
              <li>
                <a className={styles.facebook} href="#">
                  <FaFacebook />
                </a>
              </li>
              <li>
                <a className={styles.twitter} href="#">
                  <FaTwitter />
                </a>
              </li>
              <li>
                <a className={styles.instagram} href="#">
                  <FaInstagram />
                </a>
              </li>
              <li>
                <a className={styles.linkedin} href="#">
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
