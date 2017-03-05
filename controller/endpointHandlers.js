// requires
var diceRoller = require("./diceRoller.js")

// endpoint handlers
function homePage (req, res) { // loads homepage
	res.sendFile('/index.html',{root : "./public/html/"})
}
// simulates dice roll for expression, breakdown, (or error message if applicable) and generates probabilities
function diceExpressionWithProbabilities (req, res) {
	res.send({ outcome: diceRoller.rollTheDiceByExpression(req.params.diceExpression, false) })
}
// simulates dice roll as per expression, breakdown, (or error message if applicable) and generates probabilities 
// for basic cases only
function diceExpressionNoProbabilities (req, res) {
	res.send({ outcome: diceRoller.rollTheDiceByExpression(req.params.diceExpression, true) })
}
// simulates dice roll as per expression and breakdown (or error message if applicable) (testing purposes)
function diceExpressionTestEndpoint (req, res) {
	res.send({ outcome: diceRoller.rollTheDiceByExpression(req.params.diceExpression, true, true) })
}

// exports
module.exports = {
	homePage: homePage,
	diceExpressionWithProbabilities: diceExpressionWithProbabilities,
	diceExpressionNoProbabilities: diceExpressionNoProbabilities,
	diceExpressionTestEndpoint: diceExpressionTestEndpoint,
}
