// $('img.photo',this).imagesLoaded(myFunction)
// execute a callback when all images have loaded.
// needed because .load() doesn't work on cached images

// Modified with a two-pass approach to changing image
// src. First, the proxy imagedata is set, which leads
// to the first callback being triggered, which resets
// imagedata to the original src, which fires the final,
// user defined callback.

// modified by yiannis chatzikonstantinou.

// original:
// mit license. paul irish. 2010.
// webkit fix from Oren Solomianik. thx!

// callback function is passed the last image to load
//   as an argument, and the collection as `this`

$.fn.imagesLoaded = function(callback){
	var elems = this.find('img');
	var elems_src = [];
	var self = this;
	var len = elems.length;
	
	if(!len){
		callback.call(self);
		return this;
	}
	
	elems.one('load error', function(){
		if(--len == 0){
			len = elems.length;
			elems.one('load error', function(){
				if(--len == 0){
					callback.call(this);
				}
			}).each(function(){
				this.src = elems_src.pop();
			});
		}
	}).each(function(){
		elems_src.push(this.src);
		this.src = "";
	});
	
	return this;
};








