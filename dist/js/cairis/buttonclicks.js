/**
 * Created by Raf on 30/04/2015.
 */
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


//Just for debug
$("#testingButton").click(function(){
   showPopup(true);
});

//For debug
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
            console.log(this.url);
            console.log("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
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
            console.log(this.url);
            console.log("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    })

});
$("#editGoalButton").click(function(){
console.log(getActiveindex());
});
$(document).on('click', "button.editAssetsButton",function(){
    var name = $(this).attr("value");

    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/assets/name/" + name.replace(" ", "%20"),
        success: function (rawData) {
           // console.log(JSON.stringify(rawData));
            fillOptionMenu("../../CAIRIS/fastTemplates/EditAssetsOptions.html","#optionsContent",null,true,true, function(){

                    //TODO Tables etc invullen
                    var newdata = rawData;
                    //Holding asset in Session so it's easy update-able
                    $.session.set("Asset", JSON.stringify(newdata));
                    //console.log(JSON.stringify(newdata));
                   $('#editAssetsOptionsform').loadJSON(newdata,null);
                    var environments = newdata.theEnvironmentDictionary;

                    var i = 0;
                    var textToInsert = [];
                    $.each(environments, function(key, value) {
                        textToInsert[i++] = '<tr class="clickable-environments" ><td>';
                        textToInsert[i++] = key;
                        textToInsert[i++] = '</td></tr>';
                    });
                    forceOpenOptions();
                    $('#theEnvironmentDictionary').append(textToInsert.join(''));

                    $.ajax({
                        type: "GET",
                        dataType: "json",
                        accept: "application/json",
                        data: {
                            session_id: String($.session.get('sessionID'))
                        },
                        crossDomain: true,
                        url: serverIP + "/api/assets/id/" + rawData.theId + "/properties",
                        success: function (data) {
                            $.session.set("AssetProperties", JSON.stringify(data));
                            var env = $( "#theEnvironmentDictionary").find("tbody tr:eq(0) > td:eq(0)").text();
                            var props = data[env];
                            $.session.set("UsedProperties", JSON.stringify(props));
                          //  console.log("dsf");
                            getAssetDefinition(props);
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            console.log(this.url);
                            var err = eval("(" + xhr.responseText + ")");
                            console.log("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                        }
                    });
                    //$('.clickable-rows').on('click', changeEnvironment());
                }
            );
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(this.url);
            console.log("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
});


//This is delegation
var optionsContent = $('#optionsContent');
optionsContent.on('click', '.clickable-environments', function(){
    var assts = JSON.parse($.session.get("AssetProperties"));
    var props = assts[$(this).find("td").text()];
    $.session.set("UsedProperties", JSON.stringify(props));
    getAssetDefinition(props);
});
/*
For editing the definition properties
 */
optionsContent.on('dblclick', '.clickable-properties', function(){
    var test = $(this);
    $("#editAssetsOptionsform").hide();
    $("#editpropertiesWindow").show(function(){
        var jsonn = JSON.parse($.session.get("UsedProperties"));
        $.each(jsonn, function (key, data) {
            //DO NOT DESTROY
            if(test[0].firstElementChild.innerHTML == key) {
                $("#property:selected").removeAttr("selected");
                $("#property").find("option").each(function() {
                     if($(this)[0].label == key){
                         $("#property").val(key);
                     }
                 });
            }
            $('#editpropertiesWindow').loadJSON(data,null);
        });

    });
    console.log($.session.get("UsedProperties"));


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
   var AssetSon =  JSON.parse($.session.get("Asset"));
    //TODO properties appart updaten zodra controller af is
    //TODO cleanup
    $(".assetUpdate").each(function() {
        var updatable = false;
        if(String($(this).prop("tagName")).toLowerCase() == "input" && String($(this).prop("type")).toLowerCase() == "text"){
            if(AssetSon[String(this.id)] != $(this).val()){
              //  console.log(String(this.id) + " has changed in input(text) to " + String($(this).val()) + " and was " +  AssetSon[String(this.id)]);
                AssetSon[String(this.id)] = String($(this).val());
                updatable = true;
            }
        }
        else if(String($(this).prop("tagName")).toLowerCase() == "input" && String($(this).prop("type")).toLowerCase() == "checkbox"){
            var checked = $(this).is(":checked") ? 1 : 0;
            if(AssetSon[String(this.id)] != $(this).val()){
                //console.log(String(this.id) + " has changed in input(checkbox) to " + checked + " and was " +  AssetSon[String(this.id)]);
                AssetSon[String(this.id)] = checked;
                updatable = true;
            }
        }
       else if(String($(this).prop("tagName")).toLowerCase() == "select") {
            if(AssetSon[String(this.id)] != $(this).val()){
                //console.log(String(this.id) + " has changed in select to " + String($(this).val()) + " and was " +  AssetSon[String(this.id)]);
                AssetSon[String(this.id)] = String($(this).val());
                updatable = true;
            }
        }
        else if(String($(this).prop("tagName")).toLowerCase() == "textarea") {
            if(AssetSon[String(this.id)] != $(this).val()){
                //console.log(String(this.id) + " has changed in textArea to " + String($(this).val()) + " and was " +  AssetSon[String(this.id)]);
                AssetSon[String(this.id)] = String($(this).val());
                updatable = true;
            }
        }
        if(updatable){
            stringData = "session_id=" +String($.session.get('sessionID')) +"&body=" + JSON.stringify(AssetSon);
            $.ajax({
                type: "PUT",
                dataType: "json",
                contentType: "application/json",
                accept: "application/json",
                data: stringData,
                crossDomain: true,
                url: serverIP + "/api/assets/name/" + AssetSon["theName"] ,
                success: function (data) {
                    showPopup(true);
                    forceCloseOptions

                },
                error: function (xhr, textStatus, errorThrown) {
                    showPopup(false);
                    console.log(this.url);
                    console.log("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                }
            });
        }
    });
});

$("#reqTable").on("click", "td", function() {
    console.log(getActiveindex());
    //$('#reqTable').find('td:last').focus();
    $('#reqTable tr').eq(getActiveindex()).find('td:first').focus();
});
$("#editAssetsClick").click(function(){
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
            console.log(this.url);
            console.log("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
});

/*
For updating the Assets
 */
