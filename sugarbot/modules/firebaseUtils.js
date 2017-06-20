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
  let cheatDay = new Date(Date.now()).getDay()
  if (cheatDay == 0) {
    return 'Today is your cheat day! Enjoy responsibly 😇'
  }
  return new fbTemplate.Text('Would you like to add it to your journal?')
  .addQuickReply('Yes  ✅', 'add sugar')
  .addQuickReply('Different Amount 🛠', 'custom sugar for food')
  .addQuickReply('No  ❌', 'remove temp food data')
  .get()
}

exports.findMyFavorites = function(favoriteMeal, userId) {
  let objRef = firebase.database().ref('/global/sugarinfoai/' + userId + '/myfoods/' + favoriteMeal + '/')
  return objRef.once("value")
  .then(function(snapshot) {
    let sugarPerServing = snapshot.child('sugar').val()
    let sugarPerServingStr = snapshot.child('sugarPerServingStr').val()
    let ingredientsSugarsCaps = snapshot.child('ingredientsSugarsCaps').val()
    console.log('results', sugarPerServing, sugarPerServingStr, ingredientsSugarsCaps)
    return firebase.database().ref('/global/sugarinfoai/' + userId + '/temp/data/favorites').update({
      flag: false
    })
    .then(() => {
      var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/")
      let sugar = parseInt(sugarPerServing)
      if (!ingredientsSugarsCaps)
        ingredientsSugarsCaps = ''
      return tempRef.child('food').set({
        sugar: sugarPerServing,
        foodName: favoriteMeal,
        sugarPerServingStr,
        cleanText: favoriteMeal,
        ingredientsSugarsCaps
      })
      .then(() => {
        console.log('got here bub')
        if (ingredientsSugarsCaps !== '') {
          console.log('in if block')
          // return 'in deebo block'
          return [
            sugarPerServingStr,
            'Ingredients (sugars in caps): ' + ingredientsSugarsCaps,
            'This is what ' + sugarPerServing +'g of sugar looks like approximately.',
            new fbTemplate
            .Image(utils.getGifUrl(sugarPerServing))
            .get(),
            exports.trackSugar()
          ]
        }
        else {
          console.log('in else block')
          return [
            sugarPerServingStr,
            'This is what ' + sugarPerServing +'g of sugar looks like approximately.',
            new fbTemplate
            .Image(utils.getGifUrl(sugarPerServing))
            .get(),
            exports.trackSugar()
          ]
        }
      })
    })
  })
  .catch(error => {
    console.log('Errors', error)
  })
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

exports.calculateDailyTracking = function(weight, sugar, userId, goalSugar) {
  //default to 60 g of sugar, 15 cubes of sugar
  // ⬜️  - unused
  // ☑️  - used
  // 🅾️  - over
  let quota = Math.round(goalSugar/4)
  let used = Math.round(sugar/4)
  let over = 0
  let unused = 0
  let retLine = ''
  if (used > quota) {
    over = used - quota
    used = quota
    unused = 0
  }
  else {
    unused = quota - used
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
  console.log(retLine)
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
  .then(function(snapshot) {
    var sugar = snapshot.child('/temp/data/food/sugar').val()
    var foodName = snapshot.child('/temp/data/food/foodName').val()
    var cleanText = snapshot.child('/temp/data/food/cleanText').val()
    var sugarPerServingStr = snapshot.child('/temp/data/food/sugarPerServingStr').val()
    var ingredientsSugarsCaps = snapshot.child('/temp/data/food/ingredientsSugarsCaps').val()
    var userRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/sugarIntake/" + date)
    userRef.push({
      foodName,
      userId,
      timestamp: fulldate
    })
    var weight = snapshot.child('/preferences/currentWeight').val()
    var goalWeight = snapshot.child('/preferences/currentGoalWeight').val()
    var goalSugar = snapshot.child('/preferences/currentGoalSugar').val()
    var val = snapshot.child('/sugarIntake/' + date + '/dailyTotal/sugar').val()
    if (!val)
      val = 0
    if (!goalSugar)
      goalSugar = 40
    var newVal = parseInt(val) + parseInt(sugar)
    // const cleanName = foodName.substr(0, foodName.indexOf(' ')).toLowerCase()
    // console.log(cleanName)
    // var sugarRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/sugarIntake/" + date + "/dailyTotal")
    return firebase.database().ref('/global/sugarinfoai/' + userId + '/sugarIntake/' + date + '/dailyTotal/').update({ sugar: newVal })
    .then(() => {
      return firebase.database().ref('/global/sugarinfoai/' + userId + '/myfoods/' + cleanText).update({ 
        sugar,
        sugarPerServingStr,
        ingredientsSugarsCaps
      })
      .then(() => {
        return firebase.database().ref('/global/sugarinfoai/' + userId + '/myfoods/' + cleanText + '/date').push({ 
          timestamp: Date.now(),
        })
        .then(() => {
          return firebase.database().ref('/global/sugarinfoai/' + userId +'/temp/data/food').remove()
          .then(() => {
            let track = exports.calculateDailyTracking(weight, newVal, userId, goalSugar)
            return [
              'Added ' + sugar + 'g to your journal',
              'Your current daily sugar intake is ' + newVal + 'g of ' + goalSugar + 'g',
              "Here's your daily intake",
              track,
              utils.trackAlertness()
            ]
          })
        })
      })
    })
    .catch(function(error) {
      console.log('Firebase Error ', error);
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
