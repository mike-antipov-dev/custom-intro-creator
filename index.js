const { spawnSync } = require('child_process');
const AWS = require('aws-sdk');
const fs = require('fs');

// Set the region 
AWS.config.update({
  region: 'us-east-1',
  version: 'latest'
});

let response = {
    statusCode: 200,
    body: ""
};

// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

exports.handler = async (event) => {
    const {name, email, video} = event.body;
    let nameString = name.replace(' ', '_');
    if (name && email && video && name != "" && email !="" && video != ""){
        const introBg = spawnSync('/opt/bin/ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100', '-loop', '1', '-i', '/opt/intro.png', '-t', '00:00:05', '-r', '30', '-c:v', 'libx264', '-profile:v', 'main', '-vf', 'format=yuv420p', '-c:a', 'aac', '-shortest', '/tmp/intro_bg_' + nameString + '.mp4'], {
          stdio: 'pipe',
          stderr: 'pipe'
        });
          
        const introReady = spawnSync('/opt/bin/ffmpeg', ['-y', '-t', '00:00:05', '-i', '/tmp/intro_bg_' + nameString + '.mp4', '-to', '00:00:05', '-vf', 'drawtext=text=This video was made specially for ' + event.body.name + ': fontfile=/opt/arial.ttf: fontcolor=white: fontsize=24: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y=(h-text_h)/2', '/tmp/fullintro_' + nameString + '.mp4'], {
          stdio: 'pipe',
          stderr: 'pipe'
        });
        
        const finalFrame = spawnSync('/opt/bin/ffmpeg', ['-y', '-t', '00:00:05', '-i', '/tmp/intro_bg_' + nameString + '.mp4', '-to', '00:00:00.150', '-vf', 'drawtext=text=This video was made specially for ' + event.body.name + ': fontfile=/opt/arial.ttf: fontcolor=0x0B0B0B: fontsize=24: box=1: boxcolor=black@0.5: boxborderw=5: x=(w-text_w)/2: y=(h-text_h)/2', '/tmp/finalframe_' + nameString + '.mp4'], {
          stdio: 'pipe',
          stderr: 'pipe'
        });

        const blankFrame = spawnSync('/opt/bin/ffmpeg', ['-y', '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100', '-loop', '1', '-i', '/opt/intro.png', '-t', '00:00:00.500', '-r', '30', '-c:v', 'libx264', '-profile:v', 'main', '-vf', 'format=yuv420p', '-c:a', 'aac', '-shortest', '/tmp/blank_frame_' + nameString + '.mp4'], {
          stdio: 'pipe',
          stderr: 'pipe'
        });
        
        const introFile = fs.readFileSync('/tmp/fullintro_' + nameString + '.mp4');
        const finalFile = fs.readFileSync('/tmp/finalframe_' + nameString + '.mp4');
        const blankFile = fs.readFileSync('/tmp/blank_frame_' + nameString + '.mp4');
        
        async function uploadFile(key, body) {
            // Upload the file to the destination bucket
            try {
              const destparams = {
                Bucket: 'vod-us-east-1', 
                Key: key,
                Body: body,
                ContentType: 'video/mp4'
              };
              const putResult = s3.putObject(destparams).promise(); 
              return(putResult);
            } catch (error) {
              return(error);
            } 
        }
        await uploadFile('intro/fullintro_' + nameString + '.mp4', introFile);
        await uploadFile('intro/finalframe_' + nameString + '.mp4', finalFile);
        await uploadFile('intro/blank_frame_' + nameString + '.mp4', blankFile);
    } else {
      response.statusCode = "400";
      response.body = 'Missing request paramter, "name", "email" or "video" is empty.';
      return response;
    }

    AWS.config.mediaconvert = {endpoint : 'https://lxlxpswfb.mediaconvert.us-east-1.amazonaws.com'};

    let params = {
      "Settings": {
        "AdAvailOffset": 0,
        "Inputs": [
          {
            "FilterEnable": "AUTO",
            "PsiControl": "USE_PSI",
            "FilterStrength": 0,
            "DeblockFilter": "DISABLED",
            "DenoiseFilter": "DISABLED",
            "InputScanType": "AUTO",
            "TimecodeSource": "ZEROBASED",
            "VideoSelector": {
              "ColorSpace": "FOLLOW",
              "Rotate": "DEGREE_0",
              "AlphaBehavior": "DISCARD"
            },
            "AudioSelectors": {
              "Audio Selector 1": {
                "Offset": 0,
                "DefaultSelection": "DEFAULT",
                "ProgramSelection": 1
              }
            },
            "FileInput": "s3://vod-acc-783786277162-us-east-1/intro/fullintro_" + nameString + ".mp4"
          },
          {
            "FilterEnable": "AUTO",
            "PsiControl": "USE_PSI",
            "FilterStrength": 0,
            "DeblockFilter": "DISABLED",
            "DenoiseFilter": "DISABLED",
            "InputScanType": "AUTO",
            "TimecodeSource": "ZEROBASED",
            "VideoSelector": {
              "ColorSpace": "FOLLOW",
              "Rotate": "DEGREE_0",
              "AlphaBehavior": "DISCARD"
            },
            "AudioSelectors": {
              "Audio Selector 1": {
                "Offset": 0,
                "DefaultSelection": "DEFAULT",
                "ProgramSelection": 1
              }
            },
            "FileInput": "s3://vod-acc-783786277162-us-east-1/vault/" + video + ""
          },
          {
            "FilterEnable": "AUTO",
            "PsiControl": "USE_PSI",
            "FilterStrength": 0,
            "DeblockFilter": "DISABLED",
            "DenoiseFilter": "DISABLED",
            "InputScanType": "AUTO",
            "TimecodeSource": "ZEROBASED",
            "VideoSelector": {
              "ColorSpace": "FOLLOW",
              "Rotate": "DEGREE_0",
              "AlphaBehavior": "DISCARD"
            },
            "AudioSelectors": {
              "Audio Selector 1": {
                "Offset": 0,
                "DefaultSelection": "DEFAULT",
                "ProgramSelection": 1
              }
            },
            "FileInput": "s3://vod-acc-783786277162-us-east-1/intro/finalframe_" + nameString + ".mp4"
          },
          {
            "FilterEnable": "AUTO",
            "PsiControl": "USE_PSI",
            "FilterStrength": 0,
            "DeblockFilter": "DISABLED",
            "DenoiseFilter": "DISABLED",
            "InputScanType": "AUTO",
            "TimecodeSource": "ZEROBASED",
            "VideoSelector": {
              "ColorSpace": "FOLLOW",
              "Rotate": "DEGREE_0",
              "AlphaBehavior": "DISCARD"
            },
            "AudioSelectors": {
              "Audio Selector 1": {
                "Offset": 0,
                "DefaultSelection": "DEFAULT",
                "ProgramSelection": 1
              }
            },
            "FileInput": "s3://vod-acc-783786277162-us-east-1/intro/blank_frame_" + nameString + ".mp4"
          }
        ],
        "OutputGroups": [
          {
            "Name": "HLS",
            "Outputs": [
              {
                "Preset": "Custom-Ott_Hls_Ts_Avc_Aac_16x9_1280x720_30fps_5000kbps",
                "NameModifier": "/Custom-Ott_Hls_Ts_Avc_Aac_16x9_1280x720_30fps_5000kbps"
              }
            ],
            "OutputGroupSettings": {
              "Type": "HLS_GROUP_SETTINGS",
              "HlsGroupSettings": {
                "ManifestDurationFormat": "INTEGER",
                "SegmentLength": 4,
                "TimedMetadataId3Period": 10,
                "CaptionLanguageSetting": "OMIT",
                "Destination": "s3://vod-acc-783786277162-us-east-1/output/hls/" + video + "-" + nameString + "",
                "TimedMetadataId3Frame": "PRIV",
                "CodecSpecification": "RFC_4281",
                "OutputSelection": "MANIFESTS_AND_SEGMENTS",
                "ProgramDateTimePeriod": 600,
                "MinSegmentLength": 0,
                "DirectoryStructure": "SINGLE_DIRECTORY",
                "ProgramDateTime": "EXCLUDE",
                "SegmentControl": "SEGMENTED_FILES",
                "ManifestCompression": "NONE",
                "ClientCache": "ENABLED",
                "StreamInfResolution": "INCLUDE"
              }
            }
          }
        ],
        "TimecodeConfig": {
          "Source": "ZEROBASED"
        }
      },
      "Queue": "arn:aws:mediaconvert:us-east-1:783786277162:queues/Default",
      "AccelerationSettings": {
        "Mode": "PREFERRED"
      },
      "Role": "arn:aws:iam::783786277162:role/vod-acc-MediaConvertJobRole-6IC8M31BPRFU",
      "UserMetadata": {
        "name": name,
        "email": email,
        "video": video
      }
    }

    // Create a promise on a MediaConvert object
    response.body = await new AWS.MediaConvert({apiVersion: '2017-08-29'}).createJob(params).promise();
    return response;
};