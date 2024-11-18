# Solana Pump Fun Volume Bot

Notice: This project was inspired by https://github.com/bilix-software/solana-pump-fun.git and modified for it for trading from multiple wallets as a volume bot.

Also, modified the code to make it execute the trade from each wallet to land on distinct slot numbers to not to identified the transaction as bot on pump.fun trades.

Solana Pump Fun is an open-source package designed to facilitate the execution and simulation of buy and sell transactions for pump.fun on the Solana blockchain. This tool is useful for developers and enthusiasts looking to understand transaction mechanics and resource consumption on Solana.

Services are for hire, contact me at https://t.me/travis_bz

## Features

- Simulates buy and sell transactions for pump.fun on the Solana blockchain from multiple wallets.
- Executes buy and sell transactions for pump.fun on the Solana blockchain on different slots.
- Provides detailed logs of transaction steps and resource consumption.
- Easy to use and integrate into existing projects.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or later)
- [npm](https://www.npmjs.com/)

## Installation

To install the package, clone the repository and install the dependencies:

```bash
git clone https://github.com/travis-bz/pump.fun-volume-bot.git
cd pump.fun-volume-bot
npm install
```

## Configuration

Before running the simulation, you need to set up your private key and specify the token mint. Open the `example.env` file and replace the placeholder values with your actual private keys, RPC and token mint address.

## Usage

index.js file
![alt text](image.png)

Remove comment of the swap you want to execute (buy or sell)

```bash
npm start
```

3. Run the compiled JavaScript file:

```bash
node index.js
```

### Example Output

Below is an example of the output generated when running the code with 

![Example Output](image-1.png)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

TG: travis_bz | Discord: travis_bz
