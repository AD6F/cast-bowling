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
        init : () => {
            
        }
    },
    { // Matrix
        sky : 0x000000,
        alley : gutterUndercover,
        gutter : new PIXI.Color({h: 0, s: 10, v: 10}),
        init : async (app) => {
            var digitTex0 = await PIXI.Assets.load('./digit0.png');
            var digitTex1 = await PIXI.Assets.load('./digit1.png');

            var list = new Array(64);

            for(let i = 0; i < list.length; i++){
                let spr = (i%2) ? digitTex0 : digitTex1;
                list[i] = new PIXI.Sprite(spr);
                list[i].x = setXpos(app);
                list[i].y = (app.screen.height*Math.random());
                list[i].speed = 0.5 + (Math.random()*1.5);
                list[i].zIndex = 1;
                app.stage.addChild(list[i]);
            }

            app.ticker.add( (time) => {
                for(let i = 0; i < list.length; i++){
                    list[i].y += time.deltaTime*list[i].speed;
                    list[i].alpha = (Math.random()*0.5) + 0.25;

                    if (list[i].y > app.screen.height){
                        list[i].y = -10;
                        list[i].x = setXpos(app);
                    }
                }
            })
        }
    },
    { // Cold Sea
        sky : 0x10243d,
        alley : new PIXI.Color({r: 0x80, g: 0x9b, b: 0xce, a: 0.5}),
        gutter : new PIXI.Color({h: 5, s: 34, v: 23, a: 0.25}),
        init : async (app) => {
            var timer = 0;

            let lightPolygon = [
                {x: 0, y: -adjustHeight(30)},
                {x: 0, y: -adjustHeight(30)},
                {x: -adjustWidth(90), y:app.screen.height*0.7025},
                {x:  adjustWidth(90), y:app.screen.height*0.7025}
            ]
        
            var lightShineGraphic = new PIXI.Graphics()
            .poly(lightPolygon).fill(0xDDDDDD);
            lightShineGraphic.alpha = 0.1; lightShineGraphic.zIndex = 1;
            lightShineGraphic.x = app.screen.width*0.75;
            lightShineGraphic.y = -app.screen.width*0.05;
        
            var lightShineGraphic2 = new PIXI.Graphics()
            .poly(lightPolygon).fill(0x777777);
            lightShineGraphic2.alpha = 0.1; lightShineGraphic2.zIndex = 1;
            lightShineGraphic2.x = app.screen.width*0.75;
            lightShineGraphic2.y = -app.screen.width*0.05;
            lightShineGraphic2.scale.x = 1.25

            app.stage.addChild(lightShineGraphic);
            app.stage.addChild(lightShineGraphic2);

            app.ticker.add( (time) => {
                timer += time.deltaTime*0.005
                lightShineGraphic.angle  = (Math.sin(timer)*0.5);
                lightShineGraphic2.angle = (Math.sin(timer)*1.0);
            })
        }
    },
    { // Infiltration
        sky : 0x111111,
        alley : new PIXI.Color('burlywood'),
        gutter : 0x5f5f5f,
        init : () => {
            
        }
    }
]

export {bgColors}