const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;
const utils = require('./utils.js')
const fire = require('./firebaseUtils.js')
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

exports.getWolfram = function(messageText, userId) {
  const url = 'http://api.wolframalpha.com/v1/result?appid=WX84WV-R3THG2XT6L&i=' + encodeURI(messageText)
  const request = require('request-promise')
  let wolfOptions = {
    uri: url,
    method: 'GET',
    resolveWithFullResponse: true
  }
  return request(wolfOptions)
  .then(result => {
    let text = result.body
    var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/")
    return tempRef.child('question').update({
      answer: text,
      text: messageText,
      flag: false
    })
    .then(() => {
      return tempRef.child('food').update({
        sugar: parseInt(text),
        foodName: messageText
      })
      .then(() => {
        return [
          text,
          fire.trackSugar()
        ]
      })
    })
    .catch((error) => {
      console.log('Error here....', error)
    })
  })
  .catch(error => {
    return "Hmm....can you please re-phrase your question (ex: 'how much sugar in a apple?')"
  })
}

exports.detailedWolfram = function(userId) {
  var tempRef = firebase.database().ref("/global/sugarinfoai/" + userId + "/temp/data/")
  return tempRef.once("value")
  .then(function(snapshot) {
    var messageText = snapshot.child('question/text').val()
    const url = 'http://api.wolframalpha.com/v1/simple?appid=WX84WV-R3THG2XT6L&i=' + encodeURI(messageText)
    const request = require('request-promise')
    let wolfOptions = {
      encoding: 'base64',
      uri: url,
      method: 'GET',
      resolveWithFullResponse: true
    }
    return request(wolfOptions)
    .then(result => {
      let imgSrc = new Buffer(result.body,'base64')
      const S3 = require('aws-sdk').S3
      const s3 = new S3({
        accessKeyId:     'AKIAI25XHNISG4KDDM3Q',
        secretAccessKey: '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',
        region: 'us-west-2',
      })
      const key = Date.now()
      const params = {
        Bucket: 'inphoodlabelimagescdn',
        Key: 'chatbot/' + key +  '.gif',
        Body: imgSrc,
        ContentEncoding: 'base64',
        ContentType: 'image/gif',
        ACL: 'public-read'
      }
      const s3promise = s3.upload(params).promise()
      return s3promise
      .then(info => {
        const dataUrl = 'https://doowizp5r3uvo.cloudfront.net/chatbot/' + key + '.gif'
        // console.log('Here is the data url: ', dataUrl)
        return [
          "Bam!",
          new fbTemplate
          .Image(dataUrl)
          .get(),
          utils.otherOptions(false)
        ]
      })
      .catch(error => console.log(error));
    })
  })
}