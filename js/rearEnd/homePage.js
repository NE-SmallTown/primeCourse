(function ($, global) {
    // 通用变量，便于管理
    var URL_LIST = {
            BASE: 'http://localhost:7792/'
        },
        createRightContent = (function () { // 创建右边部分的内容
            var section_html = '<div class="tip">' +
                '<div class="title">欢迎来到重庆理工大学精品课程后台管理系统</div>' +
                '<div class="content">如有疑问，咨询电话: 13756296215</div>' +
                '</div>';

            $('.section').html(section_html);
        }());
})(jQuery, window);
