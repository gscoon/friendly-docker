const fs        = require('fs');
const Path      = require('path');
const shell     = require('shelljs');
const inquirer  = require('inquirer');
const _         = require('lodash');

var program     = require('vorpal')();
var yaml        = null;

global.Util     = require('./util.js');

module.exports = {
    parse : () => program.parse(process.argv),
}

// docker-compose up
program
.command('up [containers...]')
.option('-a, --attach', 'Attach to container(s)')
.action((args, cb)=>{
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
})

// docker-compose down
program
.command('down [containers...]')
.action((args, cb)=>{
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
                console.log("getContainerByService")
                return Util.getContainerByService(svc)
            })
            .then((containerName)=>{
                var cmd = ["docker rm -f", containerName];

                return Util.shellExec(cmd.join(' '))
            })
        })
    }
})

// docker exec
program
.command('in [container]')
.action((args, cb)=>{
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
})

// docker ps
program
.command('ps')
.action(()=>{
    Util.shellExec("docker ps")
    .then((output)=>{
        var list = Util.parsePS(output);
        var formattedList = list.map((row)=>row.NAMES);
        console.log(formattedList);
    });
})

// test
program
.command('test [mycommand]', 'Test command')
.action(function(args, cb){
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
})


function promptServices(){
    return Util.getYAML()
    .then((_yaml)=>{
        yaml = _yaml;

        var allServices = Object.keys(yaml.services).map((s, index)=>{
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
