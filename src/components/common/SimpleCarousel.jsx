import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './SimpleCarousel.css';

const SimpleCarousel = ({ children, show = 2, autoplay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const items = React.Children.toArray(children);
  const itemsCount = items.length;
  const showCount = Math.min(show, itemsCount);
  
  // Handle autoplay
  useEffect(() => {
    if (!autoplay || paused || itemsCount <= showCount) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % (itemsCount - showCount + 1));
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoplay, paused, itemsCount, showCount, interval]);

  // Navigation functions
  const goToPrev = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? itemsCount - showCount : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex >= itemsCount - showCount ? 0 : prevIndex + 1
    );
  };

  // Don't render if no items
  if (itemsCount === 0) return null;

  return (
    <div 
      className="simple-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div 
        className="carousel-track"
        style={{
          transform: `translateX(-${currentIndex * (100 / showCount)}%)`,
          width: `${(itemsCount / showCount) * 100}%`
        }}
      >
        {items.map((item, index) => (
          <div 
            key={index} 
            className="carousel-item"
            style={{ width: `${100 / itemsCount * showCount}%` }}
          >
            {item}
          </div>
        ))}
      </div>
      
      {itemsCount > showCount && (
        <>
          <button 
            className="carousel-button prev" 
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            &lt;
          </button>
          <button 
            className="carousel-button next" 
            onClick={goToNext}
            aria-label="Next slide"
          >
            &gt;
          </button>
          
          <div className="carousel-dots">
            {Array.from({ length: itemsCount - showCount + 1 }).map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

SimpleCarousel.propTypes = {
  children: PropTypes.node.isRequired,
  show: PropTypes.number,
  autoplay: PropTypes.bool,
  interval: PropTypes.number
};

export default SimpleCarousel;
