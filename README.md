# Welcome to our DAPP BlackJack SmartContract!
In this project, we deployed a smart contract to serve
and play Black Jack, a famous gambling game. The DAPP
achieved a fully automated and honest gambing experience.
The contract is written in Solidity 0.5.16, developed and and
tested in Truffle, and showcased using web3.js and React
framework.

# In order to play, please follow the instructions below

## 1. Install required package
### 1. If you have not install nodejs and truffle, please install nodejs and truffle first, you can refer [here](https://nodejs.org/en/) to get more information for nodejs and follows the instructions [here](https://trufflesuite.com/guides/how-to-install-truffle-and-testrpc-on-windows-for-blockchain-development/) to get your truffle installed.

### 2. Get required packages for running our frontend
```
npm install @truffle/hdwallet-provider  
npm install ethers  
npm install @metamask/detect-provider  
npm install bootstrap
```

### 3. Download `Ganache` for local host test environment
Download instructions can be found at https://trufflesuite.com/ganache/

## 2. Compile your smart contract with `Ganache` and your deployment account
### 1. Set your `Ganache` port coincides with the configuration file
Please go to this [directory](https://github.com/LegenQS/BlackJack_SmartContract/blob/main/truffle-config.js) and make sure the `host` and `port` are the same as the values showing on your `Ganache` main page. If not,
you can either change the truffle-config.js file or change the server of `Ganache` localhost. After that, please change the value of `from` to your account address to be deployed.

### 2. Compile the smart contract
Now make sure you are in the repository where truffle-config.js is located, for our project you should in the [path](https://github.com/LegenQS/BlackJack_SmartContract). Then please run
the following code to get the solidity file compiled (suppose you are already in the correct repository):
```
truffle compile  
truffle migrate
```

### 3. Start the frontend
After deploying the smart contract, you can now go to the frontend path to start the react app. Please make sure now you are in the [path](https://github.com/LegenQS/BlackJack_SmartContract/tree/main/frontend) where all
frontend codes are located. Then you can run the command below to start the localhost website
```
npm start 
```

## 3. Backend Details
There are nine key functions and six modifiers to support our BlackJack game, here are details of each part:
### 1. Functions
**placeDeposit**
Players call this function to buy tokens to enter the game. The amount of fund the user entered is transferred from the player's account to the dealer's account, 
and the player's balance increases automatically.

**playerBalance**
Players call this function with their account addresses to check their current balances. This is a mapping variable, so multiple players' balances can be saved. 

**playerScore**
The player can call this function anytime to check the current score he and the dealer got. 

**setBetValue**
The player calls this function with an integer input to set the bet value. 

**placeBet**
After setting the bet, the player can call this function to start the game. The player's balance will be deducted according to the bet value set before. 
Two cards will be dealt to the player, and one card to the dealer.  In back-end, we show the result by emitting the event. To realize random drawing, we take the 
instance of now, the msg.sender, and an incrementing nonce as inputs of _keccak256()_ to get an 256-bit hash. Using this hash function we
can get an random number, and use (modular 13) + 1 to get a random number between 1 and 13. Numbers greater or equal to 10 will become 10. Depending on the 
first three cards, there are three outcomes: 
- 1. The player got natural BlackJack, which will automatically end the game, and the player wins; 
- 2. The dealer got an Ace in the fist hand, which activates the payInsurance function; 
- 3. The rest of situations. 

**payInsurance**
If the dealer got an Ace in the first hand, the player can choose to pay insurance, which is half of the bet value, to bet on the dealer's second card. 

**hit**
The player can choose to draw another card by calling this function. However, if the player's score exceeds 21, the player busts, and the current game will 
automatically ends. 

**stand**
The player can choose to stand on the current hand of cards. Then, the dealer automatically draws card until his score exceeds 17 and is greater than the player's 
score. Cards drawn are emitted in the log. There are 3 outcomes: 1. If the user has paid the insurance, and the dealer's second card is a 10, two times insurance 
paid will be returned to the player; 2: The dealer busts, then two times bet value will be returned to the player; 3. The dealer wins. In all above three outcomes, 
the game is deactivated. 

**cashOut**
The player can choose to cash out whenever a game is ended. The current player's balance will be transferred back to his account.

### 2. Modifiers
**enoughBalance**
This modifier is used to make sure that the player has enough balance to set a bet value and enter the game.

**notBust**
This modifier is designed for users. The contract will not allow a user to hit if his current score is 21. 

**betPlaced**
This modifier is utilized to ensure that only if the player has placed a bet successfully, can he do further actions such as hit or stand. 

**nonStand**
This modifier makes sure that after the player stands, he no longer can hit. 

**gameActive**
This modifier checks if a game is active. When either the player or the dealer wins, the game ends. And the game can be re-activated only by placing another bet. 

**dealerRefunded**
This modifier is designed for the contract deployer, which is also the dealer. It enforces that only after the player's balance has been refunded, 
and the game be played by another player. 


## 4. User Interface








