"use strict";

// import functions from tagCreator.js
/* global createHtmlTagWithClassNameAndTextContent */

function init()
{
	// admitted moves for each puzzle
	window.admittedMoves = [];
	window.admittedMoves["1x1x1"] = ["x", "y", "z"];
	window.admittedMoves["2x2x2"] = window.admittedMoves["1x1x1"].concat(["R", "U", "F", "L", "D", "B"]);
	window.admittedMoves["3x3x3"] = window.admittedMoves["2x2x2"].concat(["r", "u", "f", "l", "d", "b", "M", "E", "S"]);
	window.admittedMoves["4x4x4"] = window.admittedMoves["3x3x3"];
	window.admittedMoves["5x5x5"] = window.admittedMoves["3x3x3"];
	window.admittedMoves["6x6x6"] = window.admittedMoves["3x3x3"];
	window.admittedMoves["7x7x7"] = window.admittedMoves["3x3x3"];
	window.admittedMoves["pyraminx"] = ["R", "U", "L", "B", "r", "u", "l", "b"];
	window.admittedMoves["skewb"] = ["R", "U", "L", "B"];

	// generating moves to solve each puzzle
	window.generatingMoves = [];
	window.generatingMoves["2x2x2"] = {moves: ["R", "U", "F"], senses: ["", "'", "2"]};
	window.generatingMoves["3x3x3"] = {moves: ["R", "U", "F", "L", "D", "B"], senses: ["", "'", "2"]};
	window.generatingMoves["4x4x4"] = {moves: ["R", "U", "F", "L", "D", "B"], senses: ["", "'", "2"]};
	window.generatingMoves["5x5x5"] = {moves: ["R", "U", "F", "L", "D", "B"], senses: ["", "'", "2"]};
	window.generatingMoves["6x6x6"] = {moves: ["R", "U", "F", "L", "D", "B"], senses: ["", "'", "2"]};
	window.generatingMoves["7x7x7"] = {moves: ["R", "U", "F", "L", "D", "B"], senses: ["", "'", "2"]};
	window.generatingMoves["pyraminx"] = {moves: ["R", "U", "L", "B"], senses: ["", "'"]};
	window.generatingMoves["skewb"] = {moves: ["R", "U", "L", "B"], senses: ["","'"]};

	// God's number for each puzzle
	window.godsNumber = [];
	window.godsNumber["1x1x1"] = 0;
	window.godsNumber["2x2x2"] = 11;
	window.godsNumber["3x3x3"] = 20;
	window.godsNumber["4x4x4"] = 1000;
	window.godsNumber["5x5x5"] = 1000;
	window.godsNumber["6x6x6"] = 1000;
	window.godsNumber["7x7x7"] = 1000;
	window.godsNumber["pyraminx"] = 11;
	window.godsNumber["skewb"] = 11;

	// general settings
	window.maxPoolLength = 1000000;
	window.maxDepth = 15;
	window.associationTableFor2x2 = [3, 2, 4, 5, 7, 6, 0, 1];

	// default puzzle
	window.eventName = "3x3x3";
	window.moveSequence = [];
	displayCube();
}

function updateEventName()
{
	let eventNameSelect = document.querySelector("select#eventNameSelect");
	window.eventName = eventNameSelect.options[eventNameSelect.selectedIndex].value;
}

function createCube()
{
	let cubeState;
	if (window.eventName === "1x1x1") {
		cubeState = new Cube1x1x1State();
	} else if (window.eventName === "2x2x2") {
		cubeState = new Cube2x2x2State();
	} else {
		cubeState = new CubeState();
	}
	return cubeState;
}

function solveCube()
{
	let solutionContainerHtmlTag = document.querySelector("div#solutionsContainer"),
		chosenAlgorithm, algorithmName, solutionSequence = [], dateBegin, dateEnd;
	parseMoves(); // force re-parsing if event changed since last parse
	displayCube();
	solutionContainerHtmlTag.textContent = "";
	if (window.currentCubeState.isSolved()) {
		alert(window.eventName + " is already solved");
		return;
	}
	solutionContainerHtmlTag.appendChild(createHtmlTagWithTextContent("div", "[Move Optimal Breadth First Search]"));
	solutionContainerHtmlTag.appendChild(createHtmlTagWithTextContent("div", "Searching..."));
	chosenAlgorithm = getChosenAlgorithm();
	dateBegin = new Date();
	if (chosenAlgorithm === "simpleMoveOptimalBreadthFirst") {
		solutionSequence = solveMoveOptimalBreadthFirst(window.currentCubeState);
		algorithmName = "Move Optimal Breadth First Search"
	} else if (chosenAlgorithm === "improvedMoveOptimalBreadthFirst") {
		solutionSequence = solveMoveOptimalBreadthFirstImproved(window.currentCubeState);
		algorithmName = "Move Optimal Breadth First Search with finish acceleration";
	} else {
		alert("Error : algorithm '" + chosenAlgorithm + "' isn't implemented");
		return;
	}
	dateEnd = new Date();
	solutionContainerHtmlTag.textContent = "";
	if (solutionSequence[0] === "Error: pool length exceeded") {
		alert("No solution found, pool length (" + window.maxPoolLength + ") was exceeded");
	} else {
		solutionContainerHtmlTag.appendChild(createHtmlTagWithTextContent("div", "[" + algorithmName + "]"));
		solutionContainerHtmlTag.appendChild(createHtmlTagWithTextContent("div", "Length : " + solutionSequence.length));
		solutionContainerHtmlTag.appendChild(createHtmlTagWithTextContent("div", "Sequence : " + solutionSequence.join(" ")));
		solutionContainerHtmlTag.appendChild(createHtmlTagWithTextContent("div", "Time : " + (dateEnd.getTime() - dateBegin.getTime()) + "ms"));
	}
}

function solveMoveOptimalBreadthFirstImproved(cubeState)
{
	if (window.hashMapNearestPositions === undefined) {
		if (window.eventName === "2x2x2") {
			generateHashMapNearestStates(5);
		}
	}
	let cubeStatePool = [{state: cubeState, moveSequence: []}], nextCubeStatePool = [], nearCubeStatePool = [],
		generatingMoves = window.generatingMoves[window.eventName].moves, generatingSenses = window.generatingMoves[window.eventName].senses,
		currentCubeStateWithMoveSequence, currentCubeState, currentMoveSequence, generatingMove, generatingSense,
		newMove, newCubeState, newMoveSequence, newCubeStateWithMoveSequence, hashValue, cost, minimalCost, minimalCubeStateWithMoveSequence;
	while (cubeStatePool.length < window.maxPoolLength) {
		nextCubeStatePool = [];
		for (currentCubeStateWithMoveSequence of cubeStatePool) {
			currentMoveSequence = currentCubeStateWithMoveSequence.moveSequence;
			currentCubeState = currentCubeStateWithMoveSequence.state;
			for (generatingMove of generatingMoves) {
				if (moveSequence[moveSequence.length] !== generatingMove) // can be fused with last move -> don't generate
				{
					for (generatingSense of generatingSenses) {
						newMove = generatingMove + generatingSense;
						newCubeState = currentCubeState.clone();
						newMoveSequence = currentMoveSequence.map(x => x);
						newCubeState.applyMove(newMove);
						newMoveSequence.push(newMove);
						hashValue = newCubeState.hashPosition();
						newCubeStateWithMoveSequence = {state: newCubeState, moveSequence: newMoveSequence};
						if (window.hashMapNearestPositions[hashValue] !== undefined) { // if cube state is in nearest positions table
							nearCubeStatePool.push(newCubeStateWithMoveSequence);
						} else {
							nextCubeStatePool.push(newCubeStateWithMoveSequence);
						}
					}
				}
			}
		}
		if (nearCubeStatePool.length !== 0) {
			minimalCost = 1000;
			for (currentCubeStateWithMoveSequence of nearCubeStatePool) {
				cost = window.hashMapNearestPositions[currentCubeStateWithMoveSequence.state.hashPosition()].cost;
				if (cost < minimalCost) {
					minimalCubeStateWithMoveSequence = currentCubeStateWithMoveSequence;
					minimalCost = cost;
				}
			}
			return minimalCubeStateWithMoveSequence.moveSequence.concat(
				window.hashMapNearestPositions[minimalCubeStateWithMoveSequence.state.hashPosition()].solution);
		}
		cubeStatePool = nextCubeStatePool.map(x => x);
	}
	return ["Error: pool length exceeded"];
}

function solveMoveOptimalBreadthFirst(cubeState)
{
	let cubeStatePool = [{state: cubeState, moveSequence: []}], nextCubeStatePool = [],
		generatingMoves = window.generatingMoves[window.eventName].moves, generatingSenses = window.generatingMoves[window.eventName].senses,
		currentCubeStateWithMoveSequence, currentCubeState, currentMoveSequence, generatingMove, generatingSense, newMove, newCubeState, newMoveSequence;
	while (cubeStatePool.length < window.maxPoolLength) {
		nextCubeStatePool = [];
		for (currentCubeStateWithMoveSequence of cubeStatePool) {
			currentMoveSequence = currentCubeStateWithMoveSequence.moveSequence;
			currentCubeState = currentCubeStateWithMoveSequence.state;
			for (generatingMove of generatingMoves) {
				if (currentMoveSequence[moveSequence.length] !== generatingMove) // can be fused with last move -> don't generate
				{
					for (generatingSense of generatingSenses) {
						newMove = generatingMove + generatingSense;
						newCubeState = currentCubeState.clone();
						newMoveSequence = currentMoveSequence.map(x => x);
						newCubeState.applyMove(newMove);
						newMoveSequence.push(newMove);
						if (newCubeState.isSolved()) {
							return newMoveSequence;
						} else {
							nextCubeStatePool.push({state: newCubeState, moveSequence: newMoveSequence});
						}
					}
				}
			}
		}
		cubeStatePool = nextCubeStatePool.map(x => x);
	}
	return ["Error: pool length exceeded"];
}

function generateHashMapNearestStates(maxDepth)
{
	let cubeStatePool = [], nextCubeStatePool = [], hashMapResult = [], cubeOrientation,
		cubeOrientations = [[], ["y"], ["y'"], ["y2"], ["x"], ["x", "y"], ["x", "y'"], ["x", "y2"], ["x'"], ["x'", "y"], ["x'", "y'"], ["x'", "y2"],
			["x2"], ["x2", "y"], ["x2", "y'"], ["z2"], ["z"], ["z", "y"], ["z", "y'"], ["z", "y2"], ["z'"], ["z'", "y"], ["z'", "y'"], ["z'", "y2"]],
		generatingMoves = window.generatingMoves[window.eventName].moves, generatingSenses = window.generatingMoves[window.eventName].senses,
		cubeStateWithMoveSequence, cubeState, moveSequence, generatingMove, generatingSense, newMove, newCubeState, newMoveSequence, hashValue;
	for (cubeOrientation of cubeOrientations) {
		cubeStatePool = [{state: createCube(), moveSequence: cubeOrientation}];
		cubeStatePool[0].state.applySequence(cubeOrientation);
		hashMapResult[cubeStatePool[0].state.hashPosition()] = {cost: 0, solution: []};
		for (let depth = 1; depth <= maxDepth; depth++) {
			nextCubeStatePool = [];
			for (cubeStateWithMoveSequence of cubeStatePool) {
				moveSequence = cubeStateWithMoveSequence.moveSequence;
				cubeState = cubeStateWithMoveSequence.state;
				for (generatingMove of generatingMoves) {
					if (moveSequence[0] === undefined || moveSequence[0][0] !== generatingMove) // don't generate if can be fused with last move
					{
						for (generatingSense of generatingSenses) {
							newMove = generatingMove + generatingSense;
							newCubeState = cubeState.clone();
							newMoveSequence = moveSequence.map(x => x);
							newCubeState.applyMove(newMove);
							newMoveSequence.unshift(invertMove(newMove, true));
							hashValue = newCubeState.hashPosition();
							if (hashMapResult[hashValue] === undefined) {
								hashMapResult[hashValue] = {cost: depth, solution: newMoveSequence};
							}/* else {
								console.log("can't hash " + newMoveSequence + " at " + hashValue + " because " + hashMapResult[hashValue].solution + " is already there")
							}*/
							if (depth !== maxDepth) {
								nextCubeStatePool.push({state: newCubeState, moveSequence: newMoveSequence});
							}
						}
					}
				}
			}
			cubeStatePool = nextCubeStatePool.map(x => x);
		}
	}
	window.hashMapNearestPositions = hashMapResult;
}

function displayCube()
{
	let cubeImageContainerHtmlTag = document.querySelector("div#cubeImageContainer"),
		cubeImageHtmlTag = createHtmlTagWithId("img", "cubeImage"),
		animationLinkHtmlTag = createHtmlTagWithId("a", "animationLink"),
		src, moveSequence = window.moveSequence.join(' '), moveSequenceForAnimation = window.moveSequence.join(' ');
	if (window.eventName === "pyraminx") {
		src = "";
	} else if (window.eventName === "megaminx") {
		src = "";
	} else if (window.eventName === "skewb") {
		src = "";
	} else if (window.eventName === "square one") {
		src = "";
	} else if (window.eventName === "clock") {
		src = "";
	} else if (window.eventName[1] === "x") { // NxNxN cubes
		moveSequence = adjustMoveSequenceForCubeImages(window.moveSequence);
		src = "http://cube.crider.co.uk/visualcube.php?fmt=png&bg=t&size=280&alg=x2" + moveSequence + "&pzl=" + window.eventName[0];
		moveSequenceForAnimation = adjustMoveSequenceForCubeAnimations(window.moveSequence);
		animationLinkHtmlTag.href = "https://alg.cubing.net/?puzzle=" + window.eventName + "&setup=" + moveSequenceForAnimation;
		animationLinkHtmlTag.title = "Animation";
	}
	cubeImageHtmlTag.src = src;
	if (animationLinkHtmlTag.href !== "") {
		animationLinkHtmlTag.target = "_blank";
		animationLinkHtmlTag.appendChild(cubeImageHtmlTag); // append image to link
		cubeImageContainerHtmlTag.textContent = "";
		cubeImageContainerHtmlTag.appendChild(animationLinkHtmlTag); // append link to section
	} else {
		cubeImageContainerHtmlTag.textContent = "";
		cubeImageContainerHtmlTag.appendChild(cubeImageHtmlTag); // only append image to section
	}
}

function adjustMoveSequenceForCubeAnimations(moveSequence)
{
	let moveSequenceAdjusted = "", move, adjustedMove, firstSliceNumber, secondSliceNumber, endOfMove;
	if (moveSequence === []) {
		return "";
	}
	for (move of moveSequence) {
		adjustedMove = "";
		if (move.includes("-")) {
			firstSliceNumber = move.match(/\d+/g)[0];
			secondSliceNumber = move.match(/\d+/g)[1];
			endOfMove = move.substring(firstSliceNumber.length + 1 + secondSliceNumber.length);
			[firstSliceNumber, secondSliceNumber] = [firstSliceNumber, secondSliceNumber].sort();
			if (!endOfMove.includes("w")) { // if it has no "w", adds it at the right position
				endOfMove = endOfMove[0] + "w" + endOfMove.substring(1);
			}
			adjustedMove = firstSliceNumber + "%26%2345%3B" + secondSliceNumber + endOfMove; // %26%2345%3B is alg.cubing.net code for "-" character
		} else {
			adjustedMove = move;
		}
		if (/\d/.test(adjustedMove[0])) { // slice number are only with upper case
			adjustedMove = adjustedMove.toUpperCase().replace("W", "w");
		}
		moveSequenceAdjusted += adjustedMove + " ";
	}
	return moveSequenceAdjusted.substring(0, moveSequenceAdjusted.length - 1); // remove space at last character
}

function adjustMoveSequenceForCubeImages(moveSequence)
{
	let moveSequenceBigCubes = "", move, firstSliceNumber, secondSliceNumber, endOfMove;
	for (move of moveSequence) {
		if (move.includes("-")) { // move has the form 2-4Rw' : take all the slices between the numbers
			firstSliceNumber = move.match(/\d+/g)[0];
			secondSliceNumber = move.match(/\d+/g)[1];
			endOfMove = move.substring(move.match(/.*-\d+/g)[0].length).replace("w",""); // takes everything after second number
			[firstSliceNumber, secondSliceNumber] = [firstSliceNumber, secondSliceNumber].sort();
			moveSequenceBigCubes += adjustTurnAngleForCubes(secondSliceNumber + endOfMove) + " ";
			if (firstSliceNumber > 1) {
				moveSequenceBigCubes += makeInnerMoveForBigCubeSliceMoves(firstSliceNumber, endOfMove) + " ";
			}
		} else if (/\d/.test(move[0]) && !move.includes("w")) { // move has the the form 3R' : take only one slice
			moveSequenceBigCubes += adjustTurnAngleForCubes(move) + " ";
			firstSliceNumber = move.match(/^\d+/g)[0];
			endOfMove = move.substring(move.match(/^\d+/g)[0].length);
			if (firstSliceNumber > 1) {
				moveSequenceBigCubes += makeInnerMoveForBigCubeSliceMoves(firstSliceNumber, endOfMove) + " ";
			}
		} else {
			moveSequenceBigCubes += adjustTurnAngleForCubes(move) + " ";
		}
	}
	return moveSequenceBigCubes;
}

function makeInnerMoveForBigCubeSliceMoves(sliceNumber, endOfMove)
{
	if (endOfMove.includes("'")) {
		return adjustTurnAngleForCubes(sliceNumber - 1 + endOfMove.toUpperCase().replace("W", "w").substring(0, endOfMove.length - 1));
	} else {
		return adjustTurnAngleForCubes(sliceNumber - 1 + endOfMove.toUpperCase().replace("W", "w") + "'");
	}
}

function adjustTurnAngleForCubes(move)
{
	let turnAngle, moveBegin, adjustedTurnAngle, hasApostrophe;
	if (/\d/.test(move[move.length - 1])) { // last character is digit
		turnAngle = move.match(/\d+$/)[0];
		moveBegin = move.substring(0, move.length - turnAngle.length);
		hasApostrophe = false;
	} else if (move.length > 1 && move[move.length - 1] === "'" && /\d/.test(move[move.length - 2])) { // second last character is digit and last character is apostrophe
		turnAngle = move.match(/\d+'$/)[0];
		moveBegin = move.substring(0, move.length - turnAngle.length);
		turnAngle = turnAngle.substring(0, turnAngle.length - 1); // remove apostrophe at the end
		hasApostrophe = true;
	} else { // no turn angle, nothing to do
		return move;
	}
	adjustedTurnAngle = turnAngle % 4; // 0, 1, 2, 3
	if (adjustedTurnAngle === 0) { // 0, no move should be made
		return "";
	} else if (adjustedTurnAngle === 3) { // 3, replace by '
		if (hasApostrophe) {
			return moveBegin;
		} else {
			return moveBegin + "'";
		}
	} else { // 1 or 2
		if (hasApostrophe) {
			return moveBegin + adjustedTurnAngle + "'";
		} else {
			return moveBegin + adjustedTurnAngle;
		}
	}
}

function parseMoves()
{
	let // HTML tags
		parsedMovesHtmlTag,
		//arrays
		listOfAdmittedMoves = window.admittedMoves[window.eventName],
		spaceCutMoves = [], spaceAndApostropheCutMoves = [], unrecognizedChars = [], movesArray = [], fullyCheckedMovesArray = [],
		// strings
		movesString = document.querySelector("input#movesToParse").value + " ", moveStringBackup = movesString,
		movesWithoutSpace, movesWithoutSpaceOrApostrophe, char, move,
		// integers
		indexOfSpace, indexOfApostrophe, cubeSize,
		// booleans
		hasSliceNumber, hasMinus, minusIsClosed, hasBaseMove, hasTurnAngle, isCube;

	// cut with spaces
	while(movesString.includes(" ")) {
		indexOfSpace = movesString.indexOf(" ");
		spaceCutMoves.push(movesString.substring(0, indexOfSpace));
		movesString = movesString.substring(indexOfSpace + 1);
	}
	if (movesString !== "") {
		spaceCutMoves.push(movesString); // add the last part of the string
	}
	// cut with apostrophes
	for (movesWithoutSpace of spaceCutMoves) {
		while (movesWithoutSpace.includes("'")) {
			indexOfApostrophe = movesWithoutSpace.indexOf("'");
			spaceAndApostropheCutMoves.push(movesWithoutSpace.substring(0, indexOfApostrophe + 1));
			movesWithoutSpace = movesWithoutSpace.substring(indexOfApostrophe + 1);
		}
		if (movesWithoutSpace !== "") {
			spaceAndApostropheCutMoves.push(movesWithoutSpace); // add the last part of the string
		}
	}
	// parse more deeply
	for (movesWithoutSpaceOrApostrophe of spaceAndApostropheCutMoves) {
		move = "";
		hasSliceNumber = false;
		hasBaseMove = false;
		hasTurnAngle = false;
		hasMinus = false;
		minusIsClosed = false;
		for (char of Array.from(movesWithoutSpaceOrApostrophe)) {
			if (/^\d+$/.test(char)) {// char is digit
				if (hasBaseMove) { // always true except maybe for the first move
					hasTurnAngle = true;
					move = move + char;
				} else {
					hasSliceNumber = true;
					move = move + char;
					if (hasMinus) {
						minusIsClosed = true;
					}
				}
			} else if (char === "-") { // used for stuff like 2-3Rw
				if (hasSliceNumber && !hasBaseMove && !hasMinus) {
					move = move + char;
					hasMinus = true;
				} else {
					unrecognizedChars.push(char);
				}
			} else if (char === "w") { // for wide moves
				if (hasBaseMove && !hasTurnAngle) {
					move = move + char;
				} else {
					unrecognizedChars.push(char);
				}
			} else if (listOfAdmittedMoves.includes(char)) { // base moves
				if (hasBaseMove) { // if a base move has already been found
					if (move !== "") {
						movesArray.push(move);
					}
					// reinitialize move information
					hasSliceNumber = false;
					hasTurnAngle = false;
					hasMinus = false;
					minusIsClosed = false;
					move = "";
				}
				hasBaseMove = true;
				move = move + char;
			} else if (char === "'") { // apostrophe happens only at the very end
				move = move + char;
			} else {
				unrecognizedChars.push(char);
			}
		}
		if (hasBaseMove) {
			movesArray.push(move);
		} else {
			unrecognizedChars.push(move);
		}
	}
	// additional check to manage wide and inner slice moves
	isCube = window.eventName[1] === "x";
	cubeSize = window.eventName[0];
	for (move of movesArray) {
		if (move.includes("w") && (!isCube || cubeSize < 3)) { // wide moves are allowed only for cubes with size > 2
			unrecognizedChars.push(move);
		} else if (move.includes("-") && (!isCube || cubeSize < 4)) { // block slice moves are allowed only for cubes with size > 3
			unrecognizedChars.push(move);
		} else if (/^\d+$/.test(move[0]) && // restriction on slice moves
			(!isCube // slice moves are only for cubes
				|| move.match(/^\d+/g)[0] >= cubeSize || move.match(/^\d+/g)[0] === "0" // 0 < slice number < cube size
				|| (move.includes("-") && // if second slice number exists
					(move.match(/\d+/g)[1] >= cubeSize || move.match(/\d+/g)[1] === "0")) // 0 < second slice number < cube size
				|| move.includes("x") || move.includes("z") || move.includes("z"))) { // slice moves not allowed for rotations
			unrecognizedChars.push(move);
		} else {
			fullyCheckedMovesArray.push(move);
		}
	}

	if (unrecognizedChars.length !== 0) { // print unrecognized characters
		alert("Warning, some characters were not well parsed" +
			"\nOriginal sequence : " + moveStringBackup +
			"\nParsed sequence : [" + movesArray + "]" +
			"\nUnparsed characters : [" + unrecognizedChars + "]");
	}
	parsedMovesHtmlTag = document.querySelector("div#parsedMoves");
	parsedMovesHtmlTag.textContent = "";
	for (move of fullyCheckedMovesArray) { // print parsed moves
		parsedMovesHtmlTag.appendChild(createHtmlTagWithClassNameAndTextContent("div", "parsedMove", move));
	}
	window.moveSequence = fullyCheckedMovesArray;
	window.currentCubeState = createCube();
	window.currentCubeState.applySequence(window.moveSequence);
}

function arraysAreEquals(firstArray, secondArray)
{
	for (let i in firstArray) {
		if (firstArray[i] !== secondArray[i]) {
			return false;
		}
	}
	return true;
}

function makeCleanMove(move)
{
	let parsedRotationAngle, moveRotationAngle;
	if (move.includes("'")) {
		parsedRotationAngle = move.substring(1, move.length - 1);
		if (parsedRotationAngle === "") {
			moveRotationAngle = 3;
		} else {
			moveRotationAngle = (4 - (parsedRotationAngle % 4)) % 4;
		}
		return move[0] + moveRotationAngle;
	} else {
		parsedRotationAngle = move.substring(1);
		if (parsedRotationAngle === "") {
			moveRotationAngle = 1;
		} else {
			moveRotationAngle = parsedRotationAngle % 4;
		}
		return move[0] + moveRotationAngle;
	}
}

function checkFacePermutation(faceToCheck, associationTable)
{
	return associationTable[faceToCheck[0]] === faceToCheck[1]
		&& associationTable[faceToCheck[1]] === faceToCheck[2]
		&& associationTable[faceToCheck[2]] === faceToCheck[3];
}

function getChosenAlgorithm()
{
	for (let algorithmChoice of document.querySelector("form#solvingAlgorithmChooserForm").querySelectorAll("input")) {
		if (algorithmChoice.checked) {
			return algorithmChoice.value;
		}
	}
}

function invertMove(move, isEvenSidedPuzzle)
{
	if (move[move.length - 1] === "'") {
		return move.substring(0, move.length - 1); // remove apostrophe at the end
	} else if (isEvenSidedPuzzle && move[move.length - 1] === "2") {
		return move; // keep move identical
	} else {
		return move + "'"; // add apostrophe at the end
	}
}
