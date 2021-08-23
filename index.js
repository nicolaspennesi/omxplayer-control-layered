const EventEmitter = require('events');
var OmxDBus = require('./lib/omxp_dbus');

class OmxPlayer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.setTransition = false;
    this.omxs = undefined;
  }

  open(path) {
    if (typeof this.omxs === 'undefined') {
      this.omxs = new OmxDBus(this.options);
    }
    this.omxs.openPlayer(path);
    this.omxs.on('changeStatus', (status) => {
      this.emit('changeStatus', status);
      var diff = status.duration - status.pos,
        lower = 5000000 - this.omxs.getTickInterval() * 500,
        higer = 5000000 + this.omxs.getTickInterval() * 500;
      if (diff > lower && diff < higer) {
        this.emit('aboutToFinish');
      }
    });
    this.omxs.on('finish', () => {
      this.emit('finish');
    });
  }

  playPause(cb) { //checked
    this.omxs.method('PlayPause', (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  pause(cb) { //checked IDEM playPause
    this.omxs.method('Pause', (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  stop(cb) { //checked IDEM Stop
    this.omxs.method('Stop', (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  getStatus(cb) { //checked
    this.omxs.propertyRead('PlaybackStatus', (err, status) => {
      cb(err, status);
    });
  };

  getDuration(cb) { //checked
    this.omxs.propertyRead('Duration', (err, dur) => {
      cb(err, dur);
    });
  };

  getPosition(cb) { //checked
    this.omxs.propertyRead('Duration', (err, dur) => {
      this.omxs.propertyRead('Position', (err, pos) => {
        var ppos = 0;
        if (pos < dur) {
          ppos = pos;
        }
        cb(err, Math.round(ppos));
      });
    });
  };

  setPosition(pos, cb) { //checked
    this.omxs.method('SetPosition', ['/not/used', pos], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  seek(offset, cb) { //checked
    this.omxs.method('Seek', [offset], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  selectAudio(audioStreamId, cb) { //checked
    this.omxs.method('SelectAudio', [audioStreamId], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  nextAudio(cb) { //checked
    this.omxs.method('Action', [7], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  listAudio(cb) { //checked
    this.omxs.method('ListAudio', (err, audioStreams) => {
      cb(err, audioStreams);
    });
  };

  previousAudio(cb) { //checked
    this.omxs.method('Action', [6], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  getVolume(cb) { //checked
    this.omxs.propertyRead('Volume', (err, vol) => {
      cb(err, vol);
    });
  };

  setVolume(vol, cb) { //checked *not oficially but Working
    if (vol <= 1.0 && vol >= 0.0) {
      this.omxs.setVolume(vol, (err, resp) => {
        return typeof cb === 'function' ? cb(err, resp) : {};
      });
    } else {
      return cb(new Error('Volume should be between 0.0 - 1.0'));
    }
  };

  volumeUp(cb) { //checked
    this.omxs.method('Action', [18], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  volumeDown(cb) { //checked
    this.omxs.method('Action', [17], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  listSubtitles(cb) { //checked
    this.omxs.method('ListSubtitles', (err, subtitleStreams) => {
      cb(err, subtitleStreams);
    });
  };

  toggleSubtitles(cb) { //checked not tested (I have no subtitles)
    this.omxs.method('Action', [12], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  nextSubtitle(cb) { //checked
    this.omxs.method('Action', [11], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  previousSubtitle(cb) { //checked
    this.omxs.method('Action', [10], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  hideSubtitles(cb) { //checked not tested (I have no subtitles)
    this.omxs.method('Action', [30], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  hideSubtitles(cb) { //checked not tested (I have no subtitles)
    this.omxs.method('Action', [30], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  showSubtitles(cb) { //checked not tested (I have no subtitles)
    this.omxs.method('Action', [31], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  setAlpha(alpha, cb) { //checked
    if (alpha >= 0 && alpha <= 255) {
      this.omxs.method('SetAlpha', ['/not/used', alpha], (err) => {
        return typeof cb === 'function' ? cb(err) : {};
      });
    } else {
      return cb(new Error('Alpha should be between 0 - 255'));
    }
  };

  setVideoPos(x1, y1, x2, y2, cb) { //checked
    var vidPos = x1.toString() + ' ' + y1.toString() + ' ' + x2.toString() + ' ' + y2.toString();
    this.omxs.method('VideoPos', ['/not/used', vidPos], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  setVideoCropPos(x1, y1, x2, y2, cb) { //checked
    var vidPos = x1.toString() + ' ' + y1.toString() + ' ' + x2.toString() + ' ' + y2.toString();
    this.omxs.method('SetVideoCropPos', ['/not/used', vidPos], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  setAspectMode(aspect, cb) { //checked
    var available_aspects = ['letterbox', 'fill', 'stretch', 'default'];
    if (available_aspects.indexOf(aspect) > -1) {
      this.omxs.method('SetAspectMode', ['/not/used', aspect], (err) => {
        return typeof cb === 'function' ? cb(err) : {};
      });
    } else {
      throw new Error('Not an available aspect use one of: ' + available_aspects.join(','));
    }
  };

  hideVideo(cb) { //checked
    this.omxs.method('Action', [28], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  unhideVideo(cb) { //checked
    this.omxs.method('Action', [29], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  getSource(cb) { //checked
    this.omxs.propertyRead('GetSource', (err, vol) => {
      cb(err, vol);
    });
  };

  getMinRate(cb) { //checked
    this.omxs.propertyRead('MinimumRate', (err, vol) => {
      cb(err, vol);
    });
  };

  getMaxRate(cb) { //checked
    this.omxs.propertyRead('MaximumRate', (err, vol) => {
      cb(err, vol);
    });
  };

  reduceRate(cb) { //checked
    this.omxs.method('Action', [1], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };

  increaceRate(cb) { //checked
    this.omxs.method('Action', [2], (err) => {
      return typeof cb === 'function' ? cb(err) : {};
    });
  };
}


module.exports = OmxPlayer;


//=========================Not working functions
// module.exports.quit = function(cb) { //not working
//     this.omxs.method('Quit', function(err) {
//         return typeof cb === 'function' ? cb(err) : {};
//     });
// };
// module.exports.mute = function(cb) { //not working
//     this.omxs.method('Mute', function(err) {
//         cb(err);
//     });
// };
// module.exports.getRate = function(cb) { //not working
//     this.omxs.propertyRead('Rate', function(err, vol) {
//         cb(err, vol);
//     });
// };
// module.exports.play = function(cb) { //not working
//     this.omxs.method('Play', function(err) {
//         return typeof cb === 'function' ? cb(err) : {};
//     });
// };
//=========================EN OF NOT WORKING FUNCTIONS
