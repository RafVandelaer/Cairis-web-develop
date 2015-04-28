/**
 * Created by Raf on 24/04/2015.
 */
window.serverIP = "http://192.168.112.129:7071";
//var yetVisited = localStorage['visited'];


$( document ).ready(function() {
  //  localStorage.removeItem('sessionID');
    var sessionID = $.session.get('sessionID');
    if(!sessionID){
        dialogwindow.dialog( "open" )
    }
    else{
        //Else we can show the table
       startingTable();
    }


});

//The config window at start
var dialogwindow = $( "#dialogContent" ).dialog({
    autoOpen: false,
    modal: true,
    buttons: {
        OK: function() {

            $.ajax({
                type: 'POST',
                url: serverIP + '/user/config',
                data: $('#configForm').serializeArray(),
                accept:"application/json",
                success: function(data, status, xhr) {
                    // console.log("DB Settings saved");
                    console.log(data);
                    sessionID = data.split("=")[1];
                    $.session.set("sessionID", sessionID);
                   startingTable();

                },
                error: function(data, status, xhr) {
                    var err = eval("(" + xhr.responseText + ")");
                    alert(err.message);
                }
            });

            /*$('#response').html('The value entered was ' + $('#myInput').val());
             record.find('.name').html($('#myInput').val());*/
            $( this ).dialog( "close" );
        },
        Cancel: function() {
            $( this ).dialog( "close" );
            $( "#errorDialog" ).dialog();
        }
    }
});

//Just for debug
$("#testingButton").click(function(){

});

//For debug
$("#removesessionButton").click(function() {
    $.session.remove('sessionID');
    location.reload();
});
// For the assetsbox, if filter is selected
$('#assetsbox').change(function() {
    var selection = $(this).find('option:selected').text();
    console.log("Selection: " + selection);
    // Clearing the environmentsbox
    $('#environmentsbox').prop('selectedIndex', -1);

        if (selection.toLowerCase() == "all") {
            startingTable();
        } else {
            $.ajax({
                type: "GET",
                dataType: "json",
                accept: "application/json",
                data: {
                    session_id: String($.session.get('sessionID'))
                },
                crossDomain: true,
                url: serverIP + "/api/requirements/filter/" + encodeURIComponent(selection),
                success: function (data) {
                    createRequirementsTable(data);
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log(this.url);
                    var err = eval("(" + xhr.responseText + ")");
                    //alert(err.message);
                    console.log("error: " + err + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                }

            });
        }

});
/*
When assetview is clicked
 */
$('#assetView').click(function(){

    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            //session_id: String($.session.get('sessionID')),
            //TODO: aanpassen session
            session_id: "test"
        },
        crossDomain: true,
        url: serverIP + "/api/environments/names",
        success: function (data) {
            $("#comboboxDialogSelect").empty();
            $.each(data, function(i, item) {
                $("#comboboxDialogSelect").append("<option value=" + item + ">"  + item + "</option>")
            });
            $( "#comboboxDialog" ).dialog({
                modal: true,
                buttons: {
                    Ok: function() {
                        $( this ).dialog( "close" );
                        //Created a function, for readability
                        getAssetview($( "#comboboxDialogSelect").find("option:selected" ).text());
                    }
                }
            });
            $(".comboboxD").css("visibility","visible");
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(this.url);
            var err = eval("(" + xhr.responseText + ")");
            //alert(err.message);
            console.log("error: " + err + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
})});
function getAssetview(environment){
    $.ajax({
        type:"GET",
        accept:"text/plain",
        //TODO: change session_id
        data: {
            environment: environment,
            session_id: "test"
        },
        crossDomain: true,
        url: serverIP + "/api/assets/view",
        success: function(data){
           // console.log(data.lastElementChild);
            console.log(this.url);
            svgDiv =  $("#svgViewer");
            svgDiv.css("visibility","visible");
            svgDiv.css("height",$("#maincontent").height());
            svgDiv.css("width","100%");
            svgDiv.html(data);
            $("svg").attr("id","svg-id");
            activeElement("svgViewer");
            panZoomInstance = svgPanZoom('#svg-id', {
                zoomEnabled: true,
                controlIconsEnabled: true,
                fit: true,
                center: true,
                minZoom: 0.1
            })

        },
        error: function(xhr, textStatus, errorThrown) {
            console.log(this.url);
            var err = eval("(" + xhr.responseText + ")");
            //alert(err.message);
            console.log("error: " + err + ", textstatus: "  +textStatus + ", thrown: "+ errorThrown);
        }

    });
}

/*
Same for the environments
 */
$('#environmentsbox').change(function() {
    var selection = $(this).find('option:selected').text();
    // Clearing the assetsbox
    $('#assetsbox').prop('selectedIndex', -1);

        if (selection.toLowerCase() == "all") {
            startingTable();
        } else {
            //Assetsbox
            $.ajax({
                type: "GET",
                dataType: "json",
                accept: "application/json",
                data: {
                    session_id: String($.session.get('sessionID')),
                    is_asset: 0
                },
                crossDomain: true,
                url: serverIP + "/api/requirements/filter/" + encodeURIComponent(selection),
                success: function (data) {
                    createRequirementsTable(data);
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log(this.url);
                    var err = eval("(" + xhr.responseText + ")");
                    //alert(err.message);
                    console.log("error: " + err + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                }

            });
        }

});
/*
A function for filling the table
 */
function createRequirementsTable(data){
     var tre;
    $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    $.each(data, function(index, item) {
        var name = " ";
        var desc = " ";
        if(item.theName.trim()){
            name = item.theName;
        }
        if(item.theDescription.trim()){
            desc = item.theDescription;
        }

        tre = $('<tr>');
        tre.append("<td name='theLabel' >" + item.theLabel + "</td>");
        tre.append("<td name='theName'  contenteditable=true>" + name + "</td>");
        tre.append("<td name='theDescription'  contenteditable=true>" + desc + "</td>");
        tre.append("<td name='thePriority'  contenteditable=true>" + item.thePriority + "</td>");


        var datas = eval(item.attrs); // this will convert your json string to a javascript object
        for (var key in datas) {
            if (datas.hasOwnProperty(key)) {
                if(key == ("originator") | key == ("rationale") | key == ("fitCriterion") | key == ("type")) {
                    // alert(key+': '+datas[key]); // this will show each key with it's value
                    tre.append("<td name=" + key + " contenteditable=true >" + datas[key] + "</td>");
                }
            }
        }
        tre.append('</tr>')
        $('.theTable').append(tre);
    });

    $('.theTable').css("visibility","visible");
}
/*
Function for adding a row to the table
 */
$("#addReq").click(function() {
    var clonedRow = $("#reqTable tr:last").clone();
    if(clonedRow.has("th")){
        // if no tr, I'm creating an row from a template
        console.log("No row");
        var template = '<tr> <td name="theLabel"></td> <td name="theName" contenteditable="true"></td> <td name="theDescription" contenteditable="true"></td> <td name="thePriority" contenteditable="true">1</td> <td name="originator" contenteditable="true"></td> <td name="fitCriterion" contenteditable="true">None</td> <td name="rationale" contenteditable="true">None</td> <td name="type" contenteditable="true">Functional</td> </tr>';
        $("#reqTable").append(template);
    }else {
        console.log("A row");
        $("#reqTable").append(clonedRow);
        $('#reqTable tr:last td').each(function() {

            $(this).html("");
            $(this).each(function(){
                console.log("Jup")
            });
        });
    }


});

/*
Removing the active tr
 */
$("#removeReq").click(function() {
    var oldrow = $("tr").eq(getActiveindex() + 1).detach();
    //of remove
    //TODO: AJAX CALL BEFORE REMOVE
});
/*
Function for creating the comboboxes
 */
function createComboboxes(){

    //Assetsbox
   $.ajax({
           type:"GET",
           dataType: "json",
           accept:"application/json",
           data: {session_id: String($.session.get('sessionID'))},
           crossDomain: true,
       //Had to be sync, otherwise cherrypy could crash
            async: false,
            url: serverIP + "/api/assets/all",

            success: function(data){
                // we make a successful JSONP call!
                var options = $("#assetsbox");
                $.each(data, function() {
                    options.append($("<option />").val(this).text(this));
                });
                $(".topCombobox").css("visibility", "visible");
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log(this.url);
                var err = eval("(" + xhr.responseText + ")");
                //alert(err.message);
                console.log("error: " + err + ", textstatus: "  +textStatus + ", thrown: "+ errorThrown);
             }

        });
    //RequirementsBox
    $.ajax({
        type:"GET",
        dataType: "json",
        async: false,
        accept:"application/json",
        data: {session_id: String($.session.get('sessionID'))},
        crossDomain: true,
        url: serverIP + "/api/environments/all/names",

        success: function(data){
            // we make a successful JSONP call!
            var boxoptions = $("#environmentsbox");
            $.each(data, function() {
                boxoptions.append($("<option />").val(this).text(this));
            });
            boxoptions.css("visibility", "visible");
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log(this.url);
            var err = eval("(" + xhr.responseText + ")");
            //alert(err.message);
            console.log("error: " + err + ", textstatus: "  +textStatus + ", thrown: "+ errorThrown);
        }

    });

   /* }))).map(function () {
        return $('<option>').val(this.value).text(this.label);
    }).appendTo('#assetsbox');*/
}
function startingTable(){
    createComboboxes();
    $.ajax({
        type:"GET",
        dataType: "json",
        accept:"application/json",
        data: {session_id: String($.session.get('sessionID'))},
        crossDomain: true,
        url: serverIP + "/api/requirements/all",

        success: function(data) {
            // $("#test").append(JSON.stringify(data));
            createRequirementsTable(data);
            activeElement("reqTable");
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log(this.url);
            var err = eval("(" + xhr.responseText + ")");
            //alert(err.message);
            console.log("error: " + err + ", textstatus: "  +textStatus + ", thrown: "+ errorThrown);
        }
    });
}
/*
This is for saying which element has the main focus
 */
function activeElement(elementid){
    if(elementid != "reqTable"){
        $("#reqTable").hide();
    }
    if(elementid != "svgViewer"){
        $("#svgViewer").hide();
    }
    elementid = "#" + elementid;
    $(elementid).show();

}










