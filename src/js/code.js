var highlight = ace.require("ace/ext/static_highlight");
var beautify = ace.require("ace/ext/beautify");



if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fun /*, thisp*/ ) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();

        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                fun.call(thisp, this[i], i, this);
        }
    };
}

function renderHTML() {

}


(function () {

    function qsa(sel) {
        return Array.apply(null, document.querySelectorAll(sel));
    }

    var triggerAll = document.querySelector('.J-codeTriggerAll');

    function isSelectAll() {
        var triggers = qsa('.J-codeTrigger').length;
        var selectTriggers = qsa('.J-codeTrigger:checked').length;

        triggerAll.checked = triggers === selectTriggers ? true : false;
    }




    //highlight
    qsa('.J-highlight').forEach(function (el) {
        highlight(el, {
            mode: el.getAttribute("ace-mode") || 'ace/mode/sass',
            theme: el.getAttribute("ace-theme") || 'ace/theme/kuroir',
            startLineNumber: 1,
            showGutter: el.getAttribute("ace-gutter") || true,
            trim: true
        });
    });

    //ace & clip
    qsa('.J-sample').forEach(function (el) {
        var box = el.querySelectorAll('.J-sampleBox')[0];
        var code = el.querySelectorAll('.J-sampleCode')[0];
        var copy = el.querySelectorAll('.J-copy')[0];
        var codeBox = el.querySelectorAll('.J-codeBox')[0];
        var trigger = el.querySelectorAll('.J-codeTrigger')[0];
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
        beautify.beautify(editor.session);

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
                isSelectAll();
            });
        }





    });

    triggerAll.addEventListener('change', function () {
        qsa('.J-sample').forEach(function (el) {
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






})();