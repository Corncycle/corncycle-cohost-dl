import React, { FunctionComponent, PropsWithChildren } from "react";
import { useDynamicTheme } from "../../hooks/dynamic-theme";
import { Disclosure } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { tw } from "@/client/lib/tw-tagged-literal";

type RightColumnFormletProps = PropsWithChildren<{
    title: string;
}>;

export const ResponsiveFormlet: FunctionComponent<RightColumnFormletProps> = ({
    title,
    children,
}) => {
    const postBoxTheme = useDynamicTheme();

    return (
        <>
            {/* dynamically expanded alternative for mobile */}
            <Disclosure
                as="div"
                data-theme={postBoxTheme.current}
                className={tw`
                co-themed-box co-notification-group
                co-filter-controls cohost-shadow-light
                dark:cohost-shadow-dark col-span-1 flex
                h-fit max-h-max min-h-0 flex-col rounded-lg lg:hidden
            `}
            >
                <Disclosure.Button
                    as="header"
                    className="flex flex-row items-center justify-between rounded-t-lg border-b p-3 ui-not-open:rounded-b-lg"
                >
                    <ChevronRightIcon className="h-5 w-5 ui-open:rotate-90 motion-safe:transition-transform" />
                    <span className="font-league text-xs uppercase">
                        {title}
                    </span>
                </Disclosure.Button>
                <Disclosure.Panel as="ul" className="flex-col divide-y">
                    {children}
                </Disclosure.Panel>
            </Disclosure>

            {/* statically expanded alternative for desktop */}
            <div
                data-theme={postBoxTheme.current}
                className={tw`
                co-themed-box co-notification-group
                co-filter-controls cohost-shadow-light dark:cohost-shadow-dark col-span-1 
                hidden h-fit max-h-max min-h-0 flex-col divide-y rounded-lg lg:flex
            `}
            >
                <header className="flex flex-row items-center justify-end rounded-t-lg p-3">
                    <span className="font-league text-xs uppercase">
                        {title}
                    </span>
                </header>
                <ul className="flex-col divide-y">{children}</ul>
            </div>
        </>
    );
};
