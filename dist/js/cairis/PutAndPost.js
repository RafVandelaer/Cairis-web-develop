/**
 * Created by Raf on 11/05/2015.
 */

//TODO: functions in cairis.js zetten
function updateRequirement(row){
    if ($(row).attr('class') != undefined) {
        // if new Row, POST
        var clazz = $(row).attr('class');
        //Not new anymore now we are Posting it
        $(clazz).removeClass(clazz);
        arr = clazz.split(':');
        var whatKind = arr[0];
        var vall = arr[1];
        postRequirementRow(row,whatKind,vall);
    }
    else{
        //if old row, PUT
        putRequirementRow(row)
    }
}


function reqRowtoJSON(row){
    //TODO: cant replace in object!
    row = row.replace('<tr>','');
    row = row.replace('</tr>','');
    var json = {};
    json.attrs = {};

    console.log(row);
    $(row).filter('td').each(function (i, v) {
        name =  $(v).attr("name");
        if(name != "originator" && name != "rationale" && name != "type" && name != "fitCriterion"){
            json[name] =  v.innerHTML;
        }
        else{
            json.attrs[name] = v.innerHTML;
        }
    });
    return json
}


/*
 Updating the requirementsRow
 */
function putRequirementRow(row){
   json = reqRowtoJSON(row);
    $.ajax({
        type: "PUT",
        dataType: "json",
        contentType: "application/json",
        accept: "application/json",
        //TODO: DATA aanpassen voor PUT
        data: json,
        crossDomain: true,
        url: serverIP + "/api/requirements/update" ,
        success: function (data) {
            showPopup(true);
        },
        error: function (xhr, textStatus, errorThrown) {
            showPopup(false);
            console.log(this.url);
            console.log("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });

}
function postRequirementRow(row,whatKind,value){
    json = reqRowtoJSON(row);
    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        accept: "application/json",
        data: {
            session_id: String($.session.get('sessionID')),
           body: JSON.stringify(json)
        },
        crossDomain: true,
        url: serverIP + "/api/requirements/update?" + whatKind+"="+value.replace(' ',"%20"),
        success: function (data) {
            showPopup(true);
        },
        error: function (xhr, textStatus, errorThrown) {
            showPopup(false);
            console.log(this.url);
            console.log("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });

}

/*
 Updating the requirementsRow
 */
function putAssetProperty(assetSON){
    var ursl = serverIP + "/api/assets/name/"+ assetSON.name.replace(' ',"%20") + "/properties?session_id=" + String($.session.get('sessionID'));
    //console.log("{ 'AssetEnvironmentPropertiesMessage': " + JSON.stringify(assetSON) + "}");
   // console.log($.session.get("UsedProperties"));
    var propsJon = JSON.parse($.session.get("rightEnvironment")).attributes;

    var index = -1;
    /// $.each(assts, function(arrayID,group) {
    $.each(propsJon, function(i, obj){
            if(obj.id == propsJon.id){
                propsJon.attributes[i] = assetSON;
            }
    });
    var dats = JSON.parse($.session.get("rightEnvironment"));
    dats.attributes = propsJon;

    //console.log($.session.get("rightEnvironment"));
    var output = '{ "object": ' + JSON.stringify(dats) + '}';
    console.log(output);

    //TODO: alle, juiste objecten meegeven ($.session.get("rightEnvironment") is de juiste), enkel objects invullen
    $.ajax({
        type: "PUT",
        dataType: "json",
        contentType: "application/json",
        accept: "application/json",
        crossDomain: true,
        data: output,
        url: ursl,
        success: function (data) {
            showPopup(true);
        },
        error: function (xhr, textStatus, errorThrown) {
            showPopup(false);
            console.log(this.url);
            console.log("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
        }
    });
}