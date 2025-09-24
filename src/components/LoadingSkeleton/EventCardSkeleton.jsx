import React from 'react';
import styles from './EventCardSkeleton.module.css';

const EventCardSkeleton = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImageWrapper}>
        <div className={styles.skeletonImage}></div>
        <div className={styles.skeletonBadge}></div>
      </div>
      <div className={styles.skeletonDetails}>
        <div className={styles.skeletonMeta}>
          <div className={styles.skeletonText} style={{ width: '60%' }}></div>
        </div>
        <div className={styles.skeletonTitle}>
          <div className={styles.skeletonText} style={{ width: '90%' }}></div>
          <div className={styles.skeletonText} style={{ width: '70%' }}></div>
        </div>
        <div className={styles.skeletonLocation}>
          <div className={styles.skeletonText} style={{ width: '80%' }}></div>
        </div>
        <div className={styles.skeletonCategory}>
          <div className={styles.skeletonTag}></div>
        </div>
        <div className={styles.skeletonAuthor}>
          <div className={styles.skeletonAvatar}></div>
          <div className={styles.skeletonText} style={{ width: '60%' }}></div>
        </div>
        <div className={styles.skeletonActions}>
          <div className={styles.skeletonButton}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
