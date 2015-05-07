/**
 * Created by Raf on 24/04/2015.
 */
window.serverIP = "http://192.168.112.130:7071";
window.activeTable ="Requirements";
window.boxesAreFilled = false;

//var yetVisited = localStorage['visited'];

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



$(document).ready(function() {
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
function getAssetview(environment){
    window.assetEnvironment = environment;
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
          // console.log("in getAssetView " + data.innerHTML);
           // console.log(this.url);
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
A function for filling the table with requirements
 */
function createRequirementsTable(data){
    var tre;
    var theTable = $(".theTable");
    $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    //var arr = reallyLongArray;
    var textToInsert = [];
    var theRows = [];
    var i = 0;
    var j = 0;
    $.each(data, function(count, item) {
        textToInsert[i++] = '<tr><td name="theLabel">';
        textToInsert[i++] = item.theLabel;
        textToInsert[i++] = '<'+'/td>';

        textToInsert[i++] = '<td name="theName" contenteditable=true>';
        textToInsert[i++] = item.theName;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theDescription" contenteditable=true>';
        textToInsert[i++] = item.theDescription;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="thePriority"  contenteditable=true>';
        textToInsert[i++] = item.thePriority;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theId"  style="display:none;">';
        textToInsert[i++] = item.theId;
        textToInsert[i++] = '</td>';

        var datas = eval(item.attrs);
        for (var key in datas) {
            if (datas.hasOwnProperty(key)) {
                if(key == ("originator") || key == ("rationale") || key == ("fitCriterion") || key == ("type")) {
                    // alert(key+': '+datas[key]); // this will show each key with it's value
                    // tre.append("<td name=" + key + " contenteditable=true >" + datas[key] + "</td>");
                    textToInsert[i++] = '<td name=';
                    textToInsert[i++] = key;
                    textToInsert[i++] = ' contenteditable=true >';
                    textToInsert[i++] = datas[key];
                    textToInsert[i++] = '</td>';

                }
            }
        }
        textToInsert[i++] = '</tr>';
    });

    // theRows[j++]=textToInsert.join('');
    theTable.append(textToInsert.join(''));

    theTable.css("visibility","visible");
}

/*
 A function for filling the table with requirements
 */
function createEditGoalsTable(data){
    var theTable = $(".theTable");
    $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    //var arr = reallyLongArray;
    var textToInsert = [];
    var i = 0;

    $.each(data, function(count, item) {
        textToInsert[i++] = "<tr>"
        textToInsert[i++] = '<td name="theName" contenteditable=true>';
        textToInsert[i++] = item.theName;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theOriginator" contenteditable=true>';
        textToInsert[i++] = item.theOriginator;
        textToInsert[i++] = '</td>';

       textToInsert[i++] = '<td name="Status"  contenteditable=true>';
        if(item.theColour == 'black'){
            textToInsert[i++] = "Check";
        }else if(item.theColour == 'red'){
            textToInsert[i++] = "To refine";
        }else{
            textToInsert[i++] = "OK";
        }

        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theId"  style="display:none;">';
        textToInsert[i++] = item.theId;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '</tr>';
    });

    // theRows[j++]=textToInsert.join('');
    theTable.append(textToInsert.join(''));

    theTable.css("visibility","visible");
}

function createAssetsTable(data){

    var theTable = $(".theTable");
    var textToInsert = [];
    var i = 0;

    //var thedata = $.parseJSON(data);
    $.each(data, function(count, item) {
        textToInsert[i++] = "<tr>"

        textToInsert[i++] = '<td><button class="editAssetsButton" value="' + item.theName + '">' + 'Edit' + '</button></td>';

        textToInsert[i++] = '<td name="theName">';
        textToInsert[i++] = item.theName;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theType">';
        textToInsert[i++] = item.theType;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theId" style="display:none;">';
        textToInsert[i++] = item.theId;
        textToInsert[i++] = '</td>';
        textToInsert[i++] = '</tr>';


    });
    theTable.append(textToInsert.join(''));

}

/*
Function for creating the comboboxes
 */
function createComboboxes(){
var sess = String($.session.get('sessionID'));
    //Assetsbox
    if(!window.boxesAreFilled) {
        $.ajax({
            type: "GET",
            dataType: "json",
            accept: "application/json",
            data: {
                session_id: String($.session.get('sessionID'))
            },
            crossDomain: true,
            url: serverIP + "/api/assets/all/names",

            success: function (data) {
                // we make a successful JSONP call!
                var options = $("#assetsbox");
                options.empty();
                options.append("<option>All</option>");
                $.each(data, function () {
                    options.append($("<option />").val(this).text(this));
                });
                $(".topCombobox").css("visibility", "visible");

            },
            error: function (xhr, textStatus, errorThrown) {
                console.log(this.url);
                var err = eval("(" + xhr.responseText + ")");
                console.log("error: " + err + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
            }

        });
        $.ajax({
            type: "GET",
            dataType: "json",
            // async: false,
            accept: "application/json",
            data: {
                session_id: String($.session.get('sessionID'))
            },
            crossDomain: true,
            url: serverIP + "/api/environments/all/names",

            success: function (data) {
                var boxoptions = $("#environmentsbox");
                boxoptions.empty();
                boxoptions.append("<option>All</option>");
                $.each(data, function () {
                    boxoptions.append($("<option />").val(this).text(this));
                });
                boxoptions.css("visibility", "visible");
                window.boxesAreFilled = true;
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log(this.url);
                var err = eval("(" + xhr.responseText + ")");
                //alert(err.message);
                console.log("error: " + err + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
            }

        });
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
        crossDomain: true,
        url: serverIP + "/api/requirements",
        data: {session_id: String($.session.get('sessionID'))},
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
       //If it is the table, we need to see which table it is
        setActiveOptions();
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
        case "EditGoals":
            console.log("Is EditGoals");
            thead = "<th>Name</th><th>Originator</th><th>Status</th>";
            break;
        case "Assets":
            console.log("Is Asset");
            thead = "<th width='50px'></th><th>Name</th><th>Type</th>";
            break;
    }
    $("#reqTable").find("thead").empty();
   // $("#reqTable").empty();
    $("#reqTable").find("thead").append(thead);
    $("#reqTable").find("tbody").empty();

}
/*
 This sets the right comboboxes etc in the main window
 */
function setActiveOptions(){
//filtercontent
    //If chosen to create a new function for this, because this will increase readability
    //First disable them all
    $("#filtercontent").hide();
    $("#editGoalsOptions").hide();
    $("#editAssetsOptions").hide();

    switch (window.activeTable) {
        case "Requirements":
            $("#filtercontent").show();
            break;
        case "Goals":
            break;
        case "Obstacles":
            break;
        case "EditGoals":
            $("#editGoalsOptions").show();
            break;
        case "Assets":
            $("#editAssetsOptions").show();
            break;
    }
}

/*
for filling up the SVG viewer
 */
function fillSvgViewer(data){
    var xmlString = (new XMLSerializer()).serializeToString(data);
    //console.log(String(xmlString));
    var svgDiv = $("#svgViewer");
    svgDiv.show();
    svgDiv.css("height",$("#maincontent").height());
    svgDiv.css("width","100%");
    svgDiv.html(xmlString);
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

/*
for edit assets
 */

function getAssetDefinition(props){
    $('#Properties').find('tbody').empty();
    var i = 0;
    var textToInsert = [];
    $.each(props, function(key, value) {
        textToInsert[i++] = '<tr class="clickable-properties" ><td>';
        textToInsert[i++] = key;
        textToInsert[i++] = '</td>';
        $.each(value, function(keys, values) {
            textToInsert[i++] = '<td>';
            textToInsert[i++] = values;
            textToInsert[i++] = '</td>';
        });
        textToInsert[i++] = '</tr>';
    });
    $('#Properties').find('tbody').append(textToInsert.join(''));

}