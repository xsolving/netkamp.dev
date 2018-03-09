#!/usr/bin/perl
use Cwd abs_path;
use JavaScript::Packer;
use Digest::MD5 qw(md5 md5_hex md5_base64);
use JSON;

open FILES, "< ../httpdocs/js/rechat/RcIncludeJsFilesList.js";
my @filesList = <FILES>;
close FILES;

my @files =();

for ( @filesList ) {
	chomp;
	#print "$_\n";
	my $row = $_;
	$row =~ s/^\s*//;
	$row =~ s/\s*$//;
	if ( ( $row !~ /^\s*\/\// ) &&
		( $row !~ /^\s*$/ ) &&
		( $row !~ /^(\[|\])/ ) &&
		( $row !~ /^\s*var/ )
		
		) {
		$row =~ s/,$//;
		$row =~ s/"//g;

	
		push (@files, $row);
		print "$row\n";
	
	}
	

}

my %filesMD5={};

my $pathBase = "../httpdocs";

my $output = "";
for (@files) {
	
	my $fileName = "$_";
	
	my $filePath = "$pathBase/$_";
	
	#print abs_path($filePath) . "\n";
	
	$filePath = abs_path($filePath);
	print "$filePath\n";
	
	open FILE, "< $filePath";
	my @content = <FILE>;
	
	$filesMD5{$fileName}= md5_hex( join("",@content) );
	
	$output .= "\n\n\n\n" . 
				("/" . "*" x (length($filePath) + 3) ). "\n" .
				("*" . " " x (length($filePath) + 2 ) . "*" )."\n" .
				"* $filePath *\n" . 
				("*" . " " x (length($filePath) + 2) . "*" )."\n" .
				("*" x ( length($filePath) + 3) ) . "/\n" .
				"\n\n" . join("",@content);
	close FILE;

}

open OUTPUT, "> ./compressedJs/RcApp.All.Debug.Gio.js";

print OUTPUT $output;

close OUTPUT;

my $packer = JavaScript::Packer->init();

#my %opts = { "compress"=>"obfuscate", "copyright"=>"Giovanni Basolu"}; 


my ($Second, $Minute, $Hour, $Day, $Month, $Year, $WeekDay, $DayOfYear, $IsDST) = localtime(time);
$Year += 1900;
$Month++;
$date = "$Day/$Month/$Year $Hour:$Minute:$Second";

my $packed = $packer->minify( \$output, 
							{ 
								"compress"=>"shrink", 
								"copyright"=>"Giovanni Basolu For IT Store srl ($date)"
							} );

open OUTPUT, "> ./compressedJs/RcApp.All.min.js";

print OUTPUT $packed;

close OUTPUT;

print encode_json(\%filesMD5);


##################
# Scrivo su file #
##################

my $outFile = "../httpdocs/js/rechat/RcIncludeJsFilesListMD5.js";

open OUTPUT, "> $outFile";

print OUTPUT encode_json(\%filesMD5)."\n";

close OUTPUT;


