var NK_Widget_Modal_Confirm = (function() {

	
	var _super = new NK_Widget_Modal();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal_Confirm",
			id: "NK_Widget_Modal_Confirm",
			i18n:{
				title:{
					it: "Titolo",
					en: "Title"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{
					ok:{
						it: "OK",
						en: "OK"
					},
					cancel:{
						it: "Annulla",
						en: "Cancel"
					}
					
				}
			},
			config:{
				buttons:[
					{
						name: "ok",
						dismissFlag: true,
						className: "default"
					},
					{
						name: "cancel",
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
