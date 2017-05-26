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

function processText(text) {
  console.log(text)
}

http.createServer(function (request, response) {

  // const url = 'http://cdn1.medicalnewstoday.com/content/images/articles/271157-bananas.jpg'
  const url = 'http://ucsdaim.org/wp-content/uploads/2010/04/nutritionfacts.jpg'

  let encoding = 'binary'
  var options = {
    encoding: encoding,
    uri: url,
    method: 'GET',
    gzip: true,
    json: false,
    resolveWithFullResponse: true
    // headers: {Authorization: "Bearer 'EAAJhTtF5K30BAC2EC7KfySkyNJiJfqGW7ZCi4W1CJcmFuZBVLZCA0cZCkpkZCugYvNzVfugI6rji9ZAWqjJwEvJJlgEML8xj4nbIym7CdQTNoGT7y9LobncZCduDxYMzM5MXA02x9OMZCMyoeKSGxwqclT0c168AHf8CvMFlo2E5fAZDZD'"}
  }

  const Tesseract = require('tesseract.js')
  const rp = require('request-promise')
  const fs = require('fs')

  const testImages = ['ingredients.no-sugars.jpg',
                      'ingredients.half-sugars.jpg',
                      'ingredients.all-sugars.jpg']

  for (let testImageFile of testImages) {
    console.log('Processing ', testImageFile, ' --------------------------------')
    var jpegFromDisk = fs.readFileSync(testImageFile)

    Tesseract.recognize(jpegFromDisk)
    // .progress(message => console.log('TMessage: ', message))
    // .catch(err => console.log('TErr: ', err))
    .then(result => {
      // console.log('Result ------------------------------------------------------')
      // console.log('Result: ', result)
      // console.log('')
      let text = ''
      console.log('Paragraphs in ', testImageFile, ' --------------------------------')
      for (let paragraph of result.paragraphs) {
        text += paragraph.text
      }
      processText(text)
    })
// .finally(resultOrError => console.log('TFinally: ', resultOrError))
  }
  return
}).listen(8080)

console.log('Server started')
console.log('Navigate to http://127.0.0.1:8080/ and refresh to trigger this bot.')
