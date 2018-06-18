const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class ConvertProtoFilesPlugin {
	constructor(options) {
		if (!this.isObject(options)) {
			throw new Error('options should be object');
		}
		this.destFolder = options.destFolder;
		this.protoFileName = options.protoFileName;
		this.toAppend = options.toAppend;
		this.toPrepend = options.toPrepend;
		this.jsFileName = options.jsFileName;
		this.tsFileName = options.tsFileName
	}

	isObject(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]' ? true : false;
	}

	apply(compiler) {
		compiler.hooks.afterEmit.tap('convert', (compilation, callback) => {
			if (!this.destFolder || !this.protoFileName) {
				throw new Error('destination Folder or Output File name not defined in options'); ;
			}
			if (fs.existsSync(this.destFolder + this.protoFileName)) {
				fs.unlink(this.destFolder + this.protoFileName, () => {
				});
			}
			fs.readdir(this.destFolder, (err, data) => {
				if (err) return err;
				data.forEach(file => {
					let fileImport = this.toAppend + file + this.toPrepend;
					fs.appendFile(this.destFolder + this.protoFileName, fileImport, err => {
						if (err) return err
					});
				});

				var pbjs_cmd = path.resolve('node_modules/protobufjs/bin/pbjs');
				var js = spawn('node', [pbjs_cmd, path.normalize(this.destFolder + 'proto-yams.proto'), '--keep-case', '--force-message', '-t', "static-module", '--no-verify', '--no-convert', '--no-delimited', '-o', path.normalize(this.destFolder + this.jsFileName)]);
				js.stderr.on('data', (data) => { console.log(data.toString()) })

				var pbts_cmd = path.resolve('node_modules/protobufjs/bin/pbts');
				var ts = exec('node ' + pbjs_cmd + ' -t static-module ' + path.normalize(this.destFolder + 'proto-yams.proto') + ' --keep-case --force-message --no-verify --no-convert --no-delimited | node ' + pbts_cmd + ' -o ' + path.normalize(this.destFolder + this.tsFileName) + ' -');
				ts.stderr.on('data', (data) => { console.log(data.toString()) })

			});
		});
	}
}

module.exports = ConvertProtoFilesPlugin;
