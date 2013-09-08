(function(factory){
	
	//貌似是jquery factory的判断
	if(typeof define == 'function' && define.amd)
		define(['jquery'], factory);
	else
		factory(jQuery);
}(function($){
	//加载
	var Wookmark, defaultOptions, _bind;
	_bind = function(fn, me){
		return function(){
			return fn.apply(me, arguments);
		};
	};
	
	//Wookmark default option
	defaultOption = {
		align: 'center',
		container: $('body'),
		offset: 2,
		autoResize: false,
		itemWith: 0,
		flexibleWidth: 0,
		resizeDelay: 50,
		onLayoutChanged: undefined,
		fillEmptySpace: false
	};
	
	Wookmark = (function(options){
		//实例变量
		this.handler = handler;
		this.colums = this.containerWidth = this.resizeTimer = null;
		this.activeItemCount = 0;
		this.direction = 'left';
		this.itemHeighsDirty = true;
		this.placeholders = [];
		
		$.extend(true, this, defaultOptions, options);
		
	//得到可是并且无效栏的方法
	Wookmark.prototype.getActiveItems = function(){
		return this.handler.not('.inactive');
	};
	
	Wookmark.prototype.getItemWidth = function(){
		
	};
		
	});
})(jQuery));





