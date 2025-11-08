import React from "react";
import { MdSearch, MdClear } from "react-icons/md";
import styles from "./SearchRow.module.css";

const SearchRow = ({ search, setSearch, filter, setFilter }) => {
  const handleSearchChange = (e) => {
    try {
      const value = e.target.value;
      // Ensure we're always passing a string and handle null/undefined
      setSearch(typeof value === "string" ? value : "");
    } catch (error) {
      console.warn("Search input error:", error);
      setSearch("");
    }
  };

  const handleClearSearch = () => {
    try {
      setSearch("");
    } catch (error) {
      console.warn("Clear search error:", error);
    }
  };

  // Safely handle search value
  const safeSearchValue = React.useMemo(() => {
    if (search === null || search === undefined) return "";
    return typeof search === "string" ? search : String(search);
  }, [search]);

  return (
    <div className={styles.searchRow}>
      <div className={styles.searchContainer}>
        <MdSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search events, organizers, departments..."
          value={safeSearchValue}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        {safeSearchValue && safeSearchValue.length > 0 && (
          <button
            onClick={handleClearSearch}
            className={styles.clearButton}
            type="button"
            aria-label="Clear search"
          >
            <MdClear />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchRow;
