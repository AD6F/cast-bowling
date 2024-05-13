import {score, scoreInit, scoreAdvance} from "./scoregame.js";
import {visual, visualInit} from "./visualgame.js";
import { adjustWidth, adjustHeight, myApp, lerp, adjustWidthReverse, adjustHeightReverse, getXmulti } from "./globalfunc.js";

// Load the bluey texture.
const texture = await PIXI.Assets.load('./pixelbluey.png');

// Create a new Sprite from an image path
const bluey = new PIXI.Sprite(texture);
const app = new PIXI.Application();


var elapsedTime = 0;
var deltaTime = 0; 
var halfTime = 0;

var pinList = new Array(10)

var gutterBallLeftThreshold = 0;
var gutterBallRightThreshold = 0;
var gutterBallLeftPos = 0;
var gutterBallRightPos = 0;

const pinGravity = .325;
var pinCollisionSize = 16;

var debug = false;

const ball = {
    spr: {x: 0, y: 0}, 
    speed: {x: 8, y:-0.955},
    acceleration: {x: -0.002, y:0.0150},
    offset: {x: 0, y: 0, ogSize: 125}
}

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
        id: pinNb, 
        pin: {x: pinPos[pinNb].x, y: pinPos[pinNb].y}, 
        hit: false,
        offset : {
            x: 0, y: 0, z: 0, a: 0,
            ogSize:200, 
            xspeed: 0, 
            yspeed: 0,
            zspeed: 0,
            aspeed: 0
        }
    }
    newPin.pin.x = newPin.pin.x*app.screen.width
    newPin.pin.y = newPin.pin.y*app.screen.height

    return newPin;
}

const checkPinsHit = () => {
    let hits = 0;
    for (let i = 0; i < pinList.length; i++) {
        const element = pinList[i];
        if (element.hit==1){
            hits++;
            element.hit = 2;
        }
    }
    return hits;
}

const setPinsUp = (fullreset) =>{
    //Set up pins
    for (let i = 0; i < pinList.length; i++) {
        if (fullreset){
            pinList[i] = setPin(i);
        }else{
            if (pinList[i].hit == 0){
                pinList[i] = setPin(i);
            }else{
                pinList[i].pin.x = -30000;
                pinList[i].pin.y = 0;
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
    let d = {
        x: (pos.x) - (pin.pin.x), 
        y: (pos.y) - (pin.pin.y)
    }
    let hypo = Math.hypot(d.x, d.y);
    let dis = (pinCollisionSize + otherSize);
    if (hypo <=  dis){
        pin.hit = true;
        pin.offset.xspeed = (Math.sqrt(Math.abs(d.x/2)) * Math.sign(d.x))*-.25
        pin.offset.yspeed = Math.sqrt(Math.abs(d.y/2))*-Math.sign(d.y)
        pin.offset.zspeed = -( (Math.random()*1.5) + 3 )
        pin.offset.aspeed = pin.offset.xspeed*0.5 * Math.abs(pin.offset.yspeed) * 10
        pin.offset.aspeed += Math.random()*4
        pin.offset.y = -1
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

    //Collide with other pins
    if (pin.offset.y>-adjustHeight(20)){
        for (let k = 0; k < pinList.length; k++) {
            const element = pinList[k];
            if (!element.hit){
                pinCheckCollision(pin.pin, element, pinCollisionSize*0.8);
            }
        }
    }
}

const pinUpdate = (time) =>{
    for (let i = 0; i < pinList.length; i++) {
        if (pinList[i].hit){
            pinMove(pinList[i], time)
        }else{
            pinCheckCollision(bluey, pinList[i], 24);
            if (pinList[i].hit){
                console.log("HGIT " + i)
            }
        }
        
    }
}

//https://stackoverflow.com/questions/59725062/pixi-js-how-to-detect-end-of-movie-callback-for-ended-event
const playBowlingVideo = async (url, func) =>{
    let videoSource = await PIXI.Assets.load({
        src: url,
        data:{
            preload: false,
            autoPlay: true,
            loop: false
        }
    });
    
    let video = new PIXI.Sprite(videoSource);

    video.texture.source.source.resource.addEventListener("ended", async (event) => {
        func();
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
        obj.acceleration.y = 0; obj.speed.y = 0;
        obj.offset.y = approach(obj.offset.y, 20, moveAmnt)
    }
}

var yPosTo = 0;
const update = (time) =>{
    elapsedTime += time.elapsedMS;
    deltaTime = time.deltaTime;
    halfTime = deltaTime/2;

    //bluey.rotation += time.deltaTime * 0.01;
    //bluey.alpha = Math.abs(Math.sin(elapsedTime/750));
    //bluey.skew = new PIXI.Point((Math.sin(elapsedTime/750))*1.25, -0.5*(Math.sin(elapsedTime/750)));
    bluey.tint = new PIXI.Color(`hsl(${((elapsedTime/20)%360)}, 100%, 70%, 50%)`).toNumber();
    //console.log(elapsedTime);

    moveSelf(ball);
    checkGutter(ball);

    if (ball.speed.x==0){
        ball.offset.y = approach(ball.offset.y, adjustHeight(32), 1/25*halfTime);
        ball.spr.y = approach(ball.spr.y, yPosTo, 1/18*halfTime);
    }

    if (ball.spr.x> app.screen.width && ball.speed.x!=0){
        ball.spr.x = app.screen.width;
        ball.speed = {x: 0, y:0};
        ball.acceleration.x = 0;
        ball.acceleration.y = 0;
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
                // TODO : Fix issue where chromecast plays the video, but it's not actually visible.
                playBowlingVideo("./fem.mp4", () => {
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
        let result = scoreAdvance(pinsHit);
        setPinsUp(result);

        ball.spr.x = -200;
        ball.spr.y = app.screen.height*(Math.random()*0.25) + (app.screen.height*0.375);

        ball.speed = {
            x: (7 + Math.random()*2),
            y: (Math.random()*2) - 1
        }
        
        ball.acceleration = {
            x: -(Math.random()*0.01),
            y: (Math.random()*0.0075) - (0.0075*0.5)
        }

        ball.offset.x = 0;
        ball.offset.y = 0;
    }

}

const mainStart = async () => {
    // Create a PixiJS application.

    // Intialize the application.
    await app.init({ 
        width  : window.innerWidth -4,
        height : window.innerHeight-4,
        width :  480*2,
        height : 270*2,
        background: '#000000'
    });
    myApp(app);

    // Then adding the application's canvas to the DOM body.
    document.querySelector("#pixi-container").appendChild(app.canvas);
}

// Asynchronous IIFE
const main = async (playerNames, roundNb, map) => {
    //Visual
    visualInit(map, app);
    scoreInit(playerNames.length, playerNames, roundNb, app);

    // Center the sprite's anchor point
    bluey.anchor.set(0.5, 0.5);

    bluey.setSize(adjustHeight(50));
    bluey.circular = true;

    // Move the sprite to the center of the screen
    bluey.x = -100;
    bluey.y = app.screen.height*0.5;

    ball.spr = bluey;

    // Gutter Ball
    gutterBallLeftThreshold = app.screen.height*0.25
    gutterBallRightThreshold = app.screen.height*0.75
    gutterBallLeftPos = app.screen.height*0.2
    gutterBallRightPos = app.screen.height*0.8

    //Set up pins
    setPinsUp(true);

    // Behind the scenes debug
    // outside lanes
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

            spr.x = pinList[i].pin.x;
            spr.y = pinList[i].pin.y;

            spr.zIndex = 600

            app.stage.addChild(spr);
        }

        app.stage.addChild(laneRight);
        app.stage.addChild(laneLeft);
        app.stage.addChild(laneSpr);
        app.stage.addChild(bluey);
    }

    app.ticker.add((time) =>{
        update(time);
        score(time);
        visual(time,  ball, pinList);
        pinUpdate(time);
    })

    
};

export { main, mainStart };