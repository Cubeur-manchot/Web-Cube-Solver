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
	makeCleanMove(move, nbSides) { // returns moves of the form R1, R2, R3, U1, U2, U3, F1, ...
		let parsedRotationAngle, moveRotationAngle;
		if (move.includes("'")) {
			parsedRotationAngle = move.substring(1, move.length - 1);
			if (parsedRotationAngle === "") {
				moveRotationAngle = nbSides - 1;
			} else {
				moveRotationAngle = (nbSides - (parsedRotationAngle % nbSides)) % nbSides;
			}
			return move[0] + moveRotationAngle;
		} else {
			parsedRotationAngle = move.substring(1);
			if (parsedRotationAngle === "") {
				moveRotationAngle = 1;
			} else {
				moveRotationAngle = parsedRotationAngle % nbSides;
			}
			return move[0] + moveRotationAngle;
		}
	}
	checkFacePermutation(faceToCheck, associationTable) { // check the permutation of a face according to an association table
		return associationTable[faceToCheck[0]] === faceToCheck[1]
			&& associationTable[faceToCheck[1]] === faceToCheck[2]
			&& associationTable[faceToCheck[2]] === faceToCheck[3];
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
		let permutationToApply, cleanMove = this.makeCleanMove(move, 4);
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
2x2 particularity : with this special permutation, the sum of each face is 14.
And for the cube to be solved, there must be a direction in which the sum of each column must be 7, otherwise the cube is not solved.
It accelerates a lot the isSolved method.

["corner orientation"] (relative to U-D axis)
[ 0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ]
[UBL, DFL, DFR, UBR, DBR, UFR, UFL, DBL]
0 = correctly oriented, 1 = oriented clockwise from correctly oriented, 2 = oriented counterclockwise from correctly oriented
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
		let permutationToApply, orientationToApply, cleanMove = this.makeCleanMove(move, 4);
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
			if (!this.checkFacePermutation(faceToCheck, associationTableFor2x2)) {
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
			if (!this.checkFacePermutation(faceToCheck, associationTableFor2x2)) {
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
			if (!this.checkFacePermutation(faceToCheck, associationTableFor2x2)) {
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

/* Skewb :
["corner permutation"]
[ 0 ,  1 ,  2 ,  3 , NaN, NaN, NaN, NaN]
[UBL, UBR, UFR, ULF, DFL, DFR, DBR, DBL]
Skewb particularity : corners are on 2 distinct orbits. Due to mechanical structure, when 2 corners of the same orbit are placed, the 2 other ones are constraint.
Thus we only need to track 4 corners (2 on each orbit) out of the 8. Moreover, while storing them as NaN accelerates the isSolved method.

["corner orientation"]
[ 0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ]
[UBL, UBR, UFR, ULF, DFL, DFR, DBR, DBL]
0 = correctly oriented, 1 = oriented clockwise from correctly oriented, 2 = oriented counterclockwise from correctly oriented.

["center permutation"]
[0, 1, 2, 3, 4, 5]
[U, F, R, D, B, L]
*/
class SkewbState extends CubeState {
	constructor() {
		super();
		this.information["corner permutation"] = [0, 1, 2, 3, NaN, NaN, NaN, NaN];
		this.information["corner orientation"] = [0, 0, 0, 0, 0, 0, 0, 0];
		this.information["center permutation"] = [0, 1, 2, 3, 4, 5];
	}
	clone() {
		return (new SkewbState()).cloneFrom(this);
	}
	applyMove(move) { // moves are only with algorithmic notation (R, F, L, B, r, f, l, b)
		let cornerPermutationToApply, cornerOrientationToApply, centerPermutationToApply, cleanMove;
		if (move.includes("x") || move.includes("y") || move.includes("z")) {
			cleanMove = this.makeCleanMove(move, 4); // rotations are face-based
		} else {
			cleanMove = this.makeCleanMove(move, 3); // other moves are corner-based
		}
		if (cleanMove[1] === "0") { // x0, y0, z0, R0, F0, L0, B0, r0, f0, l0, b0
			return; // no move to apply
		} else if (cleanMove[0] === "L") { // L (U in WCA notation)
			if (cleanMove[1] === "1") { // L1
				cornerPermutationToApply = [0, 3, 2, 7, 4, 5, 6, 1];
				cornerOrientationToApply = [1, 2, 0, 2, 0, 0, 0, 2];
				centerPermutationToApply = [5, 1, 2, 3, 0, 4];
			} else { // L2
				cornerPermutationToApply = [0, 7, 2, 1, 4, 5, 6, 3];
				cornerOrientationToApply = [2, 1, 0, 1, 0, 0, 0, 1];
				centerPermutationToApply = [4, 1, 2, 3, 5, 0];
			}
		} else if (cleanMove[0] === "b") { // b (R in WCA notation)
			if (cleanMove[1] === "1") { // b1
				cornerPermutationToApply = [0, 7, 2, 3, 4, 1, 6, 5];
				cornerOrientationToApply = [0, 2, 0, 0, 0, 2, 1, 2];
				centerPermutationToApply = [0, 1, 4, 2, 3, 5];
			} else { // b2
				cornerPermutationToApply = [0, 5, 2, 3, 4, 7, 6, 1];
				cornerOrientationToApply = [0, 1, 0, 0, 0, 1, 2, 1];
				centerPermutationToApply = [0, 1, 3, 4, 2, 5];
			}
		} else if (cleanMove[0] === "f") { // f (L in WCA notation)
			if (cleanMove[1] === "1") { // f1
				cornerPermutationToApply = [0, 1, 2, 5, 4, 7, 6, 3];
				cornerOrientationToApply = [0, 0, 0, 2, 1, 2, 0, 2];
				centerPermutationToApply = [0, 3, 2, 5, 4, 1];
			} else { // f2
				cornerPermutationToApply = [0, 1, 2, 7, 4, 3, 6, 5];
				cornerOrientationToApply = [0, 0, 0, 1, 2, 1, 0, 1];
				centerPermutationToApply = [0, 5, 2, 1, 4, 3];
			}
		} else if (cleanMove[0] === "l") { // l (B in WCA notation)
			if (cleanMove[1] === "1") { // l1
				cornerPermutationToApply = [4, 1, 2, 3, 6, 5, 0, 7];
				cornerOrientationToApply = [2, 0, 0, 0, 2, 0, 2, 1];
				centerPermutationToApply = [0, 1, 2, 4, 5, 3];
			} else { // l2
				cornerPermutationToApply = [6, 1, 2, 3, 0, 5, 4, 7];
				cornerOrientationToApply = [1, 0, 0, 0, 1, 0, 1, 2];
				centerPermutationToApply = [0, 1, 2, 5, 3, 4];
			}
		} else if (cleanMove[0] === "R") { // R
			if (cleanMove[1] === "1") { // R1
				cornerPermutationToApply = [0, 5, 2, 1, 4, 3, 6, 7];
				cornerOrientationToApply = [0, 2, 1, 2, 0, 2, 0, 0];
				centerPermutationToApply = [2, 0, 1, 3, 4, 5];
			} else { // R2
				cornerPermutationToApply = [0, 3, 2, 5, 4, 1, 6, 7];
				cornerOrientationToApply = [0, 1, 2, 1, 0, 1, 0, 0];
				centerPermutationToApply = [1, 2, 0, 3, 4, 5];
			}
		} else if (cleanMove[0] === "F") { // F
			if (cleanMove[1] === "1") { // F1
				cornerPermutationToApply = [2, 1, 4, 3, 0, 5, 6, 7];
				cornerOrientationToApply = [2, 0, 2, 1, 2, 0, 0, 0];
				centerPermutationToApply = [1, 5, 2, 3, 4, 0];
			} else { // F2
				cornerPermutationToApply = [4, 1, 0, 3, 2, 5, 6, 7];
				cornerOrientationToApply = [1, 0, 1, 2, 1, 0, 0, 0];
				centerPermutationToApply = [5, 0, 2, 3, 4, 1];
			}
		} else if (cleanMove[0] === "B") { // B
			if (cleanMove[1] === "1") { // B1
				cornerPermutationToApply = [6, 1, 0, 3, 4, 5, 2, 7];
				cornerOrientationToApply = [2, 1, 2, 0, 0, 0, 2, 0];
				centerPermutationToApply = [4, 1, 0, 3, 2, 5];
			} else { // B2
				cornerPermutationToApply = [2, 1, 6, 3, 4, 5, 0, 7];
				cornerOrientationToApply = [1, 2, 1, 0, 0, 0, 1, 0];
				centerPermutationToApply = [2, 1, 4, 3, 0, 5];
			}
		} else if (cleanMove[0] === "r") { // r
			if (cleanMove[1] === "1") { // r1
				cornerPermutationToApply = [0, 1, 6, 3, 2, 5, 4, 7];
				cornerOrientationToApply = [0, 0, 2, 0, 2, 1, 2, 0];
				centerPermutationToApply = [0, 2, 3, 1, 4, 5];
			} else { // r2
				cornerPermutationToApply = [0, 1, 4, 3, 6, 5, 2, 7];
				cornerOrientationToApply = [0, 0, 1, 0, 1, 2, 1, 0];
				centerPermutationToApply = [0, 3, 1, 2, 4, 5];
			}
		} else if (cleanMove[0] === "x") { // x
			if (cleanMove[1] === "1") { // x1
				cornerPermutationToApply = [7, 6, 1, 0, 3, 2, 5, 4];
				cornerOrientationToApply = [1, 2, 1, 2, 1, 2, 1, 2];
				centerPermutationToApply = [4, 0, 2, 1, 3, 5];
			} else if (cleanMove[1] === "2") { // x2
				cornerPermutationToApply = [4, 5, 6, 7, 0, 1, 2, 3];
				cornerOrientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
				centerPermutationToApply = [3, 4, 2, 0, 1, 5];
			} else { // x3
				cornerPermutationToApply = [3, 2, 5, 4, 7, 6, 1, 0];
				cornerOrientationToApply = [1, 2, 1, 2, 1, 2, 1, 2];
				centerPermutationToApply = [1, 3, 2, 4, 0, 5];
			}
		} else if (cleanMove[0] === "y") { // y
			if (cleanMove[1] === "1") { // y1
				cornerPermutationToApply = [1, 2, 3, 0, 7, 4, 5, 6];
				cornerOrientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
				centerPermutationToApply = [0, 5, 1, 3, 2, 4];
			} else if (cleanMove[1] === "2") { // y2
				cornerPermutationToApply = [2, 3, 0, 1, 6, 7, 4, 5];
				cornerOrientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
				centerPermutationToApply = [0, 4, 5, 3, 1, 2];
			} else { // y3
				cornerPermutationToApply = [3, 0, 1, 2, 5, 6, 7, 4];
				cornerOrientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
				centerPermutationToApply = [0, 2, 4, 3, 5, 1];
			}
		} else if (cleanMove[0] === "z") { // z
			if (cleanMove[1] === "1") { // z1
				cornerPermutationToApply = [1, 6, 5, 2, 3, 4, 7, 0];
				cornerOrientationToApply = [2, 1, 2, 1, 2, 1, 2, 1];
				centerPermutationToApply = [2, 1, 3, 5, 4, 0];
			} else if (cleanMove[1] === "2") { // z2
				cornerPermutationToApply = [6, 7, 4, 5, 2, 3, 0, 1];
				cornerOrientationToApply = [0, 0, 0, 0, 0, 0, 0, 0];
				centerPermutationToApply = [3, 1, 5, 0, 4, 2];
			} else { // z3
				cornerPermutationToApply = [7, 0, 3, 4, 5, 2, 1, 6];
				cornerOrientationToApply = [2, 1, 2, 1, 2, 1, 2, 1];
				centerPermutationToApply = [5, 1, 0, 2, 4, 3];
			}
		} else {
			super.applyMove(move);
			return;
		}
		this.applyPermutation(cornerPermutationToApply, "corner permutation");
		this.applyPermutation(centerPermutationToApply, "center permutation");
		this.applyOrientation(3, cornerOrientationToApply, cornerPermutationToApply, "corner orientation");
	}
	isSolved() {
		let cornerPermutation = this.information["corner permutation"], cornerOrientation = this.information["corner orientation"],
			centerPermutation = this.information["center permutation"];
		if (isNaN(cornerPermutation[0] + cornerPermutation[7])) { // UBL + DBL : check U/D axis
			if (!isNaN(cornerPermutation[1] + cornerPermutation[6]) || // UBR + DBR
				!isNaN(cornerPermutation[2] + cornerPermutation[5]) || // UFR + DFR
				!isNaN(cornerPermutation[3] + cornerPermutation[4])) { // UFL + DFL
				return false;
			}
			if (!arraysAreEquals(cornerOrientation, [0, 0, 0, 0, 0, 0, 0, 0])) { // check corner orientation
				return false;
			}
			if (isNaN(cornerPermutation[0])) { // U face is in D
				if ((cornerPermutation[5] - cornerPermutation[4] + 4) % 4 !== 1) { // only 2 possible corner permutations, check only one corner
					return false;
				}
				if (centerPermutation[3] !== 0 || centerPermutation[0] !== 3) { // U and D centers should be respectively in D and U
					return false;
				}
				if (cornerPermutation[4] === 0) { // UBL is in DFL
					return (centerPermutation[4] === 1 && centerPermutation[1] === 4); // F and B centers should be respectively in B and F
				} else if (cornerPermutation[5] === 0) { // UBL is in DFR
					return (centerPermutation[5] === 1 && centerPermutation[2] === 4); // F and B centers should be respectively in L and R
				} else if (cornerPermutation[6] === 0) { // UBL is in DBR
					return (centerPermutation[1] === 1 && centerPermutation[4] === 4); // F and B centers should be respectively in F and B
				} else { // UBL is in DBL
					return (centerPermutation[2] === 1 && centerPermutation[5] === 4); // F and B centers should be respectively in R and L
				}
			} else { // D face is in U
				if ((cornerPermutation[1] - cornerPermutation[0] + 4) % 4 !== 1) { // only 2 possible corner permutations, check only one corner
					return false;
				}
				if (centerPermutation[0] !== 0 || centerPermutation[3] !== 3) { // U and D centers should be respectively in U and D
					return false;
				}
				if (cornerPermutation[0] === 0) { // UBL is in UBL
					return (centerPermutation[1] === 1 && centerPermutation[4] === 4); // F and B centers should be respectively in F and B
				} else if (cornerPermutation[1] === 0) { // UBL is in UBR
					return (centerPermutation[5] === 1 && centerPermutation[2] === 4); // F and B centers should be respectively in L and R
				} else if (cornerPermutation[2] === 0) { // UBL is in UFR
					return (centerPermutation[4] === 1 && centerPermutation[1] === 4); // F and B centers should be respectively in B and F
				} else { // UBL is in UFL
					return (centerPermutation[2] === 1 && centerPermutation[5] === 4); // F and B centers should be respectively in R and L
				}
			}
		} else if (isNaN(cornerPermutation[0] + cornerPermutation[1])) { // UBL + UBR : check R/L axis
			if (!isNaN(cornerPermutation[3] + cornerPermutation[2]) || // UFL + UFR
				!isNaN(cornerPermutation[4] + cornerPermutation[5]) || // DFL + DFR
				!isNaN(cornerPermutation[7] + cornerPermutation[6])) { // DBL + DBR
				return false;
			}
			if (!arraysAreEquals(cornerOrientation, [1, 2, 1, 2, 1, 2, 1, 2])) { // check corner orientation
				return false;
			}
			if (isNaN(cornerPermutation[0])) { // U face is in R
				if ((cornerPermutation[1] - cornerPermutation[2] + 4) % 4 !== 1) { // only 2 possible corner permutations, check only one corner
					return false;
				}
				if (centerPermutation[2] !== 0 || centerPermutation[5] !== 3) { // U and D centers should be respectively in R and L
					return false;
				}
				if (cornerPermutation[2] === 0) { // UBL is in UFR
					return (centerPermutation[3] === 1 && centerPermutation[0] === 4); // F and B centers should be respectively in D and U
				} else if (cornerPermutation[1] === 0) { // UBL is in UBR
					return (centerPermutation[1] === 1 && centerPermutation[4] === 4); // F and B centers should be respectively in F and B
				} else if (cornerPermutation[6] === 0) { // UBL is in DBR
					return (centerPermutation[0] === 1 && centerPermutation[3] === 4); // F and B centers should be respectively in U and D
				} else { // UBL is in DFR
					return (centerPermutation[4] === 1 && centerPermutation[1] === 4); // F and B centers should be respectively in B and F
				}
			} else { // U face is in L
				if ((cornerPermutation[3] - cornerPermutation[0] + 4) % 4 !== 1) { // only 2 possible corner permutations, check only one corner
					return false;
				}
				if (centerPermutation[5] !== 0 || centerPermutation[2] !== 3) { // U and D centers should be respectively in L and R
					return false;
				}
				if (cornerPermutation[0] === 0) { // UBL is in UBL
					return (centerPermutation[3] === 1 && centerPermutation[0] === 4); // F and B centers should be respectively in D and U
				} else if (cornerPermutation[3] === 0) { // UBL is in UFL
					return (centerPermutation[4] === 1 && centerPermutation[1] === 4); // F and B centers should be respectively in B and F
				} else if (cornerPermutation[4] === 0) { // UBL is in DFL
					return (centerPermutation[0] === 1 && centerPermutation[3] === 4); // F and B centers should be respectively in U and D
				} else { // UBL is in DBL
					return (centerPermutation[1] === 1 && centerPermutation[4] === 4); // F and B centers should be respectively in F and B
				}
			}
		} else if (isNaN(cornerPermutation[0] + cornerPermutation[3])) { // UBL + UFL : check F/B axis
			if (!isNaN(cornerPermutation[1] + cornerPermutation[2]) || // UBR + UFR
				!isNaN(cornerPermutation[6] + cornerPermutation[5]) || // DBR + DFR
				!isNaN(cornerPermutation[7] + cornerPermutation[4])) { // DBL + DFL
				return false;
			}
			if (!arraysAreEquals(cornerOrientation, [2, 1, 2, 1, 2, 1, 2, 1])) { // check corner orientation
				return false;
			}
			if (isNaN(cornerPermutation[0])) { // U face is in F
				if ((cornerPermutation[1] - cornerPermutation[2] + 4) % 4 !== 1) { // only 2 possible corner permutations, check only one corner
					return false;
				}
				if (centerPermutation[1] !== 0 || centerPermutation[4] !== 3) { // U and D centers should be respectively in F and B
					return false;
				}
				if (cornerPermutation[3] === 0) { // UBL is in UFL
					return (centerPermutation[3] === 1 && centerPermutation[0] === 4); // F and B centers should be respectively in D and U
				} else if (cornerPermutation[2] === 0) { // UBL is in UFR
					return (centerPermutation[5] === 1 && centerPermutation[2] === 4); // F and B centers should be respectively in L and R
				} else if (cornerPermutation[5] === 0) { // UBL is in DFR
					return (centerPermutation[0] === 1 && centerPermutation[3] === 4); // F and B centers should be respectively in U and D
				} else { // UBL is in DFL
					return (centerPermutation[2] === 1 && centerPermutation[5] === 4); // F and B centers should be respectively in R and L
				}
			} else { // U face is in B
				if ((cornerPermutation[0] - cornerPermutation[1] + 4) % 4 !== 1) { // only 2 possible corner permutations, check only one corner
					return false;
				}
				if (centerPermutation[4] !== 0 || centerPermutation[1] !== 3) { // U and D centers should be respectively in B and F
					return false;
				}
				if (cornerPermutation[1] === 0) { // UBL is in UBR
					return (centerPermutation[3] === 1 && centerPermutation[0] === 4); // F and B centers should be respectively in D and U
				} else if (cornerPermutation[0] === 0) { // UBL is in UBL
					return (centerPermutation[2] === 1 && centerPermutation[5] === 4); // F and B centers should be respectively in R and L
				} else if (cornerPermutation[7] === 0) { // UBL is in DBL
					return (centerPermutation[0] === 1 && centerPermutation[3] === 4); // F and B centers should be respectively in U and D
				} else { // UBL is in DBR
					return (centerPermutation[5] === 1 && centerPermutation[2] === 4); // F and B centers should be respectively in L and R
				}
			}
		} else { // none of the 3 directions (U/D, F/B, R/L) is correct for the property
			return false;
		}
	}
	hashPosition() {
		let cornerPermutation = this.information["corner permutation"], cornerOrientation = this.information["corner orientation"],
			centerPermutation = this.information["center permutation"],
			powersOfThree = [6561, 2187, 729, 243, 81, 9, 3, 1], permutationCoefficientsForCenters = [60, 12, 3, 1],
			hashCornerPermutation = undefined, hashCornerOrientation = 0, hashCenterPermutation = 0, index, index2, smallerAfterInPermutation;
		for (index = 0; index < 8; index++) { // hashCornerOrientation will be between 0 and 19682
			hashCornerOrientation += cornerOrientation[index]*powersOfThree[index];
		}
		for (index = 0; index < 4; index++) { // hashCenterPermutation will be between 0 and 359 (lexicographical order)
			smallerAfterInPermutation = 0;
			for (index2 = index + 1; index2 < 8; index2++) {
				if (centerPermutation[index2] < centerPermutation[index]) {
					smallerAfterInPermutation++;
				}
			}
			hashCenterPermutation += smallerAfterInPermutation*permutationCoefficientsForCenters[index];
		}
		// once the orientation is fixed, the position of only one corner of each orbit is enough to determine the position of all corners
		for (index = 0; index < 8; index++) { // hashCornerPermutation will be between 0 and 31
			if (cornerPermutation[index] === 0) {
				hashCornerPermutation = 4 * index;
				for (index++; index < 8; index += 2) {
					if (cornerPermutation[index] === 1) {
						hashCornerPermutation += index >> 1; // divides by 2 and takes the entire value
						index = 8;
					}
				}
			} else if (cornerPermutation[index] === 1) {
				hashCornerPermutation = index >> 1; // divides by 2 and takes the entire value
				for (index++; index < 8; index += 2) {
					if (cornerPermutation[index] === 0) {
						hashCornerPermutation += 4 * index;
						index = 8;
					}
				}
			}
		}
		return hashCornerPermutation + 32 * (hashCornerOrientation + 19683 * hashCenterPermutation);
	}
}
