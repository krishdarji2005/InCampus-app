import { section } from "framer-motion/client";
import React from "react";
import styles from "./HeroSection.module.css";
import BlurText from "../TextAnimations/BlurText/BlurText";
import Button from "./Button/Button";
import { Link, useNavigate } from "react-router-dom";
import HeroImg from "../assets/RightImg.svg";
import { useAuth0 } from "@auth0/auth0-react";
import RotatingText from "../TextAnimations/RotatingText/RotatingText";
const HeroSection = () => {
  const { isAuthenticated, loginWithRedirect, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  // Handler for protected CTA
  const handleProtectedClick = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      await loginWithRedirect({ appState: { returnTo: "/events" } });
    } else {
      navigate("/events");
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <div className={styles.contentLeft}>
            <h1 className={styles.title}>
              All Your{" "}
              <span className={styles.rotatingTextWrapper}>
                <RotatingText
                  texts={["Campus", "College", "Institute", "Uni"]}
                  mainClassName={styles.rotatingText}
                  staggerFrom={"first"}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-120%", opacity: 0 }}
                  staggerDuration={0.05}
                  splitLevelClassName={styles.rotatingTextWord}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  rotationInterval={2500}
                />
              </span>{" "}
              Events
            </h1>
            <h1 className={styles.title}>in One Place</h1>
            <p className={styles.description}>
              Simplifying how students discover and join events. Clean, fast,
              and built just for you.
            </p>
            <div className={styles.button}>
              <Button
                width={200}
                height={80}
                initialText={isAuthenticated ? "Browse Events" : "Get  Started"}
                hoverText={isAuthenticated ? "Go to Events" : "Sign In"}
                protectedRoute={true}
                onProtectedClick={handleProtectedClick}
                isLoading={isLoading}
                isError={!!error}
              />
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
