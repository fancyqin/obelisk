// require jQuery, observe.js, SimplePromise.js
// require obelisk/module/_tour.scss
/**
 * Tour
 * newer guilder
 * author: lvx, qinf
 */
var Tour = function(){

var tmpl = '' + 
	'<div class="ft-tour J-tour">' +
        '<div class="ft-cover"></div>' +
        '<div class="ft-layer ft-highlight J-layer"></div>' +
        '<div class="ft-layer J-layer">' +
            '<div class="ft-fake-layer"></div>' +
            '<div class="ft-box">' +
                '<i class="ft-close micon J-close">&#xe00c;</i>' +
                '<div class="ft-inner J-inner">' +
					'<div class="ft-arr J-arr"></div>' +
                    '<div class="ft-words">' +
                        '<p class="ft-txt J-content"></p>' +
                        '<div class="ft-btnwrap cf">' +
                            '<button class="tour-btn ft-prev J-prev"><%=prev%></button>' +
                            '<button class="tour-btn ft-next J-next"><%=next%></button>' +
                            '<button class="tour-btn main-btn ft-done ft-close J-done"><%=done%></button>' +
                            '<button class="tour-btn ft-done ft-again J-again"><%=again%></button>' +
                            '<div class="tour-dot J-tour-dots"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';

var DIR = {
	'N': "ft-dir-ct",
	'S': "ft-dir-cb",
	'NW': "ft-dir-lt",
	'W': "ft-dir-lc",
	'WS': "ft-dir-lb",
	'NE': "ft-dir-rt",
	'E': "ft-dir-rc",
	'ES': "ft-dir-rb"
};

var defaults = {
	steps: [
		/*
		{
			elem: ".J-step-1",
			html: "first step....",
			dir: "s",
			css: {},
			offset: {},
			before: function(resolve){}, // Promise
			clear: function(){}, // 在结束或者下一步时调用，主要用于清除 before 和 callback操作产生的影响
			callback: function(){}
		}*/
	],
	tmpl: tmpl,
	text: {
		prev: "上一页",
		next: "下一页",
		done: "完成",
		again: "再看一遍"
	},
	zIndex: 10000,
	auto: false
};

var Tour = function(config){
	this._ = {};
	this.elems = {};
	this.config = $.extend(true, {}, defaults, config);

	observe(this);

	this.__init();
};

Tour.prototype = {
	custructor: Tour,
	__init: function(){
		var _this = this;
		this._.prevIndex = 0;
		this._.index = 0;
		this._.cssCache = {};

		this.config.tmpl = this.config.tmpl.replace(/<%=(\w+?)%>/g, function($0, name){
			return _this.config.text[name] || "";
		});

		this._.dirClasses = [];

		for(var dir in DIR){
			this._.dirClasses.push(DIR[dir]);
		}

		this.elems.$tour = $(this.config.tmpl);
		this.elems.$layer = this.elems.$tour.find('.J-layer');
		this.elems.$txtBox = this.elems.$tour.find('.J-content');
		this.elems.$tourDots = this.elems.$tour.find('.J-tour-dots');
		this.elems.$next =  this.elems.$tour.find('.J-next');
		this.elems.$prev = this.elems.$tour.find('.J-prev');
		this.elems.$done = this.elems.$tour.find('.J-done');
		this.elems.$again = this.elems.$tour.find('.J-again');
		this.elems.$close = this.elems.$tour.find('.J-close');
		this.elems.$inner = this.elems.$tour.find('.J-inner');
		this.elems.$arrow = this.elems.$tour.find('.J-arr');

		this.elems.$tour.appendTo(document.body);
		this.hide();

		this.__bindEvents();

		if(this.config.auto){
			this.start();
		}
	},
	__bindEvents: function(){
		var _this = this;

		var stop = function(e){
			e.stopPropagation();
            e.preventDefault();
		};

		this.elems.$tour.on("click", stop)
			.on('click','.J-close', function (e) {
				_this.hide();
			}).on('click','.J-done', function (e) {
				_this.hide();
			}).on('click','.J-next', function(e){
				_this.step(_this._.index + 1);
			}).on('click','.J-prev', function(e){
				_this.step(_this._.index + 1);
			}).on('click','.J-again', function(e){
				_this.start("restart");
			});

		this.elems.$tourDots.on("click", stop).on("click", "i", function(e){
			var index = $(e.target).index();
			_this.step(index);
		});

		this._.onresize = function(){
			if(_this.isShow){
				_this._setPosition();
			}
		};

		$(window).on("resize scroll", this._.onresize);
	},
	__restoreCss: function(el){
		el = el || this.config.steps[this._.index].elem;

		$(el).css(this._.cssCache);
	},
	__setCss: function(el, css){
		if(css.position === "static" || !css.position){
			$(el).css({
				position: "relative",
				zIndex: this.config.zIndex
			});
		}else{
			$(el).css({
				zIndex: this.config.zIndex
			});
		}
	},
	resetCss: function(){
		this.__setCss(this.config.steps[this._.index].elem, this._.cssCache);
	},
	__getCss: function(el){
		var $el = $(el);
		var cssText = $el[0].style.cssText;

		var zIndex = $el.css("zIndex");

		if(zIndex === "auto"){
			zIndex = "";
		}

		var pos = $el.css("position") || "static";

		// 防止其他js操作或元素的父级样式变更修改这些样式
		// 恢复时对原来没写在内联的样式做清除处理
		if(!/z-index/.test(cssText)){
			zIndex = "";
		}

		if(!/position/.test(cssText)){
			pos = "";
		}

		return {
			position: pos,
			zIndex: zIndex 
		};
	},
	_getPos: function(el){
		var $el = $(el);
		var rect = $el[0].getBoundingClientRect();

		return {
			top: rect.top + (window.scrollTop || document.documentElement.scrollTop || document.body.scrollTop),
			left: rect.left + (window.scrollLeft || document.documentElement.scrollLeft || document.body.scrollLeft),
			width: (parseFloat($el.css("width")) || 0)
				+ (parseFloat($el.css("paddingLeft")) || 0)
				+ (parseFloat($el.css("paddingRight")) || 0),
			height: (parseFloat($el.css("height")) || 0)
				+ (parseFloat($el.css("paddingTop")) || 0)
				+ (parseFloat($el.css("paddingBottom")) || 0)
		};
	},
	_setPosition: function(){
		var stepConfig = this.config.steps[this._.index];
		var $target = $(stepConfig.elem);
		var pos = this._getPos($target);

		var offset = $.extend(true, {top: 0, left: 0}, stepConfig.offset);
		pos.top += offset.top;
		pos.left += offset.left;

		var css = $.extend(true, pos, stepConfig.css);

		css.width += 20;
		css.height += 20;
		css.top -= 10;
		css.left -= 10;

		this.elems.$layer.css(css);
	},
	/*autoPosition: function(){
		this._setPosition();
	},*/
	_checkButtonStatus: function(index){
		index = index || this._.index;
		var stepConfig = this.config.steps[index];

		var $next = this.elems.$next;
		var $prev = this.elems.$prev;
		var $done = this.elems.$done;
		var $again = this.elems.$again;

		if (index === 0){
            $next.show();
            $prev.hide();
            $done.hide();
			$again.hide();
        }
		
		if(index === this.config.steps.length - 1){
            $next.hide();
            $prev.hide();
            $done.show();
			$again.show();
        }
		
		if(index > 0 && index < this.config.steps.length - 1){
            $next.show();
            $prev.show();
            $done.hide();
			$again.hide();
        }

		if(this.config.steps.length === 1){
			$next.hide();
            $prev.hide();
            $done.show();
			$again.hide();
		}
	},
	_clear: function(index){
		if(typeof index === "undefined"){
			index = this._.index;
		}

		var stepConfig = this.config.steps[index];

		if(typeof stepConfig.clear === 'function'){
			stepConfig.clear.call(this);
		}
	},
	_step: function(index){
		var _this = this;
		var stepConfig = this.config.steps[index];
		var $target = $(stepConfig.elem);
		var dir = (stepConfig.dir || "S").toUpperCase();

		// 元素不存在，则移除这一步 并重置ui，移到下一步
		if(!$target.length){
			this.config.steps.splice(index, 1);
			this._resetDots();
			this.step(index);
			return;
		}

		this._.prevIndex = this._.index;
		this._.index = index;

		if(!(dir in DIR)){
			dir = "S";
		}

		switch(dir){
			case "N":
			case "NW":
			case "NE": {
				this.elems.$inner.append(this.elems.$arrow);
			}; break;
			default: {
				this.elems.$inner.prepend(this.elems.$arrow);
			};
		}

		this.elems.$inner.removeClass(this._.dirClasses.join(" "))
			.addClass(DIR[dir]);
		
		// dot
		this.elems.$tourDots.find(".J-dot")
			.removeClass("on")
			.eq(index)
			.addClass("on");

		// html
		this.elems.$txtBox.html(stepConfig.html);

		// position, zIndex
		this.__restoreCss(this.config.steps[this._.prevIndex].elem);
		this._.cssCache = this.__getCss($target);

		SimplePromise.delay(175).then(function(){
			_this.__setCss($target, _this._.cssCache);
		});

		this._checkButtonStatus(index);

		// set position
		this._setPosition();

		var pos = this._getPos($target);

		$('html,body').animate({
			scrollTop: pos.top - 200
		}, 400);

		if(typeof stepConfig.callback === 'function'){
			stepConfig.callback.call(this, stepConfig);
		}

		this.fire("step", index, this._.prevIndex);
	},
	step: function(index){
		var _this = this;

		index = parseInt(index) || 0;

		if(index < 0){
			index = 0;
		}

		index = index % this.config.steps.length;

		var stepConfig = this.config.steps[index];

		if(!stepConfig){
			return;
		}

		this._clear(index);

		var before = function(resolve){resolve()};

		if(typeof stepConfig.before === "function"){
			before = stepConfig.before;
		}

		new SimplePromise(before).then(function(){
			_this._step(index);
		});
	},
	start: function(isRestart){
		this.show();
		this.step(0);

		this.fire("start");
	},
	_resetDots: function(){
		this.elems.$tourDots.empty();

		if(this.config.steps.length > 1){
			for (var i = 0; i < this.config.steps.length; i++){
				this.elems.$tourDots.append('<i class="J-dot"></i>');
			}
		}
	},
	show: function(silent){
		this._resetDots();

		this.elems.$tour.show();
		this.isShow = true;

		!silent && this.fire("show");
	},
	hide: function(silent){
		this.elems.$tour.hide();
		this._clear();
		this.__restoreCss();
		this.isShow = false;

		!silent && this.fire("hide");
	},
	dispose: function(){
		this.hide("silent");
		this.fire("dispose");
		this.off();
		this.elems.$tour.remove();

		for(var key in this.elems){
			delete this.elems[key]
		}

		if(this._.onresize){
			$(window).unbind("resize scroll", this._.onresize);
		}
	}
};

Tour.setDefaults = function(config){
	$.extend(true, defaults, config);
};

return Tour;

}.call(this);