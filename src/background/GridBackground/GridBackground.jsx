import React from "react";
import styles from "./GridBackground.module.css";

export default function GridBackground({ children }) {
  return (
    <div className={styles.gridContainer}>
      <div className={styles.gridPattern} />
      <div className={styles.radialOverlay} />
      <div className={styles.title}>
        {children}
      </div>
    </div>
  );
}