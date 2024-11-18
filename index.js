require('dotenv').config();

const { pumpFunBuy, pumpFunSell} = require('./src/swap');

const wallets = JSON.parse(process.env.WALLETS)

console.log(wallets)

const mintAddress = process.env.MINT_ADDRESS; // Replace with actual token mint address 

async function executeTrade() {

    let swap_data = {
        mintAddress: mintAddress,
        solIn: 0.001,
        slippageDecimal: 0.25,
        priorityFeeInSol: 0.0001,
        wallets: wallets
    }

    try {
                await pumpFunBuy(swap_data); // Remove comment to enable buy
    
                // await pumpFunSell(swap_data); // Remove comment to enable sell

    } catch (error) {
        console.error(`Error in executing trade`, error);
    }
}

executeTrade()


