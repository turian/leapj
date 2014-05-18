window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
window.AudioContext = window.AudioContext || window.webkitAudioContext;

define(['require', 'jquery'], function(angular, $){

	"use strict";

	var audio = createAudioContext();

	function createAudioContext() {
		var c = new AudioContext();
		c.createGain = c.createGain || c.createGainNode;
		return c;
	}

	function createCanvasContext(canvas) {

		var context = canvas.get(0).getContext('2d');
		var height = context.width = canvas.width();
		context.height = canvas.height();

		var gradient = context.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0.15, '#e81717');
		gradient.addColorStop(0.75, '#7943cb');
		gradient.addColorStop(1, '#005392');
		context.fillStyle = gradient;
		context.strokeStyle = '#AAA';

		return context;

	}

	function loadBuffer(url, notify, done) {
		notify('loading');
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			notify('decoding');
			audio.decodeAudioData(request.response, done);
		}
		request.send();
	}

	function renderAnalyzer(ctx, analyser, w, h) {

		if (!ctx || !analyser) return;

		var byteFreqArr = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(byteFreqArr);

		var timeDomainArr = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteTimeDomainData(timeDomainArr);

		ctx.clearRect(0, 0, w, h);
		ctx.beginPath();

		var fft = analyser.fftSize;
		var fw = w / fft;

		for (var j=0, jLen=byteFreqArr.length; j<jLen; j++ ) {
			var percent = timeDomainArr[j] / fft;
			var offset = h - (percent * h) - 1;
			ctx.fillRect(j * fw, h-(byteFreqArr[j] / fft * h), (fw - 2), h);
			ctx.lineTo(j * fw, offset);
		}

		ctx.stroke();

	}

	return function(scope, el) {

		var def = $.Deferred();

		scope.volume = 100;
		scope.loading = true;
		scope.canvas = el.find('canvas');
		scope.canvasCtx = createCanvasContext(scope.canvas);

		loadBuffer(scope.url, updateStatus, applyBuffer);

		scope.play = function() {

			def.done(function(){

				scope.bufferSource = audio.createBufferSource();
				scope.bufferSource.buffer = scope.buffer;

				var bufferOffset = scope.pauseTime || 0;
				scope.startTime = audio.currentTime;

				// correct playback time
				if (scope.pauseTime > 0) {
					scope.startTime -= scope.pauseTime;
				}

				// start playback
				if (scope.bufferSource.start) {
					scope.bufferSource.start(0, bufferOffset);
				} else {
					scope.bufferSource.noteGrainOn(0, bufferOffset, 180);
				}

				setAudioComponents();

			});

		}

		scope.stop = function() {
			def.done(function(){
				if (scope.bufferSource.stop) {
					scope.bufferSource.stop(0);
				} else {
					scope.bufferSource.noteOff(0);
				}
				scope.pauseTime = audio.currentTime - scope.startTime;
			});
		}

		scope.$watch('volume', function(volume){
			var value = volume / 100;
			if (scope.gainNode) {
				scope.gainNode.gain.value = value;
			}
		});

		function setAudioComponents() {

			// set volume controls
			scope.gainNode = audio.createGain();
			scope.bufferSource.connect(scope.gainNode);
			scope.gainNode.connect(audio.destination);

			// set an audio analyser
			scope.analyser = audio.createAnalyser();
			scope.analyser.smoothingTimeConstant = 0.6;
			scope.analyser.fftSize = 256;
			scope.gainNode.connect(scope.analyser);

		}

		function updateStatus(status) {
			setTimeout(function(){
				scope.$apply(function(){
					scope.status = status;
				});
			}, 100);
		}

		function applyBuffer(buffer) {
			scope.ready = true;
			scope.loading = false;
			scope.buffer = buffer;
			updateStatus('');
			renderLoop();
			def.resolve(scope)
		}

		function renderLoop() {
			renderAnalyzer(scope.canvasCtx, scope.analyser, scope.canvas.width(), scope.canvas.height());
			window.requestAnimationFrame(renderLoop);
		}

		require(['scope/player'], function(player){
			player.registerStem(scope.url, scope);
		});

	}

});