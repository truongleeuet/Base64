ZipZipTop is a nodejs modules which relies on from [jszip](http://stuk.github.io/jszip/). It allows to simply add files & recursive folder in a zip.

## Installation
    $ npm install zip-zip-top

## Examples
```js
var ZipZipTop = require("zip-zip-top");

var zip = new ZipZipTop();
//add text
zip.file("hello.txt","Hello World！");
zip.writeToFile("text.zip");//write zip data to disk

//add folder
var zip2 = new ZipZipTop();
var jsFolder = zip2.folder("js");
jsFolder.file("hello.js","alert("hello world")");
zip2.writeToFile("folder.zip");

//add file
var zip3 = new ZipZipTop();
zip3.addFile("main.js","easyzip.js",function(err){
	if(err) {
		console.log(err);
	}
	zip3.writeToFile("file.zip");
});

//zip a folder
var zip4 = new ZipZipTop();
zip4.zipFolder("../myfolder",function(err){
	if(err) {
		console.log(err);
	}
	zip4.writeToFile("folder.zip", function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("Done");
	});
});

//zip a folder and change folder destination name
var zip6 = new EasyZip();
zip6.zipFolder("../myfolder",function(){
if(err) {
		console.log(err);
	}
	zip6.writeToFile("myfolder.zip", function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("Done");
	});
}, {rootFolder: "newRootFolder"});


//write to file sync
//zip.writeToFileSync(filePath);
```
## License
MIT
