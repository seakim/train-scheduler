// Firebase configuration
var config = {
  apiKey: "AIzaSyCV_5lV6NmHOP9gtDh3cqtA1SbBFa61-Y0",
  authDomain: "trainschduler-6e152.firebaseapp.com",
  databaseURL: "https://trainschduler-6e152.firebaseio.com",
  projectId: "trainschduler-6e152",
  storageBucket: "trainschduler-6e152.appspot.com",
  messagingSenderId: "876145413916"
};
firebase.initializeApp(config);

var database = firebase.database();

// timeMask
function timeMask() {
  var time = document.getElementById('start-input').value;
  if (window.event.keyCode == 8) { // ignore backspace 
  } else if (time.match(/^\d{2}$/) !== null) { 
    document.getElementById('start-input').value += ":";
  } 
}

// upload data to Firebase
$("#add-train-btn").on("click", function(event) {
  event.preventDefault();

  var trainName = $("#train-name-input").val().trim();
  var trainDestination = $("#destination-input").val().trim();
  var trainFrequency = $("#frequency-input").val().trim();

  var start = $("#start-input").val().trim();
  if (start.startsWith('0')) {
    start = start.slice(1,2) + start.slice(3,5);
  } else {
    start = start.slice(0,2) + start.slice(3,5)
  }
  var trainStart = moment(start, "hmm").format("HH:mm");

  // local temp object
  var newTrain = {
    name: trainName,
    destination: trainDestination,
    start: trainStart,
    frequency: trainFrequency
  };

  // push to the database
  database.ref().push(newTrain);

  // clears the text-boxes
  $("#train-name-input").val("");
  $("#destination-input").val("");
  $("#start-input").val("");
  $("#frequency-input").val("");
});

// Firebase event for adding employee to the database
database.ref().on("child_added", function(childSnapshot) {
  console.log(childSnapshot.val());

  // Store everything into a variable.
  var trainName = childSnapshot.val().name;
  var trainDestination = childSnapshot.val().destination;
  var trainStart = childSnapshot.val().start;
  var trainFrequency = childSnapshot.val().frequency;

  // caculating duration for minutesAway
  var currentTime = moment().format("HH:mm");
  var startTime = moment(trainStart, "HH:mm");
  var endTime = moment(currentTime, "HH:mm");
  var duration = moment.duration(endTime.diff(startTime));
  // minutesAway === frequency - duration % frequency
  var minutesAway = trainFrequency - parseInt(duration.asMinutes()) % trainFrequency;
  // nextArrival === currentTime + minutesAway
  var nextArrival = moment(currentTime, "HH:mm").add(minutesAway, 'minutes').format("HH:mm");

  // add to the row
  var newRow = $("<tr class='row'>").append(
    $("<td class='col'>").text(trainName),
    $("<td class='col'>").text(trainDestination),
    $("<td class='col'>").text(trainFrequency),
    $("<td class='col'>").text(nextArrival),
    $("<td class='col'>").text(minutesAway),
  );

  // append the new row to the table
  $("#train-table > tbody").append(newRow);
});
