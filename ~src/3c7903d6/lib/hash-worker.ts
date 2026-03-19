import * as b64arraybuffer from "base64-arraybuffer";

/**
 * run an expensive password hash in the background so it doesn't hang the
 * user's browser for a noticeable amount of time
 */
onmessage = async (
    e: MessageEvent<{ password: string; salt: string }>
): Promise<void> => {
    try {
        // do PBKDF2-HMAC-SHA2 with the Web Crypto API as a client-side hashing
        // algorithm so that users don't have to d/l libsodium, which is huge
        const PBKDF2_PARAMS = {
            name: "PBKDF2",
            hash: "SHA-384",
            iterations: 200000,
            salt: b64arraybuffer.decode(e.data.salt),
        };

        const pwdEncoder = new TextEncoder();
        const pwdArray = pwdEncoder.encode(e.data.password);

        const start = Date.now();

        const baseKey = await crypto.subtle.importKey(
            "raw",
            pwdArray,
            PBKDF2_PARAMS,
            false,
            ["deriveKey"]
        );

        const derivedKey = await crypto.subtle.deriveKey(
            PBKDF2_PARAMS,
            baseKey,
            { name: "HMAC", hash: "SHA-384" },
            true,
            ["sign"]
        );

        const hash = await crypto.subtle.exportKey("raw", derivedKey);

        const end = Date.now();

        console.log(
            `worker: finished ${PBKDF2_PARAMS.iterations} ` +
                `iterations in ${end - start}ms`
        );

        postMessage({ clientHash: b64arraybuffer.encode(hash) }, undefined);
    } catch (e) {
        console.error(e);
    }
};
