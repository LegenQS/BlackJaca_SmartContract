// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract BlackJack {
  mapping(address =>uint256) public playerBalance;
    address payable dealerWallet;
    address payable playerWallet = msg.sender;
    uint256 public playerScore;
    uint256 public dealerScore;
    uint256 internal betValue;
    string public insurance_text;
    uint internal insuranceValue;
    bool internal standFlag = false;
    bool internal betPlaced = false;
    bool internal gameInactive = false;
    bool internal insuranceAvailable = false;
    bool internal insurancePaid = false;
    uint internal randNonce = 0;
    bool public hit_sign = false;
    bool public stand_sign = false;
    bool public placeBet_sign = false;
    uint public paybackBalance = 0;
    bool public player_cashout = false;
    
    event MoneyFlow(
        address _from,
        address _to,
        uint256 amount
    );

    event showFirstHand(
        uint playerFirstCard,
        uint playerSecondCard,
        uint dealerFirstCard
    );
    event showPlayerCard(
        uint playerCard,
        uint playerTotalScore
    );

    event showDealerCard(
        uint dealerCard,
        uint dealerTotalScore
    );

    event dealerBust(
        string status
    );

    event tie(
        string status
    );

    event dealerWon(
        string status
    );

    event playerWon(
        string status
    );
    event debug(
        bool betPlaced
    );

    modifier enoughBalance () {
        require(betValue <= playerBalance[msg.sender],"You don't have enough balance.");
        _;
    }

    modifier gameActive (){
        require(gameInactive == false, "Current game is ended, place bet to start a new game.");
        _;
    }

    modifier notBust () {
        require(playerScore < 21, "Already busted, do not hit");
        _;
    }

    modifier nonStand (){
        require(standFlag == false, "You already standed, cannot hit.");
        _;
    }

    modifier betNotPlaced (){
        require(betPlaced == false, "You haven't placed a bet");
        _;
    }

    constructor() public{
        dealerWallet = msg.sender;
    }

    
    function payInsurance() public {
        insurance_text = "Insurance not available now";
        require(insuranceAvailable == true, "Insurance not available now");
        insurance_text = "Insurance is already paid.";
        require(insurancePaid == false, "Insurance is already paid.");
        if (betValue % 2 ==0){
            insuranceValue = betValue / 2;
        } 
        else{
            insuranceValue = (betValue+1)/2;
        }

        insurance_text = "Not enough balance to pay for insurance.";
        require(insuranceValue <= playerBalance[msg.sender], "Not enough balance to pay for insurance.");

        insurance_text = "Insurance is paid";
        playerBalance[msg.sender] -= insuranceValue;
        insurancePaid = true;
    }

    function randomNumber() internal returns(uint){
        randNonce++; 
        uint temp = uint(keccak256(abi.encodePacked(now,msg.sender,randNonce)))%13;
        temp += 1;
        if (temp>=10){
            return 10;
        } 
        else{
            return temp;
        }
 
    }

    function placeDeposit() external payable {
        // buy number of tokens equal to the number of ethers sent
        // require(msg.value > _limit, 'not enough!');
        playerBalance[msg.sender] += msg.value/1000000000000000000;
        // send ethers to dealer's wallet
        dealerWallet.transfer(msg.value);
        emit MoneyFlow(msg.sender, dealerWallet, msg.value/1000000000000000000);

        stand_sign = false;
        hit_sign = false;
        placeBet_sign = false;
        player_cashout = false;
        paybackBalance = 0;
        insurance_text = '';
    }

    // function placeDeposit(uint _values) external payable {
    //     // buy number of tokens equal to the number of ethers sent
    //     playerBalance[msg.sender] += _values/1000000000000000000;
    //     // send ethers to dealer's wallet
    //     dealerWallet.transfer(_values);
    //     // emit MoneyFlow(msg.sender, dealerWallet, _values/1000000000000000000);
    // }

    function setBetValue(uint256 _betValue) public {
        betValue = _betValue; 
    }

    function placeBet() public enoughBalance betNotPlaced returns(uint256, uint256, uint256){
        gameInactive = false;
        betPlaced = true;
        playerBalance[msg.sender] -= betValue;
        uint temp1 = playerDrawCard();
        uint temp2 = playerDrawCard();
        uint temp3 = dealerDrawCard();
        emit showFirstHand(temp1, temp2, temp3);

        if ((temp1 == 1 && temp2 == 10)||(temp1==10 && temp2 == 1) ){
            emit playerWon("Player Black Jack, 3 times bet value transferred to balance");
            playerBalance[msg.sender] += 3*betValue;
            // initialize the game
            gameInactive = true;
            betPlaced = false;
            playerScore = 0;
            dealerScore = 0;
            standFlag = false;
        }

        if (temp3 == 1){
            insuranceAvailable = true;
        }

        placeBet_sign = true;
        return (playerBalance[msg.sender],playerScore, dealerScore);

    }

    function playerDrawCard() internal notBust returns(uint){
        uint score = randomNumber();
        playerScore += score;
        // emit showPlayerCard(score, playerScore);
        return score;
    }

    function dealerDrawCard() internal notBust returns(uint){
        uint score = randomNumber();
        dealerScore += score;
        return score;
    }

    function hit() public notBust nonStand gameActive returns(uint256){
        uint temp = playerDrawCard();
        emit showPlayerCard(temp,playerScore);

        if (playerScore>21){
            emit dealerWon("Player busted");
            gameInactive = true;
            betPlaced = false;
            playerScore = 0;
            dealerScore = 0;
            standFlag = false;
            insurancePaid = false;
            insuranceAvailable = false; 
            emit debug(betPlaced);
        }
        hit_sign = true;
    }

    function stand() public gameActive {
        standFlag = true;
        uint dealerSecondCard = dealerDrawCard();
        if (dealerSecondCard == 10 && insurancePaid == true ){
            playerBalance[msg.sender] += 2 * insuranceValue;
            gameInactive = true;
            betPlaced = false;
            playerScore = 0;
            dealerScore = 0;
            standFlag = false;
            insurancePaid = false;
            insuranceAvailable = false; 
        }

        while (dealerScore < 17){
            uint temp = dealerDrawCard();
            emit showDealerCard(temp,dealerScore);
        }
        while (dealerScore < playerScore){
            uint temp = dealerDrawCard();
            emit showDealerCard(temp,dealerScore);
        }
        if (dealerScore > 21) {
            emit dealerBust("Dealer busted, 2 times bet value transferred to balance");
            gameInactive = true;
            betPlaced = false;
            playerScore = 0;
            dealerScore = 0;
            standFlag = false;
            insurancePaid = false;
            insuranceAvailable = false; 
            // 最后 cash out 按照balance余额退还
            playerBalance[msg.sender] += 2 * betValue;
            emit debug(betPlaced);
        } else if (dealerScore == playerScore) {
            emit tie("Tie, bet value transferred to balance");
            gameInactive = true;
            betPlaced = false;
            playerScore = 0;
            dealerScore = 0;
            standFlag = false;
            insurancePaid = false;
            insuranceAvailable = false; 
            // 最后 cash out 按照balance余额退还
            playerBalance[msg.sender] += betValue;
            emit debug(betPlaced);
        } else if (dealerScore > playerScore){
            emit dealerWon("Dealer won");
            gameInactive = true;
            betPlaced = false;
            playerScore = 0;
            dealerScore = 0;
            standFlag = false;
            insurancePaid = false;
            insuranceAvailable = false; 
            emit debug(betPlaced);
        }
        stand_sign = true;
    }

    function cashOut(address payable _cashOutAddress) payable public {
        gameInactive = true;
        require(gameInactive == true, "Plase end this game first, then cash out");
        // this balance is checked by dealer by calling playerBalance
        _cashOutAddress.transfer(msg.value);
        playerBalance[_cashOutAddress] = 0;
    }
    
    function testAddress() public view returns(address){
        return dealerWallet;
    }

    // help functions
    function playercardstatus() public view returns(uint){
        return playerScore;
    }

    function dealercardstatus() public view returns(uint){
        return dealerScore;
    }

    function player_balance() public view returns(uint256){
        return playerBalance[msg.sender];
    }

    function helper_stand() public view returns(bool){
        return stand_sign;
    }

    function helper_hit() public view returns(bool){
        return hit_sign;
    }

    function helper_placeBet() public view returns(bool){
        return placeBet_sign;
    }

    function helper_payinsurance() public view returns(string memory){
        return insurance_text;
    }

    function helper_dealer_check(address _paybackaddr) public {
        paybackBalance =  playerBalance[_paybackaddr];
    }

    function get_payer_balance() public view returns(uint) {
        return paybackBalance;
    }

    function player_click_cash_out() public {
        player_cashout = true;
    }

    function get_player_status() public view returns(bool) {
        return player_cashout;
    }
}
