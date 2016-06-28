(function ($, global) {
    // 获取一级分类
    var URL_LIST = {
    	classification_lv1_url: "",
    	classification_lv2_url: "",
    	courseList_url: ""
    };
    (function getClassification_lv1() {
        $.ajax({
        	url: URL_LIST.classificationUrl,
        	type: 'post',
        	dataType: 'json',
        	data: {param1: 'value1'},
        })
        .done(function() {
        	console.log("success");
        })
        .fail(function() {
        	console.log("error");
        })
    }())   
})(jQuery, window);






































