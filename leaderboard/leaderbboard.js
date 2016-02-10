//console.log('Learning MeteorJS.... JS ninja');

//Since we’re creating this Leaderboard application though, we’ll create a collection for the players.
PlayerList = new Mongo.Collection('players'); //reference it so as to manipulate it..
//But notice that we didn’t use the var keyword, and that’s because we want to create a global variable.

//inserting data
/*PlayerList.insert({  //The data we pass through needs to be in the JSON format ... JSON data has curly brackets..

   name: 'Goldsoft',
   score: '54'     // type this in console ...
}); */

//we’re using this find function, which is used to retrieve data from the specified collection.
//PLayerList.find();//only application can understand but we cant...
//To retrieve data in a more readable format, attach a fetch function to end of it to convert the retrieved data into an array:
//PlayerList.find().fetch();

//This conditional allows us to specifically execute code on the client — from inside the user’s web browser
if (Meteor.isClient) {

    //If you imagine that the publish function is transmitting data into the ether, then the subscribe
    //function is what we use to “catch” that data.   for testing purposes.. then delete it...
        Meteor.subscribe('thePlayers');// pass only the argument for the name of publish function..
  //create a helper function... deprecated way to do this...   helper function is called player
/*  Template.leaderboard.player = function(){
     
       return "Happy to have created helper function";
  }
 */
 //new way of creating helper function
 Template.leaderboard.helpers({
    //modify the player helper function: to return players created by specific user.. userId
    'player' : function(){ //official helper function
        
        //return players created by specific member...
             var currentUserId = Meteor.userId(); // uncomment this after adding the login..

      ////a helper function that retrieves the documents from the “PlayersList” collection. Abit dynamic...
      //return PlayerList.find(); //possible coz client n server share some code..
      //Apply sorting to the players... Ranking players according to their scores
            //return PlayerList.find({} , {sort : {score : -1  , name : 1}});
      //By passing through a value of -1 , we can sort in descending order.   Ascending order: 1
      //so it only returns players when their createdBy field is equal to the unique ID of the currently logged-in user:

           return PlayerList.find({createdBy:currentUserId}, {sort : { score:-1 , name : 1}});
       //simplify the above player function... avoid redudancy of retrieving data twice... 
       //in meteor.publish() function n also here.....  so uncomment Meteor... above.. read more in publications at end of that chapter..
         
    },
    
    //create a “selectedClass” helper:  for changing the background color when selected.
    'selectedClass' :function(){
      //We need the returned text to be equal to the name of the class in the CSS file, 
           var playerId = this._id;
            var selectedPlayer  = Session.get('selectedPlayer');
       //we’re using this._id to retrieve the unique ID of the player.
       //return this._id;
       if (playerId == selectedPlayer) {
          
          return "selected";

         }
    },
    //create a “showSelectedPlayer” helper function..... selected player will be shown beneath.
      'showSelectedPlayer': function(){

       var selectedPlayer = Session.get('selectedPlayer');
       //returns the data from a single document inside the  “PlayersList” collection.
       //avoid unnecessary overhead since this function will only ever attempt to retrieve a single document.
       return PlayerList.findOne(selectedPlayer);
       //It won’t look through the entire collection like the find() function... thus more overhead

      }
    
 });

 //creating events... provide a way for user to interact with UI...
 Template.leaderboard.events({
  //events goes here.  put there multiple events.. to be in JSON format... key n value store..
  /* 'click':  function(){
     console.log('You have clicked something'); //do anything in the function..

   } */
   //Event selector
   //The plan now is to make it so our event triggers when the user clicks on one of these li elements.
    'click li' : function(){

      console.log('U have clicked li element');
    },
    //deals with only li element  that r part of playerList
    'click .player': function(){

      //console.log('U have clicked player element');
      //var playerId  =  'session value test';
      //the trick is to make the “playerId” variable equal to the unique ID of the player that’s been clicked.
      var playerId =  this._id;
      //the value of this depends on the context. In this context,  
      //this refers to the document of the player that has just been clicked. 
      // Mongo creates an _id field for each document.

      // create  a session
      //Session.set('selectedPlayer' , 'session  value test');//use Session.set() function
      Session.set('selectedPlayer', playerId);
      //retrieve the value of the sessions
          var selectedPlayer = Session.get('selectedPlayer');
                console.log(selectedPlayer);
    },
    //To make the button do something, For Give 5 points button
    'click .increment' : function(){
          //access the unique ID of the selected player, use the Session.get function:
          //player inside the “PlayersList” collection
          var selectedPlayer = Session.get('selectedPlayer');
            //console.log('Donated some points' + selectedPlayer);
          //increment the value of that player’s score field by 5 . modify the document
          //PlayerList.update(selectedPlayer ,{score : 5}); //we’ll first retrieve the selected player’s document.
       //why does the player name disappear...
   //by default, the update function works by deleting the original document and creating a new document with the data that we specify.
          //using this $set operator to modify the value of a field (or multiple fields)
            // without deleting the original document.  solution---- to solve the above problem..
            //PlayerList.update(selectedPlayer, {$set: {score:5}  });
            //increments on the original value 
            //PlayerList.update(selectedPlayer, {$inc : {score:5 } });
            Meteor.call('modifyPlayerScore', selectedPlayer, 5);
   
    }, 
   'click .decrement' : function(){

        var selectedPlayer = Session.get('selectedPlayer');
        //reverses the functionality of the   $inc operator,----> decrement value of the score field..
        //PlayerList.update(selectedPlayer, {$inc : {score: -5 }  });
        //reduce this code using methods, thus not  4 security sake
        Meteor.call('modifyPlayerScore', selectedPlayer, -5);

        },
    //handling the event of remove a player button
    //deleting the  players from the list
    'click .remove':function(){
          var selectedPlayer = Session.get('selectedPlayer'); //r u seeing sessions at work
         //remove function to remove the selected player from the collection:
         //window.confirm('Are u sure u want to delete that player from Rank'); //added it myself..
         //PlayerList.remove(selectedPlayer);
      //comment for the sake of calling the method to execute on the server
        Meteor.call('removePlayerData', selectedPlayer);


    }


   });
   
   Template.addPlayerForm.events({
    //the submit event, which allows to trigger the execution of code when the user submits a form.
        'submit form' : function(event){
    //By using the submit event type, we’re able to account for every possible way that form can be submitted.
    //why not use click form
     //we must be disable the default behavior that web browsers attach to forms.  we do not want page refresh..
          event.preventDefault();
          console.log('Form has been successfully submitted')
          //console.log(event.type);
      //we want the submit form event to grab the  contents of the “playerName” text field 
       var playerNameVar = event.target.playerName.value;// avoids outputting the raw HTML for the text field,
           //console.log(playerNameVar);
          //making  one leaderboard per user   userId..... z important..
        //It simply returns the unique ID of the currently logged in user. 
          //var currentUserId = Meteor.userId();


     //To insert the submitted player into the “PlayersList” collection, add the insert function inside
       //the submit form event:
    /*   PlayerList.insert({
          name: playerNameVar,
          score: 0
          //createdBy: currentUserId //the unique ID of that user will be associated with the player that’s being added.
                                   

       });  */ //delete this method after creating methods on the server..
       //we’re able to trigger the execution of the method whenever the “Add Player” form is submitted.
       //Passing Arguments.. to the this function that calls the methods to be executed on the server..
       //Meteor.call('insertPlayerData');
       Meteor.call('insertPlayerData', playerNameVar);//text field as 2nd argument...

  }
    //u can also take complete control of the links.... instead of forms
   /* 'click a': function( event){

      event.preventDefault();
  }  */


   }); 
   //configure the accounts UI to use usernames instead of email addresses:
 /*
   //it is not working...
   Accounts.ui.config({ 
       passwordSignUpFields: "USERNAME_ONLY" 

   });

  */
}
//“Hello server” message appears inside the commandline((server), but does not appear in the Console.
if (Meteor.isServer){

   //we don’t have any trouble retrieving the data from the “PlayersList” collection. Even after
      //removing the “autopublish” package,  coz code that is executed on the server is inherently trusted.
      //console.log(PlayerList.find().fetch());

    //within this function that we specify what data should be available to users of the application
    //publication part 1
    
    
    Meteor.publish('thePlayers', function(){ //delete this code before shipping ur web app.
    // duplicates the functionality of the autopublish package that we had removed earlier..
       
          //return PlayerList.find();
       //the Meteor.publish function only publishes data from the server that belongs to the currently logged-in user.
       //protective of sensitive data held by others.
       //we’ll need to access the unique ID of the currently logged-in user .. u cant use Meteor.userId() here
           var currentUserId =   this.userId;
           //return PlayerList.find();
      //it only retrieves documents where the createdBy field is equal to the ID of the currently logged-in user:
            return PlayerList.find({createdBy: currentUserId});

    });///uncomment this 4 prototyping pursposes...
    
  //methods are blocks of code that are executed  on the server after being triggered from the client.
   Meteor.methods({
       //methods
    //The insert function will successfully (and securely) run on the server
    //Then allow the method to accept this argument by placing “playerNameVar” between the.. pass args among methods
    'insertPlayerData' : function(playerNameVar){
       //almost the same way it is written on the  client side(isClient).. sharing code btn client n server..
      //console.log('see my first method'); 
           var currentUserId = Meteor.userId();

       PlayerList.insert({
           name: playerNameVar,
           score: 0,
           createdBy:currentUserId
       });


    }, 
    //method that we’ll attached to the “Remove Player” button that’s inside our interface.
    'removePlayerData': function(selectedPlayer){
      //remove the selected player
      //var selectedPlayer = Session.get('selectedPlayer'); this earlier caused internal server error.. 500
      //u tried to do something that is not allowed on the server.... sessions r in browsers..
      //window.on('Are u sure u want to delete this player');
            //PlayerList.remove(selectedPlayer);
       //only  allow a player to be removed from the list if that player belongs to the current user. security assurance
            var currentUserId = Meteor.userId();
           PlayerList.remove({_id: selectedPlayer , createdBy: currentUserId});


    },
    // this method to accept the value of “selectedPlayer”: -- combines the code for increment n decrement events
    'modifyPlayerScore': function(selectedPlayer, scoreValue){
      
      //PlayerList.update(selectedPlayer, {$inc : {score: 5}}); //Based on this code, the “Give 5 Points” button will work as expected.
       //the method is now flexible enough that we can use it for both the “Give
           //5 Points” button and the “Take 5 Points” button.
               //PlayerList.update(selectedPlayer, { $inc: { score: scoreValue} });
           //"Error invoking Method 'modifyPlayerScore': Internal server error [500]"
           //console.log.apply(console, [Array.prototype.join.call(arguments, " ")]);                        // 41
           //coz  u forgot to pass the scoreValue as argument in the function..
           var currentUserId = Meteor.userId();
           //modify this function......
             PlayerList.update({_id: selectedPlayer,  createdBy: currentUserId},
                                 {$inc: {score: scoreValue} } );

         }
   

   });

  
}