import { TrashIcon } from "@heroicons/react/24/outline";
import React, { FunctionComponent } from "react";
import { IconEgg } from "../icons/text-egg";

type AttachmentDeleteButtonProps = {
    onDelete: () => void;
};

export const AttachmentDeleteButton: FunctionComponent<
    AttachmentDeleteButtonProps
> = ({ onDelete }) => (
    <IconEgg
        className="absolute right-3 top-3 hidden h-6 cursor-pointer fill-cherry text-notWhite hover:fill-cherry-700 group-hover:block"
        onClick={onDelete}
        scale={0.7}
    >
        <TrashIcon />
    </IconEgg>
);
