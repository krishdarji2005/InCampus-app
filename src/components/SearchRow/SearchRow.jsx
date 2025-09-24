import React from 'react'
import styles from "./SearchRow.module.css";
const SearchRow = ({ search, setSearch, filter, setFilter }) =>{

    return(
    <>
    <div className={styles.searchRow}>
        <input type="text" placeholder="Search Events Here" 
        value={search} onChange={(e)=>setSearch(e.target.value)}
        className={styles.searchInput}
        />
        
    </div>
    
    </>
)
}

export default SearchRow;