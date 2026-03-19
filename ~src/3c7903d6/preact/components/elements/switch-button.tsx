import { Switch } from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React, { FunctionComponent, useState } from "react";
import { ButtonSize, smallClasses, regularClasses } from "./common-styling";

type Props = {
    label: string;
    buttonSize: ButtonSize;
    onChange: (value: boolean) => void;
    initial?: boolean;
};

export const SwitchButton: FunctionComponent<Props> = (props) => {
    const [checked, setChecked] = useState(props.initial ?? false);

    const offClasses = "bg-cherry-800 hover:bg-cherry-600 active:bg-cherry-700";
    const onClasses = "bg-cherry-500 hover:bg-cherry-600 active:bg-cherry-700";

    const handleOnChange = (value: boolean) => {
        setChecked(value);
        props.onChange(value);
    };

    return (
        <Switch
            checked={checked}
            onChange={handleOnChange}
            className={classNames(
                "flex flex-row items-center rounded-lg px-2 py-2 text-notWhite",
                {
                    [smallClasses]: props.buttonSize === "small",
                    [regularClasses]: props.buttonSize === "regular",
                    [onClasses]: checked,
                    [offClasses]: !checked,
                }
            )}
        >
            {props.label}
            &nbsp;
            {checked ? (
                <CheckIcon className="h-4" />
            ) : (
                <XMarkIcon className="h-4" />
            )}
        </Switch>
    );
};
