var bgColorBomboxBoxId ='bgColorSelect';
var spanFieldIdCounter = 0;

var CHK_FAILURES_ONLY = 'chkFailuresOnly';
var CHK_FEATURES_ONLY = 'chkFeaturesOnly';
 
var STRIKE_OUT_CSS = "strikeOut";

var TEST_LIST_PASS_CSS = "test_list_pass";
var TEST_LIST_WARN_CSS = "test_list_warn";
var TEST_LIST_ERRO_CSS = "test_list_erro";	
var TREE_LEVEL_ERRO_CSS = "tree_erro";
var TREE_LEVEL_PASS_CSS = "tree_pass";


var STATISTICS_RESULTS_DIV="ResultsDiv";
var SCENARIO_INFORMATION_CSS_CLASS = "scenarioInformation";
var SCENARIO_CHECKBOX_INFORMATION_CSS_CLASS = "scenarioChkInformation";

var SCENARIO_TEST_PASSED_CSS_CLASS = "ScenarioTestsPassed";
var SCENARIO_TEST_TOTAL_CSS_CLASS = "ScenarioTestsTotal";



var filterSelectName="filterTester";
var filterDefaultValue="All";

var dynamicMode = false;

var DATA_DIV="cutId";

var statisticsTree = null;

 /*
 Update Record Background Color
 */
function updateStyle(obj,checkbox){    	
	var bgColor = getColorFromComboBox();

	if(checkbox){
		obj.style.backgroundColor=bgColor;	
	}
	else {
		obj.style.backgroundColor='';		
	}
}

/*
Get Current color from a record.
*/
function getColorFromComboBox(){
	var e = document.getElementById(bgColorBomboxBoxId);
	var str = e.options[e.selectedIndex].text;
	console.log("COLOR="+str);
	return str;
}

/*
* Analyze log for all the testsers in a new window.
*/

function analyzeLog(){
	/*
	run on all Testers
	*/
	var tree;
	var rootScenarios = findRootScenarios(); 

	var htmlContent = "";
	
	var failuresOnly = true;
	var featuresOnly = false;
	var collpaseExpandMode = false;

	var htmlBody = "<html><head>";
	htmlBody += "<link rel='stylesheet' href='default.css'><link rel='stylesheet' href='mktree.css'><script src='mktree.js' language='JavaScript'></script>";
	htmlBody += "</head>";
	htmlBody += "<body><br>";
	htmlContent += "<div id='container'>"; //Container

	htmlContent += "<a href='#' onclick='collapseTree(\"ulContainer\");return false;'>Collapse All</a>";	//Add Collapse Button
	htmlContent += "&nbsp;";	//Add Space in between
	htmlContent += "<a href='#' onclick='expandTree(\"ulContainer\");return false;'>Expand All</a>"; 	//Add Expand Button
	htmlContent += "<ul class='mktree' id='ulContainer'>"; //Ul for expand/collapse
	for(name in testersList.names){	
		tree = buildDynamicTree(rootScenarios,testersList.names[name],failuresOnly,featuresOnly,collpaseExpandMode);

		if(tree.totalTests>0){
			htmlContent += "<li class='liOpen'>";
			htmlContent += "<span>Start for <b>"+testersList.names[name] +" [Failed: "+(tree.totalTests-tree.totalPass)+"] </b></span>"; 
			htmlContent += "<ul>";
			htmlContent += tree.html;
			htmlContent += "</ul>";
			htmlContent += "</li><br>";
		}
	}
	htmlContent +="</ul>";//End Ul for expand/collapse
	htmlContent +="</div>"; //end div container
	htmlBody += htmlContent;
	htmlBody+="</body></html>";

	/*
	* Open new window
	*/
	var windowHtml = window.open();	
	windowHtml.document.open("","_blank","scrollbars=yes,resizable=yes");
	windowHtml.document.write(htmlBody);
	windowHtml.document.close();

	/*
	* Update LI click option for expand/collpase on load.
	*/	 
	windowHtml.onload = function() {
		var treeDiv = windowHtml.document.getElementById("container");
		var spans = treeDiv.getElementsByClassName("bullet");
		updateSpanExpandCollpase(spans,false);
		collapseTree('ulContainer');//Collapse All Testers
	}
}

/*
* Update LI click option for expand/collpase.
*/
function updateSpanExpandCollpase(spans,value){
	for(i=0;i<spans.length;i++){
		spans[i].onclick = function () {
			this.parentNode.className = (this.parentNode.className==nodeOpenClass) ? nodeClosedClass : nodeOpenClass;
			return value;
		}
	}
}

/*
filterByTester - Tester Name
failuresOnly - Boolean. Show fails only.
featuresOnly - Boolean. Show Features fails Only.
*/
function renderTree(filterByTester,failuresOnly,featuresOnly) {
	/*
	 Getting all Main UL.
	*/
	var rootScenarios = findRootScenarios();           
	var analyzeIndex = '';

	console.log("[ DEBUG ] ");
	console.log("filterByTester:"+filterByTester);
	console.log("failuresOnly:"+failuresOnly);
	console.log("featuresOnly:"+filterByTester);

	//Expend All Button
	var expendTree = buildExpandCollapseButtons(rootScenarios,false)
	//Collapse All Button
	var collapseTree = buildExpandCollapseButtons(rootScenarios,true)

	//Analyze Button
	analyzeIndex = "analyzeLog(); return false;"

	/*
	* Build the New Dynamic Tree with all of the scenarios.
	*/
	var collpaseExpandMode = true;
	var tree = buildDynamicTree(rootScenarios,filterByTester,failuresOnly,featuresOnly,collpaseExpandMode);

	//Save the Statistics gloablly.
	statisticsTree = cloneTreeResult(tree,false);

	/*
	* Build the Options Table. Failures only, Testers,Colors and etc.
	*/
	var filterDiv = buildOptionsTable(filterByTester,failuresOnly,featuresOnly);
	
	/*
	* Calculate Statistics Generation.
	*/		        
	var htmlContent = "<div id='"+STATISTICS_RESULTS_DIV+"'></div>" +"<br>"+
			"<a href='#' onclick=\""+expendTree+"\">Expand All</a>&nbsp;&nbsp;"+
			"<a href='#' onclick=\""+collapseTree+"\">Collapse All</a>&nbsp;&nbsp;"+
			"<a href='#' onclick=\""+analyzeIndex+"\">Analyze Index</a>"+
		"<br>"+	filterDiv+"<br/>"+
		"<ul class='mktree' id='"+rootScenarios[0].getAttribute("id")+"'>" + 
		tree.html+
		"</ul>";

	var outputDiv = document.getElementById("divOutput");
	//outputDiv.innerHTML = result;
	outputDiv.innerHTML = htmlContent;

	/*
	* Update LI click option for expand/collpase.
	*/
	var spans = outputDiv.getElementsByClassName("bullet");

	/*
	* Update LI click option for expand/collpase.
	*/	
	updateSpanExpandCollpase(spans,false);

	calculateStatistics(tree);
}

/**
* Build Expand Collapse Button.
* if collapse is True build collpase,If false build expand.
*/
function buildExpandCollapseButtons(scenarios,collapse){
	var button = "";
	var scenarioLi;
	for(scn in scenarios) 
	{            
		scenarioLi = getAllChildsByType(scenarios[scn],"li");	

		for(valLi in scenarioLi){
			currScenarioName = getTestName(scenarioLi[valLi]);        		
			if(collapse) {
				button += "collapseTree('"+currScenarioName+"');";//Collapse All Button
			}
			else {
				button += "expandTree('"+currScenarioName+"');"; //Expend All Button
			}				
		}					
	}

	button += "return false;";

	return button;
}

/**
* Build the New Dynamic Tree with all of the scenarios.
*/
function buildDynamicTree(scenarios,filterByTester,failuresOnly,featuresOnly,collpaseExpandMode){
	var result = "";
	var scenarioLi;
	var tree = new TreeResult();
	
	var returnedTree;

	for(scn in scenarios) 
	{            
		scenarioLi = getAllChildsByType(scenarios[scn],"li");	

		for(valLi in scenarioLi){
			currScenarioName = getTestName(scenarioLi[valLi]);        		

			runOnAllChilds(scenarioLi[valLi],"",filterByTester,failuresOnly,featuresOnly,tree,collpaseExpandMode);        		
		}					
	}

	return tree;
}

/*
* Build the Options Table. Failures only, Testers,Colors and etc.
*/
function buildOptionsTable(filterByTester,failuresOnly,featuresOnly){
	/*
	Filter
	*/
	var filterDiv ="";

	filterDiv +="<div>";
	filterDiv +="<table>";
	filterDiv +="<tr>";
	filterDiv +="<td>";
	filterDiv +="<label>Dynamic Mode:</label>";
	filterDiv +="</td>";
	filterDiv +="<td>";
	filterDiv +=dynamicMode;
	filterDiv +="</td>";
	filterDiv +="</tr>";

	//Row #1
	filterDiv +="<tr>";
	filterDiv +="<td>";
	filterDiv +="<label>Failures Only</label>";
	filterDiv +="</td>";
	filterDiv +="<td>";
	/*
		Failures Only
	*/
	filterDiv +="<input type='checkbox' id='"+CHK_FAILURES_ONLY+"' name='"+CHK_FAILURES_ONLY+"' title='Failures Only'";
	if(failuresOnly){
		filterDiv +=" checked";		
	}
	filterDiv +=" onclick='renderTree(getSelectedTester(),isFailuresOnlyTree(),isFeaturesOnlyTree())'/>";
	filterDiv +="</td>";
	filterDiv +="</tr>";
	//Row #2
	filterDiv +="<tr>";
	filterDiv +="<td>";
	filterDiv +="<label>Features Only</label>";
	filterDiv +="</td>";
	filterDiv +="<td>";

	/*
	Features Only
	*/
	CHK_FEATURES_ONLY
		filterDiv +="<input type='checkbox' id='"+CHK_FEATURES_ONLY+"' name='"+CHK_FEATURES_ONLY+"' title='Failures Only'";
			if(featuresOnly){
				filterDiv +=" checked";		
			}
			filterDiv +=" onclick='renderTree(getSelectedTester(),isFailuresOnlyTree(),isFeaturesOnlyTree())'/>";

		filterDiv +="</td>";
		filterDiv +="</tr>";
		//Row #3
		filterDiv +="<tr>";
			filterDiv +="<td>";
			filterDiv +="<label>Tester:</label>";
			filterDiv +="</td>";
			filterDiv +="<td>";
			filterDiv +="<select id='"+filterSelectName+"' onchange='renderTree(this.value,isFailuresOnlyTree(),isFeaturesOnlyTree());'>";		
			if(typeof filterByTester === 'undefined'){
				if(filterByTester==filterDefaultValue){
					filterDiv +="<option value='"+filterDefaultValue+"' selected>"+filterDefaultValue+"</option>";
				}
				else {
					filterDiv +="<option value='"+filterDefaultValue+"'>"+filterDefaultValue+"</option>";	
				}
			}
			else {
				filterDiv +="<option value='"+filterDefaultValue+"' selected>"+filterDefaultValue+"</option>";
			}

			/*
			Add all Testers
			*/
			for(name in testersList.names){			
				if(typeof filterByTester === 'undefined'){
						filterDiv +="<option value='"+testersList.names[name]+"'>"+testersList.names[name]+"</option>";
					}
					else {				
						if(testersList.names[name]==filterByTester){
							filterDiv +="<option value='"+testersList.names[name]+"' selected>"+testersList.names[name]+"</option>";
						}
						else {
						
							filterDiv +="<option value='"+testersList.names[name]+"'>"+testersList.names[name]+"</option>";	
						}
					}
			}
			filterDiv +="</select>";
		filterDiv +="</td>";
		filterDiv +="</tr>";

		//Row #4
		filterDiv +="<tr>";
		filterDiv +="<td>";
			filterDiv += "<label>Color: </label>";
		filterDiv +="</td>";
		filterDiv +="<td>";
			filterDiv += "<select id='"+bgColorBomboxBoxId+"'>"+
					"<option value=''>None</option>"+
					"<option value='yellow' selected>Yellow</option>"+
					"<option value='blue'>Blue</option>"+
					"<option value='green'>Green</option>"+	        			
					"<option value='gray'>Gray</option>"+
					"<option value='brown'>Brown</option>"+
					"<option value='pink'>Pink</option>"+
					"<option value='purple'>Purple</option>"+
				"</select>";
		filterDiv +="</td>";
		filterDiv +="</tr>";
		filterDiv +="</table>";
	filterDiv +="</div>";

	return filterDiv;
}

function isFailuresOnlyTree(){
	return document.getElementById(CHK_FAILURES_ONLY).checked;
}

function isFeaturesOnlyTree(){
	return document.getElementById(CHK_FEATURES_ONLY).checked;
}
function getSelectedTester() {
	return document.getElementById(filterSelectName).value;    	
}

/*
	Generate Results (MAIN)
*/
function createNew(filterName)
{
	console.log("filterName: "+filterName);
	console.log("Dymanic mode: " +dynamicMode);
	prepareTestersInformation();
	if(dynamicMode){
		var results = "";
		fetchReport2('report2.html',function(text) { 		
		var ulLocation=text.toLowerCase().indexOf("<ul");
		var endBodyLocation=text.toLowerCase().indexOf("</body"); 	

		var reportContent="\n<ul"+text.substring(ulLocation+3, endBodyLocation);

		var contentOnPage= document.getElementById(DATA_DIV);
		contentOnPage.innerHTML = reportContent;
		renderTree(filterName,false,false);
		});		
	}
	else {
		renderTree(filterName,false,false);
	}	
}

/*
* Update Statistics Results
*
* tree - TreeResult
*/
function calculateStatistics(tree){
	var statistics = "";
	var passRate = (tree.totalPass/tree.totalTests)*100;
	if(Number.isNaN(passRate)){
		passRate = 0;
	}
	var passRateRound = Math.round(passRate);

	var dynamicTotal = sumAllInformationByClass(SCENARIO_TEST_TOTAL_CSS_CLASS);
	var dynamicPassed = sumAllInformationByClass(SCENARIO_TEST_PASSED_CSS_CLASS);

	var dynamicPassRate = (dynamicPassed/+dynamicTotal)*100;
	var dynamicPassRateRound = Math.round(dynamicPassRate);

	statistics += "Total Number of Tests : <u>" + dynamicTotal +"</u><br>";
	statistics += "Total Features: <u>" + sumAllFeatures() +"</u><br>";			
	statistics += "Total Pass: " + dynamicPassed +" <u>("+ dynamicPassRateRound+"%)</u><br>";					
	statistics += "Total Failed: " + (dynamicTotal - dynamicPassed) + " <u>(" + (100-dynamicPassRateRound)+"%)</u><br>";
	
	//Update Statistics Div
	var resultDiv = document.getElementById(STATISTICS_RESULTS_DIV);
	resultDiv.innerHTML=statistics;
}

function sumAllInformationByClass(cssClassName) {
	var scenarioInfos = document.getElementsByClassName(SCENARIO_INFORMATION_CSS_CLASS);
	var scenarioInfoContainer;
	var count = 0;
	var cssTmp;
	var isMarked;

	//console.log("cssClassName: " + cssClassName);
	for(var i=0;i<scenarioInfos.length;i++){
		scenarioInfoContainer = scenarioInfos[i];	
		isMarked = scenarioInfoContainer.getElementsByClassName(SCENARIO_CHECKBOX_INFORMATION_CSS_CLASS)[0];
		if(isMarked.checked){
			cssTmp = scenarioInfoContainer.getElementsByClassName(cssClassName)[0];

			count = count + parseInt(cssTmp.innerHTML);
		}
	}

	return count;
}

function sumAllFeatures(){
	 var scenarioInfos = document.getElementsByClassName(SCENARIO_INFORMATION_CSS_CLASS);
	var scenarioInfoContainer;
	var count = 0;
	var cssTmp;
	var isMarked;

	//console.log("cssClassName: " + cssClassName);
	for(var i=0;i<scenarioInfos.length;i++){
		scenarioInfoContainer = scenarioInfos[i];	
		isMarked = scenarioInfoContainer.getElementsByClassName(SCENARIO_CHECKBOX_INFORMATION_CSS_CLASS)[0];
		if(isMarked.checked){				
			count = count + 1;
		}
	}

	return count;
}

function findRootScenarios(){
//var rootScenarios = [];

	//var rootTree = document.getElementsByClassName("mktree");
	var inputDiv = document.getElementById(DATA_DIV);
	console.log("Input div");
	console.log(inputDiv);
	var found = getAllChildsByType(inputDiv,"ul");
	
	return found;
}


/**
* Get all Childs matching Type
*/
function getAllChildsByType(element,elementType){
	var childsFound = [];
	var i = 0;

	var findChild = element.childNodes;

	if(findChild!='undefined'){
		for(i=0;i<findChild.length;i++){
			if(findChild[i].nodeName.toLowerCase() == elementType){
				childsFound.push(findChild[i]);				
			}
		}
	}
	return childsFound;
}

function getAllChildsByClass(element,elementClassName){
	var childsFound = [];
	var i = 0;

	var findChild = element.childNodes;

	if(findChild!='undefined'){
		for(i=0;i<findChild.length;i++){
			if(findChild[i].className.indexOf(elementClassName) > -1){
				childsFound.push(findChild[i]);				
			}
		}
	}
	return childsFound;
}

/*
Receives UL
*/

function isContainTests(element)
{
	var found = getAllChildsByType(element,"span");	

	var result = (found.length>0);
	return result;
}

/*
Receives UL
*/
function isContainInnerScenario(element)
{
	var found = getAllChildsByType(element,"li");	

	var result = (found.length>0);
	return result;
}

function checkUnCheckAllChilds(treeScenario,checkValue) {
	var testChilds = treeScenario.getElementsByClassName(SCENARIO_CHECKBOX_INFORMATION_CSS_CLASS);    	
	console.log(treeScenario);
	for(val in testChilds){
		testChilds[val].checked = checkValue;
	}
	calculateStatistics(statisticsTree);
}

/*
	element - LI Tag.
	filterByTester - Test name in Array
	failuresOnly - Boolean
	featuresOnly - Boolean
	tree - TreeResult object
*/
function runOnAllChilds(element,parentSpan,filterByTester,failuresOnly,featuresOnly,tree,collpaseExpandMode) {
	var innerScenarios;
	var innerUL;
	var scenarioName = getTestName(element);
	var addToTree = false;

	innerUL = element.getElementsByTagName("UL")[0];

	/*
	1. first check if has inner scenarios.
	2. check if contains tests.
	*/
	if(isContainInnerScenario(innerUL)){
		tree.scenarioId = tree.scenarioId + 1;

		if(collpaseExpandMode){
			tree.html += "<li class='liOpen' id='LI_"+tree.scenarioId+"'>";
    			tree.html += "<span class='bullet'>&nbsp;</span>";
			tree.html += "<span class='"+TREE_LEVEL_ERRO_CSS+"'>";

	    		tree.html += "<input type='checkbox' checked class='"+SCENARIO_CHECKBOX_INFORMATION_CSS_CLASS+"' title='Include in calculation' id='' name='' onclick='checkUnCheckAllChilds(LI_"+
			tree.scenarioId+",this.checked)'>";
    			tree.html += "<b>"+scenarioName+"</b> ";
			tree.html += "</span>";

			tree.html += "<ul>";
		}
		else {
			tree.html += "<div id='LI_"+tree.scenarioId+"'>";
    			tree.html += "<b>"+scenarioName+"</b> ";
		}

		innerScenarios = getAllChildsByType(innerUL,"li");

		for(val in innerScenarios){			        
			runOnAllChilds(innerScenarios[val],'',filterByTester,failuresOnly,featuresOnly,tree,collpaseExpandMode);       				
		}

		if(collpaseExpandMode){
			tree.html += "</ul>";
			tree.html += "</li>";	
		}
		else {
			tree.html += "</div>";
		}
	}
	else if(isContainTests(innerUL)){
		//If matches Filter By Tester -> Add to tree
		if(filterByTester==filterDefaultValue)
		{				
			addToTree = true;
		}
		else {
			if(testersList[filterByTester].includes(getSimpleScenarioName(scenarioName))){
				addToTree = true;
			}				
		}

		/*
		Get test childs before checking Failure only because 
		countErr requires them.
		*/
		var testChilds = getAllChildsByType(innerUL,'span');
		
		if(failuresOnly && addToTree) {
			if(countErr(testChilds)>0){
				addToTree = true;
			}
			else {
				addToTree = false; //overide all else
			}
		}
		
		if(addToTree){
			addToTree = calculateScenarioPassRate(testChilds,scenarioName,failuresOnly,featuresOnly,tree,collpaseExpandMode);
		}			
	}

	return addToTree;
}

/*
* Get the Scenario Owner (Tester name)
*/
function getScenarioOwner(scenarioName){
	trimmedScenarioName = getSimpleScenarioName(scenarioName);

       for(name in testersList.names){                                 
               if(testersList[testersList.names[name]].includes(trimmedScenarioName)){
                       return testersList.names[name];
               }
       }

       return "Unknown Tester";
}

function getSimpleScenarioName(scenarioName){
	trimmedScenarioName = scenarioName.replace(/&nbsp;/g," ");
	trimmedScenarioName = trimmedScenarioName.indexOf("(") > -1 ? trimmedScenarioName.substr(0, trimmedScenarioName.indexOf("(")) : trimmedScenarioName;

	return trimmedScenarioName;
}

/*
	Should receive LI.
*/
function getTestName(element){
	/*
	 	We skip the first span in the Li because it's "<span class="bullet">&nbsp;</span>".
	 	The second SPAN is the Test name.
	*/

	var name = element.getElementsByTagName("span")[1].innerHTML;

	var spanElements = element.getElementsByTagName("span");
	
	for(var i=0;i<spanElements.length;i++){
		if(spanElements[i].getAttribute("class") != "bullet"){
			//console.log("Name: " +name);
			return spanElements[i].innerHTML.replace("&nbsp;","").trim();
		}
	}
	
	throw "Couldn't find TestName for element: "+element;
}

/*
	add Strike out to SPAN
*/	
function markAsDone(spanFieldId){
	var spanElement = document.getElementById(spanFieldId);
	var classInfo = spanElement.className;

	if(classInfo.indexOf(STRIKE_OUT_CSS)!=-1){
		classInfo = classInfo.replace(STRIKE_OUT_CSS,"");
		updateStyle(spanElement,false)
	}
	else{
		classInfo = classInfo + " "+STRIKE_OUT_CSS;
		updateStyle(spanElement,true);
	}
	
	spanElement.className = classInfo.trim();

}


/**
* Calculate Scenario Pass Rate
* testChilds - TestChilds
* scenarioName - Scenario Name
* failuresOnly - If true, Failures only. False all.
* feauresOnly - If true, Feature only. False all feautres.
* tree - TreeResult
* collpaseExpandMode - If True, show checkbox for unmapping this scenario. False don't show it.
*/
function calculateScenarioPassRate(testChilds,scenarioName,failuresOnly,featuresOnly,tree,collpaseExpandMode){
	var testPassed = countPass(testChilds);
	var testFailed = countErr(testChilds);
	var numberOfTests = countTests(testChilds);
	var color ="blue";
	var failedLinks = "";
	var scenarioResultStatus ="";
	var spanIdForScenario = "spanId"+spanFieldIdCounter;
	var addToTree  = false;
	tree.totalFeatures++; //count feature

	var passRate = (testPassed/numberOfTests)*100;
	var passRateRound = Math.round(passRate);	

	if(testFailed>0)
	{
		color = "red";
		failedLinks = getFailedLinks(testChilds,spanIdForScenario,collpaseExpandMode);
	}

	if((testFailed>0) || (testFailed ==0 && !failuresOnly && collpaseExpandMode) || (testFailed>0 && !collpaseExpandMode)){
		addToTree = true;
		/*
		* Build Html statistics for this scenario.
		*/
		if(collpaseExpandMode){
			tree.html += "<li class='liClosed'>";
			if(testFailed>0){		    	
			    	if(!featuresOnly){
					tree.html += "<span class='bullet'>&nbsp;</span>";
			    	}            	

			    	tree.html += "<span class='"+TREE_LEVEL_ERRO_CSS+"' id='"+spanIdForScenario+"'>";
			}
			else {
				tree.html += "<span class='"+TREE_LEVEL_PASS_CSS+"' id='"+spanIdForScenario+"'>";
			}
		}
		else {
			tree.html += "<div>";
		}

		/*
		* Get Tester Name
		*/	
		testerName = getScenarioOwner(scenarioName);

	    	/*
		Scenario Information
		*/        	

		if(collpaseExpandMode){
	    		tree.html += "<span class='"+SCENARIO_INFORMATION_CSS_CLASS+"' title='Tester: "+testerName+"'>";
	    		tree.html += "<input type='checkbox' checked class='"+SCENARIO_CHECKBOX_INFORMATION_CSS_CLASS+
			"' title='Include in calculation' id='' name='' onclick='calculateStatistics(statisticsTree);'>";
		    	tree.html += "<b>"+scenarioName+"</b> [Total: <span class='"+
			SCENARIO_TEST_TOTAL_CSS_CLASS+"'>"+numberOfTests+"</span>, Passed: <span class='"+
			SCENARIO_TEST_PASSED_CSS_CLASS+"'>"+testPassed+"</span>, Failed: <span class='"+
			SCENARIO_TEST_PASSED_CSS_CLASS+"'>"+(numberOfTests-testPassed)+"</span> ("+passRateRound+"%)]";
	    		tree.html += "<input type='checkbox' id='' name='' title='Mark as Done' onclick='markAsDone(\"spanId"+spanFieldIdCounter+"\")'>";
		    	tree.html += "</span>";    
			tree.html += "</span>";
		
			if(!featuresOnly){
				if(testFailed>0)
				{
					tree.html += "<ul>";								
					tree.html += "<li>Owner ["+testerName+"]</li>";
					tree.html += "<li>Passed ["+testPassed+"]</li>";
					tree.html += "<li>Failed ["+testFailed+"]</li>";								
					tree.html += failedLinks;
					tree.html += "</ul>";					
				}
			}

			tree.html += "</li>";
		}
		else {	    		
		    	tree.html += "<span title='Tester: "+testerName+"'><b>"+scenarioName+"</b> [Failed: "+(testFailed)+", Passed "+passRateRound+"%)]</span><br>";
		
			if(!featuresOnly){
				if(testFailed>0)
				{
					/*tree.html += "Passed ["+testPassed+"]<br>";
					tree.html += "Failed ["+testFailed+"]<br>";*/
					tree.html += failedLinks;
				}
			}
			tree.html += "</div><br><br>";
		}
	}
				
	tree.totalTests += numberOfTests;
	tree.totalPass += testPassed;
	
	spanFieldIdCounter++;

	return addToTree;
}


function countPass(allSpans)
{

	//var allSpans = childTmp.getElementsByTagName("span");
	var count =0;
	var i =0;


	for(i=0;i<allSpans.length;i++)
	{

		if(allSpans[i].getAttribute("class") == TEST_LIST_PASS_CSS || allSpans[i].getAttribute("class") == TEST_LIST_WARN_CSS)
		{

			if(isNotSutChangeTest(allSpans[i]))
				count++;

		}

	}
	
	return count;
}
/*
* collpaseExpandMode - If True, show checkbox for unmapping this scenario. False don't show it.
*/
function getFailedLinks(allSpans,parentSpanId,collpaseExpandMode)
{
	//var allSpans = childTmp.getElementsByTagName("span");
	var count =0;
	var i =0;

	var allFailedLinks = "";

	var failedLink = "";

	for(i=0;i<allSpans.length;i++)
	{
		if(allSpans[i].getAttribute("class")  == TEST_LIST_ERRO_CSS)
		{
			failedLink = allSpans[i].innerHTML;
			failedLink = failedLink.replace("<br>","");
			failedLink = failedLink.replace("<BR>","");
			failedLink = failedLink.replace("\"=\"\"","");
							
			//console.log(failedLink);

			//allFailedLinks += "<li class='liTest' onclick='updateStyle(this)'>\n"+failedLink+"\n</li>";
			allFailedLinks += "<li>";					
			allFailedLinks += "<span  id='"+parentSpanId+"_Failed"+i+"'>";				
			allFailedLinks += "\n"+failedLink;
			allFailedLinks += "</span>";
			if(collpaseExpandMode){
				allFailedLinks += "<input type='checkbox' onclick='updateStyle("+parentSpanId+"_Failed"+i+",this.checked)'/>\n";
			}
			allFailedLinks += "</li>";				
			
		}

	}
	
	return allFailedLinks;
}


function countTests(allSpans)
{

	//var allSpans = childTmp.getElementsByTagName("span");
	var count =0;
	var i =0;

	for(i=0;i<allSpans.length;i++)
	{
		if(isNotSutChangeTest(allSpans[i]))
			count++;
	}
	
	return count;
}



function isNotSutChangeTest(element)
{	
	var text = element.getElementsByTagName("a")[0].innerHTML;
		
	return (text.indexOf("ChangeSutTest")==-1);		

}


function countErr(allSpans)
{
	//var allSpans = childTmp.getElementsByTagName("span");
	var count =0;
	var i =0;

	for(i=0;i<allSpans.length;i++)
	{			
		if(allSpans[i].getAttribute("class") == TEST_LIST_ERRO_CSS)
		{
			if(isNotSutChangeTest(allSpans[i]))
				count++;
		}
	}

	return count;
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
	return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function fetchReport2(link, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", link, true);
	xhr.onreadystatechange = function() {
	        if (xhr.readyState === 4) {
			callback(xhr.responseText);
	        }
    	};
	xhr.send(null);
}

/*
* Counter Object
*/
function TreeResult () {
	this.totalPass = 0;
	this.totalTests = 0;
	this.totalFeatures = 0;
	this.scenarioId = 0;
	this.html = "";
}

/*
* Clone Tree
* tree - TreeResult
* copyHtml - Boolean. If true copy the html content.
*/
function cloneTreeResult(tree,copyHtml){
	var clonedTree = new TreeResult();

	clonedTree.totalPass = tree.totalPass;
	clonedTree.totalTests = tree.totalTests;
	clonedTree.totalFeatures = tree.totalFeatures;
	clonedTree.scenarioId  = tree.scenarioId;
	if(copyHtml) {
		clonedTree.html = fromtreehtml;
	}
	
	return clonedTree;
}