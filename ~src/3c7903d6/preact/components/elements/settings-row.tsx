import React, { FunctionComponent, ReactElement, ReactNode } from "react";
import { InfoBox, InfoBoxLevel } from "./info-box";
import classNames from "classnames";

type SettingsRowProps = {
    bigLabel: ReactNode;
    smallLabel?: string;
    inputElement: ReactElement<{ id: string }>;
    infoBoxLevel?: InfoBoxLevel;
    infoBoxContent?: ReactElement;
    customDescription?: ReactElement;
    disabled?: boolean;
};

export const SettingsRow: FunctionComponent<SettingsRowProps> = ({
    bigLabel,
    smallLabel,
    inputElement,
    infoBoxLevel,
    infoBoxContent,
    customDescription,
    disabled,
}) => {
    const bigLabelRowSpanClasses = smallLabel ? "row-span-1" : "row-span-2";
    const customDescriptionContent = customDescription ?? null;

    return (
        <div className="grid grid-cols-[1fr_min-content] grid-rows-[min-content] items-center gap-2.5 pt-2.5">
            <>
                <label
                    htmlFor={inputElement.props.id}
                    className={classNames(
                        `col-start-1 row-start-1 font-bold`,
                        bigLabelRowSpanClasses,
                        { "text-gray-300": disabled }
                    )}
                >
                    {bigLabel}
                </label>

                {smallLabel ? (
                    <label
                        htmlFor={inputElement.props.id}
                        className={classNames(
                            "col-start-1 row-start-2 align-middle",
                            { "text-gray-300": disabled }
                        )}
                    >
                        {smallLabel}
                    </label>
                ) : null}

                <div className="col-start-2 row-span-2 row-start-1">
                    {inputElement}
                </div>

                {infoBoxLevel ? (
                    <InfoBox
                        level={infoBoxLevel}
                        className="col-span-2 col-start-1"
                    >
                        {infoBoxContent}
                    </InfoBox>
                ) : (
                    customDescriptionContent
                )}

                <hr className="col-span-2 col-start-1 w-full border-gray-300" />
            </>
        </div>
    );
};
