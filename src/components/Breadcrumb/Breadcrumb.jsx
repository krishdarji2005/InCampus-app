import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

const Breadcrumb = () => {
  const location = useLocation();
  
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const items = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      let label = segment;
      if (segment === 'events') {
        label = 'Events';
      } else if (segment === 'profile') {
        label = 'Profile';
      } else if (!isNaN(segment)) {
        // If it's a number, it's likely an event ID
        label = 'Event Details';
      } else {
        // Capitalize first letter
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      items.push({
        label,
        path: currentPath,
        isLast: index === pathSegments.length - 1
      });
    });
    
    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className={styles.breadcrumbItem}>
            {item.isLast ? (
              <span className={styles.currentPage} aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className={styles.breadcrumbLink}>
                {item.label}
              </Link>
            )}
            {!item.isLast && (
              <span className={styles.separator} aria-hidden="true">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
