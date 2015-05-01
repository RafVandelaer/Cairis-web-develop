/**
 * Created by Raf on 1/05/2015.
 */
$( document ).ajaxComplete(function() {
    $("svg > g > g .node > a ").on('click', function (event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        var link = $(this).attr("xlink:href");

        if(link.indexOf("assets") > -1) {
            $.ajax({
                type: "GET",
                dataType: "json",
                accept: "application/json",
                data: {
                    session_id: String($.session.get('sessionID'))
                },
                crossDomain: true,
                url: serverIP + link.replace(" ", "%20"),
                success: function (data) {
                    /*
                     Explanation: Because the options menu is used in multiple cases, I read in the used HTML from a template.
                     Then, because the reading of this html goed Async (as with every jQuery method), I give my data and the ID's so I can fill it after
                     the read of the template is done.
                     */
                    forceOpenOptions();
                    var dataArr = [];
                    dataArr["#theName"] = String(data.theName);
                    dataArr["#theDescription"] = String(data.theDescription);
                    dataArr["#theSignificance"] = String(data.theSignificance);
                    readText("../../CAIRIS/fastTemplates/AssetOptions.html", "#optionsContent", dataArr,false,true);
                },
                error: function (xhr, textStatus, errorThrown) {
                    console.log(this.url);
                    var err = eval("(" + xhr.responseText + ")");
                    console.log("error: " + err + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
                }

            });
        }else if(link.indexOf("personas") > -1) {
            forceOpenOptions();
            readText("../../CAIRIS/fastTemplates/PersonaProperties.html", "#optionsContent",null,true,false);
            $(function() {
                $( "#tabs" ).tabs();
            });

        }


    });
});