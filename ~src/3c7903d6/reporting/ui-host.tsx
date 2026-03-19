import { Dialog } from "@headlessui/react";
import React, {
    FunctionComponent,
    ReactNode,
    useContext,
    useMemo,
} from "react";
import { ModalOverlay } from "../preact/components/util";
import { useInterpret, useSelector } from "@xstate/react";
import { type LayoutProps } from "../layouts/layout-map";
import { ErrorBoundary } from "../preact/components/error-boundary";
import { ReportingUIContext, reportingUIMachine } from "./machine";
import { ReportForm } from "./report-form";
import { AckForm } from "./ack-form";
import { useTranslation } from "react-i18next";
import { ErrorForm } from "./error-form";

export const ReportingUIHost: FunctionComponent<LayoutProps> = ({
    children,
}) => {
    const reportDialogService = useInterpret(reportingUIMachine, {
        context: {},
    });

    return (
        <>
            <ReportingUIContext.Provider value={reportDialogService}>
                <ErrorBoundary>
                    <ReportingUI />
                </ErrorBoundary>
                {children}
            </ReportingUIContext.Provider>
        </>
    );
};

const ReportingUI: FunctionComponent<{ children?: ReactNode }> = (props) => {
    const { t } = useTranslation();
    const service = useContext(ReportingUIContext);
    const isOpen = useSelector(service, (state) => !state.matches("closed"));
    const isReportingPost = useSelector(
        service,
        (state) => state.matches("editingReport") && state.context.postId
    );
    const isReportingProject = useSelector(
        service,
        (state) => state.matches("editingReport") && state.context.projectId
    );
    const isReportingComment = useSelector(
        service,
        (state) => state.matches("editingReport") && state.context.commentId
    );
    const isReportingAsk = useSelector(
        service,
        (state) => state.matches("editingReport") && state.context.askId
    );
    const isReportingArtistAlleyListing = useSelector(
        service,
        (state) =>
            state.matches("editingReport") && state.context.artistAlleyListingId
    );
    const isAcknowledging = useSelector(service, (state) =>
        state.matches("acknowledging")
    );
    const isDisplayingError = useSelector(service, (state) =>
        state.matches("displayingError")
    );

    const whatsWrong = useMemo(() => {
        if (isReportingPost) {
            return t(
                "common:report.whats-wrong.post",
                "Help us understand the problem. What's wrong with this post?"
            );
        } else if (isReportingProject) {
            return t(
                "common:report.whats-wrong.project",
                "Help us understand the problem. What's wrong with this project?"
            );
        } else if (isReportingComment) {
            return t(
                "common:report.whats-wrong.comment",
                "Help us understand the problem. What's wrong with this comment?"
            );
        } else if (isReportingAsk) {
            return t(
                "common:report.whats-wrong.ask",
                "Help us understand the problem. What's wrong with this ask?"
            );
        } else if (isReportingArtistAlleyListing) {
            return t(
                "common:report.whats-wrong.artist-alley-listing",
                "Help us understand the problem. What's wrong with this listing?"
            );
        } else {
            return "";
        }
    }, [
        isReportingAsk,
        isReportingComment,
        isReportingPost,
        isReportingProject,
        isReportingArtistAlleyListing,
        t,
    ]);

    return (
        <Dialog open={isOpen} onClose={() => service.send({ type: "CLOSE" })}>
            <ModalOverlay />
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center py-20">
                    {whatsWrong.length ? (
                        <Dialog.Panel as={ReportForm} whatsWrong={whatsWrong} />
                    ) : null}
                    {isAcknowledging ? <Dialog.Panel as={AckForm} /> : null}
                    {isDisplayingError ? <Dialog.Panel as={ErrorForm} /> : null}
                </div>
            </div>
        </Dialog>
    );
};
