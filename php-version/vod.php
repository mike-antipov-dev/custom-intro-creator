<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VOD player</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
</head>
<div class="container">
    <div class="row">
        <div class="col-12 mt-4">
            <form action="vod.php" method="get" enctype="multipart/form-data">
                <div class="mb-3">
                    <label for="url" class="form-label">Enter stream address:</label>
                    <input type="text" class="form-control" name="address" id="address">
                </div>
                <button type="submit" class="btn btn-primary">Play stream</button>
            </form>

            <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
            <!-- Or if you want a more recent alpha version -->
            <!-- <script src="https://cdn.jsdelivr.net/npm/hls.js@alpha"></script> -->
            <video id="video" controls id="videohls" style="width:1280px" class="mt-4"></video>
        </div>
    </div>
</div>
<script>
    var video = document.getElementById('video');
    var videoSrc = '<?php echo $_GET['address'] ?>';
    if (Hls.isSupported()) {
        var hls = new Hls({
            liveSyncDuration:3,
            maxBufferLength:20,
            autoStartLoad:true
        });
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
        hls.startLoad();
        video.play();
        });
    }
    // hls.js is not supported on platforms that do not have Media Source
    // Extensions (MSE) enabled.
    //
    // When the browser has built-in HLS support (check using `canPlayType`),
    // we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video
    // element through the `src` property. This is using the built-in support
    // of the plain video element, without using hls.js.
    //
    // Note: it would be more normal to wait on the 'canplay' event below however
    // on Safari (where you are most likely to find built-in HLS support) the
    // video.src URL must be on the user-driven white-list before a 'canplay'
    // event will be emitted; the last video event that can be reliably
    // listened-for when the URL is not on the white-list is 'loadedmetadata'.
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
    }
</script>

</body>

</html>