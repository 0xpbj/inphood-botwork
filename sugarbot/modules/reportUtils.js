exports.writeReportToS3 = function(date, userId, snapshot) {
  const S3 = require('aws-sdk').S3
  const s3 = new S3({
    accessKeyId:     'AKIAI25XHNISG4KDDM3Q',
    secretAccessKey: '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',
    region: 'us-west-2',
  })
  const sugarIntake = snapshot.child('/sugarIntake/' + date).val()
  const params = {
    Bucket: 'www.inphood.com',
    Key: 'reports/' + userId + '/' + date + '.html',
    Body: sugarIntake,
    ContentType: 'text/html',
    ACL: 'public-read'
  }
  const s3promise = s3.upload(params).promise()
  return s3promise
  .then(info => {
    const dataUrl = 'https://d1q0ddz2y0icfw.cloudfront.net/reports/' + userId + '/' + date + '.html'
    return dataUrl
  })
  .catch(error => console.log(error));
}