(function ($, global) {
    //设置AJAX的全局默认选项
    $.ajaxSetup({
        type: "get",
        dataType: "json",
        error: function(jqXHR, textStatus, errorMsg){
            console.log('status: ' + textStatus + ' msg: ' + errorMsg);
        }
    });

    // 通用变量，便于管理
    var URL_LIST = { // 本页面需要用到的url
            BASE: 'http://localhost:7792/',
            IMGBASE: 'http://localhost:7792',
        	classification_url: 'api/courseoption/treeview', // 请求分类的url
        	courseList_url: 'api/course/slist', // 请求课程列表的url
            courseItem_url: 'courseView.html' // 请求具体某门课程的url
        },
        courseList_ops = { // 课程列表相关的配置
            ORDER_BY: { // 获取课程时的排序方式
                BY_DATE: 2,
                BY_HOT: 1
            },
            PERROW_SHOWEDNUM: 4, // 一行展示的课程个数
            PERPAGE_COURSENUM: 20, // 一页展示的课程个数
            createRowContainer: function() { // 创建课程列表中的行容器
                return  '<div class="row">' +
                        '</div>';
            },
            createItem: function(data) { // 创建课程列表中的一个列表
                return  '<div class="course-item col-md-3" data-courseId="' + data.id + '">' +
                            '<a target="_blank" href="' + URL_LIST.courseItem_url + '">' +
                                '<div class="course-item-img-warp">' +
                                    '<img src="' + URL_LIST.IMGBASE + data.imgUrl + '" class="img-responsive">' +
                                '</div>' +
                                '<div class="course-item-caption">' +
                                    '<div class="line">' +
                                        '<span class="course-name">' + data.name + '</span>' +
                                    '</div>' +
                                    '<div class="line">' +
                                        '<span class="course-teacher">开课教师: ' + data.teacher + '</span>' +
                                    '</div>' +
                                    '<div class="line clearfix">' +
                                        '<span class="course-date">开课时间: ' + data.date.substr(0, data.date.indexOf('T')) + '</span>' +
                                        '<span class="course-visits">' + data.visits + '人访问</span>' +
                                    '</div>' +
                                '</div>' +
                            '</a>' +
                        '</div>'
            },
            _bindCouseItemClick: (function() { // 给每门课程绑定点击事件,存储课程id,跳转后使用
                $('body').on('click', '.course-item > a', function(event) {
                    sessionStorage.currentCourseId = $(this).parent().attr('data-courseId');
                });
            }())
        },
        classification_ops = { // 分类相关的配置
            ACD_ALL_ID: 0, // 学院这一级分类中"全部"这个选项的ID,这个值与后台协商好
            TYPE_ALL_ID: 0, // 类别这一级分类中"全部"这个选项的ID,这个值与后台协商好
            TOP_P_ID: null, // 最顶层的类别没有父级了,他的data-p-id用约定好的一个值表示
            data: [],
            getSubClassification: function(pid) { // 获取对应pid下的分类
                var i, j, data = this.data, data_len = data.length
                    allList = [];

                // 点击的是'全部'
                if(pid == classification_ops.ACD_ALL_ID) {
                    for(i = 0; i < data_len; i++) {
                        for(j = 0; j < data[i].list.length; j++) {
                            allList.push(data[i].list[j]);
                        }
                    }

                    return allList;
                }

                for (i = 0; i < data_len; i++) {
                    if(pid == data[i].id) {
                        return data[i].list;
                    }
                }
            },
            createItem: function(pid, id, text) { // 创建分类中的一个dom元素
                return '<li class="content-item">' +
                            '<a ' + 'data-pid=' + pid + ' data-id=' + id +  ' >' + text + '</a>' +
                        '</li>';
            }
        },
        current_ops = { // 当前用户选择的配置参数
            pid: null,
            id: null,
            orderBy: courseList_ops.ORDER_BY.BY_DATE
        },
        pagerObj, // 分页栏对象
        ajaxCourseList = function (shouldCreatePager) { // 请求课程数据,构建课程列表
            return $.ajax({
                        url: URL_LIST.BASE + URL_LIST.courseList_url,
                        data: {
                            "optionId": current_ops.pid, // 学院
                            "genresId": current_ops.id, // 类别
                            "perPage": courseList_ops.PERPAGE_COURSENUM, // 一页的课程数
                            "orderBy": current_ops.orderBy, // 排序方式
                            "page": shouldCreatePager ? 1 : pagerObj ? pagerObj.curPage : 1  // 请求的是第几页
                        }
                    })
                    .then(function(courseListData) {
                        console.log("get courseList success");

                        // 显示数据
                        var $course_list = $('.course-list').empty(),
                            cp = courseList_ops,
                            course_list_row_len = Math.ceil(courseListData.list.length / cp.PERROW_SHOWEDNUM), // 列表的行数
                            $course_list_row, // 每一行的元素
                            $course_list_item, // 每一个元素
                            i, j, k; // 循环变量

                        // 先创建行,然后创建列
                        for(i = 0, k = 0; i < course_list_row_len; i++) {
                            // 创建行
                            $course_list_row = $(cp.createRowContainer());

                            // 创建列
                            for(j = 0; courseListData.list[k] && j < cp.PERROW_SHOWEDNUM; j++, k++) {
                                $course_list_item = $(cp.createItem({
                                    id: courseListData.list[k].id,
                                    imgUrl: courseListData.list[k].imageUrl,
                                    name: courseListData.list[k].name,
                                    teacher: courseListData.list[k].teacherName,
                                    date: courseListData.list[k].openDate,
                                    visits: courseListData.list[k].view
                                }));

                                $course_list_row.append($course_list_item); // 将列插入行中
                            }

                            $course_list.append($course_list_row); // 将行插入列表面板中
                        }

                        // 判断是否需要创建分页栏
                        if(shouldCreatePager) {
                            pagerObj = $('.pager-warp').empty().createPager({
                                ajaxOps: {
                                    ajaxFunc: ajaxCourseList,
                                    ajaxFuncArgs: false
                                },
                                pages: courseListData.totalPage
                           });
                        }

                        // 更新总条数
                        if($('.pageNumInfo').length > 0) {
                            $('.pageNumInfo').text('共有' + courseListData.count + '条记录');
                        } else {
                            $('.pager-warp .pagination').after('<div class="pageNumInfo">共有' + courseListData.count + '条记录</div>');
                        }                      
                    });
        };

    // 构建一级分类 (即学院)
    (function() {
        $.ajax({
        	url: URL_LIST.BASE + URL_LIST.classification_url
        })
        .done(function(clf_data) {
            clf_data = clf_data.list;
        	console.log("get classification success");            
            classification_ops.data = clf_data; // 先赋值给外部变量，其他地方会用到

            // 开始构建
            var clf_ops = classification_ops,
                $nav_acd = $('#course-nav-acd .content-warp'), // 学院
                TOP_P_ID = clf_ops.TOP_P_ID,
                appendHtml = '',
                i;

            appendHtml += clf_ops.createItem(TOP_P_ID, clf_ops.ACD_ALL_ID, '全部'); // 首先添加"全部"选项
            for(i = 0; i < clf_data.length; i++) {
                appendHtml += clf_ops.createItem(TOP_P_ID, clf_data[i].id, clf_data[i].name);
            }

            // 最后插入
            $nav_acd.append(appendHtml);
        });
    }());
    // 为学院和类别添加click事件
    (function() {
        // 点击学院,显示对应的类别
        $('body').on('click', '#course-nav-acd li', function(event) {
            var $self = $(this).children('a'),
                id = $self.attr('data-id'),
                $nav_type = $('#course-nav-type .content-warp'),
                $createdUl = $nav_type.children('ul[data-pid=' + id + ']');

            // 取消之前的高亮
            $(this).removeClass('on').siblings().removeClass('on');
            $(this).addClass('on');

            // 先隐藏之前的类别面板
            $nav_type.children('ul').css('display', 'none');
            // 如果之前已经创建过这个类别的面板，直接显示即可
            if($createdUl.length > 0) {
                $createdUl.css('display', 'block');
                $createdUl.find('li.on').removeClass('on').siblings().removeClass('on');

                return false;
            }

            // 没有创建过的话则创建
            var clf_ops = classification_ops,
                subClf = clf_ops.getSubClassification(id),
                appendHtml = '',
                i;
            // 依次创建类别
            appendHtml += clf_ops.createItem($('#course-nav-acd li.on').children().attr('data-id'), clf_ops.TYPE_ALL_ID, '全部'); // 首先添加"全部"选项
            for(i = 0; i < subClf.length; i++) {
                appendHtml += clf_ops.createItem(id, subClf[i].id, subClf[i].name);
            }

            // 最后添加到类别面板中
            $nav_type.append($('<ul' + ' data-pid=' + id + ' ></ul>').append(appendHtml));
            
            return false;
        });
        
        // 点击类别，加载对应类别的数据
        $('body').on('click', '#course-nav-type li', function(event) {
            var $self = $(this).children('a'),
                pid = $self.attr('data-pid'),
                id = $self.attr('data-id'),
                old_pid = current_ops.pid,
                old_id = current_ops.id,
                i;
            
            current_ops.pid = pid, // 更新当前分类的pid
            current_ops.id = id, // 更新当前分类的id
            
            // 首先移除之前的高亮,然后将对应的学院和点击的类别高亮显示
            $(this).removeClass('on').siblings().removeClass('on');
            $(this).addClass('on');

            // 发起请求,构建课程列表
            ajaxCourseList(true);

            return false;
        });
    }());

    // 为排序方式(即"最热","最新")添加click事件
    (function() {
        $('body').on('click', '.course-toolbar .toolbar-left a', function(event) {
            var $self = $(this);

            // 去除之前的高亮,并将点击的高亮
            $('.course-toolbar .toolbar-left').find('a[class*="active"]').removeClass('active');
            $self.addClass('active');

            // 更新当前选择的排序标准
            if($self.attr('data-orderName') == 'date') {
                current_ops.orderBy = courseList_ops.ORDER_BY.BY_DATE;
            } else if ($self.attr('data-orderName') == 'hot') {
                current_ops.orderBy = courseList_ops.ORDER_BY.BY_HOT;
            }

            // 请求课程列表
            ajaxCourseList(true);

            return false;
        });
    }());                     
})(jQuery, window);






































