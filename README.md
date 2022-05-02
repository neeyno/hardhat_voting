# Voting
The voting smart contract consists of creating a new title for the vote. After that, candidates can be chosen and voted on. The cost of voting is 0.01 Eth. The owner can use the project's functionality to preload or add candidates. The voting will take place over the course of three days. After this period, any user can finish voting and define the winner.

# QuickStart
Run
1. `git clone https://github.com/neeyno/hardhat_voting`
2. `cd hardhat_voting`
3. `npm install`
4. `npx hardhat compile`
5. `npx hardhat test`

Set your `INFURA_URL` and `PRIVATE_KEY` environment variables.

```
export PRIVATE_KEY=0xd69...
export INFURA_URL=https://rinkeby.infura.io/asdf...
```

# Deploy to the testnet

`npx hardhat run scripts/deploy.js --network rinkeby`

There are several tasks available for the project:
1. `add_voting` Adds a new voting,
2. `vote` Votes for a candidate,
3. `finish` Finishes chosen voting,
4. `candidates` Prints the list of candidates,
5. `votings` Prints the list of active votings.