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

module.exports = botBuilder(function (request, originalApiRequest) {
  if (request.type === 'facebook') {
    // console.log(request)
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
      var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId)
      return tempRef.once("value")
      .then(function(snapshot) {
        const sugarCheckerFlag = snapshot.child('/temp/data/sugar/flag').val()
        const questionFlag = snapshot.child('/temp/data/question/flag').val()
        const autoUpc = snapshot.child('/temp/data/upc/auto').val()
        const manualUpc = snapshot.child('/temp/data/upc/manual').val()
        const cvFlag = snapshot.child('/temp/data/cv/flag').val()
        const timezone = snapshot.child('/profile/timezone').val()
        const weight = snapshot.child('/temp/data/preferences/weight').val()
        const goalWeight = snapshot.child('/temp/data/preferences/goalWeight').val()
        var messageText = request.text ? request.text.toLowerCase() : null
        var messageAttachments = (request.originalRequest && request.originalRequest.message) ? request.originalRequest.message.attachments : null
        if (sugarCheckerFlag && messageText) {
          return fire.sugarChecker(messageText, userId)
        }
        else if (questionFlag && messageText) {
          return nutrition.getNutritionix(messageText, userId, timezone)
          // return wolf.getWolfram(messageText, userId)
        }
        else if ((autoUpc || cvFlag) && messageAttachments) {
          const {url} = messageAttachments[0].payload
          fire.trackUserProfile(userId)
          return image.processLabelImage(url, userId, autoUpc, cvFlag)
        }
        else if (manualUpc && messageText) {
          return image.fdaProcess(userId, messageText)
        }
        else if (weight && messageText) {
          return tempRef.child('/preferences/' + date).update({
            weight: messageText
          })
          .then(() => {
            return tempRef.child('/preferences/currentWeight').update({
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
            return tempRef.child('/preferences/currentGoalWeight').update({
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
        else if (messageText) {
          switch (messageText) {
            case 'main menu':
            case 'refresh':
            case 'reset':
            case 'start':
            case 'hey':
            case 'menu':
            case '?':
            case 'help':
            case 'hi':
            case 'hello':
            case 'get started': {
             return tempRef.child('/temp/data/').remove()
              .then(() => {
                return utils.otherOptions(true)
              })
            }
            case 'other options': {
              return utils.otherOptions(false)
            }
            case 'analyze nutrition': {
              return [
                new fbTemplate.ChatAction('typing_on').get(),
                new fbTemplate.Pause(100).get(),
                new fbTemplate.Text("Ok, here are your options.")
                .addQuickReply('UPC Label Photo 🏷', 'send upc label')
                .addQuickReply('Type UPC Number ⌨️', 'manual upc code entry')
                .get()
              ]
            }
            case 'send upc label':
            case 'upc label':
            case 'upc': {
              return tempRef.child('/temp/data/upc').update({
                auto: true,
                manual: false
              })
              .then(() => {
                return 'Please send me a picture of the UPC label you want to check'
              })
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
                return "Please send me a picture of your meal and I'll try to guess how much sugar you're eating"
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
            case 'manual upc code entry': {
              return tempRef.child('/temp/data/upc').update({
                manual: true,
                auto: false
              })
              .then(() => {
                return 'Ok, please send me the UPC code'
              })
            }
            case 'preferences': {
              return new fbTemplate.Text('What would you like to do?')
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
            case 'goalWeight': {
              return tempRef.child('/temp/data/preferences').update({
                goalWeight: true
              })
              .then(() => {
                return 'Ok, please tell me your goal weight in lbs (ex: 165)'
              })
            }
            case 'food knowledge': {
              return new fbTemplate.Text('What would you like to do know?')
                .addQuickReply('Random Sugar Fact 🎲', 'Random Sugar Facts')
                .addQuickReply('Sugar Free Recipe 📅', 'recipe')
                .addQuickReply('Processed Sugar? 🍭', 'Processed Sugar?')
                .get()
            }
            case 'time1': {
              return tempRef.child('/preferences/nextReminder').update({
                time: Date.now() + (1*3600*1000),
                reminder1: true
              })
              .then(() => {
                return [
                  "Great I'll remind you in a hour! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'time3': {
              return tempRef.child('/preferences/nextReminder').update({
                time: Date.now() + (3*3600*1000)
              })
              .then(() => {
                return [
                  "Great I'll remind you in 3 hours! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'time5': {
              return tempRef.child('/preferences/nextReminder').update({
                time: Date.now() + (5*3600*1000)
              })
              .then(() => {
                return [
                  "Great I'll remind you in 5 hours! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'timeTomorrow': {
              return tempRef.child('/preferences/nextReminder').update({
                time: Date.now() + (24*3600*1000)
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
            default: {
              // return wolf.getWolfram(messageText, userId)
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
