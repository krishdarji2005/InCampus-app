import React from "react";
import HeroSection from "../components/HeroSection";
import BentoWTxt from "../components/BentoWTxt";
import DarkVeil from "../background/DarkVeil/DarkVeil";
import styles from "./Home.module.css";

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.backgroundLayer}>
        <DarkVeil />
      </div>
      <div className={styles.contentLayer}>
        <HeroSection />
        <BentoWTxt />
      </div>
    </div>
  );
};

export default Home;
