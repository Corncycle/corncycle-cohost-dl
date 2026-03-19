import React from "react";

export const MoveIcon: React.ComponentType<React.SVGAttributes<SVGElement>> = (
    props
) => (
    <svg
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M10 1V19M10 1L7.54545 3.45455M10 1L12.4545 3.45455M10 19L7.54545 16.5455M10 19L12.4545 16.5455M19 10H1M19 10L16.5455 7.54545M19 10L16.5455 12.4545M1 10L3.45455 7.54545M1 10L3.45455 12.4545"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
