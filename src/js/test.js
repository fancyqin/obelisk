;
void
function () {


    var configs = {
        text: 'yes'
    };


    var Abcd = function (conf) {
        var key;
        for (key in conf) {
            configs[key] = conf[key];
        }
        this.conf = configs;
    };

    Abcd.prototype.getTxt = function () {
        console.log(this.conf.text);
    };

    window.Abcd = Abcd;


}.call(this);

(function () {

})();