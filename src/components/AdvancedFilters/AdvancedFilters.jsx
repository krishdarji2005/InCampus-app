import React, { useState } from 'react';
import styles from './AdvancedFilters.module.css';

const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  sortBy, 
  onSortChange,
  onClearFilters 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = ['All', 'Academic', 'Professional', 'Social', 'Sports'];
  const formats = ['All', 'In-person', 'Virtual', 'Hybrid'];
  const priceRanges = ['All', 'Free', 'Paid'];
  const departments = [
    'All', 'Computer Science', 'Marketing Club', 'English Department', 
    'Career Services', 'Environmental Engineering', 'Entrepreneurship Club',
    'Design Club', 'Startup Incubator', 'Programming Club', 'Design Department',
    'Photography Club', 'Cybersecurity Club', 'Women in Tech Society',
    'Game Development Club', 'Music & Tech Club', 'Chess Club', 'Robotics Club',
    'TEDxYouth Club'
  ];
  const timeSlots = ['All', 'Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-12AM)'];

  const sortOptions = [
    { value: 'date-asc', label: 'Date (Earliest First)' },
    { value: 'date-desc', label: 'Date (Latest First)' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'recent', label: 'Recently Added' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ];

  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const handleDateRangeChange = (type, value) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: value
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.format !== 'All') count++;
    if (filters.price !== 'All') count++;
    if (filters.department !== 'All') count++;
    if (filters.timeSlot !== 'All') count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersHeader}>
        <div className={styles.filtersTitle}>
          <h3>Filters & Sort</h3>
          {getActiveFiltersCount() > 0 && (
            <span className={styles.activeFiltersCount}>
              {getActiveFiltersCount()} active
            </span>
          )}
        </div>
        <div className={styles.filtersActions}>
          <button 
            className={styles.clearButton}
            onClick={onClearFilters}
            disabled={getActiveFiltersCount() === 0}
          >
            Clear All
          </button>
          <button 
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : 'More'} Filters
          </button>
        </div>
      </div>

      <div className={styles.quickFilters}>
        <div className={styles.filterGroup}>
          <label>Category</label>
          <div className={styles.filterChips}>
            {categories.map(category => (
              <button
                key={category}
                className={`${styles.filterChip} ${
                  filters.category === category ? styles.active : ''
                }`}
                onClick={() => handleFilterChange('category', category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label>Format</label>
          <div className={styles.filterChips}>
            {formats.map(format => (
              <button
                key={format}
                className={`${styles.filterChip} ${
                  filters.format === format ? styles.active : ''
                }`}
                onClick={() => handleFilterChange('format', format)}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sortGroup}>
          <label>Sort by</label>
          <select 
            value={sortBy} 
            onChange={(e) => onSortChange(e.target.value)}
            className={styles.sortSelect}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.advancedFilters}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Price</label>
              <div className={styles.filterChips}>
                {priceRanges.map(price => (
                  <button
                    key={price}
                    className={`${styles.filterChip} ${
                      filters.price === price ? styles.active : ''
                    }`}
                    onClick={() => handleFilterChange('price', price)}
                  >
                    {price}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Time of Day</label>
              <div className={styles.filterChips}>
                {timeSlots.map(timeSlot => (
                  <button
                    key={timeSlot}
                    className={`${styles.filterChip} ${
                      filters.timeSlot === timeSlot ? styles.active : ''
                    }`}
                    onClick={() => handleFilterChange('timeSlot', timeSlot)}
                  >
                    {timeSlot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Department/Organization</label>
              <select 
                value={filters.department} 
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className={styles.filterSelect}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Date Range</label>
              <div className={styles.dateRange}>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className={styles.dateInput}
                  placeholder="Start date"
                />
                <span className={styles.dateSeparator}>to</span>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className={styles.dateInput}
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
