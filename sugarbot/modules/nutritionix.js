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
    console.log('\n\n\n\n\n\n\n***************', result)
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
    let {foods} = result.body
    let sugar = 0
    let userText = ''
    let foodName = ''
    for (let food of foods) {
      sugar += food.nf_sugars
      userText += 'Sugar in ' + food.food_name + ': ' + food.nf_sugars + 'g\n'
      foodName += food.food_name + '\n'
    }
    if (userText !== '') {
      userText += 'Total sugar in meal: ' + sugar + 'g'
    }
    console.log('Amount of sugar: ', sugar)
    console.log(userText)
    var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId)
    return tempRef.child('/temp/data/food').update({
      sugar,
      foodName
    })
    .then(() => {
      return tempRef.child('/temp/data/question/').update({
        flag: false
      })
      .then(() => {
        if (sugar) {
          return [
            userText,
            'This is what ' + sugar +'g of sugar looks like.',
            new fbTemplate
            .Image(utils.getGifUrl(sugar))
            .get(),
            fire.trackSugar()
          ]
        }
        else {
          return [
            'Congratulations! 🎉🎉 No sugars found!',
            new fbTemplate.Text('When should I remind you to track your next meal?')
              .addQuickReply('1 hour', 'time1')
              .addQuickReply('3 hours', 'time3')
              .addQuickReply('5 hours', 'time5')
              .addQuickReply('Tomorrow', 'timeTomorrow')
              .addQuickReply("Don't ask", 'notime')
              .get()
          ]
        }
      })
    })
  })
  .catch(error => {
    // console.log("\n\n\nHmm....error")
    // console.log(error)
    console.log("We couldn\'t match any of your foods")
    return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/question").remove()
    .then(function() {
      return [
        "We couldn\'t match any of your foods",
        // utils.otherOptions(false)
        new fbTemplate.Text("Would you like to manually enter the sugar amount?")
        .addQuickReply('Yes  ✅', 'manual sugar track')
        .addQuickReply('No  ❌', 'other options')
        .get()
      ]
    })
  })
}