define(['visuals', 'pubsub', 'gestures', 'user', 'audio'], function(visuals, pubsub, gestures, users, audio){

	"use strict";

	return function(scope, el) {

		scope.loading = true;
		scope.stem.promise.done(loaded);
		scope.$watch('playing', toggleVisuals);

		scope.toggleOwner = function() {
			if (users.session.toggleStemControl(scope.stem)) {
				applyUser(users.session);
			} else {
				removeUser();
			}
		};

		function toggleVisuals(playing) {
			if (!scope.visualizer) return;
			if (playing) scope.visualizer.start();
			else scope.visualizer.stop();
		}

		function applyControlMessage(msg) {
			var user = msg.user;
			if (!user || !user.isControllingStem(scope.stem))
				return;
			scope.$apply(function(){
				gestures.processMessage(msg, scope.stem);
				applyUser(user);
			});
		}

		function removeUser() {
			scope.stem.name = scope.stem.key;
			if (scope.visualizer)
				scope.visualizer.setBaseColor(scope.visualizer.baseColor);
			scope.borderColor = 'transparent';
		}

		function applyUser(user) {
			if (scope.visualizer)
				scope.visualizer.setBaseColor(user.color);
			scope.borderColor = user.hexColor;
			scope.stem.name = user.alias;
		}

		function loaded() {
			var canvas = el.find('canvas');
			scope.visualizer = new visuals.Visualizer(canvas, scope.stem.player);
			scope.visualizer.start();
			scope.$apply(function(){
				scope.loading = false;
			});
			pubsub.subscribe(applyControlMessage);
		}

	}

});
