/**
 * Created by Raf on 30/04/2015.
 */

function readText(filePath,theElement) {
    jQuery.get(filePath, function(data) {
        var el = $(theElement);
        el.html(data); //display output in DOM
    });
}
