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
        gutter : 0x5f5f5f
    },
    { // New York
        sky : bgSkyNY,
        alley : new PIXI.Color('#948270'),
        gutter : new PIXI.Color('#38302a')
    },
    { // undercover
        sky : gutterUndercover,
        alley : gutterUndercover,
        gutter : new PIXI.Color({h: 0, s: 10, v: 0})
    },
    { // Cold Sea
        sky : 0x10243d,
        alley : new PIXI.Color({h: 185, s: 94, v: 93, a: 0.5}),
        gutter : new PIXI.Color({h: 5, s: 34, v: 23, a: 0.25})
    },
    { // Infiltration
        sky : 0x111111,
        alley : new PIXI.Color('burlywood'),
        gutter : 0x5f5f5f
    }
]

export {bgColors}