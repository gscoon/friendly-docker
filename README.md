# Friendly Docker CLI

### Install (globally):
```
npm install -g gscoon/friendly-docker
```

### Usage (from command line):
```
fd [command] [arguments...]
```


### Commands
1. <a href="#in">in</a>
4. <a href="#ps">ps</a>
3. <a href="#up">up</a>
4. <a href="#down">down</a>


<a name="in"><a>
#### Command: `in`
Simulates `docker-compose exec -it ...`
```
fd in [arguments...]
```


<a name="ps"><a>
#### Command: `ps`
Simulates `docker ps`
```
fd ps
```


<a name="up"><a>
#### Command: `up`
Simulates `docker-compose up...`
```
fd up [arguments...]
```


<a name="down"><a>
#### Command: `down` (WIP)
Simulates `docker-compose stop ...` and `docker rm ...`
```
fd down [arguments...]
```
