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
  const title = 'Sugar Info - ' + date
  const hasData = snapshot.exists() &&
                  snapshot.child('sugarIntake').exists() &&
                  snapshot.child('sugarIntake/' + date).exists()

  const progBarHeight = '40px'

  console.log('writeReportToS3: hasData = ' + hasData)
  // Progress Bar Issues / TODOs:
  //  - when %age is low (i.e. < 5%, it may be hard to read the label amount)
  //  - when %age is over 100%, consider doing the multiple bars approach shown here:
  //      https://v4-alpha.getbootstrap.com/components/progress/
  //      - could show the 1st 100% as normal and then the next n% as danger colored
  //
  let sugarProgressBar = ''
  let sugarConsumptionReport = ''
  let percentSugarToday = 0

  if (!hasData) {
    sugarProgressBar += ' \
      <div class="progress-bar" role="progressbar" style="background: transparent; color: black; width: 100%; height: ' + progBarHeight + '; line-height: 40px;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"> \
        <h5 class="text-center" style="vertical-align: middle; display: inline-block;">0%</h5> \
      </div>'

    sugarConsumptionReport += '<p>You have not added any foods to your journal today.</p>'
  } else {
    const sugarConsumptionToday = snapshot.child('sugarIntake/' + date).val()
    const totalSugarToday = sugarConsumptionToday['dailyTotal'].sugar
    let sugarGoal = snapshot.child('preferences').exists() &&
                      snapshot.child('preferences/currentGoalSugar').exists() ?
                      snapshot.child('preferences/currentGoalSugar').val() : undefined

    if (sugarGoal === undefined) {
      console.log('ERROR: UNDEFINED SUGAR GOAL - DEFAULTING TO PBJ 40')
      sugarGoal = 40
    }

    const progBarColor = (totalSugarToday <= sugarGoal) ?
      'progress-bar-success' : 'progress-bar-danger'

    const progress = Math.round(100.0 * totalSugarToday / sugarGoal)
    percentSugarToday = progress
    const progBarAriaNow = progress.toString()
    const progBarWidth = progBarAriaNow + '%'
    if (progress < 1) {
      sugarProgressBar += ' \
        <div class="progress-bar" role="progressbar" style="background: transparent; color: black; width: 100%; height: ' + progBarHeight + '; line-height: ' + progBarHeight + ';" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"> \
          <h5 class="text-center" style="vertical-align: middle; display: inline-block;">0%</h5> \
        </div>'
    } else if (progress > 100) {
      const overage = Math.round(progress) - 100
      const mainWidth = Math.round(95 * (100 / Math.round(progress)))
      const overWidth = 95 - mainWidth + 1

      sugarProgressBar += ' \
        <div class="progress-bar progress-bar-success" role="progressbar" style="width: ' + mainWidth + '%; height: ' + progBarHeight + '; line-height: ' + progBarHeight + ';" aria-valuenow="' + mainWidth + '" aria-valuemin="0" aria-valuemax="100"> \
          <h5 class="text-center" style="vertical-align: middle; display: inline-block;">100%</h5> \
        </div> \
        <div class="progress-bar progress-bar-danger" role="progressbar" style="width: ' + overWidth + '%; height: ' + progBarHeight + '; line-height: ' + progBarHeight + ';" aria-valuenow="' + overWidth + '" aria-valuemin="0" aria-valuemax="100"> \
          <h5  class="text-center" style="vertical-align: middle; display: inline-block;">+' + overage + '%</h5> \
        </div>'
    } else {
      sugarProgressBar += ' \
        <div class="progress-bar ' + progBarColor + '" role="progressbar" style="width: ' + progBarWidth + '; height: ' + progBarHeight + '; line-height: ' + progBarHeight + ';" aria-valuenow="' + progBarAriaNow + '" aria-valuemin="0" aria-valuemax="100"> \
          <h5 class="text-center" style="vertical-align: middle; display: inline-block;">' + progBarWidth + '</h5> \
        </div>'
    }


    sugarConsumptionReport += '<ul class="list-group">'

    for (let key in sugarConsumptionToday) {
      if (key === 'dailyTotal') {
        continue
      }

      const sugar = sugarConsumptionToday[key].sugar
      const measure = (sugar > 1) ? 'grams' : 'gram'
      const sugarLine = (sugar !== null && sugar !== undefined) ?
        '<small>(' + sugar + ' ' + measure + ' sugars)</small>' : ''

      const imgSrc = sugarConsumptionToday[key].photo
      const imgHtml = (imgSrc) ?
        '<img src="' + imgSrc + '" class="media-object" alt="Sample Image" width="64" height="64">' :
        '<img src="../assets/blank.png" class="media-object" alt="Sample Image" width="64" height="64">'


      sugarConsumptionReport += ' \
        <li class="list-group-item justify-content-between"> \
          <div class="media"> \
            <div class="media-body"> \
              <h5 class="media-heading">' + sugarConsumptionToday[key].foodName + '</h5> \
              ' + sugarLine + ' \
            </div> \
            <div class="media-right"> \
              ' + imgHtml + ' \
            </div> \
          </div> \
        </li>'
    }


    sugarConsumptionReport += ' \
      <li class="list-group-item justify-content-between"> \
      </li> \
  \
      <li class="list-group-item active justify-content-between"> \
        <div class="media"> \
          <div class="media-left"> \
            <h4 class="media-heading">Total</h4> \
          </div> \
          <div class="media-body text-right"> \
            ' + totalSugarToday + ' grams sugar \
          </div> \
        </div> \
      </li>'
    sugarConsumptionReport += '</ul>'
  }


  let sugarHistoryChart = ''
  const hasChartData = snapshot.exists() &&
                       snapshot.child('sugarIntake').exists()

  if (hasChartData) {
    const sugarConsumptionHistory = snapshot.child('sugarIntake').val()

    sugarHistoryChart += '<ul>'
    for (let day in sugarConsumptionHistory) {
      sugarHistoryChart += '<li>' + day + '</li>'
    }
    sugarHistoryChart += '<ul>'
  }



  const sectionSpacer = '<div style="height: 10px;">&nbsp</div>'

  const reportHtml = ' \
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
      <div style="padding-right: 10px; padding-left: 10px;"> \
        <h3 class="text-center">' + date + '</h3> \
   \
        ' + sectionSpacer + ' \
        <h4 class="text-left">Sugar Today (' + percentSugarToday + '% of maximum)</h4> \
        <div class="progress" style="height: ' + progBarHeight + ';"> \
        ' + sugarProgressBar + ' \
        </div> \
   \
        ' + sectionSpacer + ' \
        <h4 class="text-left">Sugar Journal</h4> \
        ' + sugarConsumptionReport + ' \
   \
        ' + sectionSpacer + ' \
        <h4 class="text-left">Sugar History</h4> \
        ' + sugarHistoryChart + ' \
   \
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
    Body: reportHtml,
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
