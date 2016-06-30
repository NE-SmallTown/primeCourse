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
	var URL_LIST = {
			courseDetail_url: null// 获取课程详细信息的url
		},
		createHeadHtml = function() { // 创建界面顶部内容

		},
		createFooterHtml = function() { // 创建界面底部内容

		},
		courseDetailData;

    // 请求课程详细信息
    (function() {
    	$.ajax({
    		url: URL_LIST.courseDetail_url,
    		data: {
    			id: sessionStorage.currentCourseId
    		},
    	})
    	.done(function(detailData) {
    		console.log("get courseDetail success");

    		courseDetailData = detailData; // 赋值给外部变量,其他地方会用到

    		
    	});   	
    }());
})(jQuery, window);
