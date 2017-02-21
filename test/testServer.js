var chai = require('chai')
var chaiHttp = require('chai-http')
var server = require('../server.js')

var should = chai.should()
var expect = chai.expect
var app = server.app

chai.use(chaiHttp)

function randomNumberBetweenMAndN (m, n) { return Math.floor(Math.random()*(n - m + 1)+m) }
function generateRandomLetterString (length, charactersAvailable) {
    var text = " "
    for(var i = 0; i < length; i++) {
        text = text + charactersAvailable.charAt(Math.floor(Math.random() * charactersAvailable.length))
    }
    return text.trim()
}
var numberOfTestsInEachCase = 10
var limitOfLiteralValueCase = 100
var limitOfFacesInDice = 100
var limitOfNumberOfDice = 100
var notPermittedSymbols = "`~!@$^&*()-_=+[{]}|;:',<>".split("")
var invalidLetters = "abcefghijlmnopqrstuvwyzQWERTYUIOPASFFGHJLZCVBNM"
var numbers = "0123456789"
var kdx = "kdx"

describe("HOMEPAGE LOAD", function () {
	it("Test number 1 of 1: should get status 200 when getting the homepage", function (done) {
		chai.request(app)
		.get("/")
		.end(function (err, res) {
			should.equal(err, null)
			res.should.have.status(200)
			done()
		})
	})
})

describe("LITERAL VALUE CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var nonNegativeInteger = Math.round(Math.random()*limitOfLiteralValueCase)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, no error message, and a result of " + nonNegativeInteger + ",  when getting /diceExpression/testEndpoint/" + nonNegativeInteger, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + nonNegativeInteger)
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
})

describe("NEGATIVE LITERAL VALUE CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var negativeInteger = - Math.round(Math.random()*limitOfLiteralValueCase)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a no special symbols error message when getting /diceExpression/testEndpoint/" + negativeInteger, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + negativeInteger)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "Please enter either non-negative integers or letters. No special characters! See examples above.")
				done()
			})
		})
	}
})

describe("NO SPECIAL SYMBOLS", function () {
	notPermittedSymbols.map(function (symbol, symbolIndex) {
		it("Test number " + (symbolIndex + 1) + " of " + notPermittedSymbols.length + ": should get status 200, and a no special symbols error message, when getting /diceExpression/testEndpoint/" + symbol, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + symbol)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "Please enter either non-negative integers or letters. No special characters! See examples above.")
				done()
			})
		})
	})
})

describe("NOT JUST LETTERS", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var randomStringOfLetters = generateRandomLetterString(randomNumberBetweenMAndN(1, 100), invalidLetters)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a literal value case error when getting /diceExpression/testEndpoint/" + randomStringOfLetters, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + randomStringOfLetters)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "For a literal value case, please enter a non-negative integer. See examples above.")
				done()
			})
		})
	}
})

describe("NOT JUST INVALID LETTERS AND NUMBERS", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var randomStringOfLettersAndNumbers = generateRandomLetterString(randomNumberBetweenMAndN(1, 100), invalidLetters + numbers)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and an error message when getting /diceExpression/testEndpoint/" + randomStringOfLettersAndNumbers, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + randomStringOfLettersAndNumbers)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.not.equal(res.body.outcome.error, null)
				done()
			})
		})
	}
})

describe("ONE DIE ROLL CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, no error message, and a result between 1 and " + facesInDice + ",  when getting /diceExpression/testEndpoint/d" + facesInDice, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/d" + facesInDice)
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
})

describe("ZERO FACED ONE DIE ROLL CASE", function () {
	var facesInDice = 0
	it("Test number 1 of 1: should get status 200, and a single dice roll error message, when getting /diceExpression/testEndpoint/d" + facesInDice, function (done) {
		chai.request(app)
		.get("/diceExpression/testEndpoint/d" + facesInDice)
		.end(function (err, res) {
			should.equal(err, null)
			res.should.have.status(200)
			should.equal(res.body.outcome.error, "For a single die roll with N (N should be positive) faces, please follow this example: single roll of a 6-sided die = 'd6'. More examples above.")
			done()
		})
	})
})

describe("ONE DIE ROLL CASE ERROR", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var invalidLetterAndNumbers = generateRandomLetterString(1, invalidLetters) + randomNumberBetweenMAndN(1, 1000)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a single die roll error message when getting /diceExpression/testEndpoint/" + invalidLetterAndNumbers, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + invalidLetterAndNumbers)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "For a single die roll with N (N should be positive) faces, please follow this example: single roll of a 6-sided die = 'd6'. More examples above.")
				done()
			})
		})
	}
})

describe("DICE ROLL CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, no error message, and a result between " + numberOfDice + " and " + facesInDice*numberOfDice + ",  when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice)
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
})

describe("TOO LARGE NUMBER IN FACES", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(100001, 1000000)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a too large number error when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "You have entered too large a number that may crash our server!")
				done()
			})
		})
	}
})

describe("TOO LARGE NUMBER IN NUMBER OF DICE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(100001, 1000000)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a too large number error when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "You have entered too large a number that may crash our server!")
				done()
			})
		})
	}
})

describe("INPUT IN WRONG ORDER CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var firstRandomNumber = randomNumberBetweenMAndN(1, 1000)
		var secondRandomNumber = randomNumberBetweenMAndN(1, 1000)
		var firstSetOfRandomLetters = generateRandomLetterString(Math.random()*100, invalidLetters)
		var secondSetOfRandomLetters = generateRandomLetterString(Math.random()*100, invalidLetters)
		var thirdSetOfRandomLetters = generateRandomLetterString(Math.random()*100, invalidLetters)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a multiple dice error message when getting /diceExpression/testEndpoint/" + firstSetOfRandomLetters + firstRandomNumber + secondSetOfRandomLetters + secondRandomNumber + thirdSetOfRandomLetters, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + firstSetOfRandomLetters + firstRandomNumber + secondSetOfRandomLetters + secondRandomNumber + thirdSetOfRandomLetters)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "For multiple dice, the expression should always begin with a positive integer followed by a 'd' followed by another positive integer. For example, the expression for 3 6-sided dice would be '3d6'. More examples above.")
				done()
			})
		})
	}
})

describe("TOO MUCH INPUT CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var firstRandomNumber = randomNumberBetweenMAndN(1, 1000)
		var secondRandomNumber = randomNumberBetweenMAndN(1, 1000)
		var thirdRandomNumber = randomNumberBetweenMAndN(1, 1000)
		var fourthRandomNumber = randomNumberBetweenMAndN(1, 1000)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a too much input error message when getting /diceExpression/testEndpoint/" + firstRandomNumber + "d" + secondRandomNumber + "d" + thirdRandomNumber + "d" + fourthRandomNumber, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + firstRandomNumber + "d" + secondRandomNumber + "d" + thirdRandomNumber + "d" + fourthRandomNumber)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "Something is wrong with your input (e.g. too much of it: '4d5d6d1'). See examples above.")
				done()
			})
		})
	}
})

describe("DICE ROLL CASE NOT WITH d IN THE MIDDLE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a multiple dice error message when getting /diceExpression/testEndpoint/" + numberOfDice + generateRandomLetterString(1, invalidLetters) + facesInDice, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + generateRandomLetterString(1, invalidLetters) + facesInDice)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "For multiple dice, the expression should always begin with a positive integer followed by a 'd' followed by another positive integer. For example, the expression for 3 6-sided dice would be '3d6'. More examples above.")
				done()
			})
		})
	}
})

describe("ZERO FACE DICE ROLL CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = 0
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a multiple dice roll error message when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "For multiple dice, the expression should always begin with a positive integer followed by a 'd' followed by another positive integer. For example, the expression for 3 6-sided dice would be '3d6'. More examples above.")
				done()
			})
		})
	}
})

describe("ZERO DICE ROLL CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = 0
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a multiple dice roll error message when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "For multiple dice, the expression should always begin with a positive integer followed by a 'd' followed by another positive integer. For example, the expression for 3 6-sided dice would be '3d6'. More examples above.")
				done()
			})
		})
	}
})

describe("NOT K D OR X", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var thirdNumber = randomNumberBetweenMAndN(0, numberOfDice - 1)
		var notKdx = generateRandomLetterString(1, invalidLetters)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a not using k d or x error message when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + notKdx + thirdNumber, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + notKdx + thirdNumber)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "To play drop, keep, or explode, please use 'd', 'k' or 'x' respectively. See examples above.")
				done()
			})
		})
	}
})

describe("ZERO FACES IN K D OR X", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = 0
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var thirdNumber = randomNumberBetweenMAndN(0, numberOfDice - 1)
		var kDOrX = generateRandomLetterString(1, kdx)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a multiple dice error message when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + kDOrX + thirdNumber, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + kDOrX + thirdNumber)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "For multiple dice, the expression should always begin with a positive integer followed by a 'd' followed by another positive integer. For example, the expression for 3 6-sided dice would be '3d6'. More examples above.")
				done()
			})
		})
	}
})

describe("ZERO DICE IN K D OR X", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = 0
		var thirdNumber = randomNumberBetweenMAndN(0, numberOfDice - 1)
		var kDOrX = generateRandomLetterString(1, kdx)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a multiple dice error message when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + kDOrX + thirdNumber, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + kDOrX + thirdNumber)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "For multiple dice, the expression should always begin with a positive integer followed by a 'd' followed by another positive integer. For example, the expression for 3 6-sided dice would be '3d6'. More examples above.")
				done()
			})
		})
	}
})

describe("DROP LOWEST ROLLS CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var resultsDropped = randomNumberBetweenMAndN(0, numberOfDice - 1)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, no error message, and a result between " + (numberOfDice - resultsDropped) + " and " + facesInDice*(numberOfDice - resultsDropped) + ",  when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "d" + resultsDropped, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "d" + resultsDropped)
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
})

describe("DROP LOWEST ROLLS CASE WITH D >= THE NUMBER OF DICE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var resultsDropped = randomNumberBetweenMAndN(numberOfDice, numberOfDice + 100)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a drop error message when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "d" + resultsDropped, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "d" + resultsDropped)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "Cannot drop as many or more results than there are available! See explanations above.")
				done()
			})
		})
	}
})

describe("KEEP HIGHEST ROLLS CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var resultsKept = randomNumberBetweenMAndN(1, numberOfDice)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, no error message, and a result between " + resultsKept + " and " + facesInDice*resultsKept + ",  when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "k" + resultsKept, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "k" + resultsKept)
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
})

describe("KEEP HIGHEST ROLLS CASE WITH K = 0 OR ABOVE THE NUMBER OF DICE", function () {
	var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
	var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
	var resultsKept = 0
	it("Test number 1 of " + (numberOfTestsInEachCase + 1) + ": should get status 200, and a keep error message when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "k" + resultsKept, function (done) {
		chai.request(app)
		.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "k" + resultsKept)
		.end(function (err, res) {
			should.equal(err, null)
			res.should.have.status(200)
			should.equal(res.body.outcome.error, "Cannot keep zero results or more results than there are available! See explanations above.")
			done()
		})
	})
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var resultsKept = randomNumberBetweenMAndN(numberOfDice + 1, numberOfDice + 100)
		it("Test number " + (i + 2) + " of " + (numberOfTestsInEachCase + 1) + ": should get status 200, and a keep error message when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "k" + resultsKept, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "k" + resultsKept)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "Cannot keep zero results or more results than there are available! See explanations above.")
				done()
			})
		})
	}
})

describe("EXPLOSIVE ROLLS CASE", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var explosionThreshold = randomNumberBetweenMAndN(2, facesInDice)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, no error message, and a result between " + numberOfDice + " and infinity,  when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "x" + explosionThreshold, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "x" + explosionThreshold)
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

describe("EXPLOSIVE ROLLS CASE WITH X = 1 OR BELOW", function () {
	for (var i = 0; i < numberOfTestsInEachCase; i++) {
		var facesInDice = randomNumberBetweenMAndN(1, limitOfFacesInDice)
		var numberOfDice = randomNumberBetweenMAndN(1, limitOfNumberOfDice)
		var explosionThreshold = randomNumberBetweenMAndN(0, 1)
		it("Test number " + (i + 1) + " of " + numberOfTestsInEachCase + ": should get status 200, and a no 1 or below x's error when getting /diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "x" + explosionThreshold, function (done) {
			chai.request(app)
			.get("/diceExpression/testEndpoint/" + numberOfDice + "d" + facesInDice + "x" + explosionThreshold)
			.end(function (err, res) {
				should.equal(err, null)
				res.should.have.status(200)
				should.equal(res.body.outcome.error, "Cannot have an explosion threshold at or below 1. This would result in an infinite operation! You also cannot have x above the number of faces. See explanations above.")
				done()
			})
		})
	}
})
