import {scoreInit, scoreAdvance, getCurrentPlayer, finalScoreShowcase, getCurrentPlayerScore} from "./scoregame.js";
import {visual, visualInit} from "./visualgame.js";
import { adjustWidth, adjustHeight, myApp, lerp} from "./globalfunc.js";
import { CH, sendToPhone } from "../main.js";
import { clearMapTicker } from "./mapstyles.js";
import { playBowlingVideo } from "./videoPlayer.js";

const texture = await PIXI.Assets.load('./assets/img/pixelbluey.png');
const safetyTexture = await PIXI.Assets.load('./assets/img/safety.jpg');
const loadTexture = await PIXI.Assets.load('./assets/img/loadingScreen.png');
const endTexture = await PIXI.Assets.load('./assets/img/endScreen.png');

const bluey = new PIXI.Sprite(texture), app = new PIXI.Application();
const pinGravity = .325;

const ball = {
    spr: {x: 0, y: 0}, speed: {x: 0, y:-0.0},
    acceleration: {x: -0.00, y:0.0},
    offset: {x: 0, y: 0, ogSize: 125}
}

var debug = false, deltaTime = 0, halfTime = 0;
var yPosTo = 0, gotGutter = false;
var gutterBallLeftThreshold = 0, gutterBallRightThreshold = 0;
var gutterBallLeftPos = 0, gutterBallRightPos = 0;

var pinList = new Array(10), pinCollisionSize = 16, mainLoop = undefined

const pinPos = [
    {x: 0.950, y: 0.355},
    {x: 0.950, y: 0.4525},
    {x: 0.950, y: 0.5475},
    {x: 0.950, y: 0.645},
    {x: 0.900, y: 0.405},
    {x: 0.900, y: 0.50},
    {x: 0.900, y: 0.595},
    {x: 0.850, y: 0.4525},
    {x: 0.850, y: 0.5475},
    {x: 0.800, y: 0.50}
]

var menuObjList = new Array();
const textMainStyle = new PIXI.TextStyle({ fill: 0xFFFFFF, fontSize: 56,
    stroke: {color:0x000000, width:6, join:"round"}})

const textLargeStyle = new PIXI.TextStyle({ fill: 0xFFFFFF, fontSize: 56,
    stroke: {color:0x000000, width:8, join:"round"} })

const textHintStyle = new PIXI.TextStyle({ fill: 0xFFFFFF, fontSize: 24,
    stroke: {color:0x000000, width:4, join:"round"},
    wordWrap : true, wordWrapWidth : 500, align: "center" })

const setPin = (pinNb) =>{
    let newPin = {
        id: pinNb, hit: false,
        pin: {x: pinPos[pinNb].x, y: pinPos[pinNb].y}, 
        offset : { x: 0, y: 0, z: 0, a: 0, ogSize:200, 
            xspeed: 0, yspeed: 0, zspeed: 0, aspeed: 0 }
    }
    newPin.pin.x = newPin.pin.x*app.screen.width
    newPin.pin.y = newPin.pin.y*app.screen.height

    return newPin;
}

const checkPinsHit = (hidePin = true) => {
    let hits = 0;
    for (let i = 0; i < pinList.length; i++) {
        if (pinList[i].hit==1){ hits++; if (hidePin) { pinList[i].hit = 2; } }
    }
    return hits;
}

const setPinsUp = (fullreset) =>{
    for (let i = 0; i < pinList.length; i++) {
        const pin = pinList[i]
        if (fullreset){ pinList[i] = setPin(i); } 
        else {
            if (pin.hit == 0){ pinList[i] = setPin(i); }
            else {
                pin.pin = { x: -30000, y: 0};
                pin.offset.xspeed = 0;
                pin.offset.yspeed = 0;
                pin.offset.zspeed = 0;
                pin.offset.a = 0;
                pin.offset.aspeed = 0;
            }
        }
    }
}

const pinCheckCollision = (pos, pin, otherSize) => {
    let d = { x: (pos.x) - (pin.pin.x), y: (pos.y) - (pin.pin.y) };
    let hypo = Math.hypot(d.x, d.y), dis = (pinCollisionSize + otherSize);
    if (hypo <=  dis){
        pin.hit = true; pin.offset.y = -1;
        pin.offset.xspeed = (Math.sqrt(Math.abs(d.x/2)) * Math.sign(d.x))*-.25
        pin.offset.yspeed = Math.sqrt(Math.abs(d.y/2))*-Math.sign(d.y)
        pin.offset.zspeed = -( (Math.random()*1.5) + 3 )
        pin.offset.aspeed = pin.offset.xspeed*0.5 * Math.abs(pin.offset.yspeed) * 10
        pin.offset.aspeed += Math.random()*4;
    }
}

const pinMove = (pin, time) => {
    pin.offset.zspeed += pinGravity*time.deltaTime;
    pin.pin.x += (pin.offset.xspeed)*time.deltaTime;
    pin.pin.y += (pin.offset.yspeed)*time.deltaTime;

    pin.offset.y += (pin.offset.zspeed)*time.deltaTime;
    pin.offset.a += pin.offset.aspeed*time.deltaTime;

    if (pin.offset.y>=0){
        pin.offset.zspeed *= -( (Math.random()/10)+0.85 );
        pin.offset.aspeed *= ( (Math.random()/10)+0.85 );
        pin.offset.y = -1;
    }

    if (pin.offset.y>-adjustHeight(20)){
        for (let i = 0; i < pinList.length; i++) {
            if (!pinList[i].hit) {
                pinCheckCollision(pin.pin, pinList[i], pinCollisionSize*0.8);}
        }
    }
}

const pinUpdate = (time) =>{
    for (let i = 0; i < pinList.length; i++) {
        if (pinList[i].hit){ pinMove(pinList[i], time); }
        else{ pinCheckCollision(bluey, pinList[i], 24);}
    }
}


const moveSelf = (obj) => {
    if (obj.speed.x<2 && obj.offset.y==0 && obj.spr.x<0 && obj.speed.x!=0){
        obj.speed.x = 2; obj.acceleration.x = 0; obj.acceleration.y *= 1.15 }

    obj.speed.x += obj.acceleration.x * halfTime;
    obj.spr.x += adjustWidth(obj.speed.x) * deltaTime;
    obj.speed.x += obj.acceleration.x * halfTime;

    obj.speed.y += obj.acceleration.y * halfTime;
    obj.spr.y += adjustHeight(obj.speed.y) * deltaTime;
    obj.speed.y += obj.acceleration.y * halfTime;
}

const approach = (curPos, tPos, perc) => {
    return curPos + (tPos-curPos)*perc;
}

const checkGutter = (obj) => {
    const moveAmnt = 1/18; let flag = true;
    if (obj.spr.y>gutterBallRightThreshold){
        obj.spr.y = approach(obj.spr.y, gutterBallRightPos, moveAmnt);
    }else if (obj.spr.y<gutterBallLeftThreshold){
        obj.spr.y = approach(obj.spr.y, gutterBallLeftPos, moveAmnt);
    }else{ flag = false; }

    if (flag){
        if (obj.offset.y==0){ obj.acceleration.x = 0; obj.speed.x = Math.max(obj.speed.x, 6);}
        obj.acceleration.y = 0; obj.speed.y = 0;
        obj.offset.y = approach(obj.offset.y, 20, moveAmnt)
    }
    return flag;
}

const throwBall = (values) => {
    ball.offset.x = 0; ball.offset.y = 0; ball.spr.x = -500;

    ball.spr.y = lerp(gutterBallLeftThreshold, 
        gutterBallRightThreshold, values.position);

    ball.speed = values.speed; ball.acceleration = values.acceleration;

    gotGutter = false;
}

const update = (time) =>{
    deltaTime = time.deltaTime; halfTime = deltaTime/2;

    moveSelf(ball); let isInGutter = checkGutter(ball);

    if (ball.speed.x==0){
        ball.offset.y = approach(ball.offset.y, adjustHeight(32), 1/25*halfTime);
        ball.spr.y = approach(ball.spr.y, yPosTo, 1/18*halfTime);
    }else if (isInGutter){ gotGutter = true; }

    if (ball.spr.x> app.screen.width && ball.speed.x!=0){
        ball.spr.x = app.screen.width; ball.speed = {x: 0, y:0};
        ball.acceleration = {x: 0, y:0};
        
        yPosTo = ( (ball.spr.y>(app.screen.height/2)) ? gutterBallRightPos : gutterBallLeftPos ) + 
            ( (ball.spr.y>(app.screen.height/2)) ? 1 : -1) * adjustHeight(32);
        
        if (debug){ ball.spr.x = -470; ball.speed.x = -.001; ball.offset.y = 1; }
        else{
            setTimeout(() => {
                playBowlingVideo(
                    getCurrentPlayerScore(), 
                    checkPinsHit(false), 
                    gotGutter,
                    () => {
                    setTimeout(() => {
                        ball.speed.x = -0.075;
                        ball.acceleration.x = -0.185;
                    }, 750);
                })
            }, 1250);
        }
    }else if (ball.spr.x < -200 && ball.speed.x<0){
        let pinsHit = checkPinsHit(), result = scoreAdvance(pinsHit);

        if (result==2){
            ball.spr.x = -adjustWidth(300); ball.spr.y = app.screen.height/2;
            ball.speed = {x: 0, y: 0}; ball.acceleration = {x: 0, y: 0};

            let frameText = new PIXI.Text({text:`The End.`, style: textLargeStyle});
            let endScreen = new PIXI.Sprite(endTexture);
        
            frameText.x = app.screen.width*0.745;
            frameText.y = app.screen.height*0.85;
            frameText.zIndex = 19300; endScreen.zIndex = 19299;

            app.stage.addChild(frameText);
            app.stage.addChild(endScreen);

            finalScoreShowcase(textMainStyle);

            sendToPhone(CH.game, {player: ""});
        }else{
            setPinsUp(result);

            if (debug){
                throwBall({
                    speed: {
                        x: 12+Math.random(), 
                        y: Math.sin(Math.random()*Math.PI*2)*2
                    }, acceleration: {
                        x: Math.sin(Math.random()*Math.PI*2)*0.008, 
                        y: Math.sin(Math.random()*Math.PI*2)*0.025
                    }, position: Math.random()
                })
            }else{
                sendToPhone(CH.game, {player: getCurrentPlayer()});
                ball.spr.x = -180; ball.speed.x = 0;
                ball.acceleration = { x: 0, y: 0};
            }
            
        }
    }

}

const mainMenuShow = () => {
    let textMain = new PIXI.Text({ text: "Bowling Game", style: textMainStyle,
        x : adjustWidth(480), y : adjustHeight(45) });

    let textHint = new PIXI.Text({ text: "To start the game, press \"Play\" on your phone and adjust the settings to your preferences.",
        x : adjustWidth(480), y : adjustHeight(136), style: textHintStyle });
    textMain.anchor.set(0.5); textHint.anchor.set(0.5);

    let safetyImage = new PIXI.Sprite(safetyTexture);
    safetyImage.scale = 0.5; safetyImage.anchor.set(0.5)
    safetyImage.x = adjustWidth(480); safetyImage.y = adjustHeight(356);

    let len = adjustWidth(100);
    let line = new PIXI.Graphics().rect(-len*2,0,len*4, 4).fill(0); 
    line.x = adjustWidth(480); line.y = adjustHeight(82);

    app.stage.addChild(textMain, textHint, safetyImage, line);
    menuObjList.push(textMain, textHint, safetyImage, line);
}

const mainRestart = (includeMenu = true) => {
    clearMapTicker(app); app.ticker.remove(mainLoop)
    
    while (app.stage.children.length>0){ app.stage.removeChildAt(0); }
    
    if (includeMenu){ mainMenuShow(); }
}

const mainStart = async () => {
    await app.init({ 
        width  : window.innerWidth -4, height : window.innerHeight-4,
        width :  480*2, height : 270*2, background: '#67AF89',
        //scale_mode: PIXI.SCALE_MODES.NEAREST
    });
    myApp(app); document.querySelector("#pixi-container").appendChild(app.canvas); 
    mainMenuShow(); //PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

    return 0;
}

// Asynchronous IIFE
const main = (playerNames, roundNb, map) => {
    mainRestart(false);
    
    let loadTime = 750, loadingImage = new PIXI.Sprite(loadTexture);
    loadingImage.zIndex = 9999;

    let textLoad = new PIXI.Text({ text: "Loading....",
        x : adjustWidth(650), y : adjustHeight(80),
        style: textLargeStyle, zIndex: 999999 });

    app.stage.addChild(textLoad, loadingImage)
    menuObjList.push(textLoad, loadingImage);

setTimeout( async () => {
    await visualInit(map, app);
    scoreInit(playerNames.length, playerNames, roundNb, app);

    bluey.anchor.set(0.5, 0.5); bluey.setSize(adjustHeight(50));
    bluey.circular = true;

    bluey.x = -500; bluey.y = app.screen.height*0.5; ball.spr = bluey;

    gutterBallLeftThreshold = app.screen.height*0.25;
    gutterBallRightThreshold = app.screen.height*0.75;
    gutterBallLeftPos = app.screen.height*0.2;
    gutterBallRightPos = app.screen.height*0.8;

    if (debug){ ball.speed.x = 12 }; setPinsUp(true);

    // Behind the scenes debug
    if (debug){
        let laneLeft = new PIXI.Graphics()
        .rect(0, gutterBallLeftThreshold, app.screen.width, 1)
        .fill(0x111111); laneLeft.zIndex = 1500;

        let laneRight = new PIXI.Graphics()
        .rect(0, gutterBallRightThreshold, app.screen.width, 1)
        .fill(0x111111); laneRight.zIndex = 1500;

        let laneSpr = new PIXI.Graphics()
        .rect(0, gutterBallLeftThreshold, app.screen.width, gutterBallRightThreshold-gutterBallLeftThreshold)
        .fill(0x555555); laneSpr.zIndex = 1500;
        bluey.zIndex = 1550; laneSpr.alpha = 0.3;

        for (let i = 0; i < pinList.length; i++) {
            let spr = new PIXI.Graphics().circle(0,0,pinCollisionSize).fill(0x1FA955);
            spr.x = pinList[i].pin.x; spr.y = pinList[i].pin.y; spr.zIndex = 600;

            app.stage.addChild(spr);
        }

        app.stage.addChild(laneRight, laneLeft, laneSpr, bluey);
    }

    app.ticker.remove(mainLoop);

    mainLoop = (time) =>{
        try{
            update(time); visual(time,  ball, pinList); pinUpdate(time);
        }catch(e){
            document.querySelector("#error").innerText = e.message;
            sendToPhone(CH.data, {error: e.message}); console.error(e);
        }
    }
    app.ticker.add(mainLoop)

    while(menuObjList.length>0){ app.stage.removeChild(menuObjList.shift()); }

    sendToPhone(CH.game, {player: playerNames[0]});

}, loadTime);

};

export { main, mainStart, throwBall, mainRestart };