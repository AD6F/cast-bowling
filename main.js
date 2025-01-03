import { main, mainRestart, mainStart, throwBall } from "./src/game.js";
import { getApp } from "./src/globalfunc.js";

const castDebugLogger = cast.debug.CastDebugLogger.getInstance();
const context = cast.framework.CastReceiverContext.getInstance();
const CH = {
    settings : 'urn:x-cast:setting',
    game : 'urn:x-cast:game',
    data : 'urn:x-cast:data',
    nav : 'urn:x-cast:navigation'
};

const rebuildGame = (action) => {
    mainRestart(action==0);

    if (action==1){
        main(settings.players, settings.round, settings.map);
        sendToPhone(CH.game, {player: settings.players[0]})
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

context.addCustomMessageListener(CH.nav,(customEvent) => {
    rebuildGame(customEvent.data.page)
});

context.addCustomMessageListener(CH.game, (customEvent) => {
    const data = customEvent.data;
    document.querySelector("#result").innerText = JSON.stringify(data);

    const throwAngle = (( (data.rotation/100)*180 ) - 90)*0.9;
    const throwRadian = throwAngle * Math.PI /180;
    const force = Math.sqrt(data.force*3);

    const accelAngle = (( ( (data.tilt/100)*180) - 90 ) * 0.5) * Math.PI /180
    //const accelAngle = (((data.tilt-70)/40)*75) * Math.PI /180
    const accelForce = force/96;

    var result = { 
        speed: {
            x: Math.abs(Math.cos(throwRadian)*force), 
            y: Math.sin(throwRadian)*force
        },
        acceleration: {
            x: Math.cos(accelAngle)*accelForce, 
            y: Math.abs((data.tilt-50))/3000 + Math.sin(accelAngle)*accelForce
        },
        position: 0.5 - (Math.sin(throwRadian)*0.105)
    }

    result.acceleration.y *= -0.9*(result.speed.y);
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

//setTimeout(()=>{
//    main(["player", "loki", "kira", "jesse"], 4, 0)
//    
//    setInterval(()=>{
//        //throwBall({
//        //    speed:{x:9, y:-1.01},
//        //    position:0.465,
//        //    acceleration:{x:0.1085,y:0.02125}
//        //})
//        //throwBall({
//        //    speed:{x:7.1, y:-1.01},
//        //    position:0.45,
//        //    acceleration:{x:0.1085,y:0.02525}
//        //})
//        throwBall({
//            speed:{x:15+Math.random(), y:-1+Math.random()},
//            position:0.25+(Math.random()/2),
//            acceleration:{x:0.12*Math.random(),y:0.02*Math.random()}
//        })
//    }, 14500)
//}, 100)

export { CH, sendToPhone }