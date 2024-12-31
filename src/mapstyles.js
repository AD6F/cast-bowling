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

const mapTickerList = []

colorStopMX.forEach((number, index) =>
{
    const ratio = index / (colorStopMX.length+1);

    alleyMatrix.addColorStop(ratio, number);
});

const setXpos = (app) => {
    return app.screen.width*(0.5 + (Math.random()*0.5))
}

const clearMapTicker = (app) => {
    mapTickerList.forEach( (value, index) => {
        app.ticker.remove(value);
    })
}

const floatingSpritesEffect = async (app, sprites, val) => {
    var tex = new Array(sprites.length);

    for(let i = 0; i < tex.length; i++){
        tex[i] = await PIXI.Assets.load(sprites[i]);
    }

    var list = new Array(val.nb);

    for(let i = 0; i < list.length; i++){
        let spr = tex[i%tex.length];
        list[i] = new PIXI.Sprite(spr); list[i].xstart = setXpos(app);
        list[i].y = (app.screen.height*Math.random());
        list[i].speed = val.speedMin + (Math.random()*val.speedFlicker);
        list[i].xOffTimer = Math.random()*val.xOff;
        list[i].zIndex = 1;
        app.stage.addChild(list[i]);
    }

    let timer = (time) => {
        for(let i = 0; i < list.length; i++){
            list[i].xOffTimer += time.deltaTime*0.005
            list[i].x = list[i].xstart + (Math.sin(list[i].xOffTimer)*val.xOff);
                
            list[i].y += time.deltaTime*list[i].speed;
            list[i].alpha = val.alphaMin + (Math.random()*val.alphaFlicker);

            if (list[i].y > app.screen.height){
                list[i].y = -32;
                list[i].xstart= setXpos(app);
            }
        }
    }

    app.ticker.add( timer )
    mapTickerList.push(timer)
}

const bgMap = [
    {
        sky : 0x111111, alley : new PIXI.Color('burlywood'),
        gutter : 0x5f5f5f, init : async (app) => {
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
        sky : 0x0, alley : new PIXI.Color('#948270'),
        gutter : new PIXI.Color('#38302a'), init : async (app) => {
            var bgTex = await PIXI.Assets.load({
                src: "./assets/mapBG/newyorkBG.mp4",
                data:{ loop: true }
            });
            var bgSpr = new PIXI.Sprite(bgTex);
            var bgSpr2 = new PIXI.Sprite(bgTex);

            bgSpr.anchor.set(0.5, 0.1);
            bgSpr.x = app.screen.width*0.75;
            bgSpr.scale = 0.665; bgSpr.zIndex = -0.5;

            bgSpr2.anchor.set(0.5, 1);
            bgSpr2.x = app.screen.width*0.75;
            bgSpr2.y = app.screen.height*0.785;
            bgSpr2.zIndex = -0.5; bgSpr2.zIndex = -0.75;
            bgSpr2.scale.x = 0.665; bgSpr2.scale.y = 0.735;

            app.stage.addChild(bgSpr);
            app.stage.addChild(bgSpr2);
        }
    },
    { // Matrix
        sky : 0x000000, alley : alleyMatrix,
        gutter : new PIXI.Color({h: 0, s: 10, v: 10}),
        init : async (app) => {
            floatingSpritesEffect(app, ["./assets/img/digit0.png", "./assets/img/digit1.png"], {
                xOff: 0, speedMin: 0.5, speedFlicker: 1.5, 
                alphaMin: 0.5, alphaFlicker:0.25, nb: 128
            });
        }
    },
    { // Cold Sea
        sky : 0x10243d,
        alley : new PIXI.Color({r: 0x80, g: 0x9b, b: 0xce, a: 0.375}),
        gutter : 0x01082d,
        init : async (app) => {
            floatingSpritesEffect(app, ["./assets/img/waterBubble.png"], {
                xOff: 64, speedMin: 0.15, speedFlicker: 0.5, 
                alphaMin: 0.125, alphaFlicker: 0, nb: 64
            });

            var waterTex0 = await PIXI.Assets.load('./assets/img/waterWave.png');
            var listWater = new Array(16);
            var timer = 0;
            
            for (let i = 0; i < listWater.length; i++){
                let sprWater = new PIXI.Sprite(waterTex0);
                sprWater.x = (app.screen.width*0.5) + 32*i;
                sprWater.zIndex = 2;
                
                listWater[i] = sprWater;
                app.stage.addChild(sprWater);
            }

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

            var sharkTex = await PIXI.Assets.load("./assets/img/blahaj.png");
            var sharkSpr = new PIXI.Sprite(sharkTex);

            sharkSpr.x = app.screen.width*2;
            sharkSpr.scale.x = -0.75; sharkSpr.scale.y = 0.75;
            sharkSpr.tint = 0x181818; sharkSpr.angle = -3;

            app.stage.addChild(sharkSpr);

            let ticker = (time) => {
                timer += time.deltaTime*0.005
                lightShineGraphic.angle  = (Math.sin(timer)*0.5);
                lightShineGraphic2.angle = (Math.sin(timer)*1.5);

                let resetPos = listWater[0].x < ((app.screen.width*0.5)-32);
                for (let i = 0; i < listWater.length; i++){
                    listWater[i].x = (resetPos) ? 
                        (app.screen.width*0.5) + 32*i : 
                        listWater[i].x - (time.deltaTime/8);
                }

                sharkSpr.x -= time.deltaTime;
                sharkSpr.y += time.deltaTime*0.05;

                if (sharkSpr.x<0){
                    sharkSpr.x = app.screen.width*(2 + (Math.random()*2));
                    sharkSpr.y = app.screen.height*((Math.random()*0.32)-0.28);
                }
            }
            app.ticker.add( ticker )
            mapTickerList.push(ticker);
        }
    },
    { // Infiltration
        sky : 0,
        alley : new PIXI.Color({r: 0xc0, g: 0xc0, b: 0xc0, a:0.125}),
        gutter : new PIXI.Color({r: 0x47, g: 0x4e, b: 0x5e, a: 0.125 }),
        init : async (app) => {
            let colorOfLaser = {width:2.5, color:0xFF0000, alpha: 0.4};

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

            var lasers = [laser, laser2, laser3, laser4]

            app.stage.addChild(...lasers);

            var timeV = 0;

            let laserAlpha = (time) => {
                timeV += time.deltaTime*0.01;
                for(let i =0; i < lasers.length; i++){
                    lasers[i].alpha = 0.35 + (Math.random()*0.45)
                }
            }

            app.ticker.add(laserAlpha)
            mapTickerList.push(laserAlpha)

            var bgTex = await PIXI.Assets.load("./assets/mapBG/vault.png");
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

            var list = new Array(200);

            for(let i = 0; i < list.length; i++){
                let starSpr = new PIXI.AnimatedSprite(starTex);
                starSpr.x = app.screen.width*(0.5 + Math.random()/2); 
                starSpr.y = app.screen.height*Math.random(); 
                starSpr.angle = Math.floor(Math.random()*16)*22.5
                starSpr.scale = 0.125 + (Math.random()*0.3);
                starSpr.alpha = 0.25 + starSpr.scale.x;
                starSpr.animationSpeed = 0.025 + (starSpr.alpha*0.075); 
                starSpr.anchor.set(0.5); starSpr.play(); 

                app.stage.addChild(starSpr);

                list[i] = starSpr;
            }

            const xMin = app.screen.width*0.5

            let timer = (time) => {
                for(let i = 0; i < list.length; i++){
                    const star = list[i];
                    star.x -= time.deltaTime*(star.scale.x**2)*star.alpha;
                    star.angle += time.deltaTime*star.alpha/2;
                    if (star.x <= (xMin-32)){
                        star.x += xMin+64;
                        star.y = app.screen.height*Math.random(); 
                    }
                }
            };

            app.ticker.add(timer);
            mapTickerList.push(timer);

            var bgTex = await PIXI.Assets.load({
                src: "./assets/mapBG/galatic.mp4",
                data:{ loop: true }
            });
            var bgSpr = new PIXI.Sprite(bgTex);

            bgSpr.anchor.set(0.5, 0);
            bgSpr.x = app.screen.width*0.75;
            bgSpr.width = app.screen.height;
            bgSpr.height = app.screen.height;
            bgSpr.zIndex = -0.5; bgSpr.alpha = 0.75;

            app.stage.addChild(bgSpr);
            
        }
    },
    { // Grimace
        sky : 0x201331, alley : 0x530b62, gutter : 0x340351,
        init : async (app) => {
            var bgTex = await PIXI.Assets.load("./assets/mapBG/grimache.jpg");
            var shakeTex = await PIXI.Assets.load("./assets/img/gshake.png");
            var lightTex = await PIXI.Assets.load("./assets/img/lightray.png");
            var bgSpr = new PIXI.Sprite(bgTex);
            var shakeL = new PIXI.Sprite(shakeTex), shakeR = new PIXI.Sprite(shakeTex);
            var lightL = new PIXI.Sprite(lightTex), lightR = new PIXI.Sprite(lightTex);

            bgSpr.anchor.set(0.575, 0.05); bgSpr.scale = 0.8
            bgSpr.x = app.screen.width*0.75;
            bgSpr.zIndex = -0.5; bgSpr.alpha = 0.75;

            app.stage.addChild(bgSpr);

            shakeL.anchor.set(0.5, 0.75); shakeL.scale = 0.35;
            shakeL.x = app.screen.width*0.55;
            shakeL.y = app.screen.height*0.75;
            shakeL.angle = -8;

            shakeR.anchor.set(0.5, 0.75); shakeR.scale = 0.35;
            shakeR.x = app.screen.width*0.95;
            shakeR.y = app.screen.height*0.75;
            shakeR.angle = 8;

            lightL.anchor.set(0.5, 1);  lightL.angle = -5;
            lightL.x = app.screen.width*0.6;
            lightL.y = app.screen.height*0.65;
            lightL.scale.set(-1, 1.5);
            lightL.zIndex = -0.25;

            lightR.anchor.set(0.5, 1);  lightR.angle = 5;
            lightR.x = app.screen.width*0.9;
            lightR.y = app.screen.height*0.65;
            lightR.scale.set(1, 1.5);
            lightR.zIndex = -0.25;

            var timeV = 0;

            let timer = (time) => {
                timeV += time.deltaTime*0.0325;
                shakeL.angle =-8 - (Math.cos(timeV)*4);
                shakeR.angle = 8 + (Math.cos(timeV)*4);

                lightL.angle =-5 - (Math.sin(timeV/2)*3);
                lightR.angle = 5 + (Math.sin(timeV/2)*3);
            }

            app.ticker.add(timer)
            mapTickerList.push(timer)

            app.stage.addChild(shakeL,shakeR,lightL,lightR);
        }
    },
    { // Deltarune
        sky : 0x000000, alley : 0x97D5E4, gutter : 0x005b82,
        init : async (app) => {
            var bgTex = await PIXI.Assets.load("./assets/mapBG/bg.webp");
            var bgSpr = new PIXI.Sprite(bgTex); 
            
            bgSpr.anchor.set(0.5, 0); bgSpr.scale = 0.9;
            bgSpr.x = app.screen.width*0.75; bgSpr.y = -10;
            bgSpr.zIndex = -0.5; bgSpr.alpha = 1;

            app.stage.addChild(bgSpr)
        }
    },
    { // House
        sky : 0xc4dd84, 
        alley : new PIXI.Color({r: 0x51,g: 0xb6,b: 0xc0,a: 0.1}),
        gutter: new PIXI.Color({r: 0x52,g: 0xb6,b: 0x4a,a: 0.1}), 
        init : async (app) => {
            var bgTex = await PIXI.Assets.load({
                src: "./assets/mapBG/house.jpg",
                data:{ loop: true }
            });
            var bgSpr = new PIXI.Sprite(bgTex);
            var bgSpr2 = new PIXI.Sprite(bgTex);

            bgSpr.anchor.set(0.435725, 0.05);
            bgSpr.x = app.screen.width*0.75;
            bgSpr.scale = 0.675; bgSpr.zIndex = -0.5;

            app.stage.addChild(bgSpr);
        }
    },
    { // House
        sky : 0x000000, alley : 0x154a34, gutter : 0x0f3424,
        init : async (app) => {
            var bgTex = await PIXI.Assets.load("./assets/mapBG/cmv.jpg");
            var bgSpr = new PIXI.Sprite(bgTex); 
            var sponsorTex = await PIXI.Assets.load("./assets/mapBG/sponsorship.jpg");
            var sponsorSpr = new PIXI.Sprite(sponsorTex); 
            var sponsorSpr2 = new PIXI.Sprite(sponsorTex); 

            bgSpr.anchor.set(0.5, 0); 
            bgSpr.scale.x = 0.5;
            bgSpr.scale.y = 0.63;
            bgSpr.x = app.screen.width*0.75; bgSpr.y = -10;
            bgSpr.zIndex = -0.5; bgSpr.alpha = 1;

            app.stage.addChild(bgSpr)

            sponsorSpr.anchor.set(0.5, 0);
            sponsorSpr.width = app.screen.width*0.5;
            sponsorSpr.height = 84;
            sponsorSpr.x = app.screen.width*0.75; sponsorSpr.y = 0;
            sponsorSpr.zIndex = 1; sponsorSpr.alpha = 1;
            app.stage.addChild(sponsorSpr)

            var timeV = 0;

            let timer = (time) => {
                timeV += time.deltaTime*0.1;
                sponsorSpr.height = 84 + (Math.cos(timeV)*8);
                sponsorSpr.angle = 0 + (Math.sin(timeV/2)*3.5);
                sponsorSpr.anchor.x = 0.5 + (Math.cos(timeV/2)*0.025);
            }

            app.ticker.add(timer)
            mapTickerList.push(timer)
        }
    }
]

export {bgMap, clearMapTicker}