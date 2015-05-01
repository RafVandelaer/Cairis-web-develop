/**
 * Created by Raf on 24/04/2015.
 */


$(window).load(function(){

    resizable();
    makeHorizontalScrollbar();

    //slimscroll for the nav
    $('#sidebar-scrolling').slimScroll({
        height: $('.main-sidebar').height() - 20
        //height: $('.main-sidebar').height(),
        //alert("slimscroll Done")
    });

    var mainh = $(".main-header");
    var footh = $(".main-footer");
    //slimscroll for the content
    $('#maincontent').slimScroll({
        height: $('.content-wrapper').outerHeight() - (mainh.height() + footh.height())
    });


   // console.log("Header:" + mainh.height()+ ", Footer: " + footh.height())
    //For the gear, making it retractable
    $('#rightnavGear').click(function(){
        openOptions();
    });
    $(".imgwrapper").hover(function(){

        var p = $(this).find("p");
        $("#inform").text(p.text());

    });
    activeElement("reqTable");



    /*
     FOR JSON
     $.ajax({
     type: 'GET',
     url: 'http://example/functions.php',
     data: { get_param: 'value' },
     dataType: 'json',
     success: function (data) {
     $.each(data, function(index, element) {
     $('body').append($('<div>', {
     text: element.name
     }));
     });
     }
     });

     or use the $.getJSON method:

     $.getJSON('/functions.php', { get_param: 'value' }, function(data) {
     $.each(data, function(index, element) {
     $('body').append($('<div>', {
     text: element.name
     }));
     });
     });

     */

});

$( window ).resize(function() {
    resizable()
});

/*
 Created for the scrollbar on the top navbar
 */
function makeHorizontalScrollbar() {
    $(".navbar-custom-menu").mCustomScrollbar({
        axis: "x",
        scrollbarPosition: "inside",
        advanced:{ autoExpandHorizontalScroll: true }
        // setWidth: false
    });
}
/*
For opening the right options menu
 */
function openOptions(){
    var navGear = $('#rightnavGear');
    var navMenu = $('#rightnavMenu');
    if (!navGear.hasClass("open")) {
        navGear.animate({"right": "500px"});
        navMenu.animate({"right": "0"});
        navGear.addClass("open");
    } else {
        navGear.animate({"right": "0"});
        navMenu.animate({"right": "-500px"});
        navGear.removeClass("open");
    }
}
/*
 For forcing opening the right options menu
 */
function forceOpenOptions(){
    var navGear = $('#rightnavGear');
    var navMenu = $('#rightnavMenu');
    if (!navGear.hasClass("open")) {
        navGear.animate({"right": "500px"});
        navMenu.animate({"right": "0"});
        navGear.addClass("open");
    }
}

/*
 Created for the top navbar, which in AdminLTE didn't stick on top.
 */
function resizable() {

    var collapser = $('.sidebar-toggle').outerWidth();
    var docWidth = $(document).width();
    //Was 770
    if ($(window).width() > 0) {
        var logo = $('.logo').outerWidth();
        //If logo takes whole screen
        if (logo > 230) {
            // console.log("logo to big")
            $('.navbar-custom-menu').width(docWidth - (collapser));
        } else {
            $('.navbar-custom-menu').outerWidth(docWidth - (logo + collapser + 20));

            var actwidth = (docWidth - (logo + collapser - 7));
            $("ul.nav.navbar-nav").css("float", "right")
        }
    }
}