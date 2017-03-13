const AWS = require('aws-sdk')
const fetch = require('node-fetch')
const co = require('co')
const s3 = new AWS.S3()
const baseUrl = "https://api.trade.gov/v2/consolidated_screening_list/search?api_key=hjuIpTBn7qlIO3_8mMRL_0gS&offset="

function uploadToS3(keyName, body){

  let bucketName = 'export-control-prod'

  s3.createBucket({Bucket: bucketName}, function() {
    let params = {Bucket: bucketName, Key: keyName, Body: body};
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
    let response = yield fetch(`${baseUrl}${i}`)
    let jsonPage = yield response.json()
    let results = jsonPage.results

    let jsonResults = JSON.stringify(results)
    jsonResults = jsonResults.replace(/]$/, "")
    jsonResults = jsonResults.replace(/^\[/,"")
    json += `${jsonResults},`
  }

  json = json.replace(/,\s*$/, "");

  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth()+1; //January is 0!

  let yyyy = today.getFullYear();
  if(dd<10){
    dd='0'+dd;
  }
  if(mm<10){
    mm='0'+mm;
  }

  let currentDate = `${mm}-${dd}-${yyyy}`
  uploadToS3(`${currentDate}.json`, json)
})
