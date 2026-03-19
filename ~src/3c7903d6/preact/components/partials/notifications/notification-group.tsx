import { DateTime } from "luxon";
import React, { FunctionComponent, useContext, useMemo } from "react";

import { NotificationCardProps, NotificationCard } from "./notification-card";
import { useDynamicTheme } from "../../../hooks/dynamic-theme";

export const NotificationGroup: FunctionComponent<{
    date: Date;
    notifications: NotificationCardProps[];
}> = ({ date: jsDate, notifications }) => {
    const postBoxTheme = useDynamicTheme();

    // get the number of years between the notif and now, is negative
    // used to show year if the notif was more than one year ago
    // likely will only be useful during the Epoch Era but w/e
    const date = DateTime.fromJSDate(jsDate);
    const timeDiff = date.diffNow("years").years;

    const notifViews = useMemo(
        () =>
            notifications.flatMap((notification) => (
                <NotificationCard {...notification} key={notification.key} />
            )),
        [notifications]
    );

    return (
        <div
            data-theme={postBoxTheme.current}
            className="co-themed-box co-notification-group cohost-shadow-light dark:cohost-shadow-dark flex flex-col divide-y rounded-lg"
        >
            <header className="flex flex-row items-center justify-end rounded-t-lg p-3">
                <time
                    className="font-league text-xs uppercase"
                    dateTime={date.toISODate()}
                >
                    {date.toLocaleString({
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                        year: timeDiff < -1 ? "numeric" : undefined,
                    })}
                </time>
            </header>
            {notifViews}
        </div>
    );
};
