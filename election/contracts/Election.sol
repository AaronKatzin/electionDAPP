pragma solidity 0.4.25;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
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

    // Store accounts that have voted
    mapping(bytes32 => Voter) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    // Store Candidates Count
    uint public candidatesCount;

    uint public timeVotingEnds;

    // // voted event
    // event votedEvent (
    //     uint indexed _candidateId
    // );

    event VoterRegisteredEvent (address voterAddress); 
    event CandidateRegistrationStartedEvent ();
    event CandidateRegistrationEndedEvent ();
    event CandidateRegisteredEvent(uint candidateId);
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
        workflowStatus = WorkflowStatus.RegisteringVoters;

        // TODO: remove these next two lines and have candidate registration done by admin
        // addCandidate("Candidate 1");
        // addCandidate("Candidate 2");
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
    //     enum WorkflowStatus {
    //     RegisteringVoters, 
    //     CandidatesRegistrationStarted,
    //     CandidatesRegistrationEnded,
    //     VotingSessionStarted,
    //     VotingSessionEnded,
    //     VotesTallied
    // }
    function startVotingSession(uint votingDuration) 
        public onlyAdministrator onlyAfterCandidatesRegistration {
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        timeVotingEnds = now + votingDuration;
        

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

    function registerCandidate(string candidateName) 
        public onlyRegisteredVoter onlyDuringCandidatesRegistration {
        candidates[candidatesCount] = (Candidate(candidatesCount, candidateName, 0));
        candidatesCount++;

        emit CandidateRegisteredEvent(candidatesCount);
    }


    // function addCandidate (string _name) private {
    //     candidatesCount ++;
    //     candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    // }

    function vote(uint candidateId) public onlyRegisteredVoter onlyDuringVotingSession  {
        require(!voters[sha256(abi.encodePacked(msg.sender))].hasVoted, "the caller has already voted");
        require(timeVotingEnds > now, "Voting timer has run out");
        voters[sha256(abi.encodePacked(msg.sender))].hasVoted = true;
        voters[sha256(abi.encodePacked(msg.sender))].votedCandidateId = candidateId;
            
        candidates[candidateId].voteCount += 1;

        emit VotedEvent(msg.sender, candidateId);
    }


//     function vote (uint _candidateId) public {
//         // require that they haven't voted before
//         require(!voters[msg.sender]);
// 
//         // require a valid candidate
//         require(_candidateId > 0 && _candidateId <= candidatesCount);
// 
//         // record that voter has voted
//         voters[msg.sender] = true;
// 
//         // update candidate vote Count
//         candidates[_candidateId].voteCount ++;
// 
//         // trigger voted event
//         emit votedEvent(_candidateId);
//     }
    function tallyVotes() 
        onlyAdministrator 
        onlyAfterVotingSession  public {
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

        emit VotesTalliedEvent();
        emit WorkflowStatusChangeEvent(
            WorkflowStatus.VotingSessionEnded, workflowStatus);
    }

    // views

    function getCandidatesNumber() public view
        returns (uint) {
            return candidatesCount;
    }

    function getCandidateName(uint index) public view 
        returns (string) {
            return candidates[index].name;
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
}
