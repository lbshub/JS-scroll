/**
 * LBS Scroll 左右滚动  复制删除节点方式
 * Date: 2012-5-18
 * ===================================================
 * opts.el 外围包裹容器(wrapper) (一个ID或者元素对象)
          它的第一个子元素(scroller)为实际滚动对象
 * opts.count 每次滚动的个数 (默认1个)
 * opts.width 单个的宽度 (默认scroller第一个子元素的offsetWidth)
 * opts.amount 显示区域(wrapper)显示几个(默认根据wrapper的宽和单个宽换算)
 * opts.duration 动画持续时间 (默认400毫秒)
 * opts.easing 动画效果 默认'linear' (*)
 	spring: 弹簧(*)
 	wobble: 摇晃
 	swing: 摇摆(*)
 	bounce: 反弹(*)
 	easeIn: 加速 渐入
 	easeOut: 减速 渐出
 	easeInOut: 先加速后减速 渐入渐出(*)
 	easeFrom: 由慢到快
 	easeTo: 由快到慢
 	easeOutBounce: 渐出反弹(*)
 	easeInOutBack: 渐入渐出晃动
 	easeInOutQuad: 渐入渐出 四次方(*)
 	easeInOutCubic: 渐入渐出 三次方
 * opts.auto 是否自动滚动(默认false)
 * opts.delay 自动滚动间隔时间(默认5000毫秒)
 * ===================================================
 * this.scrollLeft() 向左滚动(方便手动调用)
 * this.scrollRight() 向右滚动(方便手动调用)
 * ===================================================
 **/

;(function(window, document) {
	'use strict';

	var tween = {
		linear: function(pos) {
			return pos;
		},
		spring: function(pos) {
			return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
		},
		wobble: function(pos) {
			return (-Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
		},
		swing: function(pos) {
			return 0.5 - Math.cos(pos * Math.PI) / 2;
		},
		bounce: function(pos) {
			if (pos < (1 / 2.75)) {
				return (7.5625 * pos * pos);
			} else if (pos < (2 / 2.75)) {
				return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
			} else if (pos < (2.5 / 2.75)) {
				return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
			} else {
				return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
			}
		},
		easeIn: function(pos) {
			return -Math.cos(pos * (Math.PI / 2)) + 1;
		},
		easeOut: function(pos) {
			return Math.sin(pos * (Math.PI / 2));
		},
		easeInOut: function(pos) {
			return (-.5 * (Math.cos(Math.PI * pos) - 1));
		},
		easeFrom: function(pos) {
			return Math.pow(pos, 4);
		},
		easeTo: function(pos) {
			return Math.pow(pos, 0.25);
		},
		easeOutBounce: function(pos) {
			if ((pos) < (1 / 2.75)) {
				return (7.5625 * pos * pos);
			} else if (pos < (2 / 2.75)) {
				return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
			} else if (pos < (2.5 / 2.75)) {
				return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
			} else {
				return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
			}
		},
		easeInOutBack: function(pos) {
			var s = 1.70158;
			if ((pos /= 0.5) < 1) return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));
			return 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
		},
		easeInOutQuad: function(pos) {
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 2);
			return -0.5 * ((pos -= 2) * pos - 2);
		},
		easeInOutCubic: function(pos) {
			if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3);
			return 0.5 * (Math.pow((pos - 2), 3) + 2);
		}
	};

	var Scroll = function(opts) {
		opts = opts || {};
		if (opts.el === undefined) return;
		this.wrapper = typeof opts.el === 'string' ? document.getElementById(opts.el) : opts.el;
		this.scroller = this.wrapper.children[0];
		this.elements = this.scroller.children;
		this.length = this.elements.length;

		this.count = opts.count || 1; //滚动几个
		this.width = opts.width || parseInt(this.elements[0].offsetWidth); //单个的宽度
		this.amount = opts.amount || Math.floor(this.wrapper.offsetWidht / this.width); //显示区域能显示几个
		if (this.amount > this.length) this.amount = this.length;
		if (this.count > this.amount) this.count = this.amount;

		this.distance = this.count * this.width; //每次滚动距离
		this.totalWidth = this.width * this.length + this.distance; //总宽度

		this.duration = opts.duration || 400;
		this.easing = (opts.easing && tween[opts.easing]) || tween.linear;
		this.auto = opts.auto || false;
		this.auto && (this.delay = opts.delay || 5000);

		this._init();
	};
	Scroll.prototype = {
		_init: function() {
			this._initSet();
			this._bind();
		},
		_initSet: function() {
			this.scroller.style.left = 0;
			this.scroller.style.width = this.totalWidth + 'px';
			this.els = [];
			for (var i = 0; i < this.length; i++) {
				this.els.push(this.elements[i]);
			}
		},
		_bind: function() {
			var _this = this;
			if (this.auto) {
				this.play();
				this.on(this.wrapper, 'mouseover', function() {
					_this.stop();
				});
				this.on(this.wrapper, 'mouseout', function() {
					_this.play();
				});
			}
		},
		_animate: function(el, sm, ft, fn) {
			var start = parseInt(el.style[sm]),
				end = ft,
				change = end - start,
				duration = this.duration,
				ease = this.easing,
				startTime = +new Date();
			!function animate() {
				var nowTime = +new Date(),
					timestamp = nowTime - startTime,
					delta = ease(timestamp / duration);
				el.style[sm] = start + (delta * change) + 'px';
				if (timestamp > duration) {
					el.style[sm] = end + 'px';
					fn && fn();
				} else {
					setTimeout(animate, 20);
				}
			}();
		},
		scrollLeft: function() {
			if (this.amimated) return;
			this.amimated = true;
			var _this = this,
				i = 0;
			for (; i < this.count; i++) {
				var item = this.els.shift(),
					itemClone = item.cloneNode(true);
				this.els.push(item);
				this.scroller.appendChild(itemClone);
			}
			this._animate(this.scroller, 'left', -this.distance, function() {
				_this.scroller.style.left = 0;
				for (i = 0; i < _this.count; i++) {
					_this.scroller.removeChild(_this.scroller.children[0]);
				}
				_this.amimated = false;
			});
		},
		scrollRight: function() {
			if (this.amimated) return;
			this.amimated = true;
			var _this = this,
				i = 0;
			for (; i < this.count; i++) {
				var item = this.els.pop(),
					itemClone = item.cloneNode(true);
				this.els.unshift(item);
				this.scroller.insertBefore(itemClone, this.scroller.children[0]);
			}
			this.scroller.style.left = -this.distance + 'px';
			this._animate(this.scroller, 'left', 0, function() {
				for (i = 0; i < _this.count; i++) {
					_this.scroller.removeChild(_this.scroller.children[_this.scroller.children.length - 1]);
				}
				_this.amimated = false;
			});
		},
		play: function() {
			var _this = this;
			this.timer = setInterval(function() {
				_this.scrollLeft();
			}, this.delay);
		},
		stop: function() {
			this.timer && clearInterval(this.timer);
			this.timer = null;
		},
		on: function(el, type, handler) {
			if (el.addEventListener) {
				el.addEventListener(type, handler, false);
			} else if (el.attachEvent) {
				el.attachEvent('on' + type, handler);
			} else {
				el['on' + type] = handler;
			}
		}
	};

	if (typeof define === 'function' && define.amd) {
		define('Scroll', [], function() {
			return Scroll;
		});
	} else {
		window.Scroll = Scroll;
	}

}(window, document));