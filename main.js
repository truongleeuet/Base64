var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var fs = require('fs');
var path = require('path');
var server = require('http').createServer(app);
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var admZip = require('adm-zip');
var flatten = require('./node_modules/adobe-edge-animate-image-flatten/index.js');
var glob = require('glob');
var globule = require('globule');

//console.log(flatten);
app.use(bodyParser.urlencoded({
    extended: true
}));

// Th? m?c ch?a ?nh upload tr�n server
app.use('/pictures', express.static(__dirname + '/upload/'));
//console.log(__dirname + '\\upload');
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// L?ng nghe khi c� requrest POST
app.post('/upload', multipartMiddleware, function (req, res, next) {

    var file = req.files.file;
    //console.log(file);
    // T�n file
    var originalFilename = file.name;
    // console.log(originalFilename);
    // File type
    var fileType = file.type.split('/')[1];

    // File size
    var fileSize = file.size;

    // ???ng d?n l?u ?nh
    var pathUpload = __dirname + '/upload/' + originalFilename;

    // ??c n?i dung file tmp
    // n?u kh�ng c� l?i th� ghi file v�o ? c?ng
    fs.readFile(file.path, function (err, data) {
        if (!err) {
            fs.writeFile(pathUpload, data, function () {

                // Return anh vua upload
                //res.send('<img src="/pictures/' + originalFilename +'" />');
                res.send('Upload Sucessfull');
                return;
            });
        } else {
            res.send('Upload Failed');
        }
    });

    var zip = new admZip(file.path);
    console.log(file.path);
    //console.log(zip);
    zip.extractAllTo("./upload/", true);
    console.log(__dirname);
    var jsFile = globule.find("./upload/publish/web/*.js");
    //glob("./upload/publish/web/*.js", function (er, files) {
    //    // files is an array of filenames.
    //    // If the `nonull` option is set, and nothing
    //    // was found, then files is ["**/*.js"]
    //    // er is an error object or null.
    //    console.log(files[0] + "------------");
    //    jsFile = files[0];
    //})
    ////console.log(test);
    console.log(jsFile[0]);
    console.log(typeof jsFile[0]);
    console.log(__dirname + '' + jsFile[0]);
    fs.createReadStream(path.resolve(__dirname, '' + jsFile[0]))

        //flatten task
        .pipe(flatten({imageDirectory: path.resolve(__dirname, './upload/publish/web/images')}))

        .on('data', function (data) {

            //console.log("Tests:");

            //console.log('Image directory should be the base64 image string: ' + (data.indexOf("var im='data:image/svg+xml;base64,';") !== -1 ? "pass" : "fail"));

            // console.log('There should be no .svg strings: ' + (data.indexOf(".svg") === -1 ? "pass" : "fail"));
            //console.log(data);
            fs.writeFileSync(path.resolve(__dirname, '' + jsFile[0]), data);
            console.log("Finish");
        })

        .on('end', function () {

            console.log("Done");

        });
    var ziper = new admZip();
    console.log(("/upload/publish"));
   // ziper.addLocalFolder( path.resolve("./upload/publish/"));
    ziper.addLocalFile("./upload/publish/web/Budweiser_980x250.html");
    ziper.addLocalFile("./upload/publish/web/Budweiser_980x250_edge.js");
    ziper.addLocalFile("./upload/publish/web/Budweiser_980x250_edgeActions.js");
    ziper.addLocalFile("./upload/publish/web/Budweiser_980x250_edgePreload.js");

    var willSendthis = ziper.toBuffer();
    ziper.writeZip("./download/publish.zip");
});

server.listen(6789);
console.log('Server runing port 6789');