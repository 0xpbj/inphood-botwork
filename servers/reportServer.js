const express = require('express')
const app = express()
const schedule = require('node-schedule')
const requestPromise = require('request-promise')

const constants = require('../sugarbot/modules/constants.js')
const timeUtils = require('../sugarbot/modules/timeUtils.js')
const dailyReportUtils = require('./reportUtils.js')

// Setting this up as standard firebase client:
//   - https://firebase.google.com/docs/web/setup
// Though it may make more sense to set it up as admin/priviledged environment:
//   - https://firebase.google.com/docs/admin/setup
//
var firebase = require('firebase')
if (firebase.apps.length === 0) {
  console.log('InitializingApp on firebase with config')
  firebase.initializeApp(constants.fbConfig)
}

// TODO: refactor the send message code from both servers and use it here and
//       in notificationServer

// app.get('/', function (req, res) {
//   res.send('Hello World!')
// })
function getReportWebView(userId, firstName, date, link) {
  return {
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
                "subtitle":firstName + "'s sugar consumption for " + date,
                "default_action": {
                  "url": link,
                  "type": "web_url",
                  "messenger_extensions": true,
                  "webview_height_ratio": "tall",
                  "fallback_url": "https://www.inphood.com/"
                },
                "buttons":[
                  {
                    "url":link,
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
}

function processReportRequest(requestSnapshot) {
  if (requestSnapshot.exists()) {

    const request = requestSnapshot.val()
    if (request.reportType || request.userId) {
      console.log(request.userId + ' requested a ' +
                  request.reportType + ' report at ' + request.userTimeStamp)

      const dbUserId = firebase.database().ref("/global/sugarinfoai/" + request.userId)
      return dbUserId.once('value')
      .then(function(userSnapshot) {
        const userTimeZone = userSnapshot.child('/profile/timezone').val()
        const firstName = userSnapshot.child('/profile/first_name').val()
        const date = timeUtils.getUserDateString(request.userTimeStamp, userTimeZone)

        return dailyReportUtils.writeReportToS3(date, request.userId, userSnapshot)
        .then(result => {
          return requestPromise(
            getReportWebView(request.userId, firstName, date, result))
        })
      })
    }
  }
}

app.listen(3010, function () {

  return firebase.auth().signInAnonymously()
  .then(() => {
    const dbSugarInfo = firebase.database().ref('/global/sugarinfoai')
    const dbReportQueue = dbSugarInfo.child('reportQueue')

    return dbReportQueue.on('child_added', function(childSnapshot, prevChildKey) {
      processReportRequest(childSnapshot)
      return
    })
  })
})
