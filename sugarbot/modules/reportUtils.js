exports.writeReportToS3 = function(date, userId, snapshot) {
  const S3 = require('aws-sdk').S3
  const s3 = new S3({
    accessKeyId:     'AKIAI25XHNISG4KDDM3Q',
    secretAccessKey: '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',
    region: 'us-west-2',
  })
  const sugarIntake = snapshot.child('/sugarIntake/' + date).val()
  // AC TODO: use mustache here to template in our list
  const msgrExtensionsScript =
    '<script>(function(d, s, id){var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) {return;}js = d.createElement(s); js.id = id;js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";fjs.parentNode.insertBefore(js, fjs);}(document, \'script\', \'Messenger\'));</script>'
  const reportHtml = '<!DOCTYPE html><html><head><title>Hello World!</title></head><body>'
    + msgrExtensionsScript + '<h1>Hello World!</h1></body></html>'
  const params = {
    Bucket: 'www.inphood.com',
    // Key: 'reports/' + userId + '/' + date + '.html',
    Key: 'reports/' + userId + '.html',
    Body: reportHtml,
    ContentType: 'text/html',
    ACL: 'public-read'
  }
  console.log('BEFORE s3.upload(...).promise:')
  const s3promise = s3.upload(params).promise()
  return s3promise
  .then(info => {
    console.log('AFTER s3.upload(...).promise:')
    console.log('info: ' + info)
    const dataUrl = 'https://d1q0ddz2y0icfw.cloudfront.net/reports/' + userId + '/' + date + '.html'
    // const dataUrl = 'https://www.inphood.com/reports/' + userId + '/' + date + '.html'
    return dataUrl
  })
  .catch(error => console.log(error));
}
