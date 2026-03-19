import React from "react";

export const SilenceIcon: React.ComponentType<
    React.SVGAttributes<SVGElement>
> = (props) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.58579 15.002H7C6.44772 15.002 6 14.5543 6 14.002V10.002C6 9.44972 6.44772 9.002 7 9.002H8.58579L13.2929 4.2949C13.9229 3.66493 15 4.1111 15 5.002V19.002C15 19.8929 13.9229 20.3391 13.2929 19.7091L8.58579 15.002Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M20 4L16.8096 7.19036M4 20L7.19005 16.81L10.1144 13.8856M10.1144 13.8856L13.8856 10.1144L16.8096 7.19036M10.1144 13.8856L16.8096 7.19036"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
