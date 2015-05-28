/**
 * Created by Raf on 28/05/2015.
 */

var uploading = false;
$("#optionsContent").on('click', '#theImages', function () {
    if(!uploading) {
        $('#fileupload').trigger("click");
    }
});

$("#optionsContent").on('change','#fileupload', function () {
    uploading = true;
    var test = $(document).find('#fileupload');
    var fd = new FormData();
    fd.append("file", test[0].files[0]);
    var bar = $(".progress-bar");
    var outerbar = $(".progress");
    bar.css("width", 0);
    outerbar.show("slide", { direction: "up" }, 750);

    $.ajax({
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    console.log("Percentage: "+percentComplete);
                    percentComplete = (percentComplete) * 150;
                   console.log("Me: " + percentComplete);
                    bar.css("width", percentComplete)
                }
            }, false);
            return xhr;
        },
        type: "POST",
        accept: "application/json",
        processData:false,
        contentType:false,
        data: fd,
        crossDomain: true,
        url: serverIP + "/api/upload/image?session_id="+  String($.session.get('sessionID')),
        success: function (data) {
            outerbar.hide("slide", { direction: "down" }, 750);
            uploading = false;
            data = JSON.parse(data);
            var directory =  serverIP + "/images/"+ data.filename;
            $("#theImages").attr("src", directory);
            resaleAgain($("#theImages"));

        },
        error: function (xhr, textStatus, errorThrown) {
            uploading = false;
            showPopup(false);
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
    //TODO: IMAGE POSTEN
});

function resaleAgain(image){
    var theImage = new Image();
    theImage.src = image.attr("src");

    var imageWidth = theImage.width;
    var imageHeight = theImage.height;

    var resizeNumber = imageWidth/200;
    imageHeight = imageHeight/resizeNumber;
    image.attr("width",200);
    image.attr("height", imageHeight);
}