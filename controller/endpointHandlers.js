// requires
var diceRoller = require("./diceRoller.js")









// endpoint handlers
function homePage (req, res) {
	res.sendFile('/index.html',{root : "./public/html/"})
}

function diceExpressionWithProbabilities (req, res) {
	res.send({ outcome: diceRoller.rollTheDiceByExpression(req.params.diceExpression, false) })
}

function diceExpressionNoProbabilities (req, res) {
	res.send({ outcome: diceRoller.rollTheDiceByExpression(req.params.diceExpression, true) })
}

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
