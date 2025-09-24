import React from "react";
import HeroSection from "../components/HeroSection";
import CommitteLogosScroll from "../components/CommitteLogosScroll";
import BentoWTxt from "../components/BentoWTxt";
import FlowingMenuSection from "../components/FlowingMenuSection/FlowingMenuSection";
// import DarkVeil from "../background/DarkVeil/DarkVeil";
import styles from "./Home.module.css";

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.backgroundLayer}>
        {/* <DarkVeil /> */}
      </div>
      <div className={styles.contentLayer}>
        <HeroSection />
        <CommitteLogosScroll />
        <BentoWTxt />
        <FlowingMenuSection />
      </div>
    </div>
  );
};

export default Home;
