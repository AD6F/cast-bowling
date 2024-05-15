import { adjustHeight, adjustWidth } from "./globalfunc.js";

const bgSkyNY = new PIXI.FillGradient(0, 0, 50, 800)
const colorsStopsNY = [0x070436, 0x313b4f];

colorsStopsNY.forEach((number, index) =>
{
    const ratio = index / colorsStopsNY.length;

    bgSkyNY.addColorStop(ratio, number);
});

const gutterUndercover = new PIXI.FillGradient(0, 0, 150, 2000)
const colorsStopsUC = [0x010a01, 0x0b780b];

colorsStopsUC.forEach((number, index) =>
{
    const ratio = index / (colorsStopsUC.length+1);

    gutterUndercover.addColorStop(ratio, number);
});

const setXpos = (app) => {
    return app.screen.width*(0.5 + (Math.random()*0.5))
}

const floatingSpritesEffect = async (app, sprites, val) => {
    var tex = new Array(sprites.length);

    for(let i = 0; i < tex.length; i++){
        tex[i] = await PIXI.Assets.load(sprites[i]);
    }

    var list = new Array(64);

    for(let i = 0; i < list.length; i++){
        let spr = tex[i%tex.length];
        list[i] = new PIXI.Sprite(spr);
        list[i].xstart = setXpos(app);
        list[i].y = (app.screen.height*Math.random());
        list[i].speed = val.speedMin + (Math.random()*val.speedFlicker);
        list[i].xOffTimer = Math.random()*val.xOff;
        app.stage.addChild(list[i]);
    }

    app.ticker.add( (time) => {
        for(let i = 0; i < list.length; i++){
            list[i].xOffTimer += time.deltaTime*0.005
            list[i].x = list[i].xstart + 
                (Math.sin(list[i].xOffTimer)*val.xOff);
            list[i].y += time.deltaTime*list[i].speed;
            list[i].alpha = val.alphaMin + 
                (Math.random()*val.alphaFlicker);

            if (list[i].y > app.screen.height){
                list[i].y = -32;
                list[i].xstart= setXpos(app);
            }
        }
    })
}

const bgColors = [
    {
        sky : 0x111111,
        alley : new PIXI.Color('burlywood'),
        gutter : 0x5f5f5f,
        init : async (app) => {
            let bgGame = new PIXI.Graphics()
            .rect(app.screen.width*0.575, 1, app.screen.width*0.35, (app.screen.height*0.38) + 1)
            .fill(0x222222)
            .rect(app.screen.width*0.5835, 4, adjustWidth(320), adjustHeight(200))
            .fill(0x000000);
            bgGame.zIndex = 1;

            app.stage.addChild(bgGame);
        }
    },
    { // New York
        sky : bgSkyNY,
        alley : new PIXI.Color('#948270'),
        gutter : new PIXI.Color('#38302a'),
        init : async (app) => {
            
        }
    },
    { // Matrix
        sky : 0x000000,
        alley : gutterUndercover,
        gutter : new PIXI.Color({h: 0, s: 10, v: 10}),
        init : async (app) => {
            floatingSpritesEffect(app, ["./digit0.png", "./digit1.png"], {
                xOff: 0, 
                speedMin: 0.5, 
                speedFlicker: 1.5, 
                alphaMin: 0.5, 
                alphaFlicker:0.25
            });
        }
    },
    { // Cold Sea
        sky : 0x10243d,
        alley : new PIXI.Color({r: 0x80, g: 0x9b, b: 0xce, a: 0.5}),
        gutter : 0x01082d,
        init : async (app) => {
            floatingSpritesEffect(app, ["./waterBubble.png"], {
                xOff: 64, 
                speedMin: 0.15, 
                speedFlicker: 0.5, 
                alphaMin: 0.125, 
                alphaFlicker: 0
            });

            var waterTex0 = await PIXI.Assets.load('./waterWave.png');
            var listWater = new Array(16);
            
            for (let i = 0; i < listWater.length; i++){
                let sprWater = new PIXI.Sprite(waterTex0);
                sprWater.x = (app.screen.width*0.5) + 32*i;

                listWater[i] = sprWater;
                app.stage.addChild(sprWater);
            }

            var timer = 0;

            let lightPolygon = [
                {x: 0, y: -adjustHeight(30)},
                {x: 0, y: -adjustHeight(30)},
                {x: -adjustWidth(90), y:app.screen.height*0.705},
                {x:  adjustWidth(90), y:app.screen.height*0.705}
            ]
        
            var lightShineGraphic = new PIXI.Graphics()
            .poly(lightPolygon).fill(0xDDDDDD);
            lightShineGraphic.alpha = 0.1; lightShineGraphic.zIndex = 6;
            lightShineGraphic.x = app.screen.width*0.75;
            lightShineGraphic.y = -app.screen.width*0.05;
        
            var lightShineGraphic2 = new PIXI.Graphics()
            .poly(lightPolygon).fill(0x777777);
            lightShineGraphic2.alpha = 0.1; lightShineGraphic2.zIndex = 6;
            lightShineGraphic2.x = app.screen.width*0.75;
            lightShineGraphic2.y = -app.screen.width*0.05;
            lightShineGraphic2.scale.x = 1.25

            app.stage.addChild(lightShineGraphic);
            app.stage.addChild(lightShineGraphic2);

            app.ticker.add( (time) => {
                timer += time.deltaTime*0.005
                lightShineGraphic.angle  = (Math.sin(timer)*0.5);
                lightShineGraphic2.angle = (Math.sin(timer)*1.5);

                let resetPos = listWater[0].x < ((app.screen.width*0.5)-32);
                for (let i = 0; i < listWater.length; i++){
                    listWater[i].x = (resetPos) ? 
                        (app.screen.width*0.5) + 32*i : 
                        listWater[i].x - (time.deltaTime/8);
                }
            })
        }
    },
    { // Infiltration
        sky : 0x222231,
        alley : new PIXI.Color('silver'),
        gutter : 0x474e5e,
        init : async (app) => {
            let colorOfLaser = {width:2, color:0xFF0000, alpha: 0.25};

            var laser = new PIXI.Graphics()
            .moveTo(app.screen.width*0.5,0)
            .lineTo(app.screen.width, app.screen.height*0.15)
            .stroke(colorOfLaser);
            
            var laser2 = new PIXI.Graphics()
            .moveTo(app.screen.width, adjustHeight(24))
            .lineTo(app.screen.width*0.5, app.screen.height*0.25)
            .stroke(colorOfLaser);
            
            var laser3 = new PIXI.Graphics()
            .moveTo(app.screen.width*0.6, -adjustHeight(24))
            .lineTo(app.screen.width, app.screen.height*0.5)
            .stroke(colorOfLaser);
            
            var laser4 = new PIXI.Graphics()
            .moveTo(app.screen.width*0.765, -adjustHeight(24))
            .lineTo(app.screen.width*0.5, app.screen.height)
            .stroke(colorOfLaser);

            app.stage.addChild(laser);
            app.stage.addChild(laser2);
            app.stage.addChild(laser3);
            app.stage.addChild(laser4);
        }
    },
    { // Galaxy
        sky : 0x401A57,
        alley : new PIXI.Color({r: 0x80, g: 0x9b, b: 0xce, a: 0.5}),
        gutter : new PIXI.Color({h: 5, s: 34, v: 23, a: 0.25}),
        init : async (app) => {
            var starTex = [
                await PIXI.Assets.load("./starSparkle1.png"), 
                await PIXI.Assets.load("./starSparkle2.png"), 
                await PIXI.Assets.load("./starSparkle3.png")
            ];

            let starSpr = new PIXI.AnimatedSprite(starTex);
            starSpr.x = app.screen.width*0.5; starSpr.play();
            starSpr.animationSpeed = 0.05; starSpr.scale = 0.5

            console.log(starSpr)

            app.stage.addChild(starSpr);

            var list = new Array(64);

            for(let i = 0; i < list.length; i++){
                //list[i] = new PIXI.AnimatedSprite(star);
                //list[i].x = setXpos(app);
                //list[i].y = (app.screen.height*Math.random());
                //app.stage.addChild(list[i]);
            }
            
        }
    }
]

export {bgColors}