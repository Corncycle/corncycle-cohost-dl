import { useEditedProjects } from "@/client/preact/hooks/use-edited-projects";
import sitemap from "@/shared/sitemap";
import { ProjectId } from "@/shared/types/ids";
import { WireProjectModel } from "@/shared/types/projects";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { DateTime } from "luxon";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Trans } from "react-i18next";
import { StandardHeader } from "./standard-header";

function makeLocalStorageKey(projectId: ProjectId): string {
    return `scheduled-delete-acknowledged/project/${projectId}`;
}

export const QueuedForDeleteHeader: FunctionComponent = () => {
    const editedProjects = useEditedProjects();

    const [unacknowledgedScheduledDeletes, setUnacknowledgedScheduledDeletes] =
        useState<(WireProjectModel & { deleteAfter: string })[] | null>(null);

    useEffect(() => {
        const unacknowledgedDeletes: typeof unacknowledgedScheduledDeletes = [];

        for (const project of editedProjects.projects) {
            const storedValue = window.localStorage.getItem(
                makeLocalStorageKey(project.projectId)
            );

            if (storedValue && !project.deleteAfter) {
                // a deletion was scheduled, then cancelled; we can clear the
                // acknowledgement to be a good citizen and not waste localstorage
                window.localStorage.removeItem(
                    makeLocalStorageKey(project.projectId)
                );
            } else if (storedValue && storedValue === project.deleteAfter) {
                // a deletion is scheduled, and has been acknowledged
            } else if (project.deleteAfter) {
                // a deletion is scheduled, but has not been acknowledged
                unacknowledgedDeletes.push(
                    project as WireProjectModel & { deleteAfter: string }
                );
            }
        }

        setUnacknowledgedScheduledDeletes(unacknowledgedDeletes);
    }, [editedProjects]);

    function onAcknowledge() {
        if (!unacknowledgedScheduledDeletes) return;

        // store the acknowledgement to localStorage; store a timestamp so that
        // we can remove any
        for (const del of unacknowledgedScheduledDeletes) {
            window.localStorage.setItem(
                makeLocalStorageKey(del.projectId),
                del.deleteAfter
            );
        }

        // change the state
        setUnacknowledgedScheduledDeletes([]);
    }

    // display the warning iff we know which deletes haven't been acknowledged
    // (to prevent an FOUC if the user's acknowledged all their scheduled deletes)
    // and there's at least one of them
    if (
        unacknowledgedScheduledDeletes &&
        unacknowledgedScheduledDeletes.length > 0
    ) {
        const handleList = unacknowledgedScheduledDeletes
            .map((del) => `@${del.handle}`)
            .join(", ");
        const earliestUnacknowledgedDelete: DateTime = DateTime.min(
            ...unacknowledgedScheduledDeletes.map((del) =>
                DateTime.fromISO(del.deleteAfter)
            )
        );
        const timeLeft = earliestUnacknowledgedDelete.diff(DateTime.now());
        const daysLeft = Math.round(timeLeft.as("days"));

        return (
            <StandardHeader>
                <>
                    <Trans
                        parent="div"
                        className="prose mx-auto"
                        i18nKey="client:header-notice.queued-for-delete"
                    >
                        <p>
                            <strong>Heads up!</strong> One or more pages you
                            edit ({{ handleList }}) are scheduled for deletion,
                            starting in {{ daysLeft }} days. At that time, that
                            data will be permanently deleted from our servers.
                            If you want to prevent this, please{" "}
                            <a
                                href={sitemap.public.project
                                    .settings()
                                    .toString()}
                            >
                                visit the page settings
                            </a>{" "}
                            and cancel it.
                        </p>
                        <p>
                            (If you close this notification, you won't see it
                            again for these pages in this web browser.)
                        </p>
                    </Trans>
                    <button
                        type="button"
                        disabled={!unacknowledgedScheduledDeletes}
                        onClick={onAcknowledge}
                    >
                        <XMarkIcon className="h-6" />
                    </button>
                </>
            </StandardHeader>
        );
    } else return null;
};
