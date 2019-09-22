const express = require('express');
const path = require('path');
const Routes = require('./route');
const httpProxy = require('http-proxy');

const app = express();

httpProxy.createProxyServer({target:'http://localhost:2000'}).listen(8000);

app.use(express.static(path.join(__dirname, "../build")));

app.get('/', function (req, res){
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'))
})

for(Route_path of Routes.routes) {
    app.get('/' + Route_path, function (req, res){
        res.sendFile(path.resolve(__dirname, '../build', 'index.html'))
    })
}

app.get('*', function (req, res){
    res.send("404");
})


app.listen(2000, "127.0.0.1", () => {
    console.log("Server On");
    console.log(Routes);
})