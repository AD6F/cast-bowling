import { main, mainStart, throwBall } from "./src/game.js";

console.log("VERY START");
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const context = cast.framework.CastReceiverContext.getInstance();
const CH = {
    settings : 'urn:x-cast:setting',
    game : 'urn:x-cast:game'
};
console.log("INITIALIZE");

var settings = undefined;

await mainStart();

context.addCustomMessageListener(CH.settings, (customEvent) => {
	const pos = JSON.stringify(customEvent.data);
    let obj = JSON.parse(pos);
    settings = obj;

    main(obj.players, obj.round, obj.map);
    
    document.querySelector("#result").innerText = pos;
    
    //context.sendCustomMessage(CH.settings, undefined, "settings updated");
});

context.addCustomMessageListener(CH.game, (customEvent) => {
    const data = customEvent.data;
    const angle = (data.direction/100)*180;
    const radian = angle * Math.PI /180;
    const force = data.force/5;
    var result = { 
        speed: {x: Math.sin(radian)*force, y:Math.cos(radian)*force},
        acceleration: {x: -0.002, y:0.0150},
        position: 0.275
    }

    throwBall(result);

    document.querySelector("#game").innerText = JSON.stringify(result);

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

console.log("LOADING..");

console.log("LOOP");

//main(["owo", "iwi"], 4, 1);
//
//
//setTimeout( () => {
//    throwBall({ 
//        speed: {x: 8, y:-0.955},
//        acceleration: {x: -0.002, y:0.0150},
//        position: 0.275
//    })
//}, 1000);