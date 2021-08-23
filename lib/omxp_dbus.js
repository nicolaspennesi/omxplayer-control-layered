const dbus = require('dbus-native');
const fs = require('fs');
const EventEmitter = require('events');
const { exec } = require('child_process');

const omx_methods = require('./omx_methods');
const OmxSpawn = require('./omxp_spawn');

class OmxDBus extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = Object.assign({ "layer": 0, ...options });
    this.status = '';
    this.bus = undefined;
    this.tickInterval = 5000;
    this.tick = undefined;
    this.omxp_spawn = new OmxSpawn(this.options);
  }

  openPlayer(path) {
    this.omxp_spawn.player(path);
    this.omxp_spawn.once('finish', (address) => {
      if (typeof this.tick !== 'undefined') clearInterval(this.tick);
      if (address === this.options.layer) {
        this.emit('finish');
      }
    });
    var conn_interval = setInterval(() => {
      if (fs.existsSync('/tmp/omxplayerdbus.' + process.env.USER)) {
        this.bus = dbus.sessionBus({
          busAddress: fs.readFileSync('/tmp/omxplayerdbus.' + process.env.USER, 'ascii').trim()
        });
        setTimeout(() => this.getPlayerStatus(), 500);
        this.tick = setInterval(() => this.getPlayerStatus(), this.tickInterval);
        clearInterval(conn_interval);
      }
    }, 500);
  }

  propertyRead(prop, cb) {
    if (typeof omx_methods.properties[prop] !== 'undefined' && omx_methods.properties[prop].read) {
      if (typeof this.bus !== 'undefined') {
        this.bus.invoke({
          path: '/org/mpris/MediaPlayer' + this.options.layer,
          interface: 'org.freedesktop.DBus.Properties',
          member: prop,
          destination: 'org.mpris.MediaPlayer' + this.options.layer + '.omxplayer'
        }, function (err, resp) {
          return cb(err, resp);
        });
      } else {
        return cb(new Error('Not ready yet'));
      }
    } else {
      return cb(new Error('Invalid property'));
    }
  }

  propertyWrite(prop, val, cb) {
    if (typeof this.bus !== 'undefined') {
      if (typeof omx_methods.properties[prop] !== 'undefined' && omx_methods.properties[prop].read) {
        this.bus.invoke({
          path: '/org/mpris/MediaPlayer' + this.options.layer,
          interface: 'org.mpris.MediaPlayer2.Player',
          member: prop,
          destination: 'org.mpris.MediaPlayer' + this.options.layer + '.omxplayer',
          signature: omx_methods.properties[prop].signature,
          body: val
        }, function (err) {
          return cb(err);
        });
      } else {
        return cb(new Error('Invalid property'));
      }
    } else {
      return cb(new Error('Not ready yet'));
    }
  }

  method(action, val, cb) {
    cb = typeof val === 'function' ? val : cb;
    if (typeof this.bus !== 'undefined') {
      if (typeof omx_methods.methods[action] !== 'undefined') {
        this.bus.invoke({
          path: '/org/mpris/MediaPlayer' + this.options.layer,
          interface: 'org.mpris.MediaPlayer2.Player',
          destination: 'org.mpris.MediaPlayer' + this.options.layer + '.omxplayer',
          member: action,
          signature: (omx_methods.methods[action].write ? omx_methods.methods[action].signature : null),
          body: (omx_methods.methods[action].write ? val : null)
        }, function (err, val) {
          cb(err, val);
        });
      } else {
        return cb(new Error('Invalid method'));
      }
    } else {
      return cb(new Error('Not ready yet'));
    }
  }

  getPlayerStatus() {
    this.propertyRead('PlaybackStatus', (err0, status) => {
      if (err0)
        return this.emit('changeStatus', {
          status: 'Stopped',
          error: err0
        });
      this.propertyRead('Duration', (err1, duration) => {
        if (err1)
          return this.emit('changeStatus', {
            status: 'Stopped',
            error: err1
          });
        this.propertyRead('Position', (err2, pos) => {
          if (err2)
            return this.emit('changeStatus', {
              status: 'Stopped',
              error: err2
            });
          this.propertyRead('Volume', (err3, vol) => {
            if (err3)
              return this.emit('changeStatus', {
                status: 'Stopped',
                error: err3
              });
            var new_status = {
              status: status,
              duration: duration,
              pos: pos < duration ? pos : 0,
              vol: vol
            };
            if (JSON.stringify(new_status) !== JSON.stringify(this.status)) {
              this.emit('changeStatus', new_status);
              this.status = new_status;
            }
          });
        });
      });
    });
  }

  playersRunning(cb) {
    this.omxp_spawn.omxp_running((count) => {
      cb(null, count);
    });
  }

  setTickInterval(tick_int) {
    this.tickInterval = tick_int;
  }

  getTickInterval() {
    return this.tickInterval;
  }

  //================================================
  //This part should be removed once able to setVolume with out it (the way every other function works).

  setVolume(val, cb) {
    var cmd = 'OMXPLAYER_DBUS_ADDR="/tmp/omxplayerdbus.${USER:-root}";OMXPLAYER_DBUS_PID="/tmp/omxplayerdbus.${USER:-root}.pid";export DBUS_SESSION_BUS_ADDRESS=`cat $OMXPLAYER_DBUS_ADDR`;export DBUS_SESSION_BUS_PID=`cat $OMXPLAYER_DBUS_PID`;dbus-send --print-reply=literal --session --reply-timeout=500 --dest=org.mpris.MediaPlayer' + this.options.layer + '.omxplayer /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Volume double:';
    exec(cmd + val, function (stderr, stdout) {
      if (stderr)
        return cb(new Error(stderr));
      var vol_d = parseFloat(stdout.substr(stdout.indexOf('double') + 7, stdout.length));
      cb(null, vol_d);
    });
  }
  //================================================
}

module.exports = OmxDBus;