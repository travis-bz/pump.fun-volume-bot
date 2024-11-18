const { ComputeBudgetProgram, Keypair } = require('@solana/web3.js');
const { Connection, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } = require('@solana/web3.js');
const bs58 = require('bs58');

async function getKeyPairFromPrivateKey(key) {
    return Keypair.fromSecretKey(
        new Uint8Array(bs58.decode(key))
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createTransaction(connection, instructions, payer, priorityFeeInSol = 0) {
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 1000000,
    });

    const transaction = new Transaction().add(modifyComputeUnits);

    if (priorityFeeInSol > 0) {
        const microLamports = priorityFeeInSol * 1_000_000_000; // convert SOL to microLamports
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports,
        });
        transaction.add(addPriorityFee);
    }

    transaction.add(...instructions);

    transaction.feePayer = payer;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    return transaction;
}

async function sendAndConfirmTransactionWrapper(connection, transaction, signers) {
    try {
        const signature = await sendAndConfirmTransaction(connection, transaction, signers, { skipPreflight: true, preflightCommitment: 'confirmed' });
        // console.log('Transaction confirmed with signature:', signature);
        return signature;
    } catch (error) {
        console.error('Error sending transaction:', error);
        return null;
    }
}

function bufferFromUInt64(value) {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(value));
    return buffer;
}

module.exports = { getKeyPairFromPrivateKey, createTransaction, sendAndConfirmTransactionWrapper, bufferFromUInt64, sleep }
