var http = require('http');

var userCount = 0;
http.createServer(function (request, response) {
  const url = 'https://scontent.xx.fbcdn.net/v/t35.0-12/18698867_10101426797702789_1922147756_o.jpg?_nc_ad=z-m&oh=3b267b8ba2bf0e1153905207eb24872b&oe=59277D50'
  var options = {
    uri: url,
    method: 'GET',
    gzip: true,
    headers: {Authorization: "Bearer 'EAAJhTtF5K30BAC2EC7KfySkyNJiJfqGW7ZCi4W1CJcmFuZBVLZCA0cZCkpkZCugYvNzVfugI6rji9ZAWqjJwEvJJlgEML8xj4nbIym7CdQTNoGT7y9LobncZCduDxYMzM5MXA02x9OMZCMyoeKSGxwqclT0c168AHf8CvMFlo2E5fAZDZD'"}
  };
  const Tesseract = require('tesseract.js')
  const rp = require('request-promise')
  const fs = require('fs')
  // var file = fs.createWriteStream("file.png");
  // return rp (options)
  // .then(response => {
  //   // body is the decompressed response body
  //   // const buffer = Buffer.from(response)
  //   console.log('Response received')
  //   response.pipe(file)
  //   return Tesseract.recognize(file)
  //   .then(result => {
  //     console.log('Result: ', result);
  //   });
  // })
  // .catch(err => {
  //   // API call failed...
  //   console.log('Error: ' + err)
  // });

  // var prequest = require('request')
  // prequest({ 
  //   method: 'GET',
  //   uri: url,
  //   gzip: true,
  //   headers: { 
  //     Authorization: "Bearer 'EAAJhTtF5K30BAC2EC7KfySkyNJiJfqGW7ZCi4W1CJcmFuZBVLZCA0cZCkpkZCugYvNzVfugI6rji9ZAWqjJwEvJJlgEML8xj4nbIym7CdQTNoGT7y9LobncZCduDxYMzM5MXA02x9OMZCMyoeKSGxwqclT0c168AHf8CvMFlo2E5fAZDZD'"
  //   }
  // },
  // function (error, response, body) {
  //   // body is the decompressed response body
  //   // console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
  //   console.log('Error: ', error)
  //   // console.log('Respo: ', response)
  //   // console.log('Body : ', body)
  //   console.log('the decoded data is')
  //   response.pipe(file)
  //   console.log('Tesseract starting')
  //   return Tesseract.recognize(file)
  //   .then(result => {
  //     console.log('Result: ', result);
  //   })
  //   .catch(err => {
  //     // API call failed...
  //     console.log('Error: ' + err)
  //   });
  // })
  var file = 'doodle.jpg'
  var prequest = require('request')
  var stream = prequest
  .get(options)
  .on('response', function(response) {
    console.log(response.statusCode)
    console.log(response.headers['content-type'])
  })
  .pipe(fs.createWriteStream(file))
  return stream.on('finish', () => {
    Tesseract.recognize(file)
    .then(result => {
      console.log('Result: ', result);
    })
    .catch(err => {
      // API call failed...
      console.log('Error: ' + err)
    })
  })
}).listen(8080);

console.log('Server started');
