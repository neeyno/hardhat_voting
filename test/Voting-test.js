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
            await voting.newElection("electionN1");
            await voting.addCandidate("testName", addr1.address);
            // getElection = await voting.elections(1);
            tx1 = await voting.connect(addr2).vote(1, 1, { value: ethers.utils.parseEther("0.01") });
            //console.log(tx1);
        });

        it("creates a new election", async function () {
            //await voting.newElection("electionN1");
            const getElection = await voting.elections(1);
            expect(getElection.electionName).to.eq("electionN1");
            expect(getElection.electId).to.eq(1);
        })


        it("should check a candidate", async function () {
            //await voting.addCandidate("testName", addr1.address);
            const candi1 = await voting.candidates(1);
            expect(candi1.candidateAddress).to.eq(addr1.address);
        })

        it("performs a vote", async function () {
            const contractBalance = await ethers.provider.getBalance(voting.address);
            const getElection = await voting.elections(1);

            expect(tx1.value).to.eq(contractBalance);
            expect(contractBalance).to.eq(getElection.winnerFund)
        })
    })



    // test vote
    // should allow to vote only once
    // shoulr require 0,01 Eth to vote
    //

    // test endElection
    // should define a winner of election
    // should transfer 90%winnerFund to an election winner
    // should transfer 10%fee to owner
});