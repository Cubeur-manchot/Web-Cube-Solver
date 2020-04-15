"use strict";

// IN

function getChosenAlgorithm() // look in form#solvingAlgorithmChooserForm for chosen algorithm
{
	for (let algorithmChoice of document.querySelector("form#solvingAlgorithmChooserForm").querySelectorAll("input")) {
		if (algorithmChoice.checked) {
			return algorithmChoice.value;
		}
	}
}

function getChosenNotation() // look in form#notationChooserForm for chosen notation
{
	for (let notationChoice of document.querySelector("form#notationChooserForm").querySelectorAll("input")) {
		if (notationChoice.checked) {
			return notationChoice.value;
		}
	}
}

function updateEventName() // look in select#eventNameSelect for selected event
{
	let eventNameSelectHtmlTag = document.querySelector("select#eventNameSelect"),
		previousEventName = window.eventName, newEventName = eventNameSelectHtmlTag.options[eventNameSelectHtmlTag.selectedIndex].value;
	window.eventName = newEventName;
	if (newEventName === "skewb") { // since WCA and usual notation contradict each other, the user has to choose the one to use
		addNotationChooserForSkewb(eventNameSelectHtmlTag);
	} else if (previousEventName === "skewb") { // remove notation choice when selecting something other than skewb
		document.querySelector("form#notationChooserForm").remove();
	}
	window.hashMapNearestPositions = undefined; // discard nearest position table
}

function addNotationChooserForSkewb(eventNameSelectHtmlTag) // add simple radio choice for skewb notation (WCA or Algorithm)
{
	let notationToUseChooserFormHtmlTag, notationChoiceRadioButtonHtmlTag, notationChoiceLabelHtmlTag;
	// form
	notationToUseChooserFormHtmlTag = createHtmlTagWithId("form", "notationChooserForm");
	// general label
	notationToUseChooserFormHtmlTag.appendChild(createHtmlTagWithIdAndTextContent("label", "notationChooserLabel", "Choose notation :"));
	// break line
	notationToUseChooserFormHtmlTag.appendChild(createHtmlTag("br"));
	// first radio button
	notationChoiceRadioButtonHtmlTag = createHtmlTagWithIdAndClassName("input", "WCANotationChoice", "notationChoice");
	notationChoiceRadioButtonHtmlTag.type = "radio";
	notationChoiceRadioButtonHtmlTag.name = "notationChooser";
	notationChoiceRadioButtonHtmlTag.value = "WCANotationChoice";
	notationChoiceRadioButtonHtmlTag.checked = true;
	notationToUseChooserFormHtmlTag.appendChild(notationChoiceRadioButtonHtmlTag);
	// first label
	notationChoiceLabelHtmlTag = createHtmlTagWithClassNameAndTextContent("label", "notationChoiceLabel", "WCA (R, U, L, B)");
	notationChoiceLabelHtmlTag.setAttribute("for", "WCANotationChoice");
	notationToUseChooserFormHtmlTag.appendChild(notationChoiceLabelHtmlTag);
	// break line
	notationToUseChooserFormHtmlTag.appendChild(createHtmlTag("br"));
	// second radio button
	notationChoiceRadioButtonHtmlTag = createHtmlTagWithIdAndClassName("input", "algorithmNotationChoice", "notationChoice");
	notationChoiceRadioButtonHtmlTag.type = "radio";
	notationChoiceRadioButtonHtmlTag.name = "notationChooser";
	notationChoiceRadioButtonHtmlTag.value = "algorithmNotationChoice";
	notationChoiceRadioButtonHtmlTag.checked = false;
	notationToUseChooserFormHtmlTag.appendChild(notationChoiceRadioButtonHtmlTag);
	// second label
	notationChoiceLabelHtmlTag = createHtmlTagWithClassNameAndTextContent("label", "notationChoiceLabel", "Algorithms (R, F, L, B, r, f, l, b)");
	notationChoiceLabelHtmlTag.setAttribute("for", "algorithmNotationChoice");
	notationToUseChooserFormHtmlTag.appendChild(notationChoiceLabelHtmlTag);
	// append form
	eventNameSelectHtmlTag.insertAdjacentElement("afterend", notationToUseChooserFormHtmlTag);
}

function translateWCANotationToAlgorithmNotationForSkewb(moveSequence) // switch from WCA notation (R, U, L, B) to algorithm notation (R, F, L, B, r, f, l, b) for skewb
{
	let resultSequence = [];
	for (let move of moveSequence) {
		resultSequence.push(move.replace("R", "b").replace("B", "l").replace("L", "f").replace("U", "L"));
	}
	return resultSequence;
}

function translateAlgorithmNotationToWCANotationForSkewb(moveSequence) // switch from WCA notation (R, U, L, B) to algorithm notation (R, F, L, B, r, f, l, b) for skewb
{
	let resultSequence = [];
	for (let move of moveSequence) {
		if (move === "R") {
			resultSequence.push("B");
			resultSequence.push("x");
			resultSequence.push("y");
		} else if (move === "R'") {
			resultSequence.push("B'");
			resultSequence.push("y'");
			resultSequence.push("x'");
		} else if (move === "F") {
			resultSequence.push("R");
			resultSequence.push("y");
			resultSequence.push("x'");
		} else if (move === "F'") {
			resultSequence.push("R'");
			resultSequence.push("x");
			resultSequence.push("y'");
		} else if (move === "B") {
			resultSequence.push("L");
			resultSequence.push("y");
			resultSequence.push("x");
		} else if (move === "B'") {
			resultSequence.push("L'");
			resultSequence.push("x'");
			resultSequence.push("y'");
		} else if (move === "r") {
			resultSequence.push("U");
			resultSequence.push("y'");
			resultSequence.push("x");
		} else if (move === "r'") {
			resultSequence.push("U'");
			resultSequence.push("x'");
			resultSequence.push("y");
		} else {
			resultSequence.push(move.replace("L", "U").replace("f", "L").replace("l", "B").replace("b", "R"));
		}
	}
	return resultSequence;
}

function parseMoves() // read input#movesToParse and transform the string in an array of moves
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

	// adjust list of admitted moves for skewb if Algorithm notation is chosen
	if (window.eventName === "skewb" && getChosenNotation() === "algorithmNotationChoice") {
		listOfAdmittedMoves = ["R", "F", "L", "B", "r", "f", "l", "b"];
	}
	// generate nearest positions table if needed
	if (window.hashMapNearestPositions === undefined) {
		if (window.eventName === "2x2x2") {
			generateHashMapNearestStates(5);
		}
	}
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
			} else if (char === "'") { // apostrophe appears only at the very end
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
	// print unrecognized characters
	if (unrecognizedChars.length !== 0) {
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

// OUT

function displayCube() // creates an image (and animation link if possible) in div#cubeImageContainer
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
		if (getChosenNotation() === "WCANotationChoice") {
			moveSequence = adjustMoveSequenceForThirdTurnPuzzlesImages(translateWCANotationToAlgorithmNotationForSkewb(window.moveSequence));
		} else {
			moveSequence = adjustMoveSequenceForThirdTurnPuzzlesImages(window.moveSequence);
		}
		src = "http://cubiclealgdbimagegen.azurewebsites.net/generator?puzzle=skewb&alg=" + moveSequence;
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

function adjustMoveSequenceForCubeAnimations(moveSequence) // modify a move sequence for animation link to https://alg.cubing.net/
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

function adjustMoveSequenceForThirdTurnPuzzlesImages(moveSequence) // modify a move sequence for image link on http://cubiclealgdbimagegen.azurewebsites.net/
{
	let moveSequenceResult = "", move;
	for (move of moveSequence) {
		moveSequenceResult += adjustTurnAngle(move, 3);
	}
	moveSequenceResult = moveSequenceResult.replace(/1/g, ""); // remove all "1" because some image generators don't support them
	return moveSequenceResult;
}

function adjustMoveSequenceForCubeImages(moveSequence) // modify a move sequence for image link to visualCube.co.uk
{
	let moveSequenceBigCubes = "", move, firstSliceNumber, secondSliceNumber, endOfMove;
	for (move of moveSequence) {
		if (move.includes("-")) { // move has the form 2-4Rw' : take all the slices between the numbers
			firstSliceNumber = move.match(/\d+/g)[0];
			secondSliceNumber = move.match(/\d+/g)[1];
			endOfMove = move.substring(move.match(/.*-\d+/g)[0].length).replace("w",""); // takes everything after second number
			[firstSliceNumber, secondSliceNumber] = [firstSliceNumber, secondSliceNumber].sort();
			moveSequenceBigCubes += adjustTurnAngle(secondSliceNumber + endOfMove, 4) + " ";
			if (firstSliceNumber > 1) {
				moveSequenceBigCubes += makeInnerMoveForBigCubeSliceMoves(firstSliceNumber, endOfMove) + " ";
			}
		} else if (/\d/.test(move[0]) && !move.includes("w")) { // move has the the form 3R' : take only one slice
			moveSequenceBigCubes += adjustTurnAngle(move, 4) + " ";
			firstSliceNumber = move.match(/^\d+/g)[0];
			endOfMove = move.substring(move.match(/^\d+/g)[0].length);
			if (firstSliceNumber > 1) {
				moveSequenceBigCubes += makeInnerMoveForBigCubeSliceMoves(firstSliceNumber, endOfMove) + " ";
			}
		} else {
			moveSequenceBigCubes += adjustTurnAngle(move, 4) + " ";
		}
	}
	return moveSequenceBigCubes;
}

function makeInnerMoveForBigCubeSliceMoves(sliceNumber, endOfMove) // create a second slice move for big cube inner slice moves, necessary for big cube images on http://cube.crider.co.uk/
{
	if (endOfMove.includes("'")) {
		return adjustTurnAngle(sliceNumber - 1 + endOfMove.toUpperCase().replace("W", "w").substring(0, endOfMove.length - 1), 4);
	} else {
		return adjustTurnAngle(sliceNumber - 1 + endOfMove.toUpperCase().replace("W", "w") + "'", 4);
	}
}

function adjustTurnAngle(move, nbSides) // reduce overturning moves for cubes, pyraminx, skewb and megaminx
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
	} else { // no turn angle, nothing to adjust
		return move;
	}
	adjustedTurnAngle = turnAngle % nbSides; // 0, 1, 2, 3 for cubes, 0, 1, 2 for pyraminx and skewb, 0, 1, 2, 3, 4 for megaminx
	if (adjustedTurnAngle === 0) { // 0, no move should be made
		return "";
	} else if (adjustedTurnAngle === nbSides - 1) { // 3 for cubes, 2 for pyraminx and skewb, 4 for megaminx, replace by '
		if (hasApostrophe) {
			return moveBegin;
		} else {
			return moveBegin + "'";
		}
	} else if (nbSides === 5 && adjustedTurnAngle === nbSides - 2) { // 3 for megaminx, replace by 2'
		if (hasApostrophe) {
			return moveBegin + "2";
		} else {
			return moveBegin + "2'";
		}
	} else { // 1 or 2
		if (hasApostrophe) {
			return moveBegin + adjustedTurnAngle + "'";
		} else {
			return moveBegin + adjustedTurnAngle;
		}
	}
}
