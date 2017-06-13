const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;
const utils = require('./utils.js')
const fire = require('./firebaseUtils.js')
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

exports.getNutritionix = function(messageText, userId, timezone) {
  console.log('In here homie')
  const url = 'https://trackapi.nutritionix.com/v2/natural/nutrients'
  const request = require('request-promise')
  let nutOptions = {
    uri: url,
    json: true,
    method: 'POST',
    body: {
      "query": messageText,
      //fix this to be based on user timezone
      "timezone": "US/Western"
    },
    resolveWithFullResponse: true,
    headers: {
      'Content-Type': "application/json", 
      'x-app-id': "cb42b701", 
      'x-app-key': "2b46032a70f81fcefe89528a7169dc6a"
    }
  }
  return request(nutOptions)
  .then(result => {
    let text = result.body.foods[0]
    console.log('Here is what we get from nutritionix', text)
    console.log(text.nf_sugars)
    const sugar = text.nf_sugars
    const foodName = text.brand_name ? text.brand_name : ''
    const userText = messageText + ' has' + sugar + 'g of sugar'
    var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/")
    return tempRef.child('food').update({
      sugar,
      foodName
    })
    .then(() => {
      return [
        userText,
        fire.trackSugar()
      ]
    })
    .catch((error) => {
      console.log('Error here....', error)
    })
  })
  .catch(error => {
    console.log("Hmm....error", error)
  })
}