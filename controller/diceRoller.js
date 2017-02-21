// requires
// this library makes calculating the odds for multiple dice roll slightly easier by 
// providing polynomial coefficients after polynomial operations
var polynomial = require('polynomial') 










// helper functions
Array.prototype.min = function() { return Math.min.apply(null, this) }

Array.prototype.max = function() { return Math.max.apply(null, this) }
// separates batches of letters from batches of numbers- important to break down input expressions
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
// obtains breakdown of expression for multiple dice roll, drop lowest, and keep highest cases e.g. 
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
// calculates the approximate odds for the more complex cases (drop lowest, keep highest, exploding rolls) provided 
// the input numbers in the expression are not large, and the way I achieve this is by simulating a reasonably large 
// sample of results for the same expression while keeping running time tolerable. I want to give exact probabilities
// for these expressions, and as soon as I find a way calculate them analytically I will.
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
// holds the exact error string for each error case
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
	// this is the object that will be returned to the user
	var diceRollDetails = {
		expressionEvaluated: expression,
		error: null,
		result: null,
		stepByStepEvaluation: null,
		odds: null,
	}
	// here we break down the expression
	var expressionDecomposed = decomposeExpression(expression)
	// special character error handling
	if (!expressionDecomposed || expression.length !== expressionDecomposed.join("").length) {
		diceRollDetails.error = showError.noSpecialCharacters
		return diceRollDetails
	}
	// literal case handling
	if (expressionDecomposed.length === 1) {
		if (!isNaN(Number(expressionDecomposed[0]))) {
			diceRollDetails.result = Number(expressionDecomposed[0])
			diceRollDetails.stepByStepEvaluation = [expression + ": " + diceRollDetails.result]
			diceRollDetails.odds = isTest ? null : getExactOddsForExpression(expression, "literal")
			return diceRollDetails
		}
		// literal case error handling
		diceRollDetails.error = showError.literalValueCaseCorrection
		return diceRollDetails
	} 
	// single die roll case handling
	else if (expressionDecomposed.length === 2) {
		// single die roll error handling
		if (Number(expressionDecomposed[1]) === 0 || expressionDecomposed[0] !== 'd') {
			diceRollDetails.error = showError.singleDieRollCorrection
			return diceRollDetails
		}
		// large number error handling 
		else if (Number(expressionDecomposed[1]) > 100000) {
			diceRollDetails.error = showError.tooLargeANumber
			return diceRollDetails
		}
		diceRollDetails.result = getRollOfAnXSidedDie(Number(expressionDecomposed[1]))
		diceRollDetails.stepByStepEvaluation = [expression + ": " + diceRollDetails.result]
		diceRollDetails.odds = isTest ? null : getExactOddsForExpression(expression, "single die roll")
		return diceRollDetails
  }
  // multiple dice rolls, drop lowest rolls, keep highest rolls, and explosive rolls handling 
  else {
		var isInvalidExpression = false
		var numberOfDice = Number(expressionDecomposed[0])
		var facesInDice = Number(expressionDecomposed[2])
		var characterPreceedingFacesInDice = expressionDecomposed[1]
		// checking validity of expression
		expressionDecomposed.map(function (expressionComponent, index) {
			if ((index % 2 === 0 && isNaN(Number(expressionComponent))) || (index % 2 !== 0 && !isNaN(Number(expressionComponent)))) {
				isInvalidExpression = true
			}
		})
		// multiple roll general error handling
		if (isInvalidExpression || numberOfDice === 0 || facesInDice === 0 || characterPreceedingFacesInDice !== 'd') {
			diceRollDetails.error = showError.multipleDiceRollCorrection
			return diceRollDetails
		} 
		// large number error handling
		else if (Number(expressionDecomposed[0]) > 100000 || Number(expressionDecomposed[2]) > 100000) {
			diceRollDetails.error = showError.tooLargeANumber
			return diceRollDetails
		}	
		// generate rolls
		var rolls = []
		for (var i = 0; i < numberOfDice; i++) {
			rolls.push(getRollOfAnXSidedDie(facesInDice))
		}
		// multiple dice rolls handling
    if (expressionDecomposed.length === 3) {
    	diceRollDetails.result = getSumOfRolls(rolls)
    	diceRollDetails.stepByStepEvaluation = getStepByStepEvaluationOfNonExplosionExpression(expression, rolls, "simple")
    	diceRollDetails.odds = isTest ? null : getExactOddsForExpression(expression, "multiple dice roll")
    	return diceRollDetails
    }
    // drop lowest rolls, keep highest rolls, and explosive rolls handling 
    else if (expressionDecomposed.length === 5) {
    	var gamePlayed = expressionDecomposed[3]
    	// drop lowest rolls handling
			if (gamePlayed === 'd') {
				var resultsDropped = Number(expressionDecomposed[4])
				// keep highest rolls error handling
				if (resultsDropped >= numberOfDice) {
					diceRollDetails.error = showError.dropCorrection
					return diceRollDetails
				}
				// we make two copies of the rolls; one for remembering the original order, another to
				// keep track of the surviving rolls. This is done to present the dropped and kept rolls
				// in order
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
			} 
			// keep highest rolls handling
			else if (gamePlayed === 'k') {
				var resultsKept = Number(expressionDecomposed[4])
				// keep highest rolls error handling
				if (resultsKept === 0 || resultsKept > numberOfDice) {
					diceRollDetails.error = showError.keepCorrection
					return diceRollDetails
				}
				// we make two copies of the rolls; one for remembering the original order, another to
				// keep track of the surviving rolls. This is done to present the dropped and kept rolls
				// in order
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
			} 
			// explosive rolls handling
			else if (gamePlayed === 'x') {
				var explosionThreshold = Number(expressionDecomposed[4])
				// explosive rolls error handling
				if (explosionThreshold <= 1 || explosionThreshold > facesInDice) {
					diceRollDetails.error = showError.explosionCorrection
					return diceRollDetails
				}
				var explosiveRolls = getExplosiveRollDetails(rolls, explosionThreshold, expressionDecomposed, facesInDice)
				diceRollDetails.stepByStepEvaluation = explosiveRolls.stepByStepEvaluation
				diceRollDetails.result = explosiveRolls.result
				diceRollDetails.odds = (!isEstimatingProbabilities && numberOfDice <= 5 && (explosionThreshold/facesInDice) >= 0.5) ? getApproximateOddsForExpression(expression) : null
				return diceRollDetails
			} 
			// user entering neither of d k or x error handling
			else {
				diceRollDetails.error = showError.dKXCorrection
				return diceRollDetails
			}
    } 
    // too much input error handling
    else {
			diceRollDetails.error = showError.tooMuchInput
			return diceRollDetails
    }
  }
}









// exports
module.exports = {
	rollTheDiceByExpression : rollTheDiceByExpression,
}
