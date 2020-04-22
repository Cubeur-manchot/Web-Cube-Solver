"use strict";

function solveCube() // main solve function which calls the chosen algorithm
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

// SOLVING ALGORITHMS

function solveMoveOptimalBreadthFirst(cubeState) // basic breadth first algorithm
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

function solveMoveOptimalBreadthFirstImproved(cubeState) // same algorithm as basic breadth first, but when it meets a near-to-solved position in the hash map it uses that end solution
{
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

// OTHER NECESSARY FUNCTIONS

function generateHashMapNearestStates(maxDepth) // generate hash map of nearest positions until a given depth, useful for a finish acceleration
{
	let cubeStatePool = [], nextCubeStatePool = [], hashMapResult = [], cubeOrientation,
		cubeOrientations = [[], ["y"], ["y'"], ["y2"], ["x"], ["x", "y"], ["x", "y'"], ["x", "y2"], ["x'"], ["x'", "y"], ["x'", "y'"], ["x'", "y2"],
			["x2"], ["x2", "y"], ["x2", "y'"], ["z2"], ["z"], ["z", "y"], ["z", "y'"], ["z", "y2"], ["z'"], ["z'", "y"], ["z'", "y'"], ["z'", "y2"]],
		generatingMoves = window.generatingMoves[window.eventName].moves, generatingSenses = window.generatingMoves[window.eventName].senses,
		cubeStateWithMoveSequence, cubeState, moveSequence, generatingMove, generatingSense, newMove, newCubeState, newMoveSequence, hashValue;
	for (cubeOrientation of cubeOrientations) {
		cubeStatePool = [{state: createCube(), moveSequence: [cubeOrientation]}];
		cubeStatePool[0].state.applySequence(cubeOrientation);
		hashMapResult[cubeStatePool[0].state.hashPosition()] = {cost: 0, solution: cubeOrientation};
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
							newMoveSequence.unshift(invertMove(newMove));
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

function invertMove(move) // simply invert a move on a puzzle
{
	if (move[move.length - 1] === "'") { // if moves has an apostrophe, simply remove if
		return move.substring(0, move.length - 1);
	} else if (move[move.length - 1] === "2") { // if moves finishes with a 2, keep it identical
		return move;
	} else { // add apostrophe at the end
		return move + "'";
	}
}
