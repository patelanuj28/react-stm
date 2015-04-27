module.exports = {
    // what port to serve the application on
    APP_PORT: 3000,
    // what port to run the hot-reloader dev proxy server on
    WEBPACK_PORT: 3001,
    // where is the STM that the UI should make REST calls to
    STM_HOST: '10.100.141.98',
    // how often to poll (in milliseconds) the STM REST API for changes
    POLL_INTERVAL: 5000
};
