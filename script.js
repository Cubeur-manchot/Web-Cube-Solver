"use strict";

function init() // initialize admitted moves, generating moves and god's number for each puzzle, and general stuff
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
	window.generatingMoves["skewb"] = {moves: ["b", "L", "f", "l"], senses: ["","'"]};

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

function createCube() // create a CubeState object of the selected puzzle
{
	let cubeState;
	if (window.eventName === "1x1x1") {
		cubeState = new Cube1x1x1State();
	} else if (window.eventName === "2x2x2") {
		cubeState = new Cube2x2x2State();
	} else if (window.eventName === "skewb") {
		cubeState = new SkewbState();
	} else {
		cubeState = new CubeState();
	}
	return cubeState;
}
