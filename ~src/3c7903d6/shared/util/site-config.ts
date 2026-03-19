import { AttachmentKind } from "@/shared/types/attachments";

export type SiteConfigType = {
    HCAPTCHA_SITE_KEY: string;
    IFRAMELY_KEY: string;
    UNLEASH_APP_NAME: string;
    UNLEASH_CLIENT_KEY: string;
    limits: {
        attachmentSize: {
            normal: number;
            cohostPlus: number;
        };
        attachmentCount: number;
        attachmentContentTypes: Record<string, AttachmentKind>;
    };
    operatingPrime: number;
};

export const defaultConfig: SiteConfigType = {
    HCAPTCHA_SITE_KEY: "",
    IFRAMELY_KEY: "",
    UNLEASH_APP_NAME: "",
    UNLEASH_CLIENT_KEY: "",
    limits: {
        attachmentSize: {
            normal: 5 * 1024 * 1024,
            cohostPlus: 10 * 1024 * 1024,
        },
        attachmentCount: 10,
        attachmentContentTypes: {
            // fastly supports gif, jpeg, png, and webp. we also support svg. see:
            // https://developer.fastly.com/reference/io/#limitations-and-constraints
            "image/png": "image",
            "image/jpeg": "image",
            "image/gif": "image",
            "image/webp": "image",
            "image/svg+xml": "image",
            // list of audio formats taken from https://caniuse.com/?search=audio%20format,
            // >= 95% as of 7/10/2023
            "audio/aac": "audio",
            "audio/mp4": "audio",
            "audio/x-m4a": "audio",
            "audio/flac": "audio",
            "audio/x-flac": "audio",
            "audio/mpeg": "audio",
            "audio/wav": "audio",
        },
    },
    operatingPrime: 1,
} as const;

export function isValidAttachmentContentType(
    siteConfig: SiteConfigType,
    contentType: string
): { valid: false } | { valid: true; kind: AttachmentKind } {
    for (const supportedContentType in siteConfig.limits
        .attachmentContentTypes) {
        const kind =
            siteConfig.limits.attachmentContentTypes[supportedContentType];

        if (supportedContentType.endsWith("/*")) {
            // wildcard; truncate it off and check the start of the content
            // type
            if (
                contentType.startsWith(
                    supportedContentType.substring(
                        0,
                        supportedContentType.length - 1
                    )
                )
            )
                return { valid: true, kind };
        } else {
            // otherwise check identity
            if (contentType === supportedContentType)
                return { valid: true, kind };
        }
    }

    console.warn(`rejected mime type: ${contentType}`);
    return { valid: false };
}

export function listValidAttachmentContentTypes(
    siteConfig: SiteConfigType
): string[] {
    return Object.getOwnPropertyNames(siteConfig.limits.attachmentContentTypes);
}

export class SiteConfig {
    private _currentConfig: SiteConfigType;

    private constructor(config: SiteConfigType) {
        this._currentConfig = config;
    }

    get currentConfig() {
        return this._currentConfig;
    }

    assign(changes: Partial<SiteConfigType>) {
        this._currentConfig = {
            ...this._currentConfig,
            ...changes,
        };
    }

    public static shared = new SiteConfig({ ...defaultConfig });
}
