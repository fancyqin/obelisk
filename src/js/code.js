

var highlight = ace.require("ace/ext/static_highlight");

function qsa(sel) {
    return Array.apply(null, document.querySelectorAll(sel));
}

if (!Array.prototype.forEach){
    Array.prototype.forEach = function(fun /*, thisp*/)
        {
        var len = this.length;
        if (typeof fun != "function")
        throw new TypeError();

        var thisp = arguments[1];
        for (var i = 0; i < len; i++)
        {
        if (i in this)
        fun.call(thisp, this[i], i, this);
        }
    };
}



(function(){


    //highlight
    qsa('.J-highlight').forEach(function(el){
        highlight(el, {
            mode: el.getAttribute("ace-mode"),
            theme: el.getAttribute("ace-theme"),
            startLineNumber: 1,
            showGutter: el.getAttribute("ace-gutter"),
            trim: true
        });
    });

    //ace
    qsa('.J-sample').forEach(function(el){
        var box = el.querySelectorAll('.J-sampleBox')[0];
        var code = el.querySelectorAll('.J-sampleCode')[0];
        var id = code.getAttribute('id');
        var editor = ace.edit(id);
        editor.setTheme("ace/theme/tomorrow");
        var session = editor.getSession();
        session.setMode("ace/mode/html");
        session.setUseWrapMode(true);
        editor.setAutoScrollEditorIntoView(false);
        editor.setOption("minLines", 2);
        editor.setOption("maxLines", 100);
        editor.$blockScrolling = Infinity;

        editor.setValue(box.innerHTML);
        
        session.on('change',function(){
            box.innerHTML = editor.getValue();
        });


        
    });



    

    


})();    




    
