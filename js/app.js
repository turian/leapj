(function(){

	"use strict";

	requirejs.config({
		paths: {
			jquery: '/js/jquery-2.1.0-custom/jquery.min'
		}
	});

    var myDataRef = new Firebase('https://pr5c1gjakw6.firebaseio-demo.com/');
    myDataRef.on('child_added', function(snapshot) {
      // @todo Ignore old commands
      console.log(snapshot.val());
    });
})();
