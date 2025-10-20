import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MdArrowBack,
  MdEvent,
  MdDescription,
  MdLocationOn,
  MdCategory,
  MdImage,
  MdSave,
} from "react-icons/md";
import styles from "./CreateEvent.module.css";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "",
    poster: null,
  });

  const categories = [
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
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, GIF)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        poster: file,
      }));
    }
  };

  const validateForm = () => {
    const { title, description, date, time, venue, category } = formData;

    if (!title.trim()) {
      toast.error("Event title is required");
      return false;
    }

    if (!description.trim()) {
      toast.error("Event description is required");
      return false;
    }

    if (!date) {
      toast.error("Event date is required");
      return false;
    }

    if (!time) {
      toast.error("Event time is required");
      return false;
    }

    if (!venue.trim()) {
      toast.error("Event venue is required");
      return false;
    }

    if (!category) {
      toast.error("Event category is required");
      return false;
    }

    // Validate date is not in the past
    const selectedDate = new Date(`${date}T${time}`);
    const now = new Date();
    if (selectedDate <= now) {
      toast.error("Event date and time must be in the future");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get current user info for the author field
      const userId = localStorage.getItem("userId");
      const authUserString = localStorage.getItem("auth_user");

      let authUser = {};
      if (authUserString) {
        try {
          authUser = JSON.parse(authUserString);
        } catch (parseError) {
          console.error("Error parsing auth user:", parseError);
        }
      }

      // Create a proper date object
      const dateTimeString = `${formData.date}T${formData.time}:00`;
      const eventDateTime = new Date(dateTimeString);

      // Validate the date
      if (isNaN(eventDateTime.getTime())) {
        toast.error("Invalid date or time format");
        setIsLoading(false);
        return;
      }

      // Create the event data object
      // Update the submitData in CreateEvent.jsx:
      const submitData = {
        title: formData.title,
        description: formData.description,
        date: eventDateTime.toISOString(),
        venue: formData.venue,
        category: formData.category,
        author: authUser.name || authUser.given_name || "Unknown Author",
        authorId: userId || null,
        status: "active",
        registrationCount: 0,
        // Fix: Only use string URLs, not File objects
        image:
          formData.poster && typeof formData.poster === "string"
            ? formData.poster
            : `https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`,
      };

      console.log("Sending event data:", submitData);
      console.log("Date object:", eventDateTime);
      console.log("Auth user:", authUser);

      // Make API call to create event
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();
      console.log("Response:", responseData);

      if (response.ok) {
        console.log("Event created successfully:", responseData);
        toast.success("Event created successfully!");

        // Reset form
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          venue: "",
          category: "",
          poster: null,
        });

        // Navigate to events page
        setTimeout(() => {
          navigate("/events");
        }, 1500);
      } else {
        console.error("Server error:", responseData);
        toast.error(responseData.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoBack = () => {
    navigate("/manage-events");
  };

  // Get today's date for min date validation
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <button onClick={handleGoBack} className={styles.backButton}>
            <MdArrowBack size={20} />
            Back to Manage Events
          </button>

          <div className={styles.titleSection}>
            <h1 className={styles.title}>Create New Event</h1>
            <p className={styles.subtitle}>
              Fill in the details to create a new campus event
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Event Title */}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              <MdEvent size={18} />
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              <MdDescription size={18} />
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={styles.textarea}
              placeholder="Describe your event..."
              required
            />
          </div>

          {/* Date and Time */}
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label htmlFor="date" className={styles.label}>
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={today}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="time" className={styles.label}>
                Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          {/* Venue */}
          <div className={styles.formGroup}>
            <label htmlFor="venue" className={styles.label}>
              <MdLocationOn size={18} />
              Venue *
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Event venue/location"
              required
            />
          </div>

          {/* Category */}
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              <MdCategory size={18} />
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={styles.select}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Poster Upload */}
          <div className={styles.formGroup}>
            <label htmlFor="poster" className={styles.label}>
              <MdImage size={18} />
              Event Poster (Optional)
            </label>
            <input
              type="file"
              id="poster"
              name="poster"
              onChange={handleFileChange}
              accept="image/*"
              className={styles.fileInput}
            />
            {formData.poster && (
              <p className={styles.fileSelected}>
                Selected: {formData.poster.name}
              </p>
            )}
            <p className={styles.fileHelp}>
              Max file size: 5MB. Supported formats: JPEG, PNG, GIF
            </p>
          </div>

          {/* Submit Button */}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleGoBack}
              className={styles.cancelButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  Creating Event...
                </>
              ) : (
                <>
                  <MdSave size={20} />
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className={styles.helpText}>
          <p>
            * Required fields. Make sure all information is accurate before
            submitting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
