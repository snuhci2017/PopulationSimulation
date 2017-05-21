var express = require('express');
var app = express();

var sassMiddleware = require('node-sass-middleware')

app.use('/style/css',
    sassMiddleware({
        src: __dirname + '/style/scss', //where the sass files are
        dest: __dirname + '/style/css', //where css should go
        debug: true // obvious
    })
);
app.use(express.static(__dirname));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});