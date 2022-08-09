const express = require('express')
const bodyParser = require('body-parser')
const app = express();
var cors = require('cors');
const api = require("./router/apiRouter")
const mongoose = require('mongoose')


//Static files
app.use(bodyParser.urlencoded({limit:'50mb',extended: false }))
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', api);
app.use('/upload', express.static('upload'))


//****************** */ connection with database *******************************//
mongoose.connect("mongodb+srv://bhartiInfograin:Bharti1729@bharti.jsgcg.mongodb.net/DIY?retryWrites=true&w=majority",{
    useUnifiedTopology:true,
    useNewUrlParser: true
})
.then(() => {
    console.log("Connected to the Database  successfully");

}).catch((err) => {
    console.log(err);
})




//****************create server*************************
app.listen(2000, (error) => {
    if (error) {
        console.log("error", error)
    } else {
        console.log("server in running on 2000");
    }
})




//******************************* live server******************************************
// const https = require('https');
// const fs = require('fs');

// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/www.mycreditsensei.com/privkey.pem','utf8'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/www.mycreditsensei.com/cert.pem','utf8')
// };

// var httpsServer = https.createServer(options, app);
// httpsServer.listen(5000, (error) => {
//     if (error) {
//         console.log("error", error)
//     } else {
//         console.log("server in running on 2000");
//     }
// })



