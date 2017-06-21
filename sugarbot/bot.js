// bot.js
const botBuilder = require('claudia-bot-builder')
const ocrUtils = require('./modules/ocrUtils.js')
const sugarUtils = require('./modules/sugarUtils.js')
const utils = require('./modules/utils.js')
const wolf = require('./modules/wolframUtils.js')
const fire = require('./modules/firebaseUtils.js')
const image = require('./modules/imageUtils.js')
const nutrition = require ('./modules/nutritionix.js')
const fbTemplate = botBuilder.fbTemplate

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

let bailArr = ['main menu', 'refresh', 'reset', 'start', 'hey', 'menu', '?', 'help', 'hi', 'hello', 'get started', 'back', 'cancel']

module.exports = botBuilder(function (request, originalApiRequest) {
  // return 'hello world'
  if (request.type === 'facebook') {
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@', request)
    // console.log(request.originalRequest)
    const {timestamp} = request.originalRequest
    var dateValue = new Date(timestamp)
    var date = dateValue.toDateString()
    // console.log('DATES', timestamp)
    // console.log(dateValue)
    // console.log(date)
    return firebase.auth().signInAnonymously()
    .then(() => {
      const userId = request.originalRequest.sender.id
      var messageText = request.text ? request.text.toLowerCase() : null
      var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId)
      if (bailArr.indexOf(messageText) > -1) {
        return tempRef.child('/temp/data/').remove()
        .then(() => {
          return utils.otherOptions(true)
        })
      }
      return tempRef.once("value")
      .then(function(snapshot) {
        const sugarCheckerFlag = snapshot.child('/temp/data/sugar/flag').val()
        const questionFlag = snapshot.child('/temp/data/question/flag').val()
        const upcFlag = snapshot.child('/temp/data/upc/flag').val()
        const missingUPC = snapshot.child('/temp/data/missingUPC/flag').val()
        const manual = snapshot.child('/temp/data/manual/flag').val()
        const cvFlag = snapshot.child('/temp/data/cv/flag').val()
        const timezone = snapshot.child('/profile/timezone').val()
        const goalSugar = snapshot.child('/temp/data/preferences/goalSugar').val()
        const weight = snapshot.child('/temp/data/preferences/weight').val()
        const goalWeight = snapshot.child('/temp/data/preferences/goalWeight').val()
        var messageAttachments = (request.originalRequest && request.originalRequest.message) ? request.originalRequest.message.attachments : null
        if (sugarCheckerFlag && messageText) {
          return fire.sugarChecker(messageText, userId)
        }
        else if (questionFlag && messageText) {
          return nutrition.getNutritionix(messageText, userId, timezone)
          // return wolf.getWolfram(messageText, userId)
        }
        else if ((upcFlag || cvFlag) && messageAttachments) {
          const {url} = messageAttachments[0].payload
          fire.trackUserProfile(userId)
          return image.processLabelImage(url, userId, upcFlag, cvFlag)
        }
        else if (upcFlag && messageText) {
          return image.fdaProcess(userId, messageText)
        }
        else if (manual && messageText) {
          return tempRef.once("value")
          .then(tsnapshot => {
            const sugar = tsnapshot.child('/sugarIntake/' + date + '/dailyTotal/sugar').val()
            const inputSugar = parseInt(messageText)
            const newVal = sugar + inputSugar
            const goalSugar = tsnapshot.child('/preferences/currentGoalSugar').val()
            return tempRef.child('/sugarIntake/' + date + '/dailyTotal').update({
              sugar: newVal
            })
            .then(() => {
              return tempRef.child('/temp/data/manual').remove()
              .then(() => {
                // 'Got it! Added ' + inputSugar + 'g of sugar to your daily total',
                let track = fire.calculateDailyTracking(weight, newVal, userId)
                return [
                  'Added ' + inputSugar + 'g to your journal',
                  'Your current daily sugar intake is ' + newVal + 'g of ' + goalSugar + 'g',
                  "Here's your daily intake",
                  track,
                  // utils.sendReminder()
                  utils.trackAlertness()
                ]
              })
            })
          })
        }
        else if (missingUPC && messageText) {
          return tempRef.once("value")
          .then(tsnapshot => {
            const sugar = tsnapshot.child('/sugarIntake/' + date + '/dailyTotal/sugar').val()
            const inputSugar = parseInt(messageText)
            const newVal = sugar + inputSugar
            const goalSugar = tsnapshot.child('/preferences/currentGoalSugar').val()
            return tempRef.child('/sugarIntake/' + date + '/dailyTotal').update({
              sugar: newVal
            })
            .then(() => {
              return tempRef.child("/temp/data/missing/").once("value")
              .then(snapshot => {
                const barcode = snapshot.child('barcode').val()
                return firebase.database().ref("/global/sugarinfoai/missing/" + barcode).update({
                  sugar: inputSugar
                })
                .then(() => {
                  return tempRef.child('/temp/data/').remove()
                  .then(() => {
                    // 'Got it! Added ' + inputSugar + 'g of sugar to your daily total',
                    let track = fire.calculateDailyTracking(weight, newVal, userId)
                    return [
                      'Added ' + inputSugar + 'g to your journal',
                      'Your current daily sugar intake is ' + newVal + 'g of ' + goalSugar + 'g',
                      "Here's your daily intake",
                      track,
                      // utils.sendReminder()
                      utils.trackAlertness()
                    ]
                  })
                })
              })
            })
          })
        }
        else if (weight && messageText) {
          return tempRef.child('/preferences/' + date).update({
            weight: messageText
          })
          .then(() => {
            return tempRef.child('/preferences/').update({
              currentWeight: messageText
            })
            .then(() => {
              return tempRef.child('/temp/data/preferences/').update({
                weight: false
              })
              .then(() => {
                return [
                  'Got it! Your weight added: ' + messageText,
                  utils.otherOptions(false)
                ]
              })
            })
          })
        }
        else if (goalWeight && messageText) {
          return tempRef.child('/preferences/' + date).update({
            goalWeight: messageText
          })
          .then(() => {
            return tempRef.child('/preferences/').update({
              currentGoalWeight: messageText
            })
            .then(() => {
              return tempRef.child('/temp/data/preferences/').update({
                goalWeight: false
              })
              .then(() => {
                return [
                  'Got it! Your goal weight added: ' + messageText,
                  utils.otherOptions(false)
                ]
              })
            })
          })
        }
        else if (goalSugar && messageText) {
          return tempRef.child('/preferences/' + date).update({
            goalSugar: messageText
          })
          .then(() => {
            return tempRef.child('/preferences/').update({
              currentGoalSugar: messageText
            })
            .then(() => {
              return tempRef.child('/temp/data/preferences/').update({
                goalSugar: false
              })
              .then(() => {
                return [
                  'Got it! Your sugar goal added: ' + messageText,
                  utils.otherOptions(false)
                ]
              })
            })
          })
        }
        else if (messageText) {
          switch (messageText) {
            case 'debug': {
              if (userId === '1547345815338571') {  // AC
                return ["timestamp: " + timestamp,
                       "dateValue: " + dateValue,
                       "date: " + date,
                       "Date.now(): " + Date.now()]
                      //  "Date.now date: " + Date(Date.now()).toDateString()]
              }
            }
            case 'other options': {
              return utils.otherOptions(false)
            }
            case 'send upc label':
            case 'upc label':
            case 'upc':
            case 'manual upc code entry':
            case 'analyze upc': {
              return tempRef.child('/temp/data/upc').update({
                flag: true
              })
              .then(() => {
                return [
                  new fbTemplate
                  .Image('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/upc.jpg')
                  .get(),
                  "Ok. You can send me a photo of the UPC 📷 or type the number manually ⌨️"
                ]
              })
            }
            case 'manual sugar track with upc': {
              return tempRef.child('/temp/data/missingUPC').update({
                flag: true
              })
              .then(() => {
                return "Please send me the amount of sugar in grams you'd like to add: (Ex: 20)"
              })
            }
            case 'manual sugar track': {
              return tempRef.child('/temp/data/manual').update({
                flag: true
              })
              .then(() => {
                return "Please send me the amount of sugar in grams you'd like to add: (Ex: 20)"
              })
            }
            case 'custom sugar for food': {
              return new fbTemplate.Text('What would you like to do next?')
              .addQuickReply('Different Serving Size', 'manual sugar track')
              .addQuickReply('Incorrect Sugar', 'incorrect sugar information')
              .get()
            }
            case 'incorrect sugar information': {
              return tempRef.child('/temp/data/manual').update({
                flag: true
              })
              .then(() => {
                return [
                  "I apologize about the discrepancy. I will try to get the correct information for you next time! 🤕",
                  "Please send me the amount of sugar in grams you'd like to add: (Ex: 20)"
                ]
              })
            }
            case 'journal':
            case 'sugar journal':
            case 'food journal': {
              return new fbTemplate.Text('What would you like to do next?')
              .addQuickReply('UPC of Food 🏷', 'analyze upc')
              .addQuickReply('Describe Food ✏️', 'food question')
              .addQuickReply('Photo of Food 🥗', 'send food picture')
              .get()
            }
            case 'food question':
            case 'question': {
              return tempRef.child('/temp/data/question').update({
                flag: true
              })
              .then(() => {
                return 'Ok, please tell me what you ate or drank'
              })
            }
            case 'send food picture':
            case 'food picture':
            case 'picture': {
              return tempRef.child('/temp/data/cv').update({
                flag: true
              })
              .then(() => {
                return "Please send me a picture of your meal and I'll try to guess what you're eating"
              })
            }
            case 'another random sugar fact':
            case 'hit me with a fact':
            case 'random sugar fact':
            case 'random sugar facts': {
              return utils.randomSugarFacts()
            }
            case 'recipe':
            case "today's recipe":
            case 'send me todays recipe':
            case 'sugar recipe': {
              return utils.todaysSugarRecipe(timestamp)
            }
            case 'processed ingredient':
            case 'try another sugar?':
            case 'processed sugar?':
            case 'processed sugar':
            {
              return tempRef.child('/temp/data/sugar').update({
                flag: true
              })
              .then(() => {
                return [
                  new fbTemplate.ChatAction('typing_on').get(),
                  new fbTemplate.Pause(100).get(),
                  `Ok, please send me the processed ingredient you are curious about.`
                ]
              })
            }
            case 'share': {
              return utils.sendShareButton()
            }
            case 'add sugar': {
              return fire.addSugarToFirebase(userId, date, timestamp)
            }
            case 'remove temp food data': {
              return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/food").remove()
              .then(function() {
                return utils.otherOptions(false)
              })
            }
            case 'more details': {
              return wolf.detailedWolfram(userId)
            }
            case 'preferences': {
              return new fbTemplate.Text('What would you like to do?')
                .addQuickReply('Add sugar goal', 'goalsugar')
                .addQuickReply('Add current weight', 'weight')
                .addQuickReply('Add goal weight', 'goalWeight')
                .get()
            }
            case 'weight': {
              return tempRef.child('/temp/data/preferences').update({
                weight: true
              })
              .then(() => {
                return 'Ok, please tell me your weight in lbs (ex: 165)'
              })
            }
            case 'goalweight': {
              return tempRef.child('/temp/data/preferences').update({
                goalWeight: true
              })
              .then(() => {
                return 'Ok, please tell me your goal weight in lbs (ex: 165)'
              })
              .catch(error => {
                console.log('Something went wrong with firebase')
              })
            }
            case 'goalsugar': {
              return tempRef.child('/temp/data/preferences').update({
                goalSugar: true
              })
              .then(() => {
                return 'Ok, please tell me your sugar goal in grams (ex: 40)'
              })
              .catch(error => {
                console.log('Something went wrong with firebase')
              })
            }
            case 'sugar knowledge':
            case 'food knowledge': {
              return new fbTemplate.Text('What would you like to do know?')
                .addQuickReply('Random Sugar Fact 🎲', 'Random Sugar Facts')
                .addQuickReply('Sugar Free Recipe 📅', 'recipe')
                .addQuickReply('Processed Sugar? 🍭', 'Processed Sugar?')
                .get()
            }
            case 'time1': {
              const time = timestamp + (1*3600*1000)
              return firebase.database().ref("/global/sugarinfoai/reminders/" + userId).update({
                time1: time
              })
              .then(() => {
                return [
                  "Great I'll remind you in a hour! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'time3': {
              const time = timestamp + (3*3600*1000)
              return firebase.database().ref("/global/sugarinfoai/reminders/" + userId).update({
                time3: time
              })
              .then(() => {
                return [
                  "Great I'll remind you in 3 hours! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'time5': {
              const time = timestamp + (5*3600*1000)
              return firebase.database().ref("/global/sugarinfoai/reminders/" + userId).update({
                time5: time
              })
              .then(() => {
                return [
                  "Great I'll remind you in 5 hours! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'timeTomorrow': {
              const time = timestamp + (24*3600*1000)
              return firebase.database().ref("/global/sugarinfoai/reminders/" + userId).update({
                timeTomorrow: time
              })
              .then(() => {
                return [
                  "Great I'll remind you tomorrow! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'notime': {
              return tempRef.child('/preferences/nextReminder').remove()
              .then(() => {
                return [
                  "Ok I will not remind you! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'very alert': {
              return tempRef.child('alertness/' + date + '/' + timestamp).update({
                feeling: 'very alert'
              })
              .then(() => {
                return utils.trackMood()
              })
            }
            case 'typical alertness': {
              return tempRef.child('alertness/' + date + '/' + timestamp).update({
                feeling: 'typical alertness'
              })
              .then(() => {
                return utils.trackMood()
              })
            }
            case 'drowsy': {
              return tempRef.child('alertness/' + date + '/' + timestamp).update({
                feeling: 'drowsy'
              })
              .then(() => {
                return utils.trackMood()
              })
            }
            case 'not now alertness': {
              return tempRef.child('alertness/' + date + '/' + timestamp).update({
                feeling: 'not now'
              })
              .then(() => {
                return utils.trackMood()
              })
            }
            case 'positive mood': {
              return tempRef.child('mood/' + date + '/' + timestamp).update({
                mood: 'positive'
              })
              .then(() => {
                return utils.sendReminder()
              })
            }
            case 'negative mood': {
              return tempRef.child('mood/' + date + '/' + timestamp).update({
                mood: 'negative'
              })
              .then(() => {
                return utils.sendReminder()
              })
            }
            case 'neutral mood': {
              return tempRef.child('mood/' + date + '/' + timestamp).update({
                mood: 'neutral'
              })
              .then(() => {
                return utils.sendReminder()
              })
            }
            case 'not now mood': {
              return tempRef.child('mood/' + date + '/' + timestamp).update({
                mood: 'not now'
              })
              .then(() => {
                return utils.sendReminder()
              })
            }
            default: {
              // return wolf.getWolfram(messageText, userId)
              console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
              console.log('GOING INTO NUTRITIONIX')
              return nutrition.getNutritionix(messageText, userId, timezone)
            }
          }
        }
      })
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/operation-not-allowed') {
        // alert('You must enable Anonymous auth in the Firebase Console.');
        throw 'You must enable Anonymous auth in the Firebase Console.'
      } else {
        console.log('Error happened: ', error);
      }
    })
  }
}, { platforms: ['facebook'] });
