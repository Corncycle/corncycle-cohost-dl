import React, { FunctionComponent } from "react";

export const TimelineSwitch: FunctionComponent<{
    tabs: {
        label: string;
        href: string;
        active?: boolean;
    }[];
}> = ({ tabs }) => {
    return (
        <ul className="flex w-full flex-row items-center justify-evenly overflow-y-auto whitespace-nowrap bg-foreground-800 text-notWhite lg:w-auto lg:rounded-lg">
            {tabs.map((tab) => (
                <li
                    key={`${tab.label}-${tab.href}`}
                    className={`flex-grow px-10 py-2 text-center text-sm lg:first-of-type:rounded-l-lg lg:last-of-type:rounded-r-lg ${
                        tab.active
                            ? "rounded-b-lg bg-foreground font-bold first-of-type:rounded-bl-none last-of-type:rounded-br-none lg:rounded-lg"
                            : "bg-foreground-800 text-foreground-200"
                    }`}
                >
                    <a href={tab.href}>{tab.label}</a>
                </li>
            ))}
        </ul>
    );
};

export const MultiSwitchButton: FunctionComponent<{
    tabs: {
        label: string;
        onClick: () => void;
        active?: boolean;
    }[];
}> = ({ tabs }) => {
    return (
        <ul className="flex w-full flex-row items-center justify-evenly overflow-y-auto whitespace-nowrap bg-foreground-800 text-notWhite lg:w-auto lg:rounded-lg">
            {tabs.map((tab) => (
                <li
                    key={`${tab.label}`}
                    className={`flex-grow px-10 py-2 text-center text-sm lg:first-of-type:rounded-l-lg lg:last-of-type:rounded-r-lg ${
                        tab.active
                            ? "rounded-b-lg bg-foreground font-bold first-of-type:rounded-bl-none last-of-type:rounded-br-none lg:rounded-lg"
                            : "bg-foreground-800 text-foreground-200"
                    }`}
                >
                    <button onClick={tab.onClick}>{tab.label}</button>
                </li>
            ))}
        </ul>
    );
};
