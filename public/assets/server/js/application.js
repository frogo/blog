var app = function() {
    var e = function() {
          g()
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
        };
    return {
        init: e
    }
}();
$(document).ready(function() {
    app.init()
});

