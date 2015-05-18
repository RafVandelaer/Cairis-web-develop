/**
 * Created by Raf on 30/04/2015.
 */



/*
 Function for adding a row to the table
 */
$("#addRow").click(function() {
    var kind  = "";

    //var clonedRow = $("#reqTable tr:last").clone();
    if($( "#assetsbox").find("option:selected" ).text() == "All" && $( "#environmentsbox").find("option:selected" ).text() == "All"){
        alert("Please select an asset or an environment");
    }
    else{
        if($( "#assetsbox").find("option:selected" ).text() != "All"){
            kind = "asset:" + $( "#assetsbox").find("option:selected" ).text();
        }else{
            kind = "environment:"+$( "#environmentsbox").find("option:selected" ).text();
        }
        var template = "";
        var num = findLabel();
        switch (window.activeTable) {
            case "Requirements":
                template = '<tr class="' + kind + '">' +
                    '<td name="theLabel">' + num + '</td>' +
                '<td name="theName" contenteditable="true"></td>'+
                '<td name="theDescription" contenteditable="true"></td>'+
                '<td name="thePriority" contenteditable="true">1</td>'+
                '<td name="theId" style="display:none;"></td>'+
                '<td name="theVersion" style="display:none;"></td>'+
                '<td name="rationale" contenteditable="true">None</td>'+
                '<td name="fitCriterion" contenteditable="true">None</td>'+
                '<td name="originator" contenteditable="true"></td>'+
                '<td name="type" contenteditable="true">Functional</td>'+
                '</tr>';
                break;
            case "Goals":
                template = '<tr><td name="theLabel">' + num + '</td><td name="theName" contenteditable="true" ></td><td name="theDefinition" contenteditable="true"></td><td name="theCategory" contenteditable="true">Maintain</td><td name="thePriority" contenteditable="true">Low</td><td name="theId" style="display:none;"></td><td name="fitCriterion" contenteditable="true" >None</td><td  name="theIssue" contenteditable="true">None</td><td name="originator" contenteditable="true"></td></tr>';
                break;
            case "Obstacles":
                template = '<tr><td name="theLabel">' + num + '</td><td name="theName" contenteditable="true">Name</td><td name="theDefinition" contenteditable="true">Definition</td><td name="theCategory" contenteditable="true">Category</td><td name="theId" style="display:none;"></td><td name="originator" contenteditable="true">Originator</td></tr>';
                break;
        }
        $("#reqTable").append(template);
        sortTableByRow(0);
    }

});

/*
 Removing the active tr
 */
$("#removeReq").click(function() {
    if(window.activeTable =="Requirements"){
        var oldrow = $("tr").eq(getActiveindex()).detach();
    }

    //of remove
    //TODO: AJAX CALL BEFORE REMOVE
});

$("#gridReq").click(function(){
    window.activeTable = "Requirements";
    startingTable();
});


//Just for debugLogger
$("#testingButton").click(function(){
   showPopup(true);
});

//For debugLogger
$("#removesessionButton").click(function() {
    $.session.remove('sessionID');
    location.reload();
});

$("#gridGoals").click(function() {
    window.activeTable = "Goals";
    setTableHeader();
});
//gridObstacles
$("#gridObstacles").click(function() {
    window.activeTable = "Obstacles";
    setTableHeader();
});
$("#showRolesButton").click(function () {
   fillRolesTable();
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
        url: serverIP + "/api/environments/all/names",
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
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    })});

$("#EditGoals").click(function(){

    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crfossDomain: true,
        url: serverIP + "/api/goals/coloured",
        success: function (data) {
            window.activeTable = "EditGoals";
            setTableHeader();
            createEditGoalsTable(data);
            activeElement("reqTable");
            sortTableByRow(0);
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    })

});
$("#editGoalButton").click(function(){
debugLogger(getActiveindex());
});


$(document).on('click', "button.editRoleButton",function() {
   var name = $(this).val();
    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/roles/name/" + name.replace(" ", "%20") ,
        success: function (json) {
            fillOptionMenu("../../CAIRIS/fastTemplates/EditRoleOptions.html","#optionsContent",null,true,true,function() {
                forceOpenOptions();
                var form = $('#editRoleOptionsform');
                form.loadJSON(json,null);
                $.session.set("RoleObject", JSON.stringify(json));

                $.ajax({
                    type: "GET",
                    dataType: "json",
                    accept: "application/json",
                    data: {
                        session_id: String($.session.get('sessionID'))
                    },
                    crossDomain: true,
                    url: serverIP + "/api/roles/name/" + name.replace(" ", "%20")+"/properties" ,
                    success: function (json) {
                        $.each(json, function (index, value) {
                            $("#theEnvironments").find("tbody").append("<tr><td class='roleEnvironmentClick'>"+value.theEnvironmentName + "</td></tr>");
                        });
                        $.session.set("RoleEnvironments", JSON.stringify(json))
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        showPopup(false);
                        debugLogger(String(this.url));
                        debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                    }
                });


            });
        },
        error: function (xhr, textStatus, errorThrown) {
            showPopup(false);
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
});


$(document).on('click', "button.editAssetsButton",function(){
    var name = $(this).attr("value");
    $.session.set("AssetName", name.trim());

    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/assets/name/" + name.replace(" ", "%20"),
        success: function (newdata) {
           // console.log(JSON.stringify(rawData));
            fillOptionMenu("../../CAIRIS/fastTemplates/EditAssetsOptions.html","#optionsContent",null,true,true, function(){

                    //Holding asset in Session so it's easy update-able
                    $.session.set("Asset", JSON.stringify(newdata));
                    //console.log(JSON.stringify(newdata));
                   $('#editAssetsOptionsform').loadJSON(newdata,null);
                    $.session.set("UsedAssetObject", JSON.stringify(newdata));
                    forceOpenOptions();
                    //$('#theEnvironmentDictionary').append(textToInsert.join(''));

                    $.ajax({
                        type: "GET",
                        dataType: "json",
                        accept: "application/json",
                        data: {
                            session_id: String($.session.get('sessionID'))
                        },
                        crossDomain: true,
                        url: serverIP + "/api/assets/name/" + newdata.theName + "/properties",
                        success: function (data) {
                            $.session.set("AssetProperties", JSON.stringify(data));
                            fillEditAssetsEnvironment();
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            debugLogger(String(this.url));
                            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                        }
                    });
                    //$('.clickable-rows').on('click', changeEnvironment());
                }
            );
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
});
/*$('.clickable-environments').mousedown(function(event) {
    switch (event.which) {
        case 1:
            alert('Left mouse button pressed');
            break;
        case 2:
            alert('Middle mouse button pressed');
            break;
        case 3:
            alert('Right mouse button pressed');
            break;
        default:
            alert('You have a strange mouse');
    }
});*/


function fillEditAssetsEnvironment(){
    var data = JSON.parse( $.session.get("AssetProperties"));
    var props;

    var i = 0;
    var textToInsert = [];
    $.each(data, function(arrayindex, value) {
        textToInsert[i++] = '<tr class="clickable-environments" ><td>';
        textToInsert[i++] = value.environment;
        textToInsert[i++] = '</td></tr>';
    });
    $('#theEnvironmentDictionary').find("tbody").empty();
    $('#theEnvironmentDictionary').append(textToInsert.join(''));
   // $(".clickable-environments").contextMenu(menu);

    var env = $( "#theEnvironmentDictionary").find("tbody tr:eq(0) > td:eq(0)").text();
    $.each(data, function(arrayID,group) {
        if(group.environment == env){
            props = group.attributes;
            $.session.set("thePropObject", JSON.stringify(group));
            $.session.set("Arrayindex",arrayID);

        }
    });

    getAssetDefinition(props);
}


//This is delegation
var optionsContent = $('#optionsContent');
optionsContent.on('contextmenu', '.clickable-environments', function(){
    return false;
});
/*
updating a role
 */
optionsContent.on('click','#UpdateRole', function (event) {
    event.preventDefault();

    var theRoleObject = JSON.parse($.session.get("RoleObject"));
    var oldname = theRoleObject.theName;
    theRoleObject.theName = optionsContent.find("#theName").val();
    theRoleObject.theShortCode = optionsContent.find("#theShortCode").val();
    theRoleObject.theDescription = optionsContent.find("#theDescription").val();
    theRoleObject.theType =  optionsContent.find( "#theType option:selected" ).text().trim();
    //debugLogger(JSON.stringify(theRoleObject));
    if(theRoleObject.theName == "" || theRoleObject.theShortCode == "" || theRoleObject.theDescription == "" || theRoleObject.theType == ""){
        alert("The Name, Shortcode, Description and Type must have a value");
    }
    else{
        updateRole(theRoleObject, oldname, function () {
            fillRolesTable();
        });
    }


});
$("#reqTable").on('click','.deleteRoleButton', function (event) {
    event.preventDefault();
    var name = $(this).attr("value");
    debugLogger("Delete: " + name + ".");
    deleteRole( name, function () {
        fillRolesTable();
    });
});

optionsContent.on("click", '.roleEnvironmentClick', function () {
    $("#theCounterMeasures").find('tbody').empty();
     $("#theResponses").find('tbody').empty();


       var text =  $(this).text();
       var environments = JSON.parse($.session.get("RoleEnvironments"));
    var textForCounterMeasures = [];
    var textForResponses = [];
    var i =0;
     var j  = 0;
    $.each(environments, function (index, obj) {
        if(obj.theEnvironmentName == text){
            $.each(obj.theCountermeasures, function (index, val) {
                debugLogger("Found one" + val);
                textForCounterMeasures[i++] = "<tr><td>"+ val + "</td><tr>";
                //$("#theCounterMeasures").find('tbody').append( val );
            });
            var theResp = obj.theResponses;
            $.each(theResp , function (index1, valu) {
                textForResponses[j++] = "<tr><td>"+ valu.__python_tuple__[0] +"</td><td>"+ valu.__python_tuple__[1] +"</td></tr>";
            });
            $("#theCounterMeasures").find('tbody').append(textForCounterMeasures.join(''));
            $("#theResponses").find('tbody').append(textForResponses.join(''));
        }
    })

});


optionsContent.on('click', '.clickable-environments', function(event){
   // console.log("Left click");
            //LEFT MOUSE
            var assts = JSON.parse($.session.get("AssetProperties"));
            var text = $(this).find("td").text();
            var props;
            $.each(assts, function(arrayID,group) {
                if(group.environment == text){
                    // console.log(group.attributes[0].name);
                    props = group.attributes;
                    $.session.set("thePropObject", JSON.stringify(group));
                    $.session.set("Arrayindex", arrayID);

                }
            });
            $.session.set("UsedProperties", JSON.stringify(props));
            getAssetDefinition(props);
});
/*
removing a prop
 */
 optionsContent.on("click",".deleteProperty", function(){

     var removablerow = AssetEnvironmentPropertyAttribute;
     $(this).closest('tr').find("td").each( function(index, object){

         var attr = $(object).attr('name');
         if (typeof attr !== typeof undefined && attr !== false) {
             if (attr == "name" || attr == "rationale" || attr == "value") {
                 removablerow[attr] = object.innerText;
             }
         }
     });
     var assts = JSON.parse($.session.get("AssetProperties"));
     var props = assts[  $.session.get("Arrayindex")];
     $.each(props.attributes, function(index, obj){
         if (removablerow["name"] == obj["name"] &&  removablerow["value"] == obj["value"]){
             props.attributes.splice(index, 1);
             assts[  $.session.get("Arrayindex")] = props;
             /*updating webpage & database*/
             updateAssetEnvironment(assts);
             $.session.set("AssetProperties", JSON.stringify(assts));
             fillEditAssetsEnvironment();
         }
     });


});
/*
Add an asset
 */
$(document).on('click', "#addNewAsset",function(){
    fillOptionMenu("../../CAIRIS/fastTemplates/EditAssetsOptions.html","#optionsContent",null,true,true,function(){
    forceOpenOptions();
       // empty it because new environment;
        $.session.set("AssetProperties","");
        $("#editAssetsOptionsform").addClass("new");

    });
});

/*
Delete an asset
 */
$(document).on('click', "button.deleteAssetButton",function(){
    var name = $(this).attr("value");
    $.ajax({
        type: "DELETE",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID')),
            name: name
        },
        crossDomain: true,
        url: serverIP + "/api/assets/name/" + newdata.theName + "/properties",
        success: function (data) {
            $.ajax({
                type: "GET",
                dataType: "json",
                accept: "application/json",
                data: {
                    session_id: String($.session.get('sessionID'))
                },
                crossDomain: true,
                url: serverIP + "/api/assets",
                success: function (data) {
                    window.activeTable = "Assets";
                    setTableHeader();
                    createAssetsTable(data, function(){
                        newSorting(1);
                    });
                    activeElement("reqTable");

                },
                error: function (xhr, textStatus, errorThrown) {
                    debugLogger(String(this.url));
                    debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                }
            });
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
});


/*
Updating asset
 */
optionsContent.on("click", "#updateButtonAsset", function(){
    var allprops = JSON.parse($.session.get("AssetProperties"));
    var props;

    //if new prop
    if($("#editpropertiesWindow").hasClass("newProperty")){
        props =  jQuery.extend(true, {},AssetEnvironmentPropertyAttribute );
        props.name =   $("#property").find("option:selected").text().trim();
        props.value =  $("#value").find("option:selected").text().trim();
        props.rationale = $("#rationale").val();
        allprops[$.session.get("Arrayindex")].attributes.push(props);


    }else {
         props = JSON.parse($.session.get("thePropObject"));
        props.name =   $("#property").find("option:selected").text().trim();
        props.value =  $("#value").find("option:selected").text().trim();
        props.rationale = $("#rationale").val();
        props.id = parseInt($("#id").val());
        $.each(allprops[$.session.get("Arrayindex")].attributes, function(index, object){
            if(object.id == props.id){
                allprops[$.session.get("Arrayindex")].attributes[index] = props;
            }
        });
        updateAssetEnvironment(JSON.stringify(allprops),function(){
            $("#editAssetsOptionsform").show();
            $("#editpropertiesWindow").hide();
            //OPenen van
        });
    }


    $.session.set("AssetProperties", JSON.stringify(allprops));
    fillEditAssetsEnvironment();

});

/* adding env
 */
optionsContent.on('click', '.addEnvironmentPlus',function(){

    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))

        },
        crossDomain: true,
        url: serverIP + "/api/environments/all/names",
        success: function (data) {

            $("#comboboxDialogSelect").empty();
            var none = true;
            $.each(data, function(i, item) {
                var found = false;
                $(".clickable-environments  td").each(function() {
                    if(this.innerHTML.trim() == item){
                        found = true
                    }
                });
                //if not found in environments
                if(!found) {
                    $("#comboboxDialogSelect").append("<option value=" + item + ">" + item + "</option>");
                    none = false;
                }
            });
            if(!none) {

                $("#comboboxDialog").dialog({
                    modal: true,
                    buttons: {
                        Ok: function () {
                            $(this).dialog("close");
                            //Created a function, for readability
                           //$( "#comboboxDialogSelect").find("option:selected" ).text()
                            forceOpenOptions();
                            $("#theEnvironmentDictionary").find("tbody").append("<tr><td class='clickable-environments'>" + $( "#comboboxDialogSelect").find("option:selected" ).text() +"</td></tr>")
                           var Assetprops =  JSON.parse($.session.get("AssetProperties"));
                            var newProp = jQuery.extend(true, {},AssetEnvironmentProperty );
                            newProp.environment = $( "#comboboxDialogSelect").find("option:selected" ).text();
                            Assetprops.push( newProp);
                            $.session.set("AssetProperties", JSON.stringify(Assetprops));
                        }
                    }
                });
                $(".comboboxD").css("visibility", "visible");
            }else {
                alert("All environments are already added");
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    })
});
optionsContent.on("click", "#addNewProperty", function(){
    $("#editAssetsOptionsform").hide();
    $("#editpropertiesWindow").show(function(){
            $(this).addClass("newProperty");
    });

});
/*
For editing the definition properties
 */
optionsContent.on('dblclick', '.clickable-properties', function(){
    var test = $(this);
    $("#editAssetsOptionsform").hide();
    var label = test[0].children[1].innerText;

    $("#editpropertiesWindow").show(function(){
        //JUISTE PROPERTY INLADEN, NIET HELE ASSETPROP
        var jsonn = JSON.parse($.session.get("thePropObject"));
        var theRightprop;
        $.each(jsonn.attributes,function(arrayID,data){
            if(data.name == label){
                theRightprop = data;
                $.session.set("thePropObject", JSON.stringify(theRightprop));
                $.session.set("Arrayindex", arrayID);
            }
        });

        $("#property:selected").removeAttr("selected");
        $("#property").find("option").each(function() {
            if(label.toLowerCase() == theRightprop.name.toLowerCase()){
                $("#property").val(theRightprop.name);
            }
        });
        $('#editpropertiesWindow').loadJSON(theRightprop,null);
    });
    //console.log(    $.session.get("UsedProperties"));


});
optionsContent.on('change', "#theType",function (){
  // alert($(this).val());
    //$(this).val("selected", $(this).val());
});

optionsContent.on('click', '#cancelButtonAsset', function(){
    $("#editAssetsOptionsform").show();
    $("#editpropertiesWindow").hide();
});
optionsContent.on('click', '#UpdateAssetinGear',function(e){
    e.preventDefault();
    //alert($('#theName').val());
   //var AssetSon =  JSON.parse($.session.get("Asset"));
    //If new aset
    if($("#editAssetsOptionsform").hasClass("new")){
        alert("HasClass");
        postAssetForm($("#editAssetsOptionsform"), function(){
            //INHERE
            newAssetEnvironment($.session.get("AssetProperties"));
        });

    }
    else{
        putAssetForm($("#editAssetsOptionsform"));
        updateAssetEnvironment($.session.get("AssetProperties"));
    }

    fillAssetTable();

});

$("#reqTable").on("click", "td", function() {
   // console.log(getActiveindex());
    if(window.activeTable == "Requirements"){

    }
    //$('#reqTable').find('td:last').focus();
    $('#reqTable tr').eq(getActiveindex()).find('td:first').focus();
});
$("#editAssetsClick").click(function(){
   fillAssetTable();
});

function fillAssetTable(){
    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/assets",
        success: function (data) {
            window.activeTable = "Assets";
            setTableHeader();
            createAssetsTable(data, function(){
                newSorting(1);
            });
            $.session.set("allAssets", JSON.stringify(data));
            activeElement("reqTable");

        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
}

/*
For updating the Assets
 */
