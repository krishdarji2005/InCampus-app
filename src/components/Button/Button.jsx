import React from 'react';
import styled from 'styled-components';

const Button = ({ 
  initialText = "Get Started", 
  hoverText = "Go Now",
  width = 220,
  height = 80,
  isLoading = false,
  isError = false,
  protectedRoute = false,
  onProtectedClick,
  ...rest
}) => {
  // Split text into individual characters for animation
  const renderText = (text, stateClass, startIndex = 1) => {
    return text.split('').map((char, index) => (
      <span 
        key={index} 
        data-label={char} 
        style={{'--i': startIndex + index}}
      >
        {char}
      </span>
    ));
  };

  // Calculate positioning based on text length
  const getHoverTextPosition = () => {
    const basePosition = 80; // Base left position
    const charWidth = 12; // Approximate character width
    const initialLength = initialText.length;
    const hoverLength = hoverText.length;
    
    // Center the hover text relative to the initial text
    const offset = (initialLength - hoverLength) * charWidth / 2;
    return basePosition + offset;
  };

  if (isLoading) return <StyledWrapper width={width} height={height}><button className="button">Loading...</button></StyledWrapper>;
  if (isError) return <StyledWrapper width={width} height={height}><button className="button">Error</button></StyledWrapper>;

  return (
    <StyledWrapper width={width} height={height} hoverTextLeft={getHoverTextPosition()}>
      <button
        className="button"
        onClick={protectedRoute ? onProtectedClick : rest.onClick}
        {...rest}
      >
        <div className="bg" />
      
        <div className="wrap">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 221 42" height={42} width={221} className="path">
            <path strokeLinecap="round" strokeWidth={3} d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855" />
          </svg>
          <div className="outline" />
          <div className="content">
            <span className="char state-1">
              {renderText(initialText, "state-1")}
            </span>
            <div className="icon">
              <div />
            </div>
            <span className="char state-2">
              {renderText(hoverText, "state-2")}
            </span>
          </div>
        </div>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Reset any inherited styles */
  * {
    box-sizing: border-box;
  }

  .button {
    --white: #ffe7ff;
    --purple-100: rgb(177, 177, 253);
    --purple-200: rgb(144, 144, 255);
    --purple-300: rgb(137, 151, 242);
    --purple-400: rgb(72, 38, 226);
    --purple-500: rgb(43, 47, 131);
    --radius: 18px;

    border-radius: var(--radius);
    outline: none;
    cursor: pointer;
    font-size: 23px;
    font-family: Arial, sans-serif;
    background: transparent !important; /* Force transparent background */
    letter-spacing: -1px;
    border: 0 !important; /* Force no border */
    position: relative;
    width: ${props => props.width}px;
    height: ${props => props.height}px;
    transform: rotate(353deg) skewX(4deg);
    padding: 0;
    margin: 0;
    /* Prevent any background bleeding */
    isolation: isolate;
    margin-top:2rem;
    margin-left:2rem;
  }

  /* Fix for the background bleeding issue */
  .button::before,
  .button::after {
    display: none !important;
  }

  .bg {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    filter: blur(1px);
    pointer-events: none;
  }

  .bg::before,
  .bg::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: calc(var(--radius) * 1.1);
    background: var(--purple-500);
  }

  .bg::before {
    filter: blur(5px);
    transition: all 0.3s ease;
    box-shadow:
      -7px 6px 0 0 rgb(115 75 155 / 40%),
      -14px 12px 0 0 rgb(115 75 155 / 30%),
      -21px 18px 4px 0 rgb(115 75 155 / 25%),
      -28px 24px 8px 0 rgb(115 75 155 / 15%),
      -35px 30px 12px 0 rgb(115 75 155 / 12%),
      -42px 36px 16px 0 rgb(115 75 155 / 8%),
      -56px 42px 20px 0 rgb(115 75 155 / 5%);
  }

  .wrap {
    border-radius: inherit;
    overflow: hidden;
    height: 100%;
    transform: translate(6px, -6px);
    padding: 3px;
    background: linear-gradient(
      to bottom,
      var(--purple-100) 0%,
      var(--purple-400) 100%
    );
    position: relative;
    transition: all 0.3s ease;
    /* Fix border artifacts */
    border: none;
    outline: none;
  }

  .outline {
    position: absolute;
    overflow: hidden;
    inset: 0;
    opacity: 0;
    outline: none;
    border-radius: inherit;
    transition: all 0.4s ease;
    border: none; /* Remove any border */
  }

  .outline::before {
    content: "";
    position: absolute;
    inset: 2px;
    width: 120px;
    height: 300px;
    margin: auto;
    background: linear-gradient(
      to right,
      transparent 0%,
      white 50%,
      transparent 100%
    );
    animation: spin 3s linear infinite;
    animation-play-state: paused;
  }

  .content {
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    position: relative;
    height: 100%;
    gap: 16px;
    border-radius: calc(var(--radius) * 0.85);
    font-weight: 600;
    transition: all 0.3s ease;
    background: linear-gradient(
      to bottom,
      var(--purple-300) 0%,
      var(--purple-400) 100%
    );
    box-shadow:
      inset -2px 12px 11px -5px var(--purple-200),
      inset 1px -3px 11px 0px rgb(0 0 0 / 35%);
    /* Remove any borders that might cause artifacts */
    border: none;
    outline: none;
  }

  .content::before {
    content: "";
    inset: 0;
    position: absolute;
    z-index: 10;
    width: 80%;
    top: 45%;
    bottom: 35%;
    opacity: 0.7;
    margin: auto;
    background: linear-gradient(to bottom, transparent, var(--purple-400));
    filter: brightness(1.3) blur(5px);
  }

  .char {
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .char span {
    display: block;
    color: transparent;
    position: relative;
  }
  
  .char.state-1 span {
    animation: charAppear 1.2s ease backwards calc(var(--i) * 0.03s);
  }

  .char.state-1 span::before,
  .char span::after {
    content: attr(data-label);
    position: absolute;
    color: var(--white);
    text-shadow: -1px 1px 2px var(--purple-500);
    left: 0;
  }

  .char span::before {
    opacity: 0;
    transform: translateY(-100%);
  }

  .char.state-2 {
    position: absolute;
    left: ${props => props.hoverTextLeft}px;
  }

  .char.state-2 span::after {
    opacity: 1;
  }

  .icon {
    animation: resetArrow 0.8s cubic-bezier(0.7, -0.5, 0.3, 1.2) forwards;
    z-index: 10;
  }

  .icon div,
  .icon div::before,
  .icon div::after {
    height: 3px;
    border-radius: 1px;
    background-color: var(--white);
  }

  .icon div::before,
  .icon div::after {
    content: "";
    position: absolute;
    right: 0;
    transform-origin: center right;
    width: 14px;
    border-radius: 15px;
    transition: all 0.3s ease;
  }

  .icon div {
    position: relative;
    width: 24px;
    box-shadow: -2px 2px 5px var(--purple-400);
    transform: scale(0.9);
    background: linear-gradient(to bottom, var(--white), var(--purple-100));
    animation: swingArrow 1s ease-in-out infinite;
    animation-play-state: paused;
  }

  .icon div::before {
    transform: rotate(44deg);
    top: 1px;
    box-shadow: 1px -2px 3px -1px var(--purple-400);
    animation: rotateArrowLine 1s linear infinite;
    animation-play-state: paused;
  }

  .icon div::after {
    bottom: 1px;
    transform: rotate(316deg);
    box-shadow: -2px 2px 3px 0 var(--purple-400);
    background: linear-gradient(200deg, var(--white), var(--purple-100));
    animation: rotateArrowLine2 1s linear infinite;
    animation-play-state: paused;
  }

  .path {
    position: absolute;
    z-index: 12;
    bottom: 0;
    left: 0;
    right: 0;
    stroke-dasharray: 150 480;
    stroke-dashoffset: 150;
    pointer-events: none;
  }



  /** HOVER STATES */
  .button:hover .char.state-1 span::before {
    animation: charAppear 0.7s ease calc(var(--i) * 0.03s);
  }

  .button:hover .char.state-1 span::after {
    opacity: 1;
    animation: charDisappear 0.7s ease calc(var(--i) * 0.03s);
  }

  .button:hover .wrap {
    transform: translate(8px, -8px);
  }

  .button:hover .outline {
    opacity: 1;
  }

  .button:hover .outline::before,
  .button:hover .icon div::before,
  .button:hover .icon div::after,
  .button:hover .icon div {
    animation-play-state: running;
  }

  /** ACTIVE STATES */
  .button:active .bg::before {
    filter: blur(5px);
    opacity: 0.7;
    box-shadow:
      -7px 6px 0 0 rgb(115 75 155 / 40%),
      -14px 12px 0 0 rgb(115 75 155 / 25%),
      -21px 18px 4px 0 rgb(115 75 155 / 15%);
  }

  .button:active .content {
    box-shadow:
      inset -1px 12px 8px -5px rgba(71, 0, 137, 0.4),
      inset 0px -3px 8px 0px var(--purple-200);
  }

  .button:active .outline {
    opacity: 0;
  }

  .button:active .wrap {
    transform: translate(3px, -3px);
  }

 

  /** FOCUS STATES */
  .button:focus .path {
    animation: path 1.6s ease forwards 0.2s;
  }

  .button:focus .icon {
    animation: arrow 1s cubic-bezier(0.7, -0.5, 0.3, 1.5) forwards;
  }

  .char.state-2 span::after,
  .button:focus .char.state-1 span {
    animation: charDisappear 0.5s ease forwards calc(var(--i) * 0.03s);
  }

  .button:focus .char.state-2 span::after {
    animation: charAppear 1s ease backwards calc(var(--i) * 0.03s);
  }

  /** ANIMATIONS */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes charAppear {
    0% {
      transform: translateY(50%);
      opacity: 0;
      filter: blur(20px);
    }
    20% {
      transform: translateY(70%);
      opacity: 1;
    }
    50% {
      transform: translateY(-15%);
      opacity: 1;
      filter: blur(0);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes charDisappear {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(-70%);
      opacity: 0;
      filter: blur(3px);
    }
  }

  @keyframes arrow {
    0% { opacity: 1; }
    50% {
      transform: translateX(60px);
      opacity: 0;
    }
    51% {
      transform: translateX(-200px);
      opacity: 0;
    }
    100% {
      transform: translateX(-128px);
      opacity: 1;
    }
  }

  @keyframes swingArrow {
    50% { transform: translateX(5px) scale(0.9); }
  }

  @keyframes rotateArrowLine {
    50% { transform: rotate(30deg); }
    80% { transform: rotate(55deg); }
  }

  @keyframes rotateArrowLine2 {
    50% { transform: rotate(330deg); }
    80% { transform: rotate(300deg); }
  }

  @keyframes resetArrow {
    0% { transform: translateX(-128px); }
    100% { transform: translateX(0); }
  }

  @keyframes path {
    from { stroke: white; }
    to {
      stroke-dashoffset: -480;
      stroke: rgb(198, 235, 254);
    }
  }


`;

export default Button;