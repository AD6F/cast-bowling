import { main, mainStart, throwBall } from "./src/game.js";

const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const context = cast.framework.CastReceiverContext.getInstance();
const CH = {
    settings : 'urn:x-cast:setting',
    game : 'urn:x-cast:game'
};

var settings = undefined;

await mainStart();

context.addCustomMessageListener(CH.settings,(customEvent) => {	
    const pos = JSON.stringify(customEvent.data);
    settings = customEvent.data;

    main(settings.players, settings.round, settings.map);
    
    document.querySelector("#result").innerText = pos;
    
    context.sendCustomMessage(CH.settings, undefined, "settings updated");
});

context.addCustomMessageListener(CH.game, (customEvent) => {
    const data = customEvent.data;
    const throwAngle = ( (data.rotation/100)*180 ) - 90;
    const radian = throwAngle * Math.PI /180;
    const force = data.force/5;

    const accelAngle = ((data.tilt-70)*90) * Math.PI /180
    const accelForce = force/20;

    var result = { 
        speed: {x: Math.abs(Math.cos(radian)*force), y:Math.sin(radian)*force*0.125},
        acceleration: {
            x: Math.cos(accelAngle)*accelForce, 
            y:Math.sin(accelAngle)*accelForce
        },
        position: 0.5 - (Math.sin(radian)*0.25)
    }

    throwBall(result);

    document.querySelector("#game").innerText = JSON.stringify(result);
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

context.addEventListener(cast.framework.system.EventType.ERROR, (e) => {
    try{
        if (!castDebugLogger.debugOverlayElement_) {
            document.querySelector("#result").innerText = JSON.stringify(e);
        }
    }catch(e){
        document.querySelector("#result").innerText = "Even the error event is messed up."
    }
});

castDebugLogger.loggerLevelByEvents = {
  'cast.framework.events.category.CORE': cast.framework.LoggerLevel.INFO,
  'cast.framework.events.EventType.MEDIA_STATUS': cast.framework.LoggerLevel.DEBUG
}

const options = new cast.framework.CastReceiverOptions();

options.customNamespaces = Object.assign({});
options.customNamespaces[CH.settings] = cast.framework.system.MessageType.JSON;
options.customNamespaces[CH.game] = cast.framework.system.MessageType.JSON;
options.disableIdleTimeout = true;

context.start(options);

const sendToPhone = (channel, msg) => {
    context.sendCustomMessage(channel, undefined, JSON.stringify(msg));
}

export { CH, sendToPhone }

//main(["owo", "iwi"], 4, 6);
//
//
//setTimeout( () => {
//    throwBall({ 
//        speed: {x: 8, y:-0.955},
//        acceleration: {x: -0.002, y:0.0150},
//        position: 0.275
//    })
//}, 1000);