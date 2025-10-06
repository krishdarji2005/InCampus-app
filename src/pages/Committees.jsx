import React, { useState, useEffect } from 'react';
import { MdSearch, MdPeople, MdEvent, MdInfo, MdFavoriteBorder, MdFavorite, MdClose, MdArrowForward } from 'react-icons/md';
import styles from './Committees.module.css';
import { committees, categories, tags } from '../data/committees';

const Committees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filteredCommittees, setFilteredCommittees] = useState(committees);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter committees based on search, category, and tags
  useEffect(() => {
    let filtered = committees;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(committee => 
        committee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        committee.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter(committee => committee.category === activeCategory);
    }
    
    // Filter by tags
    if (activeTags.length > 0) {
      filtered = filtered.filter(committee => 
        committee.tags.some(tag => activeTags.includes(tag))
      );
    }
    
    setFilteredCommittees(filtered);
  }, [searchTerm, activeCategory, activeTags]);

  // Toggle category filter
  const handleCategoryClick = (category) => {
    setActiveCategory(activeCategory === category ? '' : category);
  };

  // Toggle tag filter
  const handleTagClick = (tag) => {
    setActiveTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) 
        : [...prevTags, tag]
    );
  };

  // Toggle favorite
  const handleFavoriteToggle = (e, committeeId) => {
    e.stopPropagation();
    setFavorites(prevFavorites => 
      prevFavorites.includes(committeeId)
        ? prevFavorites.filter(id => id !== committeeId)
        : [...prevFavorites, committeeId]
    );
  };

  // Open committee details modal
  const handleCommitteeClick = (committee) => {
    setSelectedCommittee(committee);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  // Close committee details modal
  const handleCloseModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  // Scroll to committees section
  const scrollToCommittees = () => {
    document.getElementById('committees-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Explore Committees</h1>
        <p className={styles.heroSubtitle}>
          Discover, Join, and Contribute to Campus Life. Find the perfect committee that matches your interests and skills.
        </p>
        <button className={styles.ctaButton} onClick={scrollToCommittees}>
          Find Your Committee <MdArrowForward />
        </button>
      </section>

      <div className={styles.container}>
        {/* Filters Section */}
        <section className={styles.filtersSection} id="committees-section">
          <div className={styles.searchContainer}>
            <MdSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search committees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.filterTags}>
            {categories.map(category => (
              <button
                key={category.id}
                className={`${styles.filterTag} ${activeCategory === category.name ? styles.filterTagActive : ''}`}
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </section>

        {/* Committee Cards Grid */}
        <section className={styles.committeesGrid}>
          {filteredCommittees.length > 0 ? (
            filteredCommittees.map(committee => (
              <div 
                key={committee.id} 
                className={styles.committeeCard}
                onClick={() => handleCommitteeClick(committee)}
              >
                <div className={styles.cardHeader}>
                  <img src={committee.logo} alt={committee.name} className={styles.cardLogo} />
                  <span className={styles.cardCategory}>{committee.category}</span>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{committee.name}</h3>
                  <p className={styles.cardDescription}>{committee.shortDescription}</p>
                  <div className={styles.cardTags}>
                    {committee.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className={styles.cardTag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.memberCount}>
                    <MdPeople /> {committee.memberCount} members
                  </div>
                  <button 
                    className={`${styles.favoriteButton} ${favorites.includes(committee.id) ? styles.favoriteActive : ''}`}
                    onClick={(e) => handleFavoriteToggle(e, committee.id)}
                  >
                    {favorites.includes(committee.id) ? <MdFavorite /> : <MdFavoriteBorder />}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#b0b0b0' }}>
              No committees found matching your criteria. Try adjusting your filters.
            </p>
          )}
        </section>
      </div>

      {/* Committee Details Modal */}
      {showModal && selectedCommittee && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseModal}>
              <MdClose />
            </button>
            
            <div className={styles.modalHeader}>
              <img src={selectedCommittee.logo} alt={selectedCommittee.name} className={styles.modalLogo} />
              <div className={styles.modalHeaderContent}>
                <h2 className={styles.modalTitle}>{selectedCommittee.name}</h2>
                <span className={styles.modalCategory}>{selectedCommittee.category}</span>
                <p className={styles.modalEstablished}>Established: {selectedCommittee.established}</p>
              </div>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>
                  <MdInfo /> About
                </h3>
                <p className={styles.modalDescription}>{selectedCommittee.fullDescription}</p>
                <div className={styles.modalTags}>
                  {selectedCommittee.tags.map((tag, index) => (
                    <span key={index} className={styles.modalTag}>{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>
                  <MdEvent /> Past Events
                </h3>
                <div className={styles.eventsList}>
                  {selectedCommittee.pastEvents.map(event => (
                    <div key={event.id} className={styles.eventItem}>
                      <h4 className={styles.eventName}>{event.name}</h4>
                      <p className={styles.eventDate}>{event.date}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>
                  <MdPeople /> Core Members
                </h3>
                <div className={styles.membersGrid}>
                  {selectedCommittee.coreMembers.map(member => (
                    <div key={member.id} className={styles.memberCard}>
                      <img src={member.photo} alt={member.name} className={styles.memberPhoto} />
                      <h4 className={styles.memberName}>{member.name}</h4>
                      <p className={styles.memberRole}>{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button className={styles.joinButton}>
                Join Committee <MdArrowForward />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Committees;