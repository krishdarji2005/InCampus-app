import React from "react";
import HeroSection from "../components/HeroSection";
import CommitteLogosScroll from "../components/CommitteLogosScroll";
import BentoWTxt from "../components/BentoWTxt";
import FlowingMenuSection from "../components/FlowingMenuSection/FlowingMenuSection";
// import DarkVeil from "../background/DarkVeil/DarkVeil";
import QuickStatistics from "../components/QuickStatistics/QuickStatistics";
import styles from "./Home.module.css";
import FAQSection from "../components/FAQSection/FAQSection";


const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.backgroundLayer}>
        {/* <DarkVeil /> */}
      </div>
      <div className={styles.contentLayer}>
        <HeroSection />
        {/* <CommitteLogosScroll /> */}
        <QuickStatistics />
        <BentoWTxt />
        {/* <FlowingMenuSection /> */}
        <FAQSection/>
      </div>
    </div>
  );
};

export default Home;
