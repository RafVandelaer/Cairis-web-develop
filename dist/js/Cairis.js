/**
 * Created by Raf on 24/04/2015.
 */
window.serverIP = "http://192.168.112.129:7071";
window.activeTable ="Requirements";

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

            var json_text = JSON.stringify($('#configForm').serializeObject());
            var portArr  = json_text.match('port":"(.*)","user');
            var port = portArr[1];
            json_text = json_text.replace('"'+port+'"',port);
            console.log(json_text);
            $.ajax({
                type: 'POST',
                url: serverIP + '/api/user/config',
               // data: $('#configForm').serializeArray(),
                data: json_text,
                accept:"application/json",
                contentType : "application/json",
                success: function(data, status, xhr) {
                    // console.log("DB Settings saved");
                    console.log(data);
                    sessionID = data.split("=")[1];
                    $.session.set("sessionID", sessionID);
                   startingTable();

                },
                error: function(data, status, xhr) {
                    var err = eval("(" + xhr.responseText + ")");
                    console.log("error: " + err + ", textstatus: " + status + ", data: " + JSON.stringify(data));
                    alert("There is a problem with the server...");
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

/*
For converting the form in JSON
 */
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

//Just for debug
$("#testingButton").click(function(){
    findLabel();
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
                url: serverIP + "/api/requirements/asset/" + encodeURIComponent(selection),
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
            session_id: String($.session.get('sessionID'))

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
        data: {
            environment: environment,
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/assets/view",
        success: function(data){
           fillSvgViewer(data);

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
                url: serverIP + "/api/requirements/environment/" + encodeURIComponent(selection),
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

        tre = $('<tr>');
        tre.append("<td name='theLabel' >" + item.theLabel + "</td>");
        tre.append("<td name='theName'  contenteditable=true>" + item.theName + "</td>");
        tre.append("<td name='theDescription'  contenteditable=true>" + item.theDescription + "</td>");
        tre.append("<td name='thePriority'  contenteditable=true>" + item.thePriority + "</td>");
        tre.append("<td name='theId'  style='display:none;'>" + item.theId + "</td>");


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
$("#addRow").click(function() {
    //var clonedRow = $("#reqTable tr:last").clone();
    if($( "#assetsbox").find("option:selected" ).text() == "All" && $( "#environmentsbox").find("option:selected" ).text() == "All"){
        alert("Please select an asset or an environment");
    }
    else{
        var template = "";
        var num = findLabel();
        switch (window.activeTable) {
            case "Requirements":
                template = '<tr> <td name="theLabel">' + num + '</td> <td name="theName" contenteditable="true"></td> <td name="theDescription" contenteditable="true"></td> <td name="thePriority" contenteditable="true">1</td><td name="theId" style="display:none;"></td><td name="originator" contenteditable="true"></td> <td name="fitCriterion" contenteditable="true">None</td> <td name="rationale" contenteditable="true">None</td> <td name="type" contenteditable="true">Functional</td> </tr>';
                break;
            case "Goals":
                template = '<tr><td name="theLabel">' + num + '</td><td name="theName" contenteditable="true" ></td><td name="theDefinition" contenteditable="true"></td><td name="theCategory" contenteditable="true">Maintain</td><td name="thePriority" contenteditable="true">Low</td><td name="theId" style="display:none;"></td><td name="fitCriterion" contenteditable="true" >None</td><td  name="theIssue" contenteditable="true">None</td><td name="originator" contenteditable="true"></td></tr>';
                break;
            case "Obstacles":
                template = '<tr><td name="theLabel">' + num + '</td><td name="theName" contenteditable="true">Name</td><td name="theDefinition" contenteditable="true">Definition</td><td name="theCategory" contenteditable="true">Category</td><td name="theId" style="display:none;"></td><td name="originator" contenteditable="true">Originator</td></tr>';
                break;
        }
        $("#reqTable").append(template);
        sortTable();
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

$("#gridReq").click(function(){
  startingTable();
});

/*
Function for creating the comboboxes
 */
function createComboboxes(){
var sess = String($.session.get('sessionID'));
    //Assetsbox
   $.ajax({
           type:"GET",
           dataType: "json",
           accept:"application/json",
           data: {session_id: sess
            },
           crossDomain: true,
       //Had to be sync, otherwise cherrypy could crash
           // async: false,
            url: serverIP + "/api/assets/all/names",

            success: function(data){
                // we make a successful JSONP call!
                var options = $("#assetsbox");
                $.each(data, function() {
                    options.append($("<option />").val(this).text(this));
                });
                $(".topCombobox").css("visibility", "visible");
                reqAjax();
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log(this.url);
                var err = eval("(" + xhr.responseText + ")");
                //alert(err.message);
                console.log("error: " + err + ", textstatus: "  +textStatus + ", thrown: "+ errorThrown);
             }

        });

    function reqAjax(){
        $.ajax({
            type:"GET",
            dataType: "json",
            // async: false,
            accept:"application/json",
            data: {session_id: sess

            },
            crossDomain: true,
            url: serverIP + "/api/environments/names",

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

        })
    }

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
            setTableHeader("Requirements");
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
        $("#filtercontent").hide();
    }
    if(elementid != "svgViewer"){
        $("#svgViewer").hide();
    }

    if(elementid == "reqTable"){
        $("#filtercontent").show();
    }
    elementid = "#" + elementid;
    $(elementid).show();

}
/*
function for setting the table head
 */
function setTableHeader(){
    thead = "";

    switch (window.activeTable) {
        case "Requirements":
            console.log("Is Requirement");
            thead = "<th width='50px'></th><th>Name</th><th>Description</th><th>Priority</th><th>Rationale</th><th>Fit Citerion</th><th>Originator</th><th>Type</th>";
            break;
        case "Goals":
            console.log("Is Goal");
            thead = "<th width='50px'></th><th>Name</th><th>Definition</th><th>Category</th><th>Priority</th><th>Fit Citerion</th><th>Issue</th><th>Originator</th>";
            break;
        case "Obstacles":
            console.log("Is Obstacle");
            thead = "<th width='50px'></th><th>Name</th><th>Definition</th><th>Category</th><th>Originator</th>";
            break;
    }
    $("#reqTable").find("thead").empty();
    $("#reqTable").find("thead").append(thead);

}

/*
for filling up the SVG viewer
 */
function fillSvgViewer(data){
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
        minZoom: 0.2
    })
}

/*
finding the lowest label in the table
 */
function findLabel() {
    var numbers = [];
    var index = 0;
    $("tbody").find("tr").each(function () {
        numbers[index] = parseInt($(this).find("td:first").text());
        index++;

    });
    numbers.sort();
    var number = numbers.length + 1;
    for(var i =0; i < numbers.length; i++){
        if(i+1 !=numbers[i]){
          // console.log(i+1 + " is the number");
            return i+1;
        }
    }
   // console.log(i+1 + " is the number");
    return i+1;
}

function sortTable(){
    var tbl = document.getElementById("reqTable").tBodies[0];
    var store = [];
    for(var i=0, len=tbl.rows.length; i<len; i++){
        var row = tbl.rows[i];
        var sortnr = parseFloat(row.cells[0].textContent || row.cells[0].innerText);
        if(!isNaN(sortnr)) store.push([sortnr, row]);
    }
    store.sort(function(x,y){
        return x[0] - y[0];
    });
    for(var i=0, len=store.length; i<len; i++){
        tbl.appendChild(store[i][1]);
    }
    store = null;
}