"use strict";

function arraysAreEquals(firstArray, secondArray) // return true only if arrays are equal
{
	for (let i in firstArray) {
		if (firstArray[i] !== secondArray[i]) {
			return false;
		}
	}
	return true;
}
