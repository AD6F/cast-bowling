import { adjustHeight, adjustWidth, getApp } from "./globalfunc.js";

const videos = {
    "spare": [
        "arrowball",
        "masterball"
    ],
    "strike": [
        "bowleg",
        "strikeboom",
        "strikeschool",
        "trollbowl",
        "strikegirl",
        "strikeez",
        "strikefall"
    ],
    "gutter":[
        "gutterballed",
        "wronggutter",
        "disappointed"
    ],
    "split":[
        "split-yeen",
        "woah",
        "splitter"
    ],
    "miss":[
        "ballfall",
        "ballmiss",
        "backbowl",
        "pinJumped",
        "absolutemiss",
        "sadmiss",
        "pincounter"
    ],
    "any": [
        "ballboom",
        "slapball",
        "heck",
        "fem",
        "fish",
        "tantrum",
        "evilball"
    ]
}

//https://stackoverflow.com/questions/59725062/pixi-js-how-to-detect-end-of-movie-callback-for-ended-event
const playVideo = async (url, customFunc) =>{
    let app = getApp();
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

const playBowlingVideo = async (scoreList, pinNb, isGutter, customFunc) => {
    console.log(scoreList)
    console.log(pinNb)
    console.log(isGutter)

    let chosenVideo = "fem.mp4";
    let key = "any"

    if (isGutter){
        key = "gutter"
    }else if (pinNb == 0){
        key = "miss"
    }else if (pinNb==10){
        key = "strike"
    }else if ((pinNb==8) && scoreList[0]!=2 && scoreList[1]!=2){
        key = "split"
    }else{
        let total = 0;
        for (let i = 0; i < scoreList.length; i++) {
            total += scoreList[i];
        }
        if (total==10) {key = "spare"}
    }

    let vId = Math.floor(Math.random()*videos[key].length)
    chosenVideo = videos[key][vId]

    playVideo(`./assets/video/${chosenVideo}.mp4`, customFunc);
}

export { playBowlingVideo }