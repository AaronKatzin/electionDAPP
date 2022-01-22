pragma solidity ^0.4.2;

contract Election{
    // model a candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    //store accounts that have voted
    mapping(address => bool) public voters;
    // store candidates
    // fetch candidate
    mapping(uint => Candidate) public candidates;

    // store candidates count
    uint public candidatesCount;

    // voted event
    event votedEvent(
        uint indexed _candidateId
    );

    function Election() public{
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string _name) private{
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        //require that they haven't voted yet
        //console.log(msg.sender, " is voting for candidate ", _candidateId);
        require(!voters[msg.sender]);
        //console.log("passed double voting require");
        //require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        //console.log("passed valid candidate require");

        //record that voter has voted
        voters[msg.sender] = true;

        //update candidate vote count
        candidates[_candidateId].voteCount++;

        //trigger voted event
        votedEvent(_candidateId);
    }
}