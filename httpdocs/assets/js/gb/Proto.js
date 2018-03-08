Array.prototype.clear = function() {
	while (this.length) {
		this.pop();
	}
};
Array.prototype.clone = function() {
	return this.slice(0);
};
//
String.prototype.toTitleCase = function()
{
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
