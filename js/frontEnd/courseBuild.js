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
            BASE: 'http://localhost:7792/',
            articleList_url: 'api/course/article'
        },
        ENUMS = { // 所有的枚举值(如果二级导航是动态添加的话会用到,赋给data-link)
            COURSESITUATION: { // 课程动态
                name: '课程动态',
                value: 11
            }
        },
        createHead = (function() { // 创建界面顶部内容
            $('.header').load('courseView-nav.html', function () {
                $('nav .title').text(sessionStorage.courseName);
            });
        }()),
        createContent = function (type) { // 创建右边的内容部分
            switch (~~type) {
                case ENUMS.COURSESITUATION.value:
                    createArticleList($('.section .articleList'), true);
                    break;
            }
        },
        createFooter = (function() { // 创建界面底部内容
            $('.footer').load('courseView-footer.html');
        }()),
        createArticleList = function ($ele, shouldCreatePager) { // 向指定元素中创建文章列表
            $.ajax({
                url: URL_LIST.BASE + URL_LIST.articleList_url,
                data: {
                    id: sessionStorage.currentCourseId,
                    page: 1
                },
            })
            .done(function(data) {
                var ar_list = data.list,
                    ar_list_len = ar_list.length,
                    $ar_list_ul = $('<ul class="clearfix"></ul>'),
                    ar_list_li,
                    i;

                for(i = 0; i < ar_list_len; i++) {
                    ar_list_li = '<li>' +
                                     '<a>' + ar_list[i].title + '</a>' +
                                     '<span class="date">' + ar_list[i].editAt.substr(0, ar_list[i].editAt.indexOf('T')) + '</span>' +
                                 '</li>';

                    $ar_list_ul.append(ar_list_li);
                }
                $ele.empty().append($ar_list_ul);

                if(shouldCreatePager) {
                    pagerObj = $('.pager-wrap').empty().createPager({
                        ajaxOps: {
                            ajaxFunc: createArticleList,
                            ajaxFuncArgs: false
                        },
                        pages: data.totalPage
                    });
                }

                // 更新总条数
                if($('.pageNumInfo').length > 0) {
                    $('.pageNumInfo').text('共有' + data.count + '条记录');
                } else {
                    $('.pager-warp').append('<div class="pageNumInfo">共有' + data.count + '条记录</div>');
                }
            });
        };

    // 绑定各个分类的点击事件
    (function () {
        $('body').on('click', '[data-link]', function () {
            // 如果点击的是当前导航，则不做出相应
            if($(this).hasClass('active')) {
                return false;
            }

            var linkValue = $(this).attr('data-link'),
                i;

            // 先去掉之前的active，并给点击的元素添加active
            $(this).siblings().removeClass('active');
            $(this).addClass('active');

            // 更改位置栏相应信息
            $('.section .postion span:last').text(function () {
                for(i in ENUMS) {
                    if(ENUMS[i].value == linkValue) {
                        return ENUMS[i].name;
                    }
                }
            });

            // 然后发起请求
            createContent(linkValue);
        });
    }());

    // 进入此页面默认加载课程动态
    $(function () {
        $('[data-link=' + ENUMS.COURSESITUATION.value + ']').trigger('click');
    })
})(jQuery, window);
