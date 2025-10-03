import React, { useState, useEffect } from "react";
import styles from "./RegistrationModal.module.css";
import { MdClose, MdCheckCircle, MdError } from "react-icons/md";
import { toast } from 'react-toastify';

const RegistrationModal = ({ isOpen, onClose, event, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    year: "",
    reason: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }
    
    if (!formData.year.trim()) {
      newErrors.year = "Year is required";
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = "Please tell us why you want to join this event";
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = "Please provide a more detailed reason (at least 10 characters)";
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call parent onSubmit with form data
      if (onSubmit) {
        onSubmit(formData);
      }
      
      setIsSuccess(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({ submit: "Registration failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    
    setFormData({ name: "", email: "", department: "", year: "", reason: "", phone: "" });
    setErrors({});
    setIsSubmitting(false);
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Request to Join Event</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.eventInfo}>
            <h3 className={styles.eventTitle}>{event.title}</h3>
            <p className={styles.eventNote}>
              Your registration request will be reviewed by the event organizer.
            </p>
          </div>

          {isSuccess ? (
            <div className={styles.successState}>
              <MdCheckCircle className={styles.successIcon} size={48} />
              <h3 className={styles.successTitle}>Registration Request Sent!</h3>
              <p className={styles.successMessage}>
                You'll receive a confirmation email shortly. The organizer will review your request and notify you of the decision.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className={styles.errorMessage}>
                    <MdError size={16} /> {errors.name}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className={styles.errorMessage}>
                    <MdError size={16} /> {errors.email}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                  placeholder="Enter your phone number"
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <span className={styles.errorMessage}>
                    <MdError size={16} /> {errors.phone}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="reason" className={styles.label}>
                  Why do you want to join this event? *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${errors.reason ? styles.inputError : ""}`}
                  placeholder="Tell us about your interest in this event..."
                  rows={4}
                  disabled={isSubmitting}
                />
                {errors.reason && (
                  <span className={styles.errorMessage}>
                    <MdError size={16} /> {errors.reason}
                  </span>
                )}
              </div>

              {errors.submit && (
                <div className={styles.submitError}>
                  <MdError size={16} /> {errors.submit}
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={handleClose}
                  className={styles.cancelButton}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
