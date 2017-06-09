// bot.js
const botBuilder = require('claudia-bot-builder');
const ocrUtils = require('./ocrUtils.js')
const sugarUtils = require('./sugarUtils.js')
const utils = require('./utils.js')
const wolf = require('./wolframUtils.js')
const fire = require('./firebaseUtils.js')
const fbTemplate = botBuilder.fbTemplate;

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

function processLabelImage(url, userId, lupcFlag, lcvFlag) {
  let encoding = 'base64'
  var fbOptions = {
    encoding: encoding,
    uri: url,
    method: 'GET',
    gzip: true,
    json: false,
    resolveWithFullResponse: true,
    headers: {Authorization: "Bearer 'EAAJhTtF5K30BAObDIIHWxtZA0EtwbVX6wEciIZAHwrwBJrXVXFZCy69Pn07SoyzZAeZCEmswE0jUzamY7Nfy71cZB8O7BSZBpTZAgbDxoYEE5Og7nbkoQvMaCafrBkH151s4wl91zOCLbafkdJiWLIc6deW9jSZBYdjh2NE4JbDSZBAwZDZD'"}
  }
  const request = require('request-promise')
  return request(fbOptions)
  .then(result => {
    var isJpg = url.indexOf(".jpg")
    if (lupcFlag) {
      const barcode = (isJpg > -1) ? 'data:image/jpg;base64,' + result.body : 'data:image/png;base64,' + result.body
      return utils.getBarcodeAsync({
        numOfWorkers: 0,  // Needs to be 0 when used within node
        inputStream: {
          size: 800  // restrict input-size to be 800px in width (long-side)
        },
        decoder: {
          readers: ["upc_reader"] // List of active readers
        },
        locate: true, // try to locate the barcode in the image
        src: barcode // or 'data:image/jpg;base64,' + data
      })
      .then(response => {
        const barcodeResponse = 'Barcode Found: ' + response
        let fdaOptions = {
          uri: 'https://api.nal.usda.gov/ndb/search/',
          method: 'GET',
          qs: {
            format: 'json',
            q: response,
            sort: 'n',
            max: 2,
            offset: 0,
            api_key: 'hhgb2UmFJsDxzsslo5ZlNHyR6vIZIbEXO83lMTRt'
          },
          json: true,
          resolveWithFullResponse: true
        }
        const frequest = require('request-promise')
        return frequest(fdaOptions)
        .then(fdaResult => {
          // if (fdaResult.body.list.item)
          const foodName = fdaResult.body.list.item[0].name
          // const resText = 'We found ' + foodName + '. Nutrition information is coming soon...'
          // This report prints out information about the item from the FDA database
          // corresponding to the given ndbno. For instance for Prabhaav Jam this would
          // be in the console.log:
          //
          //  1 Tbsp (20g) contains 13.00g sugars
          //  ---
          //  Ingredients: raspberries, SUGAR, CANE SUGAR, concentrated lemon juice, fruit pectin.
          //
          //
          const ndbno = fdaResult.body.list.item[0].ndbno
          let report = utils.getUsdaReport(ndbno)
          return report.then(fdaResponse => {
            const {error, sugarPerServing, sugarPerServingStr, ingredientsSugarsCaps} = fdaResponse
            if (sugarPerServing && ingredientsSugarsCaps) {
              return firebase.auth().signInAnonymously()
              .then(() => {
                var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/food")
                tempRef.update({
                  sugar: sugarPerServing,
                  foodName,
                })
                return [
                  sugarPerServingStr,
                  'Ingredients (sugars in caps): ' + ingredientsSugarsCaps,
                  'This is what ' + sugarPerServing +'g of sugar looks like.',
                  new fbTemplate
                  .Image(utils.getGifUrl(sugarPerServing))
                  .get(),
                  fire.trackSugar()
                ]
              })
            }
            else {
              throw 'fda response was undefined'
            }
          })
        })
        .catch(error => {
          console.log('FDA failed', error)
          return 'Item not found in FDA DB'
        })
      })
      .catch(() => {
        upcFlag = true
        return "I couldn't read that barcode...can you send me a better picture?"
      })
    }
    else if (lcvFlag) {
      return 'Work in progress'
    }
  })
  .catch(err => {
    console.log("error: ", err)
    return [
      'Looks like you confused me...can you help me out?',
      new fbTemplate.Text("Ok, here are your options.")
      .addQuickReply('Check UPC Label 🏷', 'send upc label')
      .addQuickReply('Send food image 🥗', 'send food picture')
      .addQuickReply('Ask a food question? 📝', 'food question')
      .get()
    ]
  })
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
        return processLabelImage(url, userId, upcFlag, cvFlag)
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
            upcFlag = true
            return 'Please send me a picture of the UPC label you want to check'
          }
          case 'food question':
          case 'question': {
            questionFlag = true
            return 'What would you like to know?'
          }
          case 'send food picture':
          case 'food picture':
          case 'picture': {
            cvFlag = true
            return "Please send me a picture of your meal and I'll try to guess what you're eating"
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
            // return utils.otherOptions(true)
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
