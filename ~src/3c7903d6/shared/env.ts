class EnvVars {
    store: Record<string, string> = {};

    setEnv(newEnv: Record<string, string>) {
        this.store = { ...newEnv };
    }

    private getEnvVal(key: string) {
        if (typeof window === "undefined") {
            // node
            return process.env[key];
        } else {
            return this.store[key];
        }
    }

    get HOME_URL() {
        let defaultVal = "";
        // on the client, we already know what our URL is so we can make a Guess
        // in case this gets called early somehow.
        if (
            typeof window !== "undefined" &&
            typeof window.location !== "undefined"
        ) {
            defaultVal = window.location.origin;
        }
        return this.getEnvVal("HOME_URL") || defaultVal;
    }

    get VERSION() {
        return this.getEnvVal("VERSION") || "";
    }
}

export const env = new EnvVars();
