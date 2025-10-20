import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styles from "./EditProfile.module.css";
import {
  FaUser,
  FaPhone,
  FaGraduationCap,
  FaHeart,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaTimes,
  FaSave,
} from "react-icons/fa";

const EditProfile = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    department: "",
    year: "",
    rollNumber: "",
    interests: [],
    socialLinks: {
      linkedin: "",
      github: "",
      instagram: "",
      portfolio: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data with user's current data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        department: user.department || "",
        year: user.year || "",
        rollNumber: user.rollNumber || "",
        interests: user.interests || [],
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
          instagram: user.socialLinks?.instagram || "",
          portfolio: user.socialLinks?.portfolio || "",
        },
      });
    }
  }, [user]);

  const departments = [
    "Computer Science",
    "Information Technology",
    "Electronics & Telecommunication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Artificial Intelligence & Data Science",
    "Computer Science & Engineering (AI & ML)",
    "Other",
  ];

  const years = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "Postgraduate",
    "Faculty",
  ];

  const interestOptions = [
    "Technical",
    "Cultural",
    "Sports",
    "Academic",
    "Workshop",
    "Seminar",
    "Competition",
    "Social",
    "Art & Craft",
    "Music",
    "Dance",
    "Literature",
    "Entrepreneurship",
    "Leadership",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (formData.phone && formData.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Add roll number validation
    if (formData.rollNumber && formData.rollNumber.trim()) {
      const rollNumberPattern = /^[A-Za-z0-9]{6,15}$/; // Alphanumeric, 6-15 characters
      if (!rollNumberPattern.test(formData.rollNumber.trim())) {
        toast.error(
          "Roll number must be 6-15 characters long and contain only letters and numbers"
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("User ID not found");
        return;
      }

      // Clean the data before sending
      const cleanedData = {
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone ? formData.phone.trim() : "",
        bio: formData.bio ? formData.bio.trim() : "",
        rollNumber: formData.rollNumber
          ? formData.rollNumber.trim().toUpperCase()
          : "",
        department: formData.department || "",
        year: formData.year || "",
        interests: formData.interests || [],
        socialLinks: {
          linkedin: formData.socialLinks?.linkedin?.trim() || "",
          github: formData.socialLinks?.github?.trim() || "",
          instagram: formData.socialLinks?.instagram?.trim() || "",
          portfolio: formData.socialLinks?.portfolio?.trim() || "",
        },
      };

      console.log("Updating profile with data:", cleanedData);

      const response = await fetch(
        `http://localhost:5000/api/users/profile/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanedData),
        }
      );

      const data = await response.json();
      console.log("Update response:", data);

      if (response.ok) {
        toast.success("Profile updated successfully!");
        onSave(data.user);
        onClose();
      } else {
        const errorMessage = data.message || "Failed to update profile";
        const detailedErrors = data.errors ? data.errors.join(", ") : "";

        toast.error(
          `${errorMessage}${detailedErrors ? ": " + detailedErrors : ""}`
        );
        console.error("Update failed:", data);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Edit Profile</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.scrollContent}>
            {/* Basic Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FaUser className={styles.sectionIcon} />
                Basic Information
              </h3>

              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="rollNumber">Roll Number</label>
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="e.g., 2021BTEC123, CS2021001"
                  maxLength={15}
                  pattern="[A-Za-z0-9]{6,15}"
                  title="Roll number should be 6-15 characters long and contain only letters and numbers"
                />
                <small>6-15 characters, letters and numbers only</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  placeholder="Tell us a bit about yourself..."
                  maxLength={500}
                />
                <small>{formData.bio.length}/500 characters</small>
              </div>
            </div>

            {/* Academic Information */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FaGraduationCap className={styles.sectionIcon} />
                Academic Information
              </h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="">Select your department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="year">Academic Year</label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="">Select your year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="rollNumber">Roll Number</label>
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter your roll number"
                />
              </div>
            </div>

            {/* Interests */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FaHeart className={styles.sectionIcon} />
                Interests
              </h3>

              <div className={styles.interestsGrid}>
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    className={`${styles.interestTag} ${
                      formData.interests.includes(interest)
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FaLinkedin className={styles.sectionIcon} />
                Social Links
              </h3>

              <div className={styles.formGroup}>
                <label htmlFor="linkedin">
                  <FaLinkedin /> LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="github">
                  <FaGithub /> GitHub
                </label>
                <input
                  type="url"
                  id="github"
                  name="socialLinks.github"
                  value={formData.socialLinks.github}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="portfolio">
                  <FaGlobe /> Portfolio Website
                </label>
                <input
                  type="url"
                  id="portfolio"
                  name="socialLinks.portfolio"
                  value={formData.socialLinks.portfolio}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading && <div className={styles.loading}></div>}
              <FaSave />
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
