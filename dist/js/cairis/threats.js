/**
 * Created by Raf on 22/05/2015.
 */
/*
I've made this file to make it easier for me to program. everything (except PUT POST and DELETE) or the threats will be coded here
 It is possible that I will use some already developed functions inside some other files
 */
$("#threatsClick").click(function () {
   createThreatsTable()
});

/*
 A function for filling the table with Threats
 */
function createThreatsTable(){

    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crfossDomain: true,
        url: serverIP + "/api/threats",
        success: function (data) {
            window.activeTable = "Threats";
            setTableHeader();
            var theTable = $(".theTable");
            $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
            var textToInsert = [];
            var i = 0;

            $.each(data, function(key, item) {
                textToInsert[i++] = "<tr>";
                textToInsert[i++] = '<td><button class="editThreatsButton" value="' + key + '">' + 'Edit' + '</button> <button class="deleteThreatsButton" value="' + key + '">' + 'Delete' + '</button></td>';

                textToInsert[i++] = '<td name="theName">';
                textToInsert[i++] = key;
                textToInsert[i++] = '</td>';

                textToInsert[i++] = '<td name="theType">';
                textToInsert[i++] = item.theType;
                textToInsert[i++] = '</td>';

                textToInsert[i++] = '</tr>';
            });

            theTable.append(textToInsert.join(''))
            theTable.css("visibility","visible");

            activeElement("reqTable");
            sortTableByRow(0);

        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    })



}


var optionsContent = $("#optionsContent");
$(document).on('click', ".editThreatsButton", function () {
    var name = $(this).val();
    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/threats/name/" + name.replace(" ", "%20"),
        success: function (data) {
            // console.log(JSON.stringify(rawData));
            fillOptionMenu("../../CAIRIS/fastTemplates/editThreatOptions.html", "#optionsContent", null, true, true, function () {
                    forceOpenOptions();
                    $("#addPropertyDiv").hide();
                                $.ajax({
                                    type: "GET",
                                    dataType: "json",
                                    accept: "application/json",
                                    data: {
                                        session_id: String($.session.get('sessionID'))
                                    },
                                    crossDomain: true,
                                    url: serverIP + "/api/threats/types",
                                    success: function (data2) {
                                        $.each(data2, function (index, type) {
                                            $('#theType')
                                                .append($("<option></option>")
                                                    .attr("value",type.theName)
                                                    .text(type.theName));
                                        });

                                        $.session.set("theThreat", JSON.stringify(data));
                                        var fillerJSON = data;
                                        var tags = data.theTags;
                                        fillerJSON.theTags = [];
                                        var text = "";
                                        $.each(tags, function (index, type) {
                                            text += type + ", ";
                                        });
                                        $("#theTags").val(text);
                                        $('#editThreatOptionsform').loadJSON(fillerJSON, null);
                                        $.each(data.theEnvironmentProperties, function(index, env){
                                            $("#theThreatEnvironments").append("<tr><td><i class='fa fa-minus'></i></td><td class='threatEnvironments'>" + env.theEnvironmentName + "</td></tr>");
                                        });
                                        $("#theThreatEnvironments").find(".threatEnvironments:first").trigger('click');
                                    },
                                    error: function (xhr, textStatus, errorThrown) {
                                        debugLogger(String(this.url));
                                        debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                                    }
                                });

                }
            );
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
});
optionsContent.on("click", ".threatEnvironments", function () {
var threat = JSON.parse($.session.get("theThreat"));
    var envName = $(this).text();
    $.session.set("threatEnvironmentName", envName);
    $("#threatAssets").find("tbody").empty();
    $("#threatAttackers").find("tbody").empty();
    $("#threatProperties").find("tbody").empty();
    $.each(threat.theEnvironmentProperties, function (index, env) {
        if(envName == env.theEnvironmentName){
            $.each(env.theAssets, function (index,asset) {
               appendThreatAsset(asset);
            });
            $.each(env.theAttackers, function (index,attacker) {
               appendThreatAttacker(attacker);
            });
            $.each(env.theProperties, function (index,prop) {
                if( prop.value != "None"){
                   appendThreatProperty(prop);
                }
            });
            $("#theLikelihood").val(env.theLikelihood);

        }
    });
    //threatAssets
});
optionsContent.on('click', '#addAssettoThreat', function () {
    var hasAssets = [];
    $("#threatAssets").find(".threatAssets").each(function(index, asset){
        hasAssets.push($(asset).text());
    });
    assetsDialogBox(hasAssets, function (text) {
        var threat = JSON.parse($.session.get("theThreat"));
        var theEnvName = $.session.get("threatEnvironmentName");
        $.each(threat.theEnvironmentProperties, function (index, env) {
            if(env.theEnvironmentName == theEnvName){
                env.theAssets.push(text);
                $.session.set("theThreat", JSON.stringify(threat));
                appendThreatAsset(text);
            }
        });
    });
});
optionsContent.on('click','#addAttackertoThreat', function () {
    var hasAttackers = [];
    var theEnvName = $.session.get("threatEnvironmentName");
    $("#threatAttackers").find(".threatAttackers").each(function(index, attacker){
        hasAttackers.push($(attacker).text());
    });
    attackerDialogBox(hasAttackers, theEnvName, function (text) {
        var threat = JSON.parse($.session.get("theThreat"));
        $.each(threat.theEnvironmentProperties, function (index, env) {
            if(env.theEnvironmentName == theEnvName){
                env.theAttackers.push(text);
                $.session.set("theThreat", JSON.stringify(threat));
                appendThreatAttacker(text);
            }
        });
    });
});
optionsContent.on('change', '#theLikelihood', function () {
    var threat = JSON.parse($.session.get("theThreat"));
    var theEnvName = $.session.get("threatEnvironmentName");
    $.each(threat.theEnvironmentProperties, function (index, env) {
        if(env.theEnvironmentName == theEnvName){
            env.theLikelihood = $("#theLikelihood option:selected").text();
            $.session.set("theThreat", JSON.stringify(threat));
        }
    });
});
optionsContent.on('click', '.removeThreatAsset', function () {
    var assetText = $(this).closest(".threatAssets").text();
    $(this).closest("tr").remove();
    var threat = JSON.parse($.session.get("theThreat"));
    var theEnvName = $.session.get("threatEnvironmentName");
    $.each(threat.theEnvironmentProperties, function (index, env) {
        if(env.theEnvironmentName == theEnvName){
            //y.splice( $.inArray(removeItem,y) ,1 );
            env.theAssets.splice( $.inArray(assetText,env.theAssets) ,1 );
            $.session.set("theThreat", JSON.stringify(threat));

        }
    });
});
optionsContent.on('click','.removeThreatAttacker', function () {
    var attackerName = $(this).closest(".threatAttackers").text();
    var theEnvName = $.session.get("threatEnvironmentName");
        var threat = JSON.parse($.session.get("theThreat"));
        $.each(threat.theEnvironmentProperties, function (index, env) {
            if(env.theEnvironmentName == theEnvName){
                env.theAttackers.splice( $.inArray(attackerName,env.theAttackers) ,1 );
                $.session.set("theThreat", JSON.stringify(threat));
            }
        });
});
optionsContent.on('click','#addPropertytoThreat', function () {
    $("#editThreatOptionsform").hide();
    fillThreatPropProperties();
    $("#addPropertyDiv").show('slow').addClass("newProp");

});

optionsContent.on('click',"#UpdateThreatProperty", function () {
    var prop = {};
    var threat = JSON.parse($.session.get("theThreat"));
    var theEnvName = $.session.get("threatEnvironmentName");
    prop.value = $("#thePropValue option:selected").text();
    prop.name = $("#thePropName option:selected").text();
    prop.rationale = $("#thePropRationale").val();

   if($("#addPropertyDiv").hasClass("newProp")){

       //adding to Table
       appendThreatProperty(prop);
       $.each(threat.theEnvironmentProperties, function (index, env) {
           if(env.theEnvironmentName == theEnvName){
               env.theProperties.push(prop);
           }
       });
   } else{
       //TODO ADDEN AAN SESSION
        var theRow = $(".changeAbleProp");
       var oldname = $(theRow).find("td:eq(1)").text();
       $(theRow).find("td:eq(1)").text(prop.name);
       $(theRow).find("td:eq(2)").text(prop.value);
       $(theRow).find("td:eq(3)").text(prop.rationale);
       $.each(threat.theEnvironmentProperties, function (index, env) {
           if(env.theEnvironmentName == theEnvName){
               $.each(env.theProperties, function (index, proper) {
                   if(proper.name == oldname){
                       proper.name = prop.name;
                       proper.value = prop.value;
                       proper.rationale = prop.rationale;
                   }
               });
           }
       });
       $.session.set("theThreat", JSON.stringify(threat));
       toggleThreatOptions();
   }
});
optionsContent.on("dblclick",".changeProperty", function () {
    $(this).addClass("changeAbleProp");
    toggleThreatOptions();
    var text =  $(this).find("td:eq(1)").text();
    fillThreatPropProperties(text);
    var value = $(this).find("td:eq(2)").text();
    $("#thePropValue").val(value);
    $("#thePropRationale").val($(this).find("td:eq(3)").text());
});

optionsContent.on("click", "#addThreatEnv", function () {
    var hasEnv = [];
    $(".threatEnvironments").each(function (index, tag) {
        hasEnv.push($(tag).text());
    });
    environmentDialogBox(hasEnv, function (text) {
        $("#theThreatEnvironments").find("tbody").append('<tr><td class="deleteThreatEnv"><i class="fa fa-minus"></i></td><td class="threatEnvironments">'+text+'</td></tr>');
       var environment =  jQuery.extend(true, {},threatEnvironmentDefault );
        environment.theEnvironmentName = text;
        var threat = JSON.parse($.session.get("theThreat"));
        threat.theEnvironmentProperties.push(environment);
        $.session.set("theThreat", JSON.stringify(threat));
    });
});
optionsContent.on('click', '#UpdateThreat', function (e) {
    e.preventDefault();
    var threat = JSON.parse($.session.get("theThreat"));
    var oldName = threat.theThreatName;
    threat.theThreatName = $("#theThreatName").val();
    threat.theDescription = $("#theMethod").val();
    var tags = $("#theTags").text().split(", ");
    threat.theTags = tags;
    threat.theType = $("#theType option:selected").text();

   putThreat(threat, oldName, function () {
       createThreatsTable();
   });

});

function fillThreatPropProperties(extra){
    var propBox = $("#thePropName");
    propBox.empty();
    var threat = JSON.parse($.session.get("theThreat"));
    var theEnvName = $.session.get("threatEnvironmentName");
    $.each(threat.theEnvironmentProperties, function (index, env) {
        if(env.theEnvironmentName == theEnvName){
            $.each(env.theProperties, function (index, prop) {
                if(prop.value == "None"){
                    propBox.append($("<option></option>")
                            .text(prop.name));
                }
            });
        }
    });
    if(typeof extra !== undefined && extra !=""){
        propBox.append($("<option></option>")
            .text(extra).val(extra));
        propBox.val(extra);
    }
}
function toggleThreatOptions(){
    $("#editThreatOptionsform").toggle();
    $("#addPropertyDiv").toggle();
}
function appendThreatAsset(asset){
    $("#threatAssets").find("tbody").append("<tr><td class='removeThreatAsset'><i class='fa fa-minus'></i></td><td class='threatAssets'>" + asset + "</td></tr>").animate('slow');
}
function appendThreatAttacker(attacker){
    $("#threatAttackers").find("tbody").append("<tr><td class='removeThreatAttacker' ><i class='fa fa-minus'></i></td><td class='threatAttackers'>" + attacker + "</td></tr>").animate('slow');
}
function appendThreatProperty(prop){
    $("#threatProperties").find("tbody").append("<tr class='changeProperty'><td class='removeThreatProperty'><i class='fa fa-minus'></i></td><td class='threatProperties'>" + prop.name + "</td><td>"+ prop.value +"</td><td>"+ prop.rationale+"</td></tr>").animate('slow');;
}