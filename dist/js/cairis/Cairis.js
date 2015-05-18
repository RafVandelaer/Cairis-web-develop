/**
 * Created by Raf on 24/04/2015.
 */
window.serverIP = "http://192.168.112.132:7071";
window.activeTable ="Requirements";
window.boxesAreFilled = false;
window.debug = true;

function debugLogger(info){
    if(debug){
        console.log(info);
    }
}

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
            debugLogger(json_text);
            $.ajax({
                type: 'POST',
                url: serverIP + '/api/user/config',
                // data: $('#configForm').serializeArray(),
                data: json_text,
                accept:"application/json",
                contentType : "application/json",
                success: function(data, status, xhr) {
                    // console.log("DB Settings saved");
                    debugLogger(data);
                   var sessionID = data.session_id;
                    $.session.set("sessionID", sessionID);
                    startingTable();

                },
                error: function(data, status, xhr) {
                    console.log(this.url);
                    debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
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
    debugLogger("Selection: " + selection);
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
                    debugLogger(String(this.url));
                    debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
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
                session_id: String($.session.get('sessionID'))
            },
            crossDomain: true,
            url: serverIP + "/api/requirements/environment/" + encodeURIComponent(selection),
            success: function (data) {
                createRequirementsTable(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                debugLogger(String(this.url));
                debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
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
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
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
    var  originator, rationale, fitCriterion, type = "";

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

        textToInsert[i++] = '<td name="theVersion"  style="display:none;">';
        textToInsert[i++] = item.theVersion;
        textToInsert[i++] = '</td>';

        var datas = eval(item.attrs);
        for (var key in datas) {
            if (datas.hasOwnProperty(key)) {
                /*
                Made this so the TD's are in the right order.
                 */
                switch(key){
                    case "originator":
                        originator =   '<td name=' + key + ' contenteditable=true >'+ datas[key] + '</td>';
                        break;
                    case "rationale":
                        rationale =   '<td name=' + key + ' contenteditable=true >'+ datas[key] + '</td>';
                        break;
                    case "fitCriterion":
                        fitCriterion =   '<td name=' + key + ' contenteditable=true >'+ datas[key] + '</td>';
                        break;
                    case "type":
                        type =   '<td name=' + key + ' contenteditable=true >'+ datas[key] + '</td>';
                        break;
                }
              /*  if(key == ("originator") || key == ("rationale") || key == ("fitCriterion") || key == ("type")) {
                    // alert(key+': '+datas[key]); // this will show each key with it's value
                    // tre.append("<td name=" + key + " contenteditable=true >" + datas[key] + "</td>");
                    textToInsert[i++] = '<td name=';
                    textToInsert[i++] = key;
                    textToInsert[i++] = ' contenteditable=true >';
                    textToInsert[i++] = datas[key];
                    textToInsert[i++] = '</td>';

                }*/
            }
        }
        textToInsert[i++] = rationale;
        textToInsert[i++] = fitCriterion;
        textToInsert[i++] = originator;
        textToInsert[i++] = type;
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

function createAssetsTable(data, callback){

    var theTable = $(".theTable");
    var textToInsert = [];
    var i = 0;

    //var thedata = $.parseJSON(data);
    $.each(data, function(count, item) {
        textToInsert[i++] = "<tr>"

        textToInsert[i++] = '<td><button class="editAssetsButton" value="' + item.theName + '">' + 'Edit' + '</button> <button class="deleteAssetButton" value="' + item.theName + '">' + 'Delete' + '</button></td>';

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
    callback();


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
                debugLogger(String(this.url));
                debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
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
                debugLogger(String(this.url));
                debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
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
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
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
    //////ADDED
    setActiveOptions();

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
            debugLogger("Is Requirement");
            thead = "<th width='50px'></th><th>Name</th><th>Description</th><th>Priority</th><th>Rationale</th><th>Fit Citerion</th><th>Originator</th><th>Type</th>";
            break;
        case "Goals":
           debugLogger("Is Goal");
            thead = "<th width='50px'></th><th>Name</th><th>Definition</th><th>Category</th><th>Priority</th><th>Fit Citerion</th><th>Issue</th><th>Originator</th>";
            break;
        case "Obstacles":
            debugLogger("Is Obstacle");
            thead = "<th width='50px'></th><th>Name</th><th>Definition</th><th>Category</th><th>Originator</th>";
            break;
        case "EditGoals":
            debugLogger("Is EditGoals");
            thead = "<th>Name</th><th>Originator</th><th>Status</th>";
            break;
        case "Assets":
            debugLogger("Is Asset");
            thead = "<th width='120px' id='addNewAsset'><i class='fa fa-plus floatCenter'></i></th><th>Name</th><th>Type</th>";
            break;
        case "Roles":
           debugLogger("Is Goal");
            thead = "<th width='120px' id='addNewRole'><i class='fa fa-plus floatCenter'></i></th><th>Name</th><th>Shortcode</th><th>Type</th>";
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
        case "Roles":
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

function sortTableByRow(rownumber){
    var tbl = document.getElementById("reqTable").tBodies[0];
    var store = [];
    for(var i=0, len=tbl.rows.length; i<len; i++){
        var row = tbl.rows[i];
        var sortnr = parseFloat(row.cells[rownumber].textContent || row.cells[rownumber].innerText);
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

function newSorting(rownr){
    var $sort = this;
    var $table = $('#reqTable');
    var $rows = $('tbody > tr',$table);
    $rows.sort(function(a, b){
        var keyA = $('td:eq('+rownr+')',a).text();
        var keyB = $('td:eq('+rownr+')',b).text();
        if($($sort).hasClass('asc')){
            return (keyA > keyB) ? 1 : 0;
        } else {
            return (keyA < keyB) ? 1 : 0;
        }
    });
    $.each($rows, function(index, row){
        $table.append(row);
    });
}

/*
for edit assets
 */

function getAssetDefinition(props){
    $('#Properties').find('tbody').empty();
    var i = 0;
    var textToInsert = [];
    /*$.each(props, function(key, value) {
        textToInsert[i++] = '<tr class="clickable-properties" ><td>';
        textToInsert[i++] = key;
        textToInsert[i++] = '</td>';
        $.each(value, function(keys, values) {
            textToInsert[i++] = '<td>';
            textToInsert[i++] = values;
            textToInsert[i++] = '</td>';
        });
        textToInsert[i++] = '</tr>';
    });*/
    $.each(props, function(index, object) {
        //fa-minus

             textToInsert[i++] = '<tr class="clickable-properties" ><td style="display:none;">';
             textToInsert[i++] = object.id;
             textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td>';
        textToInsert[i++] = '<div class="fillparent deleteProperty"><i class="fa fa-minus"></i></div>';
        textToInsert[i++] = '</td>';

             textToInsert[i++] = '<td name="name">';
             textToInsert[i++] = object.name;
             textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="value">';
        textToInsert[i++] = object.value;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="rationale">';
        textToInsert[i++] = object.rationale;
        textToInsert[i++] = '</td>';

         textToInsert[i++] = '</tr>';
     });
    $('#Properties').find('tbody').append(textToInsert.join(''));

}

function deepEquals(o1, o2) {
    var k1 = Object.keys(o1).sort();
    var k2 = Object.keys(o2).sort();
    if (k1.length != k2.length) return false;
    return k1.zip(k2, function(keyPair) {
        if(typeof o1[keyPair[0]] == typeof o2[keyPair[1]] == "object"){
            return deepEquals(o1[keyPair[0]], o2[keyPair[1]])
        } else {
            return o1[keyPair[0]] == o2[keyPair[1]];
        }
    }).all();
}

function showPopup(succes){

    if ($('.popupMessage').is(':visible')) {

    }else{
        $('.popupMessage').show();
    }
    if(succes){
        $(".popupMessage").css("width","175px");
        $(".Succes").show();
        $(".Fail").hide();
    }
    else{
        $(".popupMessage").css("width","350px");
        $(".Fail").show();
        $(".Succes").hide();
    }
    $(".popupMessage").css("margin-left",$( document).width()/2);
    $(".popupMessage").animate({
        bottom: '100px'
    }, 1500).delay(3000).fadeOut("slow",function(){
        //bottom: '-100px'
        $(".popupMessage").css("bottom","-100px");
    });
}
function assetFormToJSON(data, newAsset){
    var json
    if(newAsset){
        json = jQuery.extend(true, {},mainAssetObject );

    }
    else{
        json =  JSON.parse($.session.get("UsedAssetObject"));
    }
    json.theName = $(data).find('#theName').val();

    //var data = $("#editAssetsOptionsform");
    json["theDescription"] = $(data).find('#theDescription').val();
    json["theSignificance"] = $(data).find('#theSignificance').val();
    json["theCriticalRationale"] = $(data).find('#theCriticalRationale').val();
    json["isCritical"] = +$("#isCritical").is( ':checked' );

    json.theType =  $(data).find( "#theType option:selected" ).text().trim();


    $(data).children().each(function () {
        if(String($(this).prop("tagName")).toLowerCase() == "p"){
            $(this).children().each(function() {
                if(String($(this).prop("tagName")).toLowerCase() == "input"){
                    json[$(this).prop("name")] = $(this).val();
                    // console.log($(this).prop("name") +" " +$(this).val());
                }

                if(String($(this).prop("tagName")).toLowerCase() == "select"){

                    var id = $(this).attr('id');

                    $(this).children().each(function() {
                        var attr = $(this).attr('selected');
                        if (typeof attr !== typeof undefined && attr !== false) {
                            json[id] = $(this).val();
                            // console.log( id + "  " +$(this).val());
                        }
                    });
                }


            });
        }
    });
    return json
}

function putAssetForm(data){
    putAsset(assetFormToJSON(data));
}

function postAssetForm(data,callback){
    //var allAssets = JSON.parse($.session.get("allAssets"));
    var newAsset = assetFormToJSON(data,true);
   var assetName = $(data).find('#theName').val();
    var asobject = {};
    asobject.object = newAsset
    $.session.set("AssetName",assetName);
    //allAssets[assetName] = newAsset;
    postAsset(asobject,callback);
}
