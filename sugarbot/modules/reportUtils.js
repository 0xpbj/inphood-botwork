exports.writeReportToS3 = function(date, userId, snapshot) {
  const S3 = require('aws-sdk').S3
  const s3 = new S3({
    accessKeyId:     'AKIAJQGBMJOHENSKGD4A',
    secretAccessKey: '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',
    region: 'us-west-2',
  })

  // Messenger Extensions script (required in html loaded in webview)
  //
  const msgrExtensionsScript = ' \
    <script> \
      (function(d, s, id) { \
        var js, fjs = d.getElementsByTagName(s)[0]; \
        if (d.getElementById(id)) { \
          return; \
        } \
        js = d.createElement(s); \
        js.id = id; \
        js.src = "//connect.facebook.com/en_US/messenger.Extensions.js"; \
        fjs.parentNode.insertBefore(js, fjs); \
      } (document, \'script\', \'Messenger\')); \
    </script>'

  // Create HTML for the reports we wish to see:
  // 1. (MVP) List of items for the day
  // 2. Pie-chart showing amount consumed vs. goal / remaining
  // 3. Progress on weight vs sugar Consumption
  //

  const sugarIntake = snapshot.child('/sugarIntake/' + date).val()

  const title = 'Sugar Info - ' + date
  const hasData = snapshot.exists() &&
                  snapshot.child('sugarIntake').exists() &&
                  snapshot.child('sugarIntake/' + date).exists()

  let sugarConsumptionReport = '<h1>Sugar Consumption Today</h1>'
  if (!hasData) {
    sugarConsumptionReport += '<p>You have not added any foods to your journal today.</p>'
  } else {
    sugarConsumptionReport += '<ol>'

    const sugarConsumptionToday = snapshot.child('sugarIntake/' + date).val()
    for (let key in sugarConsumptionToday) {
      if (key === 'dailyTotal') {
        continue
      }
      sugarConsumptionReport += '<li>' + sugarConsumptionToday[key].foodName + '</li>'
    }

    sugarConsumptionReport += '</ol>'
    sugarConsumptionReport += '<p>Total Sugar ' + sugarConsumptionToday['dailyTotal'].sugar + ' grams</p>'
  }

  const reportHtml = ' \
    <!DOCTYPE html> \
    <html> \
      <head> \
        <title>' + title + '</title> \
      </head> \
      <body>' +
        msgrExtensionsScript + ' \
        ' + sugarConsumptionReport + ' \
      </body> \
    </html>'

  const now = new Date(Date.now())
  const datum = new Date(now.getFullYear(), now.getMonth(), 0, 0, 0, 0)
  const offset = Date.now() - datum.getTime()

  const params = {
    Bucket: 'www.inphood.com',
    Key: 'reports/' + userId + '/' + offset + '.html',
    // Key: 'reports/' + userId + '.html',
    Body: reportHtml,
    ContentType: 'text/html',
    ACL: 'public-read'
  }

  const s3promise = s3.upload(params).promise()
  return s3promise
  .then(info => {
    // const dataUrl = 'https://' + params.Bucket + '/' + params.Key
    const dataUrl = 'https://' + params.Bucket + '/' + 'reports/test/reportBootstrap.html'
    return dataUrl
  })
  .catch(error => console.log(error));
}
