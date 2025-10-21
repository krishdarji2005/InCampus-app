import React, { useState } from 'react';
import { FaPlus, FaMinus, FaQuestionCircle } from 'react-icons/fa';
import styles from './FAQSection.module.css';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How do I register for campus events?",
      answer: "Simply browse available events on InCampus, click 'Register Now', verify your student ID, and you're all set! The entire process takes less than 2 minutes compared to traditional 30-minute paperwork."
    },
    {
      question: "Is event registration really free?",
      answer: "Yes! InCampus is completely free for students. We believe campus events should be accessible to everyone. No hidden fees, no subscription costs - just seamless event registration."
    },
    {
      question: "What if I need to cancel my registration?",
      answer: "You can cancel your registration up to 24 hours before the event through your InCampus dashboard. We'll automatically notify the event organizers and free up your spot for other students."
    },
    {
      question: "How does digital verification work?",
      answer: "Our AI-powered system instantly verifies your student credentials against your college database. No need to submit physical documents - just upload a clear photo of your student ID once during account setup."
    },
    {
      question: "Can I track my event history?",
      answer: "Absolutely! Your InCampus profile maintains a complete history of all events you've attended, certificates earned, and participation badges. Perfect for building your extracurricular portfolio."
    },
    {
      question: "What happens if an event gets cancelled?",
      answer: "You'll receive instant notifications via email and push notifications. If it's a paid event, refunds are processed automatically within 24 hours. We also suggest similar upcoming events you might be interested in."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className={styles.faqWrapper}>
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <FaQuestionCircle className={styles.headerIcon} />
            <h2 className={styles.title}>Frequently Asked Questions</h2>
            <p className={styles.subtitle}>
              Everything you need to know about InCampus event registration and management.
            </p>
          </div>

          <div className={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
                onClick={() => toggleFAQ(index)}
              >
                <div className={styles.faqQuestion}>
                  <h3>{faq.question}</h3>
                  <div className={styles.faqIcon}>
                    {openIndex === index ? <FaMinus /> : <FaPlus />}
                  </div>
                </div>
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.ctaSection}>
            <p>Still have questions?</p>
            <button className={styles.contactButton}>Contact Support</button>
          </div>
        </div>
      </section>
    </div>

  );
};

export default FAQSection;