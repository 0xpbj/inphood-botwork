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

exports.getNutritionix = function(messageText, userId, timezone) {
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
    let psugar = 0
    let nsugar = 0
    let processedSugars = ''
    let foodName = ''
    let naturalSugars = ''
    let zeroSugar = ''
    let thumb = ''
    for (let food of foods) {
      const {upc, nf_sugars, nix_brand_name, nix_brand_id, nf_ingredient_statement, food_name, serving_qty, serving_unit, meal_type, photo} = food
      let foodSugar = nf_sugars ? Math.round(nf_sugars) : 0
      console.log('*************************')
      console.log(food)
      if (foodSugar === 0) {
        zeroSugar += '0 sugar in ' + serving_qty + ' ' + serving_unit + ' of ' + food_name +'\n'
        foodName += food_name + '\n'
      }
      else if (upc || nix_brand_name || nix_brand_id || nf_ingredient_statement || names.getNatural(food_name) == -1) {
        console.log('Processed', food_name)
        psugar += foodSugar
        processedSugars += 'Sugar in ' + serving_qty + ' ' + serving_unit + ' of ' + food_name + ': ' + foodSugar + 'g\n'
        foodName += food_name + '\n'
      }
      else if (foodSugar) {
        nsugar += foodSugar
        naturalSugars += 'Sugar in ' + serving_qty + ' ' + serving_unit + ' of ' + food_name + ': ' + foodSugar + 'g\n'
        foodName += food_name + '\n'
      }
      thumb = photo.thumb ? photo.thumb : ''
    }
    let sugarPerServingStr = ''
    if (zeroSugar !== '') {
      sugarPerServingStr += zeroSugar
    }
    if (naturalSugars !== '') {
      sugarPerServingStr += naturalSugars + 'Total natural sugars in meal: ' + nsugar + 'g.\n*NOTE* These sugars are not counted against your daily allotment.\n\n'
    }
    if (processedSugars !== '') {
      sugarPerServingStr += processedSugars + 'Total processed sugars in meal: ' + psugar + 'g.'
    }
    // console.log('Amount of sugar: ', sugar)
    // console.log(sugarPerServingStr)
    // console.log(naturalSugars)
    // console.log(utils.getGifUrl(Math.round(psugar)))
    console.log(thumb)
    var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId)
    return tempRef.child('/temp/data/food').update({
      sugar: psugar,
      foodName,
      cleanText,
      sugarPerServingStr,
      photo: thumb,
      ingredientsSugarsCaps: ''
    })
    .then(() => {
      return tempRef.child('/temp/data/question/').update({
        flag: false
      })
      .then(() => {
        if (Math.round(psugar) > 2) {
          return [
            sugarPerServingStr,
            'This is what ' + psugar +'g of processed sugar looks like approximately.',
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
            // new fbTemplate.Text('When should I remind you to track your next meal?')
            //   .addQuickReply('1 hour', 'time1')
            //   .addQuickReply('3 hours', 'time3')
            //   .addQuickReply('5 hours', 'time5')
            //   .addQuickReply('24 hours', 'timeTomorrow')
            //   .addQuickReply("Don't ask", 'notime')
            //   .get()
            // fire.addSugarToFirebase(userId, date, fulldate)
            fire.trackSugar()
          ]
        }
      })
    })
  })
  .catch(error => {
    // console.log("\n\n\nHmm....error")
    console.log(error)
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