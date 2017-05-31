var http = require('http');
var levenshtein = require('fast-levenshtein');

// Source: https://authoritynutrition.com/56-different-names-for-sugar/
const sugarNames = [
  'sugar',
  'sucrose',
  'high-fructose corn syrup',
  'hfcs',
  'agave nectar',
  'beet sugar',
  'blackstrap molasses',
  'brown sugar',
  'buttered syrup',
  'cane juice crystals',
  'cane sugar',
  'caramel',
  'carob syrup',
  'castor sugar',
  'coconut sugar',
  'confectioner\'s sugar',
  'powdered sugar',
  'date sugar',
  'demarara sugar',
  'evaporated cane juice',
  'florida crystals',
  'fruit juice',
  'fruit juice concentrate',
  'golden sugar',
  'golden syrup',
  'grape sugar',
  'honey',
  'icing sugar',
  'invert sugar',
  'maple syrup',
  'molasses',
  'muscovado sugar',
  'panela sugar',
  'raw sugar',
  'refiner\'s syrup',
  'sorghum syrup',
  'sucanat',
  'treacle sugar',
  'turbinado sugar',
  'yellow sugar',
  'barley malt',
  'brown rice syrup',
  'corn syrup',
  'corn syrup solids',
  'dextrin',
  'dextrose',
  'diastatic malt',
  'ethyl maltol',
  'glucose',
  'glucose solids',
  'lactose',
  'malt syrup',
  'maltodextrin',
  'maltose',
  'rice syrup',
  'cryrstalline fructose',
  'fructose',
  'd-ribose',
  'galactose'
]

// Iterate over all of the sugar names getting a levenshtein distance for each one
// compared to anIngredient. Return the closest matching one.
//
function getSugar(anIngredient) {
  const levThreshold = 2
  let minLev = levThreshold
  let matchingSugar = ''

  for (let sugarName of sugarNames) {
    let lev = levenshtein.get(anIngredient, sugarName)

    if (lev <= minLev) {
      minLev = lev
      matchingSugar = sugarName
    }
  }

  return matchingSugar
}

// function to encode file data to base64 encoded string
exports.base64_encode = function(file) {
    const fs = require('fs')
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

function processText(text) {
  // Crappy attempt #1:
  //  1. lowercase text
  let lcText = text //text.toLowerCase()

  //  2. stip out linefeeds, _, ~, = (and any other bizarre stuff we observe OCR injecting/recognizing)
  let strippedText = lcText.replace(/[\n_~=]/g, '')

  //  3. stip out anything up to 'ingredients: ' if found
  let remainingText = strippedText.replace(/.*ingredients:/i, '')

  //  4. switch out '(' ')' for ','
  let comma4parenText = remainingText.replace(/[()]/g, ',')

  //  5. split on ',' to array of ingredients
  let ingredientsText = comma4parenText.split(',')

  //  6. trim spaces/whitespace from edges of ingredients
  //  7. measure the levenshtein distance of each sugarName to the current ingredient
  //     and select the highest scoring one above a threshold (i.e. lev distance < 4)
  //
  for (let ingredient of ingredientsText) {
    const lcTrimmedIngredient = ingredient.toLowerCase().trim()
    const sugar = getSugar(lcTrimmedIngredient)
    if (sugar !== '') {
      console.log('Found sugar ', sugar, ' (', lcTrimmedIngredient, ')')
    }
  }
}

// Returns the text up to End-of-line that proceeds the given prefix. For example,
//  given:
//    text = "0%\nSugars og\nProtein"
//    prefix = "Sugars"
//  this method returns: "og"
//
function getAtomFollowingTextToEOL(text, prefix) {
  const regex = new RegExp(prefix + "(.*?)\n")
  let match = regex.exec(text)
  if (match.length < 2) {
    return ""
  }
  // console.log('getAtomFollowingTextToEOL -------------------------------------')
  // console.log('prefix: ' + match[1].trim())
  // console.log('')
  return match[1].trim()
}

exports.processGvResponse = function(responses) {
  let text = ''
  let pictureData = {}

  for (let response of responses.responses) {
    //  Structure:
    //
    //    response
    //      textAnnotations
    //        ...
    //      fullTextAnnotations
    //        pages
    //          [{
    //            property: ...
    //            width: 1234
    //            height: 4032
    //            blocks: [...]
    //          }]
    //        text: 'sjfldjfd \n ljdlfjd'
    //
    //
    const fullTextAnnotation = response.fullTextAnnotation
    text = fullTextAnnotation.text

    // assume only one response
    break
  }

  // Crappy attempt #1.1:

  // 1. lowercase text
  const lcText = text.toLowerCase()

  // 2. try to get nutrition label information:
  //  a. serving size
  //  b. servings per
  //  c. sugars
  const servingSizeAtom = getAtomFollowingTextToEOL(lcText, 'serving size')
  const servingsPerAtom = getAtomFollowingTextToEOL(lcText, 'servings per')
  const sugarsAtom = getAtomFollowingTextToEOL(lcText, 'sugars')
  if (sugarsAtom !== '' && servingSizeAtom !== '') {
    console.log('You will consume ' + sugarsAtom + ' in one serving, ' + servingSizeAtom + '.')
  }

  // TODO: further processing of atoms (i.e. convert to numbers/units etc.)
  pictureData.servingSize = servingSizeAtom
  pictureData.servingsPer = servingsPerAtom
  pictureData.sugars = sugarsAtom

  // 3. stip out everything up to 'ingredients: ' if found
  const lcTextAfterIngredients = lcText.replace(/.*ingredients(:?)/i, '')

  // 4. strip out linefeeds
  // 5. split on ',' to array of ingredients
  //    TODO: Google vision doesn't seem to see commas properly. We'll need to
  //          work on finding ingredients in the entire trimmed string instead
  //          of this current splitting method
  const lcIngredients = lcTextAfterIngredients.replace(/\n/g, '').split(',')

  // 6. trim spaces/whitespace from edges of ingredients
  // 7. measure the levenshtein distance of each sugarName to the current ingredient
  //     and select the highest scoring one above a threshold (i.e. lev distance < 4)
  //
  pictureData.sugarsFound = []
  let sugarsFound = false
  for (let ingredient of lcIngredients) {
    const lcTrimmedIngredient = ingredient.trim()
    const sugar = getSugar(lcTrimmedIngredient)
    if (sugar !== '') {
      sugarsFound = true
      console.log('Found sugar ', sugar, ' (', lcTrimmedIngredient, ')')
      let sugarString = sugar + ' (' + lcTrimmedIngredient + ')'
      pictureData.sugarsFound.push(sugarString)
    }
  }
  if (!sugarsFound) {
    console.log('No sugars found in ingredients for this image.')
  }

  return pictureData
}
