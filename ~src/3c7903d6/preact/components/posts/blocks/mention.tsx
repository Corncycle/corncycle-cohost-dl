import sitemap from "@/shared/sitemap";
import { ProjectHandle } from "@/shared/types/ids";
import React, { FunctionComponent } from "react";

export const Mention: FunctionComponent<{ handle: ProjectHandle }> = ({
    handle,
}) => {
    return (
        <a
            data-testid="mention"
            href={sitemap.public.project
                .mainAppProfile({
                    projectHandle: handle,
                })
                .toString()}
            className="!font-bold !no-underline hover:!underline"
        >
            @{handle}
        </a>
    );
};

/**
 * Default props included because Mention is used outside of typescript and we
 * need an easy way to see when it's fucked instead of just crashing
 */
Mention.defaultProps = {
    handle: "ERROR" as ProjectHandle,
};
