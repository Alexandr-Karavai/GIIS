const MATRIX_HERMITE = [
    [ 2, -2,  1,  1],
    [-3,  3, -2, -1],
    [ 0,  0,  1,  0],
    [ 1,  0,  0,  0]
];

const MATRIX_BEZIER = [
    [ -1,  3, -3, 1],
    [  3, -6,  3, 0],
    [ -3,  3,  0, 0],
    [  1,  0,  0, 0]
];

const MATRIX_BSPLINE = [
    [ -1,  3, -3, 1],
    [  3, -6,  3, 0],
    [ -3,  0,  3, 0],
    [  1,  4,  1, 0]
];

let array_points = [];
let debug_table = true;
let setting_step;

const MATRIX_CONTROL_POINTS = array_points;

//	Функция отрисовки кривой Эрмита
function drawHermite(randomParametr) {
  if (randomParametr) getRandomPoints();
    getPoints();
    setting_step = 0.001;
    for (let t = 0; t <= 1; t += setting_step) {
        //Матрица MATRIX_T
        let MATRIX_T = [
            [t * t * t, t * t, t, 1]
        ];
		//Вычисление координат точки путем перемножения матриц
    let result = multiplicationMarix(multiplicationMarix(MATRIX_T, MATRIX_HERMITE), MATRIX_CONTROL_POINTS);
		let x = Math.round(result[0][0]);
		let y = Math.round(result[0][1]);
      if (!checkControlPoint(x,y)) {
			   addToCanvas(x, y);
		}
  }
  drawingAllPointsCanvas();
}

// Функция отрисовки кривой Безье
function drawBezier(randomParametr) {
  if (randomParametr) getRandomPoints();
    getPoints();
	  setting_step = = 0.001;
    const MATRIX_RESULT = multiplicationMarix(MATRIX_BEZIER, MATRIX_CONTROL_POINTS);
      for (let t = 0; t <= 1; t += setting_step) {
          let MATRIX_T = [
              [t * t * t, t * t, t, 1]
          ];
    let result = multiplicationMarix(MATRIX_T, MATRIX_RESULT);
		let x = Math.round(result[0][0]);
		let y = Math.round(result[0][1]);
  		if (!checkControlPoint(x,y)) {
  			addToCanvas(x, y);
  	}
  }
  drawingAllPointsCanvas();
}

//	Функция отрисовки B-сплайна
function drawBSpline(randomParametr) {
  if (randomParametr) getRandomPoints();
    getPoints();
    setting_step = = 0.001;
    let numberControlPointOnCanvas = controlPointCanvas.length;
      for (let i = 0; i < numberControlPointOnCanvas - 3; i++) {
		  //Получение координат четырех точек
        let px1 = controlPointCanvas[i].x,
            py1 = controlPointCanvas[i].y,
            px2 = controlPointCanvas[i + 1].x,
            py2 = controlPointCanvas[i + 1].y,
            px3 = controlPointCanvas[i + 2].x,
            py3 = controlPointCanvas[i + 2].y,
            px4 = controlPointCanvas[i + 3].x,
            py4 = controlPointCanvas[i + 3].y;

        let MATRIX_CONTROL_POINTS = [
            [px1, py1],
            [px2, py2],
            [px3, py3],
            [px4, py4]
        ];
        const MATRIX_RESULT = multiplicationMarix(MATRIX_BSPLINE, MATRIX_CONTROL_POINTS);
        for (let t = 0; t <= 1; t += setting_step) {
            let MATRIX_T = [
                [t * t * t, t * t, t, 1]
            ];
      let result = multiplicationMarix(MATRIX_T, MATRIX_RESULT);
			let x = Math.round(result[0][0] / 6.);
			let y = Math.round(result[0][1] / 6.);

			if (!checkControlPoint(x,y)) {
				addToCanvas(x, y);
			}
    }
  }
  drawingAllPointsCanvas();
}
