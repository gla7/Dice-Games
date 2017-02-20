var app = angular.module('app',["chart.js"])

app.controller('controller',['$scope', '$http', function ($scope, $http) {

	console.log("front end controller loaded!!!")

	$scope.showInstructions = false
	$scope.showError = false
	$scope.showOutcome = false
	$scope.additionMode = false
	$scope.showAdditionModeOutcome = false
	$scope.additionModeButtonText = "Click here to enable addition mode!"
	$scope.outcome = {}
	$scope.additionOutcome = {}

	$scope.toggleAdditionMode = function () {
		$scope.additionMode = !$scope.additionMode
		$scope.showError = false
		if ($scope.additionMode) {
			$scope.additionModeButtonText = "Click here to enable normal mode!"
		} else {
			$scope.additionModeButtonText = "Click here to enable addition mode!"
		}
	}

	$scope.displayInstructions = function () {
		$scope.showInstructions = !$scope.showInstructions
	}

	$http.get('/sampleGet').then(function (response, error) {
		$scope.sampleCallbackedVariable = response.data
	})

	$scope.diceExpression = ''
	$scope.diceAdditionExpression = ''
	var unallowedCharacters = ['/', '.', '?', '#', '%', '\\']

	$scope.submitButton = function (diceExpression) {
		console.log(diceExpression, typeof diceExpression)
		var allowed = true
		unallowedCharacters.map(function (character) {
			if (diceExpression.includes(character)) {
				allowed = false
			}
		})
		if (allowed && diceExpression !== '') {
			$http.get('/diceExpression/' + diceExpression).then(function (response, error) {
				console.log("OUTCOME: ", response.data.outcome)
				$scope.outcome = response.data.outcome
				if ($scope.outcome.error) {
					$scope.showError = true
					$scope.showOutcome = false
				} else {
					$scope.showError = false
					$scope.showOutcome = true
					//testing
					$scope.labels = []
  				$scope.data = []
  				for (odd in $scope.outcome.odds) {
  					$scope.labels.push(odd)
  					$scope.data.push(($scope.outcome.odds[odd]*100))
  				}
					//testing
				}
				$scope.diceExpression = ''
			})
		} else {
			$scope.outcome.error = "Please enter either non-negative integers or letters. No special characters! See examples above."
			$scope.showError = true
			$scope.showOutcome = false
			$scope.diceExpression = ''
		}
	}

	$scope.addOrSubtract = function (diceExpression, plusOrMinus) {
		var allowed = true
		unallowedCharacters.map(function (character) {
			if (diceExpression.includes(character)) {
				allowed = false
			}
		})
		if (allowed && diceExpression !== '') {
			if (plusOrMinus === "+") {
				var runningOperation = $scope.additionOutcome.runningOperation
				var runningTotal = $scope.additionOutcome.runningTotal
				$http.get('/diceExpression/' + diceExpression).then(function (response, error) {
					$scope.additionOutcome = response.data.outcome
					$scope.diceAdditionExpression = ''
					if ($scope.additionOutcome.error) {
						$scope.showError = true
						$scope.showAdditionModeOutcome = false
					} else {
						$scope.additionOutcome.runningOperation = (runningOperation ? runningOperation : "") + " + (" + $scope.additionOutcome.stepByStepEvaluation.map(function (step) {
							return step.includes("dropped") ? "(" + step.split(":")[0] + " dropped)" : step.split(":")[0]
						}).join(" + ") + ")"
						$scope.additionOutcome.runningTotal = (runningTotal ? runningTotal : 0) + $scope.additionOutcome.result
						$scope.showError = false
						$scope.showAdditionModeOutcome = true
					}
					console.log($scope.additionOutcome)
				})
			} else {
				var runningOperation = $scope.additionOutcome.runningOperation
				var runningTotal = $scope.additionOutcome.runningTotal
				$http.get('/diceExpression/' + diceExpression).then(function (response, error) {
					$scope.additionOutcome = response.data.outcome
					$scope.diceAdditionExpression = ''
					if ($scope.additionOutcome.error) {
						$scope.showError = true
						$scope.showAdditionModeOutcome = false
					} else {
						$scope.additionOutcome.runningOperation = (runningOperation ? runningOperation : "") + " - (" + $scope.additionOutcome.stepByStepEvaluation.map(function (step) {
							return step.includes("dropped") ? "(" + step.split(":")[0] + " dropped)" : step.split(":")[0]
						}).join(" + ") + ")"
						$scope.additionOutcome.runningTotal = (runningTotal ? runningTotal : 0) - $scope.additionOutcome.result
						$scope.showError = false
						$scope.showAdditionModeOutcome = true
					}
					console.log($scope.additionOutcome)
				})
			}
		} else {
			$scope.additionOutcome.runningOperation = null
			$scope.additionOutcome.runningTotal = null
			$scope.additionOutcome.error = "Please enter either non-negative integers or letters. No special characters! See examples above."
			$scope.showError = true
			$scope.showAdditionModeOutcome = false
			$scope.diceAdditionExpression = ''
		}
	}

	$scope.clear = function () {
		$scope.additionOutcome = {}
		$scope.showError = false
	}

 	$scope.labels = ["Initialized"]
  $scope.data = [100]

}])
