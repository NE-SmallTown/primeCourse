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
            IMGBASE: 'http://localhost:7792',
            course_list_url: 'api/course/dlist'
        },
        courseList_ops = { // 课程列表相关的配置
            ORDER_BY: { // 获取课程时的排序方式
                BY_DATE: 'date',
                BY_HOT: 'hot'
            },
            PERROW_SHOWEDNUM: 4, // 一行展示的课程个数
            PERPAGE_COURSENUM: 20 // 一页展示的课程个数
        },
        createQueryItem = function (queryName, queryNameStr) { // 创建一个查询条件
            var item_html = '<div class="form-group">' +
                                '<input type="text" class="form-control" query-name="' + queryName + '" placeholder="' + queryNameStr + '">' +
                            '</div>';
        },
        createQuery = function ($query_wrap) { // 创建查询条件面板
            var $query_html = $('<form class="form-inline">' +
                                '</form>');

            $query_html.append(createQueryItem('name', '课程名')); // 课程名
            $query_html.append(createQueryItem('teacherName', '教师名')); // 教师名

            $query_wrap.append($query_html);
        },
        createTable = function ($table_wrap) { // 创建表格内容
            var $table = $('<table class="display">' +
                    '</table>'),
                $thead = $('<thead></thead>'),
                $tbody = $('<tbody></tbody>');

            $.ajax({
                url: URL_LIST.BASE + URL_LIST.course_list_url,
                data: {
                    name        :  $('[query-name="name"]').val(), // 课程名
                    teacherName :  $('[query-name="teacherName"]').val(), // 教师名
                    orderBy     :  courseList_ops.ORDER_BY.BY_DATE, // 排序枚举值
                    perPage     :  courseList_ops.PERPAGE_COURSENUM, // 每页显示多少条数据
                    page        :  'value1'  // 当前页码
                }
            })
            .done(function() {
                console.log("get courselist success");
            });

            // 最后将创建好的表格插入指定位置
            $table_wrap.append($table);
        };

    // 页面加载完毕后创建查询条件
    $(function () {
        var $query_wrap = $('<div class="query-wrap"></div>'),
            $table_wrap = $('<div class="table-wrap"></div>');

        createQuery($query_wrap);

        $('body').append($query_wrap).append($table_wrap);

        // 激活查询按钮，在表格中显示所有课程信息
        $('btn-query').trigger('click');
    });
})(jQuery, window);
