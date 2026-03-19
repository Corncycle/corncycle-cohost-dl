import { tw } from "@/client/lib/tw-tagged-literal";
import { HashtagIcon } from "@heroicons/react/20/solid";
import React from "react";
import {
    FieldValues,
    UseControllerProps,
    useController,
} from "react-hook-form";
type TokenMultiSelectProps<T extends FieldValues> = {
    options: string[];
} & UseControllerProps<T>;

export const TokenMultiSelect = <T extends FieldValues>({
    options,
    ...props
}: TokenMultiSelectProps<T>) => {
    const { field } = useController<T>(props);
    const selectedOptions = field.value as string[];

    return (
        <div className="flex flex-row flex-wrap gap-2 px-3 py-2">
            {options.map((option) => (
                <div
                    key={`selected-token-${option}`}
                    className="group h-max cursor-pointer select-none"
                >
                    {/* this weird nested div thing is to prevent a bug caused by having the default click handler and our removal handler on the same element */}
                    <button
                        className={tw`co-token flex items-center justify-start gap-1 rounded-lg px-2 py-1 leading-none ${
                            selectedOptions.includes(option) ? "co-active" : ""
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            selectedOptions.includes(option)
                                ? field.onChange(
                                      selectedOptions.filter(
                                          (o) => o !== option
                                      )
                                  )
                                : field.onChange([...selectedOptions, option]);
                        }}
                        type="button"
                    >
                        <HashtagIcon className="inline-block h-3.5" />
                        <span className="block">{option}</span>
                    </button>
                </div>
            ))}
        </div>
    );
};
