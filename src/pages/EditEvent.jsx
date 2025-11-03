import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MdArrowBack,
  MdEvent,
  MdDescription,
  MdLocationOn,
  MdCategory,
  MdImage,
  MdSave,
  MdGroup,
} from "react-icons/md";
import styles from "./CreateEvent.module.css"; // Reuse the same styles

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "",
    maxParticipants: 50,
    poster: null,
    currentImageUrl: "",
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

  // Fetch event data for editing
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoadingEvent(true);
        const response = await fetch(`http://localhost:5000/api/events/${id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const data = await response.json();
        const event = data.event || data;

        // Check if current user is the event creator
        const currentUserId = localStorage.getItem("userId");
        if (event.createdBy !== currentUserId && event.authorId !== currentUserId) {
          toast.error("You don't have permission to edit this event");
          navigate("/dashboard");
          return;
        }

        // Format date and time for form inputs
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toISOString().split('T')[0];
        const formattedTime = eventDate.toTimeString().slice(0, 5);

        setFormData({
          title: event.title || "",
          description: event.description || "",
          date: formattedDate,
          time: formattedTime,
          venue: event.venue || "",
          category: event.type || event.category || "",
          maxParticipants: event.maxParticipants || 50,
          poster: null,
          currentImageUrl: event.image || event.imageUrl || "",
        });

      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event data");
        navigate("/dashboard");
      } finally {
        setIsLoadingEvent(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id, navigate]);

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

    // Validate date is not in the past (allow current events)
    const selectedDate = new Date(`${date}T${time}`);
    const now = new Date();
    now.setHours(now.getHours() - 1); // Allow events starting within 1 hour
    
    if (selectedDate <= now) {
      toast.error("Event date and time cannot be in the past");
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
      const userId = localStorage.getItem("userId");

      // Create a proper date object
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      // Validate the date
      if (isNaN(eventDateTime.getTime())) {
        toast.error("Invalid date or time selected");
        setIsLoading(false);
        return;
      }

      // Create the update data object
      const updateData = {
        title: formData.title,
        description: formData.description,
        date: eventDateTime.toISOString(),
        time: formData.time,
        venue: formData.venue,
        type: formData.category,
        maxParticipants: parseInt(formData.maxParticipants),
        updatedBy: userId,
        registrationDeadline: eventDateTime.toISOString(),
      };

      // Only include image if a new one was uploaded
      if (formData.poster) {
        // For now, we'll use a placeholder. You can implement image upload later
        updateData.imageUrl = formData.currentImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
      }

      console.log("Sending update data:", updateData);

      // Make API call to update event
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();
      console.log("Update response:", responseData);

      if (response.ok) {
        console.log("Event updated successfully:", responseData);
        toast.success("Event updated successfully!");

        // Navigate back to dashboard or event details
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        console.error("Server error:", responseData);
        toast.error(responseData.message || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  // Get today's date for min date validation
  const today = new Date().toISOString().split("T")[0];

  if (isLoadingEvent) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>Loading Event...</h1>
              <p className={styles.subtitle}>Please wait while we load the event data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <button onClick={handleGoBack} className={styles.backButton}>
            <MdArrowBack size={20} />
            Back to Dashboard
          </button>

          <div className={styles.titleSection}>
            <h1 className={styles.title}>Edit Event</h1>
            <p className={styles.subtitle}>
              Update your event details
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

          {/* Max Participants */}
          <div className={styles.formGroup}>
            <label htmlFor="maxParticipants" className={styles.label}>
              <MdGroup size={18} />
              Max Participants *
            </label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Maximum number of participants"
              min="1"
              max="1000"
              required
            />
          </div>

          {/* Current Image Display */}
          {formData.currentImageUrl && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <MdImage size={18} />
                Current Event Poster
              </label>
              <div style={{ marginBottom: "1rem" }}>
                <img 
                  src={formData.currentImageUrl} 
                  alt="Current event poster" 
                  style={{ 
                    width: "200px", 
                    height: "120px", 
                    objectFit: "cover", 
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.12)"
                  }} 
                />
              </div>
            </div>
          )}

          {/* Poster Upload */}
          <div className={styles.formGroup}>
            <label htmlFor="poster" className={styles.label}>
              <MdImage size={18} />
              Update Event Poster (Optional)
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
                New image selected: {formData.poster.name}
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
                  Updating Event...
                </>
              ) : (
                <>
                  <MdSave size={20} />
                  Update Event
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className={styles.helpText}>
          <p>
            * Required fields. Only event creators can edit their events.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;