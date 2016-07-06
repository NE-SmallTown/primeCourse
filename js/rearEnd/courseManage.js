(function ($, global) {
    // 设置AJAX的全局默认选项
    (function() {
        $.ajaxSetup({
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
                                '<input type="text" class="form-control" name="' + queryName + '" placeholder="' + queryNameStr + '">' +
                            '</div>';
        },
        createQuery = function ($query_wrap) { // 创建查询条件面板
            var $query_html = $('<form class="form-inline">' +
                                '</form>');

            $query_html.append(createQueryItem('courseName', '课程名')); // 课程名
            $query_html.append(createQueryItem('teacherName', '教师名')); // 教师名

            $query_wrap.append($query_html);
        },
        table_api = new $.fn.dataTable.Api('table'),
        createTable = function ($table_wrap) { // 创建表格内容
            var $table = $('<table class="display">' +
                           '</table>'),
                $thead = $('<thead></thead>'),
                $tbody = $('<tbody></tbody>');

            $table_wrap.append($table.append($thead).append($tbody));

            // 请求表格数据
            $table.dataTable({
                serverSide: true, // 分页，取数据等等的都放到服务端去
                processing: true, // 载入数据的时候是否显示“载入中”
                pageLength: courseList_ops.PERPAGE_COURSENUM, // 每页显示的条数
                ordering: false, // 排序操作在服务端进行，所以可以关了。
                ajax: { // 类似jquery的ajax参数，基本都可以用。
                    url: URL_LIST.BASE + URL_LIST.course_list_url,
                    type: "post",
                    dataSrc: function (resDate) { // 操作表数据的方法
                        var dataList = resDate.list,
                            result = [],
                            rowObj = {}, // 一行的数据对象
                            i;

                        for(i = 0; i < resDate.length; i++) {
                            rowObj['courseId'] = dataList[i].id;
                            rowObj['courseName'] = dataList[i].name;
                            rowObj['teacherName'] = dataList[i].teacherName;
                            rowObj['openDate'] = dataList[i].openDate;

                            result.push(rowObj);
                        }

                        return result;
                    },
                    data: function (d) { // d是原始的发送给服务器的数据，默认很长。
                        var param = {}; // 因为服务端排序，可以新建一个参数对象
                        param.start = d.start; // 开始的序号
                        param.length = d.length; // 要取的数据的
                        var formData = $("#filter_form").serializeArray(); // 把form里面的数据序列化成数组
                        formData.forEach(function (ele) {
                            param[ele.name] = ele.value;
                        });

                        // 添加另外的后台需要的参数
                        param['orderBy'] = courseList_ops.ORDER_BY.BY_DATE; // 排序枚举值
                        param['perPage'] = courseList_ops.PERPAGE_COURSENUM; // 排序枚举值
                        param['page'] = table_api.page(); // 当前页码

                        return param; // 自定义需要传递的参数。
                    }
                },
                columns: [ // 对应上面thead里面的序列
                    {data: "课程id"},
                    {data: "课程名"},
                    {data: "教师名"},
                    {data: "开课时间"}
                ],
                initComplete: function (setting, json) {
                    console.log('表格初始化完成');
                },
                language: {
                    lengthMenu: '<select class="form-control">' + '<option value="5">5</option>' + '<option value="10">10</option>' + '<option value="20">20</option>' + '<option value="30">30</option>' + '<option value="40">40</option>' + '<option value="50">50</option>' + '</select>条记录', // 左上角的分页大小显示。
                    processing: "载入中", // 处理页面数据的时候的显示
                    paginate: { // 分页的样式文本内容。
                        previous: "上一页",
                        next: "下一页",
                        first: "第一页",
                        last: "最后一页"
                    },
                    zeroRecords: "没有内容" ,// table tbody内容为空时，tbody的内容。
                    // 下面三者构成了总体的左下角的内容。
                    info: "总共_PAGES_ 页，显示第_START_ 条到第 _END_ 条", //左下角的信息显示，大写的词为关键字。
                    infoEmpty: "0条记录", // 筛选为空时左下角的显示。
                    infoFiltered: "" // 筛选之后的左下角筛选提示(另一个是分页信息显示，在上面的info中已经设置，所以可以不显示)，
                }
            });
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
