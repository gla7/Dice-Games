// requires
var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var endpointHandlers = require('./controller/endpointHandlers.js')










// express instantiation
var app = express()

app.use(cors())
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())
app.use(express.static(__dirname))









// endpoints
app.get("/", endpointHandlers.homePage)

app.get("/diceExpression/:diceExpression", endpointHandlers.diceExpression)

app.get("/diceExpression/addition/:diceExpression", endpointHandlers.diceExpressionAddition)









// server listening on port
var port = 3000

app.listen(port, function() {
	console.log("Your server is up at port " + port)
})










// exports
module.exports = {
	app: app,
}