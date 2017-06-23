const Quagga = require('quagga').default;
const reqProm = require('request-promise')
const sugarUtils = require('./sugarUtils.js')
const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;

exports.boundsChecker = function(input) {
  let num = input
  if (typeof(input) === "string") {
    num = parseInt(input)
  }
  if (num > -1 && num < 150) {
    return num
  }
  return -1
}

exports.getBarcodeAsync = function(param){
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

exports.getUsdaReport = function(ndbno) {
  // TODO: refactor api_key and URLs to config.js type area.
  const usdaReportReq = {
    uri: 'https://api.nal.usda.gov/ndb/reports/',
    method: 'GET',
    qs: {
      ndbno: ndbno.toString(),
      type: 'f',
      format: 'json',
      api_key: 'hhgb2UmFJsDxzsslo5ZlNHyR6vIZIbEXO83lMTRt'
    },
    json: true,
    resolveWithFullResponse: true
  }

  let result = {
    error: undefined,
    ingredients: undefined,
    ingredientsSugarsCaps: undefined,
    sugarPerServing: undefined,
    sugarPerServingStr: undefined
  }
  const SUGAR_NUTRIENT_ID = '269'

  return reqProm(usdaReportReq)
  .then(usdaReportResult => {
    // console.log('USDA Report Request successful:')
    // console.log('----------------------------')
    // console.log(usdaReportResult.body)

    result.ingredients = usdaReportResult.body.report.food.ing.desc
    result.ingredientsSugarsCaps = sugarUtils.capitalizeSugars(result.ingredients)

    const nutrients = usdaReportResult.body.report.food.nutrients
    for (let nutrient of nutrients) {
      if (nutrient.nutrient_id !== SUGAR_NUTRIENT_ID) {
        continue
      }

      if (nutrient.measures.length > 0) {
        // Assume first measure will suffice
        let measure = nutrient.measures[0]

        let eunit = measure.eunit

        let sugarPerServing = ''
        sugarPerServing += measure.value + eunit + ' '
        sugarPerServing += nutrient.name.toLowerCase().replace(/,.*/g, '')
        sugarPerServing += ' in a '
        sugarPerServing += measure.qty + ' ' + measure.label
        sugarPerServing += ' (' + measure.eqv + eunit + ') serving'
        result.sugarPerServingStr = sugarPerServing
        result.sugarPerServing = measure.value

        break
      }
    }
    console.log(result.sugarPerServing)
    console.log('---')
    console.log('Ingredients: ' + result.ingredientsSugarsCaps)
    return result
  })
  .catch(error => {
    const errMsg = 'USDA Report Request failed' + error
    console.log(errMsg)
    result.error = errMsg
    return result
  })
}

exports.otherOptions = function(option) {
  if (option === true) {
    return [
      "Welcome to sugarinfoAI! I'm here to help you understand sugar 🤓",
      new fbTemplate.Text("Here are your options")
        // .addQuickReply('Analyze UPC Label 🔬', 'analyze nutrition')
        .addQuickReply('Journal ✏️', 'food journal')
        // .addQuickReply('Send food image 🥗', 'send food picture')
        .addQuickReply('Knowledge 📚', 'food knowledge')
        .addQuickReply('Preferences ⚙️', 'preferences')
        .get()
    ]
  }
  else {
    return new fbTemplate.Text('What would you like to do next?')
      // .addQuickReply('Analyze UPC Label 🔬', 'analyze nutrition')
      .addQuickReply('Journal ✏️', 'food journal')
      // .addQuickReply('Send food image 🥗', 'send food picture')
      .addQuickReply('Knowledge 📚', 'food knowledge')
      .addQuickReply('Preferences ⚙️', 'preferences')
      .get();
  }
}

exports.randomSugarFacts = function() {
  const data = sugarUtils.getSugarFact()
  console.log('Random sugar fact', data)
  return [
    new fbTemplate.ChatAction('typing_on').get(),
    new fbTemplate.Pause(100).get(),
    // "Processing label. Here's a random nutrition fact while you wait: ",
    data.fact,
    data.source,
    exports.otherOptions(false)
  ]
}

exports.todaysSugarRecipe = function(dateVal) {
  const date = new Date(dateVal)
  const message = "Here's your daily sugar free recipe for " + date.toDateString()
  const data = sugarUtils.getSugarRecipe(date)
  console.log('Datevalue', date)
  console.log('Todays sugar recipe', data)
  return [
    new fbTemplate.ChatAction('typing_on').get(),
    new fbTemplate.Pause(100).get(),
    // "Processing label. Here's a random nutrition fact while you wait: ",
    message,
    data.recipe + ': ' + data.link,
    exports.otherOptions(false)
  ]
}

exports.sendShareButton = function() {
  return new fbTemplate.Generic()
    .addBubble('sugarinfoAI 🕵️ ', 'Find and track (hidden) sugars in your diet')
    .addUrl('https://www.facebook.com/sugarinfoAI/')
    .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/sugar.jpg')
    .addShareButton()
    .get()
}

exports.getGifUrl = function(number) {
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

exports.sendReminder = function() {
  return new fbTemplate.Text('When should I remind you to track your next meal?')
  .addQuickReply('1 hour', 'time1')
  .addQuickReply('3 hours', 'time3')
  .addQuickReply('5 hours', 'time5')
  .addQuickReply('Tomorrow', 'timeTomorrow')
  .addQuickReply("Don't ask", 'notime')
  .get()
}

exports.trackMood = function() {
  return new fbTemplate.Text('Would you like to record your mood?')
  .addQuickReply('🙂', 'positive mood')
  .addQuickReply('😐', 'neutral mood')
  .addQuickReply('🙁', 'negative mood')
  .addQuickReply('Not now  ❌', 'not now mood')
//   .addQuickReply('Don\'t ask again', 'don\'t ask mood again')
  .get();
}

exports.trackAlertness = function() {
  return new fbTemplate.Text('Would you like to record your alertness?')
  .addQuickReply('😳', 'very alert')
  .addQuickReply('😐', 'typical alertness')
  .addQuickReply('😴', 'drowsy')
  .addQuickReply('Not now  ❌', 'not now alertness')
//   .addQuickReply('Don\'t ask again', 'do not ask alertness again')
  .get();
}

exports.parseMyFavorites = function(favorites) {
  let favArr = []
  let myFavs = new fbTemplate.Text('Here are your most commonly added meals')
  for (let object in favorites) {
    let length = Object.keys(favorites[object].date).length
    favArr.push({length, object})
  }
  console.log('Pre sorted', favArr)
  console.log('\n\n\n\n\n')
  favArr.sort(function(a, b) {
    return (a.length < b.length)
  })
  console.log('Post sorted', favArr)
  let i = 0
  for (let it of favArr) {
    if (i === 4)
      break
    i++
    myFavs
    .addQuickReply(it.object.toLowerCase(), it.object)
  }
  myFavs.addQuickReply('Cancel', 'back')
  return myFavs.get()
  // console.log('\n\n\n\n')
  // console.log('Pre-Sorted', favArr)
  // favArr.sort(function(a, b) {
  //   console.log('\n\n\n\n', a, b)
  //   const aDates = a.dates
  //   const bDates = b.dates
  //   return (Object.keys(aDates).length > Object.keys(bDates).length)
  // })
  // console.log('\n\n\n\n')
  // console.log('Sorted', favArr)
  // if (favArr.length > 2) {
  //   let clear = favArr.length - 3
  //   favArr.splice(0, clear)
  // }
  // console.log('\n\n\n\n')
  // console.log('Spliced', favArr)
  // return favArr
}

// exports.sugarTypes = function() {
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



// function startMessage() {
//   return [
//     new fbTemplate
//       .Image('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/home.jpg')
//       .get(),
//     'Welcome to SugarInfoBot, the easiest way to learn about your sugar intake. Here are your options',
//     new fbTemplate.Generic()
//     .addBubble('Nutrition Label Analysis', 'Send me a photo of your nutrition label to analyze')
//       .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/nutrition.png')
//       .addButton('Analyze Nutrition 🔬', 'analyze nutrition')
//     .addBubble('Ingredient Label Analysis', 'Send me a photo of your ingredient label to analyze')
//       .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/ingredients.png')
//       .addButton('Check Ingredients ‍💻', 'send ingredient label')
//     .addBubble('Random Sugar Facts', 'Sugar knowledge tidbits')
//       .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/chance.jpg')
//       .addButton('Random Sugar Fact 🎲', 'Random Sugar Facts')
//     .addBubble('Processed Sugar?', "Send me an ingredient and I'll tell you if it's sugar")
//       .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/books.jpg')
//       .addButton('Processed Sugar? 🍭', 'Processed Sugar?')
//     // .addBubble('Sugar Types', 'Get a list of all the sugar types and their info')
//     //   .addImage('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/types.jpg')
//     //   .addButton('Really! 56?', 'Sugar Types')
//     .get()
//   ]
// }