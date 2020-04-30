var currentvideo = '';
var bitrate = '';

function combinevideos(videos)
{
    var fs = require('fs');
    console.log("combining "+ videos.length +" videos");
    startLoading()
    var bin = 'resources\\ffmpeg\\bin\\ffmpeg.exe';
    if (!fs.existsSync(bin)) {
        var bin = 'ffmpeg\\bin\\ffmpeg.exe';
    }
    var ffmpeg = require('fluent-ffmpeg');
    ffmpeg.setFfmpegPath(bin);
    
    var mergedname = calcName();

    var command = '';
    var outpath = require('path').dirname(videos[0].path)+"\\cut\\";
    if (!fs.existsSync(outpath)){
        fs.mkdirSync(outpath);
    }

    outpath+=mergedname;

    for (let f of videos)
    {
        var path = f.path;
        if(command=='')
            command = ffmpeg(path);
        else 
            command.input(path);
    }

    command.on('error', function(err) {
        console.log('An error occurred: ' + err.message);
        endLoading()
    })
    .on('end', function() {
        console.log('Merging finished !');
        const {shell} = require('electron')

        shell.showItemInFolder(outpath);
        endLoading();
        $("#video").html('<h2>Finished!</h2>\
        <p>New video name: '+mergedname+'</p>\
        <p>Path: '+outpath+'</p>\
        <video\
            id="video-active"\
            class="video-active"\
            width="640"\
            height="390"\
            controls="controls">\
            <source src="'+outpath+'" type="video/mp4">\
        </video>');
    })
    .mergeToFile(outpath, '.');

    /*
    var command = ffmpeg('C:\\Users\\Chris\\Videos\\Tom Clancy\'s Rainbow Six  Siege\\val_trick_1.mp4')
    .input('C:\\Users\\Chris\\Videos\\Tom Clancy\'s Rainbow Six  Siege\\val_trick_2.mp4')
    .on('error', function(err) {
        console.log('An error occurred: ' + err.message);
        endLoading()
    })
    .on('end', function() {
        console.log('Merging finished !');
        endLoading()
    })
    .mergeToFile('C:\\Users\\Chris\\Videos\\Tom Clancy\'s Rainbow Six  Siege\\merged.mp4', '.');
    */
}

function loadVideo(file)
{
    var path = require('path').dirname(file);

    var ffmpeg = require('fluent-ffmpeg');
    ffmpeg.ffprobe(file,function(err, metadata) {
      bitrate = metadata.streams[0].bit_rate;
      console.log("Found bitrate of video! It's: "+bitrate);
    });
    
    currentvideo = file;
    console.log("loading "+file);
    var videotag = '<h2>Loaded "'+require('path').basename(file)+'"</h2>\
        <p>from path: '+path+'</p>\
        <video\
            id="video-active"\
            class="video-active"\
            width="640"\
            height="390"\
            controls="controls">\
            <source src="'+file+'" type="video/mp4">\
        </video>\
        <div class="row" style="margin-left:-15px;">\
            <div class="col-md-6">Name of the new Video:\
            <input type="text" id="newname" value="'+calcName()+'"/></div>\
            <div class="col-md-6">\
                <div id="current">0:00</div>\
                <div id="duration"> ~ 0:00</div>\
            </div>\
        </div>\
        <div class="row">\
        <button class="btn btn-success" onClick="setStarttime()">Set starttime</button> <input id="starttime" type="text" placeholder="Start Time"/>&nbsp;&nbsp;&nbsp;\
        <button class="btn btn-danger" onClick="setEndtime()">Set endtime</button> <input id="endtime" onChange="setDuration()" type="text" placeholder="Duration"/>\
        <button class="btn btn-warning" onClick="takeScreenshot()">Screenshot</button>\
        </div>\
        <div class="row" style="margin-left:-15px;">\
            <div class="col-md-4">Width:\
            <input type="text" id="newwidth" value="1280"/></div>\
            <div class="col-md-4">Height:\
            <input type="text" id="newheight" value="720"/></div>\
            <div class="col-md-4">Bitrate:\
            <input type="text" id="newbitrate" value=""/>kbps</div>\
        </div>\
        <div class="row">\
            <div class="col-md-6">\
                <div class="checkbox">\
                    <label><input id="nosound" type="checkbox" value="1">Remove sound</label>\
                </div>\
                <div class="checkbox">\
                    <label><input id="halfsize" type="checkbox" value="1">Half the resolution of the video</label>\
                </div>\
                <div class="checkbox">\
                    <label><input id="gif" type="checkbox" value="1">Create as gif (big files!)</label>\
                </div>\
                <div class="checkbox">\
                    <label><input id="fps" type="checkbox" value="1">Set to 30 FPS</label>\
                </div>\
                <div class="checkbox">\
                    <label><input id="nvenc" type="checkbox" value="1">(beta) Use GPU encoding</label>\
                </div>\
            </div>\
            <div class="col-md-6">\
                <div class="radio">\
                    <label><input type="radio" name="speedchange" value="4">Quater speed</label>\
                </div>\
                <div class="radio">\
                    <label><input type="radio" name="speedchange" value="2">Half speed</label>\
                </div>\
                <div class="radio">\
                    <label><input type="radio" name="speedchange" checked value="1">Normal speed</label>\
                </div>\
                <div class="radio">\
                    <label><input type="radio" name="speedchange" value="0.5">2x faster</label>\
                </div>\
                <div class="radio">\
                    <label><input type="radio" name="speedchange" value="0.25">4x faster</label>\
                </div>\
            </div>\
        </div>\
        <button class="btn btn-primary cutBtn" onClick="cutIt()">Output preview</button>\
        <div class="clear"></div>\
        ';
    $("#video").html(videotag);

    $("#video-active").on(
    "timeupdate", 
    function(event){
      onTrackedVideoFrame(this.currentTime, this.duration);
    });
}

function calcName()
{
    var Sentencer = require('sentencer');
    return Sentencer.make("{{ noun }}{{ noun }}")+'.mp4';
}

function takeScreenshot() {
    var fs = require('fs');
    console.log("starting the cutting");
    var cmd=require('node-cmd');
    var bin = 'resources\\ffmpeg\\bin\\ffmpeg.exe';
    var bin2 = 'resources\\ffmpeg\\bin\\ffprobe.exe';
    if (!fs.existsSync(bin)) {
        var bin = 'ffmpeg\\bin\\ffmpeg.exe';
        var bin2 = 'ffmpeg\\bin\\ffprobe.exe';
    }
    
    var path = require('path').dirname(currentvideo)+"\\cut";
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }
    path = path + "\\screenshots";
    var imgWidth = $("#newwidth").val();
    var imgHeight = $("#newheight").val();
    var imgSize = imgWidth + 'x' + imgHeight;
    var currentTime = parseFloat($("#current").text());
    var strCurTime = makeStrCurTime(currentTime);
    console.log("selected time:", strCurTime);

    var ffmpeg = require('fluent-ffmpeg');
    ffmpeg.setFfmpegPath(bin);
    ffmpeg.setFfprobePath(bin2);
    var proc = ffmpeg(currentvideo);
        // setup event handlers
    proc.on('filenames', function(filenames) {
            console.log('screenshots are ' + filenames.join(', '));
        })
        .on('end', function() {
            console.log('screenshots were saved');
        })
        .on('error', function(err) {
            console.log('an error happened: ' + err.message);
        })
        .screenshot({ count: 0, timemarks: [ currentTime], filename: '%b-thumbnail-%i-%r-%s.bmp', size: imgSize }, path);
}

function makeStrCurTime(curtime) {
    var returnStr = "";
    if (curtime/3600 > 0) {
        returnStr = "0" + Math.floor(curtime/3600);
        var f1 = curtime - 3600 * Math.floor(curtime/3600);
        if (f1/60 > 10) {
            returnStr = returnStr + ':' + Math.floor(f1/60);
            var f2 = f1 - 60 * Math.floor(f1/60);
            if (f2 > 10) {
                returnStr = returnStr + ":" + f2;
            } else {
                returnStr = returnStr + ":0" + f2;
            }
        } else {
            returnStr = returnStr + ":0" + Math.floor(f1/60);
            var f2 = f1 - 60 * Math.floor(f1/60);
            if (f2 > 10) {
                returnStr = returnStr + ":" + f2;
            } else {
                returnStr = returnStr + ":0" + f2;
            }
        }
    } else if (curtime/60 > 0) {
        if (curtime/60 > 10) {
            returnStr = "00:" + Math.floor(curtime/60);
        } else {
            returnStr = "00:0" + Math.floor(curtime/60);
        }
        var flag = curtime - 60 * Math.floor(curtime/60);
        if (flag > 10) {
            returnStr = returnStr + ":" + flag;
        } else {
            returnStr = returnStr + ":0" + flag;
        }
    } else {
        returnStr = "00:00:";
        if (curtime > 10) {
            returnStr = returnStr + curtime;
        } else {
            returnStr = returnStr + ":" + curtime;
        }
    }
}

function cutIt()
{
    var fs = require('fs');
    console.log("starting the cutting");
    startLoading()
    var cmd=require('node-cmd');
    var bin = 'resources\\ffmpeg\\bin\\ffmpeg.exe';
    var bin2 = 'resources\\ffmpeg\\bin\\ffprobe.exe';
    if (!fs.existsSync(bin)) {
        var bin = 'ffmpeg\\bin\\ffmpeg.exe';
        var bin2 = 'ffmpeg\\bin\\ffprobe.exe';
    }
    
    var path = require('path').dirname(currentvideo)+"\\cut";
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }

    var starttime = parseFloat($("#starttime").val());
    var duration = parseFloat($("#endtime").val());
    var outfile = path+'\\'+ $("#newname").val() ;
    var newwidth = $('#newwidth').val();
    var newheight = $('#newheight').val();
    var newbitrate = $('#newbitrate').val();

    var ffmpeg = require('fluent-ffmpeg');
    var command = ffmpeg(currentvideo);
    command.setFfmpegPath(bin);
    command.setFfprobePath(bin2);

    var noaudio = false;

    if(document.getElementById('gif').checked)
    {
        outfile+='.gif';
        command.fps(15).size('640x?');
        noaudio = true;
    }

    if (newwidth != '' && newheight != '') {
        command.withSize(newwidth+'x'+newheight);
        var aspectRatio = Math.round(newwidth / newheight);
        command.withAspectRatio(aspectRatio);
        command.withVideoFilters('scale='+newwidth+':'+newheight+',setsar=1');
    }

    if(document.getElementById('nosound').checked)
    {
        command.noAudio();
        noaudio = true;
    }

    if(newbitrate != '')  
        command.withVideoBitrate(newbitrate+'k');

    if(document.getElementById('fps').checked && !document.getElementById('gif').checked)
        command.fps(30);
        
    if(document.getElementById('halfsize').checked && !document.getElementById('gif').checked)
        command.size('50%');

    if(document.getElementById('nvenc').checked && !document.getElementById('gif').checked)
        command.videoCodec('h264_nvenc').videoBitrate('6986k')

    var playbackspeed = parseFloat($('input[name="speedchange"]:checked').val());
    //if(playbackspeed!=1)
    //    command.noAudio();

    if(noaudio === false)
        switch(playbackspeed)
        {
            case 2: //half
                command.audioFilters('atempo=0.5')
            break;
            case 4: //quater
                command.audioFilters('atempo=0.5,atempo=0.5')
            break;
            case 0.5: //double
                command.audioFilters('atempo=2')
            break;
            case 0.25: //quatripple
                command.audioFilters('atempo=2,atempo=2')
            break;
        }


    //var command = bin+" -y -i \""+currentvideo+"\" -ss "+ starttime + " -t "+ (duration*playbackspeed) + commandattachments;
    

    //command+=" "+'"'+outfile+'"';

    command.output(outfile).seek(starttime*playbackspeed).duration(duration*playbackspeed)
        .videoFilters('setpts='+playbackspeed+'*PTS')
        .on('end', function() {
        console.log('Finished processing');
        const {shell} = require('electron')
        shell.showItemInFolder(outfile);
        endLoading();
      }).on('progress', function(progress) {
        setProgress(progress.percent);
        console.log('Processing: ' + progress.percent + '% done');
      })
      .run();

    //console.log(command);

    /*
    cmd.get(
            command,
            function(data){
                console.log('finito',data);
                if(document.getElementById('pictshare').checked)
                    uploadFileToPictshare(outfile);
                else 
                    endLoading();
                const {shell} = require('electron')
                shell.showItemInFolder(outfile);
            }
        );
    */
}

function setProgress(value) {
    var elem = document.getElementById("progressbar"); 
    var width = 1;
    elem.style.width = Math.round(value) + '%'; 
    elem.innerHTML = Math.round(value) + '%';
}

function startLoading()
{
    $('#myModal').modal('show');
    $("#loading").html(getSpinner(true));
}

function endLoading()
{
    $('#myModal').modal('hide');
    $("#loading").html("");
}

function setStarttime()
{
    $("#starttime").val($("#current").text());
}

function setEndtime()
{
    var starttime = parseFloat($("#starttime").val());
    var current = parseFloat($("#current").text());
    $("#endtime").val(current-starttime);
}

function setDuration() {
    // $("#endtime").val(this.val()+1);
    // alert(this.val()+1);
}

function uploadFileToPictshare(file)
{
    $("#loadingtext").html('Uploading to PictShare');
    console.log("uploading to pictshare");
  var req = require('request').post('https://pictshare.net/backend.php', function (err, resp, body) {
  if (err) {
    console.log('Error!');
  } else {
    console.log('URL: ' + body);
    var o = JSON.parse(body);
    if(o.hash===undefined || !o.hash){
        endLoading()
        return false;
    }
    var url = 'https://pictshare.net/'+o.hash;
    const {shell} = require('electron')
    shell.openExternal(url);
    endLoading()
    }
  });
  var form = req.form();
  form.append('postimage', require('fs').createReadStream(file), {
    filename: 'postimage',
    contentType: 'text/plain'
  });
}