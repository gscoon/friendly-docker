var nativeExec      = require('child_process').exec;
var nativeExecFile  = require('child_process').execFileSync;

module.exports = {
    waitasec        : waitasec,
    shellExec       : shellExec,
    shellExecFile   : shellExecFile,
    parsePS         : parsePS,
}

function shellExec(cmd){
    return new Promise((resolve, reject)=>{
        nativeExec(cmd, {
            stdio: [0,1,2]
        }, (err, stdout, stderr)=>{
            if(err)
                return reject(err);

            if(stdout)
                return resolve(stdout);

            if(stderr)
                return resolve(stderr);
        });
    })
}

function shellExecFile(cmd, options){
    return new Promise((resolve, reject)=>{
        var ouput = nativeExecFile(cmd, options, {stdio: 'inherit'});
        resolve(ouput);
    })
}

function waitasec(t){
    return new Promise((resolve, reject)=>{
        t = t || 1;
        t = t * 1000;
        setTimeout(()=>{resolve();}, t)
    })
}

function parsePS(output) {
	if (!output) {
		return [];
	}

	var lines = output.trim().split("\n");

	if (lines.length < 2) {
		return [];
	}

	var headers = {}, start = 0;
	lines[0].replace(/([A-Z\s]+?)($|\s{2,})/g, function (all, name, space, index) {
		headers[name] = {
			start: index,
			end: index + all.length
		};

		// check if this header is at the end of the line
		if (space.length === 0) {
			headers[name].end = undefined;
		}
		return name + " ";
	});

	var entries = [];
	for (var i = 1; i < lines.length; i++) {
		var entry = {};
		for (var key in headers) {
			if (headers.hasOwnProperty(key)) {
				entry[key] = lines[i].substring(headers[key].start, headers[key].end).trim();
			}
		}
		entries.push(entry);
	}

	return entries;
}
