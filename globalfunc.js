var app;
var xMulti = 1;
var yMulti = 1;

const myApp = (a) => {
    app = a;
    xMulti = (1/960)*app.screen.width;
    yMulti = (1/540)*app.screen.height;
};


const adjustWidth = (px) => {
    return px*xMulti
}
const adjustHeight = (px) => {
    return px*yMulti
}

const lerp = (a, b, percentage) => {
    return a + percentage * (b-a);
}

const clamp = (a, min, max) => {
    if (a>max){
        return max
    }else if (a<min){
        return min
    }else{
        return a
    }
}

export {adjustWidth, adjustHeight, lerp, clamp, myApp};