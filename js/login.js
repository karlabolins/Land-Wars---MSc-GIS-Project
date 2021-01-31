// Initialize Firebase
var config = {
    apiKey: "AIzaSyDhjIJ8hFB-1UUe9Kx2WiaAomMaErdw8JY",
    authDomain: "land-cover-game.firebaseapp.com",
    databaseURL: "https://land-cover-game.firebaseio.com",
    projectId: "land-cover-game",
    storageBucket: "",
    messagingSenderId: "1097145254377",
    appId: "1:1097145254377:web:9512b90bbce2d41d"
};
firebase.initializeApp(config);
const db=firebase.firestore();
var email_id, playername,playerlevel, captured, answered;
var locSelected = false;
var rank = [];
var lvlrank = [];
var rank2 = [];
var caprank = [];
var rank3 = [];
var ansrank = [];

//Show div based on authentication state
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    
    //Show user div and hide login div
    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";
    document.getElementById("create_div").style.display = "none";
    document.getElementById("gamemap").style.display = "none";
    document.getElementById("quizmap").style.display = "none";
    document.getElementById("locSelect").style.display = "none";
    

    var user = firebase.auth().currentUser;

    if(user != null){

        email_id = user.email;
        var email_verified = user.emailVerified;

        if (email_verified){
          document.getElementById("verify_btn").style.display = "none";
        } else {
          document.getElementById("verify_btn").style.display = "none";
        }

        document.getElementById("user_para").innerHTML = "Player email : " + email_id;
        
//         <br/> Email verified: " + email_verified;
        
        getTeam(email_id);
        
    }

  } else {
    // No user is signed in.
    //hide user div and show login div  
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";
    document.getElementById("create_div").style.display = "none";
    document.getElementById("gamemap").style.display = "none";
    document.getElementById("quizmap").style.display = "none";
    document.getElementById("locSelect").style.display = "none";
  }
});

//login button
function login(){

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    window.alert("Error : " + errorMessage);

    // ...
  });

}

//create account button
function create_account(){
    
    if (nameAllow == false || teamSelected == false || emailAllow == false ){
        
        window.alert("Please complete all fields!")
        
    } else {
    var userEmail = document.getElementById("email_field2").value;
    var userPass = document.getElementById("password_field2").value;   
    
    firebase.auth().createUserWithEmailAndPassword(userEmail, userPass).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        window.alert("Error : " + errorMessage);

        // ...
      });
    }
    
}

//logout button
function logout(){
    
    if (map != null){
        
    map.remove();
    map = null;
    map2.remove();
    map2 = null;
        
    }
    if (totalDistance == null){
        
        posA = null;
        totalDistance = 0;
        locSelected = false;
        firebase.auth().signOut();
        
        console.log("logout successful!")
        
    } else{
        db.collection("characters").doc(email_id).update({
        Totaldistance: firebase.firestore.FieldValue.increment(totalDistanceCheck),
        Distancecheck: totalDistanceCheck
        }).then(function(){

            posA = null;
            totalDistance = 0;
            locSelected = false;
            firebase.auth().signOut();

            console.log("logout successful!")

        })
    }
    
}

//Send email verification (NOT USED/HIDDEN)
function send_verification(){
    
    var user = firebase.auth().currentUser;

    user.sendEmailVerification().then(function() {  
      // Email sent.
        
        window.alert("Verification Sent")
        
    }).catch(function(error) {
      // An error happened.
        
        window.alert("Error: " + error.message)
    });

}

//Create new account div
function createNew(){
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "none";
    document.getElementById("create_div").style.display = "block";
    document.getElementById("gamemap").style.display = "none";
    document.getElementById("quizmap").style.display = "none";
    document.getElementById("locSelect").style.display = "none";
}

//Return from acc creation div
function returnLogin(){
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";
    document.getElementById("create_div").style.display = "none";
    document.getElementById("gamemap").style.display = "none";
    document.getElementById("quizmap").style.display = "none";
    document.getElementById("locSelect").style.display = "none";
}

//Write new account to database
function createDb(){
    
    var charName = document.getElementById("char_name").value;
    var userEmail = document.getElementById("email_field2").value;
    var charTeam = document.querySelector('.teamSel:checked').value;
    
    // Add a new document in collection "cities"
    db.collection("characters").doc(userEmail).set({
        Level: 1,
        Strength: 0,
        Experience: 0,
        Team: charTeam,
        CharacterName: charName,
        Gold: 0,
        Totaldistance: 0,
        Distancecheck: 0,
        Answered: 0,
        Captured:0,
    })
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
    
    db.collection("usernames").doc(charName).set({
        Email: userEmail
    })
    .then(function() {
        console.log("Document2 successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });    
        
}

//Only allow one team to be chosen in acc creation page
var teamSelected = false;
function selectOnlyThis(id) {
    for (var i = 1;i <= 2; i++)
    {
        document.getElementById("cb" + i).checked = false;
    }
    document.getElementById(id).checked = true;
    teamSelected = true;
}

//Delay a function
function delayedFunction(funcName) {
  
    var myVar;
    clearTimeout(myVar);    
    myVar = setTimeout(funcName, 1000);
    
}

//Empty input check
function emptyCheck(){
   var charCheck = document.getElementById("char_name").value.length;
//   console.log(charCheck);
   if (charCheck === 0) {
                console.log("Field empty");
                document.getElementById("char_status").innerHTML = "Field Empty!";
                document.getElementById("char_status").style.color = "red";
                nameAllow = false;
    }else {
        nameAllow = true;
    }
}

//Empty email check
function emptyCheck2(){
   var emailCheck = document.getElementById("email_field2").value.length;
//   console.log(emailCheck);
   if (emailCheck === 0) {
                console.log("Field empty");
                document.getElementById("email_status").innerHTML = "Field Empty!";
                document.getElementById("email_status").style.color = "red";
                emailAllow = false;
    }else {
        emailAllow = true;
    }
}


//Name availability check
var nameAllow = false;
function nameCheck(){
    var charName = document.getElementById("char_name").value;
    var docRef = db.collection("usernames").doc(charName);
    
    docRef.get().then(function(doc) {
            var charName = document.getElementById("char_name").value;
            console.log(charName);
            if (doc.exists) {
                console.log("Name Already Exists");
                document.getElementById("char_status").innerHTML = "That name already exists!";
                document.getElementById("char_status").style.color = "red";
                nameAllow = false;   
            } else {
                // doc.data() will be undefined in this case
                console.log("Name is Available");
                document.getElementById("char_status").innerHTML = "Name is available!";
                document.getElementById("char_status").style.color = "green";
                nameAllow = true;
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
}

//Email availability check
var emailAllow = false;
function emailCheck(){
    
    var userEmail = document.getElementById("email_field2").value;
    var docRef = db.collection("characters").doc(userEmail);
    
    docRef.get().then(function(doc) {
            if (doc.exists) {
                console.log("Email already in use");
                document.getElementById("email_status").innerHTML = "Email already used!";
                document.getElementById("email_status").style.color = "red";
                emailAllow = false;
            } else {
                // doc.data() will be undefined in this case
                console.log("Email is Available");
                document.getElementById("email_status").innerHTML = "Email is available!";
                document.getElementById("email_status").style.color = "green";
                emailAllow = true;
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
}

//Show game div
function showGame(){
    
    document.getElementById("gamemap").style.display = "block";
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "none";
    document.getElementById("create_div").style.display = "none";
    document.getElementById("quizmap").style.display = "none";
    document.getElementById("locSelect").style.display = "none";
}

//Play game button
function startGame(){
    
    if (locSelected){
    setTimeout(function(){map.invalidateSize()}, 100);
    showGame();
    } else {
        
    document.getElementById("gamemap").style.display = "none";
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "none";
    document.getElementById("create_div").style.display = "none";
    document.getElementById("quizmap").style.display = "none";
    document.getElementById("locSelect").style.display = "block";
              
    }
}

//Main menu button
function mainMenu(){
    document.getElementById("gamemap").style.display = "none";
    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";
    document.getElementById("create_div").style.display = "none";
    document.getElementById("quizmap").style.display = "none";
    document.getElementById("locSelect").style.display = "none";
}

//Leaderboard function
function leaderBoard(){
    
    document.getElementById("user_div").style.display = "none";
    document.getElementById("leadBoard").style.display = "block";
    
    db.collection("characters").orderBy("Level","desc").limit(5).get()
        .then(function(querySnapshot){

            querySnapshot.forEach(function(doc){
                playername = doc.data().CharacterName;
                playerlevel = doc.data().Level;
                captured = doc.data().Captured;
                rank[0]=null;
                lvlrank[0]=null;
                rank2[0] = null;
                caprank[0] = null;
                rank.push(playername);
                lvlrank.push(playerlevel);
                });    
            }).then(function(){
        
                 db.collection("characters").orderBy("Captured","desc").limit(5).get()
                .then(function(querySnapshot){

                    querySnapshot.forEach(function(doc){
                        playername = doc.data().CharacterName;
                        captured = doc.data().Captured;
                        rank2[0] = null;
                        caprank[0] = null;
                        rank2.push(playername);
                        caprank.push(captured);
                        });   
                     
                    }).then(function(){
        
                        db.collection("characters").orderBy("Answered","desc").limit(5).get()
                        .then(function(querySnapshot){

                            querySnapshot.forEach(function(doc){
                                playername = doc.data().CharacterName;
                                answered = doc.data().Answered;
                                rank3[0] = null;
                                ansrank[0] = null;
                                rank3.push(playername);
                                ansrank.push(answered);
                                });   
                     
                                }).then(function(){
                
                                    var i = 1;
                                    for(i = 1; i < 6; i++){

                                    document.getElementById("lb"+[i]).innerHTML = [i] + ". " +rank[i];

                                    document.getElementById("lbl"+[i]).innerHTML = lvlrank[i];

                                    document.getElementById("cap"+[i]).innerHTML = [i] + ". " +rank2[i];

                                    document.getElementById("capl"+[i]).innerHTML = caprank[i];
                                    
                                    document.getElementById("ans"+[i]).innerHTML = [i] + ". " +rank3[i];

                                    document.getElementById("ansl"+[i]).innerHTML = ansrank[i];
                    
                                    }
                            })                 
                    }) 
    
            })  
        .catch(function(error){ 
        console.log("Error getting documents: ", error);
    })
}
       
//Open feedback div
function openFeedback(){
    
    document.getElementById("user_div").style.display = "none";
    document.getElementById("feedbackForm").style.display = "block";
    
}

//Open Instruction div
function openGameInfo(){
    
    document.getElementById("user_div").style.display = "none";
    document.getElementById("gameInfo").style.display = "block";
    
}

//Open patch notes div
function openUpdate(){
    
    document.getElementById("user_div").style.display = "none";
    document.getElementById("updatelog").style.display = "block";
    
}

//Submit feedback to database
function submitFeedback(){
    
    var feedbackVal = document.getElementById("feedbackInput").value;
    
    db.collection("feedback").doc().set({
        Feedback: feedbackVal,
        CharName: character,
        Email: email_id
        })
        .then(function() {
        
        window.alert("Feedback submitted. Thank you!");
        document.getElementById("user_div").style.display = "block";
        document.getElementById("feedbackForm").style.display = "none";
        
        
    })
    .catch(function(error) {
        
        console.error("Error writing document: ", error);
        
    });
    
}

//Retun to main menu
function returnFromLb(){
    
    document.getElementById("user_div").style.display = "block";
    document.getElementById("leadBoard").style.display = "none";
    
}

function returnFromFb(){
    
    document.getElementById("user_div").style.display = "block";
    document.getElementById("feedbackForm").style.display = "none";
    
}

function returnFromInfo(){
    
    document.getElementById("user_div").style.display = "block";
    document.getElementById("gameInfo").style.display = "none";
    
}

function returnFromUpdate(){
    
    document.getElementById("user_div").style.display = "block";
    document.getElementById("updatelog").style.display = "none";
    
}

//Variables based on play location
function locManchester(){
    
    bbox = [-2.306957244873047,53.4496246783658, -2.181987762451172, 53.50622200597148]; //min long, min lat, max long, max lat
    dbFolder = "Manchester";
//    gmMarkLoc = [53.46199902007057, -2.2304821014404297];
    tileNum = 700;
    showGame();
    initMap();
    initMap2();
    
}

function locStockport(){
    
    bbox = [-2.2061920166015625,53.37308824854809, -2.1045684814453125, 53.43449203479749]; //min long, min lat, max long, max lat
    dbFolder = "Stockport";
//    gmMarkLoc = [53.46199902007057, -2.2304821014404297];
    tileNum = 950;
    showGame();
    initMap();
    initMap2();
    
}

function locStratford(){
    
    bbox = [-0.057163238525390625,51.50991769706187, 0.05802154541015625, 51.559250332428306]; //min long, min lat, max long, max lat
    dbFolder = "Stratford";
//    gmMarkLoc = [51.54057001851906, 0.000858306884765625];
    tileNum = 850;
    showGame();
    initMap();
    initMap2();
    
}

function locAberdeen(){
    
    bbox = [-2.1485137939453125,57.10753772319884, -2.064056396484375, 57.173853153309196]; //min long, min lat, max long, max lat
    dbFolder = "Aberdeen";
//    gmMarkLoc = [51.54057001851906, 0.000858306884765625];
    tileNum = 850;
    showGame();
    initMap();
    initMap2();
    
}

function locKL(){
    
    bbox = [101.6978645324707,3.139873340389071, 101.72691822052002, 3.1641695284080074];
    dbFolder = "KualaLumpur";
//    gmMarkLoc = [3.157634895200768, 101.71194076538086];
    tileNum = 140;
    showGame();
    initMap();
    initMap2();
    
}

function locPJ(){
    
    bbox = [101.6151237487793,3.0895223029017957, 101.6619873046875, 3.132802914764517];
    dbFolder = "PetalingJaya";
//    gmMarkLoc = [3.1053992088434113, 101.63503646850586];
    tileNum = 450;
    showGame();
    initMap();
    initMap2();
    
}

function locSubang(){
    
    bbox = [101.57529830932617,3.0369832705899067, 101.61761283874512, 3.0940647078533337];
    dbFolder = "Subang";
//    gmMarkLoc = [3.1053992088434113, 101.63503646850586];
    tileNum = 500;
    showGame();
    initMap();
    initMap2();
    
}

function locBangsar(){
    
    bbox = [101.65640830993652,3.0974929251174363, 101.68790817260741, 3.142144436650935];
    dbFolder = "Bangsar";
//    gmMarkLoc = [3.1053992088434113, 101.63503646850586];
    tileNum = 300;
    showGame();
    initMap();
    initMap2();
    
}

function locPuchong(){
    
    bbox = [101.60104751586913,2.986927393334876, 101.63640975952148, 3.0523252770478604];
    dbFolder = "Puchong";
//    gmMarkLoc = [3.1053992088434113, 101.63503646850586];
    tileNum = 500;
    showGame();
    initMap();
    initMap2();
    
}

function locTd(){
    
    bbox = [101.67155742645264,3.088965214163403, 101.70198440551758, 3.118876179270939];
    dbFolder = "TamanDesa";
//    gmMarkLoc = [3.1053992088434113, 101.63503646850586];
    tileNum = 500;
    showGame();
    initMap();
    initMap2();
    
}


function locMiri(){
    
    bbox = [113.99585723876953,4.429080708173087,  114.05405044555664, 4.519099431614627];
    dbFolder = "Miri";
//    gmMarkLoc = [4.397107294486888, 113.99335741996765];
    tileNum = 1500;
    showGame();
    initMap();
    initMap2();
    
}
