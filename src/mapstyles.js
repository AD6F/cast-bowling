import { adjustHeight, adjustWidth } from "./globalfunc.js";

const bgSkyNY = new PIXI.FillGradient(0, 0, 50, 800)
const colorsStopsNY = [0x070436, 0x313b4f];

colorsStopsNY.forEach((number, index) =>
{
    const ratio = index / colorsStopsNY.length;

    bgSkyNY.addColorStop(ratio, number);
});

const alleyMatrix = new PIXI.FillGradient(0, 0, 150, 2000)
const colorStopMX = [0x010a01, 0x0b780b];

colorStopMX.forEach((number, index) =>
{
    const ratio = index / (colorStopMX.length+1);

    alleyMatrix.addColorStop(ratio, number);
});

const setXpos = (app) => {
    return app.screen.width*(0.5 + (Math.random()*0.5))
}

const floatingSpritesEffect = async (app, sprites, val) => {
    var tex = new Array(sprites.length);

    for(let i = 0; i < tex.length; i++){
        tex[i] = await PIXI.Assets.load(sprites[i]);
    }

    var list = new Array(val.nb);

    for(let i = 0; i < list.length; i++){
        let spr = tex[i%tex.length];
        list[i] = new PIXI.Sprite(spr);
        list[i].xstart = setXpos(app);
        list[i].y = (app.screen.height*Math.random());
        list[i].speed = val.speedMin + (Math.random()*val.speedFlicker);
        list[i].xOffTimer = Math.random()*val.xOff;
        list[i].zIndex = 1;
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
        alley : alleyMatrix,
        gutter : new PIXI.Color({h: 0, s: 10, v: 10}),
        init : async (app) => {
            floatingSpritesEffect(app, ["./assets/img/digit0.png", "./assets/img/digit1.png"], {
                xOff: 0, 
                speedMin: 0.5, 
                speedFlicker: 1.5, 
                alphaMin: 0.5, 
                alphaFlicker:0.25,
                nb: 128
            });
        }
    },
    { // Cold Sea
        sky : 0x10243d,
        alley : new PIXI.Color({r: 0x80, g: 0x9b, b: 0xce, a: 0.375}),
        gutter : 0x01082d,
        init : async (app) => {
            floatingSpritesEffect(app, ["./assets/img/waterBubble.png"], {
                xOff: 64, 
                speedMin: 0.15, 
                speedFlicker: 0.5, 
                alphaMin: 0.125, 
                alphaFlicker: 0,
                nb: 64
            });

            var waterTex0 = await PIXI.Assets.load('./assets/img/waterWave.png');
            var listWater = new Array(16);
            
            for (let i = 0; i < listWater.length; i++){
                let sprWater = new PIXI.Sprite(waterTex0);
                sprWater.x = (app.screen.width*0.5) + 32*i;
                sprWater.zIndex = 2;
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

            var sharkTex = await PIXI.Assets.load("./assets/img/blahaj.png");
            var sharkSpr = new PIXI.Sprite(sharkTex);

            sharkSpr.x = app.screen.width*2;
            sharkSpr.scale.x = -0.75; sharkSpr.scale.y = 0.75;
            sharkSpr.tint = 0x181818;
            sharkSpr.angle = -3;

            app.ticker.add( (time) => {
                sharkSpr.x -= time.deltaTime;
                sharkSpr.y += time.deltaTime*0.05;

                if (sharkSpr.x<0){
                    sharkSpr.x = app.screen.width*(2 + (Math.random()*2));
                    sharkSpr.y = app.screen.height*((Math.random()*0.32)-0.28);
                }
            })

            app.stage.addChild(sharkSpr);
        }
    },
    { // Infiltration
        sky : 0,
        alley : new PIXI.Color({r: 0xc0, g: 0xc0, b: 0xc0, a:0.125}),
        gutter : new PIXI.Color({r: 0x47, g: 0x4e, b: 0x5e, a: 0.125 }),
        init : async (app) => {
            let colorOfLaser = {width:2, color:0xFF0000, alpha: 0.4};

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

            var bgTex = await PIXI.Assets.load("./assets/img/vault.png");
            var bgSpr = new PIXI.Sprite(bgTex);

            bgSpr.anchor.set(0.5, 0.1);
            bgSpr.x = app.screen.width*0.75;
            bgSpr.scale = 0.775; bgSpr.zIndex = -0.5

            app.stage.addChild(bgSpr);

            var camTex = await PIXI.Assets.load("./assets/img/securitycam.png");
            var camSpr = new PIXI.Sprite(camTex);

            camSpr.anchor.set(0.5, -0.1);
            camSpr.x = app.screen.width*0.945;
            camSpr.scale = 0.1; camSpr.zIndex = -0.25;
            camSpr.angle = 4; camSpr.tint = 0xAAAAAA;

            app.stage.addChild(camSpr);
        }
    },
    { // Galaxy
        sky : 0x1a0929,
        alley : new PIXI.Color({r: 0x80, g: 0x9b, b: 0xce, a: 0.2}),
        gutter : new PIXI.Color({h: 5, s: 34, v: 23, a: 0.25}),
        init : async (app) => {
            var starTex = [
                await PIXI.Assets.load("./assets/img/starSparkle1.png"), 
                await PIXI.Assets.load("./assets/img/starSparkle2.png"), 
                await PIXI.Assets.load("./assets/img/starSparkle3.png")
            ];

            var list = new Array(180);

            for(let i = 0; i < list.length; i++){
                let starSpr = new PIXI.AnimatedSprite(starTex);
                starSpr.x = app.screen.width*(0.5 + Math.random()/2); 
                starSpr.y = app.screen.height*Math.random(); 
                starSpr.angle = Math.floor(Math.random()*16)*22.5
                starSpr.animationSpeed = 0.05; starSpr.play(); 
                starSpr.scale = 0.125 + (Math.random()*0.3);
                starSpr.alpha = 0.25 + (Math.random()*0.5);
                starSpr.anchor.set(0.5);

                app.stage.addChild(starSpr);

                list[i] = starSpr;
            }

            const xMin = app.screen.width*0.5

            app.ticker.add( (time) => {
                for(let i = 0; i < list.length; i++){
                    const star = list[i];
                    star.x -= time.deltaTime*star.scale.x*star.alpha;
                    star.angle += time.deltaTime*star.alpha
                    if (star.x <= (xMin-32)){
                        star.x += xMin+64;
                        star.y = app.screen.height*Math.random(); 
                    }
                }
            });

            var bgTex = await PIXI.Assets.load({
                src: "./assets/img/galatic.mp4",
                data:{
                    loop: true
                }
            });
            var bgSpr = new PIXI.Sprite(bgTex);

            bgSpr.anchor.set(0.5, 0);
            bgSpr.x = app.screen.width*0.75;
            bgSpr.width = app.screen.width*0.5;
            bgSpr.height = app.screen.height;
            bgSpr.zIndex = -0.5; bgSpr.alpha = 0.75;

            app.stage.addChild(bgSpr);
            
        }
    }
]

export {bgColors}