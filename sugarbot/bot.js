// bot.js
const botBuilder = require('claudia-bot-builder');
const ocrUtils = require('./ocrUtils.js')
const sugarUtils = require('./sugarUtils.js')
const fbTemplate = botBuilder.fbTemplate;

function randomSugarFacts() {
  const data = sugarUtils.getSugarFact()
  return [
    new fbTemplate.ChatAction('typing_on').get(),
    new fbTemplate.Pause(100).get(),
    // "Processing label. Here's a random nutrition fact while you wait: ",
    data.fact,
    data.source,
    otherOptions(3)
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
      `That's a sugar!`,
      otherOptions(4)
    ]
  }
  else {
    return [
      `That's not a sugar!`,
      otherOptions(4)
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
    .addBubble('Not Sugar?', "Send me an ingredient and I'll tell you if it's sugar")
      .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/books.jpg')
      .addButton('Not Sugar? 🍭', 'Not Sugar?')
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
  //     .addButton('Not Sugar?', 'Not Sugar?')
  //     .get();
  // }
  // else if (option === 2) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Nutrition', 'send nutrition label')
  //     .addButton('Random Sugar Fact', 'Random Sugar Facts')
  //     .addButton('Not Sugar?', 'Not Sugar?')
  //     .get();
  // }
  // else if (option === 3) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Nutrition', 'send nutrition label')
  //     .addButton('Analyze Ingredients', 'send ingredient label')
  //     .addButton('Not Sugar?', 'Not Sugar?')
  //     .get();
  // }
  // else if (option === 4) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Nutrition', 'send nutrition label')
  //     .addButton('Analyze Ingredients', 'send ingredient label')
  //     .addButton('Random Sugar Fact', 'Random Sugar Facts')
  //     .get();
  // }
  return new fbTemplate.Text('What would you like to do next?')
    .addQuickReply('Analyze Nutrition 🔬', 'send nutrition label')
    .addQuickReply('Check Ingredient ‍💻', 'send ingredient label')
    .addQuickReply('Random Sugar Fact 🎲', 'Random Sugar Facts')
    .addQuickReply('Not Sugar? 🍭', 'Not Sugar?')
    .get();
}

function getGifUrl(number) {
  if (number == 3) {
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

let processLabelImageFlag = 0
function processLabelImage(url, processLabelImageFlag) {
  let localFlag = processLabelImageFlag
  // console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')
  // console.log(processLabelImageFlag)
  // console.log(localFlag)
  processLabelImageFlag = 0
  let encoding = 'base64'
  var fbOptions = {
    encoding: encoding,
    uri: url,
    method: 'GET',
    gzip: true,
    json: false,
    resolveWithFullResponse: true,
    headers: {Authorization: "Bearer 'EAAJhTtF5K30BAFiGHlJz4Pvp2ZAxo9eAcyYyfd4GYAg0rYBP5lMrTWwg7z7UoNsezXNDR7wysqzHHIWTeS5LHNjfYhvJQ728t2uRHZAkCtypwceLDgl1Ixfr9KMPxFqQGX1PNOaJYZB7JR0WTfL3ZBaYKH6pR1IcRGO3GTuWVAZDZD'"}
  }
  console.log('URL processing', url)
  const request = require('request-promise')
  return request(fbOptions)
  .then(result => {
    console.log('Image buffer', result.body)
    var gaOptions = {
      method: 'POST',
      uri: 'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBQTHsQA5GuDG7Ttk17o3LBQfXjn7MtUQ8',
      body: {
        "requests": [
          {
            "image": {
               "content": result.body
            },
            "features": [
              {
                "type": "TEXT_DETECTION"
              }
            ]
          }
        ]
      },
      json: true
    }
    return request(gaOptions)
    .then(responses => {
      const pictureData = ocrUtils.processGvResponse(responses)
      // TODO: Prabhaav - integrate pictureData with code below.
      //       pictureData is a JSON dict containing:
      //         servingSize  - the size of a single serving off the nutrition facts panel
      //         servingsPer  - the number of servings in a box/container/whatever
      //         sugars       - the number of grams of sugar
      //         sugarsFound  - an array of all the sugars found on the ingredients text
      //
      // console.log('************************', pictureData)
      if (localFlag === 1 && pictureData && !isNaN(pictureData.sugars)) {
        let perResponse = 'You will consume ' + pictureData.sugars + 'g of sugar in one serving: ' + pictureData.servingSize + '.' 
        if (pictureData.sugars > 2) {
          let gifUrl = getGifUrl(pictureData.sugars)
          return [
            new fbTemplate.ChatAction('typing_on').get(),
            new fbTemplate.Pause(100).get(),
            perResponse,
            "Here's a gifv that shows you the amount of sugar in grams",
            new fbTemplate
            .Image(gifUrl)
            .get(),
            otherOptions(localFlag)
          ]
        }
        else {
          return [
            new fbTemplate.ChatAction('typing_on').get(),
            new fbTemplate.Pause(100).get(),
            perResponse,
            otherOptions(localFlag)
          ]
        }
      }
      else if (localFlag === 2 && pictureData && pictureData.sugarsFound.length > 0) {
        let perResponse = 'Here are the sugars found in the ingredient label\n. '
        for (let sug of pictureData.sugarsFound) {
          perResponse += sug + ', '
        }
        return [
          new fbTemplate.ChatAction('typing_on').get(),
          new fbTemplate.Pause(100).get(),
          perResponse,
          otherOptions(localFlag)
        ]
      }
      else {
        return [
          new fbTemplate.ChatAction('typing_on').get(),
          new fbTemplate.Pause(100).get(),
          'No sugar found!',
          otherOptions(localFlag)
        ]
      }
    })
  })
  .catch(err => {
    console.log('Error: ' + err)
  })
}

module.exports = botBuilder(function (request, originalApiRequest) {
  if (request.type === 'facebook') {
    var messageText = request.text.toLowerCase()
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
          return startMessage()
        }
        case 'send nutrition label': {
          processLabelImageFlag = 1
          return [
            new fbTemplate.ChatAction('typing_on').get(),
            new fbTemplate.Pause(100).get(),
            `Ok, please send me a picture of the nutrition label (Note: horizontal labels are not currently supported).`
          ]
        }
        case 'send ingredient label': {
          processLabelImageFlag = 2
          return [
            new fbTemplate.ChatAction('typing_on').get(),
            new fbTemplate.Pause(100).get(),
            `Ok, please send me a picture of the ingredient label.`
          ]
        }
        case 'another random sugar fact':
        case 'hit me with a fact':
        case 'random sugar facts': {
          return randomSugarFacts()
        }
        case 'send the ingredient':
        case 'try another sugar?':
        case 'not sugar?':
        case 'not sugar':
        {
          sugarCheckerFlag = true
          return [
            new fbTemplate.ChatAction('typing_on').get(),
            new fbTemplate.Pause(100).get(),
            `Ok, please send me the ingredient name.`
          ]
        }
        // case 'really! 56?':
        // case 'sugar types': {
        //   return sugarTypes()
        // }
        default: {
          return startMessage()
        }
      }
    }
    else if (processLabelImageFlag && messageAttachments) {
      const {url} = messageAttachments[0].payload
      return processLabelImage(url, processLabelImageFlag)
    }
  }
}, { platforms: ['facebook'] });
