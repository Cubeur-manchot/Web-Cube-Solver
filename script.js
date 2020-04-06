"use strict";

// import functions from tagCreator.js
/* global createHtmlTagWithClassNameAndTextContent */

function init()
{
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
	window.eventName = "3x3x3";
	window.moveSequence = [];
}

function updateEventName()
{
	let eventNameSelect = document.querySelector("select");
	window.eventName = eventNameSelect.options[eventNameSelect.selectedIndex].value;
}

function createCubeAndApplySequence()
{
	let cubeState;
	if (window.eventName === "1x1x1") {
		cubeState = new Cube1x1x1State();
	}
	cubeState.applySequence(window.moveSequence);
}

function displayCube()
{
	let cubeImageContainerHtmlTag = document.querySelector("div#cubeImageContainer"),
		cubeImageHtmlTag = createHtmlTagWithId("img", "cubeImage"), src, moveSequence = window.moveSequence.join(' '),
		moveSequenceBigCubes, move, firstSliceNumber, secondSliceNumber, tmp, endOfMove;
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
		if (window.eventName[0] > 3) { // cube size > 3
			moveSequenceBigCubes = "";
			for (move of window.moveSequence) {
				if (move.includes("-")) { // move has the form 2-4Rw' : take all the slices between the numbers
					firstSliceNumber = move.match(/(\d+)/g)[0];
					secondSliceNumber = move.match(/(\d+)/g)[1];
					endOfMove = move.substring(move.match(/.*-\d+/g)[0].length).replace("w",""); // takes everything after second number
					if (firstSliceNumber > secondSliceNumber) {
						tmp = firstSliceNumber;
						firstSliceNumber = secondSliceNumber;
						secondSliceNumber = tmp;
					}
					moveSequenceBigCubes += secondSliceNumber + endOfMove + " ";
					if (firstSliceNumber > 1) {
						if (endOfMove.includes("'")) {
							moveSequenceBigCubes += firstSliceNumber - 1 + endOfMove.substring(0, endOfMove.length - 1) + " ";
						} else {
							moveSequenceBigCubes += firstSliceNumber - 1 + endOfMove + "' ";
						}
					}
				} else if (/^\d+$/.test(move[0]) && !move.includes("w")) { // move has the the form 3R' : take only one slice
					moveSequenceBigCubes += move;
				} else {
					moveSequenceBigCubes += move;
				}
			}
			moveSequence = moveSequenceBigCubes; // overwrite basic move sequence
		}
		src = "http://cube.crider.co.uk/visualcube.php?fmt=png&bg=t&size=250&alg=x2" + moveSequence + "&pzl=" + window.eventName[0];
	}

	cubeImageHtmlTag.src = src;
	cubeImageContainerHtmlTag.textContent = "";
	cubeImageContainerHtmlTag.appendChild(cubeImageHtmlTag);
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
			(!isCube || move.match(/^\d+/g)[0] >= cubeSize // slice number must be < cube size
				|| (move.includes("-") && move.match(/\d+/g)[1] >= cubeSize) // if it exists, second slice number must be < cube size
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
}
