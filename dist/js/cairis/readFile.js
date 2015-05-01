/**
 * Created by Raf on 30/04/2015.
 */
//TODO: Naam veranderen naar iets van GEAROptions
function readText(filePath,theElement,theData,createTabs,optionsHeader) {
    jQuery.get(filePath, function(data) {
        var optionsDIV = $("#optionsHeaderGear");
        if(optionsHeader){
            if(!optionsDIV.is(":visible")){
                optionsDIV.show();
                $("#rightnavMenu").css("padding","10px");
            }
        }else{
            optionsDIV.hide();
            $("#rightnavMenu").css("padding","0px");
        }

        var el = $(theElement);
        el.empty();
        el.append(data); //display output in DOM

        for (var key in theData) {
            if (theData.hasOwnProperty(key)) {
                var value = theData[key];
                // Use `key` and `value`
                console.log("ID: " + key + " Value: " + String(value));
                $(key).attr("value",String(value));
            }
        }
        if(createTabs){
            $(function() {
                $( "#tabs" ).tabs();
            });
        }

    });
}
