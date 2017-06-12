var http = require('http');
const botBuilder = require('claudia-bot-builder')
const ocrUtils = require('../modules/ocrUtils.js')
const sugarUtils = require('../modules/sugarUtils.js')
const utils = require('../modules/utils.js')
const wolf = require('../modules/wolframUtils.js')
const fire = require('../modules/firebaseUtils.js')
const image = require('../modules/imageUtils.js')
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

http.createServer(function (request, response) {
  console.log('Starting server')
  return firebase.auth().signInAnonymously()
  .then(() => {
    console.log('Firebase logged in')
    const userId = 1322516797796635 //request.originalRequest.sender.id
    var fulldate = Date.now()
    var dateValue = new Date(fulldate)
    var date = dateValue.toDateString()
    var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/")
    return tempRef.once("value")
    .then(function(snapshot) {
      var sugarCheckerFlag = snapshot.child('sugar/flag').val()
      var questionFlag = snapshot.child('question/flag').val()
      var upcFlag = snapshot.child('upc/flag').val()
      var cvFlag = snapshot.child('cv/flag').val()
      console.log('ARE WE HERE!?', sugarCheckerFlag, questionFlag, upcFlag, cvFlag)
      // var messageText = request.text ? request.text.toLowerCase() : null
      // var messageAttachments = (request.originalRequest && request.originalRequest.message) ? request.originalRequest.message.attachments : null
      // var messageText = 'picture' //request.text ? request.text.toLowerCase() : null
      // var url = 'https://scontent.fsnc1-1.fna.fbcdn.net/v/t34.0-0/p480x480/19184309_10101449309384199_130749422_n.jpg?oh=e7b3d26080ccc5a289f2d47b86aca1c0&oe=594092B9'
      // var messageText = 'cv' //request.text ? request.text.toLowerCase() : null
      // var url = 'https://scontent.fsnc1-1.fna.fbcdn.net/v/t35.0-12/19105061_10101449302218559_789990656_o.jpg?oh=3d6a310ea94a4abeb0faa69fb7be8190&oe=5941977E'
      var messageText = 'fructose'
      if (sugarCheckerFlag && messageText) {
        return fire.sugarChecker(messageText, userId)
      }
      else if (questionFlag && messageText) {
        return wolf.getWolfram(messageText, userId)
      }
      else if ((upcFlag || cvFlag) && url) {
        const {url} = messageAttachments[0].payload
        fire.trackUserProfile(userId)
        return image.processLabelImage(url, userId, upcFlag, cvFlag)
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
              flag: true
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
}).listen(8080)

console.log('Server started')
console.log('Navigate to http://127.0.0.1:8080/ and refresh to trigger this code.')
