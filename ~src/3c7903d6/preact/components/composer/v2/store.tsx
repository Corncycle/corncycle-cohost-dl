import { addListener, configureStore } from "@reduxjs/toolkit";
import { postComposerSlice } from "./reducer";

import { listenerMiddleware } from "./middleware";

// for now this lives inside the post composer, but as other components move
// to redux, it should move out into the client toplevel
export const store = configureStore({
    reducer: {
        [postComposerSlice.reducerPath]: postComposerSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
