var NK_Widget_Modal_ImgPreview = (function() {

	
	var _super = new NK_Widget_Modal();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal_ImgPreview",
			id: "NK_Widget_Modal_ImgPreview",
			i18n:{
				title:{
					it: "Immagine",
					en: "Image"
				},
				content:{
					it: "Contenuto",
					en: "Content"
				},
				buttons:{
					close:{
						it: "Chiudi",
						en: "Close"
					} 
				},
				errors:{
				}
			},
			config:{
				buttons:[
					{
						name: "close",
						dismissFlag: true,
						className: "default"
					}
				]
			},
			afterBuildFn: function () {
				//To execute at build time
				var newImg = $('<img id="modal_img_preview" class="imagepreview" style="width: 100%;" >');
				_self.setContent( newImg );
				_self.structure.dom.refs.imgPreview = newImg; 
			},
			showImage: function( imgPath ) {
				//console.log("show:",imgPath);
				_self.show();
				$( _self.structure.dom.refs.imgPreview ).attr("src", imgPath );
			}
			
		});
	_self.appendTo("#container");
	
    
    
    
    
	return _self;
})();			
