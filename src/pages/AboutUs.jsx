import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProfileCard from "../components/ProfileCard/ProfileCard";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import BackToTop from "../components/BackToTop/BackToTop";
import styles from "./AboutUs.module.css";

const AboutUs = () => {
  const navigate = useNavigate();

  // Updated contact handler to open LinkedIn profiles
  const handleContactClick = (name, role, linkedinUrl) => {
    if (linkedinUrl) {
      // Open LinkedIn profile in new tab
      window.open(linkedinUrl, "_blank", "noopener,noreferrer");
      toast.success(`Opening ${name}'s LinkedIn profile!`);
    } else {
      toast.info(`Contact information for ${name} coming soon!`);
    }
    console.log(`Contact clicked for ${name} - ${role}`);
  };

  const teamMembers = {
    guide: {
      name: "Prof. Sarika Mane",
      title: "Project Guide & Professor",
      handle: "Dr.SarikaMane",
      status: "Available",
      contactText: "Contact",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108755-2616c86ca892?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      linkedinUrl: null, // No LinkedIn for guide
    },
    developers: [
      {
        name: "Krish Darji",
        title: "Full Stack Developer",
        handle: "krishdev",
        status: "Online",
        contactText: "Connect",
        avatarUrl: "/krish_in.jpg",
        linkedinUrl: "https://www.linkedin.com/in/krish-darji-baa576283/",
      },
      {
        name: "Arya Ganatra",
        title: "Frontend Developer",
        handle: "aryacode",
        status: "Online",
        contactText: "Connect",
        avatarUrl: "/arya_in3.jpg",
        linkedinUrl: "https://www.linkedin.com/in/arya-ganatra-2a7474377/",
      },
      {
        name: "Manav Gopinath",
        title: "Backend Developer",
        handle: "manavtech",
        status: "Online",
        contactText: "Connect",
        avatarUrl: "/manav_in.jpg",
        linkedinUrl: "https://www.linkedin.com/in/manav-g-722370299/",
      },
    ],
  };

  return (
    <>
      <div className={styles.aboutContainer}>
        <div className={styles.aboutContent}>
          <Breadcrumb />

          {/* Header Section */}
          <div className={styles.headerSection}>
            <h1 className={styles.pageTitle}>About Our Team</h1>
            <p className={styles.pageDescription}>
              Meet the passionate individuals behind InCampus - connecting
              students through innovative event management
            </p>
          </div>

          {/* Project Guide Section */}
          <div className={styles.guideSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Project Guide</h2>
              <p className={styles.sectionDescription}>
                Our mentor and academic supervisor
              </p>
            </div>

            <div className={styles.guideCard}>
              <ProfileCard
                name={teamMembers.guide.name}
                title={teamMembers.guide.title}
                handle={teamMembers.guide.handle}
                status={teamMembers.guide.status}
                contactText={teamMembers.guide.contactText}
                avatarUrl={teamMembers.guide.avatarUrl}
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={false}
                onContactClick={() =>
                  handleContactClick(
                    teamMembers.guide.name,
                    teamMembers.guide.title,
                    teamMembers.guide.linkedinUrl
                  )
                }
              />
            </div>
          </div>

          {/* Development Team Section */}
          <div className={styles.teamSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Development Team</h2>
              <p className={styles.sectionDescription}>
                The creative minds who brought this vision to life
              </p>
            </div>

            <div className={styles.teamGrid}>
              {teamMembers.developers.map((member, index) => (
                <div key={index} className={styles.teamMemberCard}>
                  <ProfileCard
                    name={member.name}
                    title={member.title}
                    handle={member.handle}
                    status={member.status}
                    contactText={member.contactText}
                    avatarUrl={member.avatarUrl}
                    showUserInfo={true}
                    enableTilt={true}
                    enableMobileTilt={false}
                    onContactClick={() =>
                      handleContactClick(
                        member.name,
                        member.title,
                        member.linkedinUrl
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Project Information */}
          <div className={styles.projectInfo}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>About InCampus</h3>
              <p className={styles.infoText}>
                InCampus is a comprehensive event management platform designed
                specifically for college campuses. Our mission is to streamline
                event discovery, registration, and management while fostering a
                vibrant campus community.
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Our Technology Stack</h3>
              <p className={styles.infoText}>
                Built with modern technologies including React.js, Node.js,
                MongoDB, and Express.js, InCampus delivers a seamless and
                responsive user experience across all devices.
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Connect With Us</h3>
              <p className={styles.infoText}>
                Have questions or want to collaborate? Connect with our team
                members on LinkedIn! Click the "Connect" buttons above to visit
                their professional profiles.
              </p>
            </div>
          </div>

          {/* Back to Events Button */}
          <div className={styles.actionSection}>
            <button
              className={styles.backToEventsBtn}
              onClick={() => navigate("/events")}
            >
              Explore Campus Events
            </button>
          </div>
        </div>
      </div>
      <BackToTop />
    </>
  );
};

export default AboutUs;
