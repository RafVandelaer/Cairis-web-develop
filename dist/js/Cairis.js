/**
 * Created by Raf on 24/04/2015.
 */
window.serverIP = "http://192.168.112.129:7071";
//var yetVisited = localStorage['visited'];


$( document ).ready(function() {
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

//The config window at start
var dialogwindow = $( "#dialogContent" ).dialog({
    autoOpen: false,
    modal: true,
    buttons: {
        OK: function() {

            $.ajax({
                type: 'POST',
                url: serverIP + '/user/config',
                data: $('#configForm').serializeArray(),
                accept:"application/json",
                success: function(data, status, xhr) {
                    // console.log("DB Settings saved");
                    console.log(data);
                    sessionID = data.split("=")[1];
                    $.session.set("sessionID", sessionID);
                   startingTable();

                },
                error: function(data, status, xhr) {
                    var err = eval("(" + xhr.responseText + ")");
                    alert(err.message);
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

//Just for debug
$("#testingButton").click(function(){

});

//For debug
$("#removesessionButton").click(function() {
    $.session.remove('sessionID');
    location.reload();
});
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
                url: serverIP + "/api/requirements/filter/" + encodeURIComponent(selection),
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
                url: serverIP + "/api/requirements/filter/" + encodeURIComponent(selection),
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
A function for filling the table
 */
function createRequirementsTable(data){
     var tre;
    $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
    $.each(data, function(index, item) {
        var name = " ";
        var desc = " ";
        if(item.theName.trim()){
            name = item.theName;
        }
        if(item.theDescription.trim()){
            desc = item.theDescription;
        }

        tre = $('<tr>');
        tre.append("<td name=" +item.theLabel + "  >" + item.theLabel + "</td>");
        tre.append("<td name=" +name + "  contenteditable=true>" + name + "</td>");
        tre.append("<td name=" +desc + "  contenteditable=true>" + desc + "</td>");
        tre.append("<td name=" +item.thePriority + "  contenteditable=true>" + item.thePriority + "</td>");


        var datas = eval(item.attrs); // this will convert your json string to a javascript object
        for (var key in datas) {
            if (datas.hasOwnProperty(key)) {
                if(key == ("originator") | key == ("rationale") | key == ("fitCriterion") | key == ("type")) {
                    // alert(key+': '+datas[key]); // this will show each key with it's value
                    tre.append("<td name=" + key + " contenteditable=true >" + datas[key] + "</td>");
                }
            }
        }
        tre.append('</tr>')
        $('.theTable').append(tre);
    });

    $('.theTable').css("visibility","visible");
}
/*
Function for adding a row to the table
 */
$("#addReq").click(function() {
    var clonedRow = $("#reqTable tr:last").clone();
   $("#reqTable").append(clonedRow);
    $('#reqTable tr:last td').each(function() {
        $(this).html("")
    });
});

/*
Removing the active tr
 */
$("#removeReq").click(function() {
    var oldrow = $("tr").eq(getActiveindex() + 1).detach();
    //of remove
    //TODO: AJAX CALL BEFORE REMOVE
});
/*
Function for creating the comboboxes
 */
function createComboboxes(){

    //Assetsbox
   $.ajax({
           type:"GET",
           dataType: "json",
           accept:"application/json",
           data: {session_id: String($.session.get('sessionID'))},
           crossDomain: true,
       //Had to be sync, otherwise cherrypy could crash
            async: false,
            url: serverIP + "/api/assets/all",

            success: function(data){
                // we make a successful JSONP call!
                var options = $("#assetsbox");
                $.each(data, function() {
                    options.append($("<option />").val(this).text(this));
                });
                $(".topCombobox").css("visibility", "visible");
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log(this.url);
                var err = eval("(" + xhr.responseText + ")");
                //alert(err.message);
                console.log("error: " + err + ", textstatus: "  +textStatus + ", thrown: "+ errorThrown);
             }

        });
    //RequirementsBox
    $.ajax({
        type:"GET",
        dataType: "json",
        async: false,
        accept:"application/json",
        data: {session_id: String($.session.get('sessionID'))},
        crossDomain: true,
        url: serverIP + "/api/environments/all/names",

        success: function(data){
            // we make a successful JSONP call!
            var boxoptions = $("#environmentsbox");
            $.each(data, function() {
                boxoptions.append($("<option />").val(this).text(this));
            });
            boxoptions.css("visibility", "visible");
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log(this.url);
            var err = eval("(" + xhr.responseText + ")");
            //alert(err.message);
            console.log("error: " + err + ", textstatus: "  +textStatus + ", thrown: "+ errorThrown);
        }

    });

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
        data: {session_id: String($.session.get('sessionID'))},
        crossDomain: true,
        url: serverIP + "/api/requirements/all",

        success: function(data) {
            // $("#test").append(JSON.stringify(data));
            createRequirementsTable(data);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log(this.url);
            var err = eval("(" + xhr.responseText + ")");
            //alert(err.message);
            console.log("error: " + err + ", textstatus: "  +textStatus + ", thrown: "+ errorThrown);
        }
    });
}










