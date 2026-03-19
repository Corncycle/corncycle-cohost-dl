import classnames from "classnames";
import React, { FunctionComponent } from "react";
import { DropTargetMonitor, useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";

export const DropZone: FunctionComponent<
    React.PropsWithChildren<{
        handleFileDrop: (files: File[]) => void;
        className?: string;
    }>
> = ({ children, handleFileDrop, className = "" }) => {
    const [{ canDrop, isOver }, drop] = useDrop(
        () => ({
            accept: [NativeTypes.FILE],
            drop(item: { files: File[] }) {
                handleFileDrop(item.files);
            },
            collect: (monitor: DropTargetMonitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        []
    );
    const isActive = canDrop && isOver;

    const classes = classnames({
        hidden: !isActive,
        block: isActive,
    });

    return (
        <div ref={drop} className={`relative ${className}`}>
            <div
                className={`absolute inset-0 flex items-center justify-center
                bg-gray-700 bg-opacity-70 text-notWhite ${classes} z-50
                backdrop-blur-sm`}
            >
                RELEASE TO DROP
            </div>
            {children}
        </div>
    );
};
