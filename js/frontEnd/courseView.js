(function ($, global) {
	// 一些需要初始化的配置
	(function () {
		new WOW().init(); // 初始化WOW.js
	}());

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
			courseDetail_url: null// 获取课程详细信息的url
		},
		createHead = (function() { // 创建界面顶部内容
			$('.header').load('courseView-nav.html');
		}()),
        createBody = function() { // 请求首页所需数据成功后调用
            /*var cs_list = courseDetailData.xxxx,
                $cs_list_ul = $('<ul class="clearfix"></ul>'),
                cs_list_li,
                i;

            // 构建课程简介
            $('.courseIntro .content').append(courseDetailData.xxx);

            // 构建课程动态
            // 获取这个的时候请求10条，如果返回10条则显示更多按钮，如果没有10条就不显示更多按钮
            for(i = 0; i < cs_list.length; i++) {
                cs_list_li = '<li>' +
                                '<a>' + cs_list[i].xxx + '</a>' +
                                '<span class="date">' + cs_list[i].xxx + '</span>' +
                             '</li>';

                $cs_list_ul.append(cs_list_li);
            }
            $('.courseSituation .cs-list-wrap').append($cs_list_ul);*/
        },
		createFooter = (function() { // 创建界面底部内容
			$('.footer').load('courseView-footer.html');
		}()),
		courseDetailData;

    // 请求课程详细信息
    (function() {
    	$.ajax({
    		url: URL_LIST.BASE + URL_LIST.courseDetail_url,
    		data: {
    			id: sessionStorage.currentCourseId
    		},
    	})
    	.done(function(detailData) {
    		console.log("get courseDetail success");

    		courseDetailData = detailData; // 赋值给外部变量,其他地方会用到
            
            createBody();    		
    	});   	
    }());
})(jQuery, window);
