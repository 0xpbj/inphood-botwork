const botBuilder = require('claudia-bot-builder')
const facebookMachine = require('./modules/stateMachine.js')
const fbTemplate = botBuilder.fbTemplate
const utils = require('./modules/utils.js')
const fire = require('./modules/firebaseUtils.js')
const constants = require('./modules/constants.js')

const firebase = require('firebase')
if (firebase.apps.length === 0) {
  firebase.initializeApp(constants.fbConfig)
}

const bailArr = ['main menu', 'refresh', 'reset', 'start', 'hey', 'menu', '?', 'help', 'hi', 'hello', 'back', 'cancel', 'clear', 'exit', 'start']

module.exports = botBuilder(function (request, originalApiRequest) {
  // return 'hello world'
  if (request.type === 'facebook') {
    console.log('***************************', request)
    const userId = request.originalRequest.sender.id
    var messageText = request.text ? request.text.toLowerCase() : null
    if (bailArr.indexOf(messageText) > -1) {
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%in bail array')
      if (firebase.auth().currentUser) {
        firebase.database().ref("/global/sugarinfoai/" + userId).child('/temp/data/').remove()
      }
      else {
        firebase.auth().signInAnonymously()
        .then(() => {
          firebase.database().ref("/global/sugarinfoai/" + userId).child('/temp/data/').remove()
        })
      }
      return utils.otherOptions(true)
    }
    else if (messageText ==='settings') {
      if (firebase.auth().currentUser === null) {
        firebase.auth().signInAnonymously()
      }
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%in preferences')
      return new fbTemplate.Button('What would you like to do?')
      .addButton('Sugar Goal ⬜️', 'goalsugar')
      .addButton('Current Weight ⏱', 'weight')
      .addButton('Weight Goal 🏆', 'goalWeight')
      .get()
    }
    else if (messageText === 'journal') {
      if (firebase.auth().currentUser === null) {
        firebase.auth().signInAnonymously()
      }
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%in journal')
      return new fbTemplate.Button('I\'m all ears! How would you like to enter your meal?')
      // .addButton('Favorites 😍', 'my favorites')
      .addButton('Describe Food ⌨️', 'food question')
      .addButton('Scan UPC Code 🔬', 'analyze upc')
      // .addButton('Photo 🥗', 'send food picture')
      .get()  
    }
    else if (messageText === 'knowledge') {
      if (firebase.auth().currentUser === null) {
        firebase.auth().signInAnonymously()
      }
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%in knowledge')
      return new fbTemplate.Button('What would you like to know?')
      .addButton('Facts 🎲', 'random sugar facts')
      .addButton('Recipes 📅', 'recipe')
      .addButton('Processed? 🍭', 'Processed Sugar?')
      .get()
    }
    else if (messageText === 'random sugar facts') {
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%in facts')
      return utils.randomSugarFacts()
    }
    else if (messageText === 'recipe') {
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%in recipe')
      const {timestamp} = request.originalRequest
      return utils.todaysSugarRecipe(timestamp)
    }
    else if (messageText === 'share') {
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%in share')
      return utils.sendShareButton()
    }
    else if (messageText === 'pbjdebug') {
      return new fbTemplate.Generic()
      .addBubble('sugarinfoAI 🕵️ ', 'Find and track (hidden) sugars in your diet')
      .addUrl('https://s3-us-west-1.amazonaws.com/www.inphood.com/reports/test/testPbjFirebase.html')
      .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/sugar.jpg')
      .addShareButton()
      .get()
    }
    else {
      if (firebase.auth().currentUser) {
        return facebookMachine.bot(request, messageText, userId)
      }
      return firebase.auth().signInAnonymously()
      .then(() => {
        return facebookMachine.bot(request, messageText, userId)
      })
    }
  }
}, { platforms: ['facebook'] });
