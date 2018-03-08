var NK_Widget_Modal_Alert = (function() {

	var _super = new NK_Widget_Modal();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal_Alert",
			id: "NK_Widget_Modal_Alert",
			i18n:{
				title:{
					it: "Info",
					en: "Info"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{
					ok:{
						it: "OK",
						en: "OK"
					} 
				}
			},
			config:{
				buttons:[
					{
						name: "ok",
						dismissFlag: true,
						className: "default"
					}
				]
			}
		});
	//_self.init();
	_self.appendTo("#container");
	return _self;
})();
