import * as LoginV1Types from "@/shared/api-types/login-v1";

export default class AuthHelpers {
    static async getSalt(email: string): Promise<string> {
        const url = new URL("/api/v1/login/salt", document.URL);
        url.searchParams.append("email", email);

        const response = await fetch(url.toString()).then((resp) =>
            resp.json().then((data) => data as LoginV1Types.GetSaltResp)
        );

        return response.salt;
    }

    static async hashPasswordInWorker(
        email: string,
        salt: string,
        password: string
    ): Promise<string> {
        // run this slow hash function in the background
        // const hashWorker = new Worker("/static/hash-worker.js");
        const hashWorker = new Worker(
            new URL("./hash-worker.ts", import.meta.url)
        );

        return new Promise((resolve) => {
            hashWorker.onmessage = (
                e: MessageEvent<{
                    clientHash: string;
                }>
            ): void => {
                resolve(e.data.clientHash);
            };

            hashWorker.postMessage({ email, password, salt });
        });
    }
}
