import React, { FunctionComponent } from "react";

export const Play: FunctionComponent<React.SVGAttributes<SVGElement>> = (
    props
) => (
    <svg
        viewBox="0 0 20 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M18.2864 8.81325L5.98281 0.649686C3.42546 -1.04714 0 0.777437 0 3.83643V20.1636C0 23.2226 3.42546 25.0471 5.98281 23.3503L18.2864 15.1867C20.5712 13.6708 20.5712 10.3292 18.2864 8.81325Z"
            fill="currentColor"
        />
    </svg>
);

export const Pause: FunctionComponent<React.SVGAttributes<SVGElement>> = (
    props
) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 4C0 1.79086 1.79086 0 4 0C6.20914 0 8 1.79086 8 4V20C8 22.2091 6.20914 24 4 24C1.79086 24 0 22.2091 0 20V4ZM20 0C17.7909 0 16 1.79086 16 4V20C16 22.2091 17.7909 24 20 24C22.2091 24 24 22.2091 24 20V4C24 1.79086 22.2091 0 20 0Z"
            fill="currentColor"
        />
    </svg>
);
