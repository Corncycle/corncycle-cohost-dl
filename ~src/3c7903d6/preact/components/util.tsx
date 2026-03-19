import React, { FunctionComponent } from "react";
import type * as CSS from "csstype";

export const ModalOverlay: FunctionComponent<{
    className?: string;
    zIndex?: CSS.Properties["zIndex"];
}> = ({ className = "bg-notBlack/90", zIndex = 10 }) => (
    <div
        className={`fixed inset-0 ${className}`}
        style={{
            zIndex,
        }}
        aria-hidden
    />
);
