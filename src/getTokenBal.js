const { Connection, PublicKey } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID } = require('@solana/spl-token');
require('dotenv').config()

async function getTokenBalance(walletAddress, mintAddress) {
    const connection = new Connection(process.env.HELIUS); // You can use a different endpoint if needed
    const walletPublicKey = new PublicKey(walletAddress);
    const mintPublicKey = new PublicKey(mintAddress);

    // Find the token accounts by owner
    const tokenAccounts = await connection.getTokenAccountsByOwner(walletPublicKey, {
        mint: mintPublicKey
    });

    if (tokenAccounts.value.length === 0) {
        console.log("No token accounts found for the given mint address.");
        return 0;
    }

    // There could be multiple accounts, sum up the balances
    let totalBalance = 0;
    for (let accountInfo of tokenAccounts.value) {
        const balance = await connection.getTokenAccountBalance(accountInfo.pubkey);
        totalBalance += (balance.value.uiAmount*(10**6)) ;
    }

    return totalBalance;
}


module.exports = { getTokenBalance }
