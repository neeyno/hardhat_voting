// contract deployed to the following address (rinkeby testnet)
const ContractAddress = '0x7fd9E3a9F49D47b67871a66DAADec731e5613451'

//npx hardhat add_voting --name "TEST" --network rinkeby 
task("add_voting", "Adds a new voting")
  .addParam("name", "The Voting's name")
  .setAction(async (taskArgs) => {
    const votingName = (taskArgs.name).toString();

    const signer = await hre.ethers.getSigners();
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(ContractAddress);

    await voting.addVoting(votingName);
    //const num = await voting.numVotings();
    //const getVoting = await voting.getVoting(num);

    console.log('The Voting has been added!');
    /*console.log(`
    Id: ${num}
    Name: ${getVoting[1]}
    End time: ${getVoting[4]}`); */
  });

//npx hardhat vote --votingid 1 --candid 1 --network rinkeby
task("vote", "Vote for a candidate")
  .addParam("votingid", "Voting id")
  .addParam("candid", "Candidate id")
  .setAction(async ({ votingid, candid }) => {

    const signer = await hre.ethers.getSigners();
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(ContractAddress);

    await voting.vote(votingid, candid, { value: ethers.utils.parseEther("0.01") });
    console.log('Your vote was counted!');
  });

//npx hardhat finish --votingid 1 --network rinkeby
task("finish", "Finishes chosen voting")
  .addParam("votingid", "Voting id")
  .setAction(async ({ votingid }) => {

    const signer = await hre.ethers.getSigners();
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(ContractAddress);

    await voting.finishVoting(votingid);
    const getVoting = await voting.getVoting(votingid);
    const winner = await voting.candidates(getVoting[3]);

    console.log(`Voting id: ${votingid} is finished!`);
    console.log(`
    Id: ${votingid}
    Voting: ${getVoting[1]}
    Winner: ${winner.name}
    Participants: ${getVoting[2]}`);
  });

//npx hardhat add_candidate  --name "First Candidate" --address 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --network rinkeby
task("add_candidate", "Adds a new candidate")
  .addParam("name", "Candidate's name")
  .addParam("address", "Candidate's address")
  .setAction(async ({ name, address }) => {

    const signer = await hre.ethers.getSigners();
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.attach(ContractAddress);

    await voting.addCandidate(name, address);
    //const num = await voting.numCandidates()
    //const getCandidate = await voting.candidates(num)

    console.log('Candidate has been added!');
    /*console.log(`
    id: ${num}
    Name: ${getCandidate.name}
    Address: ${getCandidate.candidateAddr}`)*/
  });

//npx hardhat candidates --network rinkeby
task("candidates", "Prints the list of candidates", async () => {

  const signer = await hre.ethers.getSigners();
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.attach(ContractAddress);
  const candidatesCount = await voting.numCandidates();

  console.log('List of candidates:');
  for (i = 1; i <= candidatesCount; i += 1) {
    const getCandidate = await voting.candidates(i);
    console.log(`
    Id: ${i}
    Name: ${getCandidate.name}
    Address: ${getCandidate.candidateAddr}`);
  }
});

//npx hardhat votings --network rinkeby
task("votings", "Prints the list of active votings", async () => {

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.attach(ContractAddress);
  const numVotings = await voting.numVotings();

  console.log('List of active votings:');
  for (i = 1; i <= numVotings; i += 1) {
    //const getVoting = await voting.getVoting(i);
    const getVoting = await voting.getVoting(i);
    if (getVoting[5] == false) {
      console.log(`
      Id: ${i}
      Name: ${getVoting[1]}
      End time: ${getVoting[4]}
      Participants: ${getVoting[2]}`)
    }
  }
});

module.exports = {};