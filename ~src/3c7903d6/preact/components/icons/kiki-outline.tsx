import React, { FunctionComponent } from "react";

export const KikiOutline: FunctionComponent<React.SVGAttributes<SVGElement>> = (
    props
) => (
    <svg
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 26 26"
        {...props}
    >
        <path
            d="M11.3119 5.42651 6.14576 1.57637l1.85085 7.14697L1 10.8444l6.40678 1.9135L1.38644 25l9.15256-7.3545 3.2542 6.8473.1424-8.9222 8.7864 5.5331-6.9762-8.438L25 7.317 13.4678 8.40058 15.1356 1l-3.8237 4.42651Z"
            stroke="#E56B6F"
            strokeWidth="2"
            strokeLinejoin="round"
        />
    </svg>
);
