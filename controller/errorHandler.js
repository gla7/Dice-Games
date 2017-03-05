// requires
var decomposeExpression = require('./helperFunctions.js').decomposeExpression

// constants
var LARGE_NUMBER_LIMIT = 100000

// core functions
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

function isMultipleDiceInvalidExpression (expression) {
	var expressionDecomposed = decomposeExpression(expression)
	var isInvalidExpression = false
	expressionDecomposed.map(function (expressionComponent, index) {
		if ((index % 2 === 0 && isNaN(Number(expressionComponent))) || (index % 2 !== 0 && !isNaN(Number(expressionComponent)))) {
			isInvalidExpression = true
		}
	})
	return isInvalidExpression
}

// main error handling function
function handleErrors (expression) {
	var expressionDecomposed = decomposeExpression(expression)
	// all possible errors
	var isSpecialCharacterError = !expressionDecomposed || expression.length !== expressionDecomposed.join("").length
	var isLiteralValueCaseCorrection = expressionDecomposed && expressionDecomposed.length === 1 && isNaN(Number(expressionDecomposed[0]))
	var isSingleDieTooLargeANumber = expressionDecomposed && expressionDecomposed.length === 2 && Number(expressionDecomposed[1]) > LARGE_NUMBER_LIMIT
	var isSingleDieRollCorrection = expressionDecomposed && expressionDecomposed.length === 2 && (Number(expressionDecomposed[1]) === 0 || expressionDecomposed[0] !== 'd')
	var isMultipleDiceTooLargeANumber = expressionDecomposed && expressionDecomposed.length > 2 && (Number(expressionDecomposed[0]) > LARGE_NUMBER_LIMIT || Number(expressionDecomposed[2]) > LARGE_NUMBER_LIMIT)
	var isMultipleDiceRollCorrection = expressionDecomposed && expressionDecomposed.length > 2 && (isMultipleDiceInvalidExpression(expression) || Number(expressionDecomposed[0]) === 0 || Number(expressionDecomposed[2]) === 0 || expressionDecomposed[1] !== 'd')
	var isDropCorrection = expressionDecomposed && expressionDecomposed.length === 5 && expressionDecomposed[3] === 'd' && Number(expressionDecomposed[4]) >= Number(expressionDecomposed[0])
	var isKeepCorrection = expressionDecomposed && expressionDecomposed.length === 5 && expressionDecomposed[3] === 'k' && (Number(expressionDecomposed[4]) === 0 || Number(expressionDecomposed[4]) > Number(expressionDecomposed[0]))
	var isExplosionCorrection = expressionDecomposed && expressionDecomposed.length === 5 && expressionDecomposed[3] === 'x' && (Number(expressionDecomposed[4]) <= 1 || Number(expressionDecomposed[4]) > Number(expressionDecomposed[2]))
	var isDKXCorrection = expressionDecomposed && expressionDecomposed.length === 5 && expressionDecomposed[3] !== 'x' && expressionDecomposed[3] !== 'k' && expressionDecomposed[3] !== 'd'
	var isTooMuchInput = expressionDecomposed && expressionDecomposed.length > 5
	// checking for each error
	if (isSpecialCharacterError) {
		return showError.noSpecialCharacters
	} else if (isLiteralValueCaseCorrection) {
		return showError.literalValueCaseCorrection
	} else if (isSingleDieTooLargeANumber) {
		return showError.tooLargeANumber
  } else if (isSingleDieRollCorrection) {
  	return showError.singleDieRollCorrection
  } else if (isMultipleDiceRollCorrection) {
  	return showError.multipleDiceRollCorrection
  } else if (isMultipleDiceTooLargeANumber) {
  	return showError.tooLargeANumber
  } else if (isDropCorrection) {
  	return showError.dropCorrection
  } else if (isKeepCorrection) {
  	return showError.keepCorrection
  } else if (isExplosionCorrection) {
  	return showError.explosionCorrection
  } else if (isDKXCorrection) {
  	return showError.dKXCorrection
  } else if (isTooMuchInput) {
  	return showError.tooMuchInput
  }
  return null
}

// exports
module.exports = { handleErrors: handleErrors }
