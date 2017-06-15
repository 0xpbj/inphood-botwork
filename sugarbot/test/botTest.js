var http = require('http');
const botBuilder = require('claudia-bot-builder')
const ocrUtils = require('../modules/ocrUtils.js')
const sugarUtils = require('../modules/sugarUtils.js')
const utils = require('../modules/utils.js')
const wolf = require('../modules/wolframUtils.js')
const fire = require('../modules/firebaseUtils.js')
const image = require('../modules/imageUtils.js')
const nutrition = require('../modules/nutritionix.js')
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
  const dateVal = 1497368855147

  return firebase.auth().signInAnonymously()
  .then(() => {
    console.log('Firebase logged in')
    const userId = 1322516797796635 //request.originalRequest.sender.id
    var fulldate = Date.now()
    var dateValue = new Date(fulldate)
    var date = dateValue.toDateString()
    var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId)
    return tempRef.once("value")
    .then(function(snapshot) {
      const sugarCheckerFlag = snapshot.child('/temp/data/sugar/flag').val()
      const questionFlag = snapshot.child('/temp/data/question/flag').val()
      const autoUpc = snapshot.child('/temp/data/upc/auto').val()
      const manualUpc = snapshot.child('/temp/data/upc/manual').val()
      const cvFlag = snapshot.child('/temp/data/cv/flag').val()
      const timezone = snapshot.child('/profile/timezone').val()
      console.log('TEST VARS?', sugarCheckerFlag, questionFlag, autoUpc, manualUpc, cvFlag)
      // var messageText = request.text ? request.text.toLowerCase() : null
      // var messageAttachments = (request.originalRequest && request.originalRequest.message) ? request.originalRequest.message.attachments : null
      // var messageText = 'picture' //request.text ? request.text.toLowerCase() : null
      // var url = 'https://scontent.fsnc1-1.fna.fbcdn.net/v/t34.0-0/p480x480/19184309_10101449309384199_130749422_n.jpg?oh=e7b3d26080ccc5a289f2d47b86aca1c0&oe=594092B9'
      // var messageText = 'cv' //request.text ? request.text.toLowerCase() : null
      // var url = 'https://scontent.fsnc1-1.fna.fbcdn.net/v/t35.0-12/19105061_10101449302218559_789990656_o.jpg?oh=3d6a310ea94a4abeb0faa69fb7be8190&oe=5941977E'
      // var messageText = '1 cup blueberries, 2 tbsp honey, 1 cup greek yogurt'
      // return fire.addSugarToFirebase(userId, date, fulldate)
      // return nutrition.getNutritionix(messageText, userId, timezone)
      // var url = 'https://scontent.xx.fbcdn.net/v/t34.0-0/p480x480/19114431_10101449631638399_768503254_n.jpg?_nc_ad=z-m&oh=5f765dc0980d3175c26cc7bf37827abc&oe=59417504'
      // var url = 'https://scontent.fsnc1-1.fna.fbcdn.net/v/t34.0-0/p480x480/19142165_10101451909179189_663213606_n.jpg?oh=7993b330affe65d6508bdf2f814bdeb7&oe=59443802'
      // return image.processLabelImage(url, userId, false, true)
      console.log(fire.calculateDailyTracking(165, 60))
      // if (sugarCheckerFlag && messageText) {
      //   return fire.sugarChecker(messageText, userId)
      // }
      // else if (questionFlag && messageText) {
      //   return wolf.getWolfram(messageText, userId)
      // }
      // else if (url) {
      //   // const {url} = messageAttachments[0].payload
      //   // fire.trackUserProfile(userId)
      //   return image.processLabelImage(url, userId, true, false)
      // }
      // else if (manualUpc && messageText) {
      //   console.log('DID I COME HERE?')
      //   return image.fdaProcess(userId, messageText)
      // }
      // else if (messageText) {
      //   switch (messageText) {
      //     case 'main menu':
      //     case 'refresh':
      //     case 'reset':
      //     case 'start':
      //     case 'hey':
      //     case 'menu':
      //     case '?':
      //     case 'help':
      //     case 'hi':
      //     case 'hello':
      //     case 'get started': {
      //       return utils.otherOptions(true)
      //     }
      //     case 'analyze nutrition': {
      //       return [
      //         new fbTemplate.ChatAction('typing_on').get(),
      //         new fbTemplate.Pause(100).get(),
      //         new fbTemplate.Text("Ok, here are your options.")
      //         .addQuickReply('Check UPC Label 🏷', 'send upc label')
      //         .addQuickReply('Send food image 🥗', 'send food picture')
      //         .addQuickReply('Food question? 📝', 'food question')
      //         .get()
      //       ]
      //     }
      //     case 'send upc label':
      //     case 'upc label':
      //     case 'upc': {
      //       return tempRef.child('upc').update({
      //         auto: true,
      //         manual: false
      //       })
      //       .then(() => {
      //         return 'Please send me a picture of the UPC label you want to check'
      //       })
      //     }
      //     case 'food question':
      //     case 'question': {
      //       return tempRef.child('question').update({
      //         flag: true
      //       })
      //       .then(() => {
      //         return 'What would you like to know?'
      //       })
      //     }
      //     case 'send food picture':
      //     case 'food picture':
      //     case 'picture': {
      //       return tempRef.child('cv').update({
      //         flag: true
      //       })
      //       .then(() => {
      //         return "Please send me a picture of your meal and I'll try to guess what you're eating"
      //       })
      //     }
      //     case 'another random sugar fact':
      //     case 'hit me with a fact':
      //     case 'random sugar facts': {
      //       return utils.randomSugarFacts()
      //     }
      //     case 'recipe':
      //     case "today's recipe":
      //     case 'send me todays recipe':
      //     case 'sugar recipe': {
      //       return utils.todaysSugarRecipe()
      //     }
      //     case 'processed ingredient':
      //     case 'try another sugar?':
      //     case 'processed sugar?':
      //     case 'processed sugar':
      //     {
      //       return tempRef.child('sugar').update({
      //         flag: true
      //       })
      //       .then(() => {
      //         return [
      //           new fbTemplate.ChatAction('typing_on').get(),
      //           new fbTemplate.Pause(100).get(),
      //           `Ok, please send me the processed ingredient you are curious about.`
      //         ]
      //       })
      //     }
      //     case 'share': {
      //       return utils.sendShareButton()
      //     }
      //     case 'add sugar': {
            // return fire.addSugarToFirebase(userId, timezone)
      //     }
      //     case 'remove temp food data': {
      //       return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/food").remove()
      //       .then(function() {
      //         console.log("Remove succeeded.")
      //         return utils.otherOptions(false)
      //       })
      //     }
      //     case 'manual upc code entry': {
      //       return tempRef.child('upc').update({
      //         manual: true,
      //         auto: false
      //       })
      //       .then(() => {
      //         return 'Ok, please send me the UPC code'
      //       })
      //     }
      //     case 'more details': {
      //       return wolf.detailedWolfram(userId)
      //     }
      //     default: {
      //       return wolf.getWolfram(messageText, userId)
      //    
      //     }
      //   }
      // }
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
