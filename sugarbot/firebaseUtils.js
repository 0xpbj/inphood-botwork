const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;
const utils = require('./utils.js')

const firebase = require('firebase')
const fbConfig = {
  apiKey: 'AIzaSyBQTHsQA5GuDG7Ttk17o3LBQfXjn7MtUQ8',
  authDomain: 'inphooddb-e0dfd.firebaseapp.com',
  databaseURL: 'https://inphooddb-e0dfd.firebaseio.com',
  projectId: 'inphooddb-e0dfd',
  storageBucket: 'inphooddb-e0dfd.appspot.com',
  messagingSenderId: '529180412076'
}
if (firebase.apps.length === 0) {
  firebase.initializeApp(fbConfig)
}

exports.trackSugar = function() {
  return new fbTemplate.Text('Would you like to add it to your journal?')
  .addQuickReply('Yes  ✅', 'add sugar')
  .addQuickReply('No  ❌', 'remove temp food data')
  .get();
}

exports.trackUserProfile = function(userId) {
  var fbOptions = {
    uri: 'https://graph.facebook.com/v2.6/' + userId,
    method: 'GET',
    json: true,
    qs: {
      fields: 'first_name,last_name,profile_pic,locale,timezone,gender',
      access_token: 'EAAJhTtF5K30BAObDIIHWxtZA0EtwbVX6wEciIZAHwrwBJrXVXFZCy69Pn07SoyzZAeZCEmswE0jUzamY7Nfy71cZB8O7BSZBpTZAgbDxoYEE5Og7nbkoQvMaCafrBkH151s4wl91zOCLbafkdJiWLIc6deW9jSZBYdjh2NE4JbDSZBAwZDZD'
    },
    resolveWithFullResponse: true
  }
  const request = require('request-promise')
  return request(fbOptions)
  .then(result => {
    console.log('Result', result)
    const data = result.body
    console.log('Data', data)
    const {first_name, last_name, profile_pic, locale, timezone, gender} = data
    var userRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/profile")
    userRef.update({
      first_name,
      last_name,
      profile_pic,
      locale,
      timezone,
      gender,
      userId,
      // is_payment_enabled
    })
  })
  .catch(error => {
    console.log('Something went wrong', error)
  })
}

exports.addSugarToFirebase = function(userId) {
  console.log('in add sugar to firebase')
  var user = firebase.auth().currentUser
  var fulldate = Date.now()
  var dateValue = new Date(fulldate)
  var date = dateValue.toDateString()
  var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/" + date + "/data/")
  return tempRef.once("value")
  .then(function(tsnapshot) {
    var sugar = tsnapshot.child('sugar').val()
    var foodName = tsnapshot.child('foodName').val()
    var userRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/sugarIntake/" + date)
    userRef.push({
      foodName,
      userId,
      timestamp: Date.now()
    })
    var sugarRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/sugarIntake/" + date + "/dailyTotal")
    return sugarRef.once("value")
    .then(function(snapshot) {
      var val = snapshot.child('sugar').val()
      if (!val)
        val = 0
      var newVal = parseInt(val) + parseInt(sugar)
      return sugarRef.update({ sugar: newVal })
      .then(function() {
        console.log('Synchronization succeeded');
        return [
          'Added ' + sugar + 'g to your journal',
          'Your current daily intake is ' + newVal + 'g',
          utils.otherOptions(false)
        ]
      })
      .catch(function(error) {
        console.log('Synchronization failed', error);
      });
    });
  })
  .catch((error) => {
    console.log('Error', error)
  })
}

exports.sugarChecker = function(userId) {
  var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/")
  return tempRef.once("value")
  .then(function(snapshot) {
    var messageText = snapshot.child('sugarCheckFlag').val()
    console.log('Inside not sugar checker', messageText)
    const result = sugarUtils.getSugarII(messageText)
    if (result &&
        result !== '') {
      return [
        `That's a processed sugar ingredient!`,
        utils.otherOptions(false)
      ]
    }
    else {
      return [
        `That's not a processed sugar ingredient!`,
        utils.otherOptions(false)
      ]
    }
  })
}