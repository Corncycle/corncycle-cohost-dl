import { FlashesProvider } from "@/client/preact/providers/flashes";
import React, { FunctionComponent, useContext } from "react";

const infoFlash = (message: string) => <div>{message}</div>;
const errorFlash = (message: string) => <div>error: {message}</div>;

export const Flashes: FunctionComponent<
    React.HTMLAttributes<HTMLDivElement>
> = (props) => {
    const { info, error } = useContext(FlashesProvider);

    return info.length || error.length ? (
        <div
            className={`rounded-lg border-notBlack bg-notWhite p-3 text-notBlack ${
                props.className || ""
            } ${props.className || ""}`}
        >
            {info.length ? (
                <ul>
                    {info.map((msg) => (
                        <li key={msg}>{infoFlash(msg)}</li>
                    ))}
                </ul>
            ) : null}
            {error.length ? (
                <ul>
                    {error.map((msg) => (
                        <li key={msg}>{errorFlash(msg)}</li>
                    ))}
                </ul>
            ) : null}
        </div>
    ) : null;
};
