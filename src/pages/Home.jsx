import React from "react";
import HeroSection from "../components/HeroSection";
import DarkVeil from "../background/DarkVeil/DarkVeil";
import styles from "./Home.module.css"; // Create this file

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.backgroundLayer}>
        <DarkVeil />
      </div>
      <div className={styles.contentLayer}>
        <HeroSection />
      </div>
    </div>
  );
};

export default Home;