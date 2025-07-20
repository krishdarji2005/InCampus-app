import { section } from "framer-motion/client";
import React from "react";
import styles from "./HeroSection.module.css";
import BlurText from "../TextAnimations/BlurText/BlurText";
import Button from "./Button/Button";
import { Link } from "react-router-dom";
import HeroImg from "../assets/RightImg.svg";
const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <div className={styles.contentLeft}>
            <h1 className={styles.title}>
              All Your <span>Campus</span> Events
            </h1>
            <h1 className={styles.title}>in One Place</h1>
            <p className={styles.description}>
              Simplifying how students discover and join events. Clean, fast, and built just for you.
            </p>
            <div className={styles.button}>
              <Link to="google.com">
                <Button width={200} height={80}></Button>
              </Link>
            </div>
          </div>
          <div className={styles.contentRight}>
            <img
              src={HeroImg}
              alt="Campus Events Platform"
              className={styles.isometricImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
