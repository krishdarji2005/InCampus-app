import React, { useState } from 'react';
import styles from './EventFeedback.module.css';

const EventFeedback = ({ eventId, isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save feedback to localStorage (in real app, send to backend)
    const existingFeedback = JSON.parse(localStorage.getItem('eventFeedback') || '{}');
    existingFeedback[eventId] = {
      rating,
      feedback,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('eventFeedback', JSON.stringify(existingFeedback));

    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setRating(0);
    setFeedback('');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Event Feedback</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.content}>
            <div className={styles.section}>
              <h4>How would you rate this event?</h4>
              <div className={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.star} ${star <= rating ? styles.active : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className={styles.ratingText}>
                {rating === 0 && 'Click to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </div>
            </div>

            <div className={styles.section}>
              <h4>Share your experience</h4>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience at this event. What did you like? What could be improved?"
                className={styles.feedbackTextarea}
                rows={4}
              />
            </div>

            <div className={styles.section}>
              <h4>Quick feedback</h4>
              <div className={styles.quickFeedback}>
                {[
                  'Great speakers',
                  'Well organized',
                  'Good networking',
                  'Informative content',
                  'Friendly atmosphere',
                  'Could be longer',
                  'Better venue needed',
                  'More interactive'
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`${styles.quickFeedbackButton} ${
                      feedback.toLowerCase().includes(item.toLowerCase()) ? styles.selected : ''
                    }`}
                    onClick={() => {
                      if (feedback.toLowerCase().includes(item.toLowerCase())) {
                        setFeedback(feedback.replace(new RegExp(item, 'gi'), '').trim());
                      } else {
                        setFeedback(prev => prev ? `${prev}, ${item}` : item);
                      }
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFeedback;
