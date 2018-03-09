//File per l'esecuzion e di gulp
var gulp = require('gulp');
var gulpif = require('gulp-if');

var fs = require('fs');
var jsonminify = require("jsonminify");

//Images
var imagemin = require('gulp-imagemin');
var gulpUtil = require('gulp-util');

gulp.task('images', function() {  
    return gulp.src('dev/assets/img/*')
    .pipe(imagemin())
    .pipe(gulp.dest('httpdocs/assets/img/_min'));
});

var watcherScheduled = false;

//Javascript
var uglify = require('gulp-uglify');  
var concat = require('gulp-concat');  
var stripDebug = require('gulp-strip-debug');  
var size = require('gulp-size');

//CSS
var csso = require('gulp-csso');  
var autoprefix = require('gulp-autoprefixer');

//Packages
var packagesList = [ 'GB', 'NK', 'gb' ];

//Esecuzione tasks
var tasksList = {
	scripts:'js',
	styles:'css'
};

var filesPackagesNames = {};

var fullTasksList = []; //Lista dei tasks, es: [ 'scripts.GB.Core', scripts.GB.Others'--

var queue = []; //Coda dei task da eseguire la prima volta

for ( packageIndex in packagesList ) {
	var packageName = packagesList[ packageIndex ];
	
	for ( taskName in tasksList ) {
		var taskPath = tasksList[ taskName ];

		console.log( taskName, taskPath );
		
		queue.push({
			pkg: packageName, 
			tn: taskName, 
			tp: taskPath
		});
		
	}
}
console.log(queue);


function createGulpTask( tmpPackageName, tmpTaskName, tmpTaskPath ) {
	var fullTaskName = tmpTaskName + "-" + tmpPackageName;
	fullTasksList[ tmpTaskName ] = fullTasksList[ tmpTaskName ] || [];
	fullTasksList[ tmpTaskName ].push( fullTaskName ); //Creo un task name nuovo
	var fn = function() {
		
		//console.log(tmpPackageName, tmpTaskName, tmpTaskPath);
		var filesListName = 'dev/assets/_packages/' + tmpPackageName + '/' + tmpTaskPath + '.json';
		filesPackagesNames[ tmpTaskPath ] = filesPackagesNames[ tmpTaskPath ] || [];
		filesPackagesNames[ tmpTaskPath ].push(filesListName);
		
		console.log("start");
		var filesList = JSON.parse( JSON.minify( fs.readFileSync( filesListName, 'utf8' ) ) );
		//console.log(new Date(),filesListName);
		//console.log(new Date(),filesList);
		for ( moduleName in filesList ) {
			var module = filesList[ moduleName ];
				
			//console.log(module);
			var targetFileName = tmpPackageName + '.' + moduleName + (uglifyFlag===true ? ".min" : "") + '.' + tmpTaskPath;
			var targetFilePath = 'httpdocs/assets/' + tmpTaskPath + '/_min';
			
			console.log( "Target file: " + targetFilePath + "/" + targetFileName );
			
			if ( typeof module.list !== "undefined" ) {
				for ( i in module.list ) {
					module.list[ i ] = module.base + module.list[ i ];
				}
				
				//Vengono creati sia il min (solo se richiesto) che il non compresso. 
				var uglifyList=[ false ];
				if ( module.pack === true ) {
					uglifyList.push(true);
				}
				for ( uglifyListN in uglifyList ) {
					var uglifyFlag = uglifyList[ uglifyListN ];
					
					if ( tmpTaskName==='scripts' ) {
						packJs( tmpPackageName, module, moduleName, uglifyFlag, tmpTaskPath );
					}
					else if ( tmpTaskName==='styles' ) {
						packCss( tmpPackageName, module, moduleName, uglifyFlag, tmpTaskPath );
					}
				}
			}
			else {
				fs.closeSync(fs.openSync(targetFilePath + "/" + targetFileName, 'w'));
			
			}
		}
	}
	fn();
	gulp.task(
		fullTaskName,
		fn
	);
}








/*
function createGulpTask2( tmpPackageName, tmpTaskName, tmpTaskPath ) {
	
	gulp.task(
		tmpTaskName, 
	);
}
*/

function packJs( tmpPackageName2, module, moduleName, uglifyFlag, tmpTaskPath2 ) {
	console.log( "JS", new Date(),tmpPackageName2, module, moduleName, uglifyFlag, tmpTaskPath2 );

	var targetFileName = tmpPackageName2 + '.' + moduleName + (uglifyFlag===true ? ".min" : "") + '.' + tmpTaskPath2;
	var targetFilePath = 'httpdocs/assets/' + tmpTaskPath2 + '/_min';
	
	if ( typeof module.list!== "undefined" ) {
		var streamJS = gulp.src( module.list, {base: module.base} )
			.pipe( stripDebug() )
			.pipe(concat( targetFileName ))
			.pipe(gulpif( ( uglifyFlag===true ), uglify() ))
			.pipe(size())
			.pipe(gulp.dest( targetFilePath ))
			
		streamJS.on('end',function() {
			doNextPackage();
		}); 
	}
	else {
		fs.closeSync(fs.openSync(targetFilePath + "/" + targetFileName, 'w'));
		doNextPackage();
	}
}

function packCss( tmpPackageName3, module, moduleName, uglifyFlag, tmpTaskPath3 ) {
	console.log( "CSS", new Date(),tmpPackageName3, module, moduleName, uglifyFlag, tmpTaskPath3 );
	
	var targetFileName = tmpPackageName3 + '.' + moduleName + (uglifyFlag===true ? ".min" : "") + '.' + tmpTaskPath3;
	var targetFilePath = 'httpdocs/assets/' + tmpTaskPath3 + '/_min';
	
	if ( typeof module.list!== "undefined" ) {
		var streamCSS = gulp.src( module.list, {base: module.base} )
			.pipe( autoprefix() )
			.pipe( concat( targetFileName ) )
			.pipe( gulpif( (uglifyFlag===true ), csso() ) )
			.pipe( size() )
			.pipe( gulp.dest( targetFilePath ) )

		streamCSS.on('end',function(){
			doNextPackage();
		}); 
	}
	else {
		fs.closeSync(fs.openSync(targetFilePath + "/" + targetFileName, 'w'));
		doNextPackage();
	}
}

//CSS
/*
var csso = require('gulp-csso');  
var autoprefix = require('gulp-autoprefixer');

gulp.task('styles', function() {  
    gulp.src('dev/assets/css/GB/*.css')
        .pipe(autoprefix())
        .pipe(concat('GB-main.css'))
        .pipe(csso())
        .pipe(size())
        .pipe(gulp.dest('httpdocs/assets/css/_min'));
});
*/

//All

function lastTask() {
	//gulp.task('default', ['images', 'scripts', 'styles'], function() {
	if ( watcherScheduled === false ) {
		gulp.watch('dev/assets/js/**/**/*.js', fullTasksList['scripts']);
		gulp.watch('dev/assets/css/**/*.css', fullTasksList['styles']);
		
		for ( task in tasksList ) {
		
			gulp.watch(filesPackagesNames[ 'css' ], fullTasksList['styles']);
			gulp.watch(filesPackagesNames[ 'js' ], fullTasksList['scripts']);
		}
		
		watcherScheduled = true;
	}
}
function doNextPackage() {
	console.log('queue',queue);
	if ( queue.length > 0 ) {
		var data = queue.splice(0,1)[0];
		console.log("data",data);
		createGulpTask( data.pkg, data.tn, data.tp );
	}
	else {
		lastTask();
	}
}

//start();

gulp.task('start', ['images'], function() {
		
	doNextPackage();
});
