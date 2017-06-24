// bot.js
const botBuilder = require('claudia-bot-builder')
const ocrUtils = require('./modules/ocrUtils.js')
const sugarUtils = require('./modules/sugarUtils.js')
const utils = require('./modules/utils.js')
const fire = require('./modules/firebaseUtils.js')
const image = require('./modules/imageUtils.js')
const nutrition = require ('./modules/nutritionix.js')
const fbTemplate = botBuilder.fbTemplate

const report = require('./modules/reportUtils.js')
const requestPromise = require('request-promise')

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

const isTestBot = false

let bailArr = ['main menu', 'refresh', 'reset', 'start', 'hey', 'menu', '?', 'help', 'hi', 'hello', 'get started', 'back', 'cancel', 'clear', 'exit']

module.exports = botBuilder(function (request, originalApiRequest) {
  // return 'hello world'
  if (request.type === 'facebook') {
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@', request)
    // console.log(request.originalRequest)
    // console.log('DATES', timestamp)
    // console.log(dateValue)
    // console.log(date)
    return firebase.auth().signInAnonymously()
    .then(() => {
      const userId = request.originalRequest.sender.id
      var messageText = request.text ? request.text.toLowerCase() : null
      var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId)
      if (bailArr.indexOf(messageText) > -1) {
        return tempRef.child('/temp/data/').remove()
        .then(() => {
          return utils.otherOptions(true)
        })
      }
      return tempRef.once("value")
      .then(function(snapshot) {
        const sugarCheckerFlag = snapshot.child('/temp/data/sugar/flag').val()
        const questionFlag = snapshot.child('/temp/data/question/flag').val()
        const upcFlag = snapshot.child('/temp/data/upc/flag').val()
        const missingUPC = snapshot.child('/temp/data/missingUPC/flag').val()
        const manual = snapshot.child('/temp/data/manual/flag').val()
        const cvFlag = snapshot.child('/temp/data/cv/flag').val()
        const goalSugar = snapshot.child('/temp/data/preferences/goalSugar').val()
        const weight = snapshot.child('/temp/data/preferences/weight').val()
        const goalWeight = snapshot.child('/temp/data/preferences/goalWeight').val()
        const cheatDay = snapshot.child('/temp/data/cheatDay/flag').val()
        const myCheatDay = snapshot.child('/preferences/currentCheatDay').val()
        const favFlag = snapshot.child('/temp/data/favorites/flag').val()
        const favorites = snapshot.child('/myfoods/').val()

        let timezone = snapshot.child('/profile/timezone').val()
        let first_name = snapshot.child('/profile/first_name').val()
        // should only happens once...unless user updates profile
        if (!first_name && !isTestBot) {
          fire.trackUserProfile(userId)
        }
        // defaults to PST
        if (!timezone) {
          timezone = -8
        }
        const {timestamp} = request.originalRequest
        const localTimestamp = timestamp + (timezone * 60 * 60 * 1000)
        const localDateValue = new Date(localTimestamp)
        // const localeTimeString = dateValue.toLocaleTimeString('en-US', {timeZone: timezone})
        const localeTimeString = localDateValue.toLocaleTimeString()
        var dateValue = new Date(localTimestamp)
        var date = dateValue.toDateString()
        var messageAttachments = (request.originalRequest && request.originalRequest.message) ? request.originalRequest.message.attachments : null
        if (sugarCheckerFlag && messageText) {
          return fire.sugarChecker(messageText, userId)
        }
        else if (questionFlag && messageText) {
          return nutrition.getNutritionix(messageText, userId, timezone)
        }
        else if ((upcFlag || cvFlag) && messageAttachments) {
          const {url} = messageAttachments[0].payload
          return image.processLabelImage(url, userId, upcFlag, cvFlag)
        }
        else if (upcFlag && messageText) {
          return image.fdaProcess(userId, messageText)
        }
        else if (favFlag && messageText) {
          // return 'adding your favorite: ' + request.text
          return fire.findMyFavorites(request.text, userId, date, timestamp)
        }
        else if ((manual || missingUPC) && messageText) {
          const inputSugar = utils.boundsChecker(messageText)
          if (inputSugar === -1) {
            return 'Invalid input. Please enter a valid number!'
          }
          if (manual) {
            const sugar = snapshot.child('/sugarIntake/' + date + '/dailyTotal/sugar').val()
            const newVal = sugar + inputSugar
            return tempRef.child('/sugarIntake/' + date + '/dailyTotal').update({
              sugar: newVal
            })
            .then(() => {
              return tempRef.child('/temp/data/manual').remove()
              .then(() => {
                return tempRef.child('/temp/data/food').update({
                  sugar: inputSugar
                })
                .then(() => {
                  return fire.addSugarToFirebase(userId, date, timestamp)
                })
              })
            })
          }
          else if (missingUPC) {
            return tempRef.child("/temp/data/missing/").once("value")
            .then(tsnapshot => {
              const barcode = tsnapshot.child('barcode').val()
              return firebase.database().ref("/global/sugarinfoai/missing/" + barcode).update({
                sugar: inputSugar
              })
              .then(() => {
                return tempRef.child('/temp/data/missing').remove()
                .then(() => {
                  return tempRef.child('/temp/data/food').update({
                    sugar: inputSugar
                  })
                  .then(() => {
                    return fire.addSugarToFirebase(userId, date, timestamp)
                  })
                })
              })
            })
          }
        }
        else if (weight && messageText) {
          return tempRef.child('/preferences/' + date).update({
            weight: messageText
          })
          .then(() => {
            return tempRef.child('/preferences/').update({
              currentWeight: messageText
            })
            .then(() => {
              return tempRef.child('/temp/data/preferences/').update({
                weight: false
              })
              .then(() => {
                return [
                  'Got it! Your weight added: ' + messageText,
                  utils.otherOptions(false)
                ]
              })
            })
          })
        }
        else if (goalWeight && messageText) {
          return tempRef.child('/preferences/' + date).update({
            goalWeight: messageText
          })
          .then(() => {
            return tempRef.child('/preferences/').update({
              currentGoalWeight: messageText
            })
            .then(() => {
              return tempRef.child('/temp/data/preferences/').update({
                goalWeight: false
              })
              .then(() => {
                return [
                  'Got it! Your goal weight added: ' + messageText,
                  utils.otherOptions(false)
                ]
              })
            })
          })
        }
        else if (goalSugar && messageText) {
          return tempRef.child('/preferences/' + date).update({
            goalSugar: messageText
          })
          .then(() => {
            return tempRef.child('/preferences/').update({
              currentGoalSugar: messageText
            })
            .then(() => {
              return tempRef.child('/temp/data/preferences/').update({
                goalSugar: false
              })
              .then(() => {
                return [
                  'Got it! Your sugar goal added: ' + messageText,
                  utils.otherOptions(false)
                ]
              })
            })
          })
        }
        else if (cheatDay && messageText) {
          return tempRef.child('/preferences/' + date).update({
            cheatDay: messageText
          })
          .then(() => {
            return tempRef.child('/preferences/').update({
              currentCheatDay: messageText
            })
            .then(() => {
              return tempRef.child('/temp/data/cheatDay').update({
                flag: false
              })
              .then(() => {
                return [
                  'Got it! Your cheat day updated: ' + messageText,
                  utils.otherOptions(false)
                ]
              })
            })
          })
        }
        else if (messageText) {
          switch (messageText) {
            case 'debug': {
              if (userId === '1547345815338571' || userId === '1322516797796635' || isTestBot) {  // AC or PBJ
                console.log('REQUEST -----------------------------------------')
                console.log(request)
                return [
                  "dateValue: " + dateValue,
                  "localDateValue: " + localDateValue,
                  "localeTimeString: " + localeTimeString,
                  "date: " + date
                ]
                // return ["timestamp: " + timestamp,
                //        "dateValue: " + dateValue,
                //        "date: " + date,
                //        "Date.now(): " + Date.now(),
                //        "request.originalRequest: ",
                //        origReqKeys]
                      //  "Date.now date: " + Date(Date.now()).toDateString()]
              }
            }
            case 'debug_report': {
              if (userId === '1547345815338571' || userId === '1322516797796635' || isTestBot) {  // AC or PBJ
                //
                // 1. Generate today's report of what was eaten.
                // 2. Send a webview button to the user allowing them to see
                //    what was eaten.
                return report.writeReportToS3(date, userId, snapshot)
                .then(result => {
                  if (isTestBot) {
                    return result
                  } else {
                    console.log('LAUNCHING WEBVIEW')
                    console.log('-----------------------------------------------')
                    console.log('recipient userId = ' + userId)
                    console.log('result = ' + result)

                    const webviewButtonOptions = {
                      uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=EAAJhTtF5K30BABsLODz0w5Af5hvd1SN9TZCU0E9OapZCKuZAOMugO2bNDao8JDe8E3cPQrJGLWWfL0sMxsq4MSTcZBbgGEjqa68ggSZCmZAFhGsFPFkWGUlYwAZB2ZCOrPPgdxS612ck5Rv8SrHydJihKQGsPLQSc1yYtBkncIpbOgZDZD',
                      json: true,
                      method: 'POST',
                      body: {
                        'recipient':{
                          'id':userId
                        },
                        'message':{
                          'attachment':{
                            'type':'template',
                            "payload":{
                              "template_type":"generic",
                              "elements":[
                                 {
                                  "title":"sugarinfoAI Daily Report",
                                  "image_url":"https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/arrows.jpg",
                                  "subtitle":first_name + "'s sugar consumption for " + localDateValue.toLocaleDateString(),
                                  "default_action": {
                                    "url": result,
                                    "type": "web_url",
                                    "messenger_extensions": true,
                                    "webview_height_ratio": "tall",
                                    "fallback_url": "https://www.inphood.com/"
                                  },
                                  "buttons":[
                                    {
                                      "url":result,
                                      "type":"web_url",
                                      "title":"View Report",
                                      "webview_height_ratio": "tall"
                                    },
                                    {
                                      "type":"element_share"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        }
                      },
                      resolveWithFullResponse: true,
                      headers: {
                        'Content-Type': "application/json"
                      }
                    }
                    return requestPromise(webviewButtonOptions)
                  }
                })
              }
            }
            case 'other options': {
              return utils.otherOptions(false)
            }
            case 'report':
            case 'my report': {
              return report.writeReportToS3(date, userId, snapshot)
              .then(result => {
                  if (isTestBot) {
                    return result
                  } else {
                    console.log('LAUNCHING WEBVIEW')
                    console.log('-----------------------------------------------')
                    console.log('recipient userId = ' + userId)
                    console.log('result = ' + result)

                    const webviewButtonOptions = {
                      uri: 'https://graph.facebook.com/v2.6/me/messages?access_token=EAAJhTtF5K30BABsLODz0w5Af5hvd1SN9TZCU0E9OapZCKuZAOMugO2bNDao8JDe8E3cPQrJGLWWfL0sMxsq4MSTcZBbgGEjqa68ggSZCmZAFhGsFPFkWGUlYwAZB2ZCOrPPgdxS612ck5Rv8SrHydJihKQGsPLQSc1yYtBkncIpbOgZDZD',
                      json: true,
                      method: 'POST',
                      body: {
                        'recipient':{
                          'id':userId
                        },
                        'message':{
                          'attachment':{
                            'type':'template',
                            "payload":{
                              "template_type":"generic",
                              "elements":[
                                 {
                                  "title":"sugarinfoAI Daily Report",
                                  "image_url":"https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/arrows.jpg",
                                  "subtitle":first_name + "'s sugar consumption for " + localDateValue.toLocaleDateString(),
                                  "default_action": {
                                    "url": result,
                                    "type": "web_url",
                                    "messenger_extensions": true,
                                    "webview_height_ratio": "tall",
                                    "fallback_url": "https://www.inphood.com/"
                                  },
                                  "buttons":[
                                    {
                                      "url":result,
                                      "type":"web_url",
                                      "title":"View Report",
                                      "webview_height_ratio": "tall"
                                    },
                                    {
                                      "type":"element_share"
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        }
                      },
                      resolveWithFullResponse: true,
                      headers: {
                        'Content-Type': "application/json"
                      }
                    }
                    return requestPromise(webviewButtonOptions)
                  }
                })
            }
            case 'send upc label':
            case 'upc label':
            case 'upc':
            case 'manual upc code entry':
            case 'analyze upc': {
              return tempRef.child('/temp/data/upc').update({
                flag: true
              })
              .then(() => {
                return [
                  new fbTemplate
                  .Image('https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/upc.jpg')
                  .get(),
                  "Please send me a photo of the UPC 📷 or type the number manually ⌨️"
                ]
              })
            }
            case 'my cheat day': {
              return tempRef.child('/temp/data/cheatDay').update({
                flag: true
              })
              .then(() => {
                return "Please send which day you'd like to be your cheatday: (Ex: Saturday)"
              })
            }
            case 'manual sugar track with upc': {
              return tempRef.child('/temp/data/missingUPC').update({
                flag: true
              })
              .then(() => {
                return "Please send me the amount of sugar in grams you'd like to add: (Ex: 20g)"
              })
            }
            case 'manual sugar track': {
              return tempRef.child('/temp/data/manual').update({
                flag: true
              })
              .then(() => {
                return "Please send me the amount of sugar in grams you'd like to add: (Ex: 20g)"
              })
            }
            case 'custom sugar for food': {
              return new fbTemplate.Text('What would you like to do next?')
              .addQuickReply('Different Serving', 'manual sugar track')
              .addQuickReply('Incorrect Sugar', 'incorrect sugar information')
              .get()
            }
            case 'incorrect sugar information': {
              return tempRef.child('/temp/data/manual').update({
                flag: true
              })
              .then(() => {
                return [
                  "I apologize about the discrepancy. I will try to get the correct information for you next time! 🤕",
                  "Please send me the amount of sugar in grams you'd like to add: (Ex: 20g)"
                ]
              })
            }
            case 'favorites':
            case 'my favorites': {
              return tempRef.child('/temp/data/favorites').update({
                flag: true
              })
              .then(() => {
                return utils.parseMyFavorites(favorites)
              })
            }
            case 'journal':
            case 'sugar journal':
            case 'food journal': {
              if (favorites) {
                return new fbTemplate.Text('What would you like to do next?')
                .addQuickReply('Favorites 😍', 'my favorites')
                .addQuickReply('UPC 🏷', 'analyze upc')
                .addQuickReply('Description ✏️', 'food question')
                .addQuickReply('Photo 🥗', 'send food picture')
                .get()
              }
              else {
                return new fbTemplate.Text('What would you like to do next?')
                .addQuickReply('UPC 🏷', 'analyze upc')
                .addQuickReply('Description ✏️', 'food question')
                .addQuickReply('Photo 🥗', 'send food picture')
                .get()
              }
            }
            case 'food question':
            case 'question': {
              return tempRef.child('/temp/data/question').update({
                flag: true
              })
              .then(() => {
                return 'Ok, please tell me what you ate or drank'
              })
            }
            case 'send food picture':
            case 'food picture':
            case 'picture': {
              return tempRef.child('/temp/data/cv').update({
                flag: true
              })
              .then(() => {
                return "Please send me a picture of your meal and I'll try to guess what you're eating"
              })
            }
            case 'another random sugar fact':
            case 'hit me with a fact':
            case 'random sugar fact':
            case 'random sugar facts': {
              return utils.randomSugarFacts()
            }
            case 'recipe':
            case "today's recipe":
            case 'send me todays recipe':
            case 'sugar recipe': {
              return utils.todaysSugarRecipe(timestamp)
            }
            case 'processed ingredient':
            case 'try another sugar?':
            case 'processed sugar?':
            case 'processed sugar':
            {
              return tempRef.child('/temp/data/sugar').update({
                flag: true
              })
              .then(() => {
                return [
                  new fbTemplate.ChatAction('typing_on').get(),
                  new fbTemplate.Pause(100).get(),
                  `Ok, please send me the processed ingredient you are curious about.`
                ]
              })
            }
            case 'share': {
              return utils.sendShareButton()
            }
            case 'add sugar': {
              return fire.addSugarToFirebase(userId, date, timestamp)
            }
            case 'remove temp food data': {
              return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/food").remove()
              .then(function() {
                return utils.otherOptions(false)
              })
            }
            case 'preferences': {
              return new fbTemplate.Text('What would you like to do?')
                .addQuickReply('Sugar Goal', 'goalsugar')
                .addQuickReply('Current Weight', 'weight')
                .addQuickReply('Weight Goal', 'goalWeight')
                .get()
            }
            case 'weight': {
              return tempRef.child('/temp/data/preferences').update({
                weight: true
              })
              .then(() => {
                return 'Ok, please tell me your weight in lbs (ex: 165)'
              })
            }
            case 'goalweight': {
              return tempRef.child('/temp/data/preferences').update({
                goalWeight: true
              })
              .then(() => {
                return 'Ok, please tell me your goal weight in lbs (ex: 165)'
              })
              .catch(error => {
                console.log('Something went wrong with firebase')
              })
            }
            case 'goalsugar': {
              return tempRef.child('/temp/data/preferences').update({
                goalSugar: true
              })
              .then(() => {
                return 'Ok, please tell me your sugar goal in grams (ex: 40)'
              })
              .catch(error => {
                console.log('Something went wrong with firebase')
              })
            }
            case 'knowledge':
            case 'sugar knowledge':
            case 'food knowledge': {
              return new fbTemplate.Text('What would you like to know?')
                .addQuickReply('Facts 🎲', 'Random Sugar Facts')
                .addQuickReply('Recipes 📅', 'recipe')
                .addQuickReply('Processed? 🍭', 'Processed Sugar?')
                .get()
            }
            case 'time1': {
              const time = timestamp + (1*3600*1000)
              return firebase.database().ref("/global/sugarinfoai/reminders/" + userId).update({
                time1: time
              })
              .then(() => {
                return [
                  "Great I'll remind you in a hour! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'time3': {
              const time = timestamp + (3*3600*1000)
              return firebase.database().ref("/global/sugarinfoai/reminders/" + userId).update({
                time3: time
              })
              .then(() => {
                return [
                  "Great I'll remind you in 3 hours! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'time5': {
              const time = timestamp + (5*3600*1000)
              return firebase.database().ref("/global/sugarinfoai/reminders/" + userId).update({
                time5: time
              })
              .then(() => {
                return [
                  "Great I'll remind you in 5 hours! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'timetomorrow': {
              const time = timestamp + (24*3600*1000)
              return firebase.database().ref("/global/sugarinfoai/reminders/" + userId).update({
                timeTomorrow: time
              })
              .then(() => {
                return [
                  "Great I'll remind you tomorrow! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'notime': {
              return tempRef.child('/preferences/nextReminder').remove()
              .then(() => {
                return [
                  "Ok I will not remind you! You can still add meals when you please.",
                  utils.otherOptions(false)
                ]
              })
            }
            case 'very alert': {
              return tempRef.child('alertness/' + date + '/' + timestamp).update({
                feeling: 'very alert'
              })
              .then(() => {
                // return utils.trackMood()
                return utils.sendReminder()
              })
            }
            case 'typical alertness': {
              return tempRef.child('alertness/' + date + '/' + timestamp).update({
                feeling: 'typical alertness'
              })
              .then(() => {
                // return utils.trackMood()
                return utils.sendReminder()
              })
            }
            case 'drowsy': {
              return tempRef.child('alertness/' + date + '/' + timestamp).update({
                feeling: 'drowsy'
              })
              .then(() => {
                // return utils.trackMood()
                return utils.sendReminder()
              })
            }
            case 'not now alertness': {
              return tempRef.child('alertness/' + date + '/' + timestamp).update({
                feeling: 'not now'
              })
              .then(() => {
                // return utils.trackMood()
                return utils.sendReminder()
              })
            }
            case 'positive mood': {
              return tempRef.child('mood/' + date + '/' + timestamp).update({
                mood: 'positive'
              })
              .then(() => {
                return utils.sendReminder()
              })
            }
            case 'negative mood': {
              return tempRef.child('mood/' + date + '/' + timestamp).update({
                mood: 'negative'
              })
              .then(() => {
                return utils.sendReminder()
              })
            }
            case 'neutral mood': {
              return tempRef.child('mood/' + date + '/' + timestamp).update({
                mood: 'neutral'
              })
              .then(() => {
                return utils.sendReminder()
              })
            }
            case 'not now mood': {
              return tempRef.child('mood/' + date + '/' + timestamp).update({
                mood: 'not now'
              })
              .then(() => {
                return utils.sendReminder()
              })
            }
            default: {
              return nutrition.getNutritionix(messageText, userId, timezone)
              // return [
              //   new fbTemplate
              //   .Image('http://i.imgur.com/uhHyYvP.gif')
              //   .get(),
              //   nutrition.getNutritionix(messageText, userId, timezone)
              // ]
            }
          }
        }
      })
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/operation-not-allowed') {
        // alert('You must enable Anonymous auth in the Firebase Console.');
        throw 'You must enable Anonymous auth in the Firebase Console.'
      } else {
        console.log('Error happened: ', error);
      }
    })
  }
}, { platforms: ['facebook'] });
