/**
 * Created by Raf on 22/05/2015.
 */
/*
I've made this file to make it easier for me to program. everything (except PUT POST and DELETE) or the threats will be coded here
 It is possible that I will use some already developed functions inside some other files
 */
$("#threatsClick").click(function () {
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
            createThreatsTable(data);
            activeElement("reqTable");
            sortTableByRow(0);
        },
        error: function (xhr, textStatus, errorThrown) {
            debugLogger(String(this.url));
            debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    })
});

/*
 A function for filling the table with Threats
 */
function createThreatsTable(data){
    var theTable = $(".theTable");
    $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    //var arr = reallyLongArray;
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

    // theRows[j++]=textToInsert.join('');
    theTable.append(textToInsert.join(''));

    theTable.css("visibility","visible");
}