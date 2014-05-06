//var Kategorie = {1: "Baustelle", 2: "Achtung", 16: "Vollsperrung", 19: "Informationen", 20: "Parken Innenstadt", 21: "Parkpltze", 22: "Park+Ride"}
var Kategorie = {1: Baustelle, 2: "Achtung", 16: Vollsperrung, 19: "Informationen", 20: "Parken Innenstadt", 21: "Parkpltze", 22: "Park+Ride"}


function Baustelle(poi){
	this.id = poi.id;
	this.name = poi.name;
	this.kat = {id: poi.kat.id, name: "Baustelle"};
	this.poi = poi;
	

		
	if(poi.f != undefined & poi.f != "") { this.direction = "N"; }
	if(poi.g != undefined & poi.g != "") { this.direction = "O"; }
	if(poi.j != undefined & poi.j != "") { this.direction = "S"; }
	if(poi.k != undefined & poi.k != "") { this.direction = "W"; }
	
	var dateParts = poi.h.split(".");
	var beginDate = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
	dateParts = poi.i.split(".");
	var endDate = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
	
	this.date = {begin: beginDate, end: endDate};
	this.limitation = {begin: poi.d,end: poi.c, type: poi.e};
	this.redirection = poi.m;
}

function Vollsperrung(poi){
	this.id = poi.id;
	this.name = poi.name;
	this.kat = {id: poi.kat.id, name: "Vollsperrung"};
	this.poi = poi;
  
	if(poi.f != undefined & poi.f != "") { poi.direction = "N"; }
	if(poi.g != undefined & poi.g != "") { poi.direction = "O"; }
	if(poi.j != undefined & poi.j != "") { poi.direction = "S"; }
	if(poi.i != undefined & poi.i != "") { poi.direction = "W"; }
    
	var dateParts = poi.j.split(".");
	var beginDate = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
	dateParts = poi.k.split(".");
	var endDate = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
	
	this.date = {begin: beginDate, end: endDate};
	this.limitation = {begin: poi.c,end: poi.d, type: poi.e};
	this.redirection = poi.m;
	
	function toString(){
		return "Vollsperrung zw. " + this.limitation.begin + " und " + this.limitation.end;
	}
}

function parsePOIs(poisDataStr){
  
  var poiStr = poisDataStr.split("#");
  var pois = [];
  
  for(var i = 0; i< poiStr.length; i++) {
	  var poiDaten = poiStr[i].split("$");
	  var poi = {};

// 	  //alert(poiDaten);
	  poi.id = poiDaten[0];
	  poi.name = poiDaten[1];
	  poi.kat = {name: Kategorie[ parseInt(poiDaten[2]) ], id: parseInt(poiDaten[2])};
	  poi.comment = poiDaten[3];
	  poi.a = poiDaten[4];
	  poi.b = poiDaten[5];
	  poi.c = poiDaten[6];
	  poi.d = poiDaten[7];
	  poi.e = poiDaten[8];
	  poi.f = poiDaten[9];
	  poi.g = poiDaten[10];
	  poi.h = poiDaten[11];
	  poi.i = poiDaten[12];
	  poi.j = poiDaten[13];
	  poi.k = poiDaten[14];
	  poi.l = poiDaten[15];
	  poi.m = poiDaten[16];
	  poi.picture = poiDaten[34];
	  
	  
	  if (typeof Kategorie[poiDaten[2]] == "function"){
		poi = new Kategorie[poiDaten[2]](poi);
	  } else {
	    
	  
	  
	  switch(parseInt(poiDaten[2])) {
		case 2:
			if(poi.e != undefined & poi.e != "") { poi.direction = "N"; }
			if(poi.f != undefined & poi.f != "") { poi.direction = "O"; }
			if(poi.g != undefined & poi.g != "") { poi.direction = "S"; }
			if(poi.h != undefined & poi.h != "") { poi.direction = "W"; }
		break;

		
		case 19:
			if(poi.d != undefined & poi.d != "") { poi.direction = "N"; }
			if(poi.e != undefined & poi.e != "") { poi.direction = "O"; }
			if(poi.f != undefined & poi.f != "") { poi.direction = "S"; }
			if(poi.g != undefined & poi.g != "") { poi.direction = "W"; }
		break;
		case 20:
		case 21:
		case 22:
			if(poi.i != undefined & poi.i != "") { poi.direction = "N"; }
			if(poi.j != undefined & poi.j != "") { poi.direction = "O"; }
			if(poi.k != undefined & poi.k != "") { poi.direction = "S"; }
			if(poi.l != undefined & poi.l != "") { poi.direction = "W"; }
		break;
	  }
	  }
	  
	  pois.push(poi);
  }
  return pois;
}
