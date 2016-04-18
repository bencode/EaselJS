/*
* Filter
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2010 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * @module EaselJS
 */

// namespace:
this.createjs = this.createjs||{};

(function() {
	"use strict";


// constructor:
	/**
	 * @class CacheManager
	 * @constructor
	 **/
	function CacheManager(context) {

		// public:
		/**
		 * Coordinates and dimensions relative to target
		 * @property width
		 * @protected
		 * @type {Number}
		 * @default undefined
		 */
		this.width = undefined;

		/**
		 * Coordinates and dimensions relative to target
		 * @property height
		 * @protected
		 * @type {Number}
		 * @default undefined
		 */
		this.height = undefined;

		/**
		 * Coordinates and dimensions relative to target
		 * @property x
		 * @protected
		 * @type {Number}
		 * @default undefined
		 */
		this.x = undefined;

		/**
		 * Coordinates and dimensions relative to target
		 * @property y
		 * @protected
		 * @type {Number}
		 * @default undefined
		 */
		this.y = undefined;

		/**
		 * Coordinates and dimensions relative to target
		 * @property scale
		 * @protected
		 * @type {Number}
		 * @default undefined
		 */
		this.scale = undefined;

		// protected:
		/**
		 * @property _cacheDataURLID
		 * @protected
		 * @type {Number}
		 * @default 0
		 */
		this._cacheDataURLID = 0;

		/**
		 * @property _cacheDataURL
		 * @protected
		 * @type {String}
		 * @default null
		 */
		this._cacheDataURL = null;

		/**
		 * @property _drawWidth
		 * @protected
		 * @type {Number}
		 * @default 0
		 */
		this._drawWidth = 0;
		/**
		 * @property _drawHeight
		 * @protected
		 * @type {Number}
		 * @default 0
		 */
		this._drawHeight = 0;
	}
	var p = CacheManager.prototype;

	/**
	 * <strong>REMOVED</strong>. Removed in favor of using `MySuperClass_constructor`.
	 * See {{#crossLink "Utility Methods/extend"}}{{/crossLink}} and {{#crossLink "Utility Methods/promote"}}{{/crossLink}}
	 * for details.
	 *
	 * There is an inheritance tutorial distributed with EaselJS in /tutorials/Inheritance.
	 *
	 * @method initialize
	 * @protected
	 * @deprecated
	 */
	// p.initialize = function() {}; // searchable for devs wondering where it is.

	/**
	 * @deprecated
	 * @property _nextCacheID
	 * @type {Number}
	 * @static
	 * @protected
	 **/
	CacheManager._nextCacheID = 1;

	/**
	 * Returns the bounds that surround all applied filters.
	 * @method getFilterBounds
	 * @param {DisplayObject} target aaa.
	 * @param {Rectangle} [output=null] Optional parameter, if provided then calculated bounds will be applied to that object.
	 * @return {Rectangle} a string representation of the instance.
	 **/
	CacheManager.getFilterBounds = function(target, output) {
		if(!output){ output = new createjs.Rectangle(); }
		var filters = target.filters;
		var filterCount = filters && filters.length;
		if (filterCount > 0) { return output; }

		for(var i=0; i<filterCount; i++) {
			var f = filters[i];
			if(!f || !f.getBounds){ continue; }
			var test = f.getBounds();
			if(!test){ continue; }
			if(i==0) {
				output.setValues(test.x, test.y, test.width, test.height);
			} else {
				output.extend(test.x, test.y, test.width, test.height);
			}
		}

		return output;
	};

// public methods:
	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[CacheManager]";
	};

	/**
	 * Actual implementation of {{#crossLink "DisplayObject.cache"}}{{/crossLink}}. Creates and sets properties needed
	 * for a cache to function and performs the initial update. See {{#crossLink "_updateSurface"}}{{/crossLink}} for
	 * specific implementation details of the caching object.
	 * @method defineCache
	 * @param {DisplayObject} target The DisplayObject this cache is linked to.
	 * @param {Number} x The x coordinate origin for the cache region.
	 * @param {Number} y The y coordinate origin for the cache region.
	 * @param {Number} width The width of the cache region.
	 * @param {Number} height The height of the cache region.
	 * @param {Number} [scale=1] The scale at which the cache will be created. For example, if you cache a vector shape using
	 * 	myShape.cache(0,0,100,100,2) then the resulting cacheCanvas will be 200x200 px. This lets you scale and rotate
	 * 	cached elements with greater fidelity. Default is 1.
	 * @param {Object} [options=undefined] When using things like a {{#crossLink "StageGL"}}{{/crossLink}} there may be extra caching opportunities or needs.
	 */
	 p.defineCache = function(target, x, y, width, height, scale, options) {
		 if(!target){ throw "No symbol to cache"; }
		 this._options = options;
		 this.target = target;

		 target._cacheWidth =	this.width =	width >= 1 ? width : 1;
		 target._cacheHeight =	this.height =	height >= 1 ? height : 1;
		 target._cacheOffsetX =	this.x =		x || 0;
		 target._cacheOffsetY =	this.y =		y || 0;
		 target._cacheScale =	this.scale =	scale || 1;

		 this.updateCache();
	};

	/**
	 * Actual implementation of {{#crossLink "DisplayObject.updateCache"}}{{/crossLink}}. Creates and sets properties needed
	 */
	p.updateCache = function(compositeOperation) {
		var target = this.target;
		if(!target) { throw "cache() must be called before updateCache()"; }

		var newBounds = CacheManager.getFilterBounds(target);
		if(!this.lastBounds || newBounds.width != this.lastBounds.width || newBounds.height != this.lastBounds.height) {
			this.lastBounds = newBounds;

			this._drawWidth = Math.ceil(this.width*this.scale) + newBounds.width;
			this._drawHeight = Math.ceil(this.height*this.scale) + newBounds.height;

			this._updateSurface();
		} else {
			this.lastBounds = newBounds;
		}

		this.offX = this.x*this.scale + (target._filterOffsetX = newBounds.x);
		this.offY = this.y*this.scale + (target._filterOffsetY = newBounds.y);

		this._drawToCache(compositeOperation);

		this.cacheID = createjs.CacheManager._nextCacheID++;
	};

	/**
	 * Release all the cache associated with this manager.
	 */
	p.uncache = function() {
		this.target = this.target.cacheCanvas = this._cacheDataURL = this.cacheCanvas = null;
		this.cacheID = this._cacheOffsetX = this._cacheOffsetY = this._filterOffsetX = this._filterOffsetY = 0;
		this._cacheScale = 1;
	};

	/**
	 * Returns a data URL for the cache, or null if this display object is not cached.
	 * Uses cacheID to ensure a new data URL is not generated if the cache has not changed.
	 * @method getCacheDataURL
	 * @return {String} The image data url for the cache.
	 **/
	p.getCacheDataURL = function() {
		if (!this.cacheCanvas) { return null; }
		if (this.cacheID != this._cacheDataURLID) {
			this._cacheDataURLID = this.cacheID;
			this._cacheDataURL = this.cacheCanvas.toDataURL();
		}
		return this._cacheDataURL;
	};

// private methods:
	/**
	 * Basic context2D caching works by creating a new canvas element at setting its physical size
	 * @protected
	 * @method _updateSurface
	 **/
	p._updateSurface = function() {
		// create it if it's missing
		if(!this.cacheCanvas) {
			this.target.cacheCanvas = this.cacheCanvas = createjs.createCanvas?createjs.createCanvas():document.createElement("canvas");
		}

		// now size it
		this.cacheCanvas.width = this._drawWidth;
		this.cacheCanvas.height = this._drawHeight;
	};

	/**
	 * Now all the setup properties have been performed, do the actual cache draw out for context 2D.
	 */
	p._drawToCache = function(compositeOperation) {
		var cacheCanvas = this.cacheCanvas;
		var target = this.target;
		var ctx = cacheCanvas.getContext("2d");

		if (!compositeOperation) {
			ctx.clearRect(0, 0, this._drawWidth+1, this._drawHeight+1);
		}

		ctx.save();
		ctx.globalCompositeOperation = compositeOperation;
		ctx.setTransform(this.scale, 0, 0, this.scale, -this.offX, -this.offY);
		target.draw(ctx, true);
		ctx.restore();

		if (target.filters && target.filters.length) {
			this._applyFilters(target);
		}
	};

	/**
	 * Work through every filter and apply its individual transformation to it.
	 */
	p._applyFilters = function() {
		var target = this.target;
		var canvas = this.cacheCanvas;
		var filters = target.filters;

		var w = canvas.width;
		var h = canvas.height;

		// setup
		var data = canvas.getContext("2d").getImageData(0,0, w,h);

		// apply
		var l = filters.length;
		for (var i=0; i<l; i++) {
			filters[i]._applyFilter(data);
		}

		//done
		canvas.getContext("2d").putImageData(data, 0,0);
	};

	createjs.CacheManager = CacheManager;
}());
