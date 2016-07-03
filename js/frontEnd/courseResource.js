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
            fileResourceList_url: 'api/course/fileResource',
            videoResourceList_url: 'api/course/videoResource'
        },
        ENUMS = { // 所有的枚举值(如果二级导航是动态添加的话会用到,赋给data-link)
            TEACHFILE: { // 教学课件
                name: '教学课件',
                value: 123
            },
            TEACHVIDEO: { // 教学视频
                name: '教学视频',
                value: 134
            }
        },
        resourceList_ops = {
            PERROW_SHOWEDNUM: 4, // 一行展示的资源个数
            PERPAGE_COURSENUM: 20, // 一页展示的资源个数
            createRowContainer: function() { // 创建教学课件或者教学视频中的行容器
                return  '<div class="row">' +
                    '</div>';
            },
            createItem: function(data) { // 创建教学课件或者教学视频中的一个列表
                return  '<div class="resource-item col-md-3" data-resourceId="' + data.id + '">' +
                            '<a target="_blank" href="' + URL_LIST.courseItem_url + '">' +
                                '<div class="resource-item-img-warp">' +
                                    '<img src="' + data.imgUrl + '" class="img-responsive">' +
                                '</div>' +
                                '<div class="resource-item-caption">' +
                                    '<div class="line">' +
                                        '<span class="resource-name">' + data.name + '</span>' +
                                    '</div>' +
                                '</div>' +
                            '</a>' +
                        '</div>'
            }
        },
        pagerObj, // 分页栏对象
        createHead = (function() { // 创建界面顶部内容
            $('.header').load('courseView-nav.html');
        }()),
        createContent = function (type) { // 创建右边的内容部分
            switch (~~type) {
                case ENUMS.TEACHFILE.value:
                    createFileResourceList($('.section .articleList'), true);
                    break;
                case ENUMS.TEACHVIDEO.value:
                    createVideoResourceList($('.section .articleList'), true);
                    break;
            }
        },
        createFooter = (function() { // 创建界面底部内容
            $('.footer').load('courseView-footer.html');
        }()),
        createFileResourceList = function ($ele, shouldCreatePager) { // 向指定元素中创建教学课件列表
            $.ajax({
                    url: URL_LIST.fileResourceList_url,
                    data: {
                        id: sessionStorage.currentCourseId,
                        page: 1
                    }
                })
                .done(function(data) {
                    console.log("get resourceList success");

                    var fr_list = data.list,
                        $cs_list_ul = $('<ul class="clearfix"></ul>'),
                        cs_list_li,
                        i;

                    // 显示数据
                    var $resource_list = $('.resourceList').empty(),
                        rp = resourceList_ops,
                        resource_list_row_len = Math.floor($resource_list.length / rp.PERROW_SHOWEDNUM), // 列表的行数
                        $resource_list_row, // 每一行的元素
                        $resource_list_item, // 每一个元素
                        i, j, k; // 循环变量

                    // 先创建行,然后创建列
                    for(i = 0, k = 0; i < resource_list_row_len; i++) {
                        // 创建行
                        $resource_list_row = $(rp.createRowContainer());

                        // 创建列
                        for(j = 0; j < rp.PERROW_SHOWEDNUM; j++, k++) {
                            $resource_list_item = $(rp.createItem({
                                id: data.list[k].id,
                                imgUrl: data.list[k].imageUrl,
                                name: data.list[k].name
                            }));
                        }

                        $resource_list_row.append($resource_list_item); // 插入行中
                        $resource_list.append($resource_list_row); // 插入列表面板中
                    }

                    if(shouldCreatePager) {
                        pagerObj = $('.pager-warp').empty().createPager({
                            ajaxOps: {
                                ajaxFunc: createFileResourceList,
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
        },
        createVideoResourceList = function ($ele, shouldCreatePager) { // 向指定元素中创建教学视频列表
            $.ajax({
                    url: URL_LIST.videoResourceList_url,
                    data: {
                        id: sessionStorage.currentCourseId,
                        page: 1
                    }
                })
                .done(function(data) {
                    var vr_list = data.list,
                        $cs_list_ul = $('<ul class="clearfix"></ul>'),
                        cs_list_li,
                        i;

                    for(i = 0; i < cs_list.length; i++) {
                        cs_list_li = '<li>' +
                            '<a>' + data.list[i].articleName + '</a>' +
                            '<span class="date">' + data.list[i].writeDate + '</span>' +
                            '</li>';

                        $cs_list_ul.append(cs_list_li);
                    }
                    $ele.empty().append(cs_list_ul);

                    if(shouldCreatePager) {
                        pagerObj = $('.pager-warp').empty().createPager({
                            ajaxOps: {
                                ajaxFunc: createVideoResourceList,
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

    // 进入此页面默认加载课程动态
    $(function () {
        $('[data-link=' + ENUMS.TEACHFILE.value + ']').trigger('click');
    })
})(jQuery, window);
