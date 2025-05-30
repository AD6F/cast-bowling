import { adjustWidth, adjustHeight, lerp } from "./globalfunc.js";
import { bgMap } from "./mapstyles.js";

const secretTexture = await PIXI.Assets.load('./assets/img/pixelbluey.png');
const texture = await PIXI.Assets.load('./assets/img/bowlingBall.png');
const texturePin = await PIXI.Assets.load('./assets/img/bin.webp');

var bgGame = null;
var bgBowlingFloor = null;
var app = null;

var floor = {
    bottomLeft : 0,
    bottomRight : 0,
    topLeft : 0,
    topRight : 0
}

var canResetSpr = false;

const pinSprList = [
    new PIXI.Sprite(texturePin),
    new PIXI.Sprite(texturePin),
    new PIXI.Sprite(texturePin),
    new PIXI.Sprite(texturePin),
    new PIXI.Sprite(texturePin),
    new PIXI.Sprite(texturePin),
    new PIXI.Sprite(texturePin),
    new PIXI.Sprite(texturePin),
    new PIXI.Sprite(texturePin),
    new PIXI.Sprite(texturePin)
]

var ballSpr = new PIXI.Sprite(texture);

const visualDrawObj = (spr,offset) =>{
    let oldx = spr.x;
    let oldy = spr.y;

    let hpercentage = ((oldy/app.screen.height)) 
    let vpercentage = ((oldx/app.screen.width))

    spr.y = app.screen.height*1 - ( (oldx/app.screen.width) * app.screen.height*0.5 ); 

    let rightSide = lerp(floor.bottomRight, floor.topRight, vpercentage);
    let leftSide = lerp(floor.bottomLeft, floor.topLeft, vpercentage);
    
    let percent = lerp(-0.5, 1.5, hpercentage)

    spr.x = lerp(leftSide, rightSide, percent) + app.screen.width * 0.75;

    let size = adjustHeight(offset.ogSize) * (((1- (vpercentage*1.15))/2) + 0.25)
    spr.setSize( (size<0) ? 0 : size );

    spr.y -= spr.height/2

    let offx = adjustWidth(offset.x);
    spr.x += offx;
    let offy = adjustHeight(offset.y);
    spr.y += offy;

    if(offset.y>0){
        //spr.setSize(spr.width - (off*0.5));
        spr.zIndex = 5;
    }else{
        spr.zIndex = ( (1-vpercentage) *app.screen.height) + 500
    }
}

const visualInit = async (theme, appToSet) => {
    app = appToSet;

    await bgMap[theme].init(app);

    bgGame = new PIXI.Graphics()
    .rect(app.screen.width/2, 0, app.screen.width/2, app.screen.height)
    .fill(bgMap[theme].sky);
    bgGame.zIndex = -1;

    app.stage.addChild(bgGame);

    let polygon = [
        {x: (app.screen.width/2)-adjustWidth(64), y: app.screen.height},
        {x: (app.screen.width)+adjustWidth(64), y: app.screen.height},
        {x: app.screen.width*0.8, y:app.screen.height*0.5},
        {x: app.screen.width*0.7, y:app.screen.height*0.5}
    ]

    floor.bottomLeft = polygon[0].x - app.screen.width*0.75; 
    floor.bottomRight = polygon[1].x - app.screen.width*0.75;
    floor.topLeft = polygon[3].x - app.screen.width*0.75; 
    floor.topRight = polygon[2].x - app.screen.width*0.75;

    bgBowlingFloor = new PIXI.Graphics()
    .poly(polygon).fill(bgMap[theme].alley);
    bgBowlingFloor.zIndex = 10;

    app.stage.addChild(bgBowlingFloor);

    let gutterPolygon = [
        {x: (app.screen.width/2)-adjustWidth(64), y: app.screen.height},
        {x: (app.screen.width)+adjustWidth(64), y: app.screen.height},
        {x: app.screen.width*0.8, y:app.screen.height*0.5},
        {x: app.screen.width*0.7, y:app.screen.height*0.5}
    ]
    
    gutterPolygon[0].x -= adjustWidth(78)
    gutterPolygon[1].x += adjustWidth(78)
    gutterPolygon[3].x -= adjustWidth(22)
    gutterPolygon[2].x += adjustWidth(22)
    gutterPolygon[2].y += adjustHeight(16)
    gutterPolygon[3].y += adjustHeight(16)

    let bgBowlingGutter = new PIXI.Graphics()
    .poly(gutterPolygon).fill(bgMap[theme].gutter);
    bgBowlingGutter.zIndex = 2;

    app.stage.addChild(bgBowlingGutter)

    ballSpr.anchor.set(0.5, 0.5);

    ballSpr.setSize(100);
    ballSpr.zIndex = 15;

    app.stage.addChild(ballSpr);

    for (let i = 0; i < pinSprList.length; i++) {
        pinSprList[i].anchor.set(0.5, 0.5);
        app.stage.addChild(pinSprList[i]);
    }
}

const visual = (time, ballObj, pinList) => {
    if ((ballObj.spr.x<=-100) && canResetSpr){
        ballSpr.texture = ((Math.random()>=0.95) ? secretTexture : texture);
        console.log(ballSpr.texture)
        canResetSpr = false;
    }else if (ballObj.spr.x>0){
        canResetSpr = true;
    }
    ballSpr.x = ballObj.spr.x;
    ballSpr.y = ballObj.spr.y;
    ballSpr.angle += ballObj.speed.x * time.deltaTime * 1.25;
    //ballSpr.angle += time.deltaTime * -ballObj.speed.y * 3;
    visualDrawObj(ballSpr, ballObj.offset);

    pinList.forEach(element => {
        pinSprList[element.id].x = element.pin.x
        pinSprList[element.id].y = element.pin.y
        pinSprList[element.id].angle = element.offset.a

        visualDrawObj(pinSprList[element.id], element.offset)
    });
}

export {visual, visualInit}