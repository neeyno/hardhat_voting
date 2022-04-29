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

        it("should set the correct owner", async function () {
            expect(await voting.owner()).to.equal(owner.address);
        })
    });

    describe("Add a new voting", () => {
        beforeEach(async function () {
            // create a new voting
            await voting.addVoting("TestVoting1");
        });

        it("creates a new voting", async function () {
            const num = await voting.numVotings();
            const getVoting = await voting.getVoting(num);

            //expect that returned value will be equal "TestVoting1"
            expect(getVoting[1]).to.eq("TestVoting1");
        })

        it("only owner able to create a new voting", async function () {
            //call the function from address that isn't owner
            await expect(voting.connect(addr1).addVoting("TestVoting2")).to.be.revertedWith("Only Owner");
        })
    })

    describe("Voting process", () => {
        beforeEach(async function () {
            await voting.addVoting("TestVoting1");
            // add a candidate with name ("testCandidate1") and address (addr1.address)
            await voting.addCandidate("testCandidate1", addr1.address);
        })

        it("should check that voting id exists", async function () {
            // expect tx with invalid id(2) will be reverted
            await expect(voting.connect(addr1).vote(2, 1, { value: ethers.utils.parseEther("0.01") }))
                .to.be.revertedWith("Invalid id");
        })

        it("should check that candidate id exists", async function () {
            //vote with invalid candidate id (2)
            await expect(voting.connect(addr1).vote(1, 2, { value: ethers.utils.parseEther("0.01") }))
                .to.be.revertedWith("Invalid candidate id");
        })

        it("should check voting duration", async function () {
            //skip 3 days
            await network.provider.send("evm_increaseTime", [259200]);
            await network.provider.send("evm_mine");

            //expect that tx will be reverted
            await expect(voting.connect(addr1).vote(1, 1, { value: ethers.utils.parseEther("0.01") }))
                .to.be.revertedWith("Time is over");
        })

        it("requires 0.01 Eth to vote", async function () {
            // expect that tx with incorrect Eth value will be reverted
            await expect(voting.connect(addr1).vote(1, 1, { value: ethers.utils.parseEther("0") }))
                .to.be.revertedWith("0.01 Eth");
        })

        it("should vote", async function () {
            // send a proper transaction
            await voting.connect(addr1).vote(1, 1, { value: ethers.utils.parseEther("0.01") })
            const getVoting = await voting.getVoting(1)

            // expect that number of participants has increased to 1
            expect(getVoting[2]).to.eq(1);
        })

        it("allows to vote only once", async function () {
            // send the same tx twice
            await voting.connect(addr1).vote(1, 1, { value: ethers.utils.parseEther("0.01") });

            // expect that the second tx will be reverted
            await expect(voting.connect(addr1).vote(1, 1, { value: ethers.utils.parseEther("0.01") })
            ).to.be.revertedWith("You've already voted");
        })

    })

    describe("Finish Voting", () => {
        beforeEach(async function () {
            await voting.addVoting("TestVoting1");
            await voting.addCandidate("testCandidate1", addr1.address);
            // vote for the candidate(1) two times
            await voting.connect(addr1).vote(1, 1, { value: ethers.utils.parseEther("0.01") });
            await voting.connect(addr2).vote(1, 1, { value: ethers.utils.parseEther("0.01") });
            await network.provider.send("evm_increaseTime", [259200]); //skip 3 days
            await network.provider.send("evm_mine");
        })

        it("should finish voting", async function () {
            // call finish function
            await voting.connect(addr2).finishVoting(1);
            const getVoting = await voting.getVoting(1);

            //expect that value has changed to true(finished)
            expect(getVoting[5]).to.be.true;
        })

        it("should check ending timer", async function () {
            //call finish function before the timer end
            await network.provider.send("evm_increaseTime", [-60]);
            await network.provider.send("evm_mine");

            // expect that tx will be reverted
            await expect(voting.connect(addr2).finishVoting(1)).to.be.revertedWith("Await");
        })

        it("should allow to finish the voting only once", async function () {
            //call function with the same voting id(1) twice
            await voting.connect(addr2).finishVoting(1);

            //expect that 2nd tx will be reverted
            await expect(voting.connect(addr1).finishVoting(1)).to.be.revertedWith("Finished");
        })

        it("checks voting id", async function () {
            // sending tx with invalid id (2)
            await expect(voting.connect(addr1).finishVoting(2)).to.be.revertedWith("Invalid id");
        })

        it("defines a winner", async function () {
            await voting.finishVoting(1);
            const getVoting = await voting.getVoting(1);
            const winner = await voting.candidates(getVoting[3]);

            //expect winner name to be equal ("testCandidate1")
            expect(winner.name).to.eq("testCandidate1")
        })

        it("transfers 90% fund to a winner", async function () {
            const getFund = await voting.getVoting(1);
            fund = getFund[2] * 9 * 10 ** 15; //90%

            //expect that winner balance has changed to value(fund);
            await expect(() => voting.finishVoting(1))
                .to.changeEtherBalance(addr1, fund.toString());
        })

        it("keeps 10% of fund to the contract", async function () {
            await voting.finishVoting(1);

            //expect that contact balance has left 10% of the fund
            expect(await ethers.provider.getBalance(voting.address)).to.equal(fund / 9)
        })
    })

    describe("Withdrawal of funds", () => {
        beforeEach(async function () {
            await voting.addVoting("TestVoting1");
            await voting.addCandidate("testCandidate1", addr1.address);
            await voting.connect(addr1).vote(1, 1, { value: ethers.utils.parseEther("0.01") });
        })

        it("only owner can waithdraw", async function () {
            //call the function from address(addr2)
            // should be reverted
            await expect(voting.connect(addr2).withdrawFee()).to.be.revertedWith("Only Owner");
        })

        it("withdraws correct value", async function () {
            await network.provider.send("evm_increaseTime", [259200]);
            await network.provider.send("evm_mine");
            await voting.finishVoting(1);
            const contractBalance = await ethers.provider.getBalance(voting.address);

            //call the function from owner address
            // expect that the owner has got 10% of fund
            await expect(() => voting.withdrawFee())
                .to.changeEtherBalance(owner, contractBalance.toString());
            // contract balance equals 0.
            expect(await ethers.provider.getBalance(voting.address)).to.eq(0);
        })
    })
})