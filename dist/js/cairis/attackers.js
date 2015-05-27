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
                    $("#addPropertyDiv").hide();
                   /* getThreatTypes(function createTypes(types) {
                        $.each(types, function (index, type) {
                            $('#theType')
                                .append($("<option></option>")
                                    .attr("value", type.theName)
                                    .text(type.theName));
                        });
                        $("#theType").val(data.theType);
                    });*/

                    $.session.set("Attacker", JSON.stringify(data));
                    $('#editAttackerOptionsForm').loadJSON(data, null);
                    var tags = data.theTags;
                    var text = "";
                    $.each(tags, function (index, type) {
                        text += type + ", ";
                    });
                    $("#theTags").val(text);
                    $.each(data.theEnvironmentProperties, function (index, env) {
                        $("#theAttackerEnvironments").find("tbody").append("<tr><td><i class='fa fa-minus'></i></td><td class='attackerEnvironments'>" + env.theEnvironmentName + "</td></tr>");
                    });
                    $("#theAttackerEnvironments").find(".threatEnvironments:first").trigger('click');
                  /*
                    $('#editThreatOptionsform').loadJSON(fillerJSON, null);
                    $.each(data.theEnvironmentProperties, function (index, env) {
                        $("#theThreatEnvironments").append("<tr><td><i class='fa fa-minus'></i></td><td class='threatEnvironments'>" + env.theEnvironmentName + "</td></tr>");
                    });
                    $("#theThreatEnvironments").find(".threatEnvironments:first").trigger('click');*/

                }
            );
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
});