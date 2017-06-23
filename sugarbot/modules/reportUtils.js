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
  let newSugarConsumptionReport = ''
  if (!hasData) {
    sugarConsumptionReport += '<p>You have not added any foods to your journal today.</p>'
    newSugarConsumptionReport += '<p>You have not added any foods to your journal today.</p>'
  } else {
    sugarConsumptionReport += '<ol>'
    newSugarConsumptionReport += '<ul class="list-group">'

    const todoSugar = '?'
    const todoImg = '<img src="./img200x200.svg" class="media-object" alt="Sample Image" width="64" height="64">'
    const sugarConsumptionToday = snapshot.child('sugarIntake/' + date).val()
    for (let key in sugarConsumptionToday) {
      if (key === 'dailyTotal') {
        continue
      }
      sugarConsumptionReport += '<li>' + sugarConsumptionToday[key].foodName + '</li>'

      newSugarConsumptionReport += ' \
        <li class="list-group-item justify-content-between"> \
          <div class="media"> \
            <div class="media-body"> \
              <h5 class="media-heading">' + sugarConsumptionToday[key].foodName + '</h5> \
              <small>(' + todoSugar + 'g sugar)</small> \
            </div> \
            <div class="media-right"> \
              ' + todoImg + ' \
            </div> \
          </div> \
        </li>'
    }

    sugarConsumptionReport += '</ol>'
    sugarConsumptionReport += '<p>Total Sugar ' + sugarConsumptionToday['dailyTotal'].sugar + ' grams</p>'

    newSugarConsumptionReport += ' \
      <li class="list-group-item justify-content-between"> \
      </li> \
  \
      <li class="list-group-item active justify-content-between"> \
        <div class="media"> \
          <div class="media-left"> \
            <h4 class="media-heading">Total</h4> \
          </div> \
          <div class="media-body text-right"> \
            ' + sugarConsumptionToday['dailyTotal'].sugar + ' grams sugar \
          </div> \
        </div> \
      </li>'
    newSugarConsumptionReport += '</ul>'
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

  const newReportHtml = ' \
  <!DOCTYPE html> \
  <html lang="en"> \
    <head> \
      <meta charset="utf-8"> \
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> \
      <meta name="viewport" content="width=device-width, initial-scale=1"> \
      <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags --> \
   \
      <title>Sugar Report</title> \
   \
      <!-- Bootstrap --> \
      <link href="../../lib/bootstrap/css/bootstrap.min.css" rel="stylesheet"> \
      <!-- jQuery (necessary for Bootstrap\'s JavaScript plugins) --> \
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script> \
      <!-- Include all compiled plugins (below), or include individual files as needed --> \
      <script src="../../lib/bootstrap/js/bootstrap.min.js"></script> \
   \
      <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries --> \
      <!-- WARNING: Respond.js doesn\'t work if you view the page via file:// --> \
      <!--[if lt IE 9]> \
        <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script> \
        <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script> \
      <![endif]--> \
    </head> \
    <body>' +
      msgrExtensionsScript + ' \
      <div> \
        <h4 class="text-center">' + date + '</h4> \
   \
        ' + newSugarConsumptionReport + ' \
      </div> \
    </body> \
  </html> '

  const now = new Date(Date.now())
  const datum = new Date(now.getFullYear(), now.getMonth(), 0, 0, 0, 0)
  const offset = Date.now() - datum.getTime()

  const params = {
    Bucket: 'www.inphood.com',
    Key: 'reports/' + userId + '/' + offset + '.html',
    // Key: 'reports/' + userId + '.html',
    Body: newReportHtml,
    ContentType: 'text/html',
    ACL: 'public-read'
  }

  const s3promise = s3.upload(params).promise()
  return s3promise
  .then(info => {
    const dataUrl = 'https://' + params.Bucket + '/' + params.Key
    // const dataUrl = 'https://' + params.Bucket + '/' + 'reports/test/reportBootstrapImg.html'
    return dataUrl
  })
  .catch(error => console.log(error));
}
