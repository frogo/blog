var app = function() {
    var e = function() {
            t(), o(), a(), l(), n(), i(), g()
            //t(), o(), a(),  n(), i()
        },
        t = function() {
            $("#toggle-left").tooltip()
        },
        n = function() {
            $(".actions > .fa-chevron-down").click(function() {
                $(this).parent().parent().next().slideToggle("fast"), $(this).toggleClass("fa-chevron-down fa-chevron-up")
            })
        },
        o = function() {
            $("#toggle-left").bind("click", function(e) {
                $(".sidebarRight").hasClass(".sidebar-toggle-right") || ($(".sidebarRight").removeClass("sidebar-toggle-right"), $(".main-content-wrapper").removeClass("main-content-toggle-right")), $(".sidebar").toggleClass("sidebar-toggle"), $(".main-content-wrapper").toggleClass("main-content-toggle-left"), e.stopPropagation()
            })
        },
        a = function() {
            $("#toggle-right").bind("click", function(e) {
                $(".sidebar").hasClass(".sidebar-toggle") || ($(".sidebar").addClass("sidebar-toggle"), $(".main-content-wrapper").addClass("main-content-toggle-left")), $(".sidebarRight").toggleClass("sidebar-toggle-right animated bounceInRight"), $(".main-content-wrapper").toggleClass("main-content-toggle-right"), $(window).width() < 660 && ($(".sidebar").removeClass("sidebar-toggle"), $(".main-content-wrapper").removeClass("main-content-toggle-left main-content-toggle-right")), e.stopPropagation()
            })
        },
        i = function() {
            $(".actions > .fa-times").click(function() {
                $(this).parent().parent().parent().fadeOut()
            })
        },
        l = function() {
            $("#leftside-navigation .sub-menu > a").click(function(e) {
                $("#leftside-navigation ul ul").slideUp(), $(this).next().is(":visible") || $(this).next().slideDown(), e.stopPropagation()
            })
        },
        g = function() {
            $('#myModal').on('show.bs.modal', function (e) {
                var $realtedTarget = $(e.relatedTarget),
                    dataUrl = $realtedTarget.attr('data-url'),
                    dataType = $realtedTarget.attr('data-type'),
                    dataToken = $realtedTarget.attr('data-token')

                $(this).attr('data-url',dataUrl)
                $(this).attr('data-type',dataType)
                $(this).attr('data-token',dataToken)
                if($realtedTarget.hasClass('gallery-remove')){
                    if($(this).find('.deleteOriginal').hasClass('dis_none')){
                        $(this).find('.deleteOriginal').removeClass('dis_none')
                    }
                }
                $(this).find('button.confirm').off('click')
                $(this).find('button.confirm').on('click',$realtedTarget,h)

                //判断是否绑定事件，保证绑定1次
/*                var objEvt = $._data($(this).find('button.confirm')[0], 'events');
                if (!objEvt || !objEvt['click']) { }*/

            })

        },
        h= function(e) {
            var $modal = $(e.currentTarget).parents('.modal') ,
                url = $modal.attr('data-url'),
                 dataType = $modal.attr('data-type'),
                 token = $modal.attr('data-token'),
                 item = e.data.parents('.gallery-item'),
               checked = $modal.find('.deleteOriginal input')[0].checked;

            if(dataType || dataType === 'ajax'){
                if(checked){
                    $.post(url, {
                        _csrf: token
                    }, function(json) {
                        if(json.success) {
                            item.remove();
                            $modal.modal('hide')
                        } else{
                            alert('删除失败')
                            $modal.modal('hide')
                        }
                    });
                }else{
                    item.remove();
                    $modal.modal('hide')
                }

            } else {
                window.location.href = url;
            }
        },
        s = function() {
            $(".timer").countTo()
        };
    return {
        init: e,
        timer: s
    }
}();
$(document).ready(function() {
    app.init()
});

