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

        it("should set the right owner", async () => {
            expect(await voting.owner()).to.equal(owner.address);
        })
    });

    describe("Elections", () => {
        it("should create a new election", async function () {
            const election = await voting.newElection("electionN1")
            console.log(election)
            //expect().to.eq(1);
        })
        //it should create a new election
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