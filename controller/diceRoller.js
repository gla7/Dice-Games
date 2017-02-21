// requires
var polynomial = require('polynomial')










// helper functions
Array.prototype.min = function() { return Math.min.apply(null, this) }

Array.prototype.max = function() { return Math.max.apply(null, this) }

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

function getApproximateOddsForExpression (expression) {
	var probabilities = {}
	var sampleSize = 25000
	for (var i = 0; i < sampleSize; i++) {
		if (probabilities[rollTheDiceByExpression(expression, true).result]) {
			probabilities[rollTheDiceByExpression(expression, true).result] = probabilities[rollTheDiceByExpression(expression, true).result] + 1/sampleSize
		} else {
			probabilities[rollTheDiceByExpression(expression, true).result] = 1/sampleSize
		}
	}
	return probabilities
}

var showError = {
	noSpecialCharacters: "Please enter either non-negative integers or letters. No special characters! See examples above.",
	literalValueCaseCorrection: "For a literal value case, please enter a non-negative integer. See examples above.",
	singleDieRollCorrection: "For a single die roll with N (N should be positive) faces, please follow this example: single roll of a 6-sided die = 'd6'. More examples above.",
	multipleDiceRollCorrection: "For multiple dice, the expression should always begin with a positive integer followed by a 'd' followed by another positive integer. For example, the expression for 3 6-sided dice would be '3d6'. More examples above.",
	dropCorrection: "Cannot drop as many or more results than there are available! See explanations above.",
	keepCorrection: "Cannot keep zero results or more results than there are available! See explanations above.",
	explosionCorrection: "Cannot have an explosion threshold at or below 1. This would result in an infinite operation! You also cannot have x above the number of faces. See explanations above.",
	dKXCorrection: "To play drop, keep, or explode, please use 'd', 'k' or 'x' respectively. See examples above.",
	tooMuchInput: "Something is wrong with your input (e.g. too much of it: '4d5d6d1'). See examples above.",
	tooLargeANumber: "You have entered too large a number that may crash our server!",
}










// main API function
function rollTheDiceByExpression (expression, isEstimatingProbabilities, isTest) {
	var diceRollDetails = {
		expressionEvaluated: expression,
		error: null,
		result: null,
		stepByStepEvaluation: null,
		odds: null,
	}
	var expressionDecomposed = decomposeExpression(expression)
	if (!expressionDecomposed || expression.length !== expressionDecomposed.join("").length) {
		diceRollDetails.error = showError.noSpecialCharacters
		return diceRollDetails
	}
	if (expressionDecomposed.length === 1) {
		if (!isNaN(Number(expressionDecomposed[0]))) {
			diceRollDetails.result = Number(expressionDecomposed[0])
			diceRollDetails.stepByStepEvaluation = [expression + ": " + diceRollDetails.result]
			diceRollDetails.odds = isTest ? null : getExactOddsForExpression(expression, "literal")
			return diceRollDetails
		}
		diceRollDetails.error = showError.literalValueCaseCorrection
		return diceRollDetails
	} else if (expressionDecomposed.length === 2) {
		if (Number(expressionDecomposed[1]) === 0 || expressionDecomposed[0] !== 'd') {
			diceRollDetails.error = showError.singleDieRollCorrection
			return diceRollDetails
		} else if (Number(expressionDecomposed[1]) > 100000) {
			diceRollDetails.error = showError.tooLargeANumber
			return diceRollDetails
		}
		diceRollDetails.result = getRollOfAnXSidedDie(Number(expressionDecomposed[1]))
		diceRollDetails.stepByStepEvaluation = [expression + ": " + diceRollDetails.result]
		diceRollDetails.odds = isTest ? null : getExactOddsForExpression(expression, "single die roll")
		return diceRollDetails
  } else {
		var isInvalidExpression = false
		var numberOfDice = Number(expressionDecomposed[0])
		var facesInDice = Number(expressionDecomposed[2])
		var characterPreceedingFacesInDice = expressionDecomposed[1]
		expressionDecomposed.map(function (expressionComponent, index) {
			if ((index % 2 === 0 && isNaN(Number(expressionComponent))) || (index % 2 !== 0 && !isNaN(Number(expressionComponent)))) {
				isInvalidExpression = true
			}
		})
		if (isInvalidExpression || numberOfDice === 0 || facesInDice === 0 || characterPreceedingFacesInDice !== 'd') {
			diceRollDetails.error = showError.multipleDiceRollCorrection
			return diceRollDetails
		} else if (Number(expressionDecomposed[0]) > 100000 || Number(expressionDecomposed[2]) > 100000) {
			diceRollDetails.error = showError.tooLargeANumber
			return diceRollDetails
		}	
		var rolls = []
		for (var i = 0; i < numberOfDice; i++) {
			rolls.push(getRollOfAnXSidedDie(facesInDice))
		}
    if (expressionDecomposed.length === 3) {
    	diceRollDetails.result = getSumOfRolls(rolls)
    	diceRollDetails.stepByStepEvaluation = getStepByStepEvaluationOfNonExplosionExpression(expression, rolls, "simple")
    	diceRollDetails.odds = isTest ? null : getExactOddsForExpression(expression, "multiple dice roll")
    	return diceRollDetails
    } else if (expressionDecomposed.length === 5) {
    	var gamePlayed = expressionDecomposed[3]
			if (gamePlayed === 'd') {
				var resultsDropped = Number(expressionDecomposed[4])
				if (resultsDropped >= numberOfDice) {
					diceRollDetails.error = showError.dropCorrection
					return diceRollDetails
				}
				var indecesOflowestRolls = []
				var originalRolls = cloneArray(rolls)
				var rollsCopyForOrdering = cloneArray(rolls)
				for (var j = 0; j < resultsDropped; j++) {
					indecesOflowestRolls.push(rollsCopyForOrdering.indexOf(rollsCopyForOrdering.min()))
					rollsCopyForOrdering[rollsCopyForOrdering.indexOf(rollsCopyForOrdering.min())] = 999999999999999
					rolls.splice(rolls.indexOf(rolls.min()),1)
        }
        diceRollDetails.stepByStepEvaluation = getStepByStepEvaluationOfNonExplosionExpression(expression, originalRolls, "drop", indecesOflowestRolls)
        diceRollDetails.result = getSumOfRolls(rolls)
        diceRollDetails.odds = (!isEstimatingProbabilities && numberOfDice <= 15) ? getApproximateOddsForExpression(expression) : null
        return diceRollDetails
			} else if (gamePlayed === 'k') {
				var resultsKept = Number(expressionDecomposed[4])
				if (resultsKept === 0 || resultsKept > numberOfDice) {
					diceRollDetails.error = showError.keepCorrection
					return diceRollDetails
				}
				var highestRolls = []
				var indecesOfHighestRolls = []
				var originalRolls = cloneArray(rolls)
				var rollsCopyForOrdering = cloneArray(rolls)
				for (var j = 0; j < resultsKept; j++) {
					indecesOfHighestRolls.push(rollsCopyForOrdering.indexOf(rollsCopyForOrdering.max()))
					rollsCopyForOrdering[rollsCopyForOrdering.indexOf(rollsCopyForOrdering.max())] = -999999999999999
					highestRolls.push(rolls.splice(rolls.indexOf(rolls.max()),1)[0])
				}
				diceRollDetails.stepByStepEvaluation = getStepByStepEvaluationOfNonExplosionExpression(expression, originalRolls, "keep", indecesOfHighestRolls)
				diceRollDetails.result = getSumOfRolls(highestRolls)
				diceRollDetails.odds = (!isEstimatingProbabilities && numberOfDice <= 15) ? getApproximateOddsForExpression(expression) : null
				return diceRollDetails
			} else if (gamePlayed === 'x') {
				var explosionThreshold = Number(expressionDecomposed[4])
				if (explosionThreshold <= 1 || explosionThreshold > facesInDice) {
					diceRollDetails.error = showError.explosionCorrection
					return diceRollDetails
				}
				var explosiveRolls = getExplosiveRollDetails(rolls, explosionThreshold, expressionDecomposed, facesInDice)
				diceRollDetails.stepByStepEvaluation = explosiveRolls.stepByStepEvaluation
				diceRollDetails.result = explosiveRolls.result
				diceRollDetails.odds = (!isEstimatingProbabilities && numberOfDice <= 5 && (explosionThreshold/facesInDice) >= 0.5) ? getApproximateOddsForExpression(expression) : null
				return diceRollDetails
			} else {
				diceRollDetails.error = showError.dKXCorrection
				return diceRollDetails
			}
    } else {
			diceRollDetails.error = showError.tooMuchInput
			return diceRollDetails
    }
  }
}









// exports
module.exports = {
	rollTheDiceByExpression : rollTheDiceByExpression,
}
