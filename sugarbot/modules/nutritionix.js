const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;
const utils = require('./utils.js')
const fire = require('./firebaseUtils.js')
const firebase = require('firebase')
const names = require('./foodNames')
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

function cleanQuestion(messageText) {
  return messageText.replace('sugar', '')
}

function randomUmame() {
  const arr = [
    'Ugh—I haven’t had my coffee yet. Could you press one of the buttons above or type ‘startmeup’ to get a list of things I can do for you without coffee?',
    'Oh oh—you caught me watching YouTube and not paying attention. Could you hit one of the buttons above or type ‘pay attention’ to get a list of what I can do for you today?',
    'Woah—I just nodded off after an epic lunch and missed what you said. Can you hit one of the buttons or type ‘wakeup’ to see what I can do for you?'
  ]
  let size = arr.length
  const number = Math.floor(Math.random()*(size-1+1)+1)
  return arr[number]
}

exports.getNutritionix = function(messageText, userId, timezone, randomQuestion) {
  const url = 'https://trackapi.nutritionix.com/v2/natural/nutrients'
  const request = require('request-promise')
  const cleanText = cleanQuestion(messageText)
  let nutOptions = {
    uri: url,
    json: true,
    method: 'POST',
    body: {
      "query": cleanText,
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
    // console.log('\n\n\n\n\n\n\n***************', result)
    let {foods} = result.body
    // console.log(foods)
    var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId)
    return tempRef.child('/temp/data/question').once('value')
    .then((snapshot) => {
      let mealType = snapshot.child('mealType').val()
      if (!mealType)
        mealType = 'snack'
      let psugar = 0
      let nsugar = 0
      let processedSugars = ''
      let foodName = ''
      let naturalSugars = ''
      let zeroSugar = ''
      let thumb = []
      let sugarArr = []
      for (let food of foods) {
        const {upc, nf_sugars, nix_brand_name, nix_brand_id, nf_ingredient_statement, food_name, serving_qty, serving_unit, meal_type, photo} = food
        let foodSugar = nf_sugars ? Math.round(nf_sugars) : 0
        console.log('*************************')
        console.log(food)
        if (foodSugar === 0) {
          zeroSugar += '    - 0g sugar in ' + serving_qty + ' ' + serving_unit + ' of ' + food_name +'\n'
          foodName += food_name + '\n'
        }
        else if (upc || nix_brand_name || nix_brand_id || nf_ingredient_statement || names.getNatural(food_name) == -1) {
          console.log('Processed', food_name)
          psugar += foodSugar
          processedSugars += '    - ' + foodSugar + 'g sugars in ' + serving_qty + ' ' + serving_unit + ' of ' + food_name + '\n'
          foodName += food_name + '\n'
        }
        else if (foodSugar) {
          nsugar += foodSugar
          naturalSugars +=  '    - ' + foodSugar + 'g natural sugars in ' + serving_qty + ' ' + serving_unit + ' of ' + food_name + '\n'
          foodName += food_name + '\n'
        }
        // thumb = photo.thumb ? photo.thumb : ''
        if (photo.thumb !== '') {
          thumb.push(photo.thumb)
        }
        else {
          thumb.push('')
        }
        sugarArr.push(foodSugar)
      }
      let sugarPerServingStr = 'That has about ' + psugar + 'g of sugars. Here\'s a breakdown of your meal: \n'
      if (processedSugars !== '') {
        sugarPerServingStr += processedSugars
      }
      if (naturalSugars !== '') {
        sugarPerServingStr += '\n\n*NOTE* These sugars are not counted against your daily allotment.\n'
        sugarPerServingStr += '  ' + nsugar + 'g of natural sugars\n' + naturalSugars
      }
      if (zeroSugar !== '') {
        sugarPerServingStr += zeroSugar
      }
      // console.log('Amount of sugar: ', sugar)
      // console.log(sugarPerServingStr)
      // console.log(naturalSugars)
      // console.log(utils.getGifUrl(Math.round(psugar)))
      console.log(thumb)
      return tempRef.child('/temp/data/food').update({
        sugar: psugar,
        foodName,
        cleanText,
        sugarPerServingStr,
        photo: thumb,
        sugarArr,
        ingredientsSugarsCaps: null
      })
      .then(() => {
        return tempRef.child('/temp/data/question/').remove()
        .then(() => {
          if (Math.round(psugar) > 2) {
            return [
              sugarPerServingStr,
              // 'This is what ' + psugar +'g of processed sugar looks like approximately.',
              'This is what that much sugar looks like',
              new fbTemplate
              .Image(utils.getGifUrl(Math.round(psugar)))
              .get(),
              fire.trackSugar()
            ]
          }
          else if (psugar > 0) {
            return [
              sugarPerServingStr,
              fire.trackSugar()
            ]
          }
          else {
            return [
              'Congratulations! 🎉🎉 No processed sugars found!',
              fire.trackSugar()
            ]
          }
        })
      })
    })
  })
  .catch(error => {
    // console.log("\n\n\nHmm....error")
    console.log(error)
    console.log("We couldn\'t match any of your foods")
    return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/question").remove()
    .then(function() {
      if (randomQuestion) {
        const excuse = require('huh')
        // return excuse.get('en') // Returns 1 random excuse
        return [
          // excuse.get('en'),
          randomUmame(),
          new fbTemplate.Button("Try these options instead")
          .addButton('Journal ✏️', 'journal')
          .addButton('Report 💻', 'report')
          .addButton('Settings ⚙️', 'settings')
          .get()
        ]
      }
      else {
        return [
          "We couldn\'t match any of your foods",
          // utils.otherOptions(false)
          new fbTemplate.Button("Would you like to manually enter the sugar amount?")
          .addButton('Yes  ✅', 'manual sugar track')
          .addButton('No  ❌', 'other options')
          .get()
        ]
      }
    })
  })
}