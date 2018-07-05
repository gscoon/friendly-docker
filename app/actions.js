const fs        = require('fs');
const Path      = require('path');
const shell     = require('shelljs');
const inquirer  = require('inquirer');
const _         = require('lodash');

var yaml        = null;

module.exports = {
    down    : downAction,
    ps      : psAction,
    enter   : inAction,
    up      : upAction,
    test    : testAction,
}

function downAction(args, cb){
    if(args.containers)
        return finish(args.containers);

    return promptServices()
    .then(finish)
    .catch(handleError);

    function finish(services){
        if(!services || !services.length)
            return Util.shellExec("docker-compose down");

        return Util.eachSeries(services, (svc)=>{
            var cmd = ["docker-compose stop", svc];

            return Util.shellExec(cmd.join(' '))
            .then(()=>{
                return Util.getContainerByService(svc)
            })
            .then((containerName)=>{
                var cmd = ["docker rm -f", containerName];

                return Util.shellExec(cmd.join(' '))
            })
        })
    }
}

function psAction(args, cb){
    Util.shellExec("docker ps")
    .then((output)=>{
        var list = Util.parsePS(output);
        var formattedList = list.map((row)=>row.NAMES);
        console.log(formattedList);
    });
}

function inAction(args, cb){
    if(args.container)
        return finish(args.container);

    return promptContainer()
    .then(finish)
    .catch(handleError);

    function finish(container){
        var cmd = "docker";
        var options = ["exec", "-it", container, "bash"];
        Util.shellExecFile(cmd, options);
    }
}

function testAction(args, cb){
    inquirer.prompt([{
        message: "What's your first name?",
        type: "list",
        name: "firstName",
        choices : ["abc", "def"]
    }])
    .then(answers => {
        console.log("Dues or dos", answers);
        // Use user feedback for... whatever!!
    })
    .catch(handleError)
}

function upAction(args, cb){
    if(args.containers)
        return finish(args.containers);

    return promptServices()
    .then(finish)
    .catch(handleError);

    function finish(services){
        var cmd = ["docker-compose up"];

        if(!args.options.attach)
            cmd.push("-d");

        if(services)
            cmd.push(services.join(' '));

        shell.exec(cmd.join(' '));
    }

    function handleError(err){
        console.log("An error occured");
        console.log(err);
    }
}


function promptServices(){
    var allServices;
    return Util.getYAML()
    .then((_yaml)=>{
        yaml = _yaml;

        allServices = Object.keys(yaml.services).map((s, index)=>{
            return {name: s, value: index}
        })

        allServices.unshift({name: "All Services", value: -1});
        // console.log();
        return inquirer.prompt([{
            message: "Select a service to run:",
            type: "list",
            name: "service",
            choices : allServices
        }])
    })
    .then((answers)=>{
        if(answers.service === -1)
            return null;

        var service = _.find(allServices, {value: answers.service});
        return [service.name]
    })
}

function promptContainer(){
    return Util.shellExec("docker ps")
    .then((output)=>{
        var list = Util.parsePS(output);

        if(!list || !list.length)
            return Promise.reject("No Containers");

        var formattedList = list.map((row)=>row.NAMES);

        return inquirer.prompt([{
            message : "Select a container:",
            type    : "list",
            name    : "container",
            choices : formattedList
        }])
    })
    .then((answers)=>{
        return answers.container;
    })
}


function handleError(err){
    console.log("An error occured");
    console.log(err);
}
