var fs = require('fs');
var jsdom = require('jsdom');

var jsdomConfig = {
          features: {
            FetchExternalResources   : ['script'],
            ProcessExternalResources : ['script'],
            MutationEvents           : '2.0',
        }
    };

var kataList = [];

var EinrichtungsArt = {1: "Kindertagesstätte", 2: "Tagesmutter", 4: "integr. Kindertagesstätte", 5: "integr. Tagesmutter"}


jsdom.env({
	url: "https://www.meinkitaplatz-leipzig.de/WFRecherche.aspx",
	scripts: ["http://code.jquery.com/jquery-1.5.min.js"],
	features: {
            FetchExternalResources   : ['script'],
            ProcessExternalResources : ['script'],
            MutationEvents           : '2.0',
	},
  	done: function (errors, window) {
    	var $ = window.$;

    	var geoData = window.geoData;
    	kataList = geoData.map(function(elementStr){
    		var data = elementStr.split("|");
    		return {id: parseInt(data[0]), address: data[2],  lng: parseFloat(data[3]), lat: parseFloat(data[4]), name: data[5], district: data[6], type: EinrichtungsArt[ data[1]] };
    	});

		var exportJsonFilename = 'data/kitas.json';

		fs.writeFile(exportJsonFilename, JSON.stringify(kataList, null, 4), function(err) {
		    if(err) {
		      console.log(err);
		    } else {
		      console.log("JSON saved to " + exportJsonFilename);
		    }
		});

		var csvData = Object.keys(kataList[0]).join("\t") + "\n";
		csvData += kataList.map( function(kita){ return Object.keys(kita).map(function (key) { return kita[key]; }).join("\t"); }).join("\n");

		var exportCSVFilename = 'data/kitas.csv';

		fs.writeFile(exportCSVFilename, csvData, function(err) {
		    if(err) {
		      console.log(err);
		    } else {
		      console.log("JSON saved to " + exportCSVFilename);
		    }
		});

		/* TODO: read details of each element
		details can be get using https://www.meinkitaplatz-leipzig.de/WFSucheTppDetails.aspx?b=GUID where GUID is an unique id
		e.g. https://www.meinkitaplatz-leipzig.de/WFSucheTppDetails.aspx?b=9d86f44b-1d18-443a-9cbb-2a634a6450e0
		*/
  	}
});
