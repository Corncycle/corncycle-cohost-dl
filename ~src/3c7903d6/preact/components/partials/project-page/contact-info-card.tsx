import { WireProjectModel } from "@/shared/types/projects";
import { validateUrl } from "@/shared/util/validate-url";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import _ from "lodash";
import React, { FunctionComponent, ReactNode, useMemo, useState } from "react";

function displayURL(url: URL): string {
    return url.toString().split("://")[1];
}

const ContactCardValue: FunctionComponent<{
    value: string;
}> = ({ value }) => {
    const validationResult = validateUrl(value);

    if (validationResult.valid) {
        // turn it into a link
        return (
            <a
                href={value}
                className="text-mango"
                rel="me nofollow noopener"
                target="_blank"
            >
                {displayURL(new URL(validationResult.url))}
            </a>
        );
    } else {
        // just spew out the text
        return <div>{value}</div>;
    }
};

export const ContactInfoCard: FunctionComponent<
    React.PropsWithChildren<{
        project: WireProjectModel;
    }>
> = ({ project }) => {
    const [privateInfoOpen, setPrivateInfoOpen] = useState(false);

    const [publicRows, privateRows] = useMemo(
        () =>
            _.partition(
                project.contactCard,
                (row) => row.visibility !== "follows"
            ),
        [project.contactCard]
    );

    const privateInfoSection = useMemo(() => {
        if (privateRows.length > 0) {
            if (privateInfoOpen) {
                return (
                    <>
                        <button
                            className="mt-3 flex w-full flex-row text-notWhite"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPrivateInfoOpen(false);
                            }}
                            type="button"
                        >
                            <div className="flex-1 text-left font-bold">
                                hide private contact info
                            </div>
                            <ChevronUpIcon className="h-6" />
                        </button>

                        {privateRows.map((row) => (
                            <div
                                className="mt-3 flex flex-col self-start"
                                key={`${row.service}-${row.value}`}
                            >
                                <div className="font-bold">{row.service}</div>
                                <ContactCardValue value={row.value} />
                            </div>
                        ))}

                        <hr className="mt-3 w-full border-[1px] border-mango" />
                    </>
                );
            } else {
                return (
                    <>
                        <button
                            className="mt-3 flex w-full flex-row"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPrivateInfoOpen(true);
                            }}
                            type="button"
                        >
                            <div className="flex-1 text-left font-bold">
                                show private contact info
                            </div>
                            <ChevronDownIcon className="h-6" />
                        </button>

                        <hr className="mt-3 w-full border-[1px] border-mango" />
                    </>
                );
            }
        } else return null; // no private rows
    }, [privateInfoOpen, privateRows]);

    return (
        <>
            {publicRows.length > 0 || privateRows.length > 0 ? (
                <hr className="mt-8 w-full border-[1px] border-mango" />
            ) : null}

            {publicRows.map((row) => (
                <div
                    className="mt-3 flex flex-col self-start"
                    key={`${row.service}-${row.value}`}
                >
                    <div className="font-bold">{row.service}</div>
                    <ContactCardValue value={row.value} />
                </div>
            ))}

            {privateInfoSection}
        </>
    );
};

export default ContactInfoCard;
