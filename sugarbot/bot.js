// bot.js
const botBuilder = require('claudia-bot-builder');
const ocrUtils = require('./ocrUtils.js')
const sugarUtils = require('./sugarUtils.js')
const fbTemplate = botBuilder.fbTemplate;
const Quagga = require('quagga').default;

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
  if (sugarUtils.indexOfSugarNames(messageText) > -1) {
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
      .addButton('Analyze Nutrition 🔬', 'send nutrition label')
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
  //     .addButton('Analyze Nutrition', 'send nutrition label')
  //     .addButton('Random Sugar Fact', 'Random Sugar Facts')
  //     .addButton('Processed Sugar?', 'Processed Sugar?')
  //     .get();
  // }
  // else if (option === 3) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Nutrition', 'send nutrition label')
  //     .addButton('Analyze Ingredients', 'send ingredient label')
  //     .addButton('Processed Sugar?', 'Processed Sugar?')
  //     .get();
  // }
  // else if (option === 4) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Nutrition', 'send nutrition label')
  //     .addButton('Analyze Ingredients', 'send ingredient label')
  //     .addButton('Random Sugar Fact', 'Random Sugar Facts')
  //     .get();
  // }
  if (option === true) {
    return [
      "Welcome to SugarInfo Bot! I'm here to help you understand sugar 🤓",
      new fbTemplate.Text("What would you like to do?")
        .addQuickReply('Analyze Nutrition 🔬', 'send nutrition label')
        .addQuickReply('Random Sugar Fact 🎲', 'Random Sugar Facts')
        .addQuickReply('Sugar Free Recipe 📅', 'recipe')
        .addQuickReply('Processed Sugar? 🍭', 'Processed Sugar?')
        .get()
    ]
  }
  else {
    return new fbTemplate.Text('What would you like to do next?')
      .addQuickReply('Analyze Nutrition 🔬', 'send nutrition label')
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

function getBarcodeAsync(param){
  return new Promise((resolve, reject) => {
    Quagga.decodeSingle(param, (data) => {
      console.log(data)
      if (typeof(data) === 'undefined') {
        return reject('error');
      }
      else if (!data.codeResult) {
        return reject('error');
      }
      resolve(data.codeResult.code);
    })
  })
}

function processLabelImage(url) {
  // return url
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
    const barcode = (isJpg > -1) ? 'data:image/jpg;base64,' + result.body : 'data:image/png;base64,' + result.body
    return getBarcodeAsync({
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
      // return barcodeResponse
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
        const resText = 'We found ' + fdaResult.body.list.item[0].name + '. Nutrition information is coming soon...'
        return resText
      })
      .catch(error => {
        console.log('FDA failed', error)
      })
    })
    .catch(() => {
      return 'NULL BARCODE'
    })
  })
  .catch(err => {
    return 'No text found in the image.'
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

module.exports = botBuilder(function (request, originalApiRequest) {
  if (request.type === 'facebook') {
    var messageText = request.text ? request.text.toLowerCase() : null
    var messageAttachments = (request.originalRequest && request.originalRequest.message) ? request.originalRequest.message.attachments : null
    if (sugarCheckerFlag && messageText) {
      sugarCheckerFlag = false
      return sugarChecker(messageText)
    }
    else if (messageText) {
      sugarCheckerFlag = false
      switch (messageText) {
        case 'help':
        case 'get started': {
          return otherOptions(true)
        }
        case 'send nutrition label': {
          return [
            new fbTemplate.ChatAction('typing_on').get(),
            new fbTemplate.Pause(100).get(),
            `Ok, please send me a picture of the product barcode.`
          ]
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
          return otherOptions(true)
        }
      }
    }
    else if (messageAttachments) {
      const {url} = messageAttachments[0].payload
      return processLabelImage(url)
    }
  }
}, { platforms: ['facebook'] });
