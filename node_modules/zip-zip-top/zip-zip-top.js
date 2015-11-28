var util = require("util"),
	async = require("async"),
	path = require("path"),
	fs = require("fs"),
	JSZip = require("jszip");

/**
 * Creates an ZipZipTop object, the representation of a zip file
 * @constructor
 */
function ZipZipTop() {
	JSZip.call(this);
}

util.inherits(ZipZipTop, JSZip);

/**
 * Adds the given file to this zip
 * @param{String} filePath relative path to the file to add.
 * @param {Function} callback takes error & EasZyp object as parameter.
 * @param {Object} options options passed to jszip. base64 & binary field will be overriden.
 */
ZipZipTop.prototype.addFile = function (filePath, callback, options) {
	var self = this;

	options = options || {};
	options.base64 = false;
	options.binary = true;

	fs.readFile(path.resolve(filePath), function(err, data) {
		if (err) {
			callback(err, self);
		}

		var root = options.rootFolder || "/";
		delete options.rootFolder;

		self.file(path.join(root, path.basename(filePath)), data, options);
		callback(null, self);
	});
};
ZipZipTop.prototype.zipFile = ZipZipTop.prototype.addFile;

/**
 * Recursively Zip a folder
 * @param {String} folder rootFolder name to add
 * @param {function} callback takes err, ZipZipTop as arguments
 * @param {Object} options passed to jszip. noSymLinks field
 */
ZipZipTop.prototype.addFolder = function (folder, callback, options) {
	if (!fs.existsSync(path.resolve(folder)) || !fs.statSync(folder).isDirectory()) {
		callback(new Error(util.format("Given '%s' doesn't exist or is not a directory.", folder), this));
	} else {
		var self = this;

		options = options || {};
		options.rootFolder = options.rootFolder || path.basename(folder);

		fs.readdir(folder, function(err, files) {
			if(err) {
				return callback(err, self);
			}
			async.each(files, function(item, done) {
				var subPath = path.resolve(folder, item),
					newOptions = JSON.parse(JSON.stringify(options));

				fs.stat(subPath, function(err, stats) {
					if(err) {
						return done(err);
					}
					if(!stats.isSymbolicLink() || !options.noSymLinks) {
						if (stats.isDirectory()) {
							newOptions.rootFolder = path.join(options.rootFolder, item);
							self.addFolder(subPath, done, newOptions);
						} else if (stats.isFile()) {
							self.addFile(subPath, done, newOptions);
						}
					}
				});
			}, function(err) {
				if(err) {
					return callback(err, self);
				}
				callback(null, self);
			});
		});
	}
};
ZipZipTop.prototype.zipFolder = ZipZipTop.prototype.addFolder;

/**
 * Writes the current object to the given filePath
 * @param filePath path to the file to write
 * @param callback passed to fs.writeFile
 */
ZipZipTop.prototype.writeToFile = function (filePath, callback) {
	var data = this.generate({type:"nodebuffer", compression: "DEFLATE"});
	fs.writeFile(filePath, data, 'binary', callback);
};

/**
 * Same at @see{writeToFile}
 * @param filePath path to the file to write
 */
ZipZipTop.prototype.writeToFileSync = function (filePath) {
	var data = this.generate({type:"nodebuffer", compression: "DEFLATE"});
	fs.writeFileSync(filePath, data, 'binary');
};

ZipZipTop.prototype.clone = function () {
	var newObj = new ZipZipTop();
	for (var i in this) {
		if (typeof this[i] !== "function") {
			newObj[i] = this[i];
		}
	}
	return newObj;
};

module.exports = ZipZipTop;