/**
 * this needs to have its own file because reducer.tsx needs to import it in
 * order to add middleware listeners, but all the other natural places to put
 * it would create an import cycle which makes jest choke and die.
 */
import { addListener, createListenerMiddleware } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./store";

export const listenerMiddleware = createListenerMiddleware();
export const startAppListening = listenerMiddleware.startListening.withTypes<
    RootState,
    AppDispatch
>();

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
