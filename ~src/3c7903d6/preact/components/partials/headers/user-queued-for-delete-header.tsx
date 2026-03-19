import { useEditedProjects } from "@/client/preact/hooks/use-edited-projects";
import sitemap from "@/shared/sitemap";
import { UserId } from "@/shared/types/ids";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { DateTime } from "luxon";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Trans } from "react-i18next";
import { StandardHeader } from "./standard-header";
import { useUserInfo } from "@/client/preact/providers/user-info-provider";

function makeLocalStorageKey(userId: UserId): string {
    return `scheduled-delete-acknowledged/user/${userId}`;
}

export const UserQueuedForDeleteHeader: FunctionComponent = () => {
    const userInfo = useUserInfo();
    const [unacknowledgedDelete, setUnacknowledgedDelete] = useState(false);

    useEffect(() => {
        if (userInfo.userId) {
            const storedValue = window.localStorage.getItem(
                makeLocalStorageKey(userInfo.userId)
            );

            if (storedValue && !userInfo.deleteAfter) {
                // a deletion was scheduled, then cancelled; we can clear the
                // acknowledgement to be a good citizen and not waste localstorage
                window.localStorage.removeItem(
                    makeLocalStorageKey(userInfo.userId)
                );
            } else if (
                storedValue &&
                storedValue === userInfo.deleteAfter?.toISO()
            ) {
                // a deletion is scheduled, and has been acknowledged
            } else if (userInfo.deleteAfter) {
                // a deletion is scheduled, but has not been acknowledged
                setUnacknowledgedDelete(true);
            }
        }
    }, [userInfo]);

    function onAcknowledge() {
        if (!unacknowledgedDelete || !userInfo.userId || !userInfo.deleteAfter)
            return;

        // store the acknowledgement to localStorage; store a timestamp so that
        // we can remove any
        window.localStorage.setItem(
            makeLocalStorageKey(userInfo.userId),
            userInfo.deleteAfter.toISO()
        );

        // change the state
        setUnacknowledgedDelete(false);
    }

    // display the warning iff we know which deletes haven't been acknowledged
    // (to prevent an FOUC if the user's acknowledged all their scheduled deletes)
    // and there's at least one of them
    if (unacknowledgedDelete) {
        const timeLeft = userInfo.deleteAfter!.diff(DateTime.now());
        const daysLeft = Math.round(timeLeft.as("days"));

        return (
            <StandardHeader>
                <>
                    <Trans
                        parent="div"
                        className="prose mx-auto"
                        i18nKey="client:header-notice.user-queued-for-delete"
                    >
                        <p>
                            <strong>Heads up!</strong> Your account is scheduled
                            for deletion, starting in {{ daysLeft }} days. At
                            that time, that data will be permanently deleted
                            from our servers. If you want to prevent this,
                            please{" "}
                            <a href={sitemap.public.userSettings().toString()}>
                                visit the user settings
                            </a>{" "}
                            and cancel it.
                        </p>
                        <p>
                            (If you close this notification, you won't see it
                            again for this account in this web browser.)
                        </p>
                    </Trans>
                    <button
                        type="button"
                        disabled={!unacknowledgedDelete}
                        onClick={onAcknowledge}
                    >
                        <XMarkIcon className="h-6" />
                    </button>
                </>
            </StandardHeader>
        );
    } else return null;
};
