var StopWatch = function (performance) {
	var _self={
		startTime: 0,
		stopTime: 0,
		running: false,
		performance: ( performance === false ? false : !!window.performance ),
		currentTime: function () {
			return _self.performance ? window.performance.now() : new Date().getTime();
		},
		start: function () {
			_self.startTime = _self.currentTime();
			_self.running = true;
		},
		
		stop: function () {
			_self.stopTime = _self.currentTime();
			_self.running = false;
		},
		getElapsedMilliseconds: function () {
			if (_self.running) {
				_self.stopTime = _self.currentTime();
			}
		
			return _self.stopTime - _self.startTime;
		},
		
		getElapsedSeconds: function () {
			return _self.getElapsedMilliseconds() / 1000;
		},
		printElapsed: function (name) {
			var currentName = name || 'Elapsed:';
		
			console.log(currentName, '[' + _self.getElapsedMilliseconds() + 'ms]', '[' + _self.getElapsedSeconds() + 's]');
		},
		
		traceFnTime: function (fn, message) {
			if ( typeof message==="undefined" ) {
				message="Elapsed:";
			}
			
			var stopwatch = new StopWatch();
			stopwatch.start();
			fn();
			
			stopwatch.stop();
			
			stopwatch.printElapsed(message);
		}    
    }
    return _self;
};





