task("voting", "...task", async (taskArgs, hre) => {

  const [owner, addr1, addr2, addr3] = await hre.ethers.getSigners();
  Voting = await hre.ethers.getContractFactory("Voting", owner);
  voting = await Voting.deploy();
  await voting.deployed();
  console.log(`Voting deployed to: ${voting.address}`)

});

module.exports = {};