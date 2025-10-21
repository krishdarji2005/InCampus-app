import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileCompletionChecker.module.css';
import { 
  FaExclamationTriangle, 
  FaUser, 
  FaGraduationCap, 
  FaPhone,
  FaArrowRight,
  FaEdit
} from 'react-icons/fa';

const ProfileCompletionChecker = ({ user, onClose, onContinue }) => {
  const navigate = useNavigate();

  // Add null/undefined check for user
  if (!user) {
    console.error('ProfileCompletionChecker: user prop is undefined');
    onClose && onClose();
    return null;
  }

  const getRequiredFields = () => {
    const requiredFields = [
      { field: 'name', label: 'Full Name', icon: FaUser, value: user.name || '' },
      { field: 'phone', label: 'Phone Number', icon: FaPhone, value: user.phone || '' },
      { field: 'department', label: 'Department', icon: FaGraduationCap, value: user.department || '' },
      { field: 'year', label: 'Academic Year', icon: FaGraduationCap, value: user.year || '' }
    ];

    return requiredFields.map(field => ({
      ...field,
      isComplete: field.value && field.value.toString().trim().length > 0
    }));
  };

  const requiredFields = getRequiredFields();
  const incompleteFields = requiredFields.filter(field => !field.isComplete);
  const completionPercentage = Math.round(((requiredFields.length - incompleteFields.length) / requiredFields.length) * 100);
  const isProfileComplete = incompleteFields.length === 0;

  const handleCompleteProfile = () => {
    navigate('/profile');
    onClose && onClose();
  };

  const handleEditProfile = () => {
    onContinue && onContinue(); // This will open the edit profile modal
  };

  const handleCancel = () => {
    onClose && onClose();
  };

  if (isProfileComplete) {
    return null; // Don't show if profile is complete
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <FaExclamationTriangle />
          </div>
          <h2>Complete Your Profile</h2>
          <p>Please complete your profile to register for events</p>
        </div>

        <div className={styles.content}>
          <div className={styles.progressSection}>
            <div className={styles.progressInfo}>
              <span className={styles.progressLabel}>Profile Completion</span>
              <span className={styles.progressPercentage}>{completionPercentage}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className={styles.fieldsSection}>
            <h3>Required Information</h3>
            <div className={styles.fieldsList}>
              {requiredFields.map((field) => {
                const IconComponent = field.icon;
                return (
                  <div 
                    key={field.field}
                    className={`${styles.fieldItem} ${field.isComplete ? styles.complete : styles.incomplete}`}
                  >
                    <div className={styles.fieldIcon}>
                      <IconComponent />
                    </div>
                    <div className={styles.fieldContent}>
                      <span className={styles.fieldLabel}>{field.label}</span>
                      <span className={styles.fieldStatus}>
                        {field.isComplete ? (
                          <span className={styles.statusComplete}>✓ Complete</span>
                        ) : (
                          <span className={styles.statusIncomplete}>Required</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {incompleteFields.length > 0 && (
            <div className={styles.missingFields}>
              <h4>Missing Information:</h4>
              <ul>
                {incompleteFields.map(field => (
                  <li key={field.field}>{field.label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className={styles.editButton}
            onClick={handleEditProfile}
          >
            <FaEdit />
            Quick Edit
          </button>
          <button 
            className={styles.completeButton}
            onClick={handleCompleteProfile}
          >
            <FaArrowRight />
            Go to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionChecker;