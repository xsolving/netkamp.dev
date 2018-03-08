var Base64=(function(){
	var _self={
		_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
		encode:function(e){
			var t="";
			var n,r,i,s,o,u,a;
			var f=0;
			e=_self._utf8_encode(e);
			while(f<e.length){
				n=e.charCodeAt(f++);
				r=e.charCodeAt(f++);
				i=e.charCodeAt(f++);
				s=n>>2;
				o=(n&3)<<4|r>>4;
				u=(r&15)<<2|i>>6;
				a=i&63;
				if(isNaN(r)){u=a=64}
				else if(isNaN(i)){a=64}
				t=t+_self._keyStr.charAt(s)+_self._keyStr.charAt(o)+_self._keyStr.charAt(u)+_self._keyStr.charAt(a)
			}
			return t
		},
		decode:function(e){
			var t="";
			var n,r,i;
			var s,o,u,a;
			var f=0;
			e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");
			while(f<e.length){
				s=_self._keyStr.indexOf(e.charAt(f++));
				o=_self._keyStr.indexOf(e.charAt(f++));
				u=_self._keyStr.indexOf(e.charAt(f++));
				a=_self._keyStr.indexOf(e.charAt(f++));
				n=s<<2|o>>4;
				r=(o&15)<<4|u>>2;
				i=(u&3)<<6|a;
				t=t+String.fromCharCode(n);
				if(u!=64){t=t+String.fromCharCode(r)}
				if(a!=64){t=t+String.fromCharCode(i)}
			}
			t=_self._utf8_decode(t);
			return t
		},
		_utf8_encode:function(e){
			e=e.replace(/\r\n/g,"\n");
			var t="";
			for(var n=0;n<e.length;n++){
				var r=e.charCodeAt(n);
				if(r<128){t+=String.fromCharCode(r)}
				else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}
				else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}
			}
			return t
		},
		_utf8_decode:function(e){
			var t="";
			var n=0;
			var r=c1=c2=0;
			while(n<e.length){
				r=e.charCodeAt(n);
				if(r<128){t+=String.fromCharCode(r);n++}
				else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}
				else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}
			}
			return t}
		}
	return _self;		
})();


var GB_Root=function() {
	var _self = 
		{
			className: "GB_Root",
			getObjectClassName: function() {
				return _self.className;
			},
			__showCopyRight: function() {
				alert(_self.decodeBase64("VGhpcyBjb2RlIGhhcyBiZWVuIHdyaXR0ZW4gYnkgR2lvdmFubmkgQmFzb2x1LCBDb2RpY2UgRmlzY2FsZSBCU0xHTk42N0IxMUg1NzBJLiBBbGwgcmlnaHRzIHJlc2VydmVkIQ=="));
			},
			encodeBase64: function( str ) { return Base64.encode(str) },
			decodeBase64: function( str ) { return Base64.decode(str) }

		};
	
	return _self;
};

