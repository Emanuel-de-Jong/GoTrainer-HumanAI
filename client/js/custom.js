var custom = {};

custom.suggestionReadyEvent = new Event("suggestionReady");

custom.bestCoords;
custom.opponentBestCoordsPromise;
custom.isPlayerControlling = false;
custom.isJumped = false;

custom.init = async function() {
	await server.init();

	await board.init();
	board.editor.addListener(custom.boardEditorListener);
	board.nextButton.addEventListener("click", custom.nextButtonClickListener);

	await custom.createPreMoves();
};

custom.playPreMove = async function(color) {
	let coords = await server.analyze(color, options.preOptions);
	await board.draw(coords[utils.randomInt(coords.length)]);
};

custom.createPreMoves = async function() {
	let generatedPreMoves = options.preMoves;

	if (options.handicap == 0) {
		let cornerCount = generatedPreMoves < 4 ? generatedPreMoves : 4;
		let cornerCoords = board.fillCorners();
		for (let i=0; i<cornerCount; i++) {
			await board.draw(cornerCoords[i]);
			generatedPreMoves--;
		}
	}

	let lastColor = board.lastColor();
	for (let i=0; i<generatedPreMoves; i++) {
		if (lastColor == -1) {
			lastColor = 1;
			await custom.playPreMove(1);
		} else {
			lastColor = -1;
			await custom.playPreMove(-1);
		}
	}

	if (options.color == board.lastColor()) {
		await custom.playPreMove(board.nextColor());
	}

	await custom.getBestCoords();
};

custom.boardEditorListener = async function(event) {
	if (event.markupChange === true && custom.isPlayerControlling) {
		custom.isPlayerControlling = false;
        await custom.playerTurn();
    } else if (event.navChange === true) {
		let currentMove = board.editor.getCurrent();
		if (board.lastMove.moveNumber+1 != currentMove.moveNumber ||
				board.lastMove.navTreeY != currentMove.navTreeY) {
			custom.isJumped = true;

			if (!board.nextButton.disabled) {
				board.disableNextButton();
				custom.givePlayerControl();
			}
		}
	}
};

custom.givePlayerControl = async function() {
	board.editor.setTool("cross");
	custom.isPlayerControlling = true;
};

custom.nextButtonClickListener = async function() {
	board.disableNextButton();
	await custom.botTurn();
};

custom.getBestCoords = async function() {
	custom.bestCoords = await server.analyze();
	custom.givePlayerControl();
	document.dispatchEvent(custom.suggestionReadyEvent);
};

custom.getOpponentBestCoords = function() {
	custom.opponentBestCoordsPromise = server.analyze();
};

custom.playerTurn = async function() {
	if (custom.isJumped) {
		custom.isJumped = false;
		await server.setBoard();
		custom.bestCoords = await server.analyze();
	}

	let markupCoord = board.markupToCoord();
	let isRightChoice = false;
	let isPerfectChoice = false;
	for (let i=0; i<custom.bestCoords.length; i++) {
		if (utils.compCoord(markupCoord, custom.bestCoords[i])) {
			if (i == 0) {
				isPerfectChoice = true;
			}

			isRightChoice = true;
			await board.draw(custom.bestCoords[i]);
			break;
		}
	}

	if (!isRightChoice) {
		await board.draw(custom.bestCoords[0]);
	}

	custom.getOpponentBestCoords();

	board.drawCoords(custom.bestCoords);
	if (!isRightChoice) {
		await board.draw(markupCoord, "cross");
	}

	board.enableNextButton();

	options.updateStats(isRightChoice, isPerfectChoice);
};

custom.botTurn = async function() {
	let coords = await custom.opponentBestCoordsPromise;
	await board.draw(coords[0]);

	await custom.getBestCoords();
};

document.getElementById("restart").addEventListener("click", async () => {
	options.update();
	await custom.init();
});


(function () {

	custom.init();

})();