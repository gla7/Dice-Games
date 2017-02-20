// requires
var diceRoller = require("./diceRoller.js")









// endpoint handlers
function homePage (req, res) {
	res.sendFile('/index.html',{root : "./public/html/"})
}

function diceExpression (req, res) {
	res.send({ outcome: diceRoller.rollTheDiceByExpression(req.params.diceExpression, false, false) })
}

function diceExpressionAddition (req, res) {
	res.send({ outcome: diceRoller.rollTheDiceByExpression(req.params.diceExpression, false, true) })
}









// exports
module.exports = {
	homePage: homePage,
	diceExpression: diceExpression,
	diceExpressionAddition: diceExpressionAddition,
}