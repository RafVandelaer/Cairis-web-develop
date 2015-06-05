$("#risksClick").click(function () {
    createRisksTable();
});

function createRisksTable(){

    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/risks",
        success: function (data) {
            window.activeTable = "Risks";
            setTableHeader();
            var theTable = $(".theTable");
            $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
            var textToInsert = [];
            var i = 0;

            $.each(data, function(key, item) {
                textToInsert[i++] = "<tr>";
                textToInsert[i++] = '<td><button class="editRiskButton" value="' + key + '">' + 'Edit' + '</button> ' +
                    '<button class="deleteRiskButton" value="' + key + '">' + 'Delete' + '</button></td>';

                textToInsert[i++] = '<td name="theName">';
                textToInsert[i++] = key;
                textToInsert[i++] = '</td>';

                textToInsert[i++] = '</tr>';
            });

            theTable.append(textToInsert.join(''));
            theTable.css("visibility","visible");
            activeElement("reqTable");
            sortTableByRow(1);

        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    })
}
//fillOptionMenu("fastTemplates/editAttackerOptions.html", "#optionsContent", null, true, true, function () {
$(document).on('click', '.editRiskButton', function () {

    var name = $(this).val();
    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crossDomain: true,
        url: serverIP + "/api/risks/name/" + name.replace(" ", "%20"),
        success: function (data) {
            // console.log(JSON.stringify(rawData));
            fillOptionMenu("fastTemplates/editRiskOptions.html", "#optionsContent", null, true, true, function () {
                    forceOpenOptions();
                    var threatSelect = $("#theThreatNames");
                    var vulnSelect = $("#theVulnerabilityNames");
                    getThreats(function (data) {
                        $.each(data, function (key, obj) {
                            threatSelect.append($("<option></option>")
                                    .attr("value",key)
                                    .text(key));
                        });
                    });
                    getVulnerabilities(function (data) {
                        $.each(data, function (key, obj) {
                            vulnSelect.append($("<option></option>")
                                .attr("value",key)
                                .text(key));
                        });
                    });
                    $("#theName").text(data.theName);
                    //TODO: TAGS
                    $.each(data.theEnvironmentProperties, function (index, env) {
                        appendRiskEnvironment(env.theEnvironmentName);
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

//TODO> to CAIRIS.js
function getThreats(callback){
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
function getVulnerabilities(callback){
    $.ajax({
        type: "GET",
        dataType: "json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID'))
        },
        crfossDomain: true,
        url: serverIP + "/api/vulnerabilities",
        success: function (data) {
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
function appendRiskEnvironment(environment){
    $("#theRiskEnvironments").find("tbody").append('<tr></td><td class="riskEnvironment">'+environment+'</td></tr>');
}