var board = {};

(function () {

board.create = async function() {
	board.element = document.querySelector("#board");
	besogo.create(board.element, {
		resize: "fixed",
		panels: "control+tree+file",
		coord: "western",
		tool: "navOnly",
		size: options.boardsize,
		variants: 2
	});

	board.editor = board.element.besogoEditor;
	
	document.querySelector('button[title="Variants: [child]/sibling"]').remove();
	document.querySelector('button[title="Variants: show/[hide]"]').remove();
	document.querySelector('input[value="9x9"]').remove();
	document.querySelector('input[value="13x13"]').remove();
	document.querySelector('input[value="19x19"]').remove();
	document.querySelector('input[value="?x?"]').remove();
	
	document.querySelector(".besogo-board")
		.insertAdjacentHTML("beforeend", '<button type="button" class="btn btn-secondary" id="next" disabled>></button>');

	board.lastMove = board.editor.getCurrent();

	await board.handicap();
};

board.fillCorners = function() {
	let cornerOptions = [
		[ {x:3,y:3}, {x:3,y:4}, {x:4,y:3}, {x:4,y:4} ],
		[ {x:17,y:3}, {x:17,y:4}, {x:16,y:3}, {x:16,y:4} ],
		[ {x:3,y:17}, {x:3,y:16}, {x:4,y:17}, {x:4,y:16} ],
		[ {x:17,y:17}, {x:17,y:16}, {x:16,y:17}, {x:16,y:16} ],
	];
	cornerOptions = utils.shuffleArray(cornerOptions);

	let coords = [];
	for (let i=0; i<4; i++) {
		let cornerType;
		let randomInt = utils.randomInt(11);
		if (randomInt < 1) { // 3-3 1/11
			cornerType = 0;
		} else if (randomInt < 3) { // 3-4 2/11
			cornerType = 1;
		} else if (randomInt < 5) { // 4-3 2/11
			cornerType = 2;
		} else { // 4-4 6/11
			cornerType = 3;
		}

		coords.push(cornerOptions[i][cornerType]);
		let color = i % 2 == 0 ? -1 : 1;
	}

	return coords;
}

board.nextColor = function() {
	let currentMove = board.editor.getCurrent();
	if (currentMove.children.length > 0) {
		return currentMove.children[0].move.color;
	}
	if (currentMove.move != null) {
		return currentMove.move.color * -1;
	}
	return -1;
}

board.getMoves = function() {
	let moves = [];
	let node = board.editor.getCurrent();
	while (node.moveNumber != 0) {
		moves.push({
			color: node.move.color,
			coord: {
				x: node.move.x,
				y: node.move.y
			}
		});

		node = node.parent;
	}

	moves = moves.reverse();
	return moves;
}

board.draw = function(coord, tool = "auto") {
	board.editor.setTool(tool);
	board.editor.click(coord.x, coord.y, false, false);
	board.editor.setTool("navOnly");

	board.lastMove = board.editor.getCurrent();
};

board.drawCoords = function(coords) {
	board.editor.setTool("label");
	board.editor.setLabel("A");
	coords.forEach(coord => {
		board.editor.click(coord.x, coord.y, false, false);
	});
	board.editor.setTool("navOnly");
}

board.markupToCoord = function() {
	let markup = board.editor.getCurrent().markup;
	let markupNum;
	for (let i=0; i<markup.length; i++) {
		if (markup[i] == 4) {
			markup[i] = 0;
			markupNum = i;
			break;
		}
	}

	return {
		x: Math.floor(markupNum / options.boardsize) + 1,
		y: (markupNum % options.boardsize) + 1
	}
}

board.handicap = async function() {
	let placement = {
		19: {
			0: [],
			2: [ {x:16,y:4}, {x:4,y:16} ],
			3: [ {x:16,y:4}, {x:4,y:16}, {x:16,y:16} ],
			4: [ {x:4,y:4}, {x:16,y:4}, {x:4,y:16}, {x:16,y:16} ],
			5: [ {x:4,y:4}, {x:16,y:4}, {x:10,y:10}, {x:4,y:16}, {x:16,y:16} ],
			6: [ {x:4,y:4}, {x:16,y:4}, {x:4,y:10}, {x:16,y:10}, {x:4,y:16}, {x:16,y:16} ],
			7: [ {x:4,y:4}, {x:16,y:4}, {x:4,y:10}, {x:10,y:10}, {x:16,y:10}, {x:4,y:16}, {x:16,y:16} ],
			8: [ {x:4,y:4}, {x:10,y:4}, {x:16,y:4}, {x:4,y:10}, {x:16,y:10}, {x:4,y:16}, {x:10,y:16}, {x:16,y:16} ],
			9: [ {x:4,y:4}, {x:10,y:4}, {x:16,y:4}, {x:4,y:10}, {x:10,y:10}, {x:16,y:10}, {x:4,y:16}, {x:10,y:16}, {x:16,y:16} ],
		},
		13: {
			0: [],
			2: [ {x:10,y:4}, {x:4,y:10} ],
			3: [ {x:10,y:4}, {x:4,y:10}, {x:10,y:10} ],
			4: [ {x:4,y:4}, {x:10,y:4}, {x:4,y:10}, {x:10,y:10} ],
			5: [ {x:4,y:4}, {x:10,y:4}, {x:7,y:7}, {x:4,y:10}, {x:10,y:10} ],
			6: [ {x:4,y:4}, {x:10,y:4}, {x:4,y:7}, {x:10,y:7}, {x:4,y:10}, {x:10,y:10} ],
			7: [ {x:4,y:4}, {x:10,y:4}, {x:4,y:7}, {x:7,y:7}, {x:10,y:7}, {x:4,y:10}, {x:10,y:10} ],
			8: [ {x:4,y:4}, {x:7,y:4}, {x:10,y:4}, {x:4,y:7}, {x:10,y:7}, {x:4,y:10}, {x:7,y:10}, {x:10,y:10} ],
			9: [ {x:4,y:4}, {x:7,y:4}, {x:10,y:4}, {x:4,y:7}, {x:7,y:7}, {x:10,y:7}, {x:4,y:10}, {x:7,y:10}, {x:10,y:10} ],
		},
		9: {
			0: [],
			2: [ {x:7,y:3}, {x:3,y:7} ],
			3: [ {x:7,y:3}, {x:3,y:7}, {x:7,y:7} ],
			4: [ {x:3,y:3}, {x:7,y:3}, {x:3,y:7}, {x:7,y:7} ],
			5: [ {x:3,y:3}, {x:7,y:3}, {x:5,y:5}, {x:3,y:7}, {x:7,y:7} ],
			6: [ {x:3,y:3}, {x:7,y:3}, {x:5,y:5}, {x:3,y:7}, {x:7,y:7} ],
			7: [ {x:3,y:3}, {x:7,y:3}, {x:5,y:5}, {x:3,y:7}, {x:7,y:7} ],
			8: [ {x:3,y:3}, {x:7,y:3}, {x:5,y:5}, {x:3,y:7}, {x:7,y:7} ],
			9: [ {x:3,y:3}, {x:7,y:3}, {x:5,y:5}, {x:3,y:7}, {x:7,y:7} ],
		},
	}

	placement[options.boardsize][options.handicap].forEach(async (coord) => {
		board.draw(coord, "playB");
	});
}

})();