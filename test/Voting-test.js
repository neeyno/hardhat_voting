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
            await voting.addCandidate("testCandidate", addr1.address);
            tx1 = await voting.connect(addr2).vote(1, 1, { value: ethers.utils.parseEther("0.01") });
            //console.log();
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
            const getFund = await voting.elections(1);
            // checking Election data difference
            expect(tx1.value).to.eq(contractBalance);
            expect(contractBalance).to.eq(getFund.winnerFund);
        })

        it("should allow to vote only once", async function () {
            // sending the same tx
            await expect(voting.connect(addr2).vote(1, 1, { value: ethers.utils.parseEther("0.01") })
            ).to.be.revertedWith("You can vote only once!");
        })

        it("should check election duration", async function () {
            await expect(voting.connect(addr2).endElection(1)).to.be.revertedWith("Election has not done yet!");
            await network.provider.send("evm_increaseTime", [259140]);// 3days
            await network.provider.send("evm_mine");
            await expect(voting.connect(addr2).endElection(1)).to.be.revertedWith("Election has not done yet!");
        })

        it("stops an election", async function () {
            //skipping 3 days
            await network.provider.send("evm_increaseTime", [259200]);
            await network.provider.send("evm_mine");
            // stopping the election
            await voting.connect(addr2).endElection(1);
            //trying to vote in stopped election
            await expect(voting.connect(addr3).vote(1, 1, { value: ethers.utils.parseEther("0.01") })
            ).to.be.reverted;

        })

        it("should transfer winner fund", async function () {
            //skipping 3 days
            await network.provider.send("evm_increaseTime", [259200]);
            await network.provider.send("evm_mine");
            //checking winner balance
            const getFund1 = await voting.elections(1);
            const afterFee = (getFund1.winnerFund * 9) / 10; //90% of fund
            await expect(await voting.connect(addr2).endElection(1))
                .to.changeEtherBalance(addr1, afterFee);
            // cheking winner name
            const winner = await voting.getElection(1);
            expect(winner[3]).to.equal("testCandidate");
        })

        it("shoild withdraw owner fund", async function () {
            //skipping 3 days
            await network.provider.send("evm_increaseTime", [259200]);
            await network.provider.send("evm_mine");
            await voting.connect(addr2).endElection(1);

            //  withdraw: not owner - should be reverted
            await expect(voting.connect(addr2).withdraw()).to.be.revertedWith("only Owner");
            //  withdraw successfully: owner account
            const balanceBefore = await ethers.provider.getBalance(voting.address);
            await expect(() => voting.withdraw())
                .to.changeEtherBalance(owner, balanceBefore);
            const balanceAfter = await ethers.provider.getBalance(voting.address);
            expect(balanceAfter).to.equal(0);

        })
        // should transfer 90%winnerFund to an election winner
        // should transfer 10%fee to owner
    })
})