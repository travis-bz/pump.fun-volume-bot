const { Connection, LAMPORTS_PER_SOL, Keypair, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const { getKeyPairFromPrivateKey, createTransaction, sendAndConfirmTransactionWrapper, bufferFromUInt64 } = require('./utils');
const getCoinData = require('./api');
const { GLOBAL, FEE_RECIPIENT, SYSTEM_PROGRAM_ID, RENT, PUMP_FUN_ACCOUNT, PUMP_FUN_PROGRAM, ASSOC_TOKEN_ACC_PROG } = require('./constants');
const { getTokenBalance } = require('./getTokenBal');
require('dotenv').config;

async function pumpFunBuy(swap_data) {

    const { mintAddress, solIn, priorityFeeInSol, slippageDecimal, wallets} = swap_data

    console.log("Mint", mintAddress);
    console.log("solIn", solIn);
    console.log("PriorityFee", priorityFeeInSol);
    console.log("Slippage", slippageDecimal);

    const connection = new Connection(
        // clusterApiUrl("mainnet-beta"),
        process.env.HELIUS,
        'confirmed'
    );

    let initialSlot = await connection.getSlot();

    console.log(wallets)

    wallets.forEach((wallet, index) => { 
        setTimeout(() => { 

            executeTrade(wallet); 

        }, index * 500); }
    );
    
    async function executeTrade(payerPrivateKey){

        try {
    
            const coinData = await getCoinData(mintAddress);
            if (!coinData) {
                console.error('Failed to retrieve coin data...');
                return;
            }
    
            const payer = await getKeyPairFromPrivateKey(payerPrivateKey);
            const owner = payer.publicKey;
            const mint = new PublicKey(mintAddress);
    
            console.log("Wallet", new PublicKey(owner).toBase58());
    
            const txBuilder = new Transaction();
    
            const tokenAccountAddress = await getAssociatedTokenAddress(
                mint,
                owner,
                false
            );
    
            const tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);
    
            let tokenAccount;
    
            if (!tokenAccountInfo) {
                txBuilder.add(
                    createAssociatedTokenAccountInstruction(
                        payer.publicKey,
                        tokenAccountAddress,
                        payer.publicKey,
                        mint
                    )
                );
                tokenAccount = tokenAccountAddress;
            } else {
                tokenAccount = tokenAccountAddress;
            }
    
            const solInLamports = solIn * LAMPORTS_PER_SOL;
            const tokenOut = Math.floor(solInLamports * coinData["virtual_token_reserves"] / coinData["virtual_sol_reserves"]);
    
            const solInWithSlippage = solIn * (1 + slippageDecimal);
            const maxSolCost = Math.floor(solInWithSlippage * LAMPORTS_PER_SOL);
            const ASSOCIATED_USER = tokenAccount;
            const USER = owner;
            const BONDING_CURVE = new PublicKey(coinData['bonding_curve']);
            const ASSOCIATED_BONDING_CURVE = new PublicKey(coinData['associated_bonding_curve']);
    
            const keys = [
                { pubkey: GLOBAL, isSigner: false, isWritable: false },
                { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
                { pubkey: mint, isSigner: false, isWritable: false },
                { pubkey: BONDING_CURVE, isSigner: false, isWritable: true },
                { pubkey: ASSOCIATED_BONDING_CURVE, isSigner: false, isWritable: true },
                { pubkey: ASSOCIATED_USER, isSigner: false, isWritable: true },
                { pubkey: USER, isSigner: false, isWritable: true },
                { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                { pubkey: RENT, isSigner: false, isWritable: false },
                { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
                { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false },
            ];
    
            const data = Buffer.concat([
                bufferFromUInt64("16927863322537952870"),
                bufferFromUInt64(tokenOut),
                bufferFromUInt64(maxSolCost)
            ]);
    
            const instruction = new TransactionInstruction({
                keys: keys,
                programId: PUMP_FUN_PROGRAM,
                data: data
            });
            txBuilder.add(instruction);
    
            const transaction = await createTransaction(connection, txBuilder.instructions, payer.publicKey, priorityFeeInSol);

            // Wait for the slot height to change
            console.log("Init Slot", initialSlot)

            let currentSlot = await connection.getSlot();
            while (currentSlot === initialSlot) {
                await new Promise(resolve => setTimeout(resolve, 500)); // Adjust the delay as needed
                console.log("Checking current slot")
                currentSlot = await connection.getSlot();
            }

            initialSlot = currentSlot;

            console.log("Cur Slot", currentSlot)

            const signature = await sendAndConfirmTransactionWrapper(connection, transaction, [payer]);
            console.log('Buy transaction confirmed:', signature);
    
        } catch (error) {
            console.log(error);
        }
    }

}

async function pumpFunSell(swap_data) {

    const { mintAddress, priorityFeeInSol, slippageDecimal, wallets} = swap_data
    
    try {
        const connection = new Connection(
            process.env.HELIUS,
            'confirmed'
        );

        let initialSlot = await connection.getSlot();

        wallets.forEach((wallet, index) => { 
            setTimeout(() => { 
    
                executeTrade(wallet); 
    
            }, index * 500); }
        );

        async function executeTrade(payerPrivateKey){

        const coinData = await getCoinData(mintAddress);
        if (!coinData) {
            console.error('Failed to retrieve coin data...');
            return;
        }

        const payer = await getKeyPairFromPrivateKey(payerPrivateKey);
        const owner = payer.publicKey;
        const mint = new PublicKey(mintAddress);
        const txBuilder = new Transaction();
        const wallet = new PublicKey(owner).toBase58();

        console.log("Wallet", new PublicKey(owner).toBase58());

        const tokenBalance = await getTokenBalance(wallet, mint)

        console.log("Mint", mintAddress);
        console.log("Tkn Amt", tokenBalance);
        console.log("PriorityFee", priorityFeeInSol);
        console.log("Slippage", slippageDecimal);

        if(tokenBalance === 0){ 
            console.log("Insufficient Token Bal")
            return }; 

        const tokenAccountAddress = await getAssociatedTokenAddress(
            mint,
            owner,
            false
        );

        const tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);

        let tokenAccount;

        if (!tokenAccountInfo) {
            txBuilder.add(
                createAssociatedTokenAccountInstruction(
                    payer.publicKey,
                    tokenAccountAddress,
                    payer.publicKey,
                    mint
                )
            );
            tokenAccount = tokenAccountAddress;
        } else {
            tokenAccount = tokenAccountAddress;
        }

        const minSolOutput = Math.floor(tokenBalance * (1 - slippageDecimal) * coinData["virtual_sol_reserves"] / coinData["virtual_token_reserves"]);

        const keys = [
            { pubkey: GLOBAL, isSigner: false, isWritable: false },
            { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: new PublicKey(coinData['bonding_curve']), isSigner: false, isWritable: true },
            { pubkey: new PublicKey(coinData['associated_bonding_curve']), isSigner: false, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: owner, isSigner: false, isWritable: true },
            { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ASSOC_TOKEN_ACC_PROG, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false }
        ];

        const data = Buffer.concat([
            bufferFromUInt64("12502976635542562355"),
            bufferFromUInt64(tokenBalance),
            bufferFromUInt64(minSolOutput)
        ]);

        const instruction = new TransactionInstruction({
            keys: keys,
            programId: PUMP_FUN_PROGRAM,
            data: data
        });
        txBuilder.add(instruction);

        const transaction = await createTransaction(connection, txBuilder.instructions, payer.publicKey, priorityFeeInSol);

            // Wait for the slot height to change
            console.log("Init Slot", initialSlot)

            let currentSlot = await connection.getSlot();
            while (currentSlot === initialSlot) {
                await new Promise(resolve => setTimeout(resolve, 500)); // Adjust the delay as needed
                console.log("Checking current slot")
                currentSlot = await connection.getSlot();
            }

            initialSlot = currentSlot;

            console.log("Cur Slot", currentSlot);

        const signature = await sendAndConfirmTransactionWrapper(connection, transaction, [payer]);
        console.log('Sell transaction confirmed:', signature);

    }
}
    catch (error) {
        console.log(error)
    }
}

module.exports = {pumpFunBuy, pumpFunSell}