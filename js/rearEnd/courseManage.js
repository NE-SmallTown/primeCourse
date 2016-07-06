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
            course_list_url: 'api/course/dlist',
            course_delete_url: 'api/course/delete',
            course_modify_url: 'api/course/update'
        },
        courseList_ops = { // 课程列表相关的配置
            ORDER_BY: { // 获取课程时的排序方式
                BY_DATE: 'date',
                BY_HOT: 'hot'
            },
            PERROW_SHOWEDNUM: 4, // 一行展示的课程个数
            PERPAGE_COURSENUM: 20 // 一页展示的课程个数
        },
        createSubmitButton = function () { // 查询按钮
            var bt_submit_html = '<div class="form-group has-feedback">' +
                                     '<button type="submit" class="form-control btn btn-default" opt="search">查询</button>' +
                                     '<span class="icon iconfont icon-search"></span>' +
                                 '</div>';

            return bt_submit_html;
        },
        createQueryItem = function (queryName, queryNameStr) { // 创建一个查询条件
            var item_html = '<div class="form-group">' +
                                '<label class="control-label">' + queryNameStr + ':</label>' +
                                '<input type="text" class="form-control" name="' + queryName + '" placeholder="' + queryNameStr + '">' +
                            '</div>';

            return item_html;
        },
        createQuery = function ($query_wrap) { // 创建查询条件面板
            var $query_html = $('<form class="form-inline">' +
                                '</form>');

            $query_html.append(createQueryItem('courseName', '课程名')); // 课程名
            $query_html.append(createQueryItem('teacherName', '教师名')); // 教师名

            $query_wrap.append($query_html.append(createSubmitButton()));
        },
        pagerObj, // 分页栏对象
        createOperationButton = function ($tr) { // 创建操作栏，即删除和修改按钮
            var td_btAndDel = '<td>' +
                                '<a opt="modify" onclick="return false;"><i class="icon iconfont icon-modify"></i><span>修改</span></a>' +
                                '<a opt="delete" onclick="return false;"><i class="icon iconfont icon-delete"></i><span>删除</span></a>' +
                              '</td>';

            $tr.append(td_btAndDel);
        },
        createTable = function (shouldCreatePager) { // 创建表格内容
            if($('table').length == 0) { // 没有表格的先创建
                var $table = $('<table class="table table-hover">' +
                               '</table>'),
                    $thead = $('<thead>' +
                                    '<tr>' +
                                        '<th>课程id</th>' +
                                        '<th>课程名</th>' +
                                        '<th>教师名</th>' +
                                        '<th>开课时间</th>' +
                                        '<th>操作</th>' +
                                    '</tr>' +
                               '</thead>'),
                    $tbody = $('<tbody></tbody>');

                $('.table-wrap').append($table.append($thead).append($tbody));
            }

            // 请求表格数据
            $.ajax({
                url: URL_LIST.BASE + URL_LIST.course_list_url,
                data: {
                    name: $('[name="courseName"]').val(),
                    teacherName: $('[name="teacherName"]').val(),
                    perPage: courseList_ops.PERPAGE_COURSENUM, // 一页的课程数
                    page: shouldCreatePager ? 1 : pagerObj ? pagerObj.curPage : 1
                }
            })
            .done(function(date) {
                console.log("获取课程列表成功");

                // 显示数据
                var cr_list = date.list,
                    cr_list_len = cr_list.length,
                    $tr,
                    td_cr_id,
                    td_cr_name,
                    td_cr_teacherName,
                    td_cr_openDate,
                    $tbody = $('tbody').empty(),
                    i;
                for(i = 0; i < cr_list_len; i++) {
                    $tr = $('<tr></tr>');

                    td_cr_id = '<td data-name="courseId">' + cr_list[i].id + '</td>';
                    td_cr_name = '<td data-name="courseName">' + cr_list[i].name + '</td>';
                    td_cr_teacherName = '<td data-name="teacherName">' + cr_list[i].teacherName + '</td>';
                    td_cr_openDate = '<td data-name="openDate">' + cr_list[i].openDate.substr(0, cr_list[i].openDate.indexOf('T')) + '</td>';

                    $tr.append(td_cr_id + td_cr_name + td_cr_teacherName + td_cr_openDate);

                    // 添加修改和查询按钮
                    createOperationButton($tr);

                    // 最后将行插入表格中
                    $tbody.append($tr);
                }

                // 判断是否需要创建分页栏
                if(shouldCreatePager) {
                    pagerObj = $('.pager-warp').empty().createPager({
                        ajaxOps: {
                            ajaxFunc: createTable,
                            ajaxFuncArgs: false
                        },
                        pages: date.totalPage
                    });
                }

                // 更新总条数
                if($('.pageNumInfo').length > 0) {
                    $('.pageNumInfo').text('共有' + date.count + '条记录');
                } else {
                    $('.pager-warp .pagination').after('<div class="pageNumInfo">共有' + date.count + '条记录</div>');
                }
            });
        },
        operatedTr,
        bindDeleteBtClick = (function () { // 绑定删除按钮点击事件
            $('body').on('click', '[opt=delete]', function () {
                var $self = $(this),
                    selectedTr = $self.parents('tr'),
                    i;

                operatedTr = selectedTr;
                modals.deleteModal.modal('确定要删除这一行吗？', selectedTr);              
            });
        }()),
        bindDeleteBtClick = (function () { // 绑定修改按钮点击事件
            $('body').on('click', '[opt=modify]', function () {
                var $self = $(this),
                    selectedTr = $self.parents('tr'),
                    i;

                operatedTr = selectedTr;
                modals.modifyModal.modal(['courseName', 'teacherName', 'openDate'], selectedTr);
                // 写在ajax回调里面modals.modifyModal.hide(); // 修改完成后隐藏modal
            });
        }());

    // 页面加载完毕后创建查询条件
    (function () {
        setTimeout(function () {
            // 当前模块高亮
            $('.sidebar-list > ul > li:first').trigger('click');
            $('[data-moduleid=' + sessionStorage.currentModuleId + ']').addClass('active');

            // 创建查询面板
            var $query_wrap = $('<div class="query-wrap"></div>'),
                $table_wrap = $('<div class="table-wrap"></div>');
            createQuery($query_wrap);

            // 创建表格容器
            $('.section').append($query_wrap).append($table_wrap);

            // 创建分页栏容器
            $('.section').append($('<div class="pager-warp"></div>'));

            // 激活查询按钮，在表格中显示所有课程信息
            $('btn-query').trigger('click');
        }, 100);
    }());

    // 绑定查找按钮点击事件
    (function () {
        $('body').on('click', '[opt="search"]', function () {
            createTable(true);

            return false;
        });
    }());

    // 创建一个模态框并返回
    var MODAL_ID = 1, // 模态框默认ID初始为1
        modals = {}; // 存储所有模态框的对象
    function createModal(type) {
        function Modal()  {
            this.modalId = 'neTableModal' + MODAL_ID++; // 为每个modal建立id
            this.$modalHtml = $(Modal._modalHtml).attr('id', this.modalId);

            var neTableModalId = this.modalId,
                self = this;

            // 设置modal的标题和确定按钮点击后的回调函数
            switch (type) {
                case 'add':
                    this.title = Modal.ADD_TITLE;
                    this.ackSubmitHandler = function(form) {
                        console.log('新增成功！submit！');
                        // 拼接要传送给后台的数据
                        var $modalForm = $('#' + neTableModalId + ' form'),
                            modalInput_index = self.modalInput_index,
                            modalInput_index_len = modalInput_index.length,
                            addedTrData,
                            i;
                        for(i = 0; i < modalInput_index_len; i++) {
                            addedTrData[modalInput_index[i]] = $modalForm.find('input[data-name=' + modalInput_index[i] + ']').val();
                        }

                         // ajax执行新增
                    };

                    break;
                case 'delete':
                    this.title = Modal.DELETE_TITLE;
                    this.ackSubmitHandler = function(form) {
                        $.ajax({
                            url: URL_LIST.BASE + URL_LIST.course_delete_url,
                            type: 'post',
                            data: {
                                id: operatedTr.find('[data-name="courseId"]').text()
                            },
                        })
                        .done(function() {
                            console.log("删除成功");

                            modals.deleteModal.hide(); // 删除完成后隐藏modal

                            $('[opt="search"]').trigger('click');// 刷新表格
                        });
                    };

                    break;
                case 'modify':
                    this.title = Modal.MODIFY_TITLE;
                    this.ackSubmitHandler = function(form) {
                        // 拼接要传送给后台的数据
                        var $modalForm = $('#' + neTableModalId + ' form'),
                            modalInput_index = self.modalInput_index,
                            modalInput_index_len = modalInput_index.length,
                            i;
                        for(i = 0; i < modalInput_index_len; i++) {
                            operatedTr[modalInput_index[i]] = $modalForm.find('input[data-name=' + modalInput_index[i] + ']').val();
                        }

                        $.ajax({
                                url: URL_LIST.BASE + URL_LIST.course_modify_url,
                                type: 'post',
                                data: {
                                    id: operatedTr.find('[data-name="courseId"]').text(),
                                    name: operatedTr.find('[data-name="courseName"]').text()
                                },
                            })
                            .done(function() {
                                console.log('修改成功!');

                                modals.modifyModal.hide(); // 删除完成后隐藏modal

                                $('[opt="search"]').trigger('click');// 刷新表格
                            });
                    };

                    break;
                default :
                    throw new Error('type should be add, delete or modify!');
            }
            this.setTitle(this.title);

            // 绑定模态框中的确认按钮事件
            $('body')
            .off('click', '#' + neTableModalId + ' #modal_ack')
            .on('click', '#' + neTableModalId + ' #modal_ack', function(event) {      
                self.ackSubmitHandler();
            });
        }

        // 设置Modal相应字段
        Modal._ensureAndCancelBtns = '<div class="form-group">' +  // modal中最后的按钮（一般是确认和关闭两个按钮）
            '<button class="btn btn-primary" id="modal_ack" type="submit">确认</button>' +
            '<button class="btn btn-default" type="button"  data-dismiss="modal">关闭</button>' +
            '</div>';
        Modal._modalHtml = '' + // modal的html形式
            '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-title"></h4>' +
            '</div>' +

            '<div class="modal-body">' +

            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        Modal.ADD_TITLE = '新增数据';
        Modal.DELETE_TITLE = '删除数据';
        Modal.MODIFY_TITLE = '修改信息';

        // 设置modal的标题的方法
        Modal.prototype.setTitle = function(t) {
            this.$modalHtml.find('.modal-header .modal-title').html(t);

            return this;
        };

        // 设置modal的内容的方法
        Modal.prototype.setContent = function(modalInput_index, operatedTr) {
            if(!modalInput_index) {
                throw new Error('you must offer arguments!');
            }

            if(typeof modalInput_index === 'string' && operatedTr) { // 不设置输入框，只是设置字符串。 （ 删除一行时用到  ）
                this.$modalHtml.find('.modal-body').html(modalInput_index).append(Modal._ensureAndCancelBtns).find('button[type="submit"]').css('margin-left', '430px');;

                return this;
            }

            var modal_body = this.$modalHtml.find('.modal-body').empty(),
                modal_body_content = $('<form class="form-horizontal" ></form>'),
                modalInput_index_len = modalInput_index.length,
                $self = $(this),
                $thead = $('thead'),
                lableText,
                input_texts = operatedTr ? (function(){
                    var result = [],
                        i;

                    for(i = 0; i < modalInput_index_len; i++) {
                        result.push(operatedTr.find('[data-name="' + modalInput_index[i] + '"]'));
                    }

                    return result;
                }()) : undefined, // 每个input的内容 ( 来源于表格 )
                $perInput, // modal中的每个输入框
                i;

            // 设置每个输入框的内容
            for(i = 0; i < modalInput_index_len; i++) {
                lableText = $thead.find('th').eq(operatedTr.find('[data-name="' + modalInput_index[i] + '"]').index()).text();
                
                $perInput = $('<div class="form-group">' +
                    '<label class="col-sm-2 control-label">' + lableText + ':</label>' +
                    '<div class="col-sm-10">' +
                    (operatedTr ? ('<input class="form-control" data-name="' + modalInput_index[i] + '" ' + 'type="text" ' + 'value="' + input_texts[i].text() + '">')
                        : ('<input class="form-control" data-name="' + modalInput_index[i] + '" ' + 'type="text">')) +
                    '</div>' +
                    '</div>');

                modal_body_content.append($perInput);
            }

            // 最后将标签加入modal_body
            modal_body.append(modal_body_content.append(Modal._ensureAndCancelBtns));

            return this;
        };

        // 设置modal的modal方法,即显示模态框
        // modalInput_index : (模态框中每个输入框的index (与表格某些列的ndata-ame组成的数组一致  )
        //						如果是字符串且不传入operatedTr，则表示模态框的内容
        // operatedTr(可选参数 ) : 如果有modalInput_index且没有operatedTr是创建新建一行的模态框，传入tr则创建修改一行的模态框
        Modal.prototype.modal = function(modalInput_index, operatedTr) {
            this.modalInput_index = modalInput_index;
            this.operatedTr = operatedTr;

            // 每次模态框弹出之前，设置模态框的内容
            this.setContent(modalInput_index, operatedTr);
            // 调用bs的modal的modal方法, 显示模态框
            this.$modalHtml.modal();

            return this;
        };

        // 设置modal的hide方法,即隐藏模态框
        Modal.prototype.hide = function() {
            // 调用bs的modal的hide方法, 隐藏模态框
            this.$modalHtml.modal('hide');

            return this;
        };

        return new Modal();
    }

    // 设置所有neTable相关的模态框
    (function() {
        // 1."修改"模态框
        modals.modifyModal = createModal('modify');

        // 2."新增"模态框
        modals.addModal = createModal('add');

        // 3."删除"模态框
        modals.deleteModal = createModal('delete');

        // 将模态框添加到页面中
        var i;
        for (i in modals) {
            $('body').append(modals[i].$modalHtml);
        }
    }());
})(jQuery, window);
