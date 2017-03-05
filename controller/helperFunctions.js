// requires
// this library makes calculating the odds for multiple dice roll slightly easier by 
// providing polynomial coefficients after polynomial operations
var polynomial = require('polynomial')

// helper functions
function decomposeExpression (expression) { return expression.match(/[a-zA-Z]+|[0-9]+/g) }

function getRollOfAnXSidedDie (x) { return Math.floor((Math.random() * x) + 1) }

function getSumOfRolls (rolls) {
	return rolls.reduce(function (runningTotal, resultOfRoll) {
		return runningTotal + resultOfRoll
	})
}

function cloneArray (array) {
	return array.map(function (item) {
		return item
	})
}
// obtains breakdown of expression for multiple dice roll, drop lowest, and keep highest cases, e.g.
// 3d6 => 1d6: 3, 1d6: 1, 1d6: 5 (as an array of strings)
function getStepByStepEvaluationOfNonExplosionExpression (expression, rolls, useCase, indecesOflowestOrHighestRolls) {
	var expressionDecomposed = decomposeExpression(expression)
	expressionDecomposed.splice(0, 1)
	if (useCase === "simple") {
		return rolls.map(function (roll) {
			return 1 + expressionDecomposed.join("") + ": " + roll
		})
	} else if (useCase === "drop") {
		expressionDecomposed.pop()
		expressionDecomposed.pop()
		return rolls.map(function (roll, rollIndex) {
			return indecesOflowestOrHighestRolls.includes(rollIndex) ? (1 + expressionDecomposed.join("")) + ": " + roll + " => dropped" : (1 + expressionDecomposed.join("")) + ": " + roll + " => kept"
		})
	} else if (useCase === "keep") {
		expressionDecomposed.pop()
		expressionDecomposed.pop()
		return rolls.map(function (roll, rollIndex) {
			return indecesOflowestOrHighestRolls.includes(rollIndex) ? (1 + expressionDecomposed.join("")) + ": " + roll + " => kept" : (1 + expressionDecomposed.join("")) + ": " + roll + " => dropped"
		})
	} 
}
// uses recursiveness to repeat or progress explosive rolls and keep track of the breakdown and running sum
function getExplosiveRollDetails (rolls, explosionThreshold, expressionDecomposed, facesInDice) {
	var result = 0
	var stepByStepEvaluation = []
	function explode (array, index, threshold, expressionDecomposed, facesInDice) {
		if (!array[index]) {
			return {
				result: result,
				stepByStepEvaluation: stepByStepEvaluation,
			}
		}
		if (array[index] >= threshold) {
			result = result + array[index]
			stepByStepEvaluation.push(1 + expressionDecomposed[1] + expressionDecomposed[2] + ": " + array[index])
			array[index] = getRollOfAnXSidedDie(facesInDice)
			return explode(array, index, threshold, expressionDecomposed, facesInDice)
		}
		result = result + array[index]
		stepByStepEvaluation.push(1 + expressionDecomposed[1] + expressionDecomposed[2] + ": " + array[index])
		return explode(array, index + 1, threshold, expressionDecomposed, facesInDice)
	}
	return explode(rolls, 0, explosionThreshold, expressionDecomposed, facesInDice)
}
// calculates the exact odds for literal, single die roll, and multiple dice rolls. To calculate multiple dice rolls, I've used
// the moment generating function of the distribution of the dice. The full reasoning is expressed here:
// http://digitalscholarship.unlv.edu/cgi/viewcontent.cgi?article=1025&context=grrj
function getExactOddsForExpression (expression, useCase) {
	var probabilities = {}
	var expressionDecomposed = decomposeExpression(expression)
	if (useCase === "literal") {
		var literalNumber = Number(expressionDecomposed[0])
		probabilities[literalNumber] = 1
		return probabilities
	} else if (useCase === "single die roll") {
		var facesInDice = Number(expressionDecomposed[1])
		for (var i = 0; i < facesInDice; i++) {
			probabilities[i + 1] = 1/facesInDice
		}
		return probabilities
	} else if (useCase === "multiple dice roll") {
		var numberOfDice = Number(expressionDecomposed[0])
		var facesInDice = Number(expressionDecomposed[2])
		var polynomialString = ""
  	for (var i = 0; i < facesInDice; i++) {
  		polynomialString = polynomialString === "" ? polynomialString + "x^" + (i + 1) : polynomialString + "+x^" + (i + 1)
  	}
  	var polynomialCoefficients = polynomial(polynomialString).pow(numberOfDice).coeff
  	for (coefficient in polynomialCoefficients) {
  		probabilities[coefficient] = polynomialCoefficients[coefficient]/Math.pow(Number(facesInDice), numberOfDice)
  	}
  	return probabilities
	}
}

function getRollsForMultipleDice (expression) {
	var expressionDecomposed = decomposeExpression(expression)
	var numberOfDice = Number(expressionDecomposed[0])
	var facesInDice = Number(expressionDecomposed[2])
	var rolls = []
	for (var i = 0; i < numberOfDice; i++) {
		rolls.push(getRollOfAnXSidedDie(facesInDice))
	}
	return rolls
}

//exports
module.exports = {
	decomposeExpression: decomposeExpression,
	getRollOfAnXSidedDie: getRollOfAnXSidedDie,
	getSumOfRolls: getSumOfRolls,
	cloneArray: cloneArray,
	getStepByStepEvaluationOfNonExplosionExpression: getStepByStepEvaluationOfNonExplosionExpression,
	getExplosiveRollDetails: getExplosiveRollDetails,
	getExactOddsForExpression: getExactOddsForExpression,
	getRollsForMultipleDice: getRollsForMultipleDice,
}
