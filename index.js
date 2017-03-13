var AWS = require('aws-sdk')
var fetch = require('node-fetch')
var co = require('co')
var s3 = new AWS.S3()
var baseUrl = "https://api.trade.gov/v2/consolidated_screening_list/search?api_key=hjuIpTBn7qlIO3_8mMRL_0gS&offset="

function uploadToS3(keyName, body){

  var bucketName = 'export-control-prod'

  s3.createBucket({Bucket: bucketName}, function() {
    var params = {Bucket: bucketName, Key: keyName, Body: body}
    s3.putObject(params, function(err, data) {
      if (err){
        console.log(err)
      }
      else {
        console.log(`Successfully uploaded data to ${bucketName}/${keyName}`)
      }
    });
  });
}

function getCurrentDate(){
  var today = new Date()
  var dd = today.getDate()
  var mm = today.getMonth()+1 //January is 0!

  var yyyy = today.getFullYear()
  if(dd<10){
    dd='0'+dd
  }
  if(mm<10){
    mm='0'+mm
  }

  return `${mm}-${dd}-${yyyy}`
}

function getJson(payload, context) {
  co(function *() {
    var firstPage = yield fetch(`${baseUrl}${0}`)
    var firstJsonPage = yield firstPage.json()
    var totalPages = firstJsonPage.total
    var json = ''

    for(var i = 0; i <= 9 ; i += 10){
      var response = yield fetch(`${baseUrl}${i}`)
      var jsonPage = yield response.json()
      var results = jsonPage.results

      var jsonResults = JSON.stringify(results)
      jsonResults = jsonResults.replace(/]$/, "")
      jsonResults = jsonResults.replace(/^\[/,"")
      json += `${jsonResults},`
    }

    json = json.replace(/,\s*$/, "")
    var currentDate = getCurrentDate()
    uploadToS3(`${currentDate}.json`, json)
    context.succeed("End of function")
  })
}

exports.handler = getJson
