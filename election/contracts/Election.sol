pragma solidity ^0.4.22;

contract Election{
    // model a candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // store candidates
    // fetch candidate
    mapping(uint => Candidate) public candidates;

    // store candidates count
    uint public candidatesCount;

    constructor() public{
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string _name) private{
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }
}