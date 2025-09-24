import React from "react";
import styles from "./EventDetailsSkeleton.module.css";

const EventDetailsSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonContent}>
        {/* Header skeleton */}
        <div className={styles.headerSkeleton}>
          <div className={styles.backButtonSkeleton}></div>
        </div>

        <div className={styles.skeletonLayout}>
          {/* Main Content Column */}
          <div className={styles.mainColumn}>
            {/* Event Header Skeleton */}
            <div className={styles.eventHeaderSkeleton}>
              <div className={styles.categorySkeleton}></div>
              <div className={styles.titleSkeleton}></div>
              <div className={styles.metaSkeleton}>
                <div className={styles.metaItemSkeleton}></div>
                <div className={styles.metaItemSkeleton}></div>
                <div className={styles.metaItemSkeleton}></div>
              </div>
            </div>

            {/* Registration Section Skeleton */}
            <div className={styles.registrationSkeleton}>
              <div className={styles.sectionTitleSkeleton}></div>
              <div className={styles.approvalBoxSkeleton}></div>
              <div className={styles.buttonSkeleton}></div>
            </div>

            {/* About Section Skeleton */}
            <div className={styles.aboutSkeleton}>
              <div className={styles.sectionTitleSkeleton}></div>
              <div className={styles.textSkeleton}></div>
              <div className={styles.textSkeleton}></div>
              <div className={styles.subTitleSkeleton}></div>
              <div className={styles.listSkeleton}>
                <div className={styles.listItemSkeleton}></div>
                <div className={styles.listItemSkeleton}></div>
                <div className={styles.listItemSkeleton}></div>
                <div className={styles.listItemSkeleton}></div>
              </div>
              <div className={styles.textSkeleton}></div>
            </div>

            {/* Location Section Skeleton */}
            <div className={styles.locationSkeleton}>
              <div className={styles.sectionTitleSkeleton}></div>
              <div className={styles.venueSkeleton}></div>
              <div className={styles.mapSkeleton}></div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className={styles.sidebar}>
            {/* Organizer Card Skeleton */}
            <div className={styles.cardSkeleton}>
              <div className={styles.cardTitleSkeleton}></div>
              <div className={styles.organizerInfoSkeleton}>
                <div className={styles.avatarSkeleton}></div>
                <div className={styles.organizerDetailsSkeleton}>
                  <div className={styles.nameSkeleton}></div>
                  <div className={styles.followersSkeleton}></div>
                </div>
              </div>
              <div className={styles.subscribeButtonSkeleton}></div>
              <div className={styles.descriptionSkeleton}></div>
            </div>

            {/* Event Details Card Skeleton */}
            <div className={styles.cardSkeleton}>
              <div className={styles.cardTitleSkeleton}></div>
              <div className={styles.detailItemSkeleton}></div>
              <div className={styles.detailItemSkeleton}></div>
              <div className={styles.detailItemSkeleton}></div>
            </div>

            {/* Share Card Skeleton */}
            <div className={styles.cardSkeleton}>
              <div className={styles.cardTitleSkeleton}></div>
              <div className={styles.socialButtonsSkeleton}>
                <div className={styles.socialButtonSkeleton}></div>
                <div className={styles.socialButtonSkeleton}></div>
                <div className={styles.socialButtonSkeleton}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsSkeleton;
