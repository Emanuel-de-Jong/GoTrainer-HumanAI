(function () {

const PRE_MOVE_OPTIONS = 3;

var bestCoords;
var isPlayerControlling = false;
var isBestCoordsNeeded = false;

async function init() {
	await server.init();

	await board.init();
	board.editor.addListener(boardEditorListener);
	board.nextButton.addEventListener("click", nextButtonClickListener);

	await createPreMoves();
}

async function playPreMove(color) {
	let coords = await server.analyze(color, options.preStrength, PRE_MOVE_OPTIONS);
	board.draw(coords[utils.randomInt(PRE_MOVE_OPTIONS)]);
}

async function createPreMoves() {
	let generatedPreMoves = options.preMoves/2;

	if (options.handicap == 0) {
		generatedPreMoves -= 2;

		let cornerCoords = board.fillCorners();
		for (let i=0; i<4; i++) {
			board.draw(cornerCoords[i]);
		}
	}

	for (let i=0; i<generatedPreMoves; i++) {
		if (i != 0 || options.handicap == 0) {
			await playPreMove(-1);
		}
		await playPreMove(1);
	}

	if (options.color == 1) {
		await playPreMove(-1);
	}

	await getBestCoords();
}

async function boardEditorListener(event) {
	if (event.markupChange === true && isPlayerControlling) {
		isPlayerControlling = false;
        await playerTurn();
    } else if (event.navChange === true) {
		let currentMove = board.editor.getCurrent();
		if (board.lastMove.moveNumber+1 != currentMove.moveNumber ||
			board.lastMove.navTreeY != currentMove.navTreeY) {
				isBestCoordsNeeded = true;
		}
	}
}

async function nextButtonClickListener() {
	board.nextButton.disabled = true;
	await botTurn();
}

document.querySelector('#restart').addEventListener("click", async () => {
	options.update();
	await init();
});

async function getBestCoords() {
	bestCoords = await server.analyze(board.nextColor(), options.suggestionStrength);
	board.editor.setTool("cross");
	isPlayerControlling = true;
}

async function playerTurn() {
	if (isBestCoordsNeeded) {
		isBestCoordsNeeded = false;
		board.editor.setTool("navOnly");
		bestCoords = await server.analyze(board.nextColor(), options.suggestionStrength);
	}

	let markupCoord = board.markupToCoord();
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<bestCoords.length; i++) {
		if (utils.compCoord(markupCoord, bestCoords[i])) {
			if (i == 0) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			board.draw(bestCoords[i]);
			break;
		}
	}

	if (!isRightChoice) {
		board.draw(bestCoords[0]);
	}

	board.drawCoords(bestCoords);
	if (!isRightChoice) {
		board.draw(markupCoord, "cross");
	}

	board.nextButton.disabled = false;

	options.updateStats(isRightChoice, isPerfectChoice);
}

async function botTurn() {
	let coords = await server.analyze(board.nextColor(), options.opponentStrength)
	board.draw(coords[0]);
	await getBestCoords();
}

init();

})();