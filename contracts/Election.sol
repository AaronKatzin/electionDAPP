pragma solidity 0.4.25;

import "./voterToken.sol";

contract Election is VTToken {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        string party;
    }

    struct Proposal {
        uint id;
        string description;
        uint voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedCandidateId;
    }

    address public administrator;

    enum WorkflowStatus {
        RegisteringVoters, 
        CandidatesRegistrationStarted,
        CandidatesRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;

    uint private winningCandidateId;


    mapping(bytes32 => Voter) public voters;
    mapping(uint => Candidate) public candidates;
    mapping(uint => Proposal) public proposals;
    bool[] public proposalResults;

    uint public candidatesCount;
    uint public proposalsCount;
    uint public votersCount;

    uint public timeVotingBegins;
    uint public timeVotingEnds;

    event VoterRegisteredEvent (address voterAddress); 
    event CandidateRegistrationStartedEvent ();
    event CandidateRegistrationEndedEvent ();
    event CandidateRegisteredEvent(uint candidateId);
    event ProposalRegisteredEvent(uint proposalId);
    event VotingSessionStartedEvent ();
    event VotingSessionEndedEvent ();
    event VotedEvent (address voter, uint candidateId);
    event VotesTalliedEvent ();

    event WorkflowStatusChangeEvent (
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );

    constructor () public {
        administrator = msg.sender;
        YOUR_METAMASK_WALLET_ADDRESS = administrator;
        workflowStatus = WorkflowStatus.RegisteringVoters;
        balances[YOUR_METAMASK_WALLET_ADDRESS] = _totalSupply;
        emit Transfer(address(0), YOUR_METAMASK_WALLET_ADDRESS, _totalSupply);
    }

    modifier onlyAdministrator(){
        require(msg.sender == administrator, "The caller of this function must be an admin");
        _;
    }
    modifier onlyRegisteredVoter() {
        require(voters[sha256(abi.encodePacked(msg.sender))].isRegistered, 
        "the caller of this function must be a registered voter");
        _;
    }

    modifier onlyDuringVotersRegistration() {
        require(workflowStatus == WorkflowStatus.RegisteringVoters,"this function can be called only before Candidates registration has started");
        _;
    }

    modifier onlyDuringCandidatesRegistration() {
        require(workflowStatus == WorkflowStatus.CandidatesRegistrationStarted, "this function can be called only during Candidates registration");
        _;
    }

        modifier onlyAfterCandidatesRegistration() {
        require(workflowStatus == WorkflowStatus.CandidatesRegistrationEnded, "this function can be called only after Candidates registration has ended");
       _;
    }
    
    modifier onlyDuringVotingSession() {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "this function can be called only during the voting session");
       _;
    }
    
    modifier onlyAfterVotingSession() {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded,  "this function can be called only after the voting session has ended");
       _;
    }
    
    modifier onlyAfterVotesTallied() {
        require(workflowStatus == WorkflowStatus.VotesTallied,  
           "this function can be called only after votes have been tallied");
       _;
    }

    function registerVoter(address _voterAddress) 
        public onlyAdministrator onlyDuringVotersRegistration {
            
        require(!voters[sha256(abi.encodePacked(_voterAddress))].isRegistered, "the voter is already registered");
            
        voters[sha256(abi.encodePacked(_voterAddress))].isRegistered = true;
        voters[sha256(abi.encodePacked(_voterAddress))].hasVoted = false;
        votersCount += 1;
        emit VoterRegisteredEvent(_voterAddress);
    }

    function startCandidatesRegistration ()
        public onlyAdministrator onlyDuringVotersRegistration {
        workflowStatus = WorkflowStatus.CandidatesRegistrationStarted;
            
        emit CandidateRegistrationStartedEvent();
        emit WorkflowStatusChangeEvent(
            WorkflowStatus. RegisteringVoters, workflowStatus);
    }
    
    function endCandidatesRegistration() 
        public onlyAdministrator onlyDuringCandidatesRegistration {
        workflowStatus = WorkflowStatus.CandidatesRegistrationEnded;

        emit CandidateRegistrationEndedEvent();        
        emit WorkflowStatusChangeEvent(
            WorkflowStatus.CandidatesRegistrationStarted, workflowStatus);
    }
    
    function startVotingSession(uint votingBeginsIn, uint votingDuration) 
        public onlyAdministrator onlyAfterCandidatesRegistration {
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        timeVotingBegins = now + votingBeginsIn;
        timeVotingEnds = timeVotingBegins + votingDuration;
        
        emit VotingSessionStartedEvent();        
        emit WorkflowStatusChangeEvent(
            WorkflowStatus.VotingSessionStarted, workflowStatus);
    }
        function endVotingSession() 
        public onlyAdministrator onlyDuringVotingSession {
        workflowStatus = WorkflowStatus.VotingSessionEnded;

        emit VotingSessionEndedEvent();        
        emit WorkflowStatusChangeEvent(
            WorkflowStatus.VotingSessionEnded, workflowStatus);
    }

    function registerCandidate(string candidateName, string party) 
        public onlyRegisteredVoter onlyDuringCandidatesRegistration {
        candidates[candidatesCount] = (Candidate(candidatesCount, candidateName, 0, party));
        candidatesCount++;

        emit CandidateRegisteredEvent(candidatesCount);
    }

    function registerProposal(string description) 
        public onlyRegisteredVoter onlyDuringCandidatesRegistration {
        proposals[proposalsCount] = (Proposal(candidatesCount, description, 0));
        proposalsCount++;

        emit ProposalRegisteredEvent(proposalsCount);
    }



    function vote(uint candidateId, bool[] proposalVotes) public onlyRegisteredVoter onlyDuringVotingSession  {
        require(!voters[sha256(abi.encodePacked(msg.sender))].hasVoted, "the caller has already voted");
        require(timeVotingBegins < now, "Voting timer has't began yet, please wait "); //, timeVotingBegins - now
        require(timeVotingEnds > now, "Voting timer has run out");
        voters[sha256(abi.encodePacked(msg.sender))].hasVoted = true;

        // vote for candidate
        voters[sha256(abi.encodePacked(msg.sender))].votedCandidateId = candidateId;
        candidates[candidateId].voteCount += 1;

        // vote for proposals
        for(uint i=1; i < proposalsCount; i++){
            if(proposalVotes[i]){
                proposals[i].voteCount += 1;
            }
        }

        award(msg.sender, 1);
        emit VotedEvent(msg.sender, candidateId);
    }


    function tallyVotes() 
        onlyAdministrator 
        onlyAfterVotingSession  public {

        // tally candidate results
        uint winningVoteCount = 0;
        uint winningCandidateIndex = 0;
           
        for (uint i = 0; i < candidatesCount; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningCandidateIndex = i;
            }
        }
            
        winningCandidateId = winningCandidateIndex;
        workflowStatus = WorkflowStatus.VotesTallied;

        // tally proposal results
        for(i=0; i < proposalsCount; i++){
            proposalResults.push(proposals[i].voteCount > (votersCount / 2));
        }

        emit VotesTalliedEvent();
        emit WorkflowStatusChangeEvent(
            WorkflowStatus.VotingSessionEnded, workflowStatus);
    }

    // views
    function getProposalResults() public view
        returns (bool[]) {
            return proposalResults;
    }

    function getCandidatesNumber() public view
        returns (uint) {
            return candidatesCount;
    }

    function getCandidateName(uint index) public view 
        returns (string) {
            return candidates[index].name;
    }
    function getCandidateID(string name) public view 
        returns (uint) {
            for (uint i = 0; i < candidatesCount; i++) {
                
                if (keccak256(abi.encodePacked(candidates[i].name)) == keccak256(abi.encodePacked(name))) {
                    return i;
                }
        }
            return 99;
    }

    function getCandidateParty(uint index) public view 
        returns (string) {
            return candidates[index].party;
    }

    function getWinningCandidateId() onlyAfterVotesTallied 
    public view
        returns (uint) {
        return winningCandidateId;
}
    
    function getWinningCandidateName() onlyAfterVotesTallied 
        public view
            returns (string) {
            return getCandidateName(winningCandidateId);
    }  

    function getCandidateVoteCounts(uint index) onlyAfterVotesTallied 
        public view
            returns (uint) {
            return candidates[index].voteCount;
    }

    function getWinningCandidateVoteCounts() onlyAfterVotesTallied 
        public view
            returns (uint) {
            return candidates[winningCandidateId].voteCount;
    }

    function isRegisteredVoter(address _voterAddress) public view
        returns (bool) {
        return voters[sha256(abi.encodePacked(_voterAddress))].isRegistered;
    }

    function isAdministrator(address _address) public view 
        returns (bool){
        return _address == administrator;
    }

    function getWorkflowStatus() public view
    returns (WorkflowStatus) {
    return workflowStatus;       
    }

    // proposal views
    function getProposalsNumber() public view
        returns (uint) {
            return proposalsCount;
    }

    function getProposalDescription(uint index) public view 
        returns (string) {
            return proposals[index].description;
    }

    function getProposalID(string description) public view 
        returns (uint) {
            for (uint i = 0; i < proposalsCount; i++) {
                
                if (keccak256(abi.encodePacked(proposals[i].description)) == keccak256(abi.encodePacked(description))) {
                    return i;
                }
        }
            return 99;
    }

    function getProposalVoteCounts(uint index) onlyAfterVotesTallied 
        public view
            returns (uint) {
            return proposals[index].voteCount;
    }
}
