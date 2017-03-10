var http = require('http')
var AWS = require('aws-sdk')
var s3 = new AWS.S3()

function getJson(){

  var request = http.get("http://date.jsontest.com/", function(response){

    let rawData = ''
    response.on('data', (chunk) => rawData += chunk)
    response.on('end', () => {
      var parsedData = JSON.parse(rawData)
    })

  })

}

function uploadToS3(){

  var myBucket = 'export-control-prod';

  var bucketName = 'export-control-prod'
  var keyName = 'hello_world.txt'

  s3.createBucket({Bucket: bucketName}, function() {
    var params = {Bucket: bucketName, Key: keyName, Body: 'Hello World!'};
    s3.putObject(params, function(err, data) {
      if (err)
        console.log(err)
      else
        console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
    });
  });

}

getJson()
uploadToS3()
