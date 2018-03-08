var NK_Widget_Modal_Upload = (function() {

	
	var _super = new NK_Widget_Modal();
	var _self = $.extend(
		true,
		_super,
		{
			className: "NK_Widget_Modal_Upload",
			id: "NK_Widget_Modal_Upload",
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
					close:{
						it: "Chiudi",
						en: "Close"
					} 
				},
				errors:{
					fileNotWrittenInTargetFolder:{
						it: "Errore! Non e' stato possibile scrivere nel folder di destinazione!",
						en: "Error! It isn't been possible writing into the target folder!"
					}
				
				}
			},
			config:{
				buttons:[
					{
						name: "close",
						dismissFlag: true,
						className: "default"
					}
				],
				dataToSend: {} //Insieme di dati da inviare assieme al file
			},
			addParamToSend: function( pName, pValue ) {
				_self.config.dataToSend[ pName ] = pValue;
			},
			getParamsToSend: function( ) {
				return _self.config.dataToSend;
			},
			getParamToSend: function( pName ) {
				return _self.config.dataToSend[ pName ];
			},
			clearParamsToSend: function() {
				for (var member in _self.config.dataToSend) delete _self.config.dataToSend[member];
			},
			clearAll: function() {
				_self.clearParamsToSend();
			},
			afterBuildFn: function () {
				//To execute at build time
				_self.setContent(
					'<span class="btn btn-success fileinput-button">'+
					'<i class="glyphicon glyphicon-plus"></i>'+
					'<span>Select files...</span>'+
					'<!-- The file input field used as target for the file upload widget -->'+
					'<input id="fileupload" type="file" name="files[]" multiple>'+
					'</span>'+
					'<br>'+
					'<br>'+
					'<!-- The global progress bar -->'+
					'<div id="upload_progress" class="progress">'+
					'	<div class="progress-bar progress-bar-success"></div>'+
					'</div>'+
					'<!-- The container for the uploaded files -->'+
					'<div id="upload_files" class="files"></div>'+
					'<div id="upload_errors" class="files"></div>'+
					'<br>'+
					'<div class="panel panel-default">'+
					'	<div class="panel-heading">'+
					'		<h3 class="panel-title">Notes</h3>'+
					'	</div>'+
					'	<div class="panel-body">'+
					'		<ul>'+
					'			<li>The maximum file size for uploads in this demo is <strong>999 KB</strong></li>'+
					'			<li>Only image files (<strong>JPG, GIF, PNG</strong>) are allowed </li>'+
					'			<li>You can <strong>drag &amp; drop</strong> files from your desktop on this webpage (see <a href="https://github.com/blueimp/jQuery-File-Upload/wiki/Browser-support">Browser support</a>).</li>'+
					'		</ul>'+
					'	</div>'+
					'</div>'
					);
			},
			
			firstCallDomBuildInit: function () {
				'use strict';
				// Change this to the location of your server-side upload handler:
				var url = "/json.php";
				//url = "assets/js/Others/jQuery-File-Upload-9.11.2/server/php";

				_self.structure.dom.refs.dropZone = $('#fileupload').fileupload(
					{
					url: url,
					disableImageResize: /Android(?!.*Chrome)|Opera/
						.test(window.navigator.userAgent),
					previewMaxWidth: 100,
					previewMaxHeight: 100,
					previewCrop: true,
					maxFileSize: 999000,
					formData: function( form ) {
						var reqParams = _self._getBasicSessionRequestParams();
						reqParams.co = "upload_file";
						$.extend(
							true,
							reqParams,
							_self.config.dataToSend
							);
						var reqParamsArray = [];
						$.each(reqParams,
							function( k,v ) {
								var newItem={
									name: k,
									value: v
								};
								reqParamsArray.push(newItem);
							});
						console.log(reqParamsArray);
						
						return reqParamsArray;
					},
					dataType: 'json',
					
					start: function(e) {
						$('#upload_files').empty();
						$('#upload_errors').empty();
					},
					
					done: function (e, data) {
						console.log("done",data);
						$('#upload_files').empty();
						$('#upload_errors').empty();
						
						$.each(data.result.results.upload.raw.files, function (index, file) {
							$('<p/>').text(file.name).appendTo('#upload_files');
						});
						var fileSize = data.result.results.upload.raw.files[0].size;
						if ( !! fileSize ) {
							//Successo
							var fileName = data.result.results.upload.raw.files[0].name;
							var filePath = data.result.results.fileDir;
							//alert(filePath + "/" + fileName);
							if ( _self.config.callBacks.hasOwnProperty("success") &&
								typeof _self.config.callBacks.success.fn === "function" ) {
								_self.config.callBacks.success.fn(filePath + "/" + fileName);
							}
							_self.hide();
						}
						else {
							//Errore
							var fileError = data.result.results.upload.raw.files[0].error;
							
							if ( fileError === "File upload aborted" ) {
								fileError = _self._getLangStringFromI18nItem( _self.i18n.errors.fileNotWrittenInTargetFolder )
							}
							
							var error = $('<span class="text-danger"/>').text(fileError);
							$("#upload_errors").append(error);
						}
						
					},
					fail: function (e, data) {
						console.log("fail",data);
						$('#upload_files').empty();
						$('#upload_errors').empty();
						$.each(data.files, function (index) {
							var error = $('<span class="text-danger"/>').text('File upload failed.');
							/* $(data.context.children()[index])
								.append('<br>')
								.append(error);
								*/
							$("#upload_errors").append(error);
						});
					},
					
					progressall: function (e, data) {
						var progress = parseInt(data.loaded / data.total * 100, 10);
						$('#upload_progress .progress-bar').css(
							'width',
							progress + '%'
						);
					}
				})
				/*
				.on('fileuploadfail', function (e, data) {
					console.log(data);
					$.each(data.files, function (index) {
						var error = $('<span class="text-danger"/>').text('File upload failed.');
						$(data.context.children()[index])
							.append('<br>')
							.append(error);
					});
				})
				*/
				.prop('disabled', !$.support.fileInput)
				.parent().addClass($.support.fileInput ? undefined : 'disabled');
				
			}
			
		});
	_self.appendTo("#container");
	
    
    
    
    
	return _self;
})();
