import React, {
    FunctionComponent,
    createContext,
    useContext,
    ReactNode,
} from "react";

export type ReqMutableStoreType = {
    ssrUrl: string;
    lightThemeOnly: boolean;
};

export const defaultMutableStore: ReqMutableStoreType = {
    ssrUrl: "",
    lightThemeOnly: false,
};

class ReqMutableStore {
    constructor(private _store: ReqMutableStoreType) {
        this._store = Object.assign({}, _store);
    }

    get<K extends keyof ReqMutableStoreType>(key: K): ReqMutableStoreType[K] {
        return this._store[key];
    }

    assign(newConfig: Partial<ReqMutableStoreType>) {
        Object.assign(this._store, newConfig);
    }
}

const ReqMutableStoreContext = createContext<ReqMutableStore>(
    new ReqMutableStore({ ...defaultMutableStore })
);

export const ReqMutableStoreProvider: FunctionComponent<{
    children: ReactNode;
    store: ReqMutableStoreType;
}> = React.memo(({ children, store }) => {
    const mutableStore = new ReqMutableStore(store);
    return (
        <ReqMutableStoreContext.Provider value={mutableStore}>
            {children}
        </ReqMutableStoreContext.Provider>
    );
});
ReqMutableStoreProvider.displayName = "ReqMutableStoreProvider";

export const useReqMutableStore = () => useContext(ReqMutableStoreContext);
