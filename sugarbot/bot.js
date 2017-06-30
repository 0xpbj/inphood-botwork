const botBuilder = require('claudia-bot-builder')
const facebookMachine = require('./modules/stateMachine.js')
const fbTemplate = botBuilder.fbTemplate
const utils = require('./modules/utils.js')

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

const bailArr = ['main menu', 'refresh', 'reset', 'start', 'hey', 'menu', '?', 'help', 'hi', 'hello', 'get started', 'back', 'cancel', 'clear', 'exit', 'start', 'start over']

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
    else if (messageText ==='preferences') {
      if (firebase.auth().currentUser === null) {
        firebase.auth().signInAnonymously()
      }
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%in preferences')
      return new fbTemplate.Button('What would you like to do?')
      .addButton('Sugar Goal', 'goalsugar')
      .addButton('Current Weight', 'weight')
      .addButton('Weight Goal', 'goalWeight')
      .get()
    }
    else if (messageText === 'journal') {
      if (firebase.auth().currentUser === null) {
        firebase.auth().signInAnonymously()
      }
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%in journal')
      return new fbTemplate.Button('What would you like to do next?')
      // .addButton('Favorites 😍', 'my favorites')
      .addButton('UPC Label 🏷', 'analyze upc')
      .addButton('Description ✏️', 'food question')
      .addButton('Photo 🥗', 'send food picture')
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
