import React from 'react';
import MagicBento from './MagicBento/MagicBento';
import styles from './BentoWTxt.module.css';

const BentoWTxt = () => {
  return (
    <section className={styles.bentoSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Our Platform Features</h2>
          <p className={styles.subtitle}>
            Discover the powerful tools and capabilities that make our platform stand out
          </p>
        </div>
        <div className={styles.bentoWrapper}>
          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            disableAnimations={false}
            spotlightRadius={300}
            particleCount={12}
            enableTilt={false}
            glowColor="132, 0, 255"
            clickEffect={true}
            enableMagnetism={true}
          />
        </div>
      </div>
    </section>
  );
};

export default BentoWTxt;

 