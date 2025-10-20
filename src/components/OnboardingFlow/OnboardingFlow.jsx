import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './OnboardingFlow.module.css';
import { 
  FaGraduationCap, 
  FaUser, 
  FaPhone, 
  FaHeart, 
  FaLinkedin, 
  FaGithub, 
  FaGlobe,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaUserGraduate,
  FaIdCard
} from 'react-icons/fa';

const OnboardingFlow = ({ userId: propUserId, currentUser, onComplete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get userId from multiple sources
  const getUserId = () => {
    const fromProps = propUserId;
    const fromState = location.state?.userId;
    const fromLocalStorage = localStorage.getItem('userId');
    
    console.log('Getting userId from:', {
      fromProps,
      fromState, 
      fromLocalStorage
    });
    
    return fromProps || fromState || fromLocalStorage;
  };

  const [userId, setUserId] = useState(getUserId());
  
  const [formData, setFormData] = useState({
    department: '',
    year: '',
    phone: '',
    rollNumber: '',
    bio: '',
    interests: [],
    socialLinks: {
      linkedin: '',
      github: '',
      instagram: '',
      portfolio: ''
    }
  });

  // Check userId on component mount
  useEffect(() => {
    const currentUserId = getUserId();
    console.log('OnboardingFlow mounted, userId:', currentUserId);
    
    if (!currentUserId) {
      toast.error('User ID not found. Redirecting to profile page...');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } else {
      setUserId(currentUserId);
    }
  }, [navigate]);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Telecommunication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Artificial Intelligence & Data Science',
    'Computer Science & Engineering (AI & ML)',
    'Other'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Faculty'];

  const interestOptions = [
    'Technical', 'Cultural', 'Sports', 'Academic', 'Workshop',
    'Seminar', 'Competition', 'Social', 'Art & Craft', 'Music',
    'Dance', 'Literature', 'Entrepreneurship', 'Leadership'
  ];

  const steps = [
    {
      id: 1,
      title: 'Academic Information',
      description: 'Tell us about your academic background',
      icon: FaGraduationCap,
      color: '#8b5cf6'
    },
    {
      id: 2,
      title: 'Contact & Profile',
      description: 'How can we reach you?',
      icon: FaPhone,
      color: '#10b981'
    },
    {
      id: 3,
      title: 'Interests',
      description: 'What events are you interested in?',
      icon: FaHeart,
      color: '#f59e0b'
    },
    {
      id: 4,
      title: 'Social Links',
      description: 'Connect your social profiles',
      icon: FaUser,
      color: '#3b82f6'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.department || !formData.year) {
          toast.error('Please select your department and year');
          return false;
        }
        break;
      case 2:
        if (!formData.phone || formData.phone.length < 10) {
          toast.error('Please enter a valid phone number');
          return false;
        }
        break;
      case 3:
      case 4:
        // Optional steps, no validation required
        break;
      default:
        return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    if (!userId) {
      toast.error('User ID not found. Please go back to profile page.');
      navigate('/profile');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Submitting onboarding data:', {
        userId,
        formData
      });

      const response = await fetch(`http://localhost:5000/api/users/profile/${userId}/complete-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        toast.success('Profile setup completed successfully! 🎉');
        
        if (onComplete) {
          onComplete(data.user);
        }
        
        // Navigate back to profile page
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        const errorMessage = data.message || 'Failed to complete profile setup';
        const detailedErrors = data.errors ? data.errors.join(', ') : '';
        
        toast.error(`${errorMessage}${detailedErrors ? ': ' + detailedErrors : ''}`);
        console.error('Onboarding failed:', data);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    return ((currentStep - 1) / 4) * 100;
  };

  // Show loading if no userId
  if (!userId) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <h2>Setting up your profile...</h2>
          <p>Please wait while we prepare your onboarding experience.</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    const currentStepData = steps[currentStep - 1];
    const IconComponent = currentStepData.icon;

    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <div 
                className={styles.stepIcon}
                style={{ color: currentStepData.color }}
              >
                <IconComponent />
              </div>
              <h2>{currentStepData.title}</h2>
              <p>{currentStepData.description}</p>
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="department">
                  <FaUserGraduate className={styles.inputIcon} />
                  Department *
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select your department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="year">
                  <FaGraduationCap className={styles.inputIcon} />
                  Academic Year *
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Select your year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rollNumber">
                <FaIdCard className={styles.inputIcon} />
                Roll Number (Optional)
              </label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your roll number"
              />
              <small className={styles.helpText}>
                Your unique student identification number
              </small>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <div 
                className={styles.stepIcon}
                style={{ color: currentStepData.color }}
              >
                <IconComponent />
              </div>
              <h2>{currentStepData.title}</h2>
              <p>{currentStepData.description}</p>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="phone">
                <FaPhone className={styles.inputIcon} />
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="+91 9876543210"
                required
              />
              <small className={styles.helpText}>
                We'll use this to send you important event updates
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bio">
                <FaUser className={styles.inputIcon} />
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="Tell us a bit about yourself..."
                maxLength={500}
              />
              <div className={styles.characterCount}>
                <small>{formData.bio.length}/500 characters</small>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <div 
                className={styles.stepIcon}
                style={{ color: currentStepData.color }}
              >
                <IconComponent />
              </div>
              <h2>{currentStepData.title}</h2>
              <p>{currentStepData.description}</p>
            </div>
            
            <div className={styles.interestsContainer}>
              <div className={styles.interestsGrid}>
                {interestOptions.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    className={`${styles.interestTag} ${
                      formData.interests.includes(interest) ? styles.selected : ''
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    <span className={styles.interestText}>{interest}</span>
                    {formData.interests.includes(interest) && (
                      <FaCheckCircle className={styles.checkIcon} />
                    )}
                  </button>
                ))}
              </div>
              
              <div className={styles.selectedCount}>
                <span>{formData.interests.length} interests selected</span>
              </div>
            </div>
            
            <div className={styles.infoBox}>
              <p>
                💡 Select your interests to receive personalized event recommendations
                and stay updated on events that matter to you!
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <div 
                className={styles.stepIcon}
                style={{ color: currentStepData.color }}
              >
                <IconComponent />
              </div>
              <h2>{currentStepData.title}</h2>
              <p>{currentStepData.description}</p>
            </div>
            
            <div className={styles.socialLinksGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="linkedin">
                  <FaLinkedin className={styles.inputIcon} style={{ color: '#0077b5' }} />
                  LinkedIn
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
                  <FaGithub className={styles.inputIcon} style={{ color: '#333' }} />
                  GitHub
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
                  <FaGlobe className={styles.inputIcon} style={{ color: '#10b981' }} />
                  Portfolio Website
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

            <div className={styles.infoBox}>
              <p>
                🔗 Connect your social profiles to showcase your work and connect
                with other students and event organizers!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => navigate('/profile')}
            disabled={isLoading}
          >
            <FaArrowLeft />
            Back to Profile
          </button>
        </div>

        {/* Progress Steps */}
        <div className={styles.stepsContainer}>
          <h1 className={styles.mainTitle}>Complete Your Profile</h1>
          <p className={styles.subtitle}>
            Let's set up your profile to give you the best campus experience
          </p>
          
          <div className={styles.stepsIndicator}>
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const IconComponent = step.icon;
              
              return (
                <div key={step.id} className={styles.stepIndicator}>
                  <div className={styles.stepLine}>
                    <div 
                      className={`${styles.stepCircle} ${
                        isCompleted ? styles.completed : ''
                      } ${isCurrent ? styles.current : ''}`}
                      style={{ 
                        borderColor: isCurrent || isCompleted ? step.color : '#333',
                        backgroundColor: isCompleted ? step.color : 'transparent'
                      }}
                    >
                      {isCompleted ? (
                        <FaCheckCircle style={{ color: '#fff' }} />
                      ) : (
                        <IconComponent style={{ 
                          color: isCurrent ? step.color : '#666' 
                        }} />
                      )}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div 
                        className={`${styles.stepConnector} ${
                          isCompleted ? styles.completed : ''
                        }`}
                      />
                    )}
                  </div>
                  
                  <div className={styles.stepInfo}>
                    <span className={styles.stepTitle}>{step.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className={styles.card}>
          {/* Progress Bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
            <div className={styles.progressInfo}>
              <span className={styles.progressText}>
                Step {currentStep} of {steps.length}
              </span>
              <span className={styles.progressPercentage}>
                {Math.round(getCompletionPercentage())}% Complete
              </span>
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className={styles.navigation}>
            <div className={styles.buttonContainer}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className={styles.prevButton}
                  disabled={isLoading}
                >
                  <FaArrowLeft />
                  Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={styles.nextButton}
                  disabled={isLoading}
                >
                  Next
                  <FaArrowRight />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={styles.completeButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className={styles.spinner}></div>
                      Completing...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Complete Setup
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Skip Option for last step */}
            {currentStep === 4 && (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className={styles.skipButton}
                disabled={isLoading}
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;