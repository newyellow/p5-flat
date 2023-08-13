// animation time
let pushTime = 400;

let minMaxPushRatio = [0.08, 0.16];

let lineDensity = 0.3;
let strokeDensity = 0.3;
let strokeThickness = 6;
let randomStrokeThickness = [2, 4];
let strokeLength = 12;

let constantStrokeRotation = false;
let strokeRotation = 0;


let _mainCanvas;
let _compositeCanvas;
let _animCanvas;

let _nowDrawCanvas;
let _tempPushCanvas;

let mainHue = 0;
let shapeColor = [];
let fromColor = [];
let toColor = [];

// for animation
let mainRemainSpace = [];
let compositeRectData = [];
let nowDrawRectData = [];

async function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  frameRate(50);

  _mainCanvas = createGraphics(width, height);
  _compositeCanvas = createGraphics(width, height);
  _animCanvas = createGraphics(width, height);
  _tempPushCanvas = createGraphics(width, height);
  _nowDrawCanvas = createGraphics(width, height);
  _mainCanvas.colorMode(HSB);
  _mainCanvas.blendMode(MULTIPLY);
  _compositeCanvas.colorMode(HSB);
  _compositeCanvas.blendMode(MULTIPLY);
  _tempPushCanvas.colorMode(HSB);

  _nowDrawCanvas.colorMode(HSB);
  _nowDrawCanvas.blendMode(MULTIPLY);

  if (random() < 0.7) {
    constantStrokeRotation = true;

    if (random() < 0.5)
      strokeRotation = int(random(0, 8)) * 45;
    else
      strokeRotation = random(0, 360);
  }


  mainHue = random(0, 360);

  mainRemainSpace = [0, 0, width, height];
  compositeRectData = mainRemainSpace;

  while (true) {

    let drawRemainSpace = [];
    drawRemainSpace[0] = 0;
    drawRemainSpace[1] = 0;
    drawRemainSpace[2] = mainRemainSpace[2];
    drawRemainSpace[3] = mainRemainSpace[3];

    _compositeCanvas.resizeCanvas(mainRemainSpace[2], mainRemainSpace[3]);

    // inside layer
    while (true) {
      nowDrawRectData[0] = drawRemainSpace[0] + mainRemainSpace[0];
      nowDrawRectData[1] = drawRemainSpace[1] + mainRemainSpace[1];
      await drawShape(drawRemainSpace[2], drawRemainSpace[3]);
      let pushData = await PushRect(_nowDrawCanvas, drawRemainSpace[2], drawRemainSpace[3]);

      let fromData = [
        drawRemainSpace[0] + mainRemainSpace[0],
        drawRemainSpace[1] + mainRemainSpace[1],
        drawRemainSpace[2],
        drawRemainSpace[3]
      ];

      let toData = [
        pushData.drawSpace[0] + drawRemainSpace[0] + mainRemainSpace[0],
        pushData.drawSpace[1] + drawRemainSpace[1] + mainRemainSpace[1],
        pushData.drawSpace[2],
        pushData.drawSpace[3]
      ];

      await DrawPushAnimation(fromData, toData);

      let drawX = drawRemainSpace[0] + pushData.drawSpace[0];
      let drawY = drawRemainSpace[1] + pushData.drawSpace[1];
      let drawW = pushData.drawSpace[2];
      let drawH = pushData.drawSpace[3];

      _animCanvas.clear();
      _compositeCanvas.image(_tempPushCanvas, drawX, drawY, drawW, drawH);

      drawRemainSpace[0] += pushData.remainSpace[0];
      drawRemainSpace[1] += pushData.remainSpace[1];
      drawRemainSpace[2] = pushData.remainSpace[2];
      drawRemainSpace[3] = pushData.remainSpace[3];

      if (drawRemainSpace[2] <= 0 || drawRemainSpace[3] <= 0) {
        // console.log("Layer Draw Finish");
        break;
      }
      await sleep(30);
    }

    // outside layer
    let compositePushData = await PushRect(_compositeCanvas, mainRemainSpace[2], mainRemainSpace[3]);

    let fromData = [
      mainRemainSpace[0],
      mainRemainSpace[1],
      mainRemainSpace[2],
      mainRemainSpace[3]
    ];

    let toData = [
      compositePushData.drawSpace[0] + mainRemainSpace[0],
      compositePushData.drawSpace[1] + mainRemainSpace[1],
      compositePushData.drawSpace[2],
      compositePushData.drawSpace[3]
    ];

    _compositeCanvas.clear();
    await DrawPushAnimation(fromData, toData);

    let compositeDrawX = mainRemainSpace[0] + compositePushData.drawSpace[0];
    let compositeDrawY = mainRemainSpace[1] + compositePushData.drawSpace[1];
    let compositeDrawW = compositePushData.drawSpace[2];
    let compositeDrawH = compositePushData.drawSpace[3];
    _animCanvas.clear();
    _mainCanvas.image(_tempPushCanvas, compositeDrawX, compositeDrawY, compositeDrawW, compositeDrawH);

    mainRemainSpace[0] += compositePushData.remainSpace[0];
    mainRemainSpace[1] += compositePushData.remainSpace[1];
    mainRemainSpace[2] = compositePushData.remainSpace[2];
    mainRemainSpace[3] = compositePushData.remainSpace[3];

    if (mainRemainSpace[2] <= 0 || mainRemainSpace[3] <= 0) {
      // console.log("All Finish");
      break;
    }
  }
}

// will return the final draw position
async function PushRect(_fromCanvas, _w, _h) {
  _tempPushCanvas.resizeCanvas(_w, _h);

  if (_w <= 0 || _h <= 0) {
    return {
      drawSpace: [0, 0, 0, 0],
      remainSpace: [0, 0, 0, 0]
    };
  }
  // copy content to temp canvas
  _tempPushCanvas.image(_fromCanvas, 0, 0); // the size should be same as fromCanvas

  // some random push size
  let pushDir = int(random(0, 4));
  let pushEndRatio = random(minMaxPushRatio[0], minMaxPushRatio[1]);
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

  return {
    drawSpace: targetDrawSpace,
    remainSpace: remainSpace
  };
}

async function DrawPushAnimation(_fromData, _toData) {
  let frames = pushTime / 1000 * frameRate();
  let waitTime = 1000 / frameRate();

  for (let i = 0; i <= frames; i++) {
    let t = easeInCubic(i / frames);
    let nowX = lerp(_fromData[0], _toData[0], t);
    let nowY = lerp(_fromData[1], _toData[1], t);
    let nowW = lerp(_fromData[2], _toData[2], t);
    let nowH = lerp(_fromData[3], _toData[3], t);

    _animCanvas.clear();
    _animCanvas.image(_tempPushCanvas, nowX, nowY, nowW, nowH);
    await sleep(waitTime);
  }

}

async function drawShape(_w, _h) {

  // random color offset
  let hueOffset = 0;

  let hueOffsetRandom = random();
  if (hueOffsetRandom < 0.08)
    hueOffset = 180;
  else if (hueOffsetRandom < 0.16)
    hueOffset = 60;
  else if (hueOffsetRandom < 0.24)
    hueOffset = -60;

  // for animation
  nowDrawRectData[2] = _w;
  nowDrawRectData[3] = _h;

  _nowDrawCanvas.resizeCanvas(_w, _h);
  _nowDrawCanvas.clear();

  let edgeThickness = min(_w, _h) * random(0.1, 0.3);

  shapeColor = NYRandomColor(mainHue + hueOffset);
  fromColor = NYSlightRandomColor(shapeColor);
  toColor = NYSlightRandomColor(shapeColor);
  await NYRect(0, 0, _w, _h, edgeThickness);

  let insideX = 0 + edgeThickness;
  let insideY = 0 + edgeThickness;
  let insideW = _w - edgeThickness * 2;
  let insideH = _h - edgeThickness * 2;

  let circleCount = int(random(1, 13));
  let circleRadius = min(insideW, insideH) * 0.5;
  let circleThickness = min(insideW, insideH) * random(0.06, 0.24);

  if (insideW > insideH) {
    let circleSpaceWidth = insideW / circleCount;

    for (let i = 0; i < circleCount; i++) {
      let nowX = insideX + (i + 0.5) * circleSpaceWidth;
      let nowY = insideY + insideH * 0.5;

      shapeColor = NYRandomColor(mainHue + hueOffset);
      fromColor = NYSlightRandomColor(shapeColor);
      toColor = NYSlightRandomColor(shapeColor);
      await NYCircle(nowX, nowY, circleRadius, circleThickness);
    }
  }
  else {
    let circleSpaceHeight = insideH / circleCount;

    for (let i = 0; i < circleCount; i++) {
      let nowX = insideX + insideW * 0.5;
      let nowY = insideY + (i + 0.5) * circleSpaceHeight;

      shapeColor = NYRandomColor(mainHue + hueOffset);
      fromColor = NYSlightRandomColor(shapeColor);
      toColor = NYSlightRandomColor(shapeColor);
      await NYCircle(nowX, nowY, circleRadius, circleThickness);
    }
  }
}


async function NYCircle(_x, _y, _r, _thickness) {
  let layerCount = int(_thickness * lineDensity);
  let layerOffset = _thickness / layerCount;

  for (let i = 0; i < layerCount; i++) {
    let t = i / layerCount;
    let drawColor = NYLerpColorData(fromColor, toColor, t);

    let nowR = _r - i * layerOffset;

    _nowDrawCanvas.noFill();
    _nowDrawCanvas.stroke(drawColor[0], drawColor[1], drawColor[2]);
    _nowDrawCanvas.strokeWeight(strokeThickness);
    NYCircleLayer(_x, _y, nowR);
    await sleep(1);

    updateDrawFrame();
  }
}

async function NYCircleLayer(_x, _y, _r) {
  let circleLength = 2 * PI * _r;
  let drawCount = int(circleLength * strokeDensity);

  for (let i = 0; i < drawCount; i++) {
    let t = i / drawCount;
    let nowDegree = t * 360;

    let nowX = _x + sin(radians(nowDegree)) * _r;
    let nowY = _y - cos(radians(nowDegree)) * _r;

    _nowDrawCanvas.strokeWeight(random(randomStrokeThickness[0], randomStrokeThickness[1]));

    let rotNoise = noise(nowX * 0.001, nowY * 0.001);
    let nowRot = rotNoise * 720;

    if (constantStrokeRotation)
      nowRot = strokeRotation;

    _nowDrawCanvas.push();
    _nowDrawCanvas.translate(nowX, nowY);
    _nowDrawCanvas.rotate(radians(nowRot));
    _nowDrawCanvas.line(0, -0.5 * strokeLength, 0, 0.5 * strokeLength);
    _nowDrawCanvas.pop();
  }
}


async function NYRect(_x, _y, _w, _h, _thickness) {
  let layerCount = int(_thickness * lineDensity);
  let layerOffset = _thickness / layerCount;

  for (let i = 0; i < layerCount; i++) {
    let t = i / layerCount;
    let nowColor = NYLerpColorData(fromColor, toColor, t);

    let x1 = _x + i * layerOffset + 0.5 * strokeThickness;
    let y1 = _y + i * layerOffset + + 0.5 * strokeThickness;

    let x2 = _x + _w - i * layerOffset - 0.5 * strokeThickness;
    let y2 = _y + i * layerOffset + 0.5 * strokeThickness;

    let x3 = _x + _w - i * layerOffset - 0.5 * strokeThickness;
    let y3 = _y + _h - i * layerOffset - 0.5 * strokeThickness;

    let x4 = _x + i * layerOffset + 0.5 * strokeThickness;
    let y4 = _y + _h - i * layerOffset - 0.5 * strokeThickness;

    _nowDrawCanvas.noFill();
    _nowDrawCanvas.stroke(nowColor[0], nowColor[1], nowColor[2]);
    _nowDrawCanvas.strokeWeight(strokeThickness);
    // _nowDrawCanvas.line(x1, y1, x2, y2);
    // _nowDrawCanvas.line(x2, y2, x3, y3);
    // _nowDrawCanvas.line(x3, y3, x4, y4);
    // _nowDrawCanvas.line(x4, y4, x1, y1);

    NYLine(x1, y1, x2, y2);
    NYLine(x2, y2, x3, y3);
    NYLine(x3, y3, x4, y4);
    NYLine(x4, y4, x1, y1);
    await sleep(1);

    updateDrawFrame();
  }
}

async function NYLine(_x1, _y1, _x2, _y2) {
  let drawDistance = dist(_x1, _y1, _x2, _y2);
  let drawCount = int(drawDistance * strokeDensity);

  for (let i = 0; i < drawCount; i++) {
    let t = i / drawCount;
    let nowX = lerp(_x1, _x2, t);
    let nowY = lerp(_y1, _y2, t);

    _nowDrawCanvas.strokeWeight(random(randomStrokeThickness[0], randomStrokeThickness[1]));

    let rotNoise = noise(nowX * 0.001, nowY * 0.001);
    let nowRot = rotNoise * 720;

    if (constantStrokeRotation)
      nowRot = strokeRotation;

    _nowDrawCanvas.push();
    _nowDrawCanvas.translate(nowX, nowY);
    _nowDrawCanvas.rotate(radians(nowRot));
    _nowDrawCanvas.line(0, -0.5 * strokeLength, 0, 0.5 * strokeLength);
    _nowDrawCanvas.pop();
  }
}

function NYRandomColor(_mainHue) {
  let drawHue = _mainHue + random(-30, 30);
  let drawSat = random(30, 50);
  let drawBri = random(80, 100);

  drawHue = processHue(drawHue);

  return [drawHue, drawSat, drawBri];
}

function NYSlightRandomColor(_colorData) {
  let drawHue = _colorData[0] + random(-6, 6);
  let drawSat = _colorData[1] + random(-10, 10);
  let drawBri = _colorData[2] + random(-10, 10);

  drawHue = processHue(drawHue);

  return [drawHue, drawSat, drawBri];
}

function updateDrawFrame() {

  let drawX = nowDrawRectData[0];
  let drawY = nowDrawRectData[1];
  let drawW = nowDrawRectData[2];
  let drawH = nowDrawRectData[3];

  _animCanvas.image(_nowDrawCanvas, drawX, drawY, drawW, drawH);
}

async function draw() {

  background(248);
  image(_mainCanvas, 0, 0);
  image(_compositeCanvas, mainRemainSpace[0], mainRemainSpace[1]);
  image(_animCanvas, 0, 0);
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}