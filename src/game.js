import {score, scoreInit, scoreAdvance, getCurrentPlayer} from "./scoregame.js";
import {visual, visualInit} from "./visualgame.js";
import { adjustWidth, adjustHeight, myApp, lerp} from "./globalfunc.js";
import { CH, sendToPhone } from "../main.js";

const texture = await PIXI.Assets.load('./assets/img/pixelbluey.png');

const bluey = new PIXI.Sprite(texture);
const app = new PIXI.Application();

const pinGravity = .325;

const ball = {
    spr: {x: 0, y: 0}, 
    speed: {x: 0, y:-0.0},
    acceleration: {x: -0.00, y:0.0},
    offset: {x: 0, y: 0, ogSize: 125}
}

var debug = false;

var elapsedTime = 0;
var deltaTime = 0; 
var halfTime = 0;

var isWaitingForThrow = false

var gutterBallLeftThreshold = 0;
var gutterBallRightThreshold = 0;
var gutterBallLeftPos = 0;
var gutterBallRightPos = 0;


var pinList = new Array(10)
var pinCollisionSize = 16;

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

const setPin = (pinNb) =>{
    let newPin = {
        id: pinNb, hit: false,
        pin: {x: pinPos[pinNb].x, y: pinPos[pinNb].y}, 
        offset : {
            x: 0, y: 0, z: 0, a: 0, ogSize:200, 
            xspeed: 0, yspeed: 0, zspeed: 0, aspeed: 0
        }
    }
    newPin.pin.x = newPin.pin.x*app.screen.width
    newPin.pin.y = newPin.pin.y*app.screen.height

    return newPin;
}

const checkPinsHit = () => {
    let hits = 0;
    for (let i = 0; i < pinList.length; i++) {
        if (pinList[i].hit==1){
            hits++; pinList[i].hit = 2;
        }
    }
    return hits;
}

const setPinsUp = (fullreset) =>{
    for (let i = 0; i < pinList.length; i++) {
        if (fullreset){
            pinList[i] = setPin(i);
        }else{
            if (pinList[i].hit == 0){
                pinList[i] = setPin(i);
            }else{
                pinList[i].pin = { x: -30000, y: 0};
                pinList[i].offset.xspeed = 0;
                pinList[i].offset.yspeed = 0;
                pinList[i].offset.zspeed = 0;
                pinList[i].offset.a = 0;
                pinList[i].offset.aspeed = 0;
            }
        }
    }
}

const pinCheckCollision = (pos, pin, otherSize) => {
    let d = { x: (pos.x) - (pin.pin.x), y: (pos.y) - (pin.pin.y) };
    let hypo = Math.hypot(d.x, d.y);
    let dis = (pinCollisionSize + otherSize);
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
    pin.pin.x += (pin.offset.xspeed)*time.deltaTime
    pin.pin.y += (pin.offset.yspeed)*time.deltaTime

    pin.offset.y += (pin.offset.zspeed)*time.deltaTime;
    pin.offset.a += pin.offset.aspeed*time.deltaTime;

    if (pin.offset.y>=0){
        pin.offset.zspeed *= -( (Math.random()/10)+0.85 )
        pin.offset.aspeed *= ( (Math.random()/10)+0.85 )
        pin.offset.y = -1
    }

    if (pin.offset.y>-adjustHeight(20)){
        for (let i = 0; i < pinList.length; i++) {
            if (!pinList[i].hit){
                pinCheckCollision(pin.pin, pinList[i], pinCollisionSize*0.8);
            }
        }
    }
}

const pinUpdate = (time) =>{
    for (let i = 0; i < pinList.length; i++) {
        if (pinList[i].hit){
            pinMove(pinList[i], time);
        }else{
            pinCheckCollision(bluey, pinList[i], 24);
        }
        
    }
}

//https://stackoverflow.com/questions/59725062/pixi-js-how-to-detect-end-of-movie-callback-for-ended-event
const playBowlingVideo = async (url, customFunc) =>{
    let videoSource = await PIXI.Assets.load({
        src: url, data:{ preload: false, autoPlay: true, loop: false }
    });
    
    let video = new PIXI.Sprite(videoSource);
    video.zIndex = 10;

    video.texture.source.source.resource.addEventListener("ended", async (event) => {
        customFunc(); 
        await PIXI.Assets.unload(url); 
        video.destroy();
    });

    video.anchor.set(0.5, 0);
    video.x = app.screen.width * 0.75;
    video.y = app.screen.height*0.005;

    video.width = adjustWidth(320);
    video.height = adjustHeight(200);

    app.stage.addChild(video);
}

const moveSelf = (obj) => {
    if (obj.speed.x<2 && obj.offset.y==0 && obj.spr.x<0 && obj.speed.x!=0){
        obj.speed.x = 2
        obj.acceleration.x = 0
        obj.acceleration.y *= 1.15
    }
    obj.speed.x += obj.acceleration.x * halfTime;
    obj.spr.x += adjustWidth(obj.speed.x) * deltaTime;
    obj.speed.x += obj.acceleration.x * halfTime;


    obj.speed.y += obj.acceleration.y * halfTime;
    obj.spr.y += adjustHeight(obj.speed.y) * deltaTime;
    obj.speed.y += obj.acceleration.y * halfTime;
}

const approach = (curPos, tPos, perc) => {
    curPos += (tPos-curPos)*perc
    return curPos;
}

const checkGutter = (obj) => {
    const moveAmnt = 1/18; let flag = false;
    if (obj.spr.y>gutterBallRightThreshold){
        obj.spr.y = approach(obj.spr.y, gutterBallRightPos, moveAmnt);
        flag = true;
    }else if (obj.spr.y<gutterBallLeftThreshold){
        obj.spr.y = approach(obj.spr.y, gutterBallLeftPos, moveAmnt);
        flag = true;
    }

    if (flag){
        if (obj.offset.y==0){ 
            obj.acceleration.x = 0; 
            obj.speed.x = Math.max(obj.speed.x, 6);
        }
        obj.acceleration.y = 0; obj.speed.y = 0;
        obj.offset.y = approach(obj.offset.y, 20, moveAmnt)
    }
}

const throwBall = (values) => {
    ball.offset.x = 0;
    ball.offset.y = 0;

    ball.spr.x = -500;
    ball.spr.y = lerp(gutterBallLeftThreshold, 
        gutterBallRightThreshold, values.position);

    ball.speed = values.speed;

    ball.acceleration = values.acceleration;
}

var yPosTo = 0;
const update = (time) =>{
    elapsedTime += time.elapsedMS;
    deltaTime = time.deltaTime; halfTime = deltaTime/2;

    moveSelf(ball); checkGutter(ball);

    if (ball.speed.x==0){
        ball.offset.y = approach(ball.offset.y, adjustHeight(32), 1/25*halfTime);
        ball.spr.y = approach(ball.spr.y, yPosTo, 1/18*halfTime);
    }

    if (ball.spr.x> app.screen.width && ball.speed.x!=0){
        ball.spr.x = app.screen.width;
        ball.speed = {x: 0, y:0};
        ball.acceleration = {x: 0, y:0};
        if (ball.spr.y>(app.screen.height/2)){
            yPosTo = gutterBallRightPos+adjustHeight(32);
        }else{
            yPosTo = gutterBallLeftPos-adjustHeight(32);
        }
        
        
        if (debug){
            ball.spr.x = -270;
            ball.speed.x = -4;
        }else{
            setTimeout(() => {
                playBowlingVideo("./assets/video/fem.mp4", () => {
                    setTimeout(() => {
                        ball.speed.x = -0.05;
                        ball.acceleration.x = -0.0825;
                        console.log("imgettingreset");
                    }, 1000);
                })
            }, 1500);
        }
    }else if (ball.spr.x < -200 && ball.speed.x<0){
        let pinsHit = checkPinsHit();
        let previousPlayer = getCurrentPlayer();
        let result = scoreAdvance(pinsHit);

        if (result==2){
            ball.spr.x = -adjustWidth(300);
            ball.spr.y = app.screen.height/2;
            ball.speed.y = 0; ball.speed.x = 0;
            ball.acceleration.y = 0; ball.acceleration.x = 0;
            let frameText = new PIXI.Text({text:`Fin.`});
        
            frameText.x = app.screen.width*0.75;
            frameText.y = app.screen.height*0.4;
            frameText.zIndex = 1200;

            app.stage.addChild(frameText);
            sendToPhone(CH.game, {player: ""});
        }else{
            try{
                sendToPhone(CH.game, {player: getCurrentPlayer()});
            }catch(e){
                document.querySelector("#result").innerText = "error: " + getCurrentPlayer()
            }
            
            setPinsUp(result);
            ball.spr.x = -180; ball.speed.x = 0;
            ball.acceleration = { x: 0, y: 0};
        }
    }

}

var menuObjList = [];

const mainStart = async () => {
    await app.init({ 
        width  : window.innerWidth -4,
        height : window.innerHeight-4,
        width :  480*2, height : 270*2,
        background: '#111111'
    });
    myApp(app);

    document.querySelector("#pixi-container").appendChild(app.canvas);

    let txtMainStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF, fontSize: 40,
        stroke: {color:0x000000, width:6, join:"round"}
    })
    let txtHintStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF, fontSize: 20,
        stroke: {color:0x000000, width:2, join:"round"},
        wordWrap : true, wordWrapWidth : 300
    })

    let textMain = new PIXI.Text({
        text: "Bowling", style: txtMainStyle,
        x : adjustWidth(34), y : adjustHeight(45)
    });

    let textHint = new PIXI.Text({
        text: "To start the game, press \"Play\" on your phone and adjust the settings to your preferences.",
        x : adjustWidth(55), y : adjustHeight(100),
        style: txtHintStyle
    });


    app.stage.addChild(textMain);
    app.stage.addChild(textHint);

    menuObjList = [textMain, textHint];

    return 0;
}

// Asynchronous IIFE
const main = (playerNames, roundNb, map) => {
    menuObjList.forEach( (value) => {
        app.stage.removeChild(value);
    });

    menuObjList = [];

    visualInit(map, app);
    scoreInit(playerNames.length, playerNames, roundNb, app);

    bluey.anchor.set(0.5, 0.5);

    bluey.setSize(adjustHeight(50));
    bluey.circular = true;

    bluey.x = -500; bluey.y = app.screen.height*0.5;

    ball.spr = bluey;

    gutterBallLeftThreshold = app.screen.height*0.25
    gutterBallRightThreshold = app.screen.height*0.75
    gutterBallLeftPos = app.screen.height*0.2
    gutterBallRightPos = app.screen.height*0.8

    setPinsUp(true);

    // Behind the scenes debug
    if (debug){
        let laneLeft = new PIXI.Graphics()
        .rect(0, gutterBallLeftThreshold, app.screen.width, 1)
        .fill(0x111111);
        laneLeft.zIndex = 1500;

        let laneRight = new PIXI.Graphics()
        .rect(0, gutterBallRightThreshold, app.screen.width, 1)
        .fill(0x111111);
        laneRight.zIndex = 1500;

        let laneSpr = new PIXI.Graphics()
        .rect(0, gutterBallLeftThreshold, app.screen.width, gutterBallRightThreshold-gutterBallLeftThreshold)
        .fill(0x555555);
        laneSpr.zIndex = 1500;
        bluey.zIndex = 1550

        laneSpr.alpha = 0.3;

        pinCollisionSize = adjustHeight(pinCollisionSize);

        for (let i = 0; i < pinList.length; i++) {
            let spr = new PIXI.Graphics()
            .circle(0, 0, pinCollisionSize)
            .fill(0x1FA955);

            spr.x = pinList[i].pin.x; spr.y = pinList[i].pin.y;
            spr.zIndex = 600

            app.stage.addChild(spr);
        }

        app.stage.addChild(laneRight);
        app.stage.addChild(laneLeft);
        app.stage.addChild(laneSpr);
        app.stage.addChild(bluey);
    }

    app.ticker.add((time) =>{
        try{
            update(time); score(time);
            visual(time,  ball, pinList);
            pinUpdate(time);
        }catch(e){
            document.querySelector("#error").innerText = e;
            console.error(e);
        }
    })

    return 0;
};

export { main, mainStart, throwBall };