// this is the test file
var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../server.js')

var should = chai.should()
var app = server.app

chai.use(chaiHttp)

describe("Dice API", function () {
	it("should get status 200 when getting the homepage", function (done) {
		chai.request(app)
		.get("/")
		.end(function (err, res) {
			should.equal(err, null)
			res.should.have.status(200)
			done()
		})
	})

	for (var i = 0; i < 11; i++) {
		var randomInteger = Math.round(Math.random()*100)
		it("should get status 200 and getting a result of " + randomInteger + " when getting /diceExpression/" + randomInteger, function (done) {
			chai.request(app)
			.get("/diceExpression/" + randomInteger)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				res.body.outcome.result.should.equal(randomInteger)
				done()
			})
		})
	}
})