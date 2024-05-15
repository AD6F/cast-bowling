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

const bgColors = [
    {
        sky : 0x111111,
        alley : new PIXI.Color('burlywood'),
        gutter : 0x5f5f5f,
        init : () => {

        }
    },
    { // New York
        sky : bgSkyNY,
        alley : new PIXI.Color('#948270'),
        gutter : new PIXI.Color('#38302a'),
        init : () => {
            
        }
    },
    { // undercover
        sky : 0x000000,
        alley : gutterUndercover,
        gutter : new PIXI.Color({h: 0, s: 10, v: 10}),
        init : async (app) => {
            var digitTex0 = await PIXI.Assets.load('./digit0.png');
            var digitTex1 = await PIXI.Assets.load('./digit1.png');
            
            const setXpos = () => {
                return app.screen.width*(0.5 + (Math.random()*0.5))
            }

            var list = new Array(64);

            for(let i = 0; i < list.length; i++){
                let spr = (i%2) ? digitTex0 : digitTex1;
                list[i] = new PIXI.Sprite(spr);
                list[i].x = setXpos();
                list[i].y = (app.screen.height*Math.random());
                list[i].speed = 0.5 + (Math.random()*1.5);
                list[i].zIndex = 1;
                app.stage.addChild(list[i]);
            }
            console.log(list);

            app.ticker.add( (time) => {
                for(let i = 0; i < list.length; i++){
                    list[i].y += time.deltaTime*list[i].speed;
                    list[i].alpha = (Math.random()*0.5) + 0.25;

                    if (list[i].y > app.screen.height){
                        list[i].y = -10;
                        list[i].x = setXpos();
                    }
                }
            })
        }
    },
    { // Cold Sea
        sky : 0x10243d,
        alley : new PIXI.Color({r: 0x80, g: 0x9b, b: 0xce, a: 0.5}),
        gutter : new PIXI.Color({h: 5, s: 34, v: 23, a: 0.25}),
        init : () => {
            
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