import React, { FunctionComponent, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ReportingUIContext } from "./machine";

export const AckForm: FunctionComponent = () => {
    const service = useContext(ReportingUIContext);
    const { t } = useTranslation();

    return (
        <div className="cohost-shadow-light dark:cohost-shadow-dark relative mx-auto flex max-w-md flex-col rounded-lg bg-notWhite p-3 text-notBlack">
            {t(
                "common:report-post.thanks",
                "Thanks for letting us know.  We'll look into your report as soon as possible."
            )}

            <button
                type="submit"
                className={`max-w-10 align-self-center mt-3 rounded-lg bg-foreground py-1 px-4 
    text-lg font-bold text-notWhite hover:bg-foreground-600 active:bg-foreground-700`}
                onClick={() => service.send({ type: "ACKNOWLEDGE" })}
            >
                {t("common:ok", "ok")}
            </button>
        </div>
    );
};
