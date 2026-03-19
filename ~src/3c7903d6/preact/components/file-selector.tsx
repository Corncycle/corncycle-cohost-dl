import { listValidAttachmentContentTypes } from "@/shared/util/site-config";
import React, {
    cloneElement,
    FunctionComponent,
    isValidElement,
    useCallback,
    useRef,
} from "react";
import { useSiteConfig } from "../providers/site-config-provider";

type FilePickerProps = {
    children: React.ReactNode;
    onFilesPicked?: (files: FileList) => void;
};

export const FilePicker: FunctionComponent<FilePickerProps> = ({
    children,
    onFilesPicked,
}) => {
    const fileInput = useRef<HTMLInputElement>();
    const siteConfig = useSiteConfig();

    const onClick = useCallback<React.MouseEventHandler<EventTarget>>(() => {
        if (!fileInput.current) {
            fileInput.current = document.createElement("input");
            fileInput.current.type = "file";
            fileInput.current.accept =
                listValidAttachmentContentTypes(siteConfig).join(",");
            fileInput.current.onchange = () => {
                if (fileInput.current?.files && onFilesPicked)
                    onFilesPicked(fileInput.current.files);
                fileInput.current = undefined;
            };
        }

        fileInput.current.click();
    }, [onFilesPicked, siteConfig]);

    return (
        <>
            {React.Children.toArray(children)
                .filter(isValidElement)
                .map((child) =>
                    isValidElement<{ onClick: React.MouseEventHandler }>(child)
                        ? cloneElement(child, {
                              onClick,
                          })
                        : null
                )}
        </>
    );
};
