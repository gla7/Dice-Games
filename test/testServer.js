var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../server.js')

var should = chai.should()
var expect = chai.expect
var app = server.app

chai.use(chaiHttp)

describe("Dice API", function () {
	it("HOMEPAGE LOAD (test number 1 of 1): should get status 200 when getting the homepage", function (done) {
		chai.request(app)
		.get("/")
		.end(function (err, res) {
			should.equal(err, null)
			res.should.have.status(200)
			done()
		})
	})

	function randomNumberBetweenMAndN (m, n) { return Math.floor(Math.random()*(n - m + 1)+m) }
	var numberOfTestsInEachCase = 10
	var limitOfLiteralValueCase = 100
	var limitOfFacesInDice = 100
	var limitOfNumberOfDice = 100

	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var nonNegativeInteger = Math.round(Math.random()*limitOfLiteralValueCase)
		it("LITERAL VALUE CASE (test number " + (i + 1) + " of " + numberOfTestsInEachCase + "): should get status 200, no error message, and a result of " + nonNegativeInteger + ",  when getting /diceExpression/" + nonNegativeInteger, function (done) {
			chai.request(app)
			.get("/diceExpression/" + nonNegativeInteger)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				expect(res.body.outcome.result).to.be.gt(-1)
				should.equal(res.body.outcome.result, nonNegativeInteger)
				should.equal(res.body.outcome.error, null)
				done()
			})
		})
	}

	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		it("ONE DIE ROLL CASE (test number " + (i + 1) + " of " + numberOfTestsInEachCase + "): should get status 200, no error message, and a result between 1 and " + facesInDice + ",  when getting /diceExpression/d" + facesInDice, function (done) {
			chai.request(app)
			.get("/diceExpression/d" + facesInDice)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				expect(res.body.outcome.result).to.be.gt(0)
				expect(res.body.outcome.result).to.be.lt(facesInDice + 1)
				should.equal(res.body.outcome.error, null)
				done()
			})
		})
	}

	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		it("DICE ROLL CASE (test number " + (i + 1) + " of " + numberOfTestsInEachCase + "): should get status 200, no error message, and a result between " + numberOfDice + " and " + facesInDice*numberOfDice + ",  when getting /diceExpression/" + numberOfDice + "d" + facesInDice, function (done) {
			chai.request(app)
			.get("/diceExpression/" + numberOfDice + "d" + facesInDice)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				expect(res.body.outcome.result).to.be.gt(numberOfDice - 1)
				expect(res.body.outcome.result).to.be.lt((numberOfDice*facesInDice) + 1)
				should.equal(res.body.outcome.error, null)
				done()
			})
		})
	}

	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var resultsDropped = randomNumberBetweenMAndN(0, numberOfDice - 1)
		it("DROP LOWEST ROLLS CASE (test number " + (i + 1) + " of " + numberOfTestsInEachCase + "): should get status 200, no error message, and a result between " + (numberOfDice - resultsDropped) + " and " + facesInDice*(numberOfDice - resultsDropped) + ",  when getting /diceExpression/" + numberOfDice + "d" + facesInDice + "d" + resultsDropped, function (done) {
			chai.request(app)
			.get("/diceExpression/" + numberOfDice + "d" + facesInDice + "d" + resultsDropped)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				expect(res.body.outcome.result).to.be.gt((numberOfDice - resultsDropped) - 1)
				expect(res.body.outcome.result).to.be.lt(((numberOfDice - resultsDropped)*facesInDice) + 1)
				should.equal(res.body.outcome.error, null)
				done()
			})
		})
	}

	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var resultsKept = randomNumberBetweenMAndN(1, numberOfDice)
		it("KEEP HIGHEST ROLLS CASE (test number " + (i + 1) + " of " + numberOfTestsInEachCase + "): should get status 200, no error message, and a result between " + resultsKept + " and " + facesInDice*resultsKept + ",  when getting /diceExpression/" + numberOfDice + "d" + facesInDice + "k" + resultsKept, function (done) {
			chai.request(app)
			.get("/diceExpression/" + numberOfDice + "d" + facesInDice + "k" + resultsKept)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				expect(res.body.outcome.result).to.be.gt(resultsKept - 1)
				expect(res.body.outcome.result).to.be.lt((resultsKept*facesInDice) + 1)
				should.equal(res.body.outcome.error, null)
				done()
			})
		})
	}

	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var explosionThreshold = randomNumberBetweenMAndN(2, numberOfDice)
		it("EXPLOSIVE ROLLS CASE (test number " + (i + 1) + " of " + numberOfTestsInEachCase + "): should get status 200, no error message, and a result between " + numberOfDice + " and infinity,  when getting /diceExpression/" + numberOfDice + "d" + facesInDice + "x" + explosionThreshold, function (done) {
			chai.request(app)
			.get("/diceExpression/" + numberOfDice + "d" + facesInDice + "x" + explosionThreshold)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				expect(res.body.outcome.result).to.be.gt(numberOfDice - 1)
				should.equal(res.body.outcome.error, null)
				done()
			})
		})
	}
})