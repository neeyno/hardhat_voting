require("@nomiclabs/hardhat-waffle");
require('dotenv').config({ path: '.env' })
require('./tasks/voting-task')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

//

module.exports = {
  solidity: "0.8.0",
  paths: {
    dotenv: "/.env"
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    rinkeby: {
      url: process.env.INFURA_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
