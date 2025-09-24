import React from 'react';
import Marquee from 'react-fast-marquee';
import styles from './CommitteLogosScroll.module.css';

const CommitteLogosScroll = () => {
  // Sample committee logos - you can replace these with actual committee logos
  const committeeLogos = [
    'https://s4ds.kjsieit.in/images/s4ds-white.png',
    'https://www.google.com/imgres?q=meta%20logo%20black%20and%20white&imgurl=https%3A%2F%2Fpngimg.com%2Fd%2Fmeta_PNG2.png&imgrefurl=https%3A%2F%2Fpngimg.com%2Fimage%2F110782&docid=C9rVVFiz8jl1BM&tbnid=HeE2B1qkz-q_qM&vet=12ahUKEwj13_iuxqOPAxW5TGwGHaivLZUQM3oECB8QAA..i&w=512&h=512&hcb=2&ved=2ahUKEwj13_iuxqOPAxW5TGwGHaivLZUQM3oECB8QAA',
    'https://nvidianews.nvidia.com/multimedia/corporate/nvidia-logos',
    'https://sc.kjsieit.in/Home/index.html',
    'https://s4ds.kjsieit.in/images/s4ds-white.png',
    'https://www.google.com/imgres?q=meta%20logo%20black%20and%20white&imgurl=https%3A%2F%2Fpngimg.com%2Fd%2Fmeta_PNG2.png&imgrefurl=https%3A%2F%2Fpngimg.com%2Fimage%2F110782&docid=C9rVVFiz8jl1BM&tbnid=HeE2B1qkz-q_qM&vet=12ahUKEwj13_iuxqOPAxW5TGwGHaivLZUQM3oECB8QAA..i&w=512&h=512&hcb=2&ved=2ahUKEwj13_iuxqOPAxW5TGwGHaivLZUQM3oECB8QAA',
    'https://nvidianews.nvidia.com/multimedia/corporate/nvidia-logos',
    'https://sc.kjsieit.in/Home/index.html',
    'https://s4ds.kjsieit.in/images/s4ds-white.png',
    'https://www.google.com/imgres?q=meta%20logo%20black%20and%20white&imgurl=https%3A%2F%2Fpngimg.com%2Fd%2Fmeta_PNG2.png&imgrefurl=https%3A%2F%2Fpngimg.com%2Fimage%2F110782&docid=C9rVVFiz8jl1BM&tbnid=HeE2B1qkz-q_qM&vet=12ahUKEwj13_iuxqOPAxW5TGwGHaivLZUQM3oECB8QAA..i&w=512&h=512&hcb=2&ved=2ahUKEwj13_iuxqOPAxW5TGwGHaivLZUQM3oECB8QAA',
    'https://nvidianews.nvidia.com/multimedia/corporate/nvidia-logos',
    'https://sc.kjsieit.in/Home/index.html',
  
   
  ];

  return (
    <div className={styles.committeeSection}>
      <h2 className={styles.heading}>Our Campus Committees</h2>
      <div className={styles.marqueeContainer}>
        <Marquee
          speed={28}
          gradient={true}
          gradientColor={[0, 0, 0]}
          gradientWidth={50}
        >
          {committeeLogos.map((logo, index) => (
            <div key={index} className={styles.logoItem}>
              <img 
                src={logo} 
                alt={`Committee ${index + 1}`}
                className={styles.logo}
              />
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default CommitteLogosScroll;
