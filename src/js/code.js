void function () {

    var defaults = {
        items:[{
            elId:'id'
        }],
        cb:function(){}
    };

    var renderHTML = '<div class="sample-block J-sample">' +
        '<h5 class="sub-title" style="display:none;"><span>示例</span></h5>' +
        '<div class="sample J-sampleBox">' + '{{code}}' + '</div>' +
        '<h5 class="sub-title"><span>代码</span><div class="input-toggle"><label class="input-wrap"><input class="J-codeTrigger" type="checkbox"><span class="input-ctnr"></span></label></div></h5>' +
        '<div class="J-codeBox code-box">' +
        '<div class="copy"><button class="J-copy"><i class="micon">&#xe02e;</i></button></div>' +
        '<pre class="J-sampleCode" id="{{id}}"></pre>' + '{{info}}' +
        '</div>' +
        '</div>';

    var triggerAll = document.querySelector('.J-codeTriggerAll');

    var Obdemo = function (conf) {
        var key;
        for (key in conf) {
            defaults[key] = conf[key];
        }
        this.conf = defaults;
        this._init();
    };
    Obdemo.prototype = {
        _init: function () {

            this._render();
            this._highlight();
            this._aceCode();
            this._selectEvent();
            
            if(typeof this.conf.cb === 'function'){
                this.conf.cb.call(this);
            }

        },
        _render: function () {
            var _this = this;
            if(this.conf.items instanceof Array){
                this.conf.items.forEach(function(item){
                    var el = document.querySelector('#' + item.elId),
                        code = el.querySelector(item.codeEl || '.ob-code'),
                        info = el.querySelector(item.infoEl || '.ob-info');

                    if (el.length === 0) return;

                    var result = renderHTML.replace('{{id}}', item.elId).replace('{{code}}', code.innerHTML).replace('{{info}}', info ? info.innerHTML : '');
                    el.insertAdjacentHTML('afterend', result);
                    el.parentNode.removeChild(el);
                });
            }
            

        },
        _qsa: function (sel) {
            return Array.apply(null, document.querySelectorAll(sel));
        },
        _highlight: function () {
            var highlight = ace.require("ace/ext/static_highlight");
            //highlight
            this._qsa('.J-highlight').forEach(function (el) {
                highlight(el, {
                    mode: el.getAttribute("ace-mode") || 'ace/mode/sass',
                    theme: el.getAttribute("ace-theme") || 'ace/theme/kuroir',
                    startLineNumber: 1,
                    showGutter: el.getAttribute("ace-gutter") || true,
                    trim: true
                });
            });
        },
        _aceCode: function () {
            var _this = this;
            // var beautify = ace.require("ace/ext/beautify");
            //ace & clip
            this._qsa('.J-sample').forEach(function (el) {
                var box = el.querySelector('.J-sampleBox');
                var code = el.querySelector('.J-sampleCode');
                var copy = el.querySelector('.J-copy');
                var codeBox = el.querySelector('.J-codeBox');
                var trigger = el.querySelector('.J-codeTrigger');
                var id = code.getAttribute('id');
                var editor = ace.edit(id);


                editor.setTheme("ace/theme/kuroir");
                var session = editor.getSession();
                session.setMode("ace/mode/html");
                session.setUseWrapMode(true);
                editor.setAutoScrollEditorIntoView(false);
                editor.setOption("minLines", 2);
                editor.setOption("maxLines", 100);
                editor.$blockScrolling = Infinity;
                editor.setValue(box.innerHTML);
                // editor.commands.addCommands(beautify.commands);
                // beautify.beautify(editor.session);

                editor.clearSelection();

                //clip
                copy.setAttribute('data-clipboard-text', 'error');
                var clip = new Clipboard(copy, {
                    text: function () {
                        return box.innerHTML;
                    }
                });

                clip.on('success', function (e) {

                    copy.insertAdjacentHTML('afterend', '<div class="copy-tip J-copyTip">Copy Success!</div>');
                    var copyTip = el.querySelectorAll('.J-copyTip')[0];

                    setTimeout(function () {
                        copyTip.parentNode.removeChild(copyTip);

                    }, 1500);

                });

                //change        
                session.on('change', function () {
                    box.innerHTML = editor.getValue();
                    clip.text = function () {
                        return box.innerHTML;
                    };
                });



                if (trigger) {
                    trigger.addEventListener('change', function () {
                        if (this.checked) {
                            codeBox.classList.add('open');
                        } else {
                            codeBox.classList.remove('open');
                        }
                        _this.isSelectAll();
                    });
                }


            });
        },
        isSelectAll: function () {
            var triggers = this._qsa('.J-codeTrigger').length;
            var selectTriggers = this._qsa('.J-codeTrigger:checked').length;
            triggerAll.checked = triggers === selectTriggers ? true : false;
        },
        _selectEvent: function () {
            var _this = this;
            triggerAll.addEventListener('change', function () {
                _this._qsa('.J-sample').forEach(function (el) {
                    var codeBox = el.querySelectorAll('.J-codeBox')[0];
                    var trigger = el.querySelectorAll('.J-codeTrigger')[0];
                    if (triggerAll.checked) {
                        trigger.checked = true;
                        codeBox.classList.add('open');
                    } else {
                        trigger.checked = false;
                        codeBox.classList.remove('open');
                    }

                });
            });
        }

    };

    window.Obdemo = Obdemo;


}.call(this);