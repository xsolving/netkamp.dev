//MENU
 $('#identity_link').click(function() {
		$("html, body").animate({ scrollTop: $('#identity_div').offset().top - 50}, 'fast');
		ifmobileclose();
 });
 $('#statement_link').click(function() {
		$("html, body").animate({ scrollTop: $('#statement_div').offset().top - 50}, 'fast');
		ifmobileclose();
});
 $('#detailmovements_link').click(function() {
		$("html, body").animate({ scrollTop: $('#detailmovements_div').offset().top -50}, 'fast');
		ifmobileclose();
});
 $('#detailstays_link').click(function() {
		$("html, body").animate({ scrollTop: $('#detailstays_div').offset().top -50}, 'fast');
		ifmobileclose();
 });

function ifmobileclose() {
	var wSize = $(window).width();
	if (wSize <= 768) {
		       sidebarclose();
		    }

}
 
/*---LEFT BAR ACCORDION----*/
$(function() {
    $('#nav-accordion').dcAccordion({
        eventType: 'click',
        autoClose: false,
        saveState: true,
        disableLink: true,
        speed: 'slow',
        showCount: false,
        autoExpand: true,
//        cookie: 'dcjq-accordion-1',
        classExpand: 'dcjq-current-parent'
    });
});

var Script = function () {


//    sidebar dropdown menu auto scrolling

    jQuery('#sidebar .sub-menu > a').click(function () {
        var o = ($(this).offset());
        diff = 250 - o.top;
        if(diff>0)
            $("#sidebar").scrollTo("-="+Math.abs(diff),500);
        else
            $("#sidebar").scrollTo("+="+Math.abs(diff),500);
    });



//    sidebar toggle

    $(function() {
        function responsiveView() {
            var wSize = $(window).width();
            if (wSize <= 768) {
                $('#container').addClass('sidebar-close');
                $('#sidebar > ul').hide();
            }
            
            if (wSize > 768) {
                $('#container').removeClass('sidebar-close');
                $('#sidebar > ul').show();
            }
            
        }
        $(window).on('load', responsiveView);
        $(window).on('resize', responsiveView);
    });

    $('.fa-bars').click(function (e) {
        togglesidebar();
        e.preventDefault();
        e.stopPropagation();
		return false;
    });

// custom scrollbar
    $("#sidebar").niceScroll({styler:"fb",cursorcolor:"#09477A", cursorwidth: '3', cursorborderradius: '10px', background: '#404040', spacebarenabled:false, cursorborder: ''});

    $("html").niceScroll({styler:"fb",cursorcolor:"#09477A", cursorwidth: '6', cursorborderradius: '10px', background: '#404040', spacebarenabled:false,  cursorborder: '', zindex: '1000'});

// widget tools

    jQuery('.panel .tools .fa-chevron-down').click(function () {
        var el = jQuery(this).parents(".panel").children(".panel-body");
        if (jQuery(this).hasClass("fa-chevron-down")) {
            jQuery(this).removeClass("fa-chevron-down").addClass("fa-chevron-up");
            el.slideUp(200);
        } else {
            jQuery(this).removeClass("fa-chevron-up").addClass("fa-chevron-down");
            el.slideDown(200);
        }
    });

    jQuery('.panel .tools .fa-times').click(function () {
        jQuery(this).parents(".panel").parent().remove();
    });


//    tool tips

    $('.tooltips').tooltip();

//    popovers

    $('.popovers').popover();



// custom bar chart

    if ($(".custom-bar-chart")) {
        $(".bar").each(function () {
            var i = $(this).find(".value").html();
            $(this).find(".value").html("");
            $(this).find(".value").animate({
                height: i
            }, 2000)
        })
    }


}();

function togglesidebar() {
	if ($('#sidebar > ul').is(":visible") === true) {
            sidebarclose();
        } else {
            sidebaropen();
        }
}
function sidebarclose() {
	$('#main-content').css({
		'margin-left': '0px'
	});
	$('#sidebar').css({
		'margin-left': '-210px'
	});
	$('#sidebar > ul').hide();
	$("#container").addClass("sidebar-closed");
 
	return false;
}

function sidebaropen() {
	$('#main-content').css({
                'margin-left': '210px'
            });
            $('#sidebar > ul').show();
            $('#sidebar').css({
                'margin-left': '0'
            });
            $("#container").removeClass("sidebar-closed");
           
         return false;
}