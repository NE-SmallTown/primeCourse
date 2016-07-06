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
			BASE: 'http://localhost:7792/',
			courseDetail_url: 'api/course/detail', // 获取课程详细信息的url
			courseArtical_url: 'api/course/article'
		},
		createHead = (function() { // 创建界面顶部内容
			$('.header').load('courseView-nav.html', function () {
				$('nav .title').text(sessionStorage.courseName);
			});
		}()),
		createArticleList = function ($ele) { // 向指定元素中创建文章列表
			$.ajax({
					url: URL_LIST.BASE + URL_LIST.courseArtical_url,
					data: {
						id: sessionStorage.currentCourseId,
						page: 1,
						perPage: 10
					}
				})
				.done(function(data) {
					var cs_list = data.list,
						$cs_list_ul = $('<ul class="clearfix"></ul>'),
						cs_list_li,
						i;

					for(i = 0; i < cs_list.length; i++) {
						cs_list_li = '<li>' +
							'<a>' + cs_list[i].title + '</a>' +
								'<span class="date">' + cs_list[i].editAt.substr(0, cs_list[i].editAt.indexOf('T')) + '</span>' +
							'</li>';

						$cs_list_ul.append(cs_list_li);
					}
					$ele.empty().append($cs_list_ul);
				});
		},
        createBody = function() { // 请求首页所需数据成功后调用
            var cs_list = courseDetailData.xxxx,
                $cs_list_ul = $('<ul class="clearfix"></ul>'),
                cs_list_li,
                i;

            // 构建课程简介
            $('.courseIntro .content').append(courseDetailData.introText);

            // 构建课程动态
            // 获取这个的时候请求10条，如果返回10条则显示更多按钮，如果没有10条就不显示更多按钮
			createArticleList($('.courseSituation .ar-list-wrap'));
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
			sessionStorage.courseName = detailData.name;
            
            createBody();    		
    	});   	
    }());
})(jQuery, window);
