// Generated by CoffeeScript 1.7.1
var LeapToFirebase, fingerprint, module;

if (typeof Fingerprint === "undefined" || Fingerprint === null) {
  throw "Couldn't find Fingerprint library";
}

fingerprint = new Fingerprint().get();

LeapToFirebase = (function() {
  function LeapToFirebase(firebase_room_uri) {
    console.log("Construct LeapToFirebase. Connecting to " + firebase_room_uri);
    this.firebase_room_uri = firebase_room_uri;
    if (firebase_room_uri) {
      this.firebase = new Firebase(this.firebase_room_uri);
    }
  }

  LeapToFirebase.prototype.translate = function(leap_event) {
    console.log(JSON.stringify(leap_event));
    if (leap_event.type === 'pinch-start') {
      return {
        user: 'string',
        stem: leap_event.value.finger,
        event: {
          type: 'volume',
          level: 0
        },
        source: 'leap'
      };
    } else if (leap_event.type === 'pinch-stop') {
      return {
        user: 'string',
        stem: leap_event.value.finger,
        event: {
          type: 'volume',
          level: 1
        },
        source: 'leap'
      };
    } else if (leap_event.type === 'space') {
      return {
        user: 'string',
        stem: 1,
        event: {
          type: 'volume',
          level: leap_event.value.x
        },
        source: 'leap'
      };
    } else {
      return null;
    }
  };

  LeapToFirebase.prototype.sendToFirebase = function(event) {
    if (event.createdAt == null) {
      event.createdAt = Date();
    }
    event.fingerprint = fingerprint;
    console.log("Sending event " + (JSON.stringify(event)) + " to firebase " + this.firebase_room_uri);
    return this.firebase.push(event);
  };

  return LeapToFirebase;

})();

module = module || {};

module.exports = {
  LeapToFirebase: LeapToFirebase
};
