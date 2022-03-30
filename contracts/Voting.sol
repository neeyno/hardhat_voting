// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Voting {
    address public owner;
    uint256 voteFee = 0.01 ether;
    uint256 voteTime = 2 minutes; // Voting duration

    struct Voter {
        address voterAddress;
        uint256 choise;
    }

    // store candidates
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount = 0;

    struct Candidate {
        uint256 id;
        string name;
        address payable candidateAddress;
    }

    // store elections
    mapping(uint256 => Election) public elections;
    uint256 public electionId = 0;

    struct Election {
        uint256 electId;
        string electionName;
        uint256 startTime;
        uint256 endTime;
        uint256 winnerFund;
        mapping(uint256 => Voter) voters;
        uint256[] voteResult;
        uint256 voteWinner;
    }

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function addCandidate(string memory _name, address _candidateAddress)
        public
        onlyOwner
    {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(
            candidatesCount,
            _name,
            payable(_candidateAddress)
        );
    }

    function newElection(string memory _electionName) public onlyOwner {
        electionId++;
        Election storage e = elections[electionId];
        e.electId = electionId;
        e.electionName = _electionName;
        e.startTime = block.timestamp;
        e.endTime = e.startTime + voteTime;
    }

    function vote(uint256 _electionId, uint256 _candidateId) public payable {
        require(msg.value == voteFee);
        require(_electionId != 0 && _electionId <= electionId);
        require(_candidateId != 0 && _candidateId <= candidatesCount);
        Election storage e = elections[_electionId];
        require(block.timestamp <= e.endTime && block.timestamp > e.startTime);
        require(e.voters[_electionId].voterAddress != msg.sender);
        e.winnerFund += msg.value;
        e.voters[_electionId].voterAddress = msg.sender;
        e.voters[_electionId].choise = _candidateId;
        e.voteResult.push(_candidateId);
    }

    /*
    function getInfo(uint256 _electionId)
        public
        view
        returns (uint256, )
    {} it should returns some information about election process*/

    function getWinner(uint256 _electionId) internal view returns (uint256) {
        Election storage e = elections[_electionId];
        uint256[] memory count;
        count = new uint256[](candidatesCount + 1);
        uint256 number;
        uint256 maxIndex = 0;

        for (uint256 i = 0; i < e.voteResult.length; i += 1) {
            number = e.voteResult[i];
            count[number] = (count[number]) + 1;
            if (count[number] > count[maxIndex]) {
                maxIndex = number;
            }
        }
        return maxIndex;
    }

    function endElection(uint256 _electionId)
        public
        payable
        returns (string memory)
    {
        require(_electionId != 0 && _electionId <= electionId);
        Election storage e = elections[_electionId];
        require(block.timestamp > e.endTime, "Election has not done yet!");
        uint256 _winner = getWinner(_electionId);
        e.voteWinner = _winner;
        candidates[_winner].candidateAddress.transfer((e.winnerFund * 9) / 10);
        return candidates[_winner].name;
    }

    function withdraw() public payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
