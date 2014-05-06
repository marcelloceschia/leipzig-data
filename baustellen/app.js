var util = require('util')
  , url = require('url')
  , httpAgent = require('http-agent')
  , fs = require('fs')
  , jsdom = require('jsdom').jsdom;
  

var vm = require('vm');
var includeInThisContext = function(path) {
    var code = fs.readFileSync(path);
    vm.runInThisContext(code, path);
}.bind(this);
includeInThisContext(__dirname+"/baustellen.js");
 
function printTop3(agent) { 

	var window = jsdom(agent.body).createWindow();

	var poisDataStr = window.document.getElementById('PoiData').value;
	var POIs = parsePOIs(poisDataStr);
	var Vollsperrung = POIs.filter(function(element, index, array){ return element.kat.id == 16});
	var Baustelle = POIs.filter(function(element, index, array){ return element.kat.id == 1});
	

	var Objects = POIs.filter(function(element, index, array){ return element.kat.id == 1 || element.kat.id == 16});
		
	/* add _id and update update time */
	var baustellen = [];
	Objects.forEach(function(item){item.update = new Date()});
	Objects.forEach(function(item){ 
		item.id = {type: item.kat.name, id: parseInt(item.poi.id)};
		baustellen.push(item);
	});

	var baustellenJsonFilename = 'data/baustellen.json';

	fs.writeFile(baustellenJsonFilename, JSON.stringify(baustellen, null, 4), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved to " + baustellenJsonFilename);
	    }
	});
		

  
}
 
var urls = ['/start.aspx'];
var agent = httpAgent.create('verkehrsinformationssystem.leipzig.de', urls);
console.log('Scraping', urls.length, 'pages from', agent.host);
 
agent.addListener('next', function (err, agent) {
  printTop3(agent);
  console.log();
  agent.next();
});
 
agent.addListener('stop', function (err, agent) {
  if (err) console.log(err);
  console.log('All done!');
});
 
// Start scraping
agent.start(); 
