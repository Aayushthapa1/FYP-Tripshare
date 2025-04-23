import React, { useState } from "react";
import PropTypes from "prop-types";

const StarRating = ({
  rating,
  setRating,
  size = "md",
  color = "amber",
  editable = true,
  showLabel = false,
  labelPosition = "right",
  className = "",
}) => {
  const [hover, setHover] = useState(0);

  // Size mapping for Tailwind classes
  const sizeMap = {
    xs: "text-lg",
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  // Color mapping for Tailwind classes
  const colorMap = {
    amber: "text-amber-400",
    yellow: "text-yellow-400",
    orange: "text-orange-400",
    red: "text-red-500",
    blue: "text-blue-500",
    purple: "text-purple-500",
    green: "text-green-500",
  };

  // Empty star color
  const emptyColor = "text-gray-300";

  // Apply the appropriate size class
  const sizeClass = sizeMap[size] || sizeMap.md;

  // Apply the appropriate color class
  const fillColor = colorMap[color] || colorMap.amber;

  // Determine cursor based on editability
  const cursorClass = editable ? "cursor-pointer" : "cursor-default";

  // Determine label text based on rating
  const getLabelText = () => {
    if (rating === 0) return "Not rated";
    if (rating === 1) return "Poor";
    if (rating === 2) return "Fair";
    if (rating === 3) return "Good";
    if (rating === 4) return "Very Good";
    if (rating === 5) return "Excellent";
    return "";
  };

  // Label size should be smaller than stars
  const labelSizeMap = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const labelSizeClass = labelSizeMap[size] || labelSizeMap.md;

  // Container className based on label position
  const containerClass =
    labelPosition === "right"
      ? "flex items-center gap-2"
      : "flex flex-col items-start gap-1";

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`
              ${sizeClass} 
              ${(hover || rating) >= star ? fillColor : emptyColor}
              ${cursorClass}
              transition-all duration-150
              ${editable ? "hover:scale-110" : ""}
            `}
            onClick={() => {
              if (editable) {
                // Toggle off if clicking the same star
                setRating(rating === star ? star - 1 : star);
              }
            }}
            onMouseEnter={() => {
              if (editable) setHover(star);
            }}
            onMouseLeave={() => {
              if (editable) setHover(0);
            }}
            role={editable ? "button" : "presentation"}
            aria-label={
              editable ? `Rate ${star} out of 5` : `Rated ${rating} out of 5`
            }
          >
            ★
          </span>
        ))}
      </div>

      {showLabel && rating > 0 && (
        <span className={`${labelSizeClass} text-gray-700 font-medium`}>
          {getLabelText()}
        </span>
      )}
    </div>
  );
};

// PropTypes for better documentation and validation
StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  setRating: PropTypes.func.isRequired,
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  color: PropTypes.oneOf([
    "amber",
    "yellow",
    "orange",
    "red",
    "blue",
    "purple",
    "green",
  ]),
  editable: PropTypes.bool,
  showLabel: PropTypes.bool,
  labelPosition: PropTypes.oneOf(["right", "bottom"]),
  className: PropTypes.string,
};

export default StarRating;
