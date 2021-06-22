<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload a video</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous">
</head>

<div class="container">
  <div class="row">
    <div class="col-12 mt-4">

      <form action="upload.php" method="post" enctype="multipart/form-data">
        <div class="mb-3">
          <label for="fileToUpload" class="form-label">Select video to upload:</label>
          <input type="file" class="form-control" name="fileToUpload">
        </div>
        <div class="mb-3">
          <label for="video-text" class="form-label">Text</label>
          <input type="text" class="form-control" name="videotext" id="video-text">
        </div>
        <button type="submit" class="btn btn-primary">Upload</button>
      </form>

    </div>
  </div>
</div>

</body>

</html>