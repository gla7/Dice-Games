var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')

var callbackFunctions = require('./controller/callbackFunctions.js')

var app = express()

app.use(cors())
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())

app.use(express.static(__dirname))

app.get("/", callbackFunctions.homePage)

app.get("/sampleGet", callbackFunctions.sampleGet)

app.get("/diceExpression/:diceExpression", callbackFunctions.diceExpression)

var port = 3000

app.listen(port, function() {
	console.log("Your server is up at port " + port)
})