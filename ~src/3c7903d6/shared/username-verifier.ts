import i18n from "i18next";
import { USERNAME_HANDLE_LIMIT } from "./limits";

export type UsernameLegalResult =
    | {
          legal: true;
      }
    | {
          legal: false;
          reason: string;
      };

export const LEGAL_REGEX_STRING = "^[a-zA-Z0-9][a-zA-Z0-9-]{2,}$";
export const LEGAL_REGEX = new RegExp(LEGAL_REGEX_STRING);
// separate regular expression for existing pages; fixes tRPC bugs with pages that are invalid DNS names but already exist
export const EXTANT_PAGE_LEGAL_REGEX = /^[a-zA-Z0-9-]{3,}/;
const BANNED_USERNAMES = new Set([
    "rc",
    "api",
    "www",
    "help",
    "admin",
    "support",
    "staff",
    "internal",
    "status",
    "mail",
    "mobile",
    "search",
    "static",
]);

export function isHandleLegal(username: string): UsernameLegalResult {
    const downcasedUsername = username.toLowerCase();

    // no namespace usernames
    if (BANNED_USERNAMES.has(downcasedUsername)) {
        return {
            legal: false,
            reason: i18n.t("server:register.disallowed-username-error", {
                defaultValue: 'Username can not be "{{username}}"',
                username,
            }),
        };
    }

    // legal characters only
    if (!LEGAL_REGEX.test(username)) {
        return {
            legal: false,
            reason: i18n.t("server:register.invalid-username-error", {
                defaultValue:
                    "Usernames can only contain letters, numbers, and hyphens, and must be at least 3 characters.",
            }),
        };
    }

    if (downcasedUsername.length > USERNAME_HANDLE_LIMIT) {
        return {
            legal: false,
            reason: i18n.t("server:register.username-too-long-error", {
                defaultValue:
                    "Your username cannot be longer than 200 characters, but nice try.",
            }),
        };
    }

    return { legal: true };
}
