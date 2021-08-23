const { spawn, execSync } = require('child_process');
const EventEmitter = require('events');

class OmxSpawn extends EventEmitter {
  constructor(options = {}) {
    super();
    this.prevent_kill_signal = false;
    this.options = options;
  }

  omxp_running() {
    var stdout = execSync('ps xa | grep "[o]mxplayer.bin" | wc -l');
    var processCount = parseInt(stdout);
    return processCount;
  };

  player(path) {
    // var count = this.omxp_running();
    // this.options.maxPlayerAllowCount = this.options.maxPlayerAllowCount || 1;
    // this.options.closeOtherPlayers = typeof this.options.closeOtherPlayers === 'undefined' ? true : this.options.closeOtherPlayers;
    // if (count >= this.options.maxPlayerAllowCount) {
    //   if (this.options.closeOtherPlayers) {
    //     this.prevent_kill_signal = true;
    //     //TODO: check if is possible to kill player by dbus-name (org.mpris.MediaPlayer0.omxplayer)
    //     execSync('killall -9 omxplayer.bin'); //Kill all previous omxplayers
    //   } else {
    //     return; //Dont open a new player, it is not neccesary
    //   }
    // }

    var command = 'omxplayer';
    path = typeof path === 'string' ? [path] : path;
    var args = path;
    if (['hdmi', 'local', 'both'].indexOf(this.options.audioOutput) != -1)
      args.push('-o', this.options.audioOutput);
    if (this.options.blackBackground !== false)
      args.push('-b');
    if (this.options.disableKeys === true)
      args.push('--no-keys');
    if (this.options.disableOnScreenDisplay === true)
      args.push('--no-osd');
    if (this.options.disableGhostbox === true)
      args.push('--no-ghost-box');
    if (this.options.subtitlePath && this.options.subtitlePath !== '')
      args.push('--subtitles', '"' + this.options.subtitlePath + '"');
    if (this.options.startAt)
      args.push('--pos', '' + this.options.startAt + '');
    if (this.options.layer)
      args.push('--layer', '' + this.options.layer + '');
    if (this.options.alpha)
      args.push('--alpha', '' + this.options.alpha + '');
    if (this.options.win)
      args.push('--win', '' + this.options.win + '');
    if (typeof this.options.startVolume !== 'undefined') {
      if (this.options.startVolume >= 0.0 && this.options.startVolume <= 1.0) {
        args.push('--vol');
        var db = this.options.startVolume > 0 ? Math.round(100 * 20 * (Math.log(this.options.startVolume) / Math.log(10))) / 1 : -12000000;
        args.push(db);
      }
    }

    if (typeof this.options.otherArgs !== 'undefined' && this.options.otherArgs.constructor === Array) {
      args = args.concat(this.options.otherArgs);
    }
    if (this.options.nativeLoop === true) {
      args.push('--loop');
    }

    args.push('--dbus_name');
    args.push('org.mpris.MediaPlayer' + this.options.layer + '.omxplayer');
    args.push('< omxpipe');
    var omxspawn = spawn(command, args);
    omxspawn.on('error', (err) => {
      this.emit('error', err);
    });
    omxspawn.on('exit', () => {
      if (!this.prevent_kill_signal)
        this.emit('finish', this.options.layer);
    });
  };
}

module.exports = OmxSpawn;