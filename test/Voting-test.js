const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting contract", function () {
    let Voting, voting, addr1, addr2, addr3, owner;

    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        Voting = await ethers.getContractFactory("Voting", owner);
        voting = await Voting.deploy();
        await voting.deployed();
    });

    describe("Deployment", () => {
        it("should be deployed", async function () {
            expect(voting.address).to.be.properAddress;
        })

        it("should set the right owner", async function () {
            expect(await voting.owner()).to.equal(owner.address);
        })
    });

    describe("Election", () => {

        beforeEach(async function () {
            // create election, add candidate, send vote tx
            await voting.newElection("electionN1");
            await voting.addCandidate("testName", addr1.address);
            tx1 = await voting.connect(addr2).vote(1, 1, { value: ethers.utils.parseEther("0.01") });
            //console.log(tx1);
        });

        it("creates a new election", async function () {
            const getElection = await voting.elections(1);

            expect(getElection.electionName).to.eq("electionN1");
            expect(getElection.electId).to.eq(1);
        })

        it("requires correct Eth value to vote", async function () {
            // send tx with incorrect Eth value 0.012
            await expect(voting.connect(addr3).vote(1, 1, { value: ethers.utils.parseEther("0.012") })).to.be.revertedWith("Vote costs 0.01 ETH");
        })

        it("should check that election exists", async function () {
            // sending tx with Election that doesn't exist
            await expect(voting.connect(addr2).vote(2, 1, { value: ethers.utils.parseEther("0.01") })).to.be.revertedWith("Invalid Election!");
        })

        it("should check that candidate exists", async function () {
            const candi1 = await voting.candidates(1);
            // candidate 1 exists, candidate 2 doesn't
            expect(candi1.candidateAddress).to.eq(addr1.address);
            await expect(voting.connect(addr2).vote(1, 2, { value: ethers.utils.parseEther("0.01") })).to.be.revertedWith("Invalid Candidate!");
        })

        it("performs a vote", async function () {
            const contractBalance = await ethers.provider.getBalance(voting.address);
            const getElection = await voting.elections(1);
            // checking Election data difference
            expect(tx1.value).to.eq(contractBalance);
            expect(contractBalance).to.eq(getElection.winnerFund)
        })

        it("should allow to vote only once", async function () {
            // sending the same tx
            await expect(voting.connect(addr2).vote(1, 1, { value: ethers.utils.parseEther("0.01") })
            ).to.be.revertedWith("You can vote only once!")
        })

    })

    // test endElection
    // should define a winner of election
    //should check election duration
    // should transfer 90%winnerFund to an election winner
    // should transfer 10%fee to owner
});