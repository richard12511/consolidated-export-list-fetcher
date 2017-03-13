var https = require('https')
var AWS = require('aws-sdk')
var fetch = require('node-fetch')
var co = require('co')
var s3 = new AWS.S3()
var baseUrl = "https://api.trade.gov/v2/consolidated_screening_list/search?api_key=hjuIpTBn7qlIO3_8mMRL_0gS&offset="

function uploadToS3(keyName, body){

  var bucketName = 'export-control-prod'

  s3.createBucket({Bucket: bucketName}, function() {
    var params = {Bucket: bucketName, Key: keyName, Body: body};
    s3.putObject(params, function(err, data) {
      if (err)
        console.log(err)
      else
        console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
    });
  });
}

co(function *() {
  const firstPage = yield fetch(`${baseUrl}${0}`)
  const firstJsonPage = yield firstPage.json()
  const totalPages = firstJsonPage.total
  let json = ''

  for(let i = 0; i <= 9 ; i += 10){
    let response = yield fetch(`${baseUrl}${0}`)
    let jsonPage = yield response.json()
    let results = jsonPage.results
    let jsonResults = JSON.stringify(results)
    jsonResults = jsonResults.replace(/]$/, "")
    jsonResults = jsonResults.replace(/^\[/,"")
    json += `${jsonResults},`
  }

  json = json.replace(/,\s*$/, "");
  console.log(json)
  uploadToS3('first-page.json', json)
})
