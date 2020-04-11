"use strict";

class CubeState {
	constructor() {
		this.information = []; // contains all permutation cycles and orientation arrays
	}
	clone() {
		return (new CubeState()).cloneFrom(this);
	}
	cloneFrom(cubeState) {
		 for (let informationType in cubeState.information) {
		 	this.information[informationType] = cubeState.information[informationType].map(x => x);
		 }
		 return this;
	}
	applySequence(sequence) { // apply a sequence to current state
		for (let move of sequence) {
			this.applyMove(move);
		}
	}
	applyMove(move) {
		console.log("Warning : applying move " + move + " doesn't work on puzzle " + window.eventName);
	}
	applyPermutation(permutation, type) {
		for (let elementIndex in permutation) {
			this.information[type][permutation[elementIndex]] = this.information[type][elementIndex];
		}
	}
	/*applyOrientation(nbSides, orientation, type) {
		for (let index in this.information[type]) {
			this.information[type][index] = this.information[type][index] + orientation[index] % nbSides;
		}
	}*/
	isSolved() {
		return false;
	}
}

/* 1x1x1 :
["cube orientation"]
[0, 1, 2, 3, 4, 5]
[U, F, R, D, B, L]
*/
class Cube1x1x1State extends CubeState {
	constructor() {
		super();
		this.information["cube orientation"] = [0, 1, 2, 3, 4, 5];
	}
	clone() {
		return (new Cube1x1x1State()).cloneFrom(this);
	}
	applyMove(move) {
		let permutationToApply, parsedRotationAngle, moveRotationAngle, cleanMove;
		if (move.includes("x") || move.includes("y") || move.includes("z")) {
			if (move.includes("'")) {
				parsedRotationAngle = move.substring(1);
				moveRotationAngle = parsedRotationAngle % 4;
				cleanMove = move[0] + moveRotationAngle + "'";
			} else {
				parsedRotationAngle = move.substring(1, move.length - 1);
				moveRotationAngle = -(parsedRotationAngle % 4);
				cleanMove = move[0] + moveRotationAngle + "'";
			}
			if (cleanMove === "x1") { // x
				permutationToApply = [4, 0, 2, 1, 3, 5];
			} else if (cleanMove === "x2") { // x2
				permutationToApply = [3, 4, 2, 0, 1, 5];
			} else if (cleanMove === "x3") { // x'
				permutationToApply = [1, 3, 2, 4, 0, 5];
			} else if (cleanMove === "y1") { // y
				permutationToApply = [0, 5, 1, 3, 2, 4];
			} else if (cleanMove === "y2") { // y2
				permutationToApply = [0, 4, 5, 3, 1, 2];
			} else if (cleanMove === "y3") {
				permutationToApply = [0, 2, 4, 3, 5, 1];
			} else if (cleanMove === "z1") {
				permutationToApply = [2, 1, 3, 5, 4, 0];
			} else if (cleanMove === "z2") {
				permutationToApply = [3, 1, 5, 0, 4, 2];
			} else if (cleanMove === "z3") {
				permutationToApply = [5, 1, 0, 2, 4, 3];
			} else if (cleanMove === "x0" || cleanMove === "y0" || cleanMove === "z0") {
				permutationToApply = [0, 1, 2, 3, 4, 5];
			}
			this.applyPermutation(permutationToApply, "cube orientation");
		} else {
			super.applyMove(move);
		}
	}
	isSolved() {
		return true; // 1x1x1 is always solved
	}
}