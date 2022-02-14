var SimpleVoting;

var voterRegisteredEvent;
var candidatesRegistrationStartedEvent;
var candidatesRegistrationEndedEvent;
var candidateRegisteredEvent;
var votingSessionStartedEvent;
var votingSessionEndedEvent;
var votedEvent;
var votesTalliedEvent;
var workflowStatusChangeEvent;

window.onload = function() {
	$.getJSON("../build/contracts/Election.json", function(json) {
	    SimpleVoting = TruffleContract( json );
		SimpleVoting.setProvider(new Web3.providers.HttpProvider("http://localhost:7545"));
		
		SimpleVoting.deployed()
		.then(instance => instance.VoterRegisteredEvent())
		.then(voterRegisteredEventSubscription => {
		    voterRegisteredEvent = voterRegisteredEventSubscription;	

		    voterRegisteredEvent.watch(function(error, result) {
			  if (!error)
				$("#voterRegistrationMessage").html('Voter successfully registered');
			  else
				console.log(error);
		    });			  
	    });
		
		SimpleVoting.deployed()
		.then(instance => instance.CandidateRegistrationStartedEvent())
		.then(candidatesRegistrationStartedEventSubscription => {
		    candidatesRegistrationStartedEvent = candidatesRegistrationStartedEventSubscription;	

		    candidatesRegistrationStartedEvent.watch(function(error, result) {
			  if (!error)
				$("#candidatesRegistrationMessage").html('The candidates registration session has started');
			  else
				console.log(error);
		    });			  
	    });	

		SimpleVoting.deployed()
		.then(instance => instance.CandidateRegistrationEndedEvent())
		.then(candidatesRegistrationEndedEventSubscription => {
		    candidatesRegistrationEndedEvent = candidatesRegistrationEndedEventSubscription;	

		    candidatesRegistrationEndedEvent.watch(function(error, result) {
			  if (!error)
				$("#candidatesRegistrationMessage").html('The candidates registration session has ended');
			  else
				console.log(error);
		    });			  
	    });			
		
		SimpleVoting.deployed()
		.then(instance => instance.CandidateRegisteredEvent())
		.then(candidateRegisteredEventSubscription => {
		    candidateRegisteredEvent = candidateRegisteredEventSubscription;	

		    candidateRegisteredEvent.watch(function(error, result) {
			  if (!error)
			  {
				$("#candidateRegistrationMessage").html('The candidate has been registered successfully');
				loadCandidatesTable();
				loadCandidateSelector();
			  }
			  else
				console.log(error);
		    });			  
	    });	
		SimpleVoting.deployed()
		.then(instance => instance.ProposalRegisteredEvent())
		.then(candidateRegisteredEventSubscription => {
		    candidateRegisteredEvent = candidateRegisteredEventSubscription;	

		    candidateRegisteredEvent.watch(function(error, result) {
			  if (!error)
			  {
				$("#proposalRegistrationMessage").html('The proposal has been registered successfully');
				loadProposalsTable();
			  }
			  else
				console.log(error);
		    });			  
	    });	

		SimpleVoting.deployed()
		.then(instance => instance.VotingSessionStartedEvent())
		.then(votingSessionStartedEventSubscription => {
		    votingSessionStartedEvent = votingSessionStartedEventSubscription;	

		    votingSessionStartedEvent.watch(function(error, result) {
			  if (!error)
				$("#votingSessionMessage").html('The voting session session has started');
			  else
				console.log(error);
		    });			  
	    });	
		
		SimpleVoting.deployed()
		.then(instance => instance.VotingSessionEndedEvent())
		.then(votingSessionEndedEventSubscription => {
		    votingSessionEndedEvent = votingSessionEndedEventSubscription;	

		    votingSessionEndedEvent.watch(function(error, result) {
			  if (!error)
				$("#votingSessionMessage").html('The voting session session has ended');
			  else
				console.log(error);
		    });			  
	    });		

		SimpleVoting.deployed()
		.then(instance => instance.VotedEvent())
		.then(votedEventSubscription => {
		    votedEvent = votedEventSubscription;	

		    votedEvent.watch(function(error, result) {
			  if (!error)
				$("#voteConfirmationMessage").html('You have voted successfully');
			  else
				console.log(error);
		    });			  
	    });		

		SimpleVoting.deployed()
		.then(instance => instance.VotesTalliedEvent())
		.then(votesTalliedEventSubscription => {
		    votesTalliedEvent = votesTalliedEventSubscription;	

		    votesTalliedEvent.watch(function(error, result) {
			  if (!error)
		      {
			     $("#votingTallyingMessage").html('Votes have been tallied');
			     loadTalliedCandidatesTable();
		      }
			  else
				console.log(error);
		    });			  
	    });			
		
	    SimpleVoting.deployed()
		.then(instance => instance.WorkflowStatusChangeEvent())
		.then(workflowStatusChangeEventSubscription => {
		    workflowStatusChangeEvent = workflowStatusChangeEventSubscription;	

		    workflowStatusChangeEvent.watch(function(error, result) {
			  if (!error)
				refreshWorkflowStatus();
			  else
				console.log(error);
		    });			  
	    });		


	loadCandidateSelector();
	loadCandidatesTable();
	loadResultsTable();
	loadProposalsTable();
	refreshWorkflowStatus();
});
}


function loadCandidateSelector(){
	let btnPopulate = document.querySelector('button');
	let select = document.querySelector('select');
	
	getCandidateNamesArray()
	.then(candidateNames => {
		let options = candidateNames.map(candidate => `<option value=${candidate}>${candidate}</option>`).join('\n');
		options = "<option value=\"\" disabled selected>Choose a candidate</option>\n" + options;
		select.innerHTML = options;
		

	});
}
function refreshWorkflowStatus()
{		
	SimpleVoting.deployed()
	.then(instance => instance.getWorkflowStatus())
	.then(workflowStatus => {
		var workflowStatusDescription;
		
		switch(workflowStatus.toString())
		{
			case '0':
				workflowStatusDescription = "Registering Voters";		
				break;
			case '1':
				workflowStatusDescription = "Candidates registration Started";
				break;
			case '2':
				workflowStatusDescription = "Candidates registration Ended";
				break;
			case '3':
				workflowStatusDescription = "Voting session Started";
				break;
			case '4':
				workflowStatusDescription = "Voting session Ended";
				break;
			case '5':
				workflowStatusDescription = "Votes have been tallied";
				break;	
			default:
				workflowStatusDescription = "Unknown status";
		}
				
		$("#currentWorkflowStatusMessage").html(workflowStatusDescription);
	});
}	

function unlockAdmin()
{
	$("#adminMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	var adminPassword = $("#adminPassword").val();
	
	var params = [
		{
		  address: 'adminAddress',
		  password: 'adminPassword',
		  time: 180,
		  //provider: this.provider,
		},
	  ];

	var result = window.ethereum.request({
		method: 'unlockAccount',
		params,
	  })//unlock for 3 minutes
	// web3.eth.personal.unlockAccount(adminAddress, adminPassword, 180);
	if (result)
		$("#adminMessage").html('The account has been unlocked');
	else
		$("#adminMessage").html('The account has NOT been unlocked');
}

function unlockVoter()
{
	$("#voterMessage").html('');
	
	var voterAddress = $("#voterAddress").val();
	var voterPassword = $("#voterPassword").val();

	var params= [
		{
		  address: 'voterAddress',
		  password: 'voterPassword',
		  time: 180,
		  //provider: this.provider,
		},
	  ];

	var result = window.ethereum.request({
	method: 'unlockAccount',
	params,
	})//unlock for 3 minutes
	//var result = web3.eth.personal.unlockAccount(voterAddress, voterPassword, 180);//unlock for 3 minutes
	if (result)
		$("#voterMessage").html('The account has been unlocked');
	else
		$("#voterMessage").html('The account has NOT been unlocked');
}

function registerVoter() {
	
	$("#voterRegistrationMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	var voterToRegister = $("#voterAddress").val();

	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.isRegisteredVoter(voterToRegister))
				.then(isRegisteredVoter => {
					if (isRegisteredVoter)
						$("#voterRegistrationMessage").html('The voter is already registered');					    
					else
					{
						return SimpleVoting.deployed()
							.then(instance => instance.getWorkflowStatus())
							.then(workflowStatus => {
								if (workflowStatus > 0)
									$("#voterRegistrationMessage").html('Voters registration has already ended');					    
								else
								{
									SimpleVoting.deployed()
									   .then(instance => instance.registerVoter(voterToRegister, {from:adminAddress, gas:200000}))
									   .catch(e => $("#voterRegistrationMessage").html(e));
								}
							});
					}
				});
		}
		else
		{
			$("#voterRegistrationMessage").html('The given address does not correspond to the administrator');
		}
	});
}

function checkVoterRegistration() {
	
	$("#registrationVerificationMessage").html('');
	
	var address = $("#address").val();	
	
	SimpleVoting.deployed()
	.then(instance => instance.isRegisteredVoter(address))
	.then(isRegisteredVoter =>  {
		if (isRegisteredVoter)
				$("#registrationVerificationMessage").html('This is a registered voter');
			 else
				$("#registrationVerificationMessage").html('This is NOT a registered voter');
	});
}

function startCandidatesRegistration() {
	
	$("#candidatesRegistrationMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus > 0)
						$("#candidatesRegistrationMessage").html('The candidates registration session has already been started');					    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.startCandidatesRegistration({from:adminAddress, gas:200000}))
						   .catch(e => $("#candidatesRegistrationMessage").html(e));
					}
				});
		}
		else
		{
			$("#candidatesRegistrationMessage").html('The given address does not correspond to the administrator');
		}
	});	
}

function endCandidatesRegistration() {
	
	$("#candidatesRegistrationMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 1)
						$("#candidatesRegistrationMessage").html('The candidates registration session has not started yet');
					else if (workflowStatus > 1)
						$("#candidatesRegistrationMessage").html('The candidates registration session has already been ended');				    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.endCandidatesRegistration({from:adminAddress, gas:200000}))
						   .catch(e => $("#candidatesRegistrationMessage").html(e));
					}
				});
		}
		else
		{
			$("#candidatesRegistrationMessage").html('The given address does not correspond to the administrator');
		}
	});	
}

function startVotingSession() {
	
	$("#votingSessionMessage").html('');	
	
	var adminAddress = $("#adminAddress").val();
	var votingDuration = $("#votingDuration").val();
	var votingBeginsIn = $("#votingBeginsIn").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 2)
						$("#votingSessionMessage").html('The candidates registration session has not ended yet');
					else if (workflowStatus > 2)
						$("#votingSessionMessage").html('The voting session has already been started');					    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.startVotingSession(votingBeginsIn, votingDuration, {from:adminAddress, gas:200000}))
						   .catch(e => $("#votingSessionMessage").html(e));
					}
				});
		}
		else
		{
			$("#votingSessionMessage").html('The given address does not correspond to the administrator');
		}
	});		
}

function endVotingSession() {
	
	$("#votingSessionMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 3)
						$("#votingSessionMessage").html('The voting session has not started yet');
					else if (workflowStatus > 3)
						$("#votingSessionMessage").html('The voting session has already ended');					    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.endVotingSession({from:adminAddress, gas:200000}))
						   .catch(e => $("#votingSessionMessage").html(e));
					}
				});
		}
		else
		{
			$("#votingSessionMessage").html('The given address does not correspond to the administrator');
		}
	});
}

function tallyVotes() {
	
	$("#votingTallyingMessage").html('');
	
	var adminAddress = $("#adminAddress").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isAdministrator(adminAddress))
	.then(isAdministrator =>  {		
		if (isAdministrator)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 4)
						$("#votingTallyingMessage").html('The voting session has not ended yet');		
					else if (workflowStatus > 4)
						$("#votingTallyingMessage").html('Votes have already been tallied');				    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.tallyVotes({from:adminAddress, gas:200000}))
						   .catch(e => $("#votingTallyingMessage").html(e));
					}
				});
		}
		else
		{
			$("#votingTallyingMessage").html('The given address does not correspond to the administrator');
		}
	});	

	loadTalliedCandidatesTable();
}

function registerCandidate() {
	
	$("#candidateRegistrationMessage").html('');
	
	var voterAddress = $("#voterAddress").val();
	var candidateDescription = $("#candidateDescription").val();
	var candidateParty = $("#candidateParty").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isRegisteredVoter(voterAddress))
	.then(isRegisteredVoter =>  {		
		if (isRegisteredVoter)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 1)
						$("#candidateRegistrationMessage").html('The candidate registration session has not started yet');
					else if (workflowStatus > 1)
						$("#candidateRegistrationMessage").html('The candidate registration session has already ended');				    
					else
					{
						SimpleVoting.deployed()
						   .then(instance => instance.registerCandidate(candidateDescription, candidateParty, {from:voterAddress, gas:200000}))
						   .catch(e => $("#candidateRegistrationMessage").html(e));
					}
				});
		}
		else
		{
			$("#candidateRegistrationMessage").html('You are not a registered voter. You cannot register a candidate.');
		}
	});			
}


function registerProposal() {
	$("#proposalRegistrationMessage").html('');
	
	var voterAddress = $("#voterAddress").val();
	var proposalDescription = $("#proposalDescription").val();
	
	SimpleVoting.deployed()
	.then(instance => instance.isRegisteredVoter(voterAddress))
	.then(isRegisteredVoter =>  {		
		if (isRegisteredVoter)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 1)
						$("#proposalRegistrationMessage").html('The proposal registration session has not started yet');
					else if (workflowStatus > 1)
						$("#proposalRegistrationMessage").html('The proposal registration session has already ended');				    
					else
					{	
						SimpleVoting.deployed()
						   .then(instance => instance.registerProposal(proposalDescription, {from:voterAddress, gas:200000}))
						   .catch(e => $("#proposalRegistrationMessage").html(e));
					}
					
				});
		}
		else
		{
			$("#proposalRegistrationMessage").html('You are not a registered voter. You cannot register a proposal.');
		}
	});			
}

async function loadCandidatesTable() {
	
	instance = await SimpleVoting.deployed();
	candidatesNumber = await instance.getCandidatesNumber();
	var innerHtml = "<tr><td><b>ID</b></td><td><b>Name</b></td><td><b>Party</b></td>";
		
		j = 0;
		for (var i = 0; i < candidatesNumber; i++) {
			description = await getCandidateName(i);
			party = await getCandidateParty(i);
			innerHtml = innerHtml + "<tr><td>" + (j++) + "</td><td>" + description + "</td><td>"+ party + "</td></tr>";
			$("#candidatesTable").html(innerHtml);
		}
}
async function loadProposalsTable() {
	
	instance = await SimpleVoting.deployed();
	proposalsNumber = await instance.getProposalsNumber();
	var innerHtml = "<tr><td><b>ID</b></td><td><b>Description</b></td><td><b>Vote</b></td>";
		
		j = 0;
		for (var i = 0; i < proposalsNumber; i++) {
			description = await getProposalDescription(i);
			innerHtml = innerHtml + "<tr><td>" + (j++) + "</td><td>" + description + "</td><td><input type=\"radio\" name=\"radio"+i+"\" id=\"radio"+i+"\" value='True'>Yay</input><input type=\"radio\" name=\"radio"+i+"\" id=\"radio"+i+"\" value='False' checked>Nay</input></td></tr>";
			$("#proposalsTable").html(innerHtml);
		}
}

async function getCandidateNamesArray() {
	
	instance = await SimpleVoting.deployed();
	candidatesNumber = await instance.getCandidatesNumber();
	let candidates = [];
		for (var i = 0; i < candidatesNumber; i++) {
			description = await getCandidateName(i);
			party = await getCandidateParty(i);
			candidates.push(description + " (" + party + ")");
			//candidates.push({"Name": description, "party": party});
		}
	return candidates;
}

//Comparer Function for sort
function GetSortOrder(prop) {    
    return function(a, b) {    
        if (a[prop] < b[prop]) {    
            return 1;    
        } else if (a[prop] > b[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
}   

async function  loadTalliedCandidatesTable() {
	
	instance = await SimpleVoting.deployed();
	candidatesNumber = await instance.getCandidatesNumber();
	var candidates = [];
	var struct;
	var name;
	var count;
	var party;
	for (var i = 0; i < candidatesNumber; i++) {
		name = await getCandidateName(i);
		count = await getCandidateVoteCounts(i);
		party =  await getCandidateParty(i);
		struct = {"name": name, "votes": count.c[0], "party": party};
		candidates.push(struct);
	}

	candidates.sort(GetSortOrder("votes")); //Pass the attribute to be sorted on

		
	var innerHtml = "<tr><td><b>Candidate Name</b></td><td><b>Party</b></td><td><b>Votes</b></td>";

	for (var i = 0; i < candidatesNumber; i++) {
		innerHtml = innerHtml + "<tr><td>" + candidates[i].name + "</td><td>" + candidates[i].party + "</td><td>" + candidates[i].votes + "</td></tr>";
		$("#resultsTable").html(innerHtml);
	}
	
}

function getCandidateVoteCounts(candidateId)
{
    return SimpleVoting.deployed()
	  .then(instance => instance.getCandidateVoteCounts(candidateId));
}

function getCandidateName(candidateId)
{
    return SimpleVoting.deployed()
	  .then(instance => instance.getCandidateName(candidateId));
}
function getProposalDescription(candidateId)
{
    return SimpleVoting.deployed()
	  .then(instance => instance.getProposalDescription(candidateId));
}

function getProposalsNumber()
{
    return SimpleVoting.deployed()
	  .then(instance => instance.getProposalsNumber());
}
function getCandidateID(candidateName)
{
    return SimpleVoting.deployed()
	  .then(instance => instance.getCandidateID(candidateName));
}

function getCandidateParty(candidateId)
{
    return SimpleVoting.deployed()
	  .then(instance => instance.getCandidateParty(candidateId));
}

function getProposalResults()
{
    return SimpleVoting.deployed()
	  .then(instance => instance.getProposalResults());
}

async function getProposalVotes(){
	instance = await SimpleVoting.deployed();
	proposalsNumber = await instance.getProposalsNumber();
	proposalsNumber = proposalsNumber.c[0];
	//instance.getProposalsNumber().then(proposalsNumber =>{
		var proposalResults = new Array(proposalsNumber).fill(false);
		for(var i = 0; i < proposalsNumber; i++){
			proposalResults[i] = document.getElementById("radio"+i).checked;//document.getElementById("#radio"+i).checked;//$("#radio"+i).val(); // == "True"); 
			
		//console.log("$(\"#radio\"+i).val(): "+($("#radio1".val())))
		}
		console.log("proposalResults: "+proposalResults)
		return proposalResults;
	//});
}

async function vote() {
	
	var voterAddress = $("#voterAddress").val();
	var candidateName = $("#candidateSelectName").val();
	candidateId = getCandidateID(candidateName);
	var proposalResults = await getProposalVotes();

	// getProposalsNumber().then(proposalsNumber =>{
	// 	var proposalResults = new Array(proposalsNumber).fill(false);
	// 	for(var i = 0; i < proposalsNumber; i++){
	// 		proposalResults.push($("#radio"+i).val() == "True");
	// 	}
	// });

	getCandidateID(candidateName).then(candidateId =>{
		candidateId = candidateId.c[0];
		$("#voteConfirmationMessage").html("Voting for: " + candidateName);
	SimpleVoting.deployed()
	.then(instance => instance.isRegisteredVoter(voterAddress))
	.then(isRegisteredVoter =>  {		
		if (isRegisteredVoter)
		{
			return SimpleVoting.deployed()
				.then(instance => instance.getWorkflowStatus())
				.then(workflowStatus => {
					if (workflowStatus < 3)
						$("#voteConfirmationMessage").html('The voting session has not started yet');
					else if (workflowStatus > 3)
						$("#voteConfirmationMessage").html('The voting session has already ended');				    
					else
					{
						SimpleVoting.deployed()
							.then(instance => instance.getCandidatesNumber())
							.then(candidatesNumber => {
								if (candidatesNumber == 0)
								{
									$("#voteConfirmationMessage").html('The are no registered candidates. You cannot vote.');
								}
								else if (parseInt(candidateId) >= candidatesNumber)
								{
									$("#voteConfirmationMessage").html('The specified candidateId does not exist.');
								}							
								else 
								{	
										SimpleVoting.deployed()
										//.then(instance => instance.vote(0, [true, false], {from:"0x143A27aBD73B990D7c8a55cfFD56eD7792F8f883", gas:200000}))
									   .then(instance => instance.vote(candidateId, proposalResults, {from:voterAddress, gas:200000}))
									   .catch(e => $("#voteConfirmationMessage").html(e + "proposalResults: " + proposalResults));
								}
							});
					}
				});
		}
		else
		{
			$("#candidateRegistrationMessage").html('You are not a registered voter. You cannot register a candidate.');
		}
	});			
});				
}

function loadResultsTable() {

	SimpleVoting.deployed()
		.then(instance => instance.getWorkflowStatus())
		.then(workflowStatus => {
			if (workflowStatus == 5)
			{
				var innerHtml = "<tr><td><b>Winning Candidate</b></td><td></td></tr>";
				
				SimpleVoting.deployed()
				   .then(instance => instance.getWinningCandidateId())
				   .then(winningCandidateId => {
					   innerHtml = innerHtml + "<tr><td><b>Id:</b></td><td>" + winningCandidateId +"</td></tr>";
					   
					   SimpleVoting.deployed()
				       .then(instance => instance.getWinningCandidateName())
					   .then(winningCandidateName => {
						   innerHtml = innerHtml +  "<tr><td><b>Name:</b></td><td>" + winningCandidateName  +"</td></tr>";
						    
						   SimpleVoting.deployed()
				           .then(instance => instance.getWinningCandidateVoteCounts())
					       .then(winningCandidateVoteCounts => {
						           innerHtml = innerHtml +  "<tr><td><b>Votes count:</b></td><td>" + winningCandidateVoteCounts  +"</td></tr>";
								   
								   $("#resultsTable").html(innerHtml);
						   });
					   });
				   });
			}
		});
}