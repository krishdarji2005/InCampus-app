import React, { useState, useEffect, useRef } from "react";
import styles from "./CompactSearchBar.module.css";

const CompactSearchBar = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  onClearFilters,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const searchBarRef = useRef(null);
  const modalRef = useRef(null); // Add ref for modal

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideSearchBar =
        searchBarRef.current && searchBarRef.current.contains(event.target);
      const isClickInsideModal =
        modalRef.current && modalRef.current.contains(event.target);

      // Don't close if click is inside search bar or modal
      if (!isClickInsideSearchBar && !isClickInsideModal) {
        setActiveDropdown(null);
      }
    };

    // Only add listener when dropdown is active
    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside); // Add touch support
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [activeDropdown]); // Add activeDropdown as dependency

  const categories = ["All", "Academic", "Professional", "Social", "Sports"];
  const formats = ["All", "In-person", "Virtual", "Hybrid"];
  const priceRanges = ["All", "Free", "Paid"];
  const departments = [
    "All",
    "Computer Science",
    "Marketing Club",
    "English Department",
    "Career Services",
    "Environmental Engineering",
    "Entrepreneurship Club",
    "Design Club",
    "Startup Incubator",
    "Programming Club",
    "Design Department",
    "Photography Club",
    "Cybersecurity Club",
    "Women in Tech Society",
    "Game Development Club",
    "Music & Tech Club",
    "Chess Club",
    "Robotics Club",
    "TEDxYouth Club",
  ];
  const timeSlots = [
    "All",
    "Morning (6AM-12PM)",
    "Afternoon (12PM-6PM)",
    "Evening (6PM-12AM)",
  ];

  const sortOptions = [
    { value: "date-asc", label: "Date (Earliest First)" },
    { value: "date-desc", label: "Date (Latest First)" },
    { value: "popularity", label: "Most Popular" },
    { value: "recent", label: "Recently Added" },
    { value: "alphabetical", label: "Alphabetical" },
  ];

  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value,
    });
    // Only close dropdown for simple filters, not the "more" modal
    if (activeDropdown !== "more") {
      setActiveDropdown(null);
    }
  };

  const handleDateRangeChange = (type, value) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: value,
      },
    });
    // Don't close modal when changing date range
  };

  const handleSortChange = (value) => {
    onSortChange(value);
    // Don't close the more filters modal when sort changes
  };

  // Enhanced section click handler
  const handleSectionClick = (sectionType, event) => {
    event.stopPropagation(); // Prevent event bubbling
    setActiveDropdown(activeDropdown === sectionType ? null : sectionType);
  };

  // Enhanced modal close handler
  const closeModal = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setActiveDropdown(null);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== "All") count++;
    if (filters.format !== "All") count++;
    if (filters.price !== "All") count++;
    if (filters.department !== "All") count++;
    if (filters.timeSlot !== "All") count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  };

  const formatDateRange = () => {
    if (!filters.dateRange.start && !filters.dateRange.end) {
      return "Add dates";
    }
    if (filters.dateRange.start && filters.dateRange.end) {
      const start = new Date(filters.dateRange.start).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      );
      const end = new Date(filters.dateRange.end).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${start} - ${end}`;
    }
    if (filters.dateRange.start) {
      return new Date(filters.dateRange.start).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    return "Add dates";
  };

  const renderDropdown = (type, options, currentValue, placeholder) => (
    <div className={styles.dropdown}>
      {options.map((option) => (
        <button
          key={option}
          className={`${styles.dropdownItem} ${
            currentValue === option ? styles.active : ""
          }`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            handleFilterChange(type, option);
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const renderMoreFiltersModal = () => (
    <div className={styles.moreFiltersModal} ref={modalRef}>
      <div className={styles.modalHeader}>
        <h3>More Filters</h3>
        <button
          className={styles.closeButton}
          onClick={closeModal}
          type="button"
        >
          ×
        </button>
      </div>

      <div className={styles.modalContent}>
        <div className={styles.filterSection}>
          <h4>Sort by</h4>
          <select
            value={sortBy}
            onChange={(e) => {
              e.stopPropagation();
              handleSortChange(e.target.value);
            }}
            className={styles.sortSelect}
            onClick={(e) => e.stopPropagation()}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterSection}>
          <h4>Price</h4>
          <div className={styles.chipGroup}>
            {priceRanges.map((price) => (
              <button
                key={price}
                className={`${styles.chip} ${
                  filters.price === price ? styles.active : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange("price", price);
                }}
                type="button"
              >
                {price}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h4>Time of Day</h4>
          <div className={styles.chipGroup}>
            {timeSlots.map((timeSlot) => (
              <button
                key={timeSlot}
                className={`${styles.chip} ${
                  filters.timeSlot === timeSlot ? styles.active : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFilterChange("timeSlot", timeSlot);
                }}
                type="button"
              >
                {timeSlot}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h4>Department/Organization</h4>
          <select
            value={filters.department}
            onChange={(e) => {
              e.stopPropagation();
              handleFilterChange("department", e.target.value);
            }}
            className={styles.filterSelect}
            onClick={(e) => e.stopPropagation()}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterSection}>
          <h4>Date Range</h4>
          <div className={styles.dateRange}>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => {
                e.stopPropagation();
                handleDateRangeChange("start", e.target.value);
              }}
              className={styles.dateInput}
              placeholder="Start date"
              onClick={(e) => e.stopPropagation()}
            />
            <span className={styles.dateSeparator}>to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => {
                e.stopPropagation();
                handleDateRangeChange("end", e.target.value);
              }}
              className={styles.dateInput}
              placeholder="End date"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button
          className={styles.clearButton}
          onClick={(e) => {
            e.stopPropagation();
            onClearFilters();
          }}
          type="button"
        >
          Clear All
        </button>
        <button
          className={styles.applyButton}
          onClick={closeModal}
          type="button"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.searchBar} ref={searchBarRef}>
      {/* Category Section */}
      <div
        className={`${styles.section} ${
          activeDropdown === "category" ? styles.active : ""
        }`}
        onClick={(e) => handleSectionClick("category", e)}
      >
        <div className={styles.sectionContent}>
          <span className={styles.label}>Category</span>
          <span className={styles.value}>
            {filters.category === "All" ? "All Categories" : filters.category}
          </span>
          <span className={styles.arrow}>▼</span>
        </div>
        {activeDropdown === "category" &&
          renderDropdown(
            "category",
            categories,
            filters.category,
            "All Categories"
          )}
      </div>

      {/* Format Section */}
      <div
        className={`${styles.section} ${
          activeDropdown === "format" ? styles.active : ""
        }`}
        onClick={(e) => handleSectionClick("format", e)}
      >
        <div className={styles.sectionContent}>
          <span className={styles.label}>Format</span>
          <span className={styles.value}>
            {filters.format === "All" ? "Any Format" : filters.format}
          </span>
          <span className={styles.arrow}>▼</span>
        </div>
        {activeDropdown === "format" &&
          renderDropdown("format", formats, filters.format, "Any Format")}
      </div>

      {/* More Filters Section */}
      <div
        className={`${styles.section} ${
          activeDropdown === "more" ? styles.active : ""
        }`}
        onClick={(e) => handleSectionClick("more", e)}
      >
        <div className={styles.sectionContent}>
          <span className={styles.label}>More Filters</span>
          <span className={styles.value}>
            {getActiveFiltersCount() > 0
              ? `${getActiveFiltersCount()} filters`
              : "Filters"}
          </span>
          <span className={styles.arrow}>▼</span>
        </div>
        {activeDropdown === "more" && renderMoreFiltersModal()}
      </div>
    </div>
  );
};

export default CompactSearchBar;
