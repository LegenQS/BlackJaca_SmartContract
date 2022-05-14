import React, { useState, useEffect } from 'react';
import getBlockchain from '../../configs/ethereum.js'
import campusImg from '../../assert/21.jpg'
import './index.css'
import { ethers } from 'ethers'
// import { useSnackbar } from 'react-simple-snackbar'

function Main() {
    const [like_contract, set_like_contract] = useState(undefined);
    const [playeraddr, setplayeraddr] = useState(undefined);
    const [dealeraddr, setdealeraddr] = useState(undefined);
    const [playerbalance, setplayerbalance] = useState(undefined);
    const [playerscore, setplayerscore] = useState(undefined);
    const [dealerscore, setdealerscore] = useState(undefined);
    const [BALANCE, setBALANCE] = useState(undefined);

    useEffect(() => {
        const init = async () => {
            const { like_contract } = await getBlockchain();
            const Pscore = await like_contract.playercardstatus();
            const Dscore = await like_contract.dealercardstatus();
            const Balance = await like_contract.player_balance();


            set_like_contract(like_contract);
            setplayeraddr(0);
            setplayerbalance(Balance);
            setplayerscore(Pscore);
            setdealerscore(Dscore);
            setBALANCE(0);
        };
        init();
    }, []);

    const updateDealerAddress = async () => {
        console.log(typeof dealeraddr)
        if (typeof dealeraddr == 'undefined'){
            const add = await like_contract.testAddress();
            setdealeraddr(add);
        }
        else{
            setdealeraddr(undefined);
        }        

    };

    const updateBalance = async () => {
        const tx = await like_contract.player_balance();
        console.log(tx);
        setplayerbalance(tx);
    };

    
    const PlaceInput_Deposit = async () => {
        var inputDeposit = document.getElementById('mydeposit').value;
        // var a = document.getElementById('myoutput')
        inputDeposit = parseInt(inputDeposit);
        // a.innerHTML = inputDeposit;

        const inputvalue = ethers.utils.parseEther(inputDeposit.toString());
        console.log(inputvalue)
        console.log('请求前')
        await (await like_contract.placeDeposit({value: inputvalue})).wait();
  
        console.log('请求后')
        return false;
    };

    const PlaceInput_Bet = async () => {
        var inputBet = document.getElementById('mybet').value;
        inputBet = parseInt(inputBet);

        console.log(inputBet)
        console.log('请求前')
        await like_contract.setBetValue(inputBet);
  
        console.log('请求后')
        return false;
    };

    const updatePlayerScore = async () => {
        const tx = await like_contract.playercardstatus();
        setplayerscore(tx);
    };

    const updateDealerScore = async () => {
        const tx = await like_contract.dealercardstatus();
        setdealerscore(tx);
    };

    const updatePlaceBet = async () => {
        console.log('waiting for response')
        await (await like_contract.placeBet()).wait;
        console.log('admitted')
    };

    const PayInsurance = async () => {
       await (await like_contract.payInsurance()).wait;
       const tx =  await like_contract.helper_payinsurance();
       console.log(tx);
    };

    const hit = async () => {
        console.log('waiting for response')
        await (await like_contract.hit()).wait;
        console.log('admitted')
        getresult();
    };

    const stand = async () => {
        console.log('waiting for response')
        await (await like_contract.stand()).wait;
        console.log('admitted')
        getresult();
    };

    if (typeof like_contract === 'undefined' || typeof playeraddr === 'undefined') {
        return 'Loading...';
    }

    const getresult = async () => {
        const cur_score = await like_contract.playercardstatus();
        var text = document.getElementById("result");
        if (cur_score > 0) {
            text.innerText = 'You are still in the game, you can hit or stand.';
            return false;
        }
        
        const pre_balance = playerbalance;
        const cur_balance = await like_contract.player_balance();
        console.log('current balance ' + cur_balance);
        console.log('previous balance ' + pre_balance)
        if (cur_balance > pre_balance) {
            text.innerText = 'You Win!!! Your new balance is ' + parseInt(cur_balance) + '. You can now choose to cash out to leave the game or set bet to start a new turn.';
        }
        else if (cur_balance < pre_balance){
            if (cur_balance > 0) {
                text.innerText = 'You Lose!!! Your remain balance is ' + parseInt(cur_balance) + '. You can now start a new turn';
            }
            else {
                text.innerText = 'You Lose!!! Your remain balance is ' + parseInt(cur_balance) + '. You should place deposit before restarting the game';
            }
        }
        else {
            text.innerText = '';
        }
    };

    const payBackCheck = async () =>{
        var inputAddr = document.getElementById('myaddress').value;
        
        if (inputAddr.length != 42) {
            await (await like_contract.player_click_cash_out()).wait();
            return false;
        }

        const click_cashout = await like_contract.get_player_status();

        if (click_cashout == false) {
            return false;
        }

        console.log('waiting for response')
        const tx = await like_contract.helper_dealer_check(inputAddr);
        await tx.wait();

        var remainBalance = await like_contract.get_payer_balance();
        console.log(remainBalance);
        setBALANCE(remainBalance);

        remainBalance = ethers.utils.parseEther(remainBalance.toString());
        // now pay back
        await (await like_contract.cashOut(inputAddr, { value: remainBalance })).wait();
        console.log(remainBalance);
        console.log('admitted')
        return false;
    };

    return (
        <div className='container'>
            <h1>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>{'Welcome to BlackJack!'}</b>
            </h1>
            <div className='row'>
                <div className='col-md-6'>
                    <div className="middleBox">
                            
                        <div className='btn-group'>
                            <textarea id='mydeposit' cols="12" rows="1" defaultValue='1 (ether)'></textarea>
                            <button
                                className="btn btn-danger"
                                onClick={PlaceInput_Deposit}
                            >
                                {'Place Deposit'}
                            </button>
                                
                                {/* <input type="button" value="place"  name="submit" onClick={PlaceInput_Deposit}/> */}
                            <textarea id='mybet' cols="12" rows="1" defaultValue='1 (token)'></textarea>
                            <button
                                className="btn btn-danger"
                                onClick={PlaceInput_Bet}
                            >
                                {'Set Bet'}
                            </button>

                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            {/* <input type="button" value="place"  name="submit" onClick={PlaceInput_Bet}/> */}
                  
                            <button
                                className="btn btn-danger"
                                onClick={updatePlaceBet}
                            >
                                {'Place Bet'}
                            </button>
                            
                        
                            <button
                                className="btn btn-danger"
                                onClick={hit}
                            >
                                {'Hit'}
                            </button>
                       
                            <button
                                className="btn btn-danger"
                                onClick={stand}
                            >
                                {'Stand'}
                            </button>
                        
                            <button
                                className="btn btn-danger"
                                onClick={PayInsurance}
                            >
                                {'Pay Insurance'}
                            </button>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <button
                                className="btn btn-danger"
                                onClick={updatePlayerScore}
                            >
                                {'Player Score'}
                            </button>
                            {'Your Score: ' + parseInt(playerscore)}

                            &nbsp;&nbsp;&nbsp;
                            <button
                                className="btn btn-danger"
                                onClick={updateDealerScore}
                            >
                                {'Dealer Score'}
                            </button>
                            {'Dealer Score: ' + parseInt(dealerscore)}

                            </div>

                    </div>
                    <p></p>
                </div>
                <div className="imgBox">
                    <img src={campusImg} alt="img" height='500px' width='500px'/>
                </div>
            </div>
            <div class='btn-group'>
                
                <div class="btn-group-vertical">
                    <p></p>
                    <button
                            className="btn btn-danger"
                            onClick={updateBalance}
                        >
                            {'Player Balance'}
                            </button>
                        {'Your Balance ' + playerbalance.toString()}
                    
                    <p></p>
                    <button
                        className="btn btn-danger"
                        onClick={updateDealerAddress}
                        >
                            {'Dealer Address'}
                    </button>

                </div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <textarea id='result' cols="95" rows="4"></textarea>
          
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <textarea id='myaddress' cols="20" rows="1" defaultValue='e.g. Ox...'></textarea>
                <button
                                className="btn btn-danger"
                                onClick={payBackCheck}
                            >
                                {'Cash Out'}
                            </button>
                <div class='btn-group'> 
                    {'For Player, simply click "cash out" to request your money back'} <br></br>
                    <br></br>
                    {'For Dealer, input paid back address and click "cash out" to pay back'}     
                    </div>                
            </div>
            <div>
                    {dealeraddr}
                </div>
                <p></p>
        </div>
    );
}

export default Main;
