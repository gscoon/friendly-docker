var program     = require('vorpal')();

global.Util     = require('./util.js');
global.Action   = require('./actions.js')

module.exports = {
    parse : () => program.parse(process.argv),
}

// docker-compose up
program.command('up [containers...]')
.option('-a, --attach', 'Attach to container(s)')
.action(Action.up);

// docker-compose down
program.command('down [containers...]')
.action(Action.down)

// docker exec
program.command('in [container]')
.action(Action.enter)

// docker ps
program.command('ps')
.action(Action.ps)

// test
program.command('test [mycommand]', 'Test command')
.action(Action.test)
