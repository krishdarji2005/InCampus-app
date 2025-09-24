import React from 'react';
import FlowingMenu from '../FlowingMenu/FlowingMenu';
import styles from './FlowingMenuSection.module.css';

const demoItems = [
  { link: '/events', text: 'Events', image: 'https://picsum.photos/600/400?random=1' },
  { link: '#', text: 'Clubs', image: 'https://picsum.photos/600/400?random=2' },
  { link: '#', text: 'Workshops', image: 'https://picsum.photos/600/400?random=3' },
  { link: '#', text: 'Activities', image: 'https://picsum.photos/600/400?random=4' }
];

const FlowingMenuSection = () => {
  return (
    <div className={styles.flowingMenuSection}>
      <FlowingMenu items={demoItems} />
    </div>
  );
};

export default FlowingMenuSection;