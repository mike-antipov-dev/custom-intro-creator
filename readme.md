# Custom text intro creator
Node.JS AWS Lambda based micro app that creates a custom text intro and stitches it with a given videofile using AWS MediaConvert

## Description
Signalytics.AI creates a custom video content and sells it via their online store, to prevent its piracy and to track pirates they asked me to develop a custom solution.

Their idea was to inject into their videos a unique intro and random frame that contains email and name of a buyer.

We started with a proof of concept using PHP (it's in corresponding folder). An admin enters the text using a form in index.php, uploads a videofile and then server creates intro with FFMPEG and stitches the videos. Since most of videos was about 2 hours long, encoding process took even more, client didn't accept such speed.

After doing a research, I decided to use AWS Lambda and AWS MediaConvert to stitch everything together, the function listens for an API call from WooCommerce store with buyer's name, email and filename in S3 bucket, creates an intro, a random frame with the same info, and creates a MediaConvert job for transcoding, after the job is done, it invokes another Lambda function that makes an API call to WooCommerce store that the file is ready and sends it's S3 url for embedding. Encoding with MediaConvert cut overall time from 2+ hours to 10 mins.