## Setup GUI for Docker Container on Mac 
---
### Introduction
This page will introduce how to setup GUI for a docker container running on Mac OS with ``-e DISPLAY`` flag.

### Install socat and xquartz
```
brew install socat
brew cask install xquartz
```

### Start XQuartz
```
open -a XQuartz
```

### Expose local xquartz socket via socat on a TCP port
```
socat TCP-LISTEN:6000, reuseaddr,fork UNIX-CLIENT:\"$DISPLAY\"
```

### Get the host IP and pass the display to docker container
```
docker run -it -e DISPLAY=xxx.xxx.xxx.xxx:0 --name container-name docker-image script

```

**Get host ip address**
```
# Docker for Mac
screen ~/Library/Containers/com.docker.docker/Data/com.docker.driver.amd64-linux/tty
route | grep default | awk '{ print $2 }'

```
