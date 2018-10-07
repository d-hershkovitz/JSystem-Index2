var testersList={};

function prepareTestersInformation(){
	var counter = 0;

    	var TESTER1_INDEX=counter++;
    	var TESTER2_INDEX=counter++;
    	
    	testersList.names=[];
    	testersList.names[TESTER1_INDEX] = "Tester 1";
    	testersList.names[TESTER2_INDEX] = "Tester 2";
    	
    	//Tester 1
    	testersList[testersList.names[TESTER1_INDEX]]=[];
    	testersList[testersList.names[TESTER1_INDEX]].push("Test scenario 1");
    	testersList[testersList.names[TESTER1_INDEX]].push("Test scenario 2");
	testersList[testersList.names[TESTER1_INDEX]].push("Test scenario 3");    

    	//Tester 2
    	testersList[testersList.names[TESTER1_INDEX]]=[];
    	testersList[testersList.names[TESTER1_INDEX]].push("Test scenario 4");
    	testersList[testersList.names[TESTER1_INDEX]].push("Test scenario 5");
    }
