// module and dependancy declaration
var app = angular.module('app',["chart.js"])










// controller and directives declaration
app.controller('controller',['$scope', '$http', function ($scope, $http) {










	//display controlling scope variables
	$scope.showInstructions = false
	$scope.showError = false
	$scope.showNormalOutcome = false
	$scope.showAdditionMode = false
	$scope.showAdditionModeOutcome = false
	$scope.showLoadingGIF = false










	// parameter scope variables
	$scope.generateProbabilities = false
	$scope.additionModeButtonText = "Click here to enable addition mode"
	$scope.outcome = {}
	$scope.additionOutcome = {}
	$scope.diceExpression = ''
	$scope.diceAdditionExpression = ''










	// scope variables for chart
	$scope.labels = ["Initialized"]
  $scope.data = [100]










  // array of input characters that are not allowed
	var unallowedCharacters = ['/', '.', '?', '#', '%', '\\']









	// helper functions
	// calls the non-probability-generating endpoint and parses the response, adjusting the state of the scope accordingly 
	// (addition mode)
	function handleAdditionModeSuccess (diceExpression, plusOrMinus) {
		var runningOperation = $scope.additionOutcome.runningOperation
		var runningTotal = $scope.additionOutcome.runningTotal
		$http.get('/diceExpression/doNotGenerateProbabilities/' + diceExpression).then(function (response, error) {
			$scope.additionOutcome = response.data.outcome
			$scope.diceAdditionExpression = ''
			// when there is an error message...
			if ($scope.additionOutcome.error) {
				$scope.showError = true
				$scope.showAdditionModeOutcome = false
			} 
			// success handler
			else {
				$scope.additionOutcome.runningOperation = (runningOperation ? runningOperation : "") + " " + plusOrMinus + " (" + $scope.additionOutcome.stepByStepEvaluation.map(function (step) {
					return step.includes("dropped") ? "(" + step.split(":")[0] + " dropped)" : step.split(":")[0]
				}).join(" + ") + ")"
				$scope.additionOutcome.runningTotal = plusOrMinus === "+" ? ((runningTotal ? runningTotal : 0) + $scope.additionOutcome.result) : ((runningTotal ? runningTotal : 0) - $scope.additionOutcome.result)
				$scope.showError = false
				$scope.showAdditionModeOutcome = true
			}
			console.log($scope.additionOutcome)
		})
	}
	// depending on whether the user checks the generate probability box, this function calls the corresponding endpoint and
	// adjusts the state of the scope accordingly (normal mode)
	function handleNormalModeSuccess (diceExpression) {
		$scope.showError = false
		$scope.showLoadingGIF = true
		var generatedProbabilitiesString = $scope.generateProbabilities ? "generateProbabilities" : "doNotGenerateProbabilities"
		$http.get('/diceExpression/' + generatedProbabilitiesString + '/' + diceExpression).then(function (response, error) {
			console.log("OUTCOME: ", response.data.outcome)
			$scope.showLoadingGIF = false
			$scope.outcome = response.data.outcome
			// when there is an error message...
			if ($scope.outcome.error) {
				$scope.showError = true
				$scope.showNormalOutcome = false
			} 
			// success handler
			else {
				$scope.showError = false
				$scope.showNormalOutcome = true
				$scope.labels = []
				$scope.data = []
				for (odd in $scope.outcome.odds) {
					$scope.labels.push(odd)
					$scope.data.push(($scope.outcome.odds[odd]*100))
				}
			}
			$scope.diceExpression = ''
		})
	}
	// adjusts the state of the scope to the negatively frontend validated input when in addition mode
	function handleAdditionModeError () {
		$scope.additionOutcome.runningOperation = null
		$scope.additionOutcome.runningTotal = null
		$scope.additionOutcome.error = "Please enter either non-negative integers or letters. No special characters! See examples above."
		$scope.showError = true
		$scope.showAdditionModeOutcome = false
		$scope.diceAdditionExpression = ''
	}
	// adjusts the state of the scope to the negatively frontend validated input when in normal mode
	function handleNormalModeError () {
		$scope.outcome.error = "Please enter either non-negative integers or letters. No special characters! See examples above."
		$scope.showError = true
		$scope.showNormalOutcome = false
		$scope.diceExpression = ''
	}










	// scope methods
	// toggles between normal mode and addition mode
	$scope.toggleAdditionMode = function () {
		$scope.showAdditionMode = !$scope.showAdditionMode
		$scope.additionModeButtonText = $scope.showAdditionMode ? "Click here to enable normal mode" : "Click here to enable addition mode"
		$scope.showError = false
	}
	// toggles the instructions in and out of view
	$scope.displayInstructions = function () { $scope.showInstructions = !$scope.showInstructions }
	// this method is called when the user submits input either in normal mode or in addition mode
	$scope.rollTheDice = function (diceExpression, plusOrMinus) {
		var allowed = true
		unallowedCharacters.map(function (character) {
			if (diceExpression.includes(character)) {
				allowed = false
			}
		})
		if (allowed && diceExpression !== '') {
			if (plusOrMinus) {
				handleAdditionModeSuccess(diceExpression, plusOrMinus)
			} else {
				handleNormalModeSuccess(diceExpression)
			}
		} else {
			if (plusOrMinus) {
				handleAdditionModeError()
			} else {
				handleNormalModeError()
			}
		}
	}
	// clears the output space as well as the error box from the addition mode space
	$scope.clear = function () {
		$scope.additionOutcome = {}
		$scope.showError = false
	}

}])
