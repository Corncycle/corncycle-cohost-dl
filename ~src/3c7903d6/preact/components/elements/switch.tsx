import { Switch as BaseSwitch } from "@headlessui/react";
import React, { FunctionComponent, useState } from "react";

type SwitchProps = {
    offLabel: string;
    onLabel: string;
    onChange: (value: boolean) => void;
    initial?: boolean;
};

export const Switch: FunctionComponent<SwitchProps> = (props) => {
    const [checked, setChecked] = useState(props.initial ?? false);

    const offClasses = "py-2 px-2 text-cherry-700 md:px-3";
    const onClasses =
        "rounded-lg bg-cherry-500 py-2 px-2 text-notWhite md:px-3 font-bold";

    const handleOnChange = (value: boolean) => {
        setChecked(value);
        props.onChange(value);
    };

    return (
        <BaseSwitch.Group>
            <BaseSwitch.Label className="sr-only">
                {props.onLabel}
            </BaseSwitch.Label>
            <BaseSwitch
                checked={checked}
                onChange={handleOnChange}
                className={`inline-flex w-fit items-center rounded-lg bg-cherry-300 text-base leading-none`}
            >
                <span className={checked ? offClasses : onClasses}>
                    {props.offLabel}
                </span>

                <span className={checked ? onClasses : offClasses}>
                    {props.onLabel}
                </span>
            </BaseSwitch>
        </BaseSwitch.Group>
    );
};
