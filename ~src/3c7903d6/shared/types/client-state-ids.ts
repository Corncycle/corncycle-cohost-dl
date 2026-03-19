export enum ClientStateID {
    COHOST_LOADER_STATE = "__COHOST_LOADER_STATE__",
    COHOST_LAYOUT = "__COHOST_LAYOUT__",
    SITE_CONFIG = "site-config",
    USER_INFO = "user-info",
    INITIAL_I18N_STORE = "initialI18nStore",
    INITIAL_LANGUAGE = "initialLanguage",
    FLASHES = "flashes",
    ROLLBAR_CONFIG = "rollbar-config",
    UNLEASH_BOOTSTRAP = "unleash-bootstrap",
    ENV_VARS = "env-vars",
    TRPC_DEHYRDATED_STATE = "trpc-dehydrated-state",
    INITIAL_MUTABLE_STORE = "initial-mutable-store",
}

export default ClientStateID;
