// bot.js
const botBuilder = require('claudia-bot-builder')
const ocrUtils = require('./modules/ocrUtils.js')
const sugarUtils = require('./modules/sugarUtils.js')
const utils = require('./modules/utils.js')
const wolf = require('./modules/wolframUtils.js')
const fire = require('./modules/firebaseUtils.js')
const image = require('./modules/imageUtils.js')
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
    return firebase.auth().signInAnonymously()
    .then(() => {
      const userId = request.originalRequest.sender.id
      var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/")
      return tempRef.once("value")
      .then(function(snapshot) {
        var sugarCheckerFlag = snapshot.child('sugar/flag').val()
        var questionFlag = snapshot.child('question/flag').val()
        var autoUpc = snapshot.child('upc/auto').val()
        var manualUpc = snapshot.child('upc/manual').val()
        var cvFlag = snapshot.child('cv/flag').val()
        // console.log('ARE WE HERE!?', sugarCheckerFlag, questionFlag, autoUpc, cvFlag)
        var messageText = request.text ? request.text.toLowerCase() : null
        var messageAttachments = (request.originalRequest && request.originalRequest.message) ? request.originalRequest.message.attachments : null
        if (sugarCheckerFlag && messageText) {
          return fire.sugarChecker(messageText, userId)
        }
        else if (questionFlag && messageText) {
          return wolf.getWolfram(messageText, userId)
        }
        else if ((autoUpc || cvFlag) && messageAttachments) {
          const {url} = messageAttachments[0].payload
          fire.trackUserProfile(userId)
          return image.processLabelImage(url, userId, autoUpc, cvFlag)
        }
        else if (manualUpc && messageText) {
          return image.fdaProcess(messageText)
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
              return utils.otherOptions(true)
            }
            case 'other options': {
              return utils.otherOptions(false)
            }
            case 'analyze nutrition': {
              return [
                new fbTemplate.ChatAction('typing_on').get(),
                new fbTemplate.Pause(100).get(),
                new fbTemplate.Text("Ok, here are your options.")
                .addQuickReply('Check UPC Label 🏷', 'send upc label')
                .addQuickReply('Send food image 🥗', 'send food picture')
                .addQuickReply('Food question? 📝', 'food question')
                .get()
              ]
            }
            case 'send upc label':
            case 'upc label':
            case 'upc': {
              return tempRef.child('upc').update({
                auto: true
              })
              .then(() => {
                return 'Please send me a picture of the UPC label you want to check'
              })
            }
            case 'food question':
            case 'question': {
              return tempRef.child('question').update({
                flag: true
              })
              .then(() => {
                return 'What would you like to know?'
              })
            }
            case 'send food picture':
            case 'food picture':
            case 'picture': {
              return tempRef.child('cv').update({
                flag: true
              })
              .then(() => {
                return "Please send me a picture of your meal and I'll try to guess what you're eating"
              })
            }
            case 'another random sugar fact':
            case 'hit me with a fact':
            case 'random sugar facts': {
              return utils.randomSugarFacts()
            }
            case 'recipe':
            case "today's recipe":
            case 'send me todays recipe':
            case 'sugar recipe': {
              return utils.todaysSugarRecipe()
            }
            case 'processed ingredient':
            case 'try another sugar?':
            case 'processed sugar?':
            case 'processed sugar':
            {
              return tempRef.child('sugar').update({
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
              return fire.addSugarToFirebase(userId)
            }
            case 'remove temp food data': {
              return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/food").remove()
              .then(function() {
                console.log("Remove succeeded.")
                return utils.otherOptions(false)
              })
            }
            case 'more details': {
              return wolf.detailedWolfram(userId)
            }
            case 'manual upc code entry': {
              return tempRef.child('upc').update({
                manual: true
              })
              .then(() => {
                return 'Ok, please send me the UPC code'
              })
            }
            default: {
              return wolf.getWolfram(messageText, userId)
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
