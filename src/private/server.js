var express = require('express'),
    app = express();

//html directory
app.use(express.static(__dirname + "/../public"));

app.listen(3000);
console.log("server started on port 3000");
