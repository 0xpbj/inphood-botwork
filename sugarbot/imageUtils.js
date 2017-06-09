const botBuilder = require('claudia-bot-builder');
const fire = require('./firebaseUtils.js')
const fbTemplate = botBuilder.fbTemplate;
const Clarifai = require ('clarifai')

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

function processLabelImage(url, userId, upcFlag, cvFlag) {
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
    if (upcFlag) {
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
                var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data")
                return tempRef.set({
                  upcFlag: false
                })
                .then(() => {
                  return tempRef.child('food')set({
                    sugar: sugarPerServing,
                    foodName,
                  })
                  .then(() => {
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
                })
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
    else if (cvFlag) {
      // initialize with your clientId and clientSecret
      var app = new Clarifai.App(
        'Gk0xpb23IWIY4vRMbHlgQdUxSjlUPBcySEd_gbXN',
        'MwkyjpQgC30xwvW6wzext0FyqXle32BcuGX3ZUEe'
      );
      return app.models.predict(Clarifai.FOOD_MODEL, {base64: result.body})
      .then(function(cresponse) {
        // do something with response
        console.log('Clarifai response', cresponse)
        const {concepts} = cresponse.outputs[0].data
        let ing = ''
        let i = 0
        for (let obj of concepts) {
          if (obj.value > 0.7) {
            if (i === 0) {
              ing += ': ' + obj.name
            }
            ing += ' - ' + obj.name
            i++
          }
        }
        console.log('Clarifai concepts', concepts)
        let crtext = "Hmm...sorry I didn't find any food in the picture..."
        if (ing !== '') {
          crtext = "Here's what I see" + ing
        }
        var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data")
        return tempRef.set({
          cvFlag: false
        })
        .then(() => {
          return [
            crtext,
            otherOptions(false)
          ]
        })
        },
        function(cerr) {
          // there was an error
          console.log('Clarifai error', cerr)
        }
      )
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