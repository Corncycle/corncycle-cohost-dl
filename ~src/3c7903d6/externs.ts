export {};

/**
 * needed for the webpack jsdom external to work
 */
declare global {
    interface Window {
        jsdom: unknown;
    }
}
window.jsdom = {
    JSDOM: 0,
};
