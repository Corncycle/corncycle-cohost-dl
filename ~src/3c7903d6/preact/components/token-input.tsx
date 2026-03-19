import { tw } from "@/client/lib/tw-tagged-literal";
import { isTruthy } from "@/shared/util/filter-null-undefined";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import {
    useCombobox,
    UseComboboxGetInputPropsOptions,
    useMultipleSelection,
} from "downshift";
import React, {
    FunctionComponent,
    useContext,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";
import { useTagSearch } from "../hooks/search";

const tokenSplitRegex = /[,;]/;

export type TokenInputProps = {
    TokenIcon: React.FunctionComponent<{ className: string }>;
    tokens: string[];
    setTokens: (tokens: string[]) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    fieldName?: string;
    getSuggestions?: boolean;
    customSuggestions?: string[];
};

export const TokenInput: FunctionComponent<TokenInputProps> = ({
    tokens,
    setTokens,
    disabled = false,
    getSuggestions = false,
    fieldName = "tag",
    customSuggestions,
    ...props
}) => {
    const [, startTransition] = useTransition();
    const [pendingToken, setPendingToken] = useState<string>("");
    const [searchToken, setSearchToken] = useState<string>(pendingToken);
    const [toastVisible, setToastVisible] = useState(false);

    // android workaround: skip input processing if keydown returns the actual value.
    // see: https://bugs.chromium.org/p/chromium/issues/detail?id=118639
    const unidentifiedKeyDown = useRef(false);

    const { mappedSuggestions } = useTagSearch(searchToken);

    const {
        getSelectedItemProps,
        getDropdownProps,
        addSelectedItem,
        removeSelectedItem,
    } = useMultipleSelection({
        selectedItems: tokens,
        onStateChange({ selectedItems: newTokens, type }) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes
                    .SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes
                    .SelectedItemKeyDownDelete:
                case useMultipleSelection.stateChangeTypes
                    .DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes
                    .FunctionRemoveSelectedItem:
                case useMultipleSelection.stateChangeTypes
                    .FunctionAddSelectedItem:
                    setTokens(newTokens ?? []);
                    break;
                default:
                    break;
            }
        },
    });

    const filteredCustomSuggestions = useMemo(() => {
        if (customSuggestions === undefined) {
            return [];
        }

        const initialFilter = customSuggestions.filter((token) => {
            return tokens.indexOf(token) === -1;
        });

        return pendingToken === ""
            ? initialFilter
            : initialFilter.filter((suggestion) =>
                  suggestion
                      .toLowerCase()
                      .replace(/\s+/g, "")
                      .includes(pendingToken.toLowerCase().replace(/\s+/g, ""))
              );
    }, [customSuggestions, pendingToken, tokens]);

    const suggestionsToDisplay = customSuggestions?.length
        ? filteredCustomSuggestions
        : getSuggestions
        ? [pendingToken, ...mappedSuggestions].filter(isTruthy)
        : pendingToken.length > 0
        ? [pendingToken]
        : [];

    const {
        isOpen,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        selectItem,
        setInputValue,
        openMenu,
    } = useCombobox({
        items: suggestionsToDisplay,
        defaultHighlightedIndex: 0,
        selectedItem: null,
        inputValue: pendingToken,
        stateReducer(state, actionAndChanges) {
            return actionAndChanges.changes;
        },
        onStateChange({
            inputValue: newInputValue,
            type,
            selectedItem: newToken,
        }) {
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                case useCombobox.stateChangeTypes.FunctionSelectItem:
                    if (newToken) {
                        addSelectedItem(newToken);
                        setPendingToken("");
                        startTransition(() => {
                            setSearchToken("");
                        });
                    }
                    break;
                case useCombobox.stateChangeTypes.InputChange: {
                    // android workaround. overriding the change event doesn't work so we handle it here.
                    if (unidentifiedKeyDown.current && newInputValue) {
                        const key = newInputValue[newInputValue.length - 1];

                        if (key.match(tokenSplitRegex)) {
                            let token = newInputValue;
                            if (token) {
                                // if the token has the just entered key on the end, slice it off first
                                if (token.endsWith(key)) {
                                    token = token.slice(0, token.length - 1);
                                }

                                // add it like normal
                                addSelectedItem(token);
                                // because this isn't internally treated as a selection event, we have to reset the input ourselves
                                setInputValue("");
                                setPendingToken("");
                                startTransition(() => {
                                    setSearchToken("");
                                });
                                break;
                            }
                        }
                    }

                    setPendingToken(newInputValue ?? "");
                    startTransition(() => {
                        setSearchToken(newInputValue ?? "");
                    });
                    break;
                }
            }
        },
    });

    return (
        <div
            className={`${
                props.className ?? ""
            } relative flex flex-row flex-wrap gap-3 text-sm`}
        >
            {toastVisible ? (
                <div className="absolute -top-10 flex flex-row items-center gap-2 rounded-lg border border-cherry bg-white p-2 text-xs text-cherry">
                    <InformationCircleIcon className="h-4 w-4" />
                    <span>
                        press <kbd>,</kbd> or <kbd>Enter</kbd> to save your{" "}
                        {fieldName}!
                    </span>
                </div>
            ) : null}
            {tokens.map((token, index) => (
                <div
                    key={`selected-token-${token}`}
                    className="group h-max cursor-pointer select-none"
                    {...getSelectedItemProps({
                        selectedItem: token,
                        index,
                    })}
                >
                    {/* this weird nested div thing is to prevent a bug caused by having the default click handler and our removal handler on the same element */}
                    <button
                        className={tw`co-filled-button flex items-center justify-start gap-1 rounded-full px-2 py-1 leading-none`}
                        onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedItem(token);
                        }}
                        type="button"
                    >
                        <props.TokenIcon className="inline-block h-3.5 group-hover:hidden" />
                        <XMarkIcon className="hidden h-3.5 group-hover:inline-block" />
                        <span className="block">{token}</span>
                    </button>
                </div>
            ))}
            <div className="relative">
                <input
                    placeholder={props.placeholder}
                    className="co-editable-body border-0 border-none bg-inherit p-0 text-sm outline-0 focus:ring-0"
                    {...getInputProps({
                        ...(getDropdownProps({
                            onKeyDown: (e: React.KeyboardEvent) => {
                                // we're on android. set the ref so we know to process input.
                                // keydown fires before input so we should still be fine here.
                                if (e.key === "Unidentified") {
                                    unidentifiedKeyDown.current = true;
                                }

                                if (
                                    e.key.match(tokenSplitRegex) ||
                                    e.key === "Tab"
                                ) {
                                    const token =
                                        suggestionsToDisplay[highlightedIndex];
                                    if (token) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        selectItem(token);
                                    }
                                }
                            },
                        }) as UseComboboxGetInputPropsOptions), // for some reason this is typed as `any`,
                        onFocus: () => {
                            setToastVisible(true);
                            customSuggestions?.length && openMenu();
                        },
                        onBlur: () => {
                            setToastVisible(false);
                        },
                        // https://github.com/downshift-js/downshift/issues/1108
                        onChange: (e) => {
                            setPendingToken(
                                (e.target as HTMLInputElement).value
                            );
                        },
                        disabled,
                    })}
                />
                <ul
                    {...getMenuProps()}
                    className={`${
                        isOpen && suggestionsToDisplay.length
                            ? "block"
                            : "hidden"
                    } w-prose cohost-shadow-light mt-3 flex flex-col divide-y divide-gray-200 rounded-lg bg-notWhite py-3 text-notBlack`}
                >
                    {isOpen &&
                        suggestionsToDisplay.map((token, index) => (
                            <li
                                className={`${
                                    highlightedIndex === index
                                        ? "bg-strawberry-200"
                                        : ""
                                } px-3 leading-relaxed`}
                                key={`${token}-${index}`}
                                {...getItemProps({
                                    item: token,
                                    index,
                                })}
                            >
                                {token}
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};
