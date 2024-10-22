/**
 * main.js
 */

// Vuejs
function vuejs() {

    var RANKS_KEY = 'icpc-ranks';
    var OPER_FLAG_KEY = 'operation-flag';

    var FLAHING_TIME = 100; // 闪烁时间
    var ROLLING_TIME = 600; // 排名上升时间

    window.Storage = {
        fetch: function(type) {
            if(type == 'ranks')
                return JSON.parse(localStorage.getItem(RANKS_KEY)) || window.resolver.rank_frozen;
            else if(type == 'opera_flag')
                return localStorage.getItem(OPER_FLAG_KEY) || 0;
        },

        update: function(type, data) {
            if(type == 'ranks')
                localStorage.setItem(RANKS_KEY, JSON.stringify(data));
            else if(type == 'opera_flag')
                localStorage.setItem(OPER_FLAG_KEY, data);
        }
    };

    window.Operation = {
        next: function() {
            vm.$data.op_status = false;
            var op = vm.$data.operations[vm.$data.op_flag];
            var op_length = vm.$data.operations.length - 1;

            if(vm.$data.op_flag < op_length) {
                var op_next = vm.$data.operations[vm.$data.op_flag+1];
            }

            console.log(op);

            var ranks = vm.$data.ranks;
            var rank_old = ranks[op.old_rank];

            var el_old = $('#rank-' + op.old_rank);
            var el_new = $('#rank-' + op.new_rank);

            el_old
                .find('.p-'+op.problem_index).addClass('uncover')
                .find('.p-content').addClass('uncover');

            if (op.new_rank == op.old_rank) {
                if (vm.$data.op_flag < op_length) {
                    var el_old_next = $('#rank-' + op_next.old_rank);
                }

                setTimeout(function() {
                    if (op.new_verdict == 'AC') {
                        rank_old.score += 1;
                        rank_old.penalty += op.new_penalty;
                        rank_old.problem[op.problem_index].old_penalty = op.new_penalty;
                    }

                    rank_old.problem[op.problem_index].old_verdict = op.new_verdict;
                    rank_old.problem[op.problem_index].new_verdict = "NA";

                    if(op.new_verdict == 'AC'){
                        rank_old.problem[op.problem_index].old_submissions = op.new_submissions;
                        rank_old.problem[op.problem_index].frozen_submissions = 0;
                        rank_old.problem[op.problem_index].new_submissions = 0;
                    } else {
                        rank_old.problem[op.problem_index].old_submissions +=  op.frozen_submissions;
                        rank_old.problem[op.problem_index].frozen_submissions = 0;
                        rank_old.problem[op.problem_index].new_submissions = 0;
                    }

                    Vue.nextTick(function() {
                        el_old
                            .find('.p-'+op.problem_index).addClass('uncover')
                            .find('.p-content').removeClass('uncover');
                    });

                    setTimeout(function() {
                        vm.selected(el_old, 'remove');
                        if(vm.$data.op_flag < op_length)
                            vm.selected(el_old_next, 'add');
                        el_old.find('.p-'+op.problem_index).removeClass('uncover');
                        vm.$data.op_flag += 1;
                        vm.$data.op_status = true;
                    }, FLAHING_TIME + 100);

                }, FLAHING_TIME);
            } else {
                var old_pos_top = el_old.position().top;
                var new_pos_top = el_new.position().top;
                var distance = new_pos_top - old_pos_top;
                var win_heigth = $(window).height();

                if (Math.abs(distance) > win_heigth) {
                    distance = -(win_heigth + 100);
                }

                var j = op.old_rank - 1;
                var el_obj = [];

                for (j; j >= op.new_rank; j--) {
                    var el = $('#rank-'+ j);
                    el.rank_obj = ranks[j];
                    el_obj.push(el);
                }

                setTimeout(function() {
                    if(op.new_verdict == 'AC'){
                        rank_old.score += 1;
                        rank_old.rank_show = op.new_rank_show;
                        console.log("new_rank_show" + op.new_rank_show);
                        rank_old.penalty += op.new_penalty;
                        rank_old.problem[op.problem_index].old_penalty = op.new_penalty;
                    }

                    rank_old.problem[op.problem_index].old_verdict = op.new_verdict;
                    rank_old.problem[op.problem_index].new_verdict = "NA";

                    if (op.new_verdict == 'AC') {
                        rank_old.problem[op.problem_index].old_submissions = op.new_submissions;
                        rank_old.problem[op.problem_index].frozen_submissions = 0;
                        rank_old.problem[op.problem_index].new_submissions = 0;
                    } else {
                        rank_old.problem[op.problem_index].old_submissions +=  op.frozen_submissions;
                        rank_old.problem[op.problem_index].frozen_submissions = 0;
                        rank_old.problem[op.problem_index].new_submissions = 0;
                        alert(rank_old.problem[op.problem_index].old_submissions);
                    }

                    Vue.nextTick(function(){
                        el_old
                            .find('.p-'+op.problem_index).addClass('uncover')
                            .find('.p-content').removeClass('uncover');

                        el_old.find('.rank').text(op.new_rank_show);
                        el_obj.forEach(function(val,i){
                            var dom_rank = el_obj[i].find('.rank');
                            var dom_rank_old = el_old.find('.rank');
                            if (dom_rank.text() !== "*" && dom_rank_old.text() !== "*") {
                                var new_rank_show = Number(dom_rank.text())+1;
                                dom_rank.text(new_rank_show);
                                el_obj[i].rank_obj.rank_show = new_rank_show;
                            }
                        });
                    });

                    setTimeout(function() {
                        el_old
                            .css('position', 'relative')
                            .animate({ top: distance+'px' }, ROLLING_TIME, function(){
                                el_new.removeAttr('style');
                                el_old.removeAttr('style');
                                var ranks_tmp = $.extend(true, [], ranks);
                                var data_old = ranks_tmp[op.old_rank];
                                var i = op.old_rank - 1;
                                for(i; i >= op.new_rank; i--){
                                    ranks_tmp[i+1] = ranks_tmp[i];
                                }
                                ranks_tmp[op.new_rank] = data_old;
                                vm.$set('ranks', ranks_tmp);
                                Vue.nextTick(function () {
                                    el_obj.forEach(function(val,i){ el_obj[i].removeAttr('style'); });
                                    el_old.find('.p-'+op.problem_index).removeClass('uncover');
                                    if(vm.$data.op_flag < op_length)
                                        var el_old_next = $('#rank-' + op_next.old_rank);
                                    vm.selected(el_old, 'remove');
                                    if(vm.$data.op_flag < op_length)
                                        vm.selected(el_old_next, 'add');
                                    vm.$data.op_flag += 1;
                                    vm.$data.op_status = true;
                                });
                            });

                        for (var i = 0 ; i<el_obj.length ; ++i) {
                            if (106 * (i - 1) <= win_heigth) {
                                el_obj[i].animate({'top': 106+'px'}, ROLLING_TIME);
                            } else {
                                el_obj[i].css({'top': 106+'px'});
                            }
                        }
                    }, FLAHING_TIME + 100); // two loop
                }, FLAHING_TIME);
            }

        },

        back: function() {

        }
    };
    window.Operation = {
        next: function () {
            vm.$data.op_status = false;
            var op = vm.$data.operations[vm.$data.op_flag];
            var op_length = vm.$data.operations.length - 1;

            if (vm.$data.op_flag < op_length) {
                var op_next = vm.$data.operations[vm.$data.op_flag + 1];
            }

            console.log(op);

            var ranks = vm.$data.ranks;
            var rank_old = ranks[op.old_rank];

            var el_old = $('#rank-' + op.old_rank);
            var el_new = $('#rank-' + op.new_rank);

            if (op.problem_index !== -1) { // 实际操作
                el_old
                    .find('.p-' + op.problem_index).addClass('uncover')
                    .find('.p-content').addClass('uncover');

                if (op.new_rank === op.old_rank) {
                    if (vm.$data.op_flag < op_length) {
                        var el_old_next = $('#rank-' + op_next.old_rank);
                    }

                    setTimeout(function () {
                        if (op.new_verdict === 'AC') {
                            rank_old.score += 1;
                            rank_old.penalty += op.new_penalty;
                            rank_old.problem[op.problem_index].old_penalty = op.new_penalty;
                        }

                        rank_old.problem[op.problem_index].old_verdict = op.new_verdict;
                        rank_old.problem[op.problem_index].new_verdict = "NA";

                        if (op.new_verdict === 'AC') {
                            rank_old.problem[op.problem_index].old_submissions = op.new_submissions;
                            rank_old.problem[op.problem_index].frozen_submissions = 0;
                            rank_old.problem[op.problem_index].new_submissions = 0;
                        } else {
                            rank_old.problem[op.problem_index].old_submissions += op.frozen_submissions;
                            rank_old.problem[op.problem_index].frozen_submissions = 0;
                            rank_old.problem[op.problem_index].new_submissions = 0;
                        }

                        Vue.nextTick(function () {
                            el_old
                                .find('.p-' + op.problem_index).addClass('uncover')
                                .find('.p-content').removeClass('uncover');
                        });

                        setTimeout(function () {
                            vm.selected(el_old, 'remove');
                            if (vm.$data.op_flag < op_length)
                                vm.selected(el_old_next, 'add');
                            el_old.find('.p-' + op.problem_index).removeClass('uncover');
                            vm.$data.op_flag += 1;
                            vm.$data.op_status = true;
                        }, FLAHING_TIME + 100);

                    }, FLAHING_TIME);
                } else { // 排名有变化
                    var old_pos_top = el_old.position().top;
                    var new_pos_top = el_new.position().top;
                    var distance = new_pos_top - old_pos_top;
                    var win_heigth = $(window).height();

                    if (Math.abs(distance) > win_heigth) {
                        distance = -(win_heigth + 100);
                    }

                    var j = op.old_rank - 1;
                    var el_obj = [];

                    for (j; j >= op.new_rank; j--) {
                        var el = $('#rank-' + j);
                        el.rank_obj = ranks[j];
                        el_obj.push(el);
                    }

                    setTimeout(function () {
                        if (op.new_verdict === 'AC') {
                            rank_old.score += 1;
                            rank_old.rank_show = op.new_rank_show;
                            console.log("new_rank_show" + op.new_rank_show);
                            rank_old.penalty += op.new_penalty;
                            rank_old.problem[op.problem_index].old_penalty = op.new_penalty;
                        }

                        rank_old.problem[op.problem_index].old_verdict = op.new_verdict;
                        rank_old.problem[op.problem_index].new_verdict = "NA";

                        if (op.new_verdict === 'AC') {
                            rank_old.problem[op.problem_index].old_submissions = op.new_submissions;
                            rank_old.problem[op.problem_index].frozen_submissions = 0;
                            rank_old.problem[op.problem_index].new_submissions = 0;
                        } else {
                            rank_old.problem[op.problem_index].old_submissions += op.frozen_submissions;
                            rank_old.problem[op.problem_index].frozen_submissions = 0;
                            rank_old.problem[op.problem_index].new_submissions = 0;
                            alert(rank_old.problem[op.problem_index].old_submissions);
                        }

                        Vue.nextTick(function () {
                            el_old
                                .find('.p-' + op.problem_index).addClass('uncover')
                                .find('.p-content').removeClass('uncover');

                            el_old.find('.rank').text(op.new_rank_show);
                            el_obj.forEach(function (val, i) {
                                var dom_rank = el_obj[i].find('.rank');
                                var dom_rank_old = el_old.find('.rank');
                                if (dom_rank.text() !== "*" && dom_rank_old.text() !== "*") {
                                    var new_rank_show = Number(dom_rank.text()) + 1;
                                    dom_rank.text(new_rank_show);
                                    el_obj[i].rank_obj.rank_show = new_rank_show;
                                }
                            });
                        });

                        setTimeout(function () {
                            el_old
                                .css('position', 'relative')
                                .animate({top: distance + 'px'}, ROLLING_TIME, function () {
                                    el_new.removeAttr('style');
                                    el_old.removeAttr('style');
                                    var ranks_tmp = $.extend(true, [], ranks);
                                    var data_old = ranks_tmp[op.old_rank];
                                    var i = op.old_rank - 1;
                                    for (i; i >= op.new_rank; i--) {
                                        ranks_tmp[i + 1] = ranks_tmp[i];
                                    }
                                    ranks_tmp[op.new_rank] = data_old;
                                    vm.$set('ranks', ranks_tmp);
                                    Vue.nextTick(function () {
                                        el_obj.forEach(function (val, i) {
                                            el_obj[i].removeAttr('style');
                                        });
                                        el_old.find('.p-' + op.problem_index).removeClass('uncover');
                                        if (vm.$data.op_flag < op_length)
                                            var el_old_next = $('#rank-' + op_next.old_rank);
                                        vm.selected(el_old, 'remove');
                                        if (vm.$data.op_flag < op_length)
                                            vm.selected(el_old_next, 'add');
                                        vm.$data.op_flag += 1;
                                        vm.$data.op_status = true;
                                    });
                                });

                            for (var i = 0; i < el_obj.length; i++) {
                                if (106 * (i - 1) <= win_heigth) {
                                    el_obj[i].animate({'top': 106 + 'px'}, ROLLING_TIME);
                                } else {
                                    el_obj[i].css({'top': 106 + 'px'});
                                }
                            }
                        }, FLAHING_TIME + 100); // two loop
                    }, FLAHING_TIME);
                }
            } else { // 空操作，仅选中该排名
                setTimeout(function () {
                    vm.selected(el_old, 'add');
                    setTimeout(function () {
                        vm.selected(el_old, 'remove');
                        vm.$data.op_flag += 1;
                        vm.$data.op_status = true;
                    }, FLAHING_TIME + 100);
                }, FLAHING_TIME);
            }
        }
    };
    Vue.filter('toMinutes', function (value) {
        return parseInt(value/60);
    });

    Vue.filter('problemStatus', function (problem) {
        return resolver.status(problem);
    });

    Vue.filter('submissions', function (problem) {
        var st = resolver.status(problem);
        if(st == 'ac')
            return problem.old_submissions + '/' + parseInt(problem.old_penalty / 60);
        else if(st == 'frozen')
            return problem.old_submissions + '+' + problem.frozen_submissions;
        else if(st == 'failed')
            return problem.old_submissions;
        else
            return String.fromCharCode("A".charCodeAt(0) + problem.problem_index);
        // TODO:
    });

    Vue.config.debug = true;

    window.vm = new Vue({
        el: '.app',

        data: {
            op_flag: Number(Storage.fetch('opera_flag')),
            op_status: true,  // running: false, stop: true
            p_count: resolver.problem_count,
            ranks: Storage.fetch('ranks'),
            //ranks: resolver.rank_frozen,
            operations: resolver.operations,
            users: resolver.users
        },

        ready: function () {
            this.$watch('ranks', function(ranks){
                Storage.update('ranks', ranks);
            }, {'deep': true});

            this.$watch('op_flag', function(op_flag){
                Storage.update('opera_flag', op_flag);
            }, {'deep': true});

            if(this.op_flag < this.operations.length){
                var op = this.operations[this.op_flag];
                this.selected($('#rank-'+op.old_rank), 'add');
            }
        },

        methods: {
            reset: function(){
                if(confirm('确定要重置排名吗？')){
                    localStorage.clear();
                    window.location.reload();
                }
            },

            selected: function(el, type){
                if(type == 'add'){
                    el.addClass('selected');
                }else if(type == 'remove')
                    el.removeClass('selected');
            },
        }
    });
}

function isUrl(urlString) {
    return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(urlString);
}

function clearCache() {
   // 清空 localStorage
    localStorage.clear();

    // 清空表单输入
    $('#input-data').val('');
    $('#contest_name').val('');
    $('#frozen_seconds').val('');
    $('#problem_count').val('');
    $('#contest_start_time').val('');
    $('#problem_ids').val('');
    $('#exp-url').val('');

    // 可选：重新加载页面以确保所有状态重置
    // window.location.reload();
}

function processData(data) {
    $('title').text(data.contest_name);
    $('#title').text(data.contest_name);
    $('.form-group').css("display", "none");
    $('.footer').css("display", "none");
    $('.rank-list').css("display", "");

    var resolver = new Resolver(data.solutions, data.users, data.problem_count, data.frozen_seconds);
    window.resolver = resolver;
    resolver.calcOperations();

    vuejs();

    document.onkeydown = function(event){
        var e = event || window.event || arguments.callee.caller.arguments[0];

        if (e && e.keyCode == 37 /*&& vm.$data.op_status*/) { // key left
            Operation.back();
        }

        if (e && e.keyCode == 39 && vm.$data.op_status) { // key right
            Operation.next();
        }
    };
    clearCache();
}

function loadData() {
    // clearCache();

    const input = $('#input-data').val().trim();

    if (isUrl(input)) {
        console.log(`load data from url. [url=${input}]`);
        $.getJSON(input, function(data) {
            processData(data);
        }).fail(function(jqxhr, textStatus, error) {
            const err = textStatus + ", " + error;
            console.error("Request Failed: " + err);
            alert("无法从指定的 URL 加载数据。请检查 URL 是否正确并且返回有效的 JSON 数据。");
        });
    } else {
        try {
            console.log(`load data from json content. [length=${input.length}]`)
            const data = JSON.parse(input);
            processData(data);
        } catch (e) {
            console.error("JSON Parsing Error:", e);
            alert("源 JSON 数据格式不正确。");
        }
    }
}

function clearCacheNeedDoubleCheck() {
    if (confirm("确定要清除缓存吗？")) {
        clearCache();
    }
}

function loadDataNeedDoubleCheck() {
    if (confirm('确定要加载数据吗？')) {
        loadDataWithConfig();
    }
}
function loadExampleData() {
    if (confirm('确定要加载示例数据吗？')) {
        // 获取当前页面的目录路径
        const currentPath = window.location.pathname.replace(/\/[^\/]*$/, '/');
        const url = `contest.json`;

        console.log(`load data from url. [url=${url}]`);

        $.getJSON(url, function(data) {
            processData(data);
        }).fail(function(jqxhr, textStatus, error) {
            const err = textStatus + ", " + error;
            console.error("Request Failed: " + err);
            alert("无法加载示例数据。请检查 'contest.json' 文件是否存在且格式正确。");
        });
    }
}

// 辅助函数：解析自定义格式的日期时间字符串
function parseCustomDateTime(dateTimeStr) {
    // 替换空格为 'T'
    let isoStr = dateTimeStr.replace(' ', 'T');

    // 截断微秒部分，只保留毫秒（3 位）
    isoStr = isoStr.replace(/(\.\d{3})\d+/, '$1');

    // 补全时区偏移为 '+00:00'
    isoStr = isoStr.replace(/([+-]\d{2})$/, '$1:00');

    return new Date(isoStr);
}

// 新增：加载数据并根据配置进行转换
function loadDataWithConfig() {
    // 获取配置参数
    const contestName = $('#contest_name').val().trim();
    const frozenSeconds = parseInt($('#frozen_seconds').val().trim());
    const problemCount = parseInt($('#problem_count').val().trim());
    const contestStartTimeStr = $('#contest_start_time').val().trim();
    const problemIdsStr = $('#problem_ids').val().trim();
    const sourceJsonStr = $('#input-data').val().trim();

    // 检查是否填写了所有配置参数
    const isConfigFilled = contestName && !isNaN(frozenSeconds) && !isNaN(problemCount) &&
                           contestStartTimeStr && problemIdsStr;

    if (isConfigFilled) {
        // 解析问题 ID 列表
        const problemIds = problemIdsStr.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

        if (problemIds.length !== problemCount) {
            alert('问题数量与问题 ID 列表的长度不一致。');
            return;
        }

        // 解析源 JSON 数据
        let submissions;
        if (isUrl(sourceJsonStr)) {
            console.log(`load data from url. [url=${sourceJsonStr}]`);
            $.getJSON(sourceJsonStr, function(data) {
                submissions = data;
                // 继续处理数据
                continueProcessing();
            }).fail(function(jqxhr, textStatus, error) {
                const err = textStatus + ", " + error;
                console.error("Request Failed: " + err);
                alert("无法从指定的 URL 加载数据。请检查 URL 是否正确并且返回有效的 JSON 数据。");
            });
        } else {
            try {
                console.log(sourceJsonStr);
                submissions = JSON.parse(sourceJsonStr);
                console.log(submissions);
                // 继续处理数据
                continueProcessing();
            } catch (e) {
                console.error("JSON Parsing Error:", e);
                alert('源 JSON 数据格式不正确。');
                return;
            }
        }

        function continueProcessing() {
            if (!Array.isArray(submissions)) {
                alert('源 JSON 数据必须是一个数组。');
                return;
            }

            // 解析比赛开始时间
            let contestStartTime;
            try {
                contestStartTime = parseCustomDateTime(contestStartTimeStr);
                if (isNaN(contestStartTime.getTime())) {
                    throw new Error('无效的日期格式');
                }
            } catch (e) {
                alert('比赛开始时间格式不正确。请使用 "YYYY-MM-DD HH:MM:SS+ZZ:ZZ" 格式。');
                return;
            }

            // 按 create_time 排序提交记录
            submissions.sort((a, b) => parseCustomDateTime(a.create_time) - parseCustomDateTime(b.create_time));
            // 创建问题ID到问题索引的映射（从1开始）
            const problemIdToIndex = {};
            problemIds.forEach((pid, idx) => {
                problemIdToIndex[pid] = idx + 1;
            });

            // 初始化目标JSON结构
            const targetJson = {
                "contest_name": contestName,
                "frozen_seconds": frozenSeconds,
                "problem_count": problemCount,
                "problem_ids": problemIds,
                "contest_start_time": contestStartTime.toISOString(), // 转换为 ISO 字符串
                "solutions": {},
                "users": {}
            };

            // 临时存储用户信息
            const usersInfo = {};

            // 初始化 first_bloods
            const firstBloods = {}; // problem_index: user_id
            for (let i = 1; i <= problemCount; i++) {
                firstBloods[i] = null;
            }

            // 处理每个提交
            submissions.forEach(submission => {
                const submissionId = submission.id;
                const userId = String(submission.user_id);
                const username = submission.username;
                const result = submission.result;
                const problemId = submission.problem_id;
                const createTimeStr = submission.create_time;

                if (username === "root") {
                    return; // 跳过 root 用户
                }

                // 转换 result 为 verdict
                let verdict;
                if (result === 0) {
                    verdict = "AC";
                } else if (result === -1) {
                    verdict = "WA";
                } else if (result <= -2) {
                    verdict = "CE";
                } else {
                    verdict = "WA";
                }

                // 解析提交时间
                let createTime;
                try {
                    createTime = parseCustomDateTime(createTimeStr);
                    if (isNaN(createTime.getTime())) {
                        throw new Error('无效的日期格式');
                    }
                } catch (e) {
                    console.warn(`无法解析 create_time '${createTimeStr}'。提交ID: ${submissionId}`);
                    return;
                }
                // 计算提交时间与比赛开始时间的差值（秒数）
                let submittedSeconds = Math.floor((createTime - contestStartTime) / 1000);
                if (submittedSeconds < 0) {
                    console.warn(`提交时间早于比赛开始时间。提交ID: ${submissionId}`);
                    submittedSeconds = 0; // 根据需求处理
                }

                // 获取 problem_index
                const problemIndex = problemIdToIndex[problemId];
                if (!problemIndex) {
                    console.warn(`未找到 problem_id ${problemId} 的对应 problem_index。`);
                    return; // 跳过未找到的题目
                }

                // 构建 solution 条目
                targetJson.solutions[submissionId] = {
                    "user_id": userId,
                    "problem_index": String(problemIndex),
                    "verdict": verdict,
                    "submitted_seconds": submittedSeconds
                };

                // 更新用户信息
                if (!usersInfo[userId]) {
                    usersInfo[userId] = {
                        "name": username,
                        "college": "CAFUC", // 统一设置为 "CAFUC"
                        "is_exclude": false, // 默认设置为 False，可根据需要修改
                        "first_bloods": []
                    };
                }

                // 记录一血
                if (verdict === "AC" && !firstBloods[problemIndex]) {
                    firstBloods[problemIndex] = userId;
                    usersInfo[userId].first_bloods.push(problemIndex);
                }
            });

            // 将用户信息添加到目标JSON
            targetJson.users = usersInfo;
            console.log(targetJson);

            // 调用现有的 processData 函数加载数据
            processData(targetJson);
            alert('滚榜数据已成功加载！');
        }
    } else {
        // 如果未填写配置参数，按原始方式加载数据
        loadData();
    }
}
