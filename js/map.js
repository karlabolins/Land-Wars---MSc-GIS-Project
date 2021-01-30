var map, map2, lat, lng, marker, npc1, gmMarker, bbox, cellSide, options, hexgrid, polygons, hexGridNew, center, centerPoints,  geojson, centerPointsNew, nearest, nearestTest, nearestID, nearestTestID, team, level, experience, strength,character, playerPoly, randomPos, moveNPC, randomNum, createNum, npcSpawnTimer, tileOwnerArray, landcoverPos, posA, posB, totalDistance, totalDistanceCheck, strCheck, strChange, qAns, expChange, expCheck, levelUp, levelChange, levelCheck, goldReward, totalGold, dbFolder, expReward, gmMarkLoc, captured, reduceStr, dispMsg, lvldispMsg, surveyMsg, scoutMsg,scrollMsg, goldCheck, potMsg, numPotBought, numScrollBought, tileNum, zoomvar, charCheck, rectangle;
  
strChange = 0;
qAns = 0;
expChange = 0;
levelUp = 0;
levelChange = 0;
totalGold = 0;
numPotBought = 0;
numScrollBought =0;

//Load game map
function initMap(){   
    locSelected = true;
    
    map = L.map('map').setView([0,0], 3);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: 'pk.eyJ1Ijoia2FybGFibyIsImEiOiJjang2a2g1NDEwMG5kM3BvdGx3ZTljaGl4In0.4Q8W0DhnG-S2sLgEHWER8w'
    }).addTo(map);
    
    //Hexgrid settings
    cellSide = 100;
    options = {units: 'meters', properties: {id:0}};

    hexgrid = turf.hexGrid(bbox, cellSide, options);
    
    polygons = [];
    center = [];
    centerPoints = [];
    
    //Convert each hextile into a turf polygon and assign an ID
    for (var i = 0; i < hexgrid.features.length; i++){
        
        //push the polygons into an array
        polygons.push(turf.polygon(hexgrid.features[i].geometry.coordinates, {id:'poly'+[i], owner:'none', center: turf.center(hexgrid.features[i])}));
        
        //push the center of each hexbin into an array
        center.push(turf.center(hexgrid.features[i]));
        
        //create turf points for the centers and push into an array
        centerPoints.push(turf.point(center[i].geometry.coordinates, {id:i}));
    }
    
    hexGridNew = turf.featureCollection(polygons);
    centerPointsNew = turf.featureCollection(centerPoints);
    
    console.log(centerPointsNew);
    console.log(hexGridNew);
    
    //load geoJSON layer onto map
    geojson = L.geoJson(hexGridNew, {
        style: style,
    }).addTo(map);  

    console.log(geojson);
    
    //Set random tile owner
    setRandomTiles();
    
    totalDistance = 0;
    
    //Display log-in message
    document.getElementById("gamemsg").innerHTML = "Welcome "+character+"! <br> Beginner's tip: Complete land surveys to strengthen your character!";
    document.getElementById("gamemsg").style.color = "green";
    
    clearTimeout(dispMsg);
    dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);

    document.getElementById("totDist").innerHTML = "Total Distance: " + totalDistance +"m";

    document.getElementById("distest").innerHTML = "TDC: " + totalDistanceCheck +"m";

    document.getElementById("strchange").innerHTML = "Strength: " + strength+"/100";
    
    zoomvar = false;
    
    //Geolocation
    map.locate({watch: true, 
                setView: false, 
                timeout: 10000,
                enableHighAccuracy: true,
                maxZoom: 20});
    
    //Determine lat,lng of players position
    map.on('locationfound', function (locationEvent) {
        lat = locationEvent.latitude;
        lng = locationEvent.longitude;
        console.log(lat, lng);
        
     if (zoomvar == false)  {
        map.setView([lat, lng],20);
        zoomvar = true;
     }
        
     document.getElementById("msg").innerHTML = "Latitude: " + lat + "<br>Longitude: " + lng;
    
    //Update marker position and remove previous marker
    if (marker) {
        map.removeLayer(marker);
    }
    if (team == "Red"){
        marker = L.marker([lat,lng], {icon: redRightIcon}).addTo(map); 
    }
    else if (team == "Blue"){
        marker = L.marker([lat,lng], {icon: blueRightIcon}).addTo(map); 
    }
        
    //Determine the nearest point to the marker (based on the center of hexbins)    
    nearest = turf.nearestPoint([lng, lat], centerPointsNew);  
        
    //Determine the id of the hexbin
    nearestID = nearest.properties.id;
    console.log(nearestID);
        
    document.getElementById("marker").innerHTML = "Marker Latitude: " + lat + "<br>Marker Longitude: " + lng;
    
    //Distance calculation function    
    if (posA){

        posB = turf.point([lng, lat]);

        var distance = (turf.distance(posA, posB, {units:'kilometers'}))*1000;
        var distanceCheck = (turf.distance(posA, posB, {units:'kilometers'}))*1000;
        
        console.log(distance);
        console.log(distanceCheck);

        posA = false;

        totalDistance = Math.round(totalDistance + distance);
        totalDistanceCheck = Math.round(totalDistanceCheck + distanceCheck);
        
        console.log(totalDistanceCheck);
        console.log(totalDistance);

        document.getElementById("totDist").innerHTML = "Total Distance: " + totalDistance +"m";

        document.getElementById("distest").innerHTML = "TDC: " + totalDistanceCheck +"m";

    } else if (posA == false){

        posA = turf.point([lng, lat]);

        var distance = (turf.distance(posB, posA, {units:'kilometers'}))*1000;
        var distanceCheck = (turf.distance(posB, posA, {units:'kilometers'}))*1000;

        posB = false;

        totalDistance = Math.round(totalDistance+ distance);
        totalDistanceCheck = Math.round(totalDistanceCheck + distanceCheck);

        document.getElementById("totDist").innerHTML = "Total Distance: " + totalDistance +"m";

        document.getElementById("distest").innerHTML = "TDC: " + totalDistanceCheck +"m";

    } else {

        posA = turf.point([lng, lat]);

        posB = turf.point([lng, lat]);


    }
        
    if (totalDistanceCheck >= 25){

        totalDistanceCheck = 0;
        strChange +=1;

        addStrength();

        document.getElementById("distest").innerHTML = "TDC: " + totalDistanceCheck +"m";

//        document.getElementById("strchange").innerHTML = "SC: " + strChange;

    }
    
    //Show or hide shop and scout button    
    shopCheck();  
    scoutCheck();
        
    
 })
    
    
//Draggable marker for testing purposes during development
//    gmMarker = L.marker(gmMarkLoc,{
//        draggable: true, 
//        icon: redRightIcon
//    }).addTo(map);
//    
//    gmMarker.on('dragend', function (e) {
//        document.getElementById("marker").innerHTML = "Marker Latitude: " + gmMarker.getLatLng().lat + "<br>Marker Longitude: " + gmMarker.getLatLng().lng;
//        map.setView([gmMarker.getLatLng().lat, gmMarker.getLatLng().lng],17); 
//        
//        if (posA){
//            
//            posB = turf.point([gmMarker.getLatLng().lng, gmMarker.getLatLng().lat]);
//            
//            var distance = (turf.distance(posA, posB, {units:'kilometers'}))*1000;
//            var distanceCheck = (turf.distance(posA, posB, {units:'kilometers'}))*1000;
//            
//            posA = false;
//            
//            totalDistance = Math.round(totalDistance + distance);
//            totalDistanceCheck = Math.round(totalDistanceCheck + distanceCheck);
//            
//            document.getElementById("totDist").innerHTML = "Total Distance: " + totalDistance +"m";
//            
//            document.getElementById("distest").innerHTML = "TDC: " + totalDistanceCheck +"m";
//                 
//        } else if (posA == false){
//            
//            posA = turf.point([gmMarker.getLatLng().lng, gmMarker.getLatLng().lat]);
//            
//            var distance = (turf.distance(posB, posA, {units:'kilometers'}))*1000;
//            var distanceCheck = (turf.distance(posB, posA, {units:'kilometers'}))*1000;
//            
//            posB = false;
//            
//            totalDistance = Math.round(totalDistance+ distance);
//            totalDistanceCheck = Math.round(totalDistanceCheck + distanceCheck);
//            
//            document.getElementById("totDist").innerHTML = "Total Distance: " + totalDistance +"m";
//            
//            document.getElementById("distest").innerHTML = "TDC: " + totalDistanceCheck +"m";
//            
//        } else {
//            
//            posA = turf.point([gmMarker.getLatLng().lng, gmMarker.getLatLng().lat]);
//            
//            posB = turf.point([gmMarker.getLatLng().lng, gmMarker.getLatLng().lat]);
//            
//            
//        }
//        
//        
//        if (totalDistanceCheck >= 50){
//            
//            totalDistanceCheck = 0;
//            strChange +=1;
//            
//            addStrength();
//            
//            document.getElementById("distest").innerHTML = "TDC: " + totalDistanceCheck +"m";
//            
//            document.getElementById("strchange").innerHTML = "SC: " + strChange;
//            
//        }
//        
//               
//        var nearestTest = turf.nearestPoint([gmMarker.getLatLng().lng, gmMarker.getLatLng().lat], centerPointsNew);
//        
//        nearestTestID = nearestTest.properties.id;
//        console.log(nearestTestID);
//        
//        shopCheck();
//        
//    });
    
//    addInfoBox();
    
}

//Load land survey map
function initMap2(){
    
    map2 = L.map('map2', {dragging: false}).setView([53.46199902007057, -2.2304821014404297], 15);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1Ijoia2FybGFibyIsImEiOiJjang2a2g1NDEwMG5kM3BvdGx3ZTljaGl4In0.4Q8W0DhnG-S2sLgEHWER8w'
    }).addTo(map2);
    
    
}


//Read database to get account information
function getTeam(user){
    
    var docRef = db.collection("characters").doc(user);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            
            console.log("Team:", doc.data().Team);
            team = doc.data().Team;
            level = doc.data().Level;
            strength = doc.data().Strength;
            character = doc.data().CharacterName;
            experience = doc.data().Experience;
            gold = doc.data().Gold;  
            totalDistanceCheck = doc.data().Distancecheck;  
            captured = doc.data().Captured;  
            strCheck = strength;
            expCheck = experience;
            goldCheck = gold;
            levelCheck = level;
            console.log(team);
            
            document.getElementById("charnameID").innerHTML = "Character Name: " + character;
            document.getElementById("teamID").innerHTML = "Team: " + team;
            document.getElementById("levelID").innerHTML = "Level: " + level;
            document.getElementById("strID").innerHTML = "Strength: " + strength;
            document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
            document.getElementById("goldID").innerHTML = "Gold: " + gold;
            document.getElementById("welcomePlayer").innerHTML = "Hello, " + character+"!";
            

        } else {
            // doc.data() will be undefined in this case
            console.log("Team not found!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });   
}

//read the database and set tile owner (Decided to not implement)
//function setTiles(){
//    
//    tileOwnerArray=[];
//    
//    for (var i = 0; i < hexgrid.features.length; i++){
//        
//        var docRef = db.collection("tiles").doc("id"+i);
//
//        docRef.get().then(function(doc) {
//        if (doc.exists) {
//            
//            var tileOwner = doc.data().owner; //reads the owner of the tile in the database and pushes into an array
////            console.log(tileOwnerArray[i]);
//            tileOwnerArray.push(tileOwner);
//            
//        } else {
//            // doc.data() will be undefined in this case
//            console.log("Owner not found!");
//        }
//    }).catch(function(error) {
//        console.log("Error getting document:", error);
//    });
//        
//    }
//    
//    
//    setTimeout(function(){
//        
//        for (var i = 0; i < hexgrid.features.length; i++){
//            
//        hexGridNew.features[i].properties.owner = tileOwnerArray[i];
//      
//        }
//        
//        updateColor();
//        
//    }, 7000);
//    
//}

//Submit land survey answer
function submitAnswer(){
    
    charCheck = document.getElementById("research_answer").value;
    
    if (charCheck == "empty" || charCheck == "" ){
        alert("Please enter an answer!");
    } else {
        
        var landcoverAns = document.getElementById("research_answer").value;
        var answerLat = landcoverPos[1];
        var answerLong = landcoverPos[0];
        
        //Random number generator to determine reward
        var rand = Math.floor(Math.random()*100)+1;
        
        if (rand >= 1 && rand <=60){
            
            goldReward = Math.floor(Math.random()*5)+1;
            expReward = 5;
            
        } if (rand >= 61 && rand <= 90){
            
            goldReward = (Math.floor(Math.random()*5)+1)+10;
            expReward = 10;
            
        } if (rand >= 91 && rand <= 100){
            
            goldReward = (Math.floor(Math.random()*5)+1)+20;
            expReward = 20;
            
        }
        
        console.log("rand = "+rand);
        console.log("Gold Reward = "+goldReward);
        console.log("Exp Reward = "+expReward);

        db.collection(dbFolder).doc().set({
        LandCover: landcoverAns,
        latitude: answerLat,
        longitude: answerLong
        })
        .then(function() {
            
            db.collection("characters").doc(email_id).update({
            Experience: firebase.firestore.FieldValue.increment(expReward),
            Gold: firebase.firestore.FieldValue.increment(goldReward),
            Answered: firebase.firestore.FieldValue.increment(1)
            
            }).then(function() {
                
                var docRef = db.collection("characters").doc(email_id);

                docRef.get().then(function(doc) {
                if (doc.exists) {
                    experience = doc.data().Experience;
                    gold = doc.data().Gold;
                    document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
                    document.getElementById("goldID").innerHTML = "Gold: " + gold;
                    goldCheck = gold;
                    expCheck = experience;
                    qAns++;
                    totalGold += goldReward;
                    expChange += expReward;
                    
                    document.getElementById("map2msg").innerHTML = "Survey successful!";
                    document.getElementById("map2msg").style.color = "green";
                    
                    clearTimeout(surveyMsg);
                    surveyMsg = setTimeout(function(){document.getElementById("map2msg").innerHTML = "";}, 1000);
                    questionsStart();
                    
                        if (expCheck >= 100){
                            
                            db.collection("characters").doc(email_id).update({
                            Level: firebase.firestore.FieldValue.increment(1),
                            Experience: firebase.firestore.FieldValue.increment(-100)
                            }).then(function(){
                            
                                console.log("Level up!")

                                levelUp ++;
                                levelChange ++;

                                var docRef = db.collection("characters").doc(email_id);

                                docRef.get().then(function(doc) {
                                if (doc.exists) {
                                    experience = doc.data().Experience;
                                    level = doc.data().Level;
                                    document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
                                    document.getElementById("levelID").innerHTML = "Level: " + level; 
                                    expCheck = experience;
                                    levelCheck = level;
                            }
                            })
                         })
                     }                 
                } 
            })       
            console.log("Land Cover successfully written!");
        })
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
    }

}

//Update tile colour based on owner
function updateColor (){
    geojson.eachLayer(function(layer){
        if(layer.feature.properties.owner == 'Red'){
            layer.setStyle( {fillColor: 'red',
                            fillOpacity: 0.3})
        } 
        
        if(layer.feature.properties.owner == 'Blue'){
            layer.setStyle( {fillColor: 'blue',
                            fillOpacity: 0.3})
        }  
    });
}


//Info box during development stage (Not in Live)
function addInfoBox(){

    // create a Leaflet control (generic term for anything you add to the map)
    info = L.control();

    // create the info box to update with population figures on hover
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    // create a function called update() that updates the contents
    info.update = function (props) {

        // if properties have been passed, then use them to fill in the info box
        if (props){
            this._div.innerHTML = 'Owner:' + props.owner + ' &nbsp ID:' + props.id;

        // otherwise, just set to a default message
        } else {
            this._div.innerHTML = 'Hover over a hex bin';
        }
    };

    // add the info window to the map
    info.addTo(map);
} 


//Events used during development stage (Not in Live)
function setEvents(feature, layer) {

    //add event listeners for mouseover and mouseout
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
    });
}


//Events used during development stage (Not in Live)
function highlightFeature(e) {	// e refers to the event object

    // e.target is the hexbin that was hovered over
    var layer = e.target;

//     set the style to yellow
    layer.setStyle({
        fillColor: 'yellow',
    });

    //update the info box
    info.update(layer.feature.properties);
}


//Events used during development stage (Not in Live)
function resetHighlight(e) {	// e refers to the event object

    //reset the style of the country that was turned yellow
    geojson.resetStyle(e.target);	// e.target is the hexbin that was hovered over
    
    //update the info box
//    info.update();
    
    setTimeout(updateColor, 100);
}

//NPC random movement (Not implemented in game)
randomNum = Math.floor(Math.random()*(4-1+1)+1);
function npcMove() {
    var framesPerSecond = 30;
    randomPos = turf.randomPosition(bbox);
    
    var moveDistanceLR = 0.000015968686505; 
    var moveDistanceUD = 0.000007984343253; 
    var moveUp = moveDistanceUD;
    var moveRight = moveDistanceLR;
    var moveDown = -moveDistanceUD;
    var moveLeft = -moveDistanceLR;
    
    clearInterval(createNum);
    createNum = setInterval(function(){
        randomNum = Math.floor(Math.random()*(4-1+1)+1);
        console.log("Random number: "+ randomNum);
    }, 5000);
    
    clearInterval(moveNPC);
    moveNPC = setInterval(function() {
        if (npc1) {
            map.removeLayer(npc1);
        }
        if (team == 'Red'){
            
            if(randomNum == 3){
                
                npc1 = L.marker([randomPos[1],randomPos[0]], {icon: blueLeftIcon}).addTo(map);
            
            } else{
                
                npc1 = L.marker([randomPos[1],randomPos[0]], {icon: blueRightIcon}).addTo(map);
            }
            
            var nearestTestNpc = turf.nearestPoint(randomPos, centerPointsNew);
            var nearestTestIDNpc = nearestTestNpc.properties.id;
            hexGridNew.features[nearestTestIDNpc].properties.owner = 'Blue';
            updateColor();
            
        }
        
        else if (team == 'Blue'){
            
            if(randomNum == 3){
                
                npc1 = L.marker([randomPos[1],randomPos[0]], {icon: redLeftIcon}).addTo(map);
            
            } else{
                
                npc1 = L.marker([randomPos[1],randomPos[0]], {icon: redRightIcon}).addTo(map);
            }
            
            var nearestTestNpc = turf.nearestPoint(randomPos, centerPointsNew);
            var nearestTestIDNpc = nearestTestNpc.properties.id;
            hexGridNew.features[nearestTestIDNpc].properties.owner = 'Red';
            updateColor();
            
        } else {
            
            console.log("Npc Error");
        }
    
    if (randomNum == 1){
        randomPos[1] += moveUp;       //up
    }    else if (randomNum == 2){
        randomPos[1] += moveDown;     //down
    }    else if (randomNum == 3){
        randomPos[0] += moveLeft;     //left
    }    else if (randomNum == 4){
        randomPos[0] += moveRight;    //right
    }
              
    }, 1000/framesPerSecond);
}

//Timer to spawn NPC (Not in game)
function npcSpawnOnTimer(){
    
    npcSpawnTimer = setInterval(npcMove, 5000);
    
}

//Function to kill NPC (Not in game)
function killNPC() {
    clearInterval(moveNPC);
    clearInterval(createNum);
    map.removeLayer(npc1);
}

//Function to set random owner to tiles
function setRandomTiles(){
   
    var i;
    
    for(i = 0; i < tileNum; i++) {
        
        var randomTile = turf.randomPosition(bbox);
        var nearestTestHex = turf.nearestPoint(randomTile, centerPointsNew);
        var nearestTestIDHex = nearestTestHex.properties.id;
        var rand = Math.floor(Math.random()*10)+1;
        
        if (rand <=5){
        hexGridNew.features[nearestTestIDHex].properties.owner = 'Blue';
        updateColor();
        }
        
        if (rand >= 6){
        hexGridNew.features[nearestTestIDHex].properties.owner = 'Red';
        updateColor();
        }
    }
          
}

//Feeds random location to survey map
function questionsStart(){
      
    
    setTimeout(function(){map2.invalidateSize()}, 100);
    
    document.getElementById("gamemap").style.display = "none";
    document.getElementById("quizmap").style.display = "block";
    if (rectangle){
        map2.removeLayer(rectangle);
    }
    document.getElementById("research_answer").value="";
    landcoverPos = turf.randomPosition(bbox);
    console.log(landcoverPos);
    map2.setView([landcoverPos[1], landcoverPos[0]], 18);
    var circle = new L.Circle([landcoverPos[1], landcoverPos[0]], 30).addTo(map2);
    rectangle = L.rectangle(circle.getBounds(), {fillOpacity:0}).addTo(map2);
    map2.removeLayer(circle);
   
}

//Return to game from survey 
function returnGame(){
    
    setTimeout(function(){map.invalidateSize()}, 100);
    document.getElementById("gamemap").style.display = "block";
    document.getElementById("quizmap").style.display = "none";
    
    if (qAns == 0){
        
        console.log("No surveys completed")
        
    }
    else {
    
        console.log("Surveys done: "+qAns);
        console.log("Exp gained: "+expChange +"%" );
        console.log("Gold gained: "+totalGold);
        console.log("Levels gained: "+levelUp);

        document.getElementById("gamemsg").innerHTML = "Surveys completed!<br> Total surveys done = " +qAns+ "<br> Rewards: <br> Experience + "+expChange+ "%<br> Gold + "+ totalGold;
        document.getElementById("gamemsg").style.color = "green";

        clearTimeout(dispMsg);
        dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);

        if (levelUp >= 1){

        document.getElementById("lvlupmsg").innerHTML = "LEVEL UP!";
        document.getElementById("lvlupmsg").style.color = "green";

        clearTimeout(lvldispMsg);
        lvldispMsg = setTimeout(function(){document.getElementById("lvlupmsg").innerHTML = ""}, 10000);

        }
        setTimeout(function(){expChange = 0; levelUp = 0; totalGold =0; qAns = 0;}, 3000);
    }
}

//Update tile owner to DB (Not implemented)
function updateOneTile(tile){
    
    var tileOwner = hexGridNew.features[tile].properties.owner;
    
    db.collection("tiles").doc("id"+tile).set({
    owner: tileOwner
    })
    .then(function() {
        console.log("Owner Update Success");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
    
}

//Scan all tile owner and write to database (Not used due to high DB usage)
//function updateAllTiles(){
//    
//    for (var i = 0; i < hexgrid.features.length; i++){
//    
//    var tileOwner = hexGridNew.features[i].properties.owner;
//    
//    db.collection("tiles").doc("id"+i).set({
//    owner: tileOwner
//    })
//    .then(function() {
////        console.log("Tile owners saved!");
//    })
//    .catch(function(error) {
//        console.error("Error writing document: ", error);
//    });
//        
//    }
//    
//    console.log("Tile owners saved!");
//}

//Function to add strength after player movement
function addStrength(){
    
    if (strCheck >= 100){
        console.log("Max Strength!")
    } else {
    db.collection('characters').doc(email_id).update({
        Strength: firebase.firestore.FieldValue.increment(1),
        Totaldistance:firebase.firestore.FieldValue.increment(25),
        Distancecheck: 0
    }).then(function(){
        
         var docRef = db.collection("characters").doc(email_id);

                docRef.get().then(function(doc) {
                if (doc.exists) {
                    strength = doc.data().Strength;
                    totalDistanceCheck = doc.data().Distancecheck;
                    document.getElementById("strID").innerHTML = "Strength: " + strength; 
                    strCheck=strength;
                    
                    document.getElementById("strchange").innerHTML = "Strength: " + strength+"/100"; 
                    console.log("Strength Added");
                    document.getElementById("distest").innerHTML = "TDC: " + totalDistanceCheck +"m";
                    document.getElementById("gamemsg").innerHTML = "Strength + 1";
                    document.getElementById("gamemsg").style.color = "green";

                    clearTimeout(dispMsg);
                    dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 5000);
                } 
            })
        
        }) 
    }
    
}

//Capture tile button
function captureTile(){
    
    if (team == "Blue"){
        
        if (hexGridNew.features[nearestID].properties.owner == 'Blue') {
            
            console.log('This area already belongs to your team!');
            document.getElementById("gamemsg").innerHTML = "This area already belongs to your team!";
            document.getElementById("gamemsg").style.color = "green";
            
            clearTimeout(dispMsg);
            dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);  
        }
        
        if (hexGridNew.features[nearestID].properties.owner == 'none'){
            
            //Success chance calculator
            var successChance = (strCheck*1.2) + (levelCheck+50);
            var rand = Math.floor(Math.random()*100)+1;
            
            console.log("success chance = "+successChance);
            console.log("Roll = "+rand);
            
            
            if (rand <= successChance){
                //gold and exp reward
                var goldGained = Math.floor((Math.random()*25)+1)+25; //25-50
                var expGained = Math.floor((Math.random()*10)+1)+15; //15-25

                db.collection("characters").doc(email_id).update({
                Experience: firebase.firestore.FieldValue.increment(expGained),
                Gold: firebase.firestore.FieldValue.increment(goldGained),
                Captured: firebase.firestore.FieldValue.increment(1)   
                }).then(function(){

                    var docRef = db.collection("characters").doc(email_id);

                    docRef.get().then(function(doc) {
                        if (doc.exists) {
                            experience = doc.data().Experience;
                            gold = doc.data().Gold;
                            goldCheck = gold;
                            expCheck = experience;
                            console.log('Capture Successful!');
                            console.log('Gold + '+goldGained);
                            console.log('Exp + '+expGained);

                            document.getElementById("gamemsg").innerHTML = "Capture successful!<br>Rewards: <br> Experience + "+expGained+ "%<br> Gold + "+ goldGained;
                            document.getElementById("gamemsg").style.color = "green";
                            document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
                            document.getElementById("goldID").innerHTML = "Gold: " + gold;

                            hexGridNew.features[nearestID].properties.owner = 'Blue';
                            updateColor();
                            
                            clearTimeout(dispMsg);
                            dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);

                                if (expCheck >= 100){

                                db.collection("characters").doc(email_id).update({
                                Level: firebase.firestore.FieldValue.increment(1),
                                Experience: firebase.firestore.FieldValue.increment(-100)
                                }).then(function(){

                                    console.log("Level up!")
                                    
                                    document.getElementById("lvlupmsg").innerHTML = "LEVEL UP!";
                                    document.getElementById("lvlupmsg").style.color = "green";

                                    clearTimeout(lvldispMsg);
                                    lvldispMsg = setTimeout(function(){document.getElementById("lvlupmsg").innerHTML = ""}, 10000);
                                    levelUp ++;
                                    levelChange ++;

                                    var docRef = db.collection("characters").doc(email_id);

                                    docRef.get().then(function(doc) {
                                        if (doc.exists) {
                                            experience = doc.data().Experience;
                                            level = doc.data().Level;
                                            document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
                                            document.getElementById("levelID").innerHTML = "Level: " + level; 
                                            expCheck = experience;
                                            levelCheck = level;
                                            }   
                                        })
                                    })
                                }
                            }
                        })
                    })
            } else {
                
                if (strCheck >= 5){
                    
                    reduceStr = firebase.firestore.FieldValue.increment(-5);
                    
                } else {
                
                    reduceStr = 0;
                    
                }
                
                db.collection("characters").doc(email_id).update({
                Strength: reduceStr,
                Gold: firebase.firestore.FieldValue.increment(-10)
                }).then(function(){
                    
                    var docRef = db.collection("characters").doc(email_id);

                    docRef.get().then(function(doc) {
                        if (doc.exists) {
                            gold = doc.data().Gold;
                            strength = doc.data().Strength;
                            goldCheck = gold;
                            strCheck = strength;
            
                            console.log('Capture Failed!');
                            console.log('Gold - 10');
                            console.log('Str -5 ');

                            document.getElementById("gamemsg").innerHTML = "Capture Failed!<br> Strength - 5 <br> Gold - 10 ";
                            document.getElementById("gamemsg").style.color = "red";
                            document.getElementById("strID").innerHTML = "Strength: " + strength;
                            document.getElementById("strchange").innerHTML = "Strength: " + strength +"/100";
                            document.getElementById("goldID").innerHTML = "Gold: " + gold;
                            
                            clearTimeout(dispMsg);
                            dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);
                            
                        }
                    })    
                })   
            }   
        }
        
        if (hexGridNew.features[nearestID].properties.owner == 'Red'){
            
            var successChance = (strCheck/1.5) + (levelCheck+25);
            var rand = Math.floor(Math.random()*100)+1;
            
            console.log("success chance = "+successChance);
            console.log("Roll = "+rand);
            
            if (rand <= successChance){
            
                var goldGained = Math.floor((Math.random()*50)+1)+50; //50-100
                var expGained = Math.floor((Math.random()*15)+1)+25; //25-40

                db.collection("characters").doc(email_id).update({
                Experience: firebase.firestore.FieldValue.increment(expGained),
                Gold: firebase.firestore.FieldValue.increment(goldGained),
                Captured: firebase.firestore.FieldValue.increment(1)   
                }).then(function(){

                    var docRef = db.collection("characters").doc(email_id);

                    docRef.get().then(function(doc) {
                        if (doc.exists) {
                            experience = doc.data().Experience;
                            gold = doc.data().Gold;
                            goldCheck = gold;
                            expCheck = experience;
                            console.log('Capture Successful!');
                            console.log('Gold + '+goldGained);
                            console.log('Exp + '+expGained);

                            document.getElementById("gamemsg").innerHTML = "Capture successful!<br>Rewards: <br> Experience + "+expGained+ "%<br> Gold + "+ goldGained;
                            document.getElementById("gamemsg").style.color = "green";
                            document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
                            document.getElementById("goldID").innerHTML = "Gold: " + gold;

                            hexGridNew.features[nearestID].properties.owner = 'Blue';
                            updateColor();
                            
                            clearTimeout(dispMsg);
                            dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);

                                if (expCheck >= 100){

                                db.collection("characters").doc(email_id).update({
                                Level: firebase.firestore.FieldValue.increment(1),
                                Experience: firebase.firestore.FieldValue.increment(-100)
                                }).then(function(){

                                    console.log("Level up!")
                                    
                                    document.getElementById("lvlupmsg").innerHTML = "LEVEL UP!";
                                    document.getElementById("lvlupmsg").style.color = "green";

                                    clearTimeout(lvldispMsg);
                                    lvldispMsg = setTimeout(function(){document.getElementById("lvlupmsg").innerHTML = ""}, 10000);
                                    levelUp ++;
                                    levelChange ++;

                                    var docRef = db.collection("characters").doc(email_id);

                                    docRef.get().then(function(doc) {
                                        if (doc.exists) {
                                            experience = doc.data().Experience;
                                            level = doc.data().Level;
                                            document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
                                            document.getElementById("levelID").innerHTML = "Level: " + level; 
                                            expCheck = experience;
                                            levelCheck = level;
                                            }   
                                        })
                                    })
                                }
                            }
                        })
                    })
            } 
            else {
                
                if (strCheck >= 10){
                    
                    reduceStr = firebase.firestore.FieldValue.increment(-10);
                    
                } else {
                
                    reduceStr = 0;
                    
                }
                
                db.collection("characters").doc(email_id).update({
                Strength: reduceStr,
                Gold: firebase.firestore.FieldValue.increment(-25)
                }).then(function(){
                    
                    var docRef = db.collection("characters").doc(email_id);

                    docRef.get().then(function(doc) {
                        if (doc.exists) {
                            gold = doc.data().Gold;
                            strength = doc.data().Strength;
                            goldCheck = gold;
                            strCheck = strength;
            
                            console.log('Capture Failed!');
                            console.log('Gold - 25');
                            console.log('Str - 10 ');

                            document.getElementById("gamemsg").innerHTML = "Capture Failed!<br> Strength - 10 <br> Gold - 25 ";
                            document.getElementById("gamemsg").style.color = "red";
                            document.getElementById("strID").innerHTML = "Strength: " + strength;
                            document.getElementById("goldID").innerHTML = "Gold: " + gold;
                            
                            clearTimeout(dispMsg);
                            dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);
                            
                        }
                    })    
                })   
            }
        }
    } 
    
    if (team == "Red"){
        
        if (hexGridNew.features[nearestID].properties.owner == 'Red') {
            
            console.log('This area already belongs to your team!');
            document.getElementById("gamemsg").innerHTML = "This area already belongs to your team!";
            document.getElementById("gamemsg").style.color = "green";
            
            clearTimeout(dispMsg);
            dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);  
        }
        
        if (hexGridNew.features[nearestID].properties.owner == 'none'){
            
            var successChance = (strCheck*1.2) + (levelCheck+50);
            var rand = Math.floor(Math.random()*100)+1;
            
            console.log("success chance = "+successChance);
            console.log("Roll = "+rand);
            
            
            if (rand <= successChance){
            
                var goldGained = Math.floor((Math.random()*25)+1)+25; //25-50
                var expGained = Math.floor((Math.random()*10)+1)+15; //15-25

                db.collection("characters").doc(email_id).update({
                Experience: firebase.firestore.FieldValue.increment(expGained),
                Gold: firebase.firestore.FieldValue.increment(goldGained),
                Captured: firebase.firestore.FieldValue.increment(1)   
                }).then(function(){

                    var docRef = db.collection("characters").doc(email_id);

                    docRef.get().then(function(doc) {
                        if (doc.exists) {
                            experience = doc.data().Experience;
                            gold = doc.data().Gold;
                            goldCheck = gold;
                            expCheck = experience;
                            console.log('Capture Successful!');
                            console.log('Gold + '+goldGained);
                            console.log('Exp + '+expGained);

                            document.getElementById("gamemsg").innerHTML = "Capture successful!<br>Rewards: <br> Experience + "+expGained+ "%<br> Gold + "+ goldGained;
                            document.getElementById("gamemsg").style.color = "green";
                            document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
                            document.getElementById("goldID").innerHTML = "Gold: " + gold;

                            hexGridNew.features[nearestID].properties.owner = 'Red';
                            updateColor();
                            
                            clearTimeout(dispMsg);
                            dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);

                                if (expCheck >= 100){

                                db.collection("characters").doc(email_id).update({
                                Level: firebase.firestore.FieldValue.increment(1),
                                Experience: firebase.firestore.FieldValue.increment(-100)
                                }).then(function(){

                                    console.log("Level up!")
                                    
                                    document.getElementById("lvlupmsg").innerHTML = "LEVEL UP!";
                                    document.getElementById("lvlupmsg").style.color = "green";

                                    clearTimeout(lvldispMsg);
                                    lvldispMsg = setTimeout(function(){document.getElementById("lvlupmsg").innerHTML = ""}, 10000);
                                    levelUp ++;
                                    levelChange ++;

                                    var docRef = db.collection("characters").doc(email_id);

                                    docRef.get().then(function(doc) {
                                        if (doc.exists) {
                                            experience = doc.data().Experience;
                                            level = doc.data().Level;
                                            document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
                                            document.getElementById("levelID").innerHTML = "Level: " + level; 
                                            expCheck = experience;
                                            levelCheck = level;
                                            }   
                                        })
                                    })
                                }
                            }
                        })
                    })
            } else {
                
                if (strCheck >= 5){
                    
                    reduceStr = firebase.firestore.FieldValue.increment(-5);
                    
                } else {
                
                    reduceStr = 0;
                    
                }
                
                db.collection("characters").doc(email_id).update({
                Strength: reduceStr,
                Gold: firebase.firestore.FieldValue.increment(-10)
                }).then(function(){
                    
                    var docRef = db.collection("characters").doc(email_id);

                    docRef.get().then(function(doc) {
                        if (doc.exists) {
                            gold = doc.data().Gold;
                            strength = doc.data().Strength;
                            goldCheck = gold;
                            strCheck = strength;
            
                            console.log('Capture Failed!');
                            console.log('Gold - 10');
                            console.log('Str -5 ');

                            document.getElementById("gamemsg").innerHTML = "Capture Failed!<br> Strength - 5 <br> Gold - 10 ";
                            document.getElementById("gamemsg").style.color = "red";
                            document.getElementById("strID").innerHTML = "Strength: " + strength;
                            document.getElementById("goldID").innerHTML = "Gold: " + gold;
                            
                            clearTimeout(dispMsg);
                            dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);
                            
                        }
                    })    
                })   
            }   
        }
        
        if (hexGridNew.features[nearestID].properties.owner == 'Blue'){
            
            var successChance = (strCheck/1.5) + (levelCheck+25);
            var rand = Math.floor(Math.random()*100)+1;
            
            console.log("success chance = "+successChance);
            console.log("Roll = "+rand);
            
            if (rand <= successChance){
            
                var goldGained = Math.floor((Math.random()*50)+1)+50; //50-100
                var expGained = Math.floor((Math.random()*15)+1)+25; //25-40

                db.collection("characters").doc(email_id).update({
                Experience: firebase.firestore.FieldValue.increment(expGained),
                Gold: firebase.firestore.FieldValue.increment(goldGained),
                Captured: firebase.firestore.FieldValue.increment(1)   
                }).then(function(){

                    var docRef = db.collection("characters").doc(email_id);

                    docRef.get().then(function(doc) {
                        if (doc.exists) {
                            experience = doc.data().Experience;
                            gold = doc.data().Gold;
                            goldCheck = gold;
                            expCheck = experience;
                            console.log('Capture Successful!');
                            console.log('Gold + '+goldGained);
                            console.log('Exp + '+expGained);

                            document.getElementById("gamemsg").innerHTML = "Capture successful!<br>Rewards: <br> Experience + "+expGained+ "%<br> Gold + "+ goldGained;
                            document.getElementById("gamemsg").style.color = "green";
                            document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
                            document.getElementById("goldID").innerHTML = "Gold: " + gold;

                            hexGridNew.features[nearestID].properties.owner = 'Red';
                            updateColor();
                            
                            clearTimeout(dispMsg);
                            dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);

                                if (expCheck >= 100){

                                db.collection("characters").doc(email_id).update({
                                Level: firebase.firestore.FieldValue.increment(1),
                                Experience: firebase.firestore.FieldValue.increment(-100)
                                }).then(function(){

                                    console.log("Level up!")
                                    
                                    document.getElementById("lvlupmsg").innerHTML = "LEVEL UP!";
                                    document.getElementById("lvlupmsg").style.color = "green";

                                    clearTimeout(lvldispMsg);
                                    lvldispMsg = setTimeout(function(){document.getElementById("lvlupmsg").innerHTML = ""}, 10000);
                                    levelUp ++;
                                    levelChange ++;

                                    var docRef = db.collection("characters").doc(email_id);

                                    docRef.get().then(function(doc) {
                                        if (doc.exists) {
                                            experience = doc.data().Experience;
                                            level = doc.data().Level;
                                            document.getElementById("expID").innerHTML = "Experience: " + experience + "%";
                                            document.getElementById("levelID").innerHTML = "Level: " + level; 
                                            expCheck = experience;
                                            levelCheck = level;
                                            }   
                                        })
                                    })
                                }
                            }
                        })
                    })
            } 
            else {
                
                if (strCheck >= 10){
                    
                    reduceStr = firebase.firestore.FieldValue.increment(-10);
                    
                } else {
                
                    reduceStr = 0;
                    
                }
                
                db.collection("characters").doc(email_id).update({
                Strength: reduceStr,
                Gold: firebase.firestore.FieldValue.increment(-25)
                }).then(function(){
                    
                    var docRef = db.collection("characters").doc(email_id);

                    docRef.get().then(function(doc) {
                        if (doc.exists) {
                            gold = doc.data().Gold;
                            strength = doc.data().Strength;
                            strCheck = strength;
                            goldCheck = gold;
            
                            console.log('Capture Failed!');
                            console.log('Gold - 25');
                            console.log('Str - 10 ');

                            document.getElementById("gamemsg").innerHTML = "Capture Failed!<br> Strength - 10 <br> Gold - 25 ";
                            document.getElementById("gamemsg").style.color = "red";
                            document.getElementById("strID").innerHTML = "Strength: " + strength;
                            document.getElementById("goldID").innerHTML = "Gold: " + gold;
                            
                            clearTimeout(dispMsg);
                            dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000);
                            
                        }
                    })    
                })   
            }
        }
    } 
}

//check to see if scout button should be shown
function scoutCheck(){
    var currentPos = turf.point([lng, lat]);
    var nearestHex = turf.point([nearest.geometry.coordinates[0],nearest.geometry.coordinates[1]]);
    var distScan = (turf.distance(currentPos, nearestHex, {units:'kilometers'}))*1000;
    console.log(distScan);
    
    if(distScan >= 200){
        
        console.log("Not in play zone");
        document.getElementById("scoutbtn").style.display = "none";
        
    }
    else{
        
        document.getElementById("scoutbtn").style.display = "inline-block";
    }
}

//Scout button function
function displayChance(){
    
    if (team == 'Red'){
        
        if (hexGridNew.features[nearestID].properties.owner == 'Blue'){
            
           var successChance = (strCheck/2) + levelCheck;

           document.getElementById("scoutmsg").innerHTML = "This area is occupied by the enemy team! <br> Your chance of success in capturing this is approximately " +  successChance + "%"; 
            
            document.getElementById("scoutmsg").style.color = "blue";

            clearTimeout(scoutMsg);
            scoutMsg = setTimeout(function(){document.getElementById("scoutmsg").innerHTML = ""}, 10000); 
            
        }
        
        if (hexGridNew.features[nearestID].properties.owner == 'none'){
            
           var successChance = (strCheck*1.5) + levelCheck;

           document.getElementById("scoutmsg").innerHTML = "This area is unoccupied but there could still be danger lurking! <br> Your chance of success in capturing this is approximately " +  successChance + "%"; 
            
            document.getElementById("scoutmsg").style.color = "blue";

            clearTimeout(scoutMsg);
            scoutMsg = setTimeout(function(){document.getElementById("scoutmsg").innerHTML = ""}, 10000);               
        }
        
        if (hexGridNew.features[nearestID].properties.owner == 'Red'){
            
            document.getElementById("scoutmsg").innerHTML = "This area is controlled by your team! You may visit stores here to purchase items which will help you on your journey."; 
            
            document.getElementById("scoutmsg").style.color = "blue";

            clearTimeout(scoutMsg);
            scoutMsg = setTimeout(function(){document.getElementById("scoutmsg").innerHTML = ""}, 10000);
              
        }
            
        
    }
    
        if (team == 'Blue'){
        
        if (hexGridNew.features[nearestID].properties.owner == 'Red'){
            
           var successChance = (strCheck/2) + levelCheck;

           document.getElementById("scoutmsg").innerHTML = "This area is occupied by the enemy team! <br> Your chance of success in capturing this is approximately " +  successChance + "%"; 
            
            document.getElementById("scoutmsg").style.color = "blue";

            clearTimeout(scoutMsg);
            scoutMsg = setTimeout(function(){document.getElementById("scoutmsg").innerHTML = ""}, 10000); 
            
        }
        
        if (hexGridNew.features[nearestID].properties.owner == 'none'){
            
           var successChance = (strCheck*1.5) + levelCheck;

           document.getElementById("scoutmsg").innerHTML = "This area is unoccupied but there could still be danger lurking! <br> Your chance of success in capturing this is approximately " +  successChance + "%"; 
            
            document.getElementById("scoutmsg").style.color = "blue";

            clearTimeout(scoutMsg);
            scoutMsg = setTimeout(function(){document.getElementById("scoutmsg").innerHTML = ""}, 10000);               
        }
        
        if (hexGridNew.features[nearestID].properties.owner == 'Blue'){
            
            document.getElementById("scoutmsg").innerHTML = "This area is controlled by your team! You may visit stores here to purchase items which will help you on your journey."; 
            
            document.getElementById("scoutmsg").style.color = "blue";

            clearTimeout(scoutMsg);
            scoutMsg = setTimeout(function(){document.getElementById("scoutmsg").innerHTML = ""}, 10000);            
        }              
    }    
}

//Check to see if shop button should be shown
function shopCheck(){
    
    var currentPos = turf.point([lng, lat]);
    var nearestHex = turf.point([nearest.geometry.coordinates[0],nearest.geometry.coordinates[1]]);
    var distScan = (turf.distance(currentPos, nearestHex, {units:'kilometers'}))*1000;
    console.log(distScan);
    
    if(distScan >= 200){
        
        console.log("Not in play zone");
        document.getElementById("marker").style.display = "block";
        document.getElementById("marker").innerHTML = "You are not within the play zone.";
        document.getElementById("marker").style.color = "red";
        
    }
    
    else {
        document.getElementById("marker").style.display = "none";
        var shopdiv = document.getElementById("shopbtn");
        var capturediv = document.getElementById("capturebtn");

        var hexTeam = hexGridNew.features[nearestID].properties.owner;

        if (team == hexTeam){

            shopdiv.style.display = "inline-block";
            capturediv.style.display = "none";

        } 

        else {

            shopdiv.style.display = "none";
            capturediv.style.display = "inline-block"; 

        }
    }
}

//Open shop
function openShop (){
    
    document.getElementById("gamemap").style.display = "none";
    document.getElementById("shopmenu").style.display = "block";
    
}

//Close shop and show purchase messages
function closeShop(){
    
    
    if (numPotBought > 0 && numScrollBought > 0){
    
        var strPlus = numPotBought * 10;

        document.getElementById("gamemsg").innerHTML = "Strength + " +strPlus+ "<br> Level + "+numScrollBought;
        document.getElementById("gamemsg").style.color = "green";
        
        clearTimeout(dispMsg);
        dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000)
        
    } else if(numPotBought > 0 && numScrollBought == 0 ){
        
        var strPlus = numPotBought * 10;

        document.getElementById("gamemsg").innerHTML = "Strength + " +strPlus;
        document.getElementById("gamemsg").style.color = "green";
        
        clearTimeout(dispMsg);
        dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000)
        
    } else if (numPotBought == 0 && numScrollBought > 0 ){
        
        document.getElementById("gamemsg").innerHTML = "Level + " +numScrollBought;
        document.getElementById("gamemsg").style.color = "green";
        
        clearTimeout(dispMsg);
        dispMsg = setTimeout(function(){document.getElementById("gamemsg").innerHTML = ""}, 10000)
        
    }
    
    setTimeout(function(){map.invalidateSize()}, 100);
    document.getElementById("gamemap").style.display = "block";
    document.getElementById("shopmenu").style.display = "none";
    setTimeout(function(){numPotBought =0; numScrollBought =0;}, 2000);
    
}

//Purchase potion button
function buyPotion(){
    
    if (goldCheck < 100){
        
        document.getElementById("potmsg").innerHTML = "You don't have enough gold!"; 
            
        document.getElementById("potmsg").style.color = "red";
        
        potMsg = setTimeout(function(){document.getElementById("potmsg").innerHTML = ""}, 10000);
        
    }
    
    if (strCheck == 100 && goldCheck >= 100){
        
        document.getElementById("potmsg").innerHTML = "You already have maximum strength!"; 
            
        document.getElementById("potmsg").style.color = "green";
        
        potMsg = setTimeout(function(){document.getElementById("potmsg").innerHTML = ""}, 10000);
        
    }
    
    if (strCheck != 100 && strCheck >= 90 && goldCheck >= 100){
        
        db.collection("characters").doc(email_id).update({
            Strength:100,
            Gold:firebase.firestore.FieldValue.increment(-100)
            }).then(function() {
                
                var docRef = db.collection("characters").doc(email_id);

                docRef.get().then(function(doc) {
                    if (doc.exists) {
                        gold = doc.data().Gold;
                        strength = doc.data().Strength;
                        strCheck = strength;
                        goldCheck = gold;
                        numPotBought++;
                        
                        document.getElementById("potmsg").innerHTML = "Purchase successful! x "+numPotBought; 

                        document.getElementById("potmsg").style.color = "green";
                        
                        document.getElementById("strchange").innerHTML = "Strength: " + strength+"/100";

                        potMsg = setTimeout(function(){document.getElementById("potmsg").innerHTML = ""}, 10000);
                        
                        document.getElementById("strID").innerHTML = "Strength: " + strength;
                        document.getElementById("goldID").innerHTML = "Gold: " + gold;
                        
                        }
                })
        })
    } 
    
    if (strCheck < 90 && goldCheck >= 100){
        
        db.collection("characters").doc(email_id).update({
            Strength:firebase.firestore.FieldValue.increment(10),
            Gold:firebase.firestore.FieldValue.increment(-100)
            }).then(function() {
                
                var docRef = db.collection("characters").doc(email_id);

                docRef.get().then(function(doc) {
                    if (doc.exists) {
                        gold = doc.data().Gold;
                        strength = doc.data().Strength;
                        strCheck = strength;
                        goldCheck = gold;
                        numPotBought++;
                        
                        document.getElementById("potmsg").innerHTML = "Purchase successful! x "+numPotBought;

                        document.getElementById("potmsg").style.color = "green";
                        
                        document.getElementById("strchange").innerHTML = "Strength: " + strength +"/100";

                        potMsg = setTimeout(function(){document.getElementById("potmsg").innerHTML = ""}, 10000);
                        
                        document.getElementById("strID").innerHTML = "Strength: " + strength;
                        document.getElementById("goldID").innerHTML = "Gold: " + gold;
                        
                        }
                })
        })
    }
    
}

//Purchase scroll button
function buyScroll(){
    
    if (goldCheck < 500){

        document.getElementById("scrollmsg").innerHTML = "You don't have enough gold!"; 

        document.getElementById("scrollmsg").style.color = "red";

        potMsg = setTimeout(function(){document.getElementById("scrollmsg").innerHTML = ""}, 10000);

    }
        
    if (goldCheck >= 500){

        db.collection("characters").doc(email_id).update({
        Level:firebase.firestore.FieldValue.increment(1),
        Gold:firebase.firestore.FieldValue.increment(-500)
        }).then(function() {

            var docRef = db.collection("characters").doc(email_id);

            docRef.get().then(function(doc) {
                if (doc.exists) {
                    gold = doc.data().Gold;
                    level = doc.data().Level;
                    goldCheck = gold;
                    levelCheck = level;
                    numScrollBought++;

                    document.getElementById("scrollmsg").innerHTML = "Purchase successful! x "+numScrollBought;

                    document.getElementById("scrollmsg").style.color = "green";

                    scrollMsg = setTimeout(function(){document.getElementById("scrollmsg").innerHTML = ""}, 10000);

                    document.getElementById("levelID").innerHTML = "Level: " + level;
                    document.getElementById("goldID").innerHTML = "Gold: " + gold;

                }
            })
        })
    }
    
}

//Style functions for tiles and markers
function style(){
     return {
        fillColor: "#f5f7f6",
        fillOpacity: 0.3,
        color:'black'
    };
}


function styleRed(){
    return {
        fillColor: "#ef1414",
        fillOpacity: 0.6  
    };   
}

function styleBlue(){
    return {
        fillColor: "#155ee8",
        fillOpacity: 0.6  
    };
}

var blueLeftIcon = L.icon({
                iconUrl: 'img/icons/blueLeft.png',
                iconSize:[32, 37], 
                iconAnchor:[16, 37], 
            });

var blueRightIcon = L.icon({
                iconUrl: 'img/icons/blueRight.png',
                iconSize:[32, 37], 
                iconAnchor:[16, 37], 
            });

var warrIcon = L.icon({
                iconUrl: 'img/icons/warrior.png',
                iconSize:[32, 37],
                iconAnchor:[16, 37], 
            });

var redRightIcon = L.icon({
                iconUrl: 'img/icons/redRight.png',
                iconSize:[50, 50],
                iconAnchor:[25, 50],
            });

var redLeftIcon = L.icon({
                iconUrl: 'img/icons/redLeft.png',
                iconSize:[50, 50],
                iconAnchor:[25, 50],
            });