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
            BASE: 'http://localhost:7792/ProjectDesign/',
            courseIntro_url: 'api/course/field'
        },
        ENUMS = { // 所有的枚举值(如果二级导航是动态添加的话会用到,赋给data-link)
            COURSEINTRO: { // 课程简介
                name: '课程简介',
                value: 0
            },
            COURSEARRANGE: { // 课程安排
                name: '课程安排',
                value: 1
            },
            COURSETARGET: { // 课程目标
                name: '课程目标',
                value: 2
            },
            COURSETEACHMETHOD: { // 教学方法
                name: '教学方法',
                value: 3
            },
            COURSESYLLABUS: { // 课程大纲
                name: '课程大纲',
                value: 4
            }
        },
        createHead = (function() { // 创建界面顶部内容
            $('.header').load('courseView-nav.html');
        }()),
        createContent = function (filed) { // 创建右边的内容部分
            $.ajax({
                url: URL_LIST.BASE + URL_LIST.courseIntro_url,
                data: {
                    id: sessionStorage.currentCourseId,
                    field: filed
                },
            })
            .done(function(data) {
                $('.section .content').html(data.value);
            });
        },
        createFooter = (function() { // 创建界面底部内容
            $('.footer').load('courseView-footer.html');
        }());
    
    // 绑定各个分类的点击事件
    (function () {
        $('body').on('click', '[data-link]', function () { // 课程简介
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

    // 进入此页面默认加载课程简介
    $(function () {
        $('[data-link=' + ENUMS.COURSEINTRO.value + ']').trigger('click');
    })
})(jQuery, window);
