# Dice Games
This is an application that simulates codified dice expressions (e.g. 3 6-sided dice: 3d6). It supports literal values, single dice roll, multiple dice rolls, drop lowest, keep highest, and explosive rolls. It also provides probabilities for each input expression. For more details, clone this repository, run it locally, and go to http://localhost:3000. Further instructions below...

# Setup

After you clone the repository, navigate to the root of it and install the node modules using the command:

```npm install```

After you do that, run either of the two following commands:

```node server.js```

or

```nodemon server.js```

# Testing the API

For testing, we use Mocha and Chai. By running the command

``` mocha ```

the main dice simulation functionality is tested.
