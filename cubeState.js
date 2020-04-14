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
		let previousPermutation = this.information[type].map(x => x);
		for (let elementIndex in permutation) {
			this.information[type][permutation[elementIndex]] = previousPermutation[elementIndex];
		}
	}
	applyOrientation(nbSides, orientation, permutation, type) {
		let previousOrientation = this.information[type].map(x => x);
		for (let elementIndex in this.information[type]) {
			this.information[type][permutation[elementIndex]] = (previousOrientation[elementIndex] + orientation[elementIndex]) % nbSides;
		}
	}
	isSolved() {
		return false;
	}
	hashPosition() {
		return 0;
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
		let permutationToApply, cleanMove = makeCleanMove(move);
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
		} else if (cleanMove === "x0" || cleanMove === "y0" || cleanMove === "z0") { // no move to apply
			return;
		} else {
			super.applyMove(move);
			return;
		}
		this.applyPermutation(permutationToApply, "cube orientation");
	}
	isSolved() {
		return true; // 1x1x1 is always solved
	}
}

/* 2x2x2 :
["corner permutation"]
[ 0 ,  1 ,  2 ,  3 ,  4 ,  5 ,  6 ,  7 ]
[UBL, DFL, DFR, UBR, DBR, UFR, UFL, DBL]
//[UBL, UBR, UFR, UFL, DFL, DFR, DBR, DBL]

["corner orientation"] (relative to U-D axis)
[         0        ,         1         ,             2            ]
[Correctly oriented, oriented clockwise, oriented counterclockwise]

2x2 particularity : with this special permutation, the sum of each face is 14.
And for the cube to be solved, there must be a direction in which the sum of each column must be 7, otherwise the cube is not solved.
It accelerates a lot the isSolved method
*/
class Cube2x2x2State extends CubeState {
	constructor() {
		super();
		this.information["corner permutation"] = [0, 1, 2, 3, 4, 5, 6, 7];
		this.information["corner orientation"] = [0, 0, 0, 0, 0, 0, 0, 0];
	}
	clone() {
		return (new Cube2x2x2State()).cloneFrom(this);
	}
	applyMove(move) {
		let permutationToApply, orientationToApply, cleanMove;
		cleanMove = makeCleanMove(move);
		if (cleanMove === "x1") {
			permutationToApply = [7, 6, 5, 4, 2, 3, 0, 1];
			orientationToApply = [1, 1, 2, 2, 1, 1, 2, 2];
		} else if (cleanMove === "x2") {
			permutationToApply = [1, 0, 3, 2, 5, 4, 7, 6];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "x3") {
			permutationToApply = [6, 7, 4, 5, 3, 2, 1, 0];
			orientationToApply = [1, 1, 2, 2, 1, 1, 2, 2];
		} else if (cleanMove === "y1") {
			permutationToApply = [3, 7, 1, 5, 2, 6, 0, 4];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "y2") {
			permutationToApply = [5, 4, 7, 6, 1, 0, 3, 2];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "y3") {
			permutationToApply = [6, 2, 4, 0, 7, 3, 5, 1];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "z1") {
			permutationToApply = [3, 6, 1, 4, 7, 2, 5, 0];
			orientationToApply = [2, 2, 1, 1, 2, 2, 1, 1];
		} else if (cleanMove === "z2") {
			permutationToApply = [4, 5, 6, 7, 0, 1, 2, 3];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "z3") {
			permutationToApply = [7, 2, 5, 0, 3, 6, 1, 4];
			orientationToApply = [2, 2, 1, 1, 2, 2, 1, 1];
		} else if (cleanMove === "U1") {
			permutationToApply = [3, 1, 2, 5, 4, 6, 0, 7];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "U2") {
			permutationToApply = [5, 1, 2, 6, 4, 0, 3, 7];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "U3") {
			permutationToApply = [6, 1, 2, 0, 4, 3, 5, 7];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "F1") {
			permutationToApply = [0, 6, 1, 3, 4, 2, 5, 7];
			orientationToApply = [0, 2, 1, 0, 0, 2, 1, 0];
		} else if (cleanMove === "F2") {
			permutationToApply = [0, 5, 6, 3, 4, 1, 2, 7];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "F3") {
			permutationToApply = [0, 2, 5, 3, 4, 6, 1, 7];
			orientationToApply = [0, 2, 1, 0, 0, 2, 1, 0];
		} else if (cleanMove === "R1") {
			permutationToApply = [0, 1, 5, 4, 2, 3, 6, 7];
			orientationToApply = [0, 0, 2, 2, 1, 1, 0, 0];
		} else if (cleanMove === "R2") {
			permutationToApply = [0, 1, 3, 2, 5, 4, 6, 7];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "R3") {
			permutationToApply = [0, 1, 4, 5, 3, 2, 6, 7];
			orientationToApply = [0, 0, 2, 2, 1, 1, 0, 0];
		} else if (cleanMove === "D1") {
			permutationToApply = [0, 2, 4, 3, 7, 5, 6, 1];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "D2") {
			permutationToApply = [0, 4, 7, 3, 1, 5, 6, 2];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "D3") {
			permutationToApply = [0, 7, 1, 3, 2, 5, 6, 4];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "B1") {
			permutationToApply = [7, 1, 2, 0, 3, 5, 6, 4];
			orientationToApply = [2, 0, 0, 1, 2, 0, 0, 1];
		} else if (cleanMove === "B2") {
			permutationToApply = [4, 1, 2, 7, 0, 5, 6, 3];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "B3") {
			permutationToApply = [3, 1, 2, 4, 7, 5, 6, 0];
			orientationToApply = [2, 0, 0, 1, 2, 0, 0, 1];
		} else if (cleanMove === "L1") {
			permutationToApply = [6, 7, 2, 3, 4, 5, 1, 0];
			orientationToApply = [1, 1, 0, 0, 0, 0, 2, 2];
		} else if (cleanMove === "L2") {
			permutationToApply = [1, 0, 2, 3, 4, 5, 7, 6];
			orientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
		} else if (cleanMove === "L3") {
			permutationToApply = [7, 6, 2, 3, 4, 5, 0, 1];
			orientationToApply = [1, 1, 0, 0, 0, 0, 2, 2];
		} else if (cleanMove === "x0" || cleanMove === "y0" || cleanMove === "z0"
		|| cleanMove === "U0" || cleanMove === "F0" || cleanMove === "R0" || cleanMove === "D0" || cleanMove === "L0" || cleanMove === "B0") {
			return; // no move to apply
		} else {
			super.applyMove(move);
			return;
		}
		this.applyPermutation(permutationToApply, "corner permutation");
		this.applyOrientation(3, orientationToApply, permutationToApply, "corner orientation");
	}
	isSolved() {
		let cornerPermutation = this.information["corner permutation"], cornerOrientation = this.information["corner orientation"], faceToCheck;
		if (cornerPermutation[0] + cornerPermutation[3] === 7) { // UBL+UBR : check R/L axis
			if (cornerPermutation[6] + cornerPermutation[5] !== 7 || // UFL+UFR
				cornerPermutation[1] + cornerPermutation[2] !== 7 || // DFL+DFR
				cornerPermutation[7] + cornerPermutation[4] !== 7) { // DBL+DBR
				return false;
			}
			faceToCheck = [cornerPermutation[0], cornerPermutation[6], cornerPermutation[1], cornerPermutation[7]]; // L face
			if (!checkFacePermutation(faceToCheck, associationTableFor2x2)) {
				return false;
			}
			return arraysAreEquals(cornerOrientation, [1, 1, 2, 2, 1, 1, 2, 2]);  // check orientation (usual U/D must be facing R/L)
		} else if (cornerPermutation[0] + cornerPermutation[6] === 7) { // UBL+UFL : check F/B axis
			if (cornerPermutation[3] + cornerPermutation[5] !== 7 || // UBR+UFR
				cornerPermutation[4] + cornerPermutation[2] !== 7 || // DBR+DFR
				cornerPermutation[7] + cornerPermutation[1] !== 7) { // DBL+DFL
				return false
			}
			faceToCheck = [cornerPermutation[6], cornerPermutation[5], cornerPermutation[2], cornerPermutation[1]]; // F face
			if (!checkFacePermutation(faceToCheck, associationTableFor2x2)) {
				return false;
			}
			return arraysAreEquals(cornerOrientation, [2, 2, 1, 1, 2, 2, 1, 1]);  // check orientation (usual U/D must be facing F/B)
		} else if (cornerPermutation[0] + cornerPermutation[7] === 7) { // UBL+DBL : check U/D axis
			if (cornerPermutation[3] + cornerPermutation[4] !== 7 || // UBR+DBR
				cornerPermutation[5] + cornerPermutation[2] !== 7 || // UFR+DFR
				cornerPermutation[6] + cornerPermutation[1] !== 7) { // UFL-DFL
				return false;
			}
			faceToCheck = [cornerPermutation[0], cornerPermutation[3], cornerPermutation[5], cornerPermutation[6]]; // U face
			if (!checkFacePermutation(faceToCheck, associationTableFor2x2)) {
				return false;
			}
			return arraysAreEquals(cornerOrientation, [0, 0, 0, 0, 0, 0, 0, 0]);  // check orientation (usual U/D must be facing F/B)
		} else {
			return false;
		}
	}
	hashPosition() {
		let cornerPermutation = this.information["corner permutation"], cornerOrientation = this.information["corner orientation"],
			shiftedReverseFactorials = [5040, 720, 120, 24, 6, 2, 1], powersOfThree = [2187, 729, 243, 81, 9, 3, 1],
			hashPermutation = 0, hashOrientation = 0, index, index2, smallerAfterInPermutation;
		for (index = 0; index < 7; index++) { // hashPermutation will be between 0 and 40319 (lexicographical order)
			smallerAfterInPermutation = 0;
			for (index2 = index + 1; index2 < 8; index2++) {
				if (cornerPermutation[index2] < cornerPermutation[index]) {
					smallerAfterInPermutation++;
				}
			}
			hashPermutation += smallerAfterInPermutation*shiftedReverseFactorials[index];
		}
		for (index = 0; index < 7; index++) { // hashOrientation will be between 0 and 6560
			hashOrientation += cornerOrientation[index]*powersOfThree[index];
		}
		return (6561 * hashPermutation + hashOrientation);
	}
}