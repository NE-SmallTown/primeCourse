(function ($, global) {
    // 设置AJAX的全局默认选项
    (function() {
        $.ajaxSetup({
            type: "get",
            dataType: "json",
            error: function(jqXHR, textStatus, errorMsg){
                console.log('status: ' + textStatus + ' msg: ' + errorMsg);
            }
        });
    }());

    // 通用变量，便于管理
    var URL_LIST = {

        },
        createHead = (function() { // 创建界面顶部内容
            $('.header').load('courseView-nav.html');
        }()),
        createFooter = (function() { // 创建界面底部内容
            $('.footer').load('courseView-footer.html');
        }());
})(jQuery, window);