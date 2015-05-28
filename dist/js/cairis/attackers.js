/**
 * Created by Raf on 27/05/2015.
 */
/*
 I've made this file to make it easier for me to program. Everything (except PUT POST and DELETE) for the attackers will be coded here
 It is possible that I will use some already developed functions inside some other files
 */
$("#attackerClick").click(function () {
    createAttackersTable();
});
/*
 A function for filling the table with Threats
 */
function createAttackersTable(){

    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/attackers",
        success: function (data) {
            window.activeTable = "Attackers";
            setTableHeader();
            var theTable = $(".theTable");
            $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
            var textToInsert = [];
            var i = 0;

            $.each(data, function(key, item) {
                textToInsert[i++] = "<tr>";
                textToInsert[i++] = '<td><button class="editAttackerButton" value="' + key + '">' + 'Edit' + '</button> <button class="deleteAttackerButton" value="' + key + '">' + 'Delete' + '</button></td>';

                textToInsert[i++] = '<td name="theName">';
                textToInsert[i++] = key;
                textToInsert[i++] = '</td>';

                textToInsert[i++] = '<td name="theType">';
                textToInsert[i++] = item.theDescription;
                textToInsert[i++] = '</td>';

                textToInsert[i++] = '</tr>';
            });

            theTable.append(textToInsert.join(''));
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
$(document).on('click', ".editAttackerButton", function () {
    var name = $(this).val();
    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/attackers/name/" + name.replace(" ", "%20"),
        success: function (data) {
            // console.log(JSON.stringify(rawData));
            fillOptionMenu("../../CAIRIS/fastTemplates/editAttackerOptions.html", "#optionsContent", null, true, true, function () {
                    forceOpenOptions();
                    $("#addAttackerPropertyDiv").hide();
                    $.session.set("Attacker", JSON.stringify(data));
                    $('#editAttackerOptionsForm').loadJSON(data, null);
                    var tags = data.theTags;
                    var text = "";
                    $.each(tags, function (index, type) {
                        text += type + ", ";
                    });
                    $("#theTags").val(text);
                    $.each(data.theEnvironmentProperties, function (index, env) {
                       appendAttackerEnvironment(env.theEnvironmentName);
                    });
                    $("#theAttackerEnvironments").find(".attackerEnvironment:first").trigger('click');
                    $("#theImages").attr("src",data.theImage);
                }
            );
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
});
var optionsContent = $("#optionsContent");
optionsContent.on("click",".attackerEnvironment", function () {
    clearAttackerEnvInfo();
   var attacker = JSON.parse($.session.get("Attacker"));
    var theEnvName = $(this).text();
    $.session.set("attackerEnvironmentName", theEnvName);
    $.each(attacker.theEnvironmentProperties, function (index, env) {
        if(env.theEnvironmentName == theEnvName){
            $.each(env.theMotives, function (index, motive) {
                appendAttackerMotive(motive);
            });
            $.each(env.theRoles, function (index, role) {
                appendAttackerRole(role);
            });
            $.each(env.theCapabilities, function (index, cap) {
                appendAttackerCapability(cap);
            });
        }
    });
});
optionsContent.on("click", "#addMotivetoAttacker", function () {
    var hasMot = [];
    $(".attackerMotive").each(function (index, tag) {
        hasMot.push($(tag).text());
    });
    motivationDialogBox(hasMot, function (text) {
        var attacker = JSON.parse($.session.get("Attacker"));
        var theEnvName =  $.session.get("attackerEnvironmentName");
        $.each(attacker.theEnvironmentProperties, function (index, env) {
            if(env.theEnvironmentName == theEnvName){
                env.theMotives.push(text);
            }
        });
        appendAttackerMotive(text);
        $.session.set("Attacker", JSON.stringify(attacker));
    });
});

optionsContent.on('click', "#addCapabilitytoAttacker", function () {
    $("#addAttackerPropertyDiv").addClass("new");
    attackerToggle();

});


optionsContent.on('click', '#addRoletoAttacker', function () {
    var hasRole = [];
    $("#attackerRole").find(".attackerRole").each(function(index, role){
        hasRole.push($(role).text());
    });
    roleDialogBox(hasRole, function (text) {

        var attacker = JSON.parse($.session.get("Attacker"));
        var theEnvName = $.session.get("attackerEnvironmentName");
        $.each(attacker.theEnvironmentProperties, function (index, env) {
            if(env.theEnvironmentName == theEnvName){
                env.theRoles.push(text);
                $.session.set("Attacker", JSON.stringify(attacker));
                appendAttackerRole(text);
            }
        });
    });
});
optionsContent.on('click', "#UpdateAttackerCapability", function () {

    if($("#addAttackerPropertyDiv").hasClass("new")){
        var attacker = JSON.parse($.session.get("Attacker"));
        var theEnvName = $.session.get("attackerEnvironmentName");
        $.each(attacker.theEnvironmentProperties, function (index, env) {
            if(env.theEnvironmentName == theEnvName){
               var prop = {};
                prop.name = $("#theCap option:selected").text();
                prop.value = $("#thePropValue option:selected").text();
                env.theCapabilities.push(prop);
                $.session.set("Attacker", JSON.stringify(attacker));
                appendAttackerCapability(prop);
            }
        });
    }
});
function attackerToggle(){
    $("#addAttackerPropertyDiv").toggle();
    $("#editAttackerOptionsForm").toggle();
}
function appendAttackerEnvironment(environment){
    $("#theAttackerEnvironments").find("tbody").append('<tr><td class="deleteThreatEnv"><i class="fa fa-minus"></i></td><td class="attackerEnvironment">'+environment+'</td></tr>');
}
function appendAttackerRole(role){
    $("#attackerRole").find("tbody").append("<tr><td class='removeAttackerRole'><i class='fa fa-minus'></i></td><td class='attackerRole'>" + role + "</td></tr>").animate('slow');
}
function appendAttackerMotive(motive){
    $("#attackerMotive").find("tbody").append("<tr><td class='removeAttackerMotive' ><i class='fa fa-minus'></i></td><td class='attackerMotive'>" + motive + "</td></tr>").animate('slow');
}
function appendAttackerCapability(prop){
    $("#attackerCapability").find("tbody").append("<tr class='changeCapability'><td class='removeAttackerCapability'><i class='fa fa-minus'></i></td><td class='attackerCapability'>" + prop.name + "</td><td>"+ prop.value +"</td></tr>").animate('slow');
}
function clearAttackerEnvInfo(){
    $("#attackerCapability").find("tbody").empty();
    $("#attackerMotive").find("tbody").empty();
    $("#attackerRole").find("tbody").empty();
}