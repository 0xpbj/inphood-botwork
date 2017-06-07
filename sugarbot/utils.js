const Quagga = require('quagga').default;
const reqProm = require('request-promise')
const sugarUtils = require('./sugarUtils.js')

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
    sugarPerServing: undefined
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
        result.sugarPerServing = sugarPerServing

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
