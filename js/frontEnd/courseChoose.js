(function ($, global) {
    //设置AJAX的全局默认选项
    $.ajaxSetup({
        type: "post",
        dataType: "json",
        error: function(jqXHR, textStatus, errorMsg){
            console.log('status: ' + textStatus + ' msg: ' + errorMsg);
        }
    });

    // 通用变量，便于管理
    var URL_LIST = { // 本页面需要用到的url
        	classification_url: "",
        	courseList_url: ""
        },
        courseList_ops = { // 课程列表相关的配置
            ORDER_BY: { // 获取课程时的排序方式
                BY_DATE: 'date',
                BY_HOT: 'hot'
            }
        },
        classification_ops = { // 分类相关的配置
            ACD_ALL_ID: 0, // 学院这一级分类中"全部"这个选项的ID,这个值与后台协商好
            TYPE_ALL_ID: 0, // 类别这一级分类中"全部"这个选项的ID,这个值与后台协商好
            TOP_P_ID: null, // 最顶层的类别没有父级了,他的data-p-id用约定好的一个值表示
            data: [
                {
                    name: "计算机学院",
                    id: "111111",
                    subClassification: [
                        {name: "计算机软件", id: "434232"},
                        {name: "计算机硬件", id: "98789"}
                    ]
                },
                {
                    name: "会计学院",
                    id: "111112",
                    subClassification: [
                        {name: "初级会计", id: "1231"},
                        {name: "中级会计", id: "2423"}
                    ]
                },
                {
                    name: "机械学院",
                    id: "111113",
                    subClassification: [
                        {name: "机械原理", id: "6786"},
                        {name: "机械实践", id: "5757"}
                    ]
                }
            ],
            getSubClassification: function(pid) { // 获取对应pid下的分类
                var i, data = this.data, data_len = data.length;

                for (i = 0; i < data_len; i++) {
                    if(pid == data[i].id) {
                        return data[i].subClassification;
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
            orderBy: null,
            curPage: null
        },
        ajaxCourseList = function () { // 请求课程数据,构建课程列表
            $.ajax({
                url: URL_LIST.courseList_url,
                data: {
                    "pid": current_ops.pid,
                    "id": current_ops.id,
                    "orderBy": current_ops.orderBy,
                    "page": current_ops.curPage
                }
            })
            .done(function(courseList) {
                console.log("success");

                // 1.显示数据
                // 2.构建分页栏，注意callback中给current_ops.curpage赋值
            });
        };

    // 构建一级分类 (即学院)
    (function createClassification() {
        $.ajax({
        	url: URL_LIST.classification_url
        })
        .done(function(clf_data) {
        	console.log("get classification success");            
            classification_ops.data = clf_data; // 先赋值给外部变量，其他地方会用到

            // 开始构建
            var clf_ops = classification_ops,
                $nav_acd = $('#course-nav-acd .content-warp'), // 学院
                TOP_P_ID = clf_ops.TOP_P_ID,
                appendHtml,
                i;

            appendHtml += clf_ops.createItem(TOP_P_ID, clf_ops.TYPE_ALL_ID, '全部'); // 首先添加"全部"选项
            for(i = 0; i < clf_data.length; i++) {
                appendHtml += clf_ops.createItem(TOP_P_ID, clf_data[i].id, clf_data[i].name);
            }

            // 最后插入
            $nav_acd.append(appendHtml);
        });
    }())
    // 为学院添加hover事件，为类别添加click事件
    (function () {
        // hover
        $('body').on('mouseover', '#course-nav-acd li', function(event) {
            var pid = $self.attr('data-pid'),
                $nav_type = $('#course-nav-type .content-warp'),
                $createdUl = $nav_type.children('ul[data-pid=' + pid + ']');

            // 先隐藏之前的类别面板
            $nav_type.children('ul').css('visibility', 'hidden');
            // 如果之前已经创建过这个类别的面板，直接显示即可
            if($createdUl.length > 0) {
                $createdUl.css('visibility', 'visible');

                return false;
            }

            // 没有创建过的话则创建
            var $self = $(this),
                id = $self.attr('data-id'),
                clf_ops = classification_ops,
                subClf = clf_ops.getSubClassification(pid),
                appendHtml,
                i;
            // 依次创建类别
            appendHtml += clf_ops.createItem(clf_ops.TOP_P_ID, clf_ops.ACD_ALL_ID, '全部'); // 首先添加"全部"选项
            for(i = 0; i < subClf.length; i++) {
                appendHtml += clf_ops.createItem(pid, subClf[i].id, subClf[i].name);
            }

            // 最后添加到类别面板中
            $nav_type.append($('<ul' + ' data-pid=' + pid + ' ></ul>').append(appendHtml));
            
            return false;
        });

        // click
        $('body').on('click', '#course-nav-type li', function(event) {
            var $self = $(this),
                pid = $self.attr('data-pid'),
                id = $self.attr('data-id'),
                old_pid = current_ops.pid,
                old_id = current_ops.id,
                current_ops.pid = pid, // 更新当前分类的pid
                current_ops.id = id, // 更新当前分类的id
                i;

            // 首先移除之前的高亮,然后将对应的学院和点击的类别高亮显示
            $('#course-nav-acd').find('li a[data-id=' + old_pid + ']').removeClass('on');
            $('#course-nav-type').find('li a[data-id=' + old_id + ']').removeClass('on');
            $('#course-nav-acd').find('li a[data-id=' + pid + ']').addClass('on');
            $self.addClass('on');

            // 发起请求,构建课程列表
            ajaxCourseList();

            return false;
        });
    }())

    // 为排序方式(即"最热","最新")添加click事件
    (function(){
        $('body').on('click', '.course-toolbar .toolbar-left a', function(event) {
            var $self = $(this);

            // 去除之前的高亮,并将点击的高亮
            $('.course-toolbar .toolbar-left').find('a[class*="active"]').removeClass('active');
            $self.addClass('active');

            // 更新当前选择的排序标准
            if($self.attr('data-date') == 'date') {
                current_ops.orderBy = courseList_ops.ORDER_BY.BY_HOT;
            } else if ($self.attr('data-date') == 'hot') {
                current_ops.orderBy = courseList_ops.ORDER_BY.BY_DATE;
            }

            return false;
        });
    }())
})(jQuery, window);






































