const botBuilder = require('claudia-bot-builder')
const machine = require('./modules/stateMachine.js')

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

module.exports = botBuilder(function (request, originalApiRequest) {
  // return 'hello world'
  if (request.type === 'facebook') {
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@', request)
    if (firebase.auth().currentUser) {
      return machine.bot(request)
    }
    return firebase.auth().signInAnonymously()
    .then(() => {
      return machine.bot(request)
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/operation-not-allowed') {
        throw 'You must enable Anonymous auth in the Firebase Console.'
      } else {
        console.log('Error happened: ', error);
      }
    })
  }
}, { platforms: ['facebook'] });
