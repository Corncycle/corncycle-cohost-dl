import { useCallback, useMemo } from "react";

export const useImageOptimizer = (
    src: string | undefined,
    maxWidth: number,
    aspectRatio: number | undefined
) => {
    const processedSrc = useMemo(() => {
        if (!src) return undefined;

        const parsedSrc = new URL(src);

        if (parsedSrc.protocol === "blob:") {
            // firefox doesn't like sticking search params onto the end of object
            // URLs. pass through the URL unchanged.
            return parsedSrc;
        }

        parsedSrc.searchParams.append("width", Math.floor(maxWidth).toString());

        if (aspectRatio) {
            parsedSrc.searchParams.append(
                "height",
                Math.floor(maxWidth / aspectRatio).toString()
            );
            parsedSrc.searchParams.append("fit", "crop");
        }

        parsedSrc.searchParams.append("auto", "webp");

        return parsedSrc;
    }, [aspectRatio, maxWidth, src]);

    const srcWithDpr = useCallback(
        (dpr: number) => {
            if (!processedSrc) return "";
            const parsedSrc = new URL(processedSrc.toString());

            if (parsedSrc.protocol === "blob:") {
                // firefox doesn't like sticking search params onto the end of object
                // URLs. pass through the URL unchanged.
                return parsedSrc.toString();
            }

            parsedSrc.searchParams.append("dpr", dpr.toString());
            return parsedSrc.toString();
        },
        [processedSrc]
    );

    return srcWithDpr;
};
