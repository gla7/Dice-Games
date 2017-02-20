//testing
var polynomial = require('polynomial')
//testing

function sampleGet (req, res) {
	res.send("THIS IS THE SAMPLE GET!!!")
}

function homePage (req, res) {
	res.sendFile('/index.html',{root : "./public/html/"})
}

function diceExpression (req, res) {
	res.send({ outcome: rollTheDiceByExpression(req.params.diceExpression, false) })
}

// MAIN FUNCTION

Array.prototype.min = function() {
	return Math.min.apply(null, this)
}

Array.prototype.max = function() {
	return Math.max.apply(null, this)
}

function decomposeExpression (expression) {
	return expression.match(/[a-zA-Z]+|[0-9]+/g)
}

function getRollOfAnXSidedDie (x) {
	return Math.floor((Math.random() * x) + 1)
}

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

function getStepByStepEvaluationOfExpression (expression, rolls, useCase, indecesOflowestOrHighestRolls) {
	var expressionDecomposed = decomposeExpression(expression)
	var allSteps = ""
	var numberOfDice = expressionDecomposed[0]
	expressionDecomposed.splice(0, 1)
	if (useCase === "simple") {
		for (var i = 0; i < numberOfDice; i++) {
			allSteps = allSteps + " 1" + expressionDecomposed.join("")
		}
		allSteps = allSteps.trim().split(" ")
	  return allSteps.map(function (step, stepIndex) {
	  	return step + ": " + rolls[stepIndex]
	  })
	} else if (useCase === "drop") {
		expressionDecomposed.pop()
		expressionDecomposed.pop()
		for (var i = 0; i < numberOfDice; i++) {
			allSteps = allSteps + " 1" + expressionDecomposed.join("")
		}
		allSteps = allSteps.trim().split(" ")
	  return allSteps.map(function (step, stepIndex) {
	  	return indecesOflowestOrHighestRolls.includes(stepIndex) ? step + ": " + rolls[stepIndex] + " => dropped" : step + ": " + rolls[stepIndex] + " => kept"
	  })
	} else if (useCase === "keep") {
		expressionDecomposed.pop()
		expressionDecomposed.pop()
		for (var i = 0; i < numberOfDice; i++) {
			allSteps = allSteps + " 1" + expressionDecomposed.join("")
		}
		allSteps = allSteps.trim().split(" ")
	  return allSteps.map(function (step, stepIndex) {
	  	return indecesOflowestOrHighestRolls.includes(stepIndex) ? step + ": " + rolls[stepIndex] + " => kept" : step + ": " + rolls[stepIndex] + " => dropped"
	  })
	} 
}

function getExplosiveRolls (rolls, explosionThreshold, expressionDecomposed, facesInDice) {
	var runningSum = 0
	var steps = []
	function explode (array, index, threshold, expressionDecomposed, facesInDice) {
		console.log("running sum ", runningSum)
		console.log("array is ", array, " and index is ", index, " and threshold is ", threshold)
		if (!array[index]) {
			return {
				runningSum: runningSum,
				steps: steps,
			}
		}
		if (array[index] >= threshold) {
			runningSum = runningSum + array[index]
			steps.push(1 + expressionDecomposed[1] + expressionDecomposed[2] + ": " + array[index])
			array[index] = getRollOfAnXSidedDie(facesInDice)
			return explode(array, index, threshold, expressionDecomposed, facesInDice)
		}
		runningSum = runningSum + array[index]
		steps.push(1 + expressionDecomposed[1] + expressionDecomposed[2] + ": " + array[index])
		return explode(array, index + 1, threshold, expressionDecomposed, facesInDice)
	}
	return explode(rolls, 0, explosionThreshold, expressionDecomposed, facesInDice)
}

//testing COMPLEX
// function factorial (n) {
// 	if (n <= 1) {
// 		return 1
// 	}
// 	return n*factorial(n-1)
// }

// function gamma(n) {  // accurate to about 15 decimal places
//   //some magic constants 
//   var g = 7, // g represents the precision desired, p is the values of p[i] to plug into Lanczos' formula
//       p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
//   if(n < 0.5) {
//     return Math.PI / Math.sin(n * Math.PI) / gamma(1 - n);
//   }
//   else {
//     n--;
//     var x = p[0];
//     for(var i = 1; i < g + 2; i++) {
//       x += p[i] / (n + i);
//     }
//     var t = n + g + 0.5;
//     return Math.sqrt(2 * Math.PI) * Math.pow(t, (n + 0.5)) * Math.exp(-t) * x;
//   }
// }

// function factorial(n) {
//   return gamma(n + 1);
// }

// function binomialCoefficient (n, k) {
// 	return (factorial(n))/(factorial(n - k)*factorial(k))
// }

// function nFunction (b, c, d) {
// 	if (b === 0 && c === 0) {
// 		return 1
// 	}
// 	var runningSum = 0
// 	for (var k = 0; k < c + 1; k++) {
// 		runningSum = runningSum + Math.pow(-1, k)*binomialCoefficient(c, k)*binomialCoefficient(b - (k*(d + 1)) + c - 1, c - 1)
// 	}
// 	return runningSum
// }

// function waysToSumSFromKHighestOfNXSidedDice (S, K, N, X) {
// 	var runningWays = 0
// 	for (var r = 1; r < X + 1; r++) {
// 		for (var i = 0; i < N - K + 1; i++) {
// 			for (var j = N - K - i + 1; j < N - i + 1; j++) {
// 				runningWays = runningWays + ((factorial(N)*Math.pow(r - 1, i))/(factorial(i)*factorial(j)*factorial(N - i - j)))*nFunction(S + i + j - N - r*K, N - i - j, X - r - 1)
// 			}
// 		}
// 	}
// 	return runningWays
// }
//testing COMPLEX

function rollTheDiceByExpression (expression, isGeneratingProbabilities) {
	console.log("typeof ", typeof expression, " expression ", expression)
	var diceRollDetails = {
		expressionEvaluated: expression,
		error: null,
		result: null,
		stepByStepEvaluation: null,
		//testing
		odds: null,
		//testing
	}
	var expressionDecomposed = decomposeExpression(expression)
	if (!expressionDecomposed || expression.length !== expressionDecomposed.join("").length) {
		diceRollDetails.error = "Please enter either non-negative integers or letters. No special characters! See examples above."
		return diceRollDetails
	}
	if (expressionDecomposed.length === 1) {
		if (!isNaN(Number(expressionDecomposed[0]))) {
			diceRollDetails.result = Number(expressionDecomposed[0])
			diceRollDetails.stepByStepEvaluation = [expression + ": " + diceRollDetails.result]
			//testing
			diceRollDetails.odds = {}
			diceRollDetails.odds[diceRollDetails.result] = 1
			//testing
			return diceRollDetails
		}
		diceRollDetails.error = "For a literal value case, please enter a non-negative integer. See examples above."
		return diceRollDetails
	} else if (expressionDecomposed.length === 2) {
		if (Number(expressionDecomposed[1]) === 0 || expressionDecomposed[0] !== 'd') {
			diceRollDetails.error = "For a single die roll with N (N should be positive) faces, please follow this example: single roll of a 6-sided die = 'd6'. More examples above."
			return diceRollDetails
		}
		diceRollDetails.result = getRollOfAnXSidedDie(Number(expressionDecomposed[1]))
		diceRollDetails.stepByStepEvaluation = [expression + ": " + diceRollDetails.result]
		//testing
		diceRollDetails.odds = {}
		for (var i = 0; i < Number(expressionDecomposed[1]); i++) {
			diceRollDetails.odds[i+1] = 1/Number(expressionDecomposed[1])
		}
		//testing
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
			diceRollDetails.error = "For multiple dice, the expression should always begin with a positive integer followed by a 'd' followed by another positive integer. For example, the expression for 3 6-sided dice would be '3d6'. More examples above."
			return diceRollDetails
		}		
		var rolls = []
		for (var i = 0; i < numberOfDice; i++) {
			rolls.push(getRollOfAnXSidedDie(facesInDice))
		}
		console.log(rolls)
    if (expressionDecomposed.length === 3) {
    	diceRollDetails.result = getSumOfRolls(rolls)
    	diceRollDetails.stepByStepEvaluation = getStepByStepEvaluationOfExpression(expression, rolls, "simple")
    	//testing
    	diceRollDetails.odds = {}
    	var polynomialString = ""
    	for (var i = 0; i < facesInDice; i++) {
    		polynomialString = polynomialString === "" ? polynomialString + "x^" + (i + 1) : polynomialString + "+x^" + (i + 1)
    	}
    	var polynomialCoefficients = polynomial(polynomialString).pow(numberOfDice).coeff
    	for (coefficient in polynomialCoefficients) {
    		diceRollDetails.odds[coefficient] = polynomialCoefficients[coefficient]/Math.pow(facesInDice, numberOfDice)
    	}
    	//testing
    	return diceRollDetails
    } else if (expressionDecomposed.length === 5) {
    	//testing
    	if (!isGeneratingProbabilities) {
    		var probabilities = {}
    		for (var i = 0; i < 25001; i++) {
    			if (probabilities[rollTheDiceByExpression(expression, true).result]) {
    				probabilities[rollTheDiceByExpression(expression, true).result] = probabilities[rollTheDiceByExpression(expression, true).result] + 1/25000
    			} else {
    				probabilities[rollTheDiceByExpression(expression, true).result] = 1/25000
    			}
    		}
    		diceRollDetails.odds = probabilities
    	}
    	//testing
    	var gamePlayed = expressionDecomposed[3]
			if (gamePlayed === 'd') {
				var resultsDropped = Number(expressionDecomposed[4])
				if (resultsDropped >= numberOfDice) {
					diceRollDetails.error = "Cannot drop as many or more results than there are available! See explanations above."
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
        diceRollDetails.stepByStepEvaluation = getStepByStepEvaluationOfExpression(expression, originalRolls, "drop", indecesOflowestRolls)
        diceRollDetails.result = getSumOfRolls(rolls)
        return diceRollDetails
			} else if (gamePlayed === 'k') {
				var resultsKept = Number(expressionDecomposed[4])
				if (resultsKept === 0 || resultsKept > numberOfDice) {
					diceRollDetails.error = "Cannot keep zero results or more results than there are available! See explanations above."
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
				diceRollDetails.stepByStepEvaluation = getStepByStepEvaluationOfExpression(expression, originalRolls, "keep", indecesOfHighestRolls)
				diceRollDetails.result = getSumOfRolls(highestRolls)
				return diceRollDetails
			} else if (gamePlayed === 'x') {
				var explosionThreshold = Number(expressionDecomposed[4])
				if (explosionThreshold <= 1) {
					diceRollDetails.error = "Cannot have an explosion threshold at or below 1. This would result in an infinite operation! See explanations above."
					return diceRollDetails
				}
				var explosiveRolls = getExplosiveRolls(rolls, explosionThreshold, expressionDecomposed, facesInDice)
				diceRollDetails.stepByStepEvaluation = explosiveRolls.steps
				diceRollDetails.result = explosiveRolls.runningSum
				return diceRollDetails
			} else {
				diceRollDetails.error = "To play drop, keep, or explode, please use 'd', 'k' or 'x' respectively. See examples above."
				return diceRollDetails
			}
    } else {
    	diceRollDetails.error = "Something is wrong with your input (e.g. too much of it: '4d5d6d1'). See examples above."
			return diceRollDetails
    }
  }
}

// MAIN FUNCTION

module.exports = {
	homePage: homePage,
	sampleGet: sampleGet,
	diceExpression: diceExpression,
}