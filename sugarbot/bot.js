// bot.js
const botBuilder = require('claudia-bot-builder');
const ocrUtils = require('./ocrUtils.js')
const sugarUtils = require('./sugarUtils.js')
const utils = require('./utils.js')
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

function randomSugarFacts() {
  const data = sugarUtils.getSugarFact()
  return [
    new fbTemplate.ChatAction('typing_on').get(),
    new fbTemplate.Pause(100).get(),
    // "Processing label. Here's a random nutrition fact while you wait: ",
    data.fact,
    data.source,
    otherOptions(false)
  ]
}

function todaysSugarRecipe() {
  const date = new Date(Date.now())
  const message = "Here's your daily sugar free recipe for " + date.toDateString()
  const data = sugarUtils.getSugarRecipe(date)
  return [
    new fbTemplate.ChatAction('typing_on').get(),
    new fbTemplate.Pause(100).get(),
    // "Processing label. Here's a random nutrition fact while you wait: ",
    message,
    data.recipe + ': ' + data.link
  ]
}

// function sugarTypes() {
//   return [
//     new fbTemplate.ChatAction('typing_on').get(),
//     new fbTemplate.Pause(100).get(),
//     new fbTemplate.List()
//       .addBubble('Sucrose', 'Also known as white sugar or table sugar')
//         .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/types.jpg')
//         .addDefaultAction('https://en.wikipedia.org/wiki/Sucrose')
//       .addBubble('High-Fructose Corn Syrup', 'Made from corn starch, roughly 50% glucose and 50% fructose.')
//         .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/hfcp.jpg')
//         .addDefaultAction('https://en.wikipedia.org/wiki/High-fructose_corn_syrup')
//       .addBubble('Agave Nectar', 'Agave syrup is sweeter than honey and tends to be less viscous.')
//         .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/agave.jpg')
//         .addDefaultAction('https://en.wikipedia.org/wiki/Agave_nectar')
//       .addListButton('See Complete Sugar list', 'https://en.wikipedia.org/wiki/List_of_sugars')
//       .get(),
//     otherOptions(5)
//   ]
// }

let sugarCheckerFlag = false
function sugarChecker(messageText) {
  console.log('Inside not sugar checker', messageText)
  const result = sugarUtils.getSugarII(messageText)
  if (result &&
      result !== '') {
    return [
      `That's a processed sugar ingredient!`,
      otherOptions(false)
    ]
  }
  else {
    return [
      `That's not a processed sugar ingredient!`,
      otherOptions(false)
    ]
  }
}

function startMessage() {
  return [
    new fbTemplate
      .Image('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/home.jpg')
      .get(),
    'Welcome to SugarInfoBot, the easiest way to learn about your sugar intake. Here are your options',
    new fbTemplate.Generic()
    .addBubble('Nutrition Label Analysis', 'Send me a photo of your nutrition label to analyze')
      .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/nutrition.png')
      .addButton('Analyze Nutrition 🔬', 'analyze nutrition')
    .addBubble('Ingredient Label Analysis', 'Send me a photo of your ingredient label to analyze')
      .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/ingredients.png')
      .addButton('Check Ingredients ‍💻', 'send ingredient label')
    .addBubble('Random Sugar Facts', 'Sugar knowledge tidbits')
      .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/chance.jpg')
      .addButton('Random Sugar Fact 🎲', 'Random Sugar Facts')
    .addBubble('Processed Sugar?', "Send me an ingredient and I'll tell you if it's sugar")
      .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/books.jpg')
      .addButton('Processed Sugar? 🍭', 'Processed Sugar?')
    // .addBubble('Sugar Types', 'Get a list of all the sugar types and their info')
    //   .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/types.jpg')
    //   .addButton('Really! 56?', 'Sugar Types')
    .get()
  ]
}

function otherOptions(option) {
  // if (option === 1) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Ingredients', 'send ingredient label')
  //     .addButton('Random Sugar Fact', 'Random Sugar Facts')
  //     .addButton('Processed Sugar?', 'Processed Sugar?')
  //     .get();
  // }
  // else if (option === 2) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Nutrition', 'analyze nutrition')
  //     .addButton('Random Sugar Fact', 'Random Sugar Facts')
  //     .addButton('Processed Sugar?', 'Processed Sugar?')
  //     .get();
  // }
  // else if (option === 3) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Nutrition', 'analyze nutrition')
  //     .addButton('Analyze Ingredients', 'send ingredient label')
  //     .addButton('Processed Sugar?', 'Processed Sugar?')
  //     .get();
  // }
  // else if (option === 4) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Nutrition', 'analyze nutrition')
  //     .addButton('Analyze Ingredients', 'send ingredient label')
  //     .addButton('Random Sugar Fact', 'Random Sugar Facts')
  //     .get();
  // }
  if (option === true) {
    return [
      "Welcome to SugarInfo Bot! I'm here to help you understand sugar 🤓",
      new fbTemplate.Text("What would you like to do?")
        .addQuickReply('Analyze Nutrition 🔬', 'analyze nutrition')
        .addQuickReply('Random Sugar Fact 🎲', 'Random Sugar Facts')
        .addQuickReply('Sugar Free Recipe 📅', 'recipe')
        .addQuickReply('Processed Sugar? 🍭', 'Processed Sugar?')
        .get()
    ]
  }
  else {
    return new fbTemplate.Text('What would you like to do next?')
      .addQuickReply('Analyze Nutrition 🔬', 'analyze nutrition')
      .addQuickReply('Random Sugar Fact 🎲', 'Random Sugar Facts')
      .addQuickReply('Sugar Free Recipe 📅', 'recipe')
      .addQuickReply('Processed Sugar? 🍭', 'Processed Sugar?')
      .get();
  }
}

function getGifUrl(number) {
  if (number < 3) {
    return ''
  }
  else if (number == 3) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_003g.gif'
  }
  else if (number == 4) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_005g.gif'
  }
  else if (number == 5) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_005g.gif'
  }
  else if (number == 6) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_006g.gif'
  }
  else if (number == 7) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_007g.gif'
  }
  else if (number == 8) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_008g.gif'
  }
  else if (number == 9) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_009g.gif'
  }
  else if (number == 10) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_010g.gif'
  }
  else if (number == 11) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_011g.gif'
  }
  else if (number == 12) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_012g.gif'
  }
  else if (number == 13) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_013g.gif'
  }
  else if (number == 14) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_014g.gif'
  }
  else if (number == 15) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_015g.gif'
  }
  else if (number <= 20) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_020g.gif'
  }
  else if (number <= 25) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_025g.gif'
  }
  else if (number <= 30) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_030g.gif'
  }
  else if (number <= 35) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_035g.gif'
  }
  else if (number <= 40) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_040g.gif'
  }
  else if (number <= 45) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_045g.gif'
  }
  else if (number <= 50) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_050g.gif'
  }
  else if (number <= 55) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_055g.gif'
  }
  else if (number <= 60) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_060g.gif'
  }
  else if (number <= 65) {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/Sugar_065g.gif'
  }
  else {
    return 'https://d1q0ddz2y0icfw.cloudfront.net/sugargifs/9000.gif'
  }
}

let upcFlag = false
let cvFlag = false
let questionFlag = false
let wolfText = ''
function processLabelImage(url, userId, lupcFlag, lcvFlag) {
  // return url
  console.log('IN PROCESS IMAGE', lupcFlag, lcvFlag)
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
        console.log('Code in then block', response)
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
            console.log('This is FDA Response', fdaResponse)
            const {error, sugarPerServing, ingredientsSugarsCaps} = fdaResponse
            console.log('FDA Properties', error, sugarPerServing, ingredientsSugarsCaps)
            if (sugarPerServing && ingredientsSugarsCaps) {
              var fulldate = Date.now()
              var dateValue = new Date(fulldate)
              var date = dateValue.toDateString()
              firebase.auth().signInAnonymously()
              .then(() => {
                var userRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/sugarIntake/" + date)
                userRef.push({
                  // add sugar information here
                  foodName,
                  dateValue,
                  userId,
                })
              })
              .catch(ferror => {
                console.log('Firebase auth error', ferror.message)
              })
              return [
                sugarPerServing,
                'Ingredients (sugars in caps): ' + ingredientsSugarsCaps
              ]
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
    // console.log('Image buffer', result.body)
    // var gaOptions = {
    //   method: 'POST',
    //   uri: 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBQTHsQA5GuDG7Ttk17o3LBQfXjn7MtUQ8',
    //   body: {
    //     "requests": [
    //       {
    //         "image": {
    //            "content": result.body
    //         },
    //         "features": [
    //           {
    //             "type": "TEXT_DETECTION"
    //           }
    //         ]
    //       }
    //     ]
    //   },
    //   json: true
    // }
  //   return request(gaOptions)
  //   .then(responses => {
  //     const pictureData = ocrUtils.processGvResponse(responses)
  //     //       pictureData is a JSON dict containing:
  //     //         servingSize  - the size of a single serving off the nutrition facts panel
  //     //         servingsPer  - the number of servings in a box/container/whatever
  //     //         sugars       - the number of grams of sugar
  //     //         sugarsFound  - an array of all the sugars found on the ingredients text
  //     if (isNaN(pictureData.sugars) && pictureData.sugarsFound.length === 0) {
  //       return [
  //         'No sugar content or ingredients found in the image. Please re-take the photo with the nutrition label and/or the ingredient text clearly visible and try again',
  //         otherOptions(false)
  //       ]
  //     }
  //     else {
  //       let nutResponse = ''
  //       let ingResponse = ''
  //       let gifUrl = ''
  //       if (!isNaN(pictureData.sugars)) {
  //         nutResponse += 'You will consume ' + pictureData.sugars + 'g of sugar in one serving: ' + pictureData.servingSize + '.'
  //         if (pictureData.sugars > 2) {
  //           gifUrl = getGifUrl(pictureData.sugars)
  //         }
  //       }
  //       if (pictureData.sugarsFound.length > 0) {
  //         ingResponse = 'Here are the sugars found in the ingredient label\n. '
  //         for (let sug of pictureData.sugarsFound) {
  //           ingResponse += sug + ', '
  //         }
  //       }
  //       // nutResponse = (nutResponse === '') ? 'No sugar content found in the image. Please re-take the photo with the nutrition label clearly visible and try again' : nutResponse
  //       // ingResponse = (ingResponse === '') ? 'No sugar ingredients found in the image. Please re-take the photo with the ingredient label clearly visible and try again.' : ingResponse
  //       if (gifUrl === '' && nutResponse !== '' && ingResponse !== '') {
  //         return [
  //           new fbTemplate.ChatAction('typing_on').get(),
  //           new fbTemplate.Pause(100).get(),
  //           nutResponse,
  //           ingResponse,
  //           otherOptions(false)
  //         ]
  //       }
  //       else if (gifUrl !== '' && ingResponse === '' && nutResponse !== '') {
  //         return [
  //           new fbTemplate.ChatAction('typing_on').get(),
  //           new fbTemplate.Pause(100).get(),
  //           nutResponse,
  //           "Here's a gifv that shows you the amount of sugar in grams",
  //           new fbTemplate
  //           .Image(gifUrl)
  //           .get(),
  //           otherOptions(false)
  //         ]
  //       }
  //       else if (nutResponse === '' && ingResponse !== '') {
  //         return [
  //           new fbTemplate.ChatAction('typing_on').get(),
  //           new fbTemplate.Pause(100).get(),
  //           ingResponse,
  //           otherOptions(false)
  //         ]
  //       }
  //       else if (nutResponse !== '' && ingResponse === '' && gifUrl === '') {
  //         return [
  //           new fbTemplate.ChatAction('typing_on').get(),
  //           new fbTemplate.Pause(100).get(),
  //           nutResponse,
  //           otherOptions(false)
  //         ]
  //       }
  //       else {
  //         return [
  //           new fbTemplate.ChatAction('typing_on').get(),
  //           new fbTemplate.Pause(100).get(),
  //           nutResponse,
  //           "Here's a gifv that shows you the amount of sugar in grams",
  //           new fbTemplate
  //           .Image(gifUrl)
  //           .get(),
  //           ingResponse,
  //           otherOptions(false)
  //         ]
  //       }
  //     }
  //   })
  // })
  // .catch(err => {
  //   return [
  //     'No text found in the image. Please re-take the photo with the nutrition label and/or the ingredient text clearly visible and try again',
  //     otherOptions(false)
  //   ]
  // })
// }

function getWolfram(messageText) {
  wolfText = messageText
  const url = 'http://api.wolframalpha.com/v1/result?appid=WX84WV-R3THG2XT6L&i=' + encodeURI(messageText)
  const request = require('request-promise')
  let wolfOptions = {
    uri: url,
    method: 'GET',
    resolveWithFullResponse: true
  }
  return request(wolfOptions)
  .then(result => {
    let text = result.body
    return [
      text,
      new fbTemplate.Text("What do you want to do next?")
        .addQuickReply('Main Menu 🎟', 'main menu')
        .addQuickReply('More Details 📚', 'more details')
        .get()
    ]
  })
  .catch(error => {
    return "Hmm....can you please re-phrase your question (ex: 'how much sugar in a apple?')"
  })
}

function detailedWolfram(messageText) {
  const url = 'http://api.wolframalpha.com/v1/simple?appid=WX84WV-R3THG2XT6L&i=' + encodeURI(messageText)
  const request = require('request-promise')
  let wolfOptions = {
    encoding: 'base64',
    uri: url,
    method: 'GET',
    resolveWithFullResponse: true
  }
  return request(wolfOptions)
  .then(result => {
    let imgSrc = new Buffer(result.body,'base64')
    const S3 = require('aws-sdk').S3
    const s3 = new S3({
      accessKeyId:     'AKIAI25XHNISG4KDDM3Q',
      secretAccessKey: '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',
      region: 'us-west-2',
    })
    const key = Date.now()
    const params = {
      Bucket: 'inphoodlabelimagescdn',
      Key: 'chatbot/' + key +  '.gif',
      Body: imgSrc,
      ContentEncoding: 'base64',
      ContentType: 'image/gif',
      ACL: 'public-read'
    }
    const s3promise = s3.upload(params).promise()
    return s3promise
    .then(info => {
      const dataUrl = 'https://doowizp5r3uvo.cloudfront.net/chatbot/' + key + '.gif'
      return [
        "Bam!",
        new fbTemplate
        .Image(dataUrl)
        .get(),
        otherOptions(false)
      ]
    })
    .catch(error => console.log(error));
  })
}

function trackUserProfile(userId) {
  var fbOptions = {
    uri: 'https://graph.facebook.com/v2.6/' + userId,
    method: 'GET',
    json: true,
    qs: {
      fields: 'first_name,last_name,profile_pic,locale,timezone,gender',
      access_token: 'EAAJhTtF5K30BAObDIIHWxtZA0EtwbVX6wEciIZAHwrwBJrXVXFZCy69Pn07SoyzZAeZCEmswE0jUzamY7Nfy71cZB8O7BSZBpTZAgbDxoYEE5Og7nbkoQvMaCafrBkH151s4wl91zOCLbafkdJiWLIc6deW9jSZBYdjh2NE4JbDSZBAwZDZD'
    },
    resolveWithFullResponse: true
  }
  const request = require('request-promise')
  return request(fbOptions)
  .then(result => {
    console.log('Result', result)
    const data = result.body
    console.log('Data', data)
    const {first_name, last_name, profile_pic, locale, timezone, gender} = data
    firebase.auth().signInAnonymously()
    .then(() => {
      var userRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/profile")
      userRef.update({
        first_name,
        last_name,
        profile_pic,
        locale,
        timezone,
        gender,
        userId,
        // is_payment_enabled
      })
    })
    .catch(error => {
      console.log('Firebase auth error', error.message)
    })
  })
  .catch(error => {
    console.log('Something went wrong', error)
  })
}

module.exports = botBuilder(function (request, originalApiRequest) {
  if (request.type === 'facebook') {
    var messageText = request.text ? request.text.toLowerCase() : null
    console.log('Request', request)
    console.log(messageText)
    console.log(wolfText)
    const userId = request.originalRequest.sender.id
    var messageAttachments = (request.originalRequest && request.originalRequest.message) ? request.originalRequest.message.attachments : null
    if (sugarCheckerFlag && messageText) {
      sugarCheckerFlag = false
      return sugarChecker(messageText)
    }
    else if (questionFlag && messageText) {
      questionFlag = false
      return getWolfram(messageText)
    }
    else if (upcFlag && messageAttachments) {
      const {url} = messageAttachments[0].payload
      upcFlag = false
      trackUserProfile(userId)
      return processLabelImage(url, userId, true, false)
    }
    else if (cvFlag && messageAttachments) {
      const {url} = messageAttachments[0].payload
      cvFlag = false
      trackUserProfile(userId)
      return processLabelImage(url, userId, false, true)
    }
    else if (messageText === 'more details') {
      console.log('In more details', wolfText)
      let text = wolfText
      wolfText = ''
      return detailedWolfram(text)
    }
    else if (messageText) {
      questionFlag = false
      sugarCheckerFlag = false
      upcFlag = false
      cvFlag = false
      switch (messageText) {
        case 'main menu':
        case 'menu':
        case '?':
        case 'help':
        case 'hi':
        case 'hello':
        case 'get started': {
          return otherOptions(true)
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
          return randomSugarFacts()
        }
        case 'recipe':
        case "today's recipe":
        case 'send me todays recipe':
        case 'sugar recipe': {
          return todaysSugarRecipe()
        }
        case 'processed ingredient':
        case 'try another sugar?':
        case 'processed sugar?':
        case 'processed sugar':
        {
          sugarCheckerFlag = true
          return [
            new fbTemplate.ChatAction('typing_on').get(),
            new fbTemplate.Pause(100).get(),
            `Ok, please send me the processed ingredient you are curious about.`
          ]
        }
        default: {
          return getWolfram(messageText)
          // return otherOptions(true)
        }
      }
    }
    else {
      return [
        new fbTemplate.ChatAction('typing_on').get(),
        new fbTemplate.Pause(100).get(),
        new fbTemplate.Text("Ok, here are your options.")
        .addQuickReply('Check UPC Label 🏷', 'send upc label')
        .addQuickReply('Send food image 🥗', 'send food picture')
        .addQuickReply('Ask a food question? 📝', 'food question')
        .get()
      ]
    }
  }
}, { platforms: ['facebook'] });
