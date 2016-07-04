(function ($, global) {
    // 通用变量，便于管理
    var URL_LIST = {
            BASE: 'http://localhost:7792/',
            login_url: 'api/user/login'
        },
        createFooter = (function () { // 创建界面底部内容
            $('.footer').load('../courseView-footer.html');
        }());

    // 绑定登录事件
    $('.submit').on('click', function () {
        var name = $('[name=username]').val(),
            pwd = $('[name=password]').val();

        // 登录
        $.ajax({
            url: URL_LIST.BASE + URL_LIST.login_url,
            type: 'post',
            dataType: 'json',
            timeout: 5000,
            data: {
                username: name,
                password: pwd
            }
        })
        .done(function(data) {
            console.log("login success");

            var state = data.state,
                acMsg,
                pwMsg;

            // 根据状态不同确认要显示的信息
            switch (~~state) {
                case 0: // 成功
                    window.location.href = "../../admin/homePage.html";
                    return;
                case 1: // 用户不存在
                    acMsg = "用户不存在";
                    break;
                case 2: // 密码错误
                    pwMsg = "密码错误";
                    break;
                case 3: // 用户已登录
                    acMsg = "用户已登录";
                    break;
            }

            //如果有错误信息，则显示出来
            if($('#acTips').size() == 0)
                $('#login_name').parent().after($('<div id=\'acTips\' class=\'formTips col-xs-12 col-sm-12 col-md-3 col-lg-3\'>' + acMsg + '</div>'));
            else
                $('#acTips').html(acMsg);
            if($('#pwdTips').size() == 0)
                $('#pwd').parent().after($('<div id=\'pwdTips\' class=\'formTips col-xs-12 col-sm-12 col-md-3 col-lg-3\'>' + pwMsg + '</div>'));
            else
                $('#pwdTips').html(pwMsg);
        })
        .fail(function(jqXHR, textStatus, errorMsg){
            console.log('status: ' + textStatus + ' msg: ' + errorMsg);
        });

        return false;
    });
})(jQuery, window);