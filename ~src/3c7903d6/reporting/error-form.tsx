import React, { FunctionComponent, useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ReportingUIContext } from "./machine";

export const ErrorForm: FunctionComponent = () => {
    const service = useContext(ReportingUIContext);
    const { t } = useTranslation();

    return (
        <div className="cohost-shadow-light dark:cohost-shadow-dark relative mx-auto flex max-w-md flex-col rounded-lg bg-notWhite p-3 text-notBlack">
            <Trans i18nKey="common:report.report-failed">
                <p>
                    Submitting your report failed. Please email
                    support@cohost.org about your concerns, and include the
                    following information:
                </p>
            </Trans>

            <hr />

            {service.state.context.postId ? (
                <p>
                    <>post id: {service.state.context.postId}</>
                </p>
            ) : null}

            {service.state.context.projectId ? (
                <p>
                    <>page id: {service.state.context.projectId}</>
                </p>
            ) : null}

            {service.state.context.commentId ? (
                <p>
                    <>comment id: {service.state.context.commentId}</>
                </p>
            ) : null}

            <p>
                <>reporting reason: {service.state.context.reportingReason}</>
            </p>
            <p>
                <>
                    additional details:{" "}
                    {service.state.context.additionalDetails}
                </>
            </p>

            <button
                type="submit"
                className={`max-w-10 align-self-center mt-3 rounded-lg bg-foreground py-1 px-4 
    text-lg font-bold text-notWhite hover:bg-foreground-600 active:bg-foreground-700`}
                onClick={() => service.send({ type: "CLOSE" })}
            >
                {t("common:ok", "ok")}
            </button>
        </div>
    );
};
