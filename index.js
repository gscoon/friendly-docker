var shell       = require('shelljs');
var program     = require('commander');

module.exports = {
    parse : parse
}

function parse(){
    program.parse(process.argv)
}

var nativeExec      = require('child_process').exec;
var nativeExecFile  = require('child_process').execFileSync;

program
.command('up [container]')
.option('-d, --detach', 'Detach from container(s)')
.action((container, arguments)=>{
    var cmd = ["docker-compose up"];;

    if(arguments.detach)
        cmd.push("-d");

    if(container)
        cmd.push(container);

    cmd = cmd.join(' ');
    shell.exec(cmd);
})

program
.command('in <container>')
.action((container)=>{
    var cmd = "docker";
    var options = ["exec", "-it", container, "bash"];
    var ouput = nativeExecFile(cmd, options, {stdio: 'inherit'});
})

program
.command('test <arg1> [arg2]')
.action((arg1,arg2)=>{
    var cmd = [arg1];
    if(arg2)
        cmd.push(arg2);

    var output = nativeExec(cmd.join(' '), {
        stdio: [0,1,2]
    }, (error, stdout, stderr)=>{
        console.log("stdout", stdout.split('\n'));
        console.log("stderr", stderr.split('\n'));
    });
})
