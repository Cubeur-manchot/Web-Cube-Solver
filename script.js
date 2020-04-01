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
	window.eventName = "3x3x3";
}

function updateEventName()
{
	let eventNameSelect = document.querySelector("select");
	window.eventName = eventNameSelect.options[eventNameSelect.selectedIndex].value;
}

function displayState()
{
	// wow
}

function parseMoves()
{
	let // HTML tags
		parsedMovesHtmlTag,
		//arrays
		listOfAdmittedMoves = window.admittedMoves[window.eventName],
		spaceCutMoves = [], spaceAndApostropheCutMoves = [], unrecognizedChars = [], movesArray = [],
		// strings
		movesString = document.querySelector("input#movesToParse").value + " ", moveStringBackup = movesString,
		movesWithoutSpace, movesWithoutSpaceOrApostrophe, char, move,
		// integers
		indexOfSpace, indexOfApostrophe,
		// booleans
		hasSliceNumber, hasMinus, minusIsClosed, hasBaseMove, hasTurnAngle;

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
				if (!hasSliceNumber) { // always true except maybe for the first move
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
	if (unrecognizedChars.length !== 0) { // print unrecognized characters
		alert("Warning, some characters were not well parsed" +
			"\nOriginal sequence : " + moveStringBackup +
			"\nParsed sequence : [" + movesArray + "]" +
			"\nUnparsed characters : [" + unrecognizedChars + "]");
	}
	parsedMovesHtmlTag = document.querySelector("div#parsedMoves");
	parsedMovesHtmlTag.textContent = "";
	for (move of movesArray) { // print parsed moves
		parsedMovesHtmlTag.appendChild(createHtmlTagWithClassNameAndTextContent("div", "parsedMove", move));
	}
}
