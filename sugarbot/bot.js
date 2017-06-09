// bot.js
const botBuilder = require('claudia-bot-builder')
const ocrUtils = require('./ocrUtils.js')
const sugarUtils = require('./sugarUtils.js')
const utils = require('./utils.js')
const wolf = require('./wolframUtils.js')
const fire = require('./firebaseUtils.js')
const image = require('./imageUtils.js')
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
    firebase.auth().signInAnonymously()
    .then(() => {
      var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/" + date + "/data/")
      return tempRef.once("value")
      .then(function(snapshot) {
        var sugarCheckerFlag = snapshot.child('sugarCheckerFlag').val()
        var questionFlag = snapshot.child('questionFlag').val()
        var upcFlag = snapshot.child('upcFlag').val()
        var cvFlag = snapshot.child('cvFlag').val()
        var messageText = request.text ? request.text.toLowerCase() : null
        const userId = request.originalRequest.sender.id
        var messageAttachments = (request.originalRequest && request.originalRequest.message) ? request.originalRequest.message.attachments : null
        if (sugarCheckerFlag && messageText) {
          return sugarChecker(messageText)
        }
        else if (questionFlag && messageText) {
          return wolf.getWolfram(messageText)
        }
        else if ((upcFlag || cvFlag) && messageAttachments) {
          const {url} = messageAttachments[0].payload
          fire.trackUserProfile(userId)
          return image.processLabelImage(url, userId, upcFlag, cvFlag)
        }
        else if (messageText) {
          switch (messageText) {
            case 'main menu':
            case 'menu':
            case '?':
            case 'help':
            case 'hi':
            case 'hello':
            case 'get started': {
              return utils.otherOptions(true)
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
              tempRef.set({
                upcFlag: true
              })
              .then(() => {
                return 'Please send me a picture of the UPC label you want to check'
              })
            }
            case 'food question':
            case 'question': {
              tempRef.set({
                questionFlag: true
              })
              .then(() => {
                return 'What would you like to know?'
              })
            }
            case 'send food picture':
            case 'food picture':
            case 'picture': {
              tempRef.set({
                cvFlag: true
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
              return [
                new fbTemplate.ChatAction('typing_on').get(),
                new fbTemplate.Pause(100).get(),
                `Ok, please send me the processed ingredient you are curious about.`
              ]
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
            default: {
              return wolf.getWolfram(messageText, userId)
            }
          }
        }
        // else {
        //   return [
        //     new fbTemplate.ChatAction('typing_on').get(),
        //     new fbTemplate.Pause(100).get(),
        //     new fbTemplate.Text("Ok, here are your options.")
        //     .addQuickReply('Check UPC Label 🏷', 'send upc label')
        //     .addQuickReply('Send food image 🥗', 'send food picture')
        //     .addQuickReply('Ask a food question? 📝', 'food question')
        //     .get()
        //   ]
        // }
      })
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      if (errorCode === 'auth/operation-not-allowed') {
        alert('You must enable Anonymous auth in the Firebase Console.');
      } else {
        console.error(error);
      }
    });
  }
}, { platforms: ['facebook'] });
