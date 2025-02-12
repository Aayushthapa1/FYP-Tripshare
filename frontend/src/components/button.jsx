import React, { useState } from "react";

const Button = ({
  children,
  className,
  onClick,
  WholeClassName,
  leftArrow,
  rightArrow,
  hovered,
  notHovered,
}) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleButtonHover = () => {
    setIsButtonHovered(true);
  };

  const handleButtonLeave = () => {
    setIsButtonHovered(false);
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-500  pr-3 py-px rounded-xl bg-red-  ${
        isButtonHovered ? "w-52 " : "w-48"
      } ${WholeClassName}`}
      onClick={onClick}
    >
      <button
        className={`transition-all py-2 duration-500 relative -left-[45px] text-nowrap
           ${isButtonHovered ? "translate-x-14" : "translate-x-0"}`}
        onMouseEnter={handleButtonHover}
        onMouseLeave={handleButtonLeave}
      >
        <span
          className={`${leftArrow} px-4 py-2 relative -left-2 rounded-xl transition-opacity duration-500 ${
            isButtonHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          &#8594;
        </span>
        <span
          className={` py-2 rounded-xl transition-all duration-500 overflow-hidden ${
            isButtonHovered ? ` ${hovered} ` : `  ${notHovered} `
          } ${className}`}
        >
          {children}
          <span
            className={`top-[14px] right-14 duration-500 ease group-hover:translate-x-12 ${
              isButtonHovered ? "pr-0" : "pr-2"
            }`}
          >
            <svg
              className={`h-5 ${rightArrow} absolute top-[10px]  pr-4 duration-500 ${
                isButtonHovered
                  ? "w-0 translate-x-1  opacity-0"
                  : "w-20 opacity-100"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </span>
        </span>
      </button>
    </div>
  );
};

export default Button;
