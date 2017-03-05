// requires
var errorHandler = require('./errorHandler.js')
var helperFunctions = require('./helperFunctions.js')

// core functions
Array.prototype.min = function() { return Math.min.apply(null, this) }

Array.prototype.max = function() { return Math.max.apply(null, this) }
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

function handleLiteralCase (expression, isEstimatingProbabilities, isTest) {
	var expressionDecomposed = helperFunctions.decomposeExpression(expression)
	var literalCaseHandled = {}
	literalCaseHandled.expressionEvaluated = expression
	literalCaseHandled.result = Number(expressionDecomposed[0])
	literalCaseHandled.stepByStepEvaluation = [expression + ": " + literalCaseHandled.result]
	literalCaseHandled.odds = isTest ? null : helperFunctions.getExactOddsForExpression(expression, "literal")
	literalCaseHandled.error = null
	return literalCaseHandled
}

function handleSingleDieCase (expression, isEstimatingProbabilities, isTest) {
	var expressionDecomposed = helperFunctions.decomposeExpression(expression)
	var singleDieCaseHandled = {}
	singleDieCaseHandled.expressionEvaluated = expression
	singleDieCaseHandled.result = helperFunctions.getRollOfAnXSidedDie(Number(expressionDecomposed[1]))
	singleDieCaseHandled.stepByStepEvaluation = [expression + ": " + singleDieCaseHandled.result]
	singleDieCaseHandled.odds = isTest ? null : helperFunctions.getExactOddsForExpression(expression, "single die roll")
	singleDieCaseHandled.error = null
	return singleDieCaseHandled
}

function handleMultipleDiceCase (expression, isEstimatingProbabilities, isTest) {
	var expressionDecomposed = helperFunctions.decomposeExpression(expression)
	var rolls = helperFunctions.getRollsForMultipleDice(expression)
	var multipleDiceCaseHandled = {}
	multipleDiceCaseHandled.expressionEvaluated = expression
	multipleDiceCaseHandled.result = helperFunctions.getSumOfRolls(rolls)
	multipleDiceCaseHandled.stepByStepEvaluation = helperFunctions.getStepByStepEvaluationOfNonExplosionExpression(expression, rolls, "simple")
	multipleDiceCaseHandled.odds = isTest ? null : helperFunctions.getExactOddsForExpression(expression, "multiple dice roll")
	multipleDiceCaseHandled.error = null
	return multipleDiceCaseHandled
}

function handleDropCase (expression, isEstimatingProbabilities, isTest) {
	var expressionDecomposed = helperFunctions.decomposeExpression(expression)
	var rolls = helperFunctions.getRollsForMultipleDice(expression)
	var dropCaseHandled = {}
	var numberOfDice = Number(expressionDecomposed[0])
	var resultsDropped = Number(expressionDecomposed[4])
	// we make two copies of the rolls; one for remembering the original order, another to
	// keep track of the surviving rolls. This is done to present the dropped and kept rolls
	// in order
	var indecesOflowestRolls = []
	var originalRolls = helperFunctions.cloneArray(rolls)
	var rollsCopyForOrdering = helperFunctions.cloneArray(rolls)
	for (var j = 0; j < resultsDropped; j++) {
		indecesOflowestRolls.push(rollsCopyForOrdering.indexOf(rollsCopyForOrdering.min()))
		rollsCopyForOrdering[rollsCopyForOrdering.indexOf(rollsCopyForOrdering.min())] = 999999999999999
		rolls.splice(rolls.indexOf(rolls.min()),1)
  }
  dropCaseHandled.expressionEvaluated = expression
  dropCaseHandled.stepByStepEvaluation = helperFunctions.getStepByStepEvaluationOfNonExplosionExpression(expression, originalRolls, "drop", indecesOflowestRolls)
  dropCaseHandled.result = helperFunctions.getSumOfRolls(rolls)
  dropCaseHandled.odds = (!isEstimatingProbabilities && numberOfDice <= 15) ? getApproximateOddsForExpression(expression) : null
  dropCaseHandled.error = null
  return dropCaseHandled
}

function handleKeepCase (expression, isEstimatingProbabilities, isTest) {
	var expressionDecomposed = helperFunctions.decomposeExpression(expression)
	var rolls = helperFunctions.getRollsForMultipleDice(expression)
	var keepCaseHandled = {}
	var numberOfDice = Number(expressionDecomposed[0])
	var resultsKept = Number(expressionDecomposed[4])
	// we make two copies of the rolls; one for remembering the original order, another to
	// keep track of the surviving rolls. This is done to present the dropped and kept rolls
	// in order
	var highestRolls = []
	var indecesOfHighestRolls = []
	var originalRolls = helperFunctions.cloneArray(rolls)
	var rollsCopyForOrdering = helperFunctions.cloneArray(rolls)
	for (var j = 0; j < resultsKept; j++) {
		indecesOfHighestRolls.push(rollsCopyForOrdering.indexOf(rollsCopyForOrdering.max()))
		rollsCopyForOrdering[rollsCopyForOrdering.indexOf(rollsCopyForOrdering.max())] = -999999999999999
		highestRolls.push(rolls.splice(rolls.indexOf(rolls.max()),1)[0])
	}
	keepCaseHandled.expressionEvaluated = expression
	keepCaseHandled.stepByStepEvaluation = helperFunctions.getStepByStepEvaluationOfNonExplosionExpression(expression, originalRolls, "keep", indecesOfHighestRolls)
	keepCaseHandled.result = helperFunctions.getSumOfRolls(highestRolls)
	keepCaseHandled.odds = (!isEstimatingProbabilities && numberOfDice <= 15) ? getApproximateOddsForExpression(expression) : null
	keepCaseHandled.error = null
	return keepCaseHandled
}

function handleExplodeCase (expression, isEstimatingProbabilities, isTest) {
	var expressionDecomposed = helperFunctions.decomposeExpression(expression)
	var rolls = helperFunctions.getRollsForMultipleDice(expression)
	var explodeCaseHandled = {}
	var numberOfDice = Number(expressionDecomposed[0])
	var facesInDice = Number(expressionDecomposed[2])
	var explosionThreshold = Number(expressionDecomposed[4])
	var explosiveRolls = helperFunctions.getExplosiveRollDetails(rolls, explosionThreshold, expressionDecomposed, facesInDice)
	explodeCaseHandled.expressionEvaluated = expression
	explodeCaseHandled.stepByStepEvaluation = explosiveRolls.stepByStepEvaluation
	explodeCaseHandled.result = explosiveRolls.result
	explodeCaseHandled.odds = (!isEstimatingProbabilities && numberOfDice <= 5 && (explosionThreshold/facesInDice) >= 0.5) ? getApproximateOddsForExpression(expression) : null
	explodeCaseHandled.error = null
	return explodeCaseHandled
}

// main API function
function rollTheDiceByExpression (expression, isEstimatingProbabilities, isTest) {
	// error handling
	var errorsHandled = errorHandler.handleErrors(expression)
	if (errorsHandled !== null) {
		return { error: errorsHandled }
	}
	// here we break down the expression
	var expressionDecomposed = helperFunctions.decomposeExpression(expression)
	// all games handled
	var isLiteralCase = expressionDecomposed.length === 1
	var isSingleDieCase = expressionDecomposed.length === 2
	var isMultipleDiceCase = expressionDecomposed.length === 3
	var isDropCase = expressionDecomposed.length === 5 && expressionDecomposed[3] === 'd'
	var isKeepCase = expressionDecomposed.length === 5 && expressionDecomposed[3] === 'k'
	// handling each game
	if (isLiteralCase) {
		return handleLiteralCase(expression, isEstimatingProbabilities, isTest)
	} else if (isSingleDieCase) {
		return handleSingleDieCase(expression, isEstimatingProbabilities, isTest)
  } else if (isMultipleDiceCase) {
  	return handleMultipleDiceCase(expression, isEstimatingProbabilities, isTest)
  } else if (isDropCase) {
  	return handleDropCase(expression, isEstimatingProbabilities, isTest)
  } else if (isKeepCase) {
  	return handleKeepCase(expression, isEstimatingProbabilities, isTest)
  }
  return handleExplodeCase(expression, isEstimatingProbabilities, isTest)
}

// exports
module.exports = { rollTheDiceByExpression : rollTheDiceByExpression }
