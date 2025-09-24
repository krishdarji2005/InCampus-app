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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        // setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    // Only close dropdown if it's not the "more" filters modal
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
  };
  const handleSortChange = (value) => {
    onSortChange(value);
    // Don't close the more filters modal when sort changes
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
          onClick={() => handleFilterChange(type, option)}
        >
          {option}
        </button>
      ))}
    </div>
  );

  const renderMoreFiltersModal = () => (
    <div className={styles.moreFiltersModal}>
      <div className={styles.modalHeader}>
        <h3>More Filters</h3>
        <button
          className={styles.closeButton}
          onClick={() => setActiveDropdown(null)}
        >
          ×
        </button>
      </div>

      <div className={styles.modalContent}>
        <div className={styles.filterSection}>
          <h4>Sort by</h4>
          <select
            value={sortBy}
            onChange={(e) => ohandleSortChange(e.target.value)}
            className={styles.sortSelect}
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
                onClick={() => handleFilterChange("price", price)}
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
                onClick={() => handleFilterChange("timeSlot", timeSlot)}
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
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className={styles.filterSelect}
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
              onChange={(e) => handleDateRangeChange("start", e.target.value)}
              className={styles.dateInput}
              placeholder="Start date"
            />
            <span className={styles.dateSeparator}>to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleDateRangeChange("end", e.target.value)}
              className={styles.dateInput}
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.clearButton} onClick={onClearFilters}>
          Clear All
        </button>
        <button
          className={styles.applyButton}
          onClick={() => setActiveDropdown(null)}
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
        onClick={() =>
          setActiveDropdown(activeDropdown === "category" ? null : "category")
        }
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
        onClick={() =>
          setActiveDropdown(activeDropdown === "format" ? null : "format")
        }
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

      {/* Date Range Section */}
      {/* <div
        className={`${styles.section} ${
          activeDropdown === "dateRange" ? styles.active : ""
        }`}
        onClick={() =>
          setActiveDropdown(activeDropdown === "dateRange" ? null : "dateRange")
        }
      >
        <div className={styles.sectionContent}>
          <span className={styles.label}>When</span>
          <span className={styles.value}>{formatDateRange()}</span>
          <span className={styles.arrow}>▼</span>
        </div>
        {activeDropdown === "dateRange" && (
          <div className={styles.dateRangeDropdown}>
            <div className={styles.dateRange}>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
                className={styles.dateInput}
                placeholder="Start date"
              />
              <span className={styles.dateSeparator}>to</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
                className={styles.dateInput}
                placeholder="End date"
              />
            </div>
          </div>
        )}
      </div> */}

      {/* More Filters Section */}
      <div
        className={`${styles.section} ${
          activeDropdown === "more" ? styles.active : ""
        }`}
        onClick={() =>
          setActiveDropdown(activeDropdown === "more" ? null : "more")
        }
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
