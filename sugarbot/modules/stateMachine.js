const ocrUtils = require('./ocrUtils.js')
const sugarUtils = require('./sugarUtils.js')
const utils = require('./utils.js')
const fire = require('./firebaseUtils.js')
const image = require('./imageUtils.js')
const nutrition = require ('./nutritionix.js')
const constants = require('./constants.js')
const timeUtils = require('./timeUtils.js')

const botBuilder = require('claudia-bot-builder')
const fbTemplate = botBuilder.fbTemplate

const requestPromise = require('request-promise')
const sentiment = require('sentiment');

const firebase = require('firebase')
if (firebase.apps.length === 0) {
  firebase.initializeApp(constants.fbConfig)
}
const isTestBot = false

exports.bot = function(request, messageText, userId) {
  const tempRef = firebase.database().ref("/global/sugarinfoai/" + userId)
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
    // const cheatDay = snapshot.child('/temp/data/cheatDay/flag').val()
    const myCheatDay = snapshot.child('/preferences/currentCheatDay').val()
    const favFlag = snapshot.child('/temp/data/favorites/flag').val()
    const favorites = snapshot.child('/myfoods/').val()
    const foodData = snapshot.child('/temp/data/food').val()

    let timezone = snapshot.child('/profile/timezone').val()
    let first_name = snapshot.child('/profile/first_name').val()
    // should only happens once...unless user updates profile
    // if (!first_name && !isTestBot) {
    //   fire.trackUserProfile(userId)
    // }
    // defaults to PST
    if (!timezone) {
      timezone = -7
    }
    const {timestamp} = request.originalRequest
    const date = timeUtils.getUserDateString(timestamp, timezone)

    var messageAttachments = (request.originalRequest && request.originalRequest.message) ? request.originalRequest.message.attachments : null
    if (messageText) {
      switch (messageText) {
        case 'start over':
        case 'get started': {
          return fire.trackUserProfile(userId)
          .then(() => {
            return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data").remove()
            .then(() => {
              return firebase.database().ref("/global/sugarinfoai/" + userId + "/profile/").once("value")
              .then(function(snapshot) {
                let intro = ''
                if (snapshot.child('first_name').exists()) {
                  intro = 'Hi ' + snapshot.child('first_name').val() + ', I’m sugarinfoAI! I can help you understand how much sugar you are eating and help you bring it within recommended limits. Would you like that?'
                }
                else {
                  intro = 'Hi, I’m sugarinfoAI! I can help you understand how much sugar you are eating and help you bring it within recommended limits. Would you like that?'
                }
                return new fbTemplate.Button(intro)
                .addButton('Sure, let\'s go', 'food question')
                .addButton('Maybe later', 'say adios')
                .get()
              })
            })
          })
        }
        case 'say adios': {
          return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data").remove()
          .then(() => {
            return 'No problem! If you have any questions later just type: help'
          })
        }
        case 'debug_user_time': {
          if (isTestBot || constants.testUsers.includes(userId)) {
            console.log('REQUEST -----------------------------------------')
            console.log(request)
            return [
              "date: " + date,
              "time: " + timeUtils.getUserTimeString(timestamp, timezone)
            ]
          }
        }
        case 'debug_wv_settings': {
          console.log('DEBUG WEBVIEW SETTINGS:')
          console.log('-------------------------------------------------------')
          const wvMsg = {
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
                        "title":"Settings",
                        "image_url":"https://d1q0ddz2y0icfw.cloudfront.net/chatbotimages/arrows.jpg",
                        "subtitle":"Webview settings",
                        "default_action": {
                          "url": 'https://s3-us-west-1.amazonaws.com/www.inphood.com/webviews/Settings.html',
                          "type": "web_url",
                          "messenger_extensions": true,
                          "webview_height_ratio": "tall",
                          "webview_share_button": "hide",
                          "fallback_url": "https://www.inphood.com/"
                        }
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

          return requestPromise(wvMsg)
        }
        case 'other options': {
          return utils.otherOptions(false)
        }
        case 'report':
        case 'my report': {
          console.log('REPORT ------------------------------------------------')
          const reportRequest = {
            reportType: 'dailySummary',
            userId: userId,
            userTimeStamp: timestamp
          }
          console.log('  adding report request to firebase')
          const dbReportQueue = firebase.database().ref("/global/sugarinfoai/reportQueue")
          const dbReportQueueRequest = dbReportQueue.push()
          dbReportQueueRequest.set(reportRequest)
          console.log('  returning')
          return 'A report is on the way.'
        }
        case 'send upc label':
        case 'upc label':
        case 'upc':
        case 'manual upc code entry':
        case 'ingredient check':
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
        // case 'my cheat day': {
        //   return tempRef.child('/temp/data/cheatDay').update({
        //     flag: true
        //   })
        //   .then(() => {
        //     return "Please send which day you'd like to be your cheatday: (Ex: Saturday)"
        //   })
        // }
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
          if (!foodData) {
            return 'Please add food to your journal before editing sugar values'
          }
          return new fbTemplate.Button('What would you like to do next?')
          .addButton('Different Serving', 'manual sugar track')
          .addButton('Incorrect Sugar', 'incorrect sugar information')
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
          if (!favorites) {
            return 'Favorites are shown once you add meals to your journal'
          }
          return tempRef.child('/temp/data/favorites').update({
            flag: true
          })
          .then(() => {
            return utils.parseMyFavorites(favorites)
          })
        }
        case 'food question':
        case 'question': {
          const timeUser = timeUtils.getUserTimeObj(Date.now(), timezone)
          let mealInfo = '? (e.g: almonds and cranberries)'
          let mealType = 'snack'
          const {hour} = timeUser
          if (hour > 4 && hour < 13) {
            mealType = 'breakfast'
            mealInfo = ' this morning? (e.g: I had two eggs, avocado, and toast)'
          }
          else if (hour > 12 && hour < 18) {
            mealType = 'lunch'
            mealInfo = ' this afternoon? (e.g: chicken sandwich and cola)'
          }
          else if (hour > 17 && hour < 23) {
            mealType = 'dinner'
            mealInfo = ' this evening? (e.g: Kale, spinach, tomatoes, cheese, and dressing)'
          }
          return tempRef.child('/temp/data/question').update({
            flag: true,
            mealType
          })
          .then(() => {
            let ret = 'Great! Tell me what you ate' + mealInfo
            // if (!favorites) {
            //   ret += '\n Here are some examples phrases I understand.: \
            //   \n  1.)  I had two eggs, sausage, toast \
            //   \n  2.)  peanut butter and jelly, milk \
            //   \n  3.)  how much sugar is in coffee?'
            // }
            return ret
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
        case 'add sugar': {
          return fire.addSugarToFirebase(userId, date, timestamp)
        }
        case 'remove temp food data': {
          return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/food").remove()
          .then(() => {
            return utils.otherOptions(false)
          })
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
        case '1 hour':
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
        case '3 hours':
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
        case '5 hours':
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
        case '24 hours':
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
        case 'don\'t ask':
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
          if (sugarCheckerFlag && messageText) {
            return fire.sugarChecker(messageText, userId)
          }
          else if (questionFlag && messageText) {
            return nutrition.getNutritionix(messageText, userId, timezone, false)
          }
          else if (upcFlag && messageText) {
            return image.fdaProcess(userId, messageText)
          }
          else if (favFlag && messageText) {
            // return 'adding your favorite: ' + request.text
            return fire.findMyFavorites(request.text, userId, date, timestamp)
          }
          else if ((manual || missingUPC) && messageText) {
            const inputSugar = utils.boundsChecker(messageText, false)
            if (inputSugar === -1) {
              return 'Invalid input. Please enter a valid number!'
            }
            if (manual) {
              return tempRef.child('/temp/data/manual').remove()
              .then(() => {
                return tempRef.child('/temp/data/food').update({
                  sugar: inputSugar
                })
                .then(() => {
                  return fire.addSugarToFirebase(userId, date, timestamp)
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
                  return tempRef.child('/temp/data/missingUPC').remove()
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
            let check = utils.boundsChecker(messageText, true)
            if (check == -1) {
              return 'Invalid input. Please enter a valid number!'
            }
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
            let check = utils.boundsChecker(messageText, true)
            if (check == -1) {
              return 'Invalid input. Please enter a valid number!'
            }
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
            let check = utils.boundsChecker(messageText, false)
            if (check == -1) {
              return 'Invalid input. Please enter a valid number!'
            }
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
          // else if (cheatDay && messageText) {
          //   return tempRef.child('/preferences/' + date).update({
          //     cheatDay: messageText
          //   })
          //   .then(() => {
          //     return tempRef.child('/preferences/').update({
          //       currentCheatDay: messageText
          //     })
          //     .then(() => {
          //       return tempRef.child('/temp/data/cheatDay').update({
          //         flag: false
          //       })
          //       .then(() => {
          //         return [
          //           'Got it! Your cheat day updated: ' + messageText,
          //           utils.otherOptions(false)
          //         ]
          //       })
          //     })
          //   })
          // }
          // else if (snapshot.child('/temp/data/food').val()) {
          //   const r1 = sentiment(messageText);
          //   if (r1) {
          //     return fire.addSugarToFirebase(userId, date, timestamp)
          //   }
          //   else {
          //     return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/food").remove()
          //     .then(function() {
          //       return utils.otherOptions(false)
          //     })
          //   }
          // }
          // else if (manual) {
          //   const r1 = sentiment(messageText);
          //   if (r1) {
          //   }
          //   else {

          //   }
          // }
          else {
            return firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data").remove()
            .then(function() {
              return nutrition.getNutritionix(messageText, userId, timezone, false)
            })
          }
          // return [
          //   new fbTemplate
          //   .Image('http://i.imgur.com/uhHyYvP.gif')
          //   .get(),
          //   nutrition.getNutritionix(messageText, userId, timezone)
          // ]
        }
      }
    }
    else if ((upcFlag || cvFlag) && messageAttachments) {
      const {url} = messageAttachments[0].payload
      return image.processLabelImage(url, userId, upcFlag, cvFlag)
    }
  })
}
