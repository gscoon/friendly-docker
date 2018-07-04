const nativeExec        = require('child_process').exec;
const nativeExecFile    = require('child_process').execFileSync;
const async             = require('async');
const Path              = require('path');
const fs                = require('fs');
const yamljs            = require('yamljs');
const _                 = require('lodash');

var util = {
    waitasec            : waitasec,
    shellExec           : shellExec,
    shellExecFile       : shellExecFile,
    parsePS             : parsePS,
    getYAML             : getYAML,
    yaml                : null,
    eachSeries          : eachSeries,
    getContainerByService : getContainerByService,
};

module.exports = util;

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

            resolve();
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

function eachSeries(arr, func, breakOnError){
    return new Promise((resolve, reject)=>{
        var ret = [];
        async.eachOfSeries(arr, (item, index, _next)=>{
            function next(err, data){
                data = data || null;
                _next(err);
                ret.push(data);
            }

            var P = func(item, index);
            if(!P || !P.then)
                P = Promise.resolve(P);

            P.then((data)=>{
                next(null, data);
            })
            .catch((err)=>{
                console.log("loop error", err)
                if(breakOnError)
                    return next(err);

                return next();
            })
        }, (err)=>{
            if(err)
                return reject(err);

            resolve(ret);
        })
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

function getYAML(){
    var yamlPath = Path.join(process.cwd(), "docker-compose.yaml");

    if(!fs.existsSync(yamlPath))
        return Promise.reject("Missing YAML");

    // convert YAML file to JSON
    util.yaml = yamljs.load(yamlPath);
    return Promise.resolve(util.yaml);
}

function getContainerByService(service){
    if(util.yaml)
        var P = Promise.resolve(util.yaml);
    else
        var P = getYAML();

    return P.then(()=>{
        var allServices = util.yaml.services;

        if(!allServices || !allServices[service])
            return Promise.reject("Service not found: " +  service);

        return allServices[service]['container_name'] || service;
    })
}
