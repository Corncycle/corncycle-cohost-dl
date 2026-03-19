import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { Toast, Toaster } from "react-hot-toast";
import { LoadingIcon } from "./loading";

const toastClasses = (type: Toast["type"]) => {
    const baseClassName =
        "cohost-shadow-light dark:cohost-shadow-dark rounded-lg px-3 py-2 font-bold";
    switch (type) {
        case "success":
            return `!bg-green-200 !text-green-800 ${baseClassName}`;
        case "error":
            return `!bg-red-200 !text-red-800 ${baseClassName}`;
        default:
            return `!bg-mango-200 !text-mango-800 ${baseClassName}`;
    }
};

export const CohostToaster = () => {
    return (
        <Toaster
            position="bottom-center"
            toastOptions={{
                success: {
                    className: toastClasses("success"),
                    icon: (
                        <CheckCircleIcon className="h-6 flex-none text-green-800" />
                    ),
                },
                error: {
                    className: toastClasses("error"),
                    icon: (
                        <ExclamationTriangleIcon className="h-6 flex-none text-red-800" />
                    ),
                },
                loading: {
                    className: toastClasses("loading"),
                    icon: <LoadingIcon />,
                },
                icon: (
                    <QuestionMarkCircleIcon className="h-6 flex-none text-mango-800" />
                ),
            }}
        />
    );
};
