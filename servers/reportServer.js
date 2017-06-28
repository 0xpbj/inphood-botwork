const express = require('express')
const app = express()
const schedule = require('node-schedule')
const requestPromise = require('request-promise')

const constants = require('../sugarbot/modules/constants.js')

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

function processReportRequests(snapshot) {
  if (!snapshot.exists()) {
    return
  }

  const reportRequests = snapshot.val()

  console.log('reportRequests: ' + reportRequests)
  for (let userId in reportRequests) {
    console.log(userId + ' requests a ' + reportRequests[userId] + ' report')
  }
}

app.listen(3010, function () {
  console.log('App listening on port 3010!')

  console.log('Signing into firebase anonymously:')
  return firebase.auth().signInAnonymously()
  .then(() => {
    const dbSugarInfo = firebase.database().ref('/global/sugarinfoai')
    const dbReportQueue = dbSugarInfo.child('report_queue')

    // TODO: maybe this ought to be once instead of on? (Not clear to me if
    //       this is getting called repeatedly)
    dbReportQueue.on('value', processReportRequests);
  })
})
