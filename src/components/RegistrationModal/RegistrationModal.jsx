import React, { useState, useEffect } from "react";
import styles from "./RegistrationModal.module.css";
import { toast } from "react-toastify";
import ProfileCompletionChecker from "../ProfileCompletionChecker/ProfileCompletionChecker";
import EditProfile from "../EditProfile/EditProfile";
import {
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaPhone,
  FaEnvelope,
  FaGraduationCap,
  FaUpload,
  FaFilePdf,
  FaIdCard,
  FaEye,
  FaTrash,
  FaShieldAlt,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RegistrationModal = ({ isOpen, onClose, event, user, onSubmit }) => {
  useEffect(() => {
    console.log("RegistrationModal received event prop:", event);
    console.log("Event _id:", event?._id);
    console.log("Event keys:", event ? Object.keys(event) : "No event");
  }, [event]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showProfileChecker, setShowProfileChecker] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // File upload states
  const [pdfFile, setPdfFile] = useState(null);
  const [idImage, setIdImage] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});

  // Add state for editable user info
  const [editableUserInfo, setEditableUserInfo] = useState({
    name: "",
    phone: "",
    department: "",
    year: "",
  });

  // Add state to track if we're in edit mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Update useEffect to initialize editable user info
  useEffect(() => {
    if (user) {
      setEditableUserInfo({
        name: user.name || "",
        phone: user.phone || "",
        department: user.department || "",
        year: user.year || "",
      });

      // Check if profile needs completion
      const requiredFields = ["name", "phone", "department", "year"];
      const incompleteFields = requiredFields.filter(
        (field) => !user[field] || user[field].toString().trim().length === 0
      );

      if (incompleteFields.length > 0) {
        setIsEditingProfile(true);
      }
    }
  }, [user]);

  if (!user && isOpen) {
    console.error("RegistrationModal: user prop is required");
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2>Error</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          <div className={styles.content}>
            <p>
              User information is not available. Please refresh and try again.
            </p>
          </div>
          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Update the checkProfileCompletion function
  const checkProfileCompletion = () => {
    if (!editableUserInfo) return false;

    const requiredFields = ["name", "phone", "department", "year"];
    return requiredFields.every((field) => {
      const value = editableUserInfo[field];
      return value && value.toString().trim().length > 0;
    });
  };

  // Add handler for user info changes
  const handleUserInfoChange = (field, value) => {
    setEditableUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add function to save user profile
  const saveUserProfile = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editableUserInfo),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success("Profile updated successfully!");
        setIsEditingProfile(false);
        return true;
      } else {
        toast.error("Failed to update profile");
        return false;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return false;
    }
  };

  // File validation
  const validateFile = (file, type) => {
    const errors = {};

    if (type === "pdf") {
      if (file.type !== "application/pdf") {
        errors.pdf = "Please upload a PDF file only";
        return errors;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        errors.pdf = "PDF file size should be less than 5MB";
        return errors;
      }
    }

    if (type === "image") {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        errors.image = "Please upload JPG, JPEG, or PNG image only";
        return errors;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        errors.image = "Image file size should be less than 2MB";
        return errors;
      }
    }

    return errors;
  };

  // Handle PDF upload
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const errors = validateFile(file, "pdf");
      if (Object.keys(errors).length > 0) {
        setUploadErrors((prev) => ({ ...prev, ...errors }));
        toast.error(errors.pdf);
        return;
      }
      setPdfFile(file);
      setUploadErrors((prev) => ({ ...prev, pdf: null }));
      toast.success("PDF uploaded successfully");
    }
  };

  // Handle ID image upload
  const handleIdImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const errors = validateFile(file, "image");
      if (Object.keys(errors).length > 0) {
        setUploadErrors((prev) => ({ ...prev, ...errors }));
        toast.error(errors.image);
        return;
      }
      setIdImage(file);
      setUploadErrors((prev) => ({ ...prev, image: null }));
      toast.success("ID image uploaded successfully");
    }
  };

  // Remove uploaded files
  const removePdfFile = () => {
    setPdfFile(null);
    setUploadErrors((prev) => ({ ...prev, pdf: null }));
  };

  const removeIdImage = () => {
    setIdImage(null);
    setUploadErrors((prev) => ({ ...prev, image: null }));
  };

  const handleRegister = async () => {
    // Check if user exists first
    if (!user) {
      toast.error(
        "User information is not available. Please refresh and try again."
      );
      return;
    }

    // IMPORTANT: Check if event and event._id exist
    const eventId = event?._id || event?.id;

    if (!eventId) {
      console.error("No event ID available");
      toast.error("Event ID not found. Please refresh the page.");
      return;
    }

    console.log("Using Event ID:", eventId);

    // Check profile completion
    if (!checkProfileCompletion()) {
      toast.error("Please complete all required fields before registering.");
      setIsEditingProfile(true);
      return;
    }

    // If profile was edited, save it first
    if (isEditingProfile) {
      const saved = await saveUserProfile();
      if (!saved) return;
    }

    // Validate required ID image
    if (!idImage) {
      toast.error(
        "Please upload your ID image. This is required for registration."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("User not found. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("idImage", idImage);

      if (pdfFile) {
        formData.append("additionalDocument", pdfFile);
      }

      console.log("Sending registration data:");
      console.log("Event ID:", eventId);
      console.log("User ID:", userId);
      console.log("ID Image:", idImage?.name);
      console.log("PDF File:", pdfFile?.name);

      const response = await fetch(
        `${API_BASE_URL}/events/${eventId}/register`, // Make sure this matches your route
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Registration response status:", response.status);
      console.log("Registration response data:", data);

      if (response.ok) {
        setIsSuccess(true);
        toast.success("Successfully registered for the event! 🎉");

        if (onSubmit) {
          onSubmit(data);
        }

        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        const errorMessage = data.message || "Registration failed";
        console.error("Registration failed:", errorMessage);
        console.error("Full error response:", data);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setShowEditProfile(false);

    const updatedFields = ["name", "phone", "department", "year"];
    const isComplete = updatedFields.every(
      (field) =>
        updatedUser[field] && updatedUser[field].toString().trim().length > 0
    );

    if (isComplete) {
      toast.success("Profile updated! You can now register for the event.");
      setTimeout(() => {
        handleRegister();
      }, 1000);
    } else {
      toast.warning("Please complete all required fields to register.");
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setPdfFile(null);
    setIdImage(null);
    setUploadErrors({});
    setIsSubmitting(false);
    setIsSuccess(false);
    setShowProfileChecker(false);
    setShowEditProfile(false);
    setIsEditingProfile(false);
    onClose();
  };

  if (!isOpen) return null;

  if (showEditProfile) {
    return (
      <EditProfile
        user={user}
        onClose={() => setShowEditProfile(false)}
        onSave={handleProfileUpdate}
      />
    );
  }

  return (
    <>
      <div className={styles.overlay} onClick={handleClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2 className={styles.title}>Register for Event</h2>
              <p className={styles.subtitle}>
                Confirm your registration and upload required documents
              </p>
            </div>
            <button
              className={styles.closeButton}
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>

          <div className={styles.content}>
            {isSuccess ? (
              <div className={styles.successState}>
                <FaCheckCircle className={styles.successIcon} />
                <h3 className={styles.successTitle}>
                  Registration Successful! 🎉
                </h3>
                <p className={styles.successMessage}>
                  You have been successfully registered for this event. Check
                  your email for confirmation details and further instructions.
                </p>
                <div className={styles.successDetails}>
                  <p>Your documents have been submitted for verification.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Event Summary */}
                <div className={styles.eventSummary}>
                  <div className={styles.eventHeader}>
                    <h3>{event.title}</h3>
                    <span
                      className={`${styles.eventType} ${
                        styles[event.type?.toLowerCase()]
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>

                  <div className={styles.eventDetails}>
                    <div className={styles.detailItem}>
                      <FaCalendarAlt className={styles.detailIcon} />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className={styles.detailItem}>
                      <FaClock className={styles.detailIcon} />
                      <span>{event.time}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <FaMapMarkerAlt className={styles.detailIcon} />
                      <span>{event.venue}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <FaUsers className={styles.detailIcon} />
                      <span>
                        {event.registeredUsers?.length || 0} /{" "}
                        {event.maxParticipants} registered
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Information Section - Profile Editing */}
                {isEditingProfile && (
                  <div className={styles.profileEditSection}>
                    <div className={styles.profileEditHeader}>
                      <h4>Complete Your Profile</h4>
                      <p>
                        Please provide the following information to continue
                        with registration
                      </p>
                    </div>

                    <div className={styles.profileFields}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          <FaUser className={styles.fieldIcon} />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={editableUserInfo.name}
                          onChange={(e) =>
                            handleUserInfoChange("name", e.target.value)
                          }
                          placeholder="Enter your full name"
                          className={styles.fieldInput}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          <FaPhone className={styles.fieldIcon} />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={editableUserInfo.phone}
                          onChange={(e) =>
                            handleUserInfoChange("phone", e.target.value)
                          }
                          placeholder="Enter your phone number"
                          className={styles.fieldInput}
                        />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          <FaGraduationCap className={styles.fieldIcon} />
                          Department *
                        </label>
                        <select
                          value={editableUserInfo.department}
                          onChange={(e) =>
                            handleUserInfoChange("department", e.target.value)
                          }
                          className={styles.fieldSelect}
                        >
                          <option value="">Select Department</option>
                          <option value="Computer Science">
                            Computer Science
                          </option>
                          <option value="Information Technology">
                            Information Technology
                          </option>
                          <option value="Electronics">Electronics</option>
                          <option value="Mechanical">Mechanical</option>
                          <option value="Civil">Civil</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          <FaGraduationCap className={styles.fieldIcon} />
                          Academic Year *
                        </label>
                        <select
                          value={editableUserInfo.year}
                          onChange={(e) =>
                            handleUserInfoChange("year", e.target.value)
                          }
                          className={styles.fieldSelect}
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Graduate">Graduate</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.profileEditActions}>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className={styles.skipButton}
                        disabled={!checkProfileCompletion()}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Information Sharing Notice - only show if profile is complete */}
                {!isEditingProfile && (
                  <div className={styles.infoSharingSection}>
                    <div className={styles.infoHeader}>
                      <FaShieldAlt className={styles.shieldIcon} />
                      <h4>Information Shared with Event Committee</h4>
                    </div>

                    <div className={styles.sharedInfoGrid}>
                      <div className={styles.sharedInfoItem}>
                        <FaUser className={styles.sharedIcon} />
                        <div>
                          <span className={styles.infoLabel}>Full Name</span>
                          <span className={styles.infoValue}>
                            {editableUserInfo?.name ||
                              user?.name ||
                              "Not provided"}
                          </span>
                        </div>
                      </div>

                      <div className={styles.sharedInfoItem}>
                        <FaEnvelope className={styles.sharedIcon} />
                        <div>
                          <span className={styles.infoLabel}>
                            Email Address
                          </span>
                          <span className={styles.infoValue}>
                            {user?.email}
                          </span>
                        </div>
                      </div>

                      <div className={styles.sharedInfoItem}>
                        <FaPhone className={styles.sharedIcon} />
                        <div>
                          <span className={styles.infoLabel}>Phone Number</span>
                          <span className={styles.infoValue}>
                            {editableUserInfo?.phone ||
                              user?.phone ||
                              "Not specified"}
                          </span>
                        </div>
                      </div>

                      <div className={styles.sharedInfoItem}>
                        <FaGraduationCap className={styles.sharedIcon} />
                        <div>
                          <span className={styles.infoLabel}>
                            Department & Year
                          </span>
                          <span className={styles.infoValue}>
                            {(editableUserInfo?.department ||
                              user?.department) &&
                            (editableUserInfo?.year || user?.year)
                              ? `${
                                  editableUserInfo?.department ||
                                  user?.department
                                } - ${editableUserInfo?.year || user?.year}`
                              : "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.privacyNote}>
                      <FaInfoCircle className={styles.noteIcon} />
                      <p>
                        This information will only be used for event management
                        and communication purposes. Your data is secure and will
                        not be shared with third parties.
                      </p>
                    </div>
                  </div>
                )}

                {/* Document Upload Section - only show if profile is complete */}
                {!isEditingProfile && (
                  <div className={styles.uploadSection}>
                    <h4 className={styles.uploadTitle}>Required Documents</h4>

                    {/* ID Image Upload - Required */}
                    <div className={styles.uploadGroup}>
                      <label className={styles.uploadLabel}>
                        <FaIdCard className={styles.uploadIcon} />
                        Student ID Image{" "}
                        <span className={styles.required}>*</span>
                      </label>
                      <p className={styles.uploadDescription}>
                        Upload a clear photo of your student ID card (front
                        side)
                      </p>

                      {!idImage ? (
                        <div className={styles.uploadArea}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleIdImageUpload}
                            className={styles.fileInput}
                            id="idImageUpload"
                          />
                          <label
                            htmlFor="idImageUpload"
                            className={styles.uploadButton}
                          >
                            <FaUpload />
                            Choose ID Image
                          </label>
                          <p className={styles.uploadHint}>
                            JPG, JPEG, PNG (Max 2MB)
                          </p>
                        </div>
                      ) : (
                        <div className={styles.uploadedFile}>
                          <div className={styles.fileInfo}>
                            <FaIdCard className={styles.fileIcon} />
                            <div className={styles.fileDetails}>
                              <span className={styles.fileName}>
                                {idImage.name}
                              </span>
                              <span className={styles.fileSize}>
                                {(idImage.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeIdImage}
                            className={styles.removeButton}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                      {uploadErrors.image && (
                        <div className={styles.uploadError}>
                          {uploadErrors.image}
                        </div>
                      )}
                    </div>

                    {/* PDF Upload - Optional */}
                    <div className={styles.uploadGroup}>
                      <label className={styles.uploadLabel}>
                        <FaFilePdf className={styles.uploadIcon} />
                        Additional Document{" "}
                        <span className={styles.optional}>(Optional)</span>
                      </label>
                      <p className={styles.uploadDescription}>
                        {event.additionalDocumentInfo ||
                          "Upload any additional document as specified by the event committee (resume, portfolio, etc.)"}
                      </p>

                      {!pdfFile ? (
                        <div className={styles.uploadArea}>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handlePdfUpload}
                            className={styles.fileInput}
                            id="pdfUpload"
                          />
                          <label
                            htmlFor="pdfUpload"
                            className={styles.uploadButton}
                          >
                            <FaUpload />
                            Choose PDF Document
                          </label>
                          <p className={styles.uploadHint}>
                            PDF only (Max 5MB)
                          </p>
                        </div>
                      ) : (
                        <div className={styles.uploadedFile}>
                          <div className={styles.fileInfo}>
                            <FaFilePdf className={styles.fileIcon} />
                            <div className={styles.fileDetails}>
                              <span className={styles.fileName}>
                                {pdfFile.name}
                              </span>
                              <span className={styles.fileSize}>
                                {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removePdfFile}
                            className={styles.removeButton}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                      {uploadErrors.pdf && (
                        <div className={styles.uploadError}>
                          {uploadErrors.pdf}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Registration Status - only show if profile is complete */}
                {!isEditingProfile && (
                  <div className={styles.registrationStatus}>
                    {event.registeredUsers?.length >= event.maxParticipants ? (
                      <div className={styles.statusWarning}>
                        <FaExclamationCircle />
                        <span>Event is full - Join waitlist</span>
                      </div>
                    ) : (
                      <div className={styles.statusSuccess}>
                        <FaCheckCircle />
                        <span>Spots available</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {!isSuccess && (
            <div className={styles.footer}>
              <button
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              {isEditingProfile ? (
                <button
                  className={styles.submitButton}
                  onClick={() => setIsEditingProfile(false)}
                  disabled={!checkProfileCompletion()}
                >
                  Continue to Upload
                </button>
              ) : (
                <button
                  className={styles.submitButton}
                  onClick={handleRegister}
                  disabled={isSubmitting || !idImage}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.spinner}></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      {event.registeredUsers?.length >= event.maxParticipants
                        ? "Join Waitlist"
                        : "Register Now"}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion Checker */}
      {showProfileChecker && user && (
        <ProfileCompletionChecker
          user={user}
          onClose={() => setShowProfileChecker(false)}
          onContinue={() => {
            setShowProfileChecker(false);
            setShowEditProfile(true);
          }}
        />
      )}
    </>
  );
};

export default RegistrationModal;
