let boardElement = document.querySelector(".tenuki-board");
var game = new tenuki.Game({ element: boardElement });

function tenukiToKata(x, y) {
	let xConvert = {
		0: "A",
		1: "B",
		2: "C",
		3: "D",
		4: "E",
		5: "F",
		6: "G",
		7: "H",
		8: "J",
		9: "K",
		10: "L",
		11: "M",
		12: "N",
		13: "O",
		14: "P",
		15: "Q",
		16: "R",
		17: "S",
		18: "T"
	};
	let yConvert = {
		0: 19,
		1: 18,
		2: 17,
		3: 16,
		4: 15,
		5: 14,
		6: 13,
		7: 12,
		8: 11,
		9: 10,
		10: 9,
		11: 8,
		12: 7,
		13: 6,
		14: 5,
		15: 4,
		16: 3,
		17: 2,
		18: 1
	};

	return "" + xConvert[x] + yConvert[y];
}

function kataToTenuki(coord) {
	let xConvert = {
		"A": 0,
		"B": 1,
		"C": 2,
		"D": 3,
		"E": 4,
		"F": 5,
		"G": 6,
		"H": 7,
		"J": 8,
		"K": 9,
		"L": 10,
		"M": 11,
		"N": 12,
		"O": 13,
		"P": 14,
		"Q": 15,
		"R": 16,
		"S": 17,
		"T": 18
	};
	let yConvert = {
		19: 0,
		18: 1,
		17: 2,
		16: 3,
		15: 4,
		14: 5,
		13: 6,
		12: 7,
		11: 8,
		10: 9,
		9: 10,
		8: 11,
		7: 12,
		6: 13,
		5: 14,
		4: 15,
		3: 16,
		2: 17,
		1: 18
	};

	let x = xConvert[coord[0]];
	let y = yConvert[parseInt(coord.substring(1))];
	console.log(x);
	console.log(y);
	return [ x, y ];
}

function genmove() {
	fetch("http://localhost:8080/kata/genmove?color=white",
		{ method: "GET" })
		.then(response => response.text())
		.then(data => {
			let coord = kataToTenuki(data);
			game.playAt(coord[0], coord[1]);
		});
}

function play(x, y) {
	fetch("http://localhost:8080/kata/play?color=white&coord=" + tenukiToKata(x, y),
		{ method: "GET" })
}

game.callbacks.postRender = function (game) {
	if (game.currentState().pass) {
		console.log(game.currentState().color + " passed");
	}

	if (game.currentState().playedPoint) {
		console.log(game.currentState().color + " played " + game.currentState().playedPoint.y + "," + game.currentState().playedPoint.x);
		if (game.currentState().color == "black") {
			play(game.currentState().playedPoint.x, game.currentState().playedPoint.y);
			genmove();
		}
	}
};