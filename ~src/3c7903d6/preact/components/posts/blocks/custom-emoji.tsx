import React, { FunctionComponent } from "react";

import brokenImage from "@/client/images/placeholders/attach.svg";
import sitemap from "@/shared/sitemap";
export const CustomEmoji: FunctionComponent<{
    name: string;
    url: string;
}> = React.memo(({ name = "missing", url = sitemap.public.static
        .staticAsset({ path: brokenImage })
        .toString() }) => {
    return (
        <img
            src={url}
            alt={`:${name}:`}
            title={`:${name}:`}
            className="m-0 inline-block aspect-square object-contain align-middle"
            style={{
                height: "var(--emoji-scale, 1em)",
            }}
        />
    );
});
CustomEmoji.displayName = "CustomEmoji";
