var http = require('http');

// function getData() {
//   // var quote;
//   // return new Promise(function(resolve, reject) {
//   //   request('http://ron-swanson-quotes.herokuapp.com/v2/quotes', function(error, response, body) {
//   //     quote = body;

//   //     resolve(quote);
//   //   });
//      // var prequest = require('request')
//   var data
//   return new Promise(function(resolve, reject) {
//     request({
//       method: 'GET',
//       uri: url,
//       gzip: true,
//       headers: {
//         Authorization: "Bearer 'EAAJhTtF5K30BAC2EC7KfySkyNJiJfqGW7ZCi4W1CJcmFuZBVLZCA0cZCkpkZCugYvNzVfugI6rji9ZAWqjJwEvJJlgEML8xj4nbIym7CdQTNoGT7y9LobncZCduDxYMzM5MXA02x9OMZCMyoeKSGxwqclT0c168AHf8CvMFlo2E5fAZDZD'"
//       }
//     },
//     function (error, response, body) {
//       data = body;
//       resolve(data)
//     })
//   });
// }

http.createServer(function (request, response) {
  const url = 'http://cdn1.medicalnewstoday.com/content/images/articles/271157-bananas.jpg'
  // const url = 'http://ucsdaim.org/wp-content/uploads/2010/04/nutritionfacts.jpg'
  var options = {
    encoding: 'binary',
    uri: url,
    method: 'GET',
    gzip: true,
    json: false,
    resolveWithFullResponse: true
    // headers: {Authorization: "Bearer 'EAAJhTtF5K30BAC2EC7KfySkyNJiJfqGW7ZCi4W1CJcmFuZBVLZCA0cZCkpkZCugYvNzVfugI6rji9ZAWqjJwEvJJlgEML8xj4nbIym7CdQTNoGT7y9LobncZCduDxYMzM5MXA02x9OMZCMyoeKSGxwqclT0c168AHf8CvMFlo2E5fAZDZD'"}
  };
  const Tesseract = require('tesseract.js')
  const rp = require('request-promise')
  const fs = require('fs')
  // var file = fs.createWriteStream("file.png");
  return rp (options)
  .then(response => {

    // body is the decompressed response body
    // const buffer = Buffer.from(response)
    // console.log('response.body ----------------------------------------------------')
    // console.log(response.body)
    console.log('jpeg from disk ------------------------------------------------------')
    var jpegFromDisk = fs.readFileSync('271157-bananas.jpg')
    console.log(jpegFromDisk)

    let encoding = 'binary'
    // let encodings = ['ascii', 'utf8', 'utf16le', 'ucs2', 'base64', 'latin1', 'binary', 'hex']
    // for (let encoding of encodings) {
      let imgBuffer = Buffer.from(response.body, encoding)
      let differenceCount = 0
      for (let i = 0; i < jpegFromDisk.length; i++) {
        if (jpegFromDisk[i] !== imgBuffer[i]) {
          differenceCount++
        }
      }
      // console.log('jpeg from url (encoding = ', encoding, ', diffs = ', differenceCount, ') -----------')
      console.log('jpeg from url (encoding = ', encoding, ', diffs = ', differenceCount, ') -----------')
      console.log(imgBuffer)
    // }

    // console.log('response.body ------------------------------------------------------------')
    // console.log(response.body.toString('hex'))
    // console.log('response.statusCode ----------------------------------------------------')
    // console.log(response.statusCode)
    // console.log('response.headers ----------------------------------------------------')
    // console.log(response.headers['content-type'])

    // console.log('buffer ----------------------------------------------------')
    // // let mimeBuf = new Buffer('image/jpeg')
    // let imgBuf = Buffer.from(response.body)
    // // let buffer = Buffer.concat([mimeBuf, imgBuf])
    // // console.log(buffer)
    // // Interestingly, the next line doesn't match the body as printed at all:
    // // console.log(imgBuf.toString())

    // console.log('ImageData ---------------------------------------------------')
    // var jpeg = require('jpeg-js')
    // console.log('   1 ...')
    // var rawImageData = jpeg.decode(Buffer.from(response.body))
    // console.log('   2 ...')
    // console.log(rawImageData)
    // console.log('   3 ...')


    console.log('Tesseract ---------------------------------------------------')
    return Tesseract.recognize(imgBuffer)
    .progress(message => console.log('TMessage: ', message))
    .catch(err => console.log('TErr: ', err))
    .then(result => {
      console.log('Result ----------------------------------------------------')
      console.log('Result: ', result);
    })
    .finally(resultOrError => console.log('TFinally: ', resultOrError));
  })
  .catch(err => {
    // API call failed...
    console.log('Error: ' + err)
  });

  // var prequest = require('request')
  // prequest({
  //   method: 'GET',
  //   uri: url,
  //   gzip: true,
  //   headers: {
  //     Authorization: "Bearer 'EAAJhTtF5K30BAC2EC7KfySkyNJiJfqGW7ZCi4W1CJcmFuZBVLZCA0cZCkpkZCugYvNzVfugI6rji9ZAWqjJwEvJJlgEML8xj4nbIym7CdQTNoGT7y9LobncZCduDxYMzM5MXA02x9OMZCMyoeKSGxwqclT0c168AHf8CvMFlo2E5fAZDZD'"
  //   }
  // },
  // function (error, response, body) {
  //   // body is the decompressed response body
  //   // console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
  //   console.log('Error: ', error)
  //   // console.log('Respo: ', response)
  //   // console.log('Body : ', body)
  //   console.log('the decoded data is')
  //   response.pipe(file)
  //   console.log('Tesseract starting')
  //   return Tesseract.recognize(file)
  //   .then(result => {
  //     console.log('Result: ', result);
  //   })
  //   .catch(err => {
  //     // API call failed...
  //     console.log('Error: ' + err)
  //   });
  // })

  // var file = 'doodle.jpg'
  // var prequest = require('request')
  // var stream = prequest
  // .get(options)
  // .on('response', function(response) {
  //   console.log(response.statusCode)
  //   console.log(response.headers['content-type'])
  // })
  // .pipe(fs.createWriteStream(file))
  // return stream.on('finish', () => {
  //   Tesseract.recognize(file)
  //   .then(result => {
  //     console.log('Result: ', result);
  //   })
  //   .catch(err => {
  //     // API call failed...
  //     console.log('Error: ' + err)
  //   })
  // })

  // var data = await getData();
  // return Tesseract.recognize(data)
  // .then(result => {
  //   console.log('Result: ', result);
  // });
  // .catch(err => {
  //   // API call failed...
  //   console.log('Error: ' + err)
  // });
}).listen(8080);

console.log('Server started');
