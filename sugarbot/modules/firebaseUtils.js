const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;
const utils = require('./utils.js')
const sugarUtils = require('../modules/sugarUtils.js')

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
    // console.log('Result', result)
    const data = result.body
    // console.log('Data', data)
    const {first_name, last_name, profile_pic, locale, timezone, gender} = data
    var userRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/profile")
    return userRef.update({
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

exports.calculateDailyTracking = function(weight, sugar) {
  //default to 60 g of sugar, 15 cubes of sugar
  // ⬜️  - unused
  // ☑️  - used
  // 🅾️  - over
  let used = Math.round(sugar / 4)
  console.log('USED', used)
  let over = 0
  let unused = 0
  let retLine = ''
  if (used > 15) {
    over = used - 15
    used = 15
    unused = 0
  }
  else {
    unused = 15 - used
  }
  for (let i = 0; i < over; i++) {
    retLine += '🅾️'
  }
  for (let i = 0; i < used; i++) {
    retLine += '✅ '
  }
  for (let i = 0; i < unused; i++) {
    retLine += '⬜️ '
  }
  return retLine
}

exports.addSugarToFirebase = function(userId, date, fulldate) {
  // console.log('in add sugar to firebase')
  // var date = new Date(Date.UTC(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate(), dateValue.getHours(), dateValue.getMinutes(), dateValue.getSeconds()))
  console.log('######################## DATE', date)
  // console.log('Unaltered time: ', (new Date(Date.now())).toString())
  // console.log('Altered time: ', dateValue.toString());     // logs Wed Jul 28 1993 14:39:07 GMT-0600 (PDT)
  // console.log(dateValue.toTimeString()); // logs 14:39:07 GMT-0600 (PDT)
  var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId)
  return tempRef.once("value")
  .then(function(tsnapshot) {
    var sugar = tsnapshot.child('/temp/data/food/sugar').val()
    var foodName = tsnapshot.child('/temp/data/food/foodName').val()
    var userRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/sugarIntake/" + date)
    userRef.push({
      foodName,
      userId,
      timestamp: fulldate
    })
    var weight = tsnapshot.child('/preferences/currentWeight').val()
    var goalWeight = tsnapshot.child('/preferences/currentGoalWeight').val()
    var sugarRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/sugarIntake/" + date + "/dailyTotal")
    return sugarRef.once("value")
    .then(function(snapshot) {
      var val = snapshot.child('sugar').val()
      if (!val)
        val = 0
      var newVal = parseInt(val) + parseInt(sugar)
      return sugarRef.update({ sugar: newVal })
      .then(function() {
        return tempRef.child('/temp/data/food').remove()
        .then(() => {
          let track = exports.calculateDailyTracking(weight, newVal)
          return [
            'Added ' + sugar + 'g to your journal',
            'Your current daily sugar intake is ' + newVal + 'g',
            "Here's your daily intake",
            track,
            utils.trackAlertness()
          ]
        })
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

exports.sugarChecker = function(messageText, userId) {
  console.log('Inside not sugar checker', messageText)
  const result = sugarUtils.getSugarII(messageText)
  if (result &&
      result !== '') {
    console.log('That is a processed sugar')
    var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/")
    return tempRef.child('sugar').update({
      flag: false
    })
    .then(() => {
      return [
        `That's a processed sugar ingredient!`,
        utils.otherOptions(false)
      ]
    })
  }
  else {
    console.log('That is NOT a processed sugar')
    var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/")
    return tempRef.child('sugar').update({
      flag: false
    })
    .then(() => {
      return [
        `That's not a processed sugar ingredient!`,
        utils.otherOptions(false)
      ]
    })
  }
}
