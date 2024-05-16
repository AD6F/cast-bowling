import { adjustWidth, adjustHeight } from "./globalfunc.js";

var bgScore = null;
var bgWhiteBG = null;
var app = null;

var scoreBoard = [];

var playerNames = []

var scorePlayerIndex = 0;
var scoreFrame = 0;
var scoreRound = 0;
var maxRound = 0;

var scoreShowcase = [
    
]

const getMinFrameDisplay = (frame) => {
    return Math.min(frame, maxRound-4);
}

const updateFrameTop = () => {
    let minFrame = getMinFrameDisplay(scoreFrame);
    console.log("min frame" + minFrame)
    for (let i = 0; i < scoreShowcase.length; i++) {
        const element = scoreShowcase[i];
        element[0].text = `F${minFrame + (i+1)}`
    }
}

const updateScore = () => {
    // TODO : rework this
    let minFrame = getMinFrameDisplay(scoreFrame-1);
    minFrame = (minFrame<=0) ? 0 : minFrame;
    let maxFrame = Math.min(minFrame+4, 10);
  for (let pId = 0; pId < scoreBoard.length; pId++) {
    for (let fId = minFrame; fId < maxFrame; fId++) {
        let txt = "";
        
        for (let rId = 0; rId < scoreBoard[pId][fId].length; rId++) {
            let score = scoreBoard[pId][fId][rId]
            txt += (score==undefined) ? 
                "-" : (score == 10) ? "X": score;
            txt += " ";
        }
        const txtElement = scoreShowcase[fId-minFrame][pId + 1]
        if (txt !== txtElement.text){
            console.log(`${txt} ${fId-minFrame} ${pId + 1}`);
            txtElement.text = txt;
        }
    }
  }
}

// Bowling scoring reference https://www.wikihow.com/Score-Bowling
const scoreAdvance = (pinsHit) => {
    let flagShouldReset = false;
    
    scoreBoard[scorePlayerIndex][scoreFrame][scoreRound] = pinsHit;

    scoreRound++;
    updateScore();
    
    if ( ( (scoreRound>1 && scoreFrame<(maxRound-1)) || (scoreRound>2) ) || pinsHit==10 ){
        scoreRound = 0;
        scorePlayerIndex++;
        flagShouldReset = true;
        if (scorePlayerIndex>=scoreBoard.length){
            updateFrameTop();
            scoreFrame++;
            scorePlayerIndex = 0;
            updateScore();
        }
    }

    console.log(scoreBoard);
    if (scoreFrame>=maxRound){
        return 2
    }
    return flagShouldReset;
}

const scoreInit = (playerCount, pNames, roundCount, appToSet, debug) =>{
    app = appToSet;

    maxRound = roundCount;

    bgScore = new PIXI.Graphics()
    .rect(0, 0, app.screen.width/2, app.screen.height)
    .fill(0x000000);
    bgScore.zIndex = 10000;

    app.stage.addChild(bgScore);

    bgWhiteBG = new PIXI.Graphics()
    .rect(adjustWidth(24), 
        adjustHeight(24), 
        (appToSet.screen.width/2)-adjustHeight(48), 
         appToSet.screen.height-adjustHeight(48))
    .fill(0xCCCCCC);
    bgWhiteBG.zIndex = 11000;

    app.stage.addChild(bgWhiteBG);


    scoreBoard = new Array(playerCount);
    for(let i = 0; i < playerCount; i++){
        scoreBoard[i] = new Array(roundCount);
        for (let j = 0; j < scoreBoard[i].length; j++) {
            scoreBoard[i][j] = [undefined, undefined];
            if (j == scoreBoard[i].length-1){
                scoreBoard[i][j].push(undefined);
            }
        }
    }


    playerNames = new Array(pNames.length);

    let xStart = adjustWidth(48); let xOff = adjustWidth(12);
    let yOff = adjustHeight(100); let xLength = adjustWidth(400)
    let yStart = yOff;
    for (let i = 0; i < pNames.length; i++) {
        playerNames[i] = new PIXI.Text({text:pNames[i]});
        const player = playerNames[i];
        
        player.x = xStart;
        player.y = yStart + (i*yOff);
        player.zIndex = 12000;
        
        let hbar = new PIXI.Graphics()
        .rect(xStart-xOff, player.y-adjustWidth(5), xLength, 1)
        .fill(0x000000);
        hbar.zIndex = 12000;

        app.stage.addChild(player);
        app.stage.addChild(hbar);
    }
    let bar = new PIXI.Graphics()
    .rect(xStart-xOff, yStart+(4*yOff)-adjustWidth(5), xLength, 1)
    .fill(0x000000); bar.zIndex = 1200;
    app.stage.addChild(bar);


    let barSepAmnt = 4;
    scoreShowcase = new Array(barSepAmnt);

    for (let i = 0; i < barSepAmnt; i++) {
        let posX = xStart-xOff + xLength*((i+1)/(barSepAmnt+1));
        let posY = yStart-(yOff/2);

        let vSeperator = new PIXI.Graphics()
        .rect(posX, posY, 
        1, yStart+(3.5*yOff)-adjustHeight(5))
        .fill(0x000000);
        vSeperator.zIndex = 12000;

        app.stage.addChild(vSeperator);
        
        scoreShowcase[i] = new Array(playerCount);
        for (let j = 0; j < scoreShowcase[i].length; j++) {
            scoreShowcase[i][j] = new PIXI.Text({text:`- - `});
            const scoreText = scoreShowcase[i][j];
            
            scoreText.x = posX + (xOff*0.75);
            scoreText.y = yStart-(yOff*0.35) + (yOff*(j+0.35));
            scoreText.zIndex = 12000;

            app.stage.addChild(scoreText);
        }
        let frameText = new PIXI.Text({text:`F${i+1}`});
        
        frameText.x = posX+adjustWidth(5);
        frameText.y = yStart-(yOff*0.35);
        frameText.zIndex = 12000;

        app.stage.addChild(frameText);
        scoreShowcase[i].unshift(frameText)
    }

    console.log(scoreShowcase)
}

const score = (time) => {
    for (let i = 0; i < scoreBoard.length; i++) {
        for (let j = 0; j < scoreBoard[i].length; j++) {
            for (let k = 0; k < scoreBoard[i][j].length; k++) {
                
            }
        }
    }
}

export {score, scoreInit, scoreAdvance};
