<?php
require 'vendor/autoload.php';
use Aws\S3\S3Client;
use Aws\Exception\AwsException;

ob_implicit_flush(1);

$target_file = basename($_FILES["fileToUpload"]["name"]);
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
$videotext = $_POST['videotext'];
$uploadOk = 1;

// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
  echo "<pre>Sorry, your file was not uploaded.</pre>";
  return false;
  // if everything is ok, try to upload file
} else {
  if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], 'uploads/' . $target_file)) {
    echo "<pre>The file ". htmlspecialchars( basename( $_FILES["fileToUpload"]["name"])). " has been uploaded.</pre>";
  } else {
    echo "<pre>Sorry, there was an error uploading your file.</pre>";
    return false;
  }
}

ob_flush();

// Encode the file
$output1 = shell_exec('ffmpeg -y -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -loop 1 -i intro.png -t 00:00:05 -r 30 -c:v libx264 -profile:v main -vf format=yuv420p -c:a aac -shortest uploads/intro_' . $target_file . ' 2>&1'); 
echo "<pre>$output1</pre>"; 
$output2 = shell_exec('ffmpeg -y -t 00:00:05 -i uploads/intro_' . $target_file . ' -to 00:00:05 -vf drawtext="fontfile=arial.ttf: text=' . $videotext . ': fontcolor=white: fontsize=24: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y=(h-text_h)/2" uploads/fullintro_' . $target_file . ' 2>&1'); 
echo "<pre>$output2</pre>";

// Send file to S3 bucket
$sharedConfig = [
    'region' => 'us-east-1',
    'version' => 'latest',
    'credentials' => [
        'key'    => $_ENV['KEY'],
        'secret' => $_ENV['SECRET'],
    ]
];

// Create an SDK class used to share configuration across clients.
$sdk = new Aws\Sdk($sharedConfig);

// Use an Aws\Sdk class to create the S3Client object.
$s3Client = $sdk->createS3();

// Send a PutObject request and get the result object.
$result = $s3Client->putObject([
    'Bucket' => 'vod-acc-us-east-1',
    'Key' => 'intro/' . $target_file,
    'SourceFile' => 'uploads/fullintro_' . $target_file
]);

echo '<pre>' . $result . '</pre>';

$result = $s3Client->putObject([
    'Bucket' => 'vod-acc-us-east-1',
    'Key' => 'input/' . $target_file,
    'SourceFile' => 'uploads/' . $target_file
]);

// Print the body of the result by indexing into the result object.
echo '<pre>' . $result . '</pre>';

unlink('uploads/' . $target_file);
unlink('uploads/' . 'intro_' . $target_file);
unlink('uploads/' . 'fullintro_' . $target_file);
?>