/**
 * Created by Raf on 3/06/2015.
 */

$("#editProjectsClick").click(function () {
    getProjectSettings(function (data) {
        fillOptionMenu("fastTemplates/editProjectSettings.html", "#optionsContent", null, true, false, function () {
            forceOpenOptions();
            var image = $("#theImages");
            $('#ProjectsProperties').loadJSON(data, null);
            image.attr("src", getImagedir(data.richPicture));
            resaleImage(image,350);
            //definitions
            $.each(data.definitions, function (key, def) {
                appendNamingConvention(key,def);
            });
            $.each(data.contributions, function (index, contributor) {
                appendContributor(contributor);
            });
            $.each(data.revisions, function (index, rev) {
                editProjectRevisions(rev);
            });
        });
    });

});

function getProjectSettings(callback){
    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/settings",
        success: function (data) {
            $.session.set("ProjectSettings", JSON.stringify(data));
            if(jQuery.isFunction(callback)){
                callback(data);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }

    });
}
/*
 Image uploading functions
 */
var uploading = false;
var optionsContent = $("#optionsContent");
//TODO FALSE
optionsContent.on('click', '#theImages', function () {
    if(!uploading) {
        $('#projectSettingsUpload').trigger("click");
    }
    //TODO
    else if($("#addAttackerPropertyDiv").hasClass("new")){
        alert("First, update the attacker.");
    }
});

optionsContent.on('change','#projectSettingsUpload', function () {
    uploading = true;
    var test = $(document).find('#projectSettingsUpload');
    var fd = new FormData();
    fd.append("file", test[0].files[0]);
    var bar = $(".progress-bar");
    var outerbar = $(".progress");
    bar.css("width", 0);
    outerbar.show("slide", { direction: "up" }, 750);

    $.ajax({
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
            postProjectImage(data.filename, getImagedir(data.filename));
        },
        error: function (xhr, textStatus, errorThrown) {
            uploading = false;
            outerbar.hide("slide", { direction: "down" }, 750);
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        },
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function(evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    percentComplete = (percentComplete) * outerbar.width();
                    bar.css("width", percentComplete)
                }
            }, false);
            return xhr;
        }
    });

});
function postProjectImage(imagedir, actualDir) {
    var settings = JSON.parse($.session.get("ProjectSettings"));

    settings.richPicture = imagedir;
    //TODO put SETTINS
    var theImage = $("#theImages");
   putProjectSettings(settings, function () {
       theImage.attr("src", actualDir);
        resaleImage(theImage, 350);
    });

    $.session.set("ProjectSettings", JSON.stringify(settings));

}
function appendNamingConvention(name,def){
    $("#editNamingConventionsTable").find("tbody").append("<tr><td class='removeProjectNamingConvertion' ><i class='fa fa-minus'></i></td><td class='namingConvention'>" + name + "</td><td>"+ def + "</td></tr>");
}
function appendContributor(con){
    $("#editContributorTable").find("tbody").append("<tr><td class='removeContributorn' ><i class='fa fa-minus'></i></td><td class='projectContributor'>" + con.firstName + "</td><td>"+ con.surname + "</td><td>"+ con.affliation + "</td><td>"+ con.role +"</td></tr>");
}
function editProjectRevisions(rev){
    $("#editProjectRevisions").find("tbody").append("<tr><td></td><td class='projectRevision'>" + rev.id + "</td><td>"+ rev.date + "</td><td>"+ rev.description + "</td></tr>");
}