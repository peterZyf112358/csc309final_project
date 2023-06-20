import { useState } from "react";
import './ImageSlider.css';

const ImageSlider = (props) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const goPrev = () => {
        const newIndex = (currentIndex === 0) ? props.images.length -1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    }

    const goNext = () => {
        const newIndex = (currentIndex === props.images.length - 1) ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }
    return (
    <div className="slider">
        <div className="circle leftArrow">
            <div className="arrow" onClick={goPrev}>←</div>
        </div>
        <img className="slide" src={`http://127.0.0.1:8000${props.images[currentIndex]}`} alt={""} />
        <div className="circle rightArrow">
            <div className="arrow" onClick={goNext}>→</div> 
        </div>
    </div>
    );
};

export default ImageSlider;