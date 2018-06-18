const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class ConvertProtoFilesPlugin {
	constructor(options) {
		if (!this.isObject(options)) {
			throw new Error('options should be object');
		}
		this.options = options;
	}

	isObject(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]' ? true : false;
	}

	apply(compiler) {
		
		compiler.hooks.afterEmit.tap('convert', (compilation, callback) => {
			if (!this.options.destFolder || !this.options.protoFileName) {
				throw new Error('destination Folder or Output File name not defined in options'); ;
			}
			if (fs.existsSync(this.options.destFolder + this.options.protoFileName)) {
				fs.unlink(this.options.destFolder + this.options.protoFileName, () => {
				});
			}
			fs.readdir(this.options.destFolder, (err, data) => {
				if (err) return err;
				data.forEach(file => {
					let fileImport = this.options.toAppend + file + this.options.toPrepend;
					fs.appendFile(this.options.destFolder + this.options.protoFileName, fileImport, err => {
						if (err) return err
					});
				});

				var pbjs_cmd = path.resolve('node_modules/protobufjs/bin/pbjs');
				var js = spawn('node', [pbjs_cmd, path.normalize(this.options.destFolder + 'proto-yams.proto'), '--keep-case', '--force-message', '-t', "static-module", '--no-verify', '--no-convert', '--no-delimited', '-o', path.normalize(this.options.destFolder + this.options.jsFileName)]);
				js.stderr.on('data', (data) => { return data.toString() });

				var pbts_cmd = path.resolve('node_modules/protobufjs/bin/pbts');
				var ts = exec('node ' + pbjs_cmd + ' -t static-module ' + path.normalize(this.options.destFolder + 'proto-yams.proto') + ' --keep-case --force-message --no-verify --no-convert --no-delimited | node ' + pbts_cmd + ' -o ' + path.normalize(this.options.destFolder + this.options.tsFileName) + ' -');
				ts.stderr.on('data', (data) => { return data.toString() });

			});
		});
	}
}

module.exports = ConvertProtoFilesPlugin;
