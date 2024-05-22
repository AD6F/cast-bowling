import { main, mainRestart, mainStart, throwBall } from "./src/game.js";

const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const context = cast.framework.CastReceiverContext.getInstance();
const CH = {
    settings : 'urn:x-cast:setting',
    game : 'urn:x-cast:game',
    data : 'urn:x-cast:data'
};

const rebuildGame = (action) => {
    mainRestart(action);

    if (action==0){
        main(settings.players, settings.round, settings.map);
        context.sendCustomMessage(CH.game, undefined, {player: settings.players[0]});
    }
}

const sendToPhone = (channel, msg) => {
    try{
        context.sendCustomMessage(channel, undefined, msg);
    }catch(e){
        document.querySelector("#error").innerText = "cast send error"
    }
}

var settings = {
    players: ["P1", "Doggy", "Achr", "Meow"],
    round: 10, map: 5
};

await mainStart();

context.addCustomMessageListener(CH.settings,(customEvent) => {	
    const pos = JSON.stringify(customEvent.data);
    settings = customEvent.data;

    main(settings.players, settings.round, settings.map);
    
    document.querySelector("#result").innerText = pos;
});

context.addCustomMessageListener(CH.game, (customEvent) => {
    const data = customEvent.data;
    document.querySelector("#result").innerText = JSON.stringify(data);
    if (data.endGameAction!=undefined){
        rebuildGame(data.endGameAction)

        return 0;
    }

    const throwAngle = (( (data.rotation/100)*180 ) - 90)*0.9;
    const throwRadian = throwAngle * Math.PI /180;
    const force = Math.sqrt(data.force*3);

    const accelAngle = (( ( (data.tilt/100)*180) - 90 ) * 0.5) * Math.PI /180
    //const accelAngle = (((data.tilt-70)/40)*75) * Math.PI /180
    const accelForce = force/64;

    var result = { 
        speed: {
            x: Math.abs(Math.cos(throwRadian)*force), 
            y: Math.sin(throwRadian)*force
        },
        acceleration: {
            x: 0,//Math.cos(accelAngle)*accelForce, 
            y: Math.abs((data.tilt-50))/3000//Math.sin(accelAngle)*accelForce
        },
        position: 0.5 - (Math.sin(throwRadian)*0.105)
    }

    result.acceleration.y *= -Math.sign(result.speed.y);
    result.speed.y = Math.sqrt(Math.abs(result.speed.y))*Math.sign(result.speed.y)

    throwBall(result);

    document.querySelector("#game").innerText = JSON.stringify(result);

    sendToPhone(CH.data, {throw: data, result: result});
});

context.addCustomMessageListener(CH.data, (customEvent) => {
    
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

context.addEventListener(cast.framework.system.EventType.SHUTDOWN, () => {
    sendToPhone(CH.settings, {action: "end"});
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
options.customNamespaces[CH.data] = cast.framework.system.MessageType.JSON;
options.disableIdleTimeout = true;

context.start(options);



export { CH, sendToPhone }

//main(["owo", "axol"], 4, 5);
//
//throwBall({ 
//    speed: {x: 35, y:-0.955},
//    acceleration: {x: -0.002, y:0.0150},
//    position: 0.275
//})
//
//
//setInterval( () => {
//    throwBall({ 
//        speed: {x: 35, y:-1.085},
//        acceleration: {x: -0.002, y:0.0150},
//        position: 0.5
//    })
//}, 8000);