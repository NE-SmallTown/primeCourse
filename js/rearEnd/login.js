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
            
            data: {
                username: name,
                password: pwd
            }
        })
        .done(function(data) {
            console.log("login success");

            var state = data.state,
                acMsg = '',
                pwMsg = '';

            // 根据状态不同确认要显示的信息
            switch (~~state) {
                case 0: // 成功
                    sessionStorage.userinfo_id = data.id;
                    sessionStorage.userinfo_username = data.username;
                    sessionStorage.userinfo_nickname = data.nickname;
                    sessionStorage.avatarUrl = data.avatarUrl;
                    window.location.href = "homePage.html";
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
            if($('#acTips').size() == 0) {
                $('[name="username"]').parent().removeClass('col-md-9').addClass('col-md-8');
                $('[name="username"]').parent().after($('<div id="acTips" class="formTips">' + acMsg + '</div>'));
            } else {
                $('#acTips').html(acMsg);
            }
            if($('#pwdTips').size() == 0) {
                $('[name="password"]').parent().removeClass('col-md-9').addClass('col-md-8');
                $('[name="password"]').parent().after($('<div id="pwdTips" class="formTips">' + pwMsg + '</div>'));
            } else {
                $('#pwdTips').html(pwMsg);
            }
        })
        .fail(function(jqXHR, textStatus, errorMsg){
            console.log('status: ' + textStatus + ' msg: ' + errorMsg);
        });

        return false;
    });
})(jQuery, window);