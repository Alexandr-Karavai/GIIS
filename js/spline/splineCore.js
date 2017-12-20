function drawAllPoints() {
    context.fillStyle = POINT_COLOR;
    $.each(map, function() {
        drawPoint(this);
    });

    context.fillStyle = POINT_CONTROL_COLOR;
    $.each(controlMap, function() {
        drawPoint(this);
    });
    context.fillStyle = POINT_COLOR;
    info.html("");
}

function drawField() {
    context.strokeStyle = "#000";
    context.strokeRect(-halfWidth, -halfHeight, width, height);

    for (var x = -halfWidth; x < halfWidth; x += canvasStep) {
        context.moveTo(x, -halfHeight);
        context.lineTo(x, halfHeight);
    }

    for (var y = -halfHeight; y < halfHeight; y += canvasStep) {
        context.moveTo(halfWidth, y);
        context.lineTo(-halfWidth, y);
    }
    context.strokeStyle = "#eee";
    context.stroke();

    //draw X
    var leftWall = halfWidth - canvasStep;
    context.beginPath();
    context.moveTo(-leftWall, canvasStep);
    context.lineTo(leftWall, canvasStep);
    context.moveTo(leftWall - 5, 5 + canvasStep);
    context.lineTo(leftWall, canvasStep);
    context.lineTo(leftWall - 5, -5 + canvasStep);

    //draw Y
    var topWall = halfHeight - canvasStep;
    context.moveTo(5, -topWall + 5);
    context.lineTo(0, -topWall);
    context.lineTo(-5, -topWall + 5);
    context.moveTo(0, -topWall);
    context.lineTo(0, topWall);

    context.strokeStyle = "#000";
    context.stroke();
    drawAllPoints();
}

function drawPoint(x, y) {
    if (arguments.length == 0) {
        x = parseInt($("#xPos").val());
        y = parseInt($("#yPos").val());
    } else if (arguments.length == 1) {
        var point = arguments[0];
        x = point.x;
        y = point.y;
        context.fillRect(x * canvasStep, -y * canvasStep, canvasStep, canvasStep);
        return;
    }
    var removeId;
    $.each(map, function(i, val) {
        if (val.x == x && val.y == y) {
            removeId = i;
            return false;
        }
    });
    if (removeId == null) {
        addToMap(x, y);
        context.fillRect(x * canvasStep, -y * canvasStep, canvasStep, canvasStep);
        info.html("Draw point on [" + x + "; " + y + "]");
    } else {
        map.splice(removeId, 1);
        context.clearRect(x * canvasStep, -y * canvasStep, canvasStep, canvasStep);
        info.html("Remove point on [" + x + "; " + y + "]");
    }
}

function returnPoints(count) {
    if (map.length != count) {
        info.html("Canvas should contains " + count + " points (add/remove by click)");
        return null;
    } else {
        var result = [];
        $.each(map, function(i, val) {
            var alias = (i + 1).toString();
            result["x" + alias] = val.x;
            result["y" + alias] = val.y;
            result["z" + alias] = 1;
        });
        return result;
    }
}

function showPoint(pointId) {
    drawAllPoints();
    var id = parseInt(pointId);
    if (id >= 0 && map.length > id) {
        context.fillStyle = POINT_HOVER_COLOR;
        drawPoint(map[id]);
    }
}

function drawPointBrighter(swapAxes, x, y, c) {
    var increasePercent = Math.round(100 * (1 - c));
    context.fillStyle = increase_brightness(POINT_COLOR, increasePercent);
    if (swapAxes) drawPoint(y, x);
    else drawPoint(x, y);
}

function increase_brightness(hex, percent) {
    if (percent == 100) return "#fff";

    var r = parseInt(hex.substr(1, 2), 16),
            g = parseInt(hex.substr(3, 2), 16),
            b = parseInt(hex.substr(5, 2), 16);

    return '#' +
            ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
            ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
            ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

function draw2Points() {
    clearCanvas();
    resetScale();
    var limit = (halfWidth / canvasStep) - 10;
    drawRandomPoint(-limit, limit);
    drawRandomPoint(-limit, limit);
}

function drawRandomPoint(from, to) {
    drawPoint(Math.rand(from, to), Math.rand(from, to));
}

//Функция отрисовки алгоритма (используется во время перемещения "контрольной точки")
function drawAlgorithm(isRandom) {
    clearStandartMap();
    if (algorithmType == 1) {
        drawHermite(isRandom);
    } else if (algorithmType == 2) {
        drawBezier(isRandom);
    } else if (algorithmType == 3) {
        drawBSpline(isRandom);
    }
}

// start new block init //////////////////////////////////////////

var canvas, context;
var width, height, halfWidth, halfHeight;
var canvasStep = 10;
var scaleFactor = 1;
var map = [];
var canvasElem,info, steps;
var oldPosX,oldPosY;
var POINT_COLOR = "#2c8875";
var POINT_CONTROL_COLOR = "#ff0000";
var POINT_HOVER_COLOR = "#ff0000";
var tid = 0;
var speed = 100;

var controlMap = []; //массив "контрольных точек"
var movingPointNumber; //индекс перемещаемой контрольной точки в массиве controlMap
var algorithmType;
var posX;
var posY;

var MODE = {
    MAIN: "MAIN",
    MOVE_CANVAS : "MOVE_CANVAS",
    SCALE_CANVAS : "SCALE_CANVAS",
    DRAW_POINT: "DRAW_POINT",
    DELETE_POINT : "DELETE_POINT",
    MOVE_POINT: "MOVE_POINT"
};

var mode = MODE.MAIN;

$(function() {
    canvas = document.getElementById("canvas");
    canvasElem = $("#canvas");
    info = $("#info");
    steps = $("#steps");
    context = canvas.getContext('2d');

    setCtxCenter();
    width = canvas.width;
    halfWidth = width / 2;
    height = canvas.height;
    halfHeight = height / 2;

    drawField();
    initEvents();
    initJQueryComponents();
    clearCanvas();

});

function setMode(mode, isRandom) {
    algorithmType = mode;
    drawAlgorithm(isRandom);
}

function initJQueryComponents() {
    $('#xPos').spinner({ min: -100, max: 100 });
    $('#yPos').spinner({ min: -100, max: 100});
    $('#step').spinner({ min: 1, max: 25 , step: 5 });
    $('#radius').spinner({ min: 1, max: 50 , step: 5 });
    $('#koef').spinner({ min: 1, max: 25 , step: 1 });
    $('#a').spinner({ min: 1, max: 50 , step: 1 });
    $('#b').spinner({ min: 1, max: 50 , step: 1 });
//	$('#accordion').accordion();
}


function initEvents() {
    canvasElem.mousedown(function(e) {
        mode = MODE.DRAW_POINT;
        posX = mouseLocalCord(e).x;
        posY = mouseLocalCord(e).y;
        if (tid == 0) {
            tid = setInterval(function() {
                mode = MODE.MOVE_POINT;
            }, speed);
        }

    });

    canvasElem.mouseup(function() {
        if (mode == MODE.DRAW_POINT) {
            drawPoint(posX, posY);
            if (algorithmType != null && movingPointNumber == null) {
                addToMap(posX, posY, true);
                drawAllPoints();
            }
        } else if (mode == MODE.MOVE_POINT) {
            mode = MODE.MAIN;
            movingPointNumber = null;
        }
        toggleOff();
    });

    canvasElem.mousemove(function(e) {
        if (mode == MODE.MOVE_CANVAS) {
            if (oldPosX != null && oldPosY != null) {
                context.translate((e.pageX - oldPosX) / scaleFactor, (e.pageY - oldPosY) / scaleFactor);
                clearContext();
                drawField();
            }
            oldPosX = e.pageX;
            oldPosY = e.pageY;
        } else if (mode == MODE.MOVE_POINT) {
            if (movingPointNumber == null) {
                movingPointNumber = controlPointExists(posX, posY);
                if (movingPointNumber == null) {
                    addToMap(posX, posY, true);
                    drawAllPoints();
                }
            }
            if (movingPointNumber != null) {
                changePointPosition(mouseLocalCord(e).x, mouseLocalCord(e).y, movingPointNumber);
                drawAlgorithm(false);
            }
        } else if (mode = MODE.MAIN) {
            var x = mouseLocalCord(e).x;
            var y = mouseLocalCord(e).y;
            info.html("x: " + x + " y: " + y);
        } else if (mode = MODE.DRAW_POINT && algorithmType == 3) {
            drawAlgorithm(false);
        }

    });

    window.addEventListener('keydown', move, true);
//    canvas.addEventListener('DOMMouseScroll', scroll, false);
}

// ////////////////////////////////////////////////////////////////////////////////

function changeStep() {
    var newStep = parseInt($("#step").val());
    if (newStep > 0 && newStep <= 25)
        canvasStep = newStep;
    clearCanvas();
}

function toggleOff() {
    if (tid != 0) {
        clearInterval(tid);
        tid = 0;
        moveCanvas = false;
        oldPosX = oldPosY = null;
    }
}

function scroll(e) {
    var rolled = ('wheelDelta' in e) ? e.wheelDelta : -40 * e.detail;
    if (rolled > 0) upScale();
    else downScale();
}

function move(e) {
    var keyCode = e.keyCode;
    if (keyCode == 38)
        context.translate(0, -canvasStep);
    else if (keyCode == 40)
        context.translate(0, +canvasStep);
    else if (keyCode == 37)
        context.translate(- canvasStep, 0);
    else if (keyCode == 39)
        context.translate(canvasStep, 0);
    else
        return;
    clearContext();
    drawField();
}

function mouseLocalCord(e) {
    var offset = canvasElem.offset();
    var x = Math.floor((e.pageX - offset.left - halfWidth) / canvasStep / scaleFactor);
    var y = Math.floor((e.pageY - offset.top - halfHeight) / canvasStep / scaleFactor);
    return {"x" : x, "y" : -y};
}

function setCtxCenter() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(canvas.width / 2, canvas.height / 2);
}

function clearCanvas() {
    map = [];
	controlMap = [];
    resetScale();
    steps.html("");
}

function clearStandartMap() {
	map = [];
	resetScale();
}

function clearContext() {
    context.save();
    context.beginPath();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
}

function upScale() {
    clearContext();
    scaleFactor += 0.1;
    context.scale(1.1, 1.1);
    drawField();
}

function resetScale() {
    clearContext();
    scaleFactor = 1;
    setCtxCenter();
    drawField();
}

function downScale() {
    clearContext();
    context.scale(0.9, 0.9);
    scaleFactor -= 0.1;
    drawField();
}

// matrix

var ROTATE_X = 0;
var ROTATE_Y = 1;
var ROTATE_Z = 2;


function scale(pointMatrix, zoomX, zoomY, zoomZ) {
    if (arguments.length == 2) {
        zoomY = arguments[1];
        zoomZ = arguments[1];
    }
    var transform = [
        [zoomX, 0, 0, 0],
        [0, zoomY, 0, 0],
        [0, 0, zoomZ, 0],
        [0, 0, 0, 1]
    ];
    return multiplyMatrix(pointMatrix, transform);
}

function translate(pointMatrix, x, y, z) {
    var transform = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 12]
    ];
    return multiplyMatrix(pointMatrix, transform);
}

function rotate(pointMatrix, angle, direction) {
    var transform;
    if (direction == ROTATE_X) {
        transform = [
            [1, 0, 0, 0],
            [0, Math.cos(angle), Math.sin(angle), 0],
            [0, -Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 0, 1]
        ];
    } else if (direction == ROTATE_Y) {
        transform = [
            [Math.cos(angle), 0, -Math.sin(angle), 0],
            [0, 1, 0, 0],
            [Math.sin(angle), 0, Math.cos(angle), 0],
            [0, 0, 0, 1]
        ];
    } else if (direction == ROTATE_Z) {
        transform = [
            [Math.cos(angle), Math.sin(angle), 0, 0],
            [-Math.sin(angle), Math.cos(angle), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }
    return multiplyMatrix(pointMatrix, transform);
}

//  helper

function addToMap(x, y, isState) {
    if (arguments.length == 3) {
        controlMap.push({'x' : x, 'y' : y, 'z' : 1});
    } else {
        map.push({'x' : x, 'y' : y, 'z' : 1});
    }
}

// th or td and count
function appendRow(type, size) {
    if (arguments.length == size + 2) {
        var row = "<tr onmouseover=\"showPoint('" + arguments[2] + "');\">";
        for (var i = 2; i < size + 2; i++) {
            row += "<" + type + ">" + arguments[i] + "</" + type + ">";
        }
        row += "</tr>";
    }
    steps.append(row);
}

Math.sign = function (value) {
    if (value == 0) return 0;
    else return value > 0 ? 1 : -1;
};

Math.rand = function(from, to) {
    return Math.floor(Math.random() * (from - to + 1)) + to;
};

function ipart(x) {
    return Math.floor(x);
}

function fpart(x) {
    return x - Math.floor(x);
}

function rfpart(x) {
    return 1 - fpart(x);
}

//Функция проверки существования "контрольной точки" в координатах х,у
function controlPointExists(x, y) {
    var index = null;
    $.each(controlMap, function(i,val) {
        if (val.x == x && val.y == y) {
            index = i;
            return false;
        }
    });
    return index;
}

//Функция изменения положения точки с порядковым номером number в массиве controlMap
function changePointPosition(x, y, number) {
    controlMap[number] = {'x' : x, 'y' : y, 'z' : 1};
}

function createMatrix(mm, qq) {
    var result = new Array(mm);
    for (var m = 0; m < mm; m++) {
        result[m] = new Array(qq);
        for (var q = 0; q < qq; q++) {
            result[m][q] = 0;
        }
    }
    return result;
}

function multiplyMatrix(m1, m2) {
    var mm = m1.length;
    var nn = m1[0].length;
    var qq = m2[0].length;
    var result = createMatrix(mm, qq);
    for (var m = 0; m < mm; m++) {
        for (var q = 0; q < qq; q++) {
            for (var n = 0; n < nn; n++) {
                result[m][q] += m1[m][n] * m2[n][q];
            }
        }
    }
    return result;
}

function getPoints() {
    for (var i = 0; i < controlMap.length; i++) {
        l3_points[i] = [controlMap[i].x, controlMap[i].y];
    }
}

function getRandomPoints(count) {
    if (arguments.length == 0) count = 4;
    clearCanvas();
    resetScale();
    var limit = (halfWidth / canvasStep) - 10;

    for (var i = 0; i < count; i++) {
        addToMap(Math.rand(-limit, limit), Math.rand(-limit, limit), true);
    }
    drawAllPoints();
}

// splines

var l3_points = [];
var step;

function drawHermite(isRandom) {
    step = 0.001;
    if (isRandom) getRandomPoints();
    getPoints();

    var M = [
        [2, -2, 1, 1],
        [-3, 3, -2, -1],
        [0, 0, 1, 0],
        [1, 0, 0, 0]
    ];

    for (var t = 0; t <= 1; t += step) {
        var T = [
            [t * t * t, t * t, t, 1]
        ];
        var result = multiplyMatrix(multiplyMatrix(T, M), l3_points);
        addToMap(Math.round(result[0][0]), Math.round(result[0][1]));
    }
    drawAllPoints();
}


function drawBezier(isRandom) {
    step = 0.001;

    var M = [
        [-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 3, 0, 0],
        [1, 0, 0, 0]
    ];

    if (isRandom) getRandomPoints();
    getPoints();

    var C = multiplyMatrix(M, l3_points);

    for (var t = 0; t <= 1; t += step) {
        var T = [
            [t * t * t, t * t, t, 1]
        ];
        var result = multiplyMatrix(T, C);
        addToMap(Math.round(result[0][0]), Math.round(result[0][1]));
    }

    drawAllPoints();
}


function drawBSpline(isRandom) {
    step = 0.001;
    var M = [
        [-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 0, 3, 0],
        [1, 4, 1, 0]
    ];

    if (isRandom) getRandomPoints(4);
    var count = controlMap.length;

    for (var i = 0; i < count - 3; i++) {
        var px1 = controlMap[i].x,
                py1 = controlMap[i].y,
                px2 = controlMap[i + 1].x,
                py2 = controlMap[i + 1].y,
                px3 = controlMap[i + 2].x,
                py3 = controlMap[i + 2].y,
                px4 = controlMap[i + 3].x,
                py4 = controlMap[i + 3].y;

        var G = [
            [px1, py1],
            [px2, py2],
            [px3, py3],
            [px4, py4]
        ];

        var r = multiplyMatrix(M, G);

        for (var t = 0; t <= 1; t += step * canvasStep) {
            var T = [
                [t * t * t, t * t, t, 1]
            ];
            var result = multiplyMatrix(T, r);
            addToMap(Math.round(result[0][0] / 6.), Math.round(result[0][1] / 6.));
        }
    }
    drawAllPoints();
}
