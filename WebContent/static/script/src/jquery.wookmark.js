(function (factory) {
  if (typeof define === 'function' && define.amd)
    define(['jquery'], factory);
  else
    factory(jQuery);
}(function ($) {

  var Wookmark, defaultOptions, __bind;

  __bind = function(fn, me) {
    return function() {
      return fn.apply(me, arguments);
    };
  };

  // Wookmark default options
  defaultOptions = {
    align: 'center',
    container: $('body'),
    offset: 2,
    autoResize: false,
    itemWidth: 0,
    flexibleWidth: 0,
    resizeDelay: 50,
    onLayoutChanged: undefined,
    fillEmptySpace: false
  };

  Wookmark = (function(options) {

    function Wookmark(handler, options) {
      // Instance variables.
      this.handler = handler;
      this.columns = this.containerWidth = this.resizeTimer = null;
      this.activeItemCount = 0;
      this.direction = 'left';
      this.itemHeightsDirty = true;
      this.placeholders = [];

      $.extend(true, this, defaultOptions, options);

      // Bind instance methods
      this.update = __bind(this.update, this);
      this.onResize = __bind(this.onResize, this);
      this.onRefresh = __bind(this.onRefresh, this);
      this.getItemWidth = __bind(this.getItemWidth, this);
      this.layout = __bind(this.layout, this);
      this.layoutFull = __bind(this.layoutFull, this);
      this.layoutColumns = __bind(this.layoutColumns, this);
      this.filter = __bind(this.filter, this);
      this.clear = __bind(this.clear, this);
      this.getActiveItems = __bind(this.getActiveItems, this);
      this.refreshPlaceholders = __bind(this.refreshPlaceholders, this);      
    };

    // Method the get active items which are not disabled and visible
    Wookmark.prototype.getActiveItems = function() {
      return this.handler.not('.inactive');
    };

    // Method to get the standard item width
   Wookmark.prototype.getItemWidth = function() {
      var itemWidth = this.itemWidth,
          containerWidth = this.container.width(),
          firstElement = this.handler.eq(0),
          flexibleWidth = this.flexibleWidth;

      if (this.itemWidth === undefined || this.itemWidth === 0 && !this.flexibleWidth) {
        itemWidth = firstElement.outerWidth();
      }
      else if (typeof this.itemWidth == 'string' && this.itemWidth.indexOf('%') >= 0) {
        itemWidth = parseFloat(this.itemWidth) / 100 * containerWidth;
      }

      // Calculate flexible item width if option is set
      if (flexibleWidth) {
        if (typeof flexibleWidth == 'string' && flexibleWidth.indexOf('%') >= 0) {
          flexibleWidth = parseFloat(flexibleWidth) / 100 * containerWidth
            - firstElement.outerWidth() + firstElement.innerWidth();
        }

        var columns = ~~(1 + containerWidth / (flexibleWidth + this.offset)),
            columnWidth = (containerWidth - (columns - 1) * this.offset) / columns;

        itemWidth = Math.max(itemWidth, ~~(columnWidth));

        // Stretch items to fill calculated width
        this.handler.css('width', itemWidth);
      }

      return itemWidth;
    };

    // Main layout method.
    Wookmark.prototype.layout = function() {
      // Do nothing if container isn't visible
      if (!this.container.is(":visible")) return;

      // Calculate basic layout parameters.
      var columnWidth = this.getItemWidth() + this.offset,
          containerWidth = this.container.width(),
          columns = ~~((containerWidth + this.offset) / columnWidth),
          offset = maxHeight = i = 0,
          activeItems = this.getActiveItems(),
          activeItemsLength = activeItems.length,
          $item;

      // Cache item height
      if (this.itemHeightsDirty) {
        for (; i < activeItemsLength; i++) {
          $item = activeItems.eq(i);
          $item.data('wookmark-height', $item.outerHeight());
        }
        this.itemHeightsDirty = false;
      }

      // Use less columns if there are to few items
      columns = Math.max(1, Math.min(columns, activeItemsLength));

      // Calculate the offset based on the alignment of columns to the parent container
      if (this.align == 'left' || this.align == 'right') {
        offset = ~~((columns / columnWidth + this.offset) >> 1);
      } else {
        offset = ~~(.5 + (containerWidth - (columns * columnWidth - this.offset)) >> 1);
      }

      // Get direction for positioning
      this.direction = this.align == 'right' ? 'right' : 'left';

      // If container and column count hasn't changed, we can only update the columns.
      if (this.columns != null && this.columns.length == columns && this.activeItemCount == activeItemsLength) {
        maxHeight = this.layoutColumns(columnWidth, offset);
      } else {
        maxHeight = this.layoutFull(columnWidth, columns, offset);
      }
      this.activeItemCount = activeItemsLength;

      // Set container height to height of the grid.
      this.container.css('height', maxHeight);

      // Update placeholders
      if (this.fillEmptySpace) {
        this.refreshPlaceholders(columnWidth, offset);
      }

      if (this.onLayoutChanged !== undefined && typeof this.onLayoutChanged === 'function') {
        this.onLayoutChanged();
      }
    };

    /**
     * Perform a full layout update.
     */
    Wookmark.prototype.layoutFull = function(columnWidth, columns, offset) {
      var item, top, left, i = 0, k = 0 , j = 0,
          activeItems = this.getActiveItems(),
          length = activeItems.length,
          shortest = null, shortestIndex = null,
          itemCSS = {position: 'absolute'},
          sideOffset, heights = [],
          leftAligned = this.align == 'left' ? true : false;

      this.columns = [];

      // Prepare arrays to store height of columns and items.
      while (heights.length < columns) {
        heights.push(0);
        this.columns.push([]);
      }

      // Loop over items.
      for (; i < length; i++ ) {
        $item = activeItems.eq(i);

        // Find the shortest column.
        shortest = heights[0];
        shortestIndex = 0;
        for (k = 0; k < columns; k++) {
          if (heights[k] < shortest) {
            shortest = heights[k];
            shortestIndex = k;
          }
        }

        // stick to left side if alignment is left and this is the first column
        if (shortestIndex == 0 && leftAligned) {
          sideOffset = 0;
        } else {
          sideOffset = shortestIndex * columnWidth + offset;
        }

        // Position the item.
        itemCSS[this.direction] = sideOffset;
        itemCSS.top = shortest;
        $item.css(itemCSS).data('wookmark-top', shortest);

        // Update column height and store item in shortest column
        heights[shortestIndex] += $item.data('wookmark-height') + this.offset;
        this.columns[shortestIndex].push($item);
      }

      // Return longest column
      return Math.max.apply(Math, heights);
    };
    
    return Wookmark;
  })();

  $.fn.wookmark = function(options) {
    // Create a wookmark instance if not available
    if (!this.wookmarkInstance) {
      this.wookmarkInstance = new Wookmark(this, options || {});
    } else {
      this.wookmarkInstance.update(options || {});
    }

    // Apply layout
    this.wookmarkInstance.layout();

    // Display items (if hidden) and return jQuery object to maintain chainability
    return this.show();
  };
}));
