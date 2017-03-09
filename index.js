var http = require('http')

function getJson(){

  var request = http.get("http://date.jsontest.com/", function(response){

    let rawData = ''
    response.on('data', (chunk) => rawData += chunk)
    response.on('end', () => {
      var parsedData = JSON.parse(rawData)
    })

  })

}

getJson()
