let pushTime = 200;
let skipLoopCount = 6;

let lineDensity = 0.3;
let strokeDensity = 0.3;

let _testCanvas;

let _mainCanvas;
let _compositeCanvas;

let _nowDrawCanvas;
let _tempPushCanvas;

let mainHue = 0;
let fromColor;
let toColor;

// for animation
let nowDrawRectData = [];
let compositeRectData = [];

async function setup() {
  createCanvas(windowWidth, windowHeight);
  background(240);
  colorMode(HSB);
  _testCanvas = createGraphics(width, height);

  _mainCanvas = createGraphics(width, height);
  _compositeCanvas = createGraphics(width, height);
  _tempPushCanvas = createGraphics(width, height);
  _nowDrawCanvas = createGraphics(width, height);
  _mainCanvas.colorMode(HSB);
  _compositeCanvas.colorMode(HSB);
  _tempPushCanvas.colorMode(HSB);
  _nowDrawCanvas.colorMode(HSB);
  _nowDrawCanvas.blendMode(MULTIPLY);

  mainHue = random(0, 360);

  let mainRemainSpace = [0, 0, width, height];
  compositeRectData = mainRemainSpace;

  while (true) {

    let drawRemainSpace = mainRemainSpace;
    drawRemainSpace[0] = 0; // cuz it is relative to composite canvas
    drawRemainSpace[1] = 0;

    while (true) {
      await drawShape(drawRemainSpace[2], drawRemainSpace[3]);
      console.log(_nowDrawCanvas.width, _nowDrawCanvas.height);
      let pushData = await PushRect(_nowDrawCanvas, drawRemainSpace[2], drawRemainSpace[3]);

      let drawX = drawRemainSpace[0] + pushData.drawSpace[0];
      let drawY = drawRemainSpace[1] + pushData.drawSpace[1];
      let drawW = pushData.drawSpace[2];
      let drawH = pushData.drawSpace[3];
      _compositeCanvas.image(_tempPushCanvas, drawX, drawY, drawW, drawH);
      // console.log(pushData);

      drawRemainSpace[0] += pushData.remainSpace[0];
      drawRemainSpace[1] += pushData.remainSpace[1];
      drawRemainSpace[2] = pushData.remainSpace[2];
      drawRemainSpace[3] = pushData.remainSpace[3];
      console.log(drawRemainSpace);

      fill('red');
      rect(drawRemainSpace[0], drawRemainSpace[1], drawRemainSpace[2], drawRemainSpace[3]);

      // console.log(drawRemainSpace);
      // if(drawRemainSpace[2] <= 0 || drawRemainSpace[3] <= 0)
      // {
      //   console.log("Draw First Composite Finish");
      //   break;
      // }
      await sleep(100);
    }

    // mainRemainSpace = await compositePush(mainRemainSpace[0], mainRemainSpace[1], mainRemainSpace[2], mainRemainSpace[3]);
    // console.log("Composite push finish");
    // console.log(mainRemainSpace);

    // compositeRectData[0] = mainRemainSpace[0];
    // compositeRectData[1] = mainRemainSpace[1];
    // compositeRectData[2] = mainRemainSpace[2];
    // compositeRectData[3] = mainRemainSpace[3];

    // console.log(compositeRectData);
    // _compositeCanvas.resizeCanvas(mainRemainSpace[2], mainRemainSpace[3]);
  }
}

// will return the final draw position
async function PushRect (_fromCanvas, _w, _h)
{
  _tempPushCanvas.resizeCanvas(_w, _h);

  // copy content to temp canvas
  _tempPushCanvas.image(_fromCanvas, 0, 0); // the size should be same as fromCanvas

  // some random push size
  let pushDir = int(random(0, 4));
  let pushEndRatio = random(0.04, 0.12);
  let pushEndLength = min(width, height) * pushEndRatio;

  // no push
  if (_w <= pushEndLength || _h <= pushEndLength) {
    return {
      drawSpace: [0, 0, _w, _h],
      remainSpace: [0, 0, 0, 0]
    };
  }

  let fromX = 0;
  let fromY = 0;
  let fromW = _w;
  let fromH = _h;

  let toX = 0;
  let toY = 0;
  let toW = 0;
  let toH = 0;

  let targetDrawSpace = []
  let remainSpace = [];

  if (pushDir == 0) // up
  {
    toX = fromX;
    toY = fromY;
    toW = fromW;
    toH = pushEndLength;

    remainSpace = [
      fromX,
      fromY + pushEndLength,
      fromW,
      fromH - pushEndLength
    ];
  }
  else if (pushDir == 1) // down
  {
    toX = fromX;
    toY = fromY + fromH - pushEndLength;
    toW = fromW;
    toH = pushEndLength;

    remainSpace = [
      fromX,
      fromY,
      fromW,
      fromH - pushEndLength
    ];
  }
  else if (pushDir == 2) // left
  {
    toX = fromX;
    toY = fromY;
    toW = pushEndLength;
    toH = fromH;

    remainSpace = [
      fromX + pushEndLength,
      fromY,
      fromW - pushEndLength,
      fromH
    ];
  }
  else if (pushDir == 3) // right
  {
    toX = fromX + fromW - pushEndLength;
    toY = fromY;
    toW = pushEndLength;
    toH = fromH;

    remainSpace = [
      fromX,
      toY,
      fromW - pushEndLength,
      fromH
    ];
  }

  targetDrawSpace = [toX, toY, toW, toH];

  // let pushFrames = int(pushTime / 33);

  // for (let i = 0; i <= pushFrames; i++) {
  //   let t = easeInOutCubic(i / pushFrames);
  //   let nowX = lerp(fromX, toX, t);
  //   let nowY = lerp(fromY, toY, t);
  //   let nowW = lerp(fromW, toW, t);
  //   let nowH = lerp(fromH, toH, t);

  //   nowDrawRectData = [nowX, nowY, nowW, nowH];

  //   _tempPushCanvas.clear();
  //   _tempPushCanvas.image(_nowDrawCanvas, nowX, nowY, nowW, nowH);

  //   updateFrame();
  //   await sleep(33);
  // }

  // _compositeCanvas.image(_nowDrawCanvas, toX, toY, toW, toH);

  // return remain space
  return {
    drawSpace: targetDrawSpace,
    remainSpace: remainSpace
  };
}

async function drawShape(_w, _h) {

  _nowDrawCanvas.resizeCanvas(_w, _h);
  _nowDrawCanvas.clear();
  
  let edgeThickness = min(_w, _h) * random(0.1, 0.3);

  // simple test with simple rect
  let nowColor = NYRandomColor(mainHue);
  _nowDrawCanvas.fill(nowColor[0], nowColor[1], nowColor[2]);
  _nowDrawCanvas.noStroke();
  _nowDrawCanvas.rect(0, 0, _w, edgeThickness);
  _nowDrawCanvas.rect(0, 0, edgeThickness, _h);
  _nowDrawCanvas.rect(0 + _w - edgeThickness, 0, edgeThickness, _h);
  _nowDrawCanvas.rect(0, 0 + _h - edgeThickness, _w, edgeThickness);
  return;
  fromColor = NYRandomColor(mainHue);
  toColor = NYSlightRandomColor(fromColor);
  await NYRect(_x, _y, _w, _h, edgeThickness);

  let insideX = _x + edgeThickness;
  let insideY = _y + edgeThickness;
  let insideW = _w - edgeThickness * 2;
  let insideH = _h - edgeThickness * 2;

  let circleCount = int(random(1, 13));
  let circleRadius = min(insideW, insideH) * 0.5;
  let circleThickness = min(insideW, insideH) * random(0.025, 0.2);

  if (insideW > insideH) {
    let circleSpaceWidth = insideW / circleCount;

    for (let i = 0; i < circleCount; i++) {
      let nowX = insideX + (i + 0.5) * circleSpaceWidth;
      let nowY = insideY + insideH * 0.5;

      fromColor = NYRandomColor(mainHue);
      toColor = NYSlightRandomColor(fromColor);
      await NYCircle(nowX, nowY, circleRadius, circleThickness);
      sleep(1);
    }
  }
  else {
    let circleSpaceHeight = insideH / circleCount;

    for (let i = 0; i < circleCount; i++) {
      let nowX = insideX + insideW * 0.5;
      let nowY = insideY + (i + 0.5) * circleSpaceHeight;

      fromColor = NYRandomColor(mainHue);
      toColor = NYSlightRandomColor(fromColor);
      await NYCircle(nowX, nowY, circleRadius, circleThickness);
      sleep(1);
    }
  }
}


async function NYCircle(_x, _y, _r, _thickness) {
  let layerCount = int(_thickness * lineDensity);
  let layerOffset = _thickness / layerCount;

  for (let i = 0; i < layerCount; i++) {
    let t = i / layerCount;
    let nowColor = NYLerpColorData(fromColor, toColor, t);
    _nowDrawCanvas.stroke(nowColor[0], nowColor[1], nowColor[2]);

    let nowR = _r - i * layerOffset;

    NYCircleLayer(_x, _y, nowR);

    if (i % skipLoopCount == 0)
      await sleep(1);
    updateFrame();
  }
}

async function NYCircleLayer(_x, _y, _r) {
  let circleLength = 2 * PI * _r;
  let drawCount = int(circleLength * strokeDensity);

  let lineLength = 8;

  for (let i = 0; i < drawCount; i++) {
    let t = i / drawCount;
    let nowDegree = t * 360;

    let nowX = _x + sin(radians(nowDegree)) * _r;
    let nowY = _y - cos(radians(nowDegree)) * _r;

    _nowDrawCanvas.strokeWeight(random(1, 4));

    let rotNoise = noise(nowX * 0.002, nowY * 0.002);
    let nowRot = rotNoise * 720;

    _nowDrawCanvas.push();
    _nowDrawCanvas.translate(nowX, nowY);
    _nowDrawCanvas.rotate(radians(nowRot));
    _nowDrawCanvas.line(0, -0.5 * lineLength, 0, 0.5 * lineLength);
    _nowDrawCanvas.pop();

  }
}


async function NYRect(_x, _y, _w, _h, _thickness) {
  let layerCount = int(_thickness * lineDensity);
  let layerOffset = _thickness / layerCount;

  for (let i = 0; i < layerCount; i++) {
    let t = i / layerCount;
    let nowColor = NYLerpColorData(fromColor, toColor, t);
    _nowDrawCanvas.stroke(nowColor[0], nowColor[1], nowColor[2]);

    let x1 = _x + i * layerOffset;
    let y1 = _y + i * layerOffset;

    let x2 = _x + _w - i * layerOffset;
    let y2 = _y + i * layerOffset;

    let x3 = _x + _w - i * layerOffset;
    let y3 = _y + _h - i * layerOffset;

    let x4 = _x + i * layerOffset;
    let y4 = _y + _h - i * layerOffset;
    NYLine(x1, y1, x2, y2);
    NYLine(x2, y2, x3, y3);
    NYLine(x3, y3, x4, y4);
    NYLine(x4, y4, x1, y1);

    if (i % skipLoopCount == 0)
      await sleep(1);

    updateFrame();
  }
}

async function NYLine(_x1, _y1, _x2, _y2) {
  let lineLength = 8;
  let drawDistance = dist(_x1, _y1, _x2, _y2);
  let drawCount = int(drawDistance * strokeDensity);

  for (let i = 0; i < drawCount; i++) {
    let t = i / drawCount;
    let nowX = lerp(_x1, _x2, t);
    let nowY = lerp(_y1, _y2, t);

    _nowDrawCanvas.strokeWeight(random(1, 4));

    let rotNoise = noise(nowX * 0.002, nowY * 0.002);
    let nowRot = rotNoise * 720;

    _nowDrawCanvas.push();
    _nowDrawCanvas.translate(nowX, nowY);
    _nowDrawCanvas.rotate(radians(nowRot));
    _nowDrawCanvas.line(0, -0.5 * lineLength, 0, 0.5 * lineLength);
    _nowDrawCanvas.pop();
  }
}

function NYRandomColor(_mainHue) {
  let drawHue = _mainHue + random(-40, 40);
  let drawSat = random(40, 60);
  let drawBri = random(80, 100);

  drawHue = processHue(drawHue);

  return [drawHue, drawSat, drawBri];
}

function NYSlightRandomColor(_colorData) {
  let drawHue = _colorData[0] + random(-12, 12);
  let drawSat = _colorData[1] + random(-20, 20);
  let drawBri = _colorData[2] + random(-20, 20);

  drawHue = processHue(drawHue);

  return [drawHue, drawSat, drawBri];
}

function updateFrame() {
  background(255);
  image(_mainCanvas, 0, 0);
  image(_compositeCanvas, compositeRectData[0], compositeRectData[1], compositeRectData[2], compositeRectData[3]);
  image(_tempPushCanvas, 0, 0);
  image(_nowDrawCanvas, nowDrawRectData[0], nowDrawRectData[1], nowDrawRectData[2], nowDrawRectData[3]);
}

async function draw() {

  stroke('red');
  strokeWeight(2);
  fill(30);
  rect(0, 0, 200, 200);
  image(_compositeCanvas, 0, 0, 200, 200);
  
  // _testCanvas.clear();
  // _testCanvas.image(_mainCanvas, 0, 0);
  // _testCanvas.image(_compositeCanvas, compositeRectData[0], compositeRectData[1], compositeRectData[2], compositeRectData[3]);
  // image(_testCanvas, 0, 0, 200, 200);
}

function keyPressed (e)
{
  if(e.key == 'q')
  {
    console.log(compositeRectData);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}