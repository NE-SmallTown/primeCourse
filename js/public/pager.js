(function ($, global) {  
    'use strict'

    // 创建分页栏
    function createPager(pagerOps) {
        // 构造函数
        function NE_Pager() {
            this._init();
        }

        // 添加相关字段
        NE_Pager.prototype.pager_wrap = null; // 在分页栏放在页面哪个dom中
        NE_Pager.prototype.ajaxOps = {  // 点击页码时ajax的配置参数
            url : null, // 请求的url
            data: null, // 请求时需要发送的数据
            callback: null // 点击页码后的回调函数
        };
        NE_Pager.prototype.curPage = 1; // 设置当前页
        NE_Pager.prototype.oldPage = 1; // 设置翻页之前的页，如当前在第2页，点击第3页，则点击之后curPage为3，oldPage为2
        NE_Pager.prototype.totalLength = null; // 设置总共有多少条记录
        NE_Pager.prototype.pages = null; // 设置总共的页数
        NE_Pager.prototype.showedPagesButtonNum = null; // 分页栏展示的页码个数

        // 以下为内部方法
        // 检测传入的pagerOps是否有效
        NE_Pager.prototype._checkParams = function() {
            // 检查pagerOps是否为对象
            if(!$.isPlainObject(pagerOps)) {
                throw new Error('args must be object!');
            }
            // pagerOps中的参数是否在NE_Pager .prototype都有对应的属性
            if(!checkObjParamsConsistent(pagerOps, NE_Pager.prototype)) {
                throw new Error('arguments error, Please consult the api!');
            }

            // 检查obj2中的属性是否在obj1中都存在,是返回true,否返回false
            function checkObjParamsConsistent(obj1, obj2) {
                var i;
                for(i in obj2) {
                    if(!obj1[i]) {
                        return false;
                    } else if(typeof obj1[i] !== typeof obj2[i]) {
                        return false;
                    } else if($.isPlainObject(obj2[i])) {
                        checkObjParamsConsistent(obj1[i], obj2[i]);
                    }
                }

                return true;
            }
        }

        // 初始化分页栏
        NE_Pager.prototype._init = function() {
            // 检测用户传入的参数是否合法
            this._checkParams();
            // 根据用户传入的参数合并字段值
            $.extend(true, NE_Pager.prototype, pagerOps);          

            // 以下为构造分页栏部分
            var pages = this.pages;
                curPage = this.curPage;                          
            var ne_pager = $('<div class="ne-pager clearfix"></div>'),
                pagination = $('<ul class="pagination"></ul>'),
                pagination_liTag, // pagination下的li标签(只包含页码，不包含上一页这些  )
                firstPageTag = $('<li><a class="first" data-value="1">首页</a></li>'),
                prevPageTag  = $('<li><a class="prev" data-value="' + (curPage - 1) + '"' + '>上一页</a></li>'),
                nextPageTag  = $('<li><a class="next" data-value="' + (curPage + 1) + '"' + '>下一页</a></li>'),
                lastPageTag  = $('<li><a class="last" data-value="' + pages + '"' + '>尾页</a></li>'),
                pageNumInfo  = $('<div class="pageNumInfo">共有' + this.totalLength + '条记录</div>'),
                i; // 循环变量

            // 当前在第一页，则上一页和首页按钮不能点击
            if(curPage == 1) {
                prevPageTag.addClass('disabled').children('a').attr('onclick', 'return false');
                firstPageTag.addClass('disabled').children('a').attr('onclick', 'return false');
            }
            // 当前在最后一页，则下一页和尾页按钮不能点击
            if(curPage == pages) {
                nextPageTag.addClass('disabled').children('a').attr('onclick', 'return false');
                lastPageTag.addClass('disabled').children('a').attr('onclick', 'return false');
            }
            pagination.append(firstPageTag);
            pagination.append(prevPageTag);
            for(i = 0; i < showedPagesButtonNum; i++) {
                pagination_liTag = $('<li><a data-value="' + (i + 1) + '">' + (i + 1) + '</a></li>');
                pagination.append(pagination_liTag);

                if((i + 1) === curPage) { // 当前页的页码禁止点击
                    pagination_liTag.addClass('disabled').children('a').addClass('curPage').attr('onclick', 'return false;');
                }
            }
            pagination.append(nextPageTag);
            pagination.append(lastPageTag);

            ne_pager.append(pagination);
            ne_pager.append(pageNumInfo);
            this.pager_wrap.append(ne_pager);
        }

        // 绑定分页栏点击事件
        NE_Pager.prototype._bindPagerEvent = function() {
            var self = this;

            $('body')
            .off('click', '.ne-pager .pagination > li > a[data-value]')
            .on('click', '.ne-pager .pagination > li > a[data-value]', function(event) {
                var toPage = Number($(this).attr('data-value')),
                    tableSetting;

                if(toPage == self.curPage || toPage < 1 || toPage > pages) { // 如果请求的就是当前页或者超出范围，则不做出响应
                    return ;
                }

                // 请求数据
                $.ajax({
                    url: self.ajaxOps.url,
                    type: 'get',
                    dataType: 'json',
                    data: self.ajaxOps.data,
                })
                .done(function(res) {
                    console.log("success");

                    self._updatePager(); // 请求成功后更新分页栏

                    slef.ajaxOps.callback(); // 调用回调函数
                })
                .fail(function(xhr, textStatus, errorThrown) {
                    console.log("error:" + errorThrown);
                });
            });

            return true; // 事件绑定完毕
        }

        // 更新分页栏 (点击页码后触发 )
        NE_Pager.prototype._updatePager = function() {
            var pager_ul_li = neTable_warp.find('.ne-pager ul li'),
                oldPage = this.oldPage,
                showedPagesButtonNum = this.showedPagesButtonNum,
                curPage = this.curPage,
                firstATag = pager_ul_li.find('a.first'),
                prevATag = pager_ul_li.find('a.prev'),
                nextATag = pager_ul_li.find('a.next'),
                lastATag = pager_ul_li.find('a.last'),
                i, j, k, m,
                curPage_posIndex = 5, // 当前页总是位于第5个位置 (页数超过tablePages的情况下 )
                getCurPageShowedPages = function() { // 获取当前页应该显示多少个页码
                    if(pages < showedPagesButtonNum) {
                        return pages;
                    } else {
                        var res = showedPagesButtonNum - (curPage + curPage_posIndex - pages);
                        return res > showedPagesButtonNum ? showedPagesButtonNum : res;
                    }
                };

            // 去掉点击之前的页码具有的属性，如现在是第一页，点击第二页，则来有curPage这个class
            // 的为data-value为1的标签，现在当前页变为2，那么这个标签的class应该去掉
            prevATag.removeAttr('onclick').parent().removeClass('disabled');
            nextATag.removeAttr('onclick').parent().removeClass('disabled');
            pager_ul_li.find('a[data-value="' + oldPage + '"]').removeAttr('onclick').
            parent().removeClass('disabled').
            children('a').not(function() {
                return $(this).hasClass('first') || $(this).hasClass('last');
            }).removeClass('curPage');

            // 更新标签的data -value值
            prevATag.attr('data-value', curPage - 1);
            nextATag.attr('data-value', curPage + 1);
            // 当前在第一页，则上一页和首页按钮不能点击
            if(curPage == 1) {
                prevATag.attr('onclick', 'return false').parent().addClass('disabled');
                firstATag.attr('onclick', 'return false').parent().addClass('disabled');
            }
            // 当前在最后一页，则下一页和尾页按钮不能点击
            if(curPage == pages) {
                nextATag.attr('onclick', 'return false').parent().addClass('disabled');
                lastATag.attr('onclick', 'return false').parent().addClass('disabled');
            }

            // 调整页码的位置
            var pager_ul_pageLi = pager_ul_li.not(function(index) { // 挑选出页码 (即排除首页，上一页，下一页，尾页  )
                return index <= 1 || index >= pager_ul_li.length - 2;
            });
            if(pages > showedPagesButtonNum) { // 总页数大于分页栏展示的页数
                var curPageShowedPages = getCurPageShowedPages(),
                    lastLi_dataValue = pager_ul_pageLi.last().children('a').attr('data-value');

                if(curPage > curPage_posIndex || lastLi_dataValue > showedPagesButtonNum) { // 在这里是点击的至少是第6页才调整位置
                    for(i = 0, j = curPage_posIndex - 1, k = 0, m = 1; i < curPageShowedPages; i++) {
                        if(j > 0 && m != curPage) { // 更新当前页之前的页码 (这个是肯定存在的 )
                            if(curPage - curPage_posIndex < 0) {
                                $(pager_ul_pageLi[i]).children('a').attr('data-value', m).html(m);
                                m++;
                            } else {
                                $(pager_ul_pageLi[i]).children('a').attr('data-value', curPage - j).html(curPage - j);
                            }
                            j--;
                        } else { // 更新当前页之后的页码
                            // 页码原来不存在
                            if(!pager_ul_pageLi[i]) {
                                pager_ul_pageLi[i] = $('<li><a data-value="' + (curPage + k) + '">' + (curPage + k) + '</a></li>');
                                k++;

                                var pager_ul_li_temp = pager_ul_pageLi.last().after(pager_ul_pageLi[i]);
                                // 更新，否则pager_ul_li和pager_ul_pageLi还是指向未after之前的对象
                                pager_ul_li = pager_ul_li_temp.parent().children('li');
                                pager_ul_pageLi = pager_ul_li.not(function(index) {
                                    return index <= 1 || index >= pager_ul_li.length - 2;
                                });
                            } else {
                                $(pager_ul_pageLi[i]).children('a').attr('data-value', curPage + k).html(curPage + k);
                                k++;
                            }
                        }
                    }

                    // 原来显示了10个页码，现在应该显示8个，所以将后面的删除
                    for(; i < showedPagesButtonNum; i++) {
                        if(pager_ul_pageLi[i]) {
                            $(pager_ul_pageLi[i]).remove();
                        }
                    }
                }
            }

            // 更新data -value值为当前页的标签，并禁止点击
            pager_ul_li.find('a[data-value="' + curPage + '"]').attr('onclick', 'return false').
            parent().addClass('disabled').
            children('a').not(function() {
                return $(this).hasClass('first') || $(this).hasClass('last');
            }).addClass('curPage');

            // 为了美观，调整分页栏到左边的间距  (因为页码有多有少 )
            var pager_ul = neTable_warp.find('.ne-pager ul');
            switch(pager_ul.children().length - 4) {
                case 10:
                    pager_ul.css('margin-left', '20%');
                    break;
                case 9:
                    pager_ul.css('margin-left', '21%');
                    break;
                case 8:
                    pager_ul.css('margin-left', '22%');
                    break;
                case 7:
                    pager_ul.css('margin-left', '23%');
                    break;
                case 6:
                    pager_ul.css('margin-left', '24%');
                    break;
                case 5:
                case 4:
                    pager_ul.css('margin-left', '25%');
                    break;
                case 3:
                    pager_ul.css('margin-left', '26%');
                    break;
                case 2:
                    pager_ul.css('margin-left', '28%');
                    break;
                case 1:
                    pager_ul.css('margin-left', '30%');
                    break;
            }
        }

        return new NE_Pager();
    }
})(jQuery, window);        
