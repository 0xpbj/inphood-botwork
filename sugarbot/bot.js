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
  if (ocrUtils.sugarNames.indexOf(messageText) > -1) {
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
      .addButton('Is it sugar? 🍭', 'Not Sugar?')
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
  //     .addButton('Is it sugar?', 'Not Sugar?')
  //     .get();
  // }
  // else if (option === 2) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Nutrition', 'send nutrition label')
  //     .addButton('Random Sugar Fact', 'Random Sugar Facts')
  //     .addButton('Is it sugar?', 'Not Sugar?')
  //     .get();
  // }
  // else if (option === 3) {
  //   return new fbTemplate.Button('What next?')
  //     .addButton('Analyze Nutrition', 'send nutrition label')
  //     .addButton('Analyze Ingredients', 'send ingredient label')
  //     .addButton('Is it sugar?', 'Not Sugar?')
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
    .addQuickReply('Check Ingredients ‍💻', 'send ingredient label')
    .addQuickReply('Random Sugar Fact 🎲', 'Random Sugar Facts')
    .addQuickReply('Is it sugar? 🍭', 'Not Sugar?')
    .get();
}

let processLabelImageFlag = 0
function processLabelImage(url, processLabelImageFlag) {
  let localFlag = processLabelImageFlag
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
      console.log('Responses:', responses);
      const {textAnnotations, fullTextAnnotation} = responses.responses[0];
      console.log('Text:', textAnnotations);
      console.log('Full Text: ', fullTextAnnotation)
      if (textAnnotations && fullTextAnnotation) {
        textAnnotations.forEach((text) => console.log(text));
        return [
          new fbTemplate.ChatAction('typing_on').get(),
          new fbTemplate.Pause(100).get(),
          'Results received',
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
            `Ok, please send me a picture of the nutrition label`
          ]
        }
        case 'send ingredient label': {
          processLabelImageFlag = 2
          return [
            new fbTemplate.ChatAction('typing_on').get(),
            new fbTemplate.Pause(100).get(),
            `Ok, please send me a picture of the ingredient label`
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
