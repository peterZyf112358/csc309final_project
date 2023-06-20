import { useState } from 'react';
import './Rating.css';

function Rating({ onChange }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleClick = (value) => {
    setRating(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="rating">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={index}
            className={starValue <= (hover || rating) ? "on" : "off"}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(rating)}
          >
            <span className="star">&#9733;</span>
          </button>
        );
      })}
    </div>
  );
}

export default Rating;