console.log("VERY START");
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const context = cast.framework.CastReceiverContext.getInstance();
const CH = {
    settings : 'urn:x-cast:setting',
    game : 'urn:x-cast:game'
};
console.log("INITIALIZE");

context.addCustomMessageListener(CH.settings, (customEvent) => {
	const pos = `${customEvent.data}`;
    console.log(pos);
    document.querySelector("#result").innerText = pos;
    context.sendCustomMessage(CH.settings, undefined, "settings updated");
});

context.addCustomMessageListener(CH.game, (customEvent) => {
	const pos = `${customEvent.data}`;
    console.log(pos);
    document.querySelector("#game").innerText = pos;
    context.sendCustomMessage(CH.game, undefined, "ball throw");
});

context.addEventListener(cast.framework.system.EventType.READY, () => {
    if (!castDebugLogger.debugOverlayElement_) {
        // Enable debug logger and show a 'DEBUG MODE' overlay at top left corner.
        castDebugLogger.setEnabled(true);
        // Show debug overlay
        castDebugLogger.showDebugLogs(true);
        // Clear log messages on debug overlay
        castDebugLogger.clearDebugLogs();
        document.querySelector("#result").innerText = "connected";
    }
});

console.log("MAKE EVENT LISTENERS");

castDebugLogger.loggerLevelByEvents = {
  'cast.framework.events.category.CORE': cast.framework.LoggerLevel.INFO,
  'cast.framework.events.EventType.MEDIA_STATUS': cast.framework.LoggerLevel.DEBUG
}

console.log("LOGGERS EVENTS");

console.log("START CAST");

const options = new cast.framework.CastReceiverOptions();

options.customNamespaces = Object.assign({});
options.customNamespaces[CH.settings] = cast.framework.system.MessageType.JSON;
options.customNamespaces[CH.game] = cast.framework.system.MessageType.JSON;
options.disableIdleTimeout = true;

context.start(options);

console.log("PIXI");

// Create a PixiJS application.
var app = new PIXI.Application({ width: 1080, height: 720, backgroundColor: 0x1099bb });
document.querySelector('#container').appendChild(app.view);

console.log("LOADING..");