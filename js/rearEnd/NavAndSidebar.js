(function ($, global) {
    // 通用变量，便于管理
    var URL_LIST = {
            BASE: 'http://localhost:7792/',
            IMGBASE: 'http://localhost:7792',
            mudule_list_url: 'api/user/modulelist' // 用户可以访问的模块列表
        },
        SIDEBARLIST_ICONS = { // 侧边栏每个列表对应的图标url，因为开始设计数据库时候没设计这个，只有这么补救了。。
            '网站内容管理'  : 'icon-courseManage',
            '课程管理'     : 'icon-courseManage',
            '课程选项'     : 'icon-moduleManage',
            '课程分类'     : 'icon-moduleManage',
            '文章管理'     : 'icon-articleManage',
            '审核文章'     : 'icon-articleReview',
            '权限管理'     : 'icon-authorityManage',
            '系统设置'     : 'icon-systemSetting',
            '模块管理'     : 'icon-moduleManage',
            '模块选项'     : 'icon-moduleManage',
            '用户管理'     : 'icon-userManage',
            '角色管理'     : 'icon-roleManage',
            '角色分配'     : 'icon-roleAssign'
        },
        moduleUrlMap = { // 模块id到模块url的映射

        },
        createNavAndSidebar = (function () { // 加载顶部和侧边栏
            $('.content').load('NavAndSidebar.html', function () { // 加载完成后创建用户信息和侧边栏列表
                createUserinfo();
                createSidebarList();
            });
        }()),
        bindSidebarListLv1Clcik = (function () { // 绑定侧边栏一级菜单点击事件
            $('body').on('click', '.sidebar-list > ul > li', function(event) {
                event.stopPropagation();

                var $self = $(this),
                    $sibling_i = $self.children('i.triangleRight');
                if($sibling_i.length > 0) {
                    $sibling_i.toggleClass('triangleRightToDown');
                }

                $self.find('ul').toggleClass('show');
            });
        }()),
        bindSidebarListLv2Clcik = (function () { // 绑定侧边栏二级菜单点击事件
            $('body').on('click', '.sidebar-list li[data-moduleId]', function(event) {
                event.stopPropagation();

                // 存储模块id
                sessionStorage.currentModuleId = $(this).attr('data-moduleId');

                // 然后跳转到对应模块
                location.href = moduleUrlMap[$(this).attr('data-moduleId')];
            });
        }()),
        bindLogoutClick = (function () { // 给登出按钮绑定事件
            $('body').on('click', '.logout', function () {
                location.replace('login.html');
            });
        }()),
        createUserinfo = function () { // 创建用户信息
            $('.avatar-wrap img').attr('src', URL_LIST.IMGBASE + sessionStorage.avatarUrl);
            $('.nickname').text(sessionStorage.userinfo_nickname);
            /*$('.rolename').text(sessionStorage.userinfo_rolename);*/
        },
        createSidebarList = function () { // 创建侧边栏列表
            $.ajax({
                url: URL_LIST.BASE + URL_LIST.mudule_list_url,
                type: 'get',
                dataType: 'json',
                data: {
                    id: sessionStorage.userinfo_id
                }
            })
            .done(function(data) {
                console.log("get SidebarList success");

                var $ul_lv1 = $('<ul></ul>'),
                    li_lv1,
                    $ul_lv2,
                    li_lv2,
                    list_lv1 = data.list,
                    list_lv2,
                    list_lv1_len = list_lv1.length,
                    list_lv2_len,
                    i,
                    j;

                for(i = 0; i < list_lv1_len; i++) {
                    li_lv1 = '<li>' +
                                '<i class="icon iconfont ' + SIDEBARLIST_ICONS[list_lv1[i].name] + '"></i>' +
                                '<span class="title">' + list_lv1[i].name + '</span>' +
                                '<i class="triangleRight"></i>' +
                             '</li>';

                    list_lv2 = list_lv1[i].list;
                    list_lv2_len = list_lv2.length;
                    $ul_lv2 = $('<ul></ul>');
                    for(j = 0; j < list_lv2_len; j++) {
                        moduleUrlMap[list_lv2[j].id] = list_lv2[j].url;

                        li_lv2 = '<li data-moduleId="' +  list_lv2[j].id + '">' +
                                    '<i class="icon iconfont ' + SIDEBARLIST_ICONS[list_lv2[j].name] + '"></i>' +
                                    '<span class="title">' + list_lv2[j].name + '</span>' +
                                 '</li>';
                        $ul_lv2.append(li_lv2);
                    }
                    $ul_lv1.append($(li_lv1).append($ul_lv2));
                }

                $('.sidebar-list').append($ul_lv1);
            })
            .fail(function() {
                console.log("error");
            });            
        };
})(jQuery, window);
