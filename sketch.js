let pushTime = 600;

let lineDensity = 0.3;
let strokeDensity = 0.3;


let _mainCanvas;

let _nowDrawCanvas;
let _tempShowCanvas;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  background(240);
  colorMode(HSB);
  _mainCanvas = createGraphics(width, height);
  _tempShowCanvas = createGraphics(width, height);
  _nowDrawCanvas = createGraphics(width, height);
  _mainCanvas.colorMode(HSB);
  _tempShowCanvas.colorMode(HSB);
  _nowDrawCanvas.colorMode(HSB);
  _nowDrawCanvas.blendMode(MULTIPLY);

  let remainSpace = [0, 0, width, height];
  // fill('red');
  // rect(nextSpace[0], nextSpace[1], nextSpace[2], nextSpace[3]);
  for(let i=0; i< 100; i++)
  {
    remainSpace = await drawAndPush(remainSpace[0], remainSpace[1], remainSpace[2], remainSpace[3]);
  }
}

async function drawAndPush(_x, _y, _w, _h) {
  _nowDrawCanvas.resizeCanvas(_w, _h);
  _nowDrawCanvas.clear();
  drawShape(0, 0, _w, _h);

  let pushDir = int(random(0, 4));
  let pushEndRatio = random(0.05, 0.2);

  let fromX = _x;
  let fromY = _y;
  let fromW = _w;
  let fromH = _h;

  let toX = 0;
  let toY = 0;
  let toW = 0;
  let toH = 0;

  let remainSpace = [];

  if (pushDir == 0) // up
  {
    toX = fromX;
    toY = fromY;
    toW = fromW;
    toH = fromH * pushEndRatio;

    remainSpace = [
      fromX,
      toY + fromH * pushEndRatio,
      fromW,
      fromH * (1 - pushEndRatio)
    ];
  }
  else if (pushDir == 1) // down
  {
    toX = fromX;
    toY = fromY + fromH * (1 - pushEndRatio);
    toW = fromW;
    toH = fromH * pushEndRatio;

    remainSpace = [
      fromX,
      fromY,
      fromW,
      fromH * (1 - pushEndRatio)
    ];
  }
  else if (pushDir == 2) // left
  {
    toX = fromX;
    toY = fromY;
    toW = fromW * pushEndRatio;
    toH = fromH;

    remainSpace = [
      fromX + fromW * pushEndRatio,
      toY,
      fromW * (1 - pushEndRatio),
      fromH
    ];
  }
  else if (pushDir == 3) // right
  {
    toX = fromX + fromW * (1 - pushEndRatio);
    toY = fromY;
    toW = fromW * pushEndRatio;
    toH = fromH;

    remainSpace = [
      fromX,
      toY,
      fromW * (1 - pushEndRatio),
      fromH
    ];
  }

  let pushFrames = int(pushTime / 33);

  for (let i = 0; i <= pushFrames; i++) {
    let t = i / pushFrames;
    let nowX = lerp(fromX, toX, t);
    let nowY = lerp(fromY, toY, t);
    let nowW = lerp(fromW, toW, t);
    let nowH = lerp(fromH, toH, t);

    _tempShowCanvas.clear();
    _tempShowCanvas.image(_nowDrawCanvas, nowX, nowY, nowW, nowH);

    background(255);
    image(_mainCanvas, 0, 0);
    image(_tempShowCanvas, 0, 0);
    await sleep(33);
  }

  _mainCanvas.image(_nowDrawCanvas, toX, toY, toW, toH);

  // return remain space
  return remainSpace;
}

async function drawShape(_x, _y, _w, _h) {

  let edgeThickness = min(_w, _h) * random(0.05, 0.2);

  NYRect(_x, _y, _w, _h, edgeThickness);

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

      NYCircle(nowX, nowY, circleRadius, circleThickness);
    }
  }
  else {
    let circleSpaceHeight = insideH / circleCount;

    for (let i = 0; i < circleCount; i++) {
      let nowX = insideX + insideW * 0.5;
      let nowY = insideY + (i + 0.5) * circleSpaceHeight;

      NYCircle(nowX, nowY, circleRadius, circleThickness);
    }
  }
}


async function NYCircle(_x, _y, _r, _thickness) {
  let layerCount = int(_thickness * lineDensity);
  let layerOffset = _thickness / layerCount;

  for (let i = 0; i < layerCount; i++) {
    let nowR = _r - i * layerOffset;

    NYCircleLayer(_x, _y, nowR);
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


async function draw() {
  // image(_nowDrawCanvas, 0, 0, 100, 100);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}