# omxplayer-control-layered

An library for Node.js allowing you to have multiple omxplayer instances and control them in-process via the low-latency interprocess communication protocol, D-Bus.


## Installation


```shell
npm install --save omxplayer-control-layered
```

## Usage


Short example running a video getting the status every 5 seconds and listeing to the aboutToFinis signal

```js
var OmxPlayer = require('omxplayer-control-layered');
var opts = {
    'layer': '1',
    'audioOutput': 'hdmi', //  'hdmi' | 'local' | 'both'
    'blackBackground': false, //false | true | default: true
    'disableKeys': true, //false | true | default: false
    'disableOnScreenDisplay': true, //false | true | default: false
    'disableGhostbox': true, //false | true | default: false
    'subtitlePath': '', //default: ""
    'startAt': 0, //default: 0
    'startVolume': 0.8 //0.0 ... 1.0 default: 1.0
};
var omxp = new OmxPlayer(opts);

omxp.open('path_to_file');
omxp.on('changeStatus',function(status){
    console.log('Status',status);
});
omxp.on('aboutToFinish',function(){
    console.log('File about to finish');
});
```

#API


## List of available commands
### Open single file
```js
omxp.open('path_to_file');
```

### Basic commands
```js
omxp.playPause(function(err){});
omxp.play(function(err){});
omxp.pause(function(err){});
omxp.getStatus(function(err, status){}); //Playing, Paused,
omxp.getDuration(function(err, duration){});
omxp.getPosition(function(err, position){});
omxp.setPosition(new_pos, function(err){});
omxp.seek(offset, function(err){});
omxp.getVolume(function(err, volume){});
omxp.setVolume(new_volume, function(err, volume){});
omxp.volumeUp(function(err){});
omxp.volumeDown(function(err){});
omxp.toggleSubtitles(function(err){});
omxp.hideSubtitles(function(err){});
omxp.showSubtitles(function(err){});
omxp.setAlpha(function(err){});
omxp.setVideoPos(function(err){});
omxp.setVideoCropPos(function(err){});
omxp.setAspectMode(function(err){});
```

### Other commands
Change de Alpha of the current window the value must be between 0 and 255
```js
omxp.setAlpha(alpha_value, function(err){});
```
Set the position of the window, only works in non full screen.
```js
omxp.setVideoPos(x1, y1, x2, y2, function(err){});
```
Crop the video inside the window.
```js
omxp.setVideoCropPos(x1, y1, x2, y2, function(err){});
```
Set the aspect mode for the video, must be one of the following:
   'letterbox', 'fill', 'stretch', 'default'
```js
omxp.setAspectMode(aspect, function(err){});
```



## Reference:
   - https://github.com/sidorares/node-dbus/
   - https://github.com/popcornmix/omxplayer
   - https://github.com/diederikfeilzer/node-omx-interface
   - https://github.com/alepez/omxdirector

# Issue reporting:
When reporting an issue please add the following information:
  - OS version `cat /etc/os-release`
  - Node version `node --version`
  - omxplayer-control-layered version `npm ls | grep omxplayer-control-layered`
  - A detailed explanation of the issue and/or output.
