var GB_Mutex=(function() {
	var _super = new GB_Root();
	
	var _self = $.extend(
		true,
		_super,
		{
			className: "GB_Mutex",
			data: {
				_locked: {}
			},
			lock: function( name, fn ) {
				//Exec a function with a lock
				//console.log(" start execWithMutexLock ");
				_self.data._locked[ name ] = _self.data._locked[ name ] || 0; 
				if ( ++_self.data._locked[ name ] === 1 ) {
					fn();
					_self.data._locked[ name ]--;
					//console.log(" DONE execWithMutexLock ");
				}
				else {
					//console.log(" REstart execFn ");
					_self.data._locked--;
					setTimeout( function() { _self.execFn( name, fn ) }, 100 );
				}
			},
			lockOnce: function( name, fn ) {
				//Exec a function just once
				//console.log(" start execWithMutexLock ");
				_self.data._locked[ name ] = _self.data._locked[ name ] || 0; 
				if ( ++_self.data._locked[ name ] === 1 ) {
					fn();
					_self.data._locked[ name ]--;
					//console.log(" DONE singleExecFn ");
				}
			}





		});
	return _self;
})();
