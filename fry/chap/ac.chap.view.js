/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Chap - Text Editing Component - Views
 *
 * (c)2006-2007 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

if ( 'undefined' == typeof ac )
{
	var ac = {chap:{}};
}


$class('ac.chap.View',
{
	construct:function(window, index, options)
	{
		this.window = window;
		this.index = index;

		this.nodeScrollArea = null;
		this.nodeFillArea = null;
		this.nodeEditArea = null;
		this.nodeEditAreaCache = null;
		this.nodeCaret = null;
		this.nodeCaretRow = null;
		
		this.renderingRunning = false;
		
		this.numRows = 0;
		this.numCols = 0;
		this.wrapWidth = 0;
		this.wrapHeight = 0;

		this.startRow = 0;
		this.startCol = 0;
		
		this.startRowOffset = 0;
		this.numVisibleRows = 0;
		
		this.state = {lastCaretPosition:[-1,-1], lastCaretRenderedPosition:null};
		
		this.theme = null;
		
		this.setOptions(options);
	},
	destruct:function()
	{
		clearInterval(this.caretAnimInterval);
		$delete(this.options);
		$delete(this.theme);
	}
});

ac.chap.View.prototype.setOptions = function(options)
{
	this.options = 
	{
		tabelator:'  ',
		wordWrap:false,
		colWidth:0,
		rowHeight:0,
		caretThreadTimeout:450
	}
	if ( $isset(options.wordWrap) )
	{
		this.options.wordWrap = options.wordWrap;
	}
	if ( $isset(options.tabelator) )
	{
		this.options.tabelator = options.tabelator;
	}
	// getting column width and height
	this.calculateColRowDim();
	if ($isset(options.theme))
	{
		this.theme = $new(options.theme);
	}
	else
	{
		this.theme = $new(ac.chap.Theme);
	}
}

ac.chap.View.prototype.calculateColRowDim = function()
{
	var font_size = this.window.options.font.size;
	var node = $().a($$('span')).s('font:?px ?'.embed(font_size, this.window.options.font.family)).t('a');
	this.options.colWidth = node.$.offsetWidth;
	node.rs();
	this.options.rowHeight = font_size + Math.ceil(font_size/10);
	var row_node = document.createElement('pre');
	row_node.style.minHeight = this.options.rowHeight+'px';
	row_node.style.font = this.window.options.font.size + 'px ' + this.window.options.font.family;
	row_node.style.lineHeight = this.options.rowHeight + 'px';
	row_node.style.margin = 0;
	row_node.style.padding = 0;
	row_node.style.border = 0;
	this.options.rowTemplate = row_node;
}

ac.chap.View.prototype.setTheme = function(theme)
{
	this.theme = $new(theme);
	this.nodeRoot.s('background:?'.embed(this.theme.background));
	this.nodeScrollArea.fc().s('background:?'.embed(this.theme.background));
	$(this.nodeEditArea).s('color:?'.embed(this.theme.textColor));
	this.renderText(true);
}

ac.chap.View.prototype.getSyntaxHighlightingSource = function()
{
	function get_inner(node)
	{
		var ht = '';
		var child_nodes = node.childNodes;
		for (var i=0; i<child_nodes.length; i++)
		{
			var inner_node = child_nodes.item(i);
			if (3 == inner_node.nodeType)
			{
				ht += inner_node.data;
			}
			else if(1 == inner_node.nodeType)
			{
				ht += '<span style="color:?;background:?;font-style:?;font-weight:?;text-decoration:?;">'.embed(inner_node.style.color, inner_node.style.background, inner_node.style.fontStyle, inner_node.style.fontWeight, inner_node.style.textDecoration) + get_inner(inner_node) + '</span>';
			}
		}
		return ht;
	}
	var nodes = this.nodeEditArea.childNodes;
	var ht = '';
	for (var i=0; i<nodes.length; i++)
	{
		var pre = nodes.item(i);
		if (1 != pre.nodeType && 'pre' != node.tagName.toLowerCase())
		{
			continue;
		}
		ht += '<pre style="min-height=?">?</pre>'.embed(pre.style.minHeight, get_inner(pre));
	}
	return ht;
}

function ch_encode_markup(str)
{
    if ( -1 != str.indexOf('&') )
    {
        str = str.replace(/&/g, '&amp;');
    }
    if ( -1 != str.indexOf('>') )
    {
        str = str.replace(/>/g, '&gt;');
    }
    if ( -1 != str.indexOf('<') )
    {
        str = str.replace( /</g, '&lt;' );
    }
    /*
    if ( -1 != str.indexOf(' ') )
    {
       str = str.replace(/ /g, '&nbsp;');
    }
    */
    return str;
}

// replaces all spaces EXCEPT for those existing in inside tag definitions to &nbsp; Eg. <a href="dsds"> 1 2 3</a> = <a href="dsds">&nbsp;1&nbsp;2&nbsp;3</a>
function ch_encode_markup_spaces(str)
{
	var n = str.length - str.replace(/ /g, '').length;
	for ( var i=0; i<n; i++ )
	{
		str = str.replace(/([^ ]*) /i, function()
		{
			var is_inside = -1 != arguments[1].indexOf('<');
			is_inside = is_inside && (arguments[1].replace(/</g, '').length != arguments[1].replace(/>/g, '').length);
			return arguments[1]+(is_inside?'~`~`~`~`':'&nbsp;');
		});		
	}
	return str.replace(/~`~`~`~`/g, ' ');
}


ac.chap.View.prototype.getRenderedCharDimension = function(rowIndex, colIndex)
{
	return [this.options.colWidth, this.options.rowHeight];
}

ac.chap.View.prototype.getRenderedStringDimension = function(rowIndex, colIndex, width)
{
	if ( 'undefined' != typeof this.window.char_map[rowIndex] )
	{
		if ( colIndex < this.window.char_map[rowIndex].length )
		{
			var str = this.window.char_map[rowIndex].substr(colIndex, width);
			var ix = 0;
			var tab = this.options.tabelator;
			while ( -1 != ix )
			{
				ix = str.indexOf('\t');
				if ( -1 != ix )
				{
					str = str.substr(0,ix)+tab.substr(0, tab.length-(ix % tab.length))+str.substr(ix+1);
				}
			}
//			console.log('(getrenderedstringdimension) = [%s], ix:%s w:%s %s', this.options.colWidth*str.length, colIndex, width, str);
			return [this.options.colWidth*str.length, this.options.rowHeight];
		}
	}
	return [0,0];
}

ac.chap.View.prototype.getVirtualStringDimension = function(row, colIndex, width)
{
	if ( colIndex < row.length )
	{
		var str = row.substr(colIndex, width);
		var ix = 0;
		var tab = this.options.tabelator;
		while ( -1 != ix )
		{
			ix = str.indexOf('\t');
			if ( -1 != ix )
			{
				str = str.substr(0,ix)+tab.substr(0, tab.length-(ix % tab.length))+str.substr(ix+1);
			}
		}
//		console.log('(getrenderedstringdimension) = [%s], ix:%s w:%s %s', this.options.colWidth*str.length, colIndex, width, str);
		return [this.options.colWidth*str.length, this.options.rowHeight];
	}
	return [0,0];
}

ac.chap.View.prototype.getRenderedCharPosition = function(rowIndex, colIndex)
{
	var node_row = this.getRowNode(rowIndex);
	if ( null != node_row && null != node_row.parentNode )
	{
		var offset_x = this.getRenderedStringDimension(rowIndex, 0, colIndex)[0];
		var offset_y = 0;
		var dim = this.getRenderedCharDimension(rowIndex, colIndex);
		offset_x -= dim[0];
		if ( this.options.wordWrap )
		{
			if ( 0 < colIndex )
			{
				var w = this.options.colWidth * (this.numCols);
				offset_y = this.options.rowHeight * (Math.floor(offset_x/w));
				offset_x = (offset_x) % w;
			}
		}
		return [offset_x, node_row.offsetTop+offset_y, node_row];
	}
	return null;
}

ac.chap.View.prototype.getRowNode = function(rowIndex)
{
	return document.getElementById('row-'+this.window.instanceId+'-'+this.index+'-'+rowIndex);
}

ac.chap.View.prototype.getVirtualCharPosition = function(nodeRow, row, colIndex)
{
	var offset_x = this.getVirtualStringDimension(row, 0, colIndex)[0];
	var offset_y = 0;
	var dim = this.getRenderedCharDimension(0, colIndex);
	offset_x -= dim[0];
	if ( this.options.wordWrap )
	{
		if ( 0 < colIndex )
		{
			var w = this.options.colWidth * (this.numCols);
			offset_y = this.options.rowHeight * (Math.floor(offset_x/w));
			offset_x = (offset_x) % w;
		}
	}
	return [offset_x, nodeRow.offsetTop+offset_y];
}

ac.chap.View.prototype.showCaret = function(skipScroll)
{
	var caret_row = this.window.caret.position[0];
	var caret_col = this.window.caret.position[1];
	
	pos = this.getRenderedCharPosition(caret_row, caret_col);
	if ( null != pos )
	{
		// caret is visible
		var node_row = pos[2];
		var node = document.getElementById('ac-chap-caret-'+this.window.instanceId);
		if ( null != node )
		{
			node.parentNode.removeChild(node);
		}
		if ( 1 == this.window.state.caretPhase )
		{
			// displaying caret
			node = document.createElement('div');
			node.id = 'ac-chap-caret-'+this.window.instanceId;
			node.style.position = 'absolute';
			node.style.font = '1px arial'; // IE
			node.style.width = this.options.colWidth + 'px';
			node.style.height = this.options.rowHeight + 'px';
			pos[2] = this.options.colWidth;
			pos[3] = this.options.rowHeight;
			pos = this.theme.adjustCaretPosition(this.window.caret.mode, pos);
			node.style.left = pos[0]+'px';
			node.style.top = pos[1]+'px';
			this.theme.renderCaret(this.window.caret.mode, node);
			this.nodeCaret = node_row.appendChild(node);
			node_row.style.background = this.theme.caretRowStyleActive;
			
			if ( !skipScroll )
			{
				// might be out of borders, at least partially
				if ( 0 > node_row.offsetTop - (this.nodeScrollArea.$.scrollTop % this.options.rowHeight) )
				{
					// top margin overlay, first rendered row is partially hidden
					this.scrollToRow(caret_row);
				}
				else if ( node_row.offsetTop > this.options.rowHeight*(this.numRows-1)-$__tune.ui.scrollbarWidth )
				{
					// bottom margin overlay
					this.scrollToRow(caret_row-Math.floor(this.numRows/2));
				}
			}
			this.nodeCaretRow = node_row;
		}
		if ('undefined' != typeof this.state.lastCaretRowIndex && this.state.lastCaretRowIndex != caret_row)
		{
			var last_node_row = this.getRowNode(this.state.lastCaretRowIndex);
			if (last_node_row)
			{
				last_node_row.style.background = 'transparent';
			}
		}
		this.state.lastCaretRowIndex = caret_row;
	}
	else
	{
		if ( !skipScroll )
		{
			// scrolling into view
			this.scrollToRow(caret_row - Math.floor(this.numRows/2));			
		}
	}
}

ac.chap.View.prototype.hideCaret = function(skipCaretRow)
{
	if ( null != this.nodeCaret && null != this.nodeCaret.parentNode )
	{
		this.nodeCaret.parentNode.removeChild(this.nodeCaret);
		this.nodeCaret = null;
	}
	if ( !skipCaretRow && null != this.nodeCaretRow )
	{
//		console.log('off(hide) caret line background for %s', this.nodeCaretRow.id);
		this.nodeCaretRow.style.background = 'transparent';
	}
//	console.log('hide caret');
}

ac.chap.View.prototype.scrollToRow = function(rowIndex, setCaretToo, dontRefreshCaret)
{
	this.nodeScrollArea.$.scrollTop = this.options.rowHeight * rowIndex - Math.floor(this.nodeRoot.$.offsetHeight/3);
	if (setCaretToo)
	{
		this.window.runAction(ac.chap.ACTION_CARET, {moveTo:[rowIndex, 0]});
		this.window.runAction(ac.chap.ACTION_CARET, {move:'row_end'});
	}
	if (!dontRefreshCaret)
	{
		this.window.state.caretPhase = 1;
		this.showCaret(true);
	}
}

ac.chap.View.prototype.expandFolding = function(rowIndex)
{
	if ( 'undefined' == typeof this.window.row_id_map[this.index][rowIndex] )
	{
		return;
	}
	var row_state = this.window.row_id_map[this.index][rowIndex][2];
	if (0 == (ac.chap.ROWSTATE_FOLD_EXPAND & row_state))
	{
		return;
	}
	var end_row_index = this.window.row_id_map[this.index][rowIndex][3][1];
	this.window.row_id_map[this.index][rowIndex][2] &= (65535 - ac.chap.ROWSTATE_FOLD_EXPAND);
	this.window.row_id_map[this.index][rowIndex][1] = false;
	for ( var i=rowIndex+1; i<=end_row_index; i++ )
	{
		this.window.row_id_map[this.index][i][1] = false;
		this.window.row_id_map[this.index][i][2] &= (65535 - ac.chap.ROWSTATE_FOLD_COLLAPSED);
	}
	this.recalculateVisibleRows();
	var me = this;
	// console.log('expanding: %i, start: %i', rowIndex, end_row_index);
	$runafter(40, function(){me.renderText(true)});
}

ac.chap.View.prototype.resize = function()
{
	var h = this.nodeRoot.p().h();
	this.nodeRoot.h(h);
	$(this.nodeSidebar).h(h);
	this.nodeScrollArea.h(h);
	this.nodeFillArea.h(h-$__tune.ui.scrollbarWidth);
	$(this.nodeSelectionArea).h(h-$__tune.ui.scrollbarWidth+this.options.rowHeight);
	this.recalculateNumRows();
	this.recalculateVisibleRows();
	this.renderText(true);
}

ac.chap.View.prototype.reloadOptions = function()
{
	this.calculateColRowDim();
	this.recalculateNumCols(false, true);
	this.recalculateNumRows();
	this.recalculateVisibleRows();
	this.renderSidebarStub();
	this.renderText(true);	
}

ac.chap.View.prototype.recalculateNumCols = function(node, withoutScrollbar)
{
	node = node || this.nodeRoot;
	var w = node.$.offsetWidth;
	if (withoutScrollbar)
	{
		w -= $__tune.ui.scrollbarWidth+61;
	}
	this.numCols = Math.floor(w/this.options.colWidth);
}

ac.chap.View.prototype.recalculateNumRows = function(node)
{
	node = node || this.nodeRoot;
	this.numRows = Math.floor(node.$.offsetHeight/this.options.rowHeight);
}

ac.chap.View.prototype.showInteractiveSearch = function()
{
	this.hideInteractiveSearch();
	var pos = this.nodeRoot.abspos();
	var node = $().a($$()).pos(true).x(pos.x+58).y(pos.y).z(2000).w(this.nodeRoot.w()-$__tune.ui.scrollbarWidth-61).h(24).o(0.8);
	node.s('background:#000;border:1px solid #777;border-top:0;');
	var search_key_id = 'is_key_?'.embed(this.window.ident);
	var ht = '<table align="right" class="search-interactive" cellpadding="0" cellspacing="0" style="height:24px"><tbody><tr><td width="96%" align="right" valign="middle" style="padding-right:20px;color:#fff;font-size:11px"></td><td valign="middle" width="2%"><input type="text" onfocus="fry.keyboard.stop()" onblur="fry.keyboard.start()" id="' + search_key_id + '" style="height:12px;line-height:12px;padding:1px;padding-left:3px;border:1px solid #777"/></td><td valign="middle" class="close"><img src="/mm/i/theme/apple/tabpane.button.close_invert.gif" width="14" height="14" title="Close" style="margin-left:4px;margin-right:4px"/></td></tr></tbody></table>';
	node.t(ht);
	var me = this;
	var status_node = node.g('td:0');
	var search_key_node = node.g('input:0');
	var original_caret_pos = [me.window.caret.position[0], me.window.caret.position[1]];
	var last_keyword = '';
	var selection = me.window.getSelection();
	search_key_node.e('keydown', function(evt)
	{
		evt.stopPropagation();
		if (40 == evt.keyCode)
		{
			me.window.runAction(ac.chap.ACTION_CUSTOM, {action:'SearchKeyword', direction:'down'});
			me.scrollToRow(me.window.caret.position[0], false, true);
			me.window.processActionResult(true, true);
			evt.preventDefault();
			return true;
		}
		else if (38 == evt.keyCode)
		{
			me.window.runAction(ac.chap.ACTION_CUSTOM, {action:'SearchKeyword', direction:'up'});
			me.scrollToRow(me.window.caret.position[0], false, true);
			me.window.processActionResult(true, true);
			evt.preventDefault();
			return true;
		}
		else if (27 == evt.keyCode)
		{
			finish(true);
			evt.preventDefault();
			return true;
		}
		else if (13 == evt.keyCode)
		{
			finish();
			evt.preventDefault();
			return true;
		}
	}).e('keyup', function(evt)
	{
		evt.stopPropagation();
		search();
		
	}).$.focus();
	node.g('img:0').e('click', function(evt)
	{
		evt.stopPropagation();
		finish(true);
	});
	
	function finish(canceled)
	{
		if (canceled)
		{
			me.window.removeSelection();
			me.window.runAction(ac.chap.ACTION_CARET, {moveTo:[original_caret_pos[0], original_caret_pos[1]]});
			me.scrollToRow(me.window.caret.position[0], false, true);
			me.window.processActionResult(true, true);
		}
		ac.chap.setActiveComponent(me.window);
		me.hideInteractiveSearch();
	}
	
	function update_status(numFound)
	{
		status_node.t('Found <strong>?</strong> results.'.embed(numFound));
	}
	
	function search()
	{
		var keyword = search_key_node.$.value.trim();
		if ('' == keyword || last_keyword == keyword)
		{
			if ('' == keyword)
			{
				update_status(0);
			}
			return;
		}
		update_status(me.window.getText().split(keyword).length - 1);
		last_keyword = keyword;
		me.window.removeSelection();
		me.window.runAction(ac.chap.ACTION_CARET, {moveTo:[original_caret_pos[0], original_caret_pos[1]]});
		me.window.runAction(ac.chap.ACTION_CUSTOM, {action:'SetSearchKeyword', keyword:keyword});
		me.window.runAction(ac.chap.ACTION_CUSTOM, {action:'SearchKeyword', direction:'down'});
		me.scrollToRow(me.window.caret.position[0], false, true);
		me.window.processActionResult(true, true);
	}	
	
	if (null != selection)
	{
		search_key_node.$.value = selection;
		search_key_node.$.select();
		search_key_node.$.focus();
		search();
	}

	
	
	this.interactiveSearchNode = node;
}

ac.chap.View.prototype.hideInteractiveSearch = function()
{
	if (this.interactiveSearchNode && this.interactiveSearchNode.is())
	{
		this.interactiveSearchNode.rs();
	}
}

ac.chap.View.prototype.render = function(node)
{
	var w = node.$.offsetWidth;
	var h = node.$.offsetHeight;
	this.recalculateNumRows(node);
	this.recalculateNumCols(node);
	node.sa('chap-view', 'true');
	var me = this;
	this.nodeRoot = node.a($$()).pos(true).w(w).h(h).n('acw-chap').s('background:?'.embed(this.theme.background));
	this.interactiveSearchNode = null;
	
	var w_rows = 58;
	w -= w_rows;
	this.nodeSidebar = this.nodeRoot.a($$()).pos(true).x(0).y(0).w(w_rows).h(h).s('overflow:hidden').n('sidebar');

	// rendering sidebar stub
	this.renderSidebarStub();


	this.nodeScrollArea = this.nodeRoot.a($$()).pos(true).x(w_rows).y(0).w(w).h(h).n('scroll-area').s('overflow:auto');
	this.nodeScrollArea.e('scroll', function(evt)
	{
		var offset = Math.floor(me.nodeScrollArea.$.scrollTop/me.options.rowHeight);
		var map = me.window.row_id_map[me.index];
		var row_index = 0;
		for ( var i=0; i<map.length; i++ )
		{
			if ( row_index == offset )
			{
				row_index = i;
				break;
			}
//			if ( ac.chap.ROWSTATE_FOLD_EXPAND == (ac.chap.ROWSTATE_FOLD_EXPAND & map[i][2]) )
			if ( ac.chap.ROWSTATE_FOLD_EXPAND == (ac.chap.ROWSTATE_FOLD_EXPAND & map[i][2]) )
			{
				i = map[i][3][3];
			}
			row_index++;
		}
//		console.log('OFFSET %s  ROWINDEX %s', offset, row_index);
		me.startRow = row_index;
		me.startRowOffset = offset;
		if ( me == me.window.activeView )
		{
			me.hideCaret();
		}
		me.renderText();
		if ( me == me.window.activeView && me.startRow < me.window.caret.position[0] )
		{
			if ( null == me.window.selection )
			{
				me.showCaret(true);					
			}
		}
	});

	h -= $__tune.ui.scrollbarWidth;
	w -= $__tune.ui.scrollbarWidth+3;

	this.wrapWidth = w;
	this.wrapHeight = h;
	this.numCols = Math.floor(w/this.options.colWidth);

	this.nodeFillArea = this.nodeScrollArea.a($$()).pos(true).x(3).y(0).h(h).w((this.options.wordWrap?w:2000)-3).n('fill-area').s('overflow:hidden;background:?'.embed(this.theme.background));

	this.editAreaWidth = w;
	this.editAreaHeight = h;

	this.nodeSelectionArea = this.nodeFillArea.a($$()).pos(true).x(0).w(this.nodeFillArea.w()).y(0).h(h+this.options.rowHeight).n('selection-area').s('overflow:hidden').$;

	this.nodeEditArea = this.nodeFillArea.a($$()).pos(true).x(0).y(0).h(h+this.options.rowHeight).n('edit-area').s('overflow:hidden; color:?'.embed(this.theme.textColor)).e('click', function(evt)
	{
		me.window.captureEditAreaClick(evt, me);
	}).$;

	this.nodeEditAreaCache = node.a($$()).pos(true).x(-700).y(-1700).w(300).h(500).v(false).s('overflow:hidden').$;
}

ac.chap.View.prototype.renderSidebarStub = function()
{
	var node = this.nodeRoot;
	var h = node.$.offsetHeight;
	var w_rows = 58;
	
	this.nodeSidebar = $(this.nodeSidebar).rc();
	var node_sidebar_scroll = this.nodeSidebar.a($$()).pos(true).w(w_rows).h(h).x(0).y(0).s('overflow:hidden');
	var bar_offset = 0;
	var bookmark_off_y = Math.max(1, Math.floor(this.options.rowHeight - 11)/2);
	var me = this;
	for ( var i=0; i<=this.numRows; i++ )
	{
//		var bar_node = node_sidebar_scroll.a($$()).pos(true).x(10).y(bar_offset).w(30).s("font-family:'Lucida Grande', Tahoma, Arial, helvetica, sans-serif; font-size:9px; text-align:right; padding-top:1px; color:#777");
		var bar_node = node_sidebar_scroll.a($$()).w(w_rows).h(this.options.rowHeight).a($$()).pos(true).x(10).w(30).s('text-align:right;font-size:?px;color:#999;'.embed(this.window.options.font.size-2));
		bar_node.a($$('span')).s('font-size:?px;padding-top:1px'.embed(this.window.options.font.size-2));
		bar_node.a($$()).pos(true).x(-8).y(bookmark_off_y).w(11).h(11).n('void').e('click', function(evt)
		{
			evt.stop();
			var row_index = parseInt(evt.$.p().ga('row-index'));
			me.window.toggleBookmark(row_index);
			// for ( var i=0; i<me.window.views.length; i++ )
			// {
			// 	if ( 'undefined' == typeof me.window.row_id_map[i][row_index] )
			// 	{
			// 		return;
			// 	}
			// 	// marking as changed
			// 	me.window.row_id_map[i][row_index][1] = false;
			// 	var row_state = me.window.row_id_map[i][row_index][2];
			// 	if ( ac.chap.ROWSTATE_BOOKMARK == (row_state & ac.chap.ROWSTATE_BOOKMARK) )
			// 	{
			// 		// already bookmarked
			// 		me.window.row_id_map[i][row_index][2] &= (65535-ac.chap.ROWSTATE_BOOKMARK);
			// 	}
			// 	else
			// 	{
			// 		me.window.row_id_map[i][row_index][2] |= ac.chap.ROWSTATE_BOOKMARK;
			// 	}
			// }
			$runafter(100, function(){me.window.renderText()});
		});
		bar_node.a($$()).pos(true).x(34).y(bookmark_off_y-1).w(12).h(11).n('void').e('click', function(evt)
		{
			evt.stop();
			var row_index = parseInt(evt.$.p().ga('row-index'));
			for ( var i=0; i<me.window.views.length; i++ )
			{
				if ( 'undefined' == typeof me.window.row_id_map[i][row_index] )
				{
					return;
				}
//				me.window.row_id_map[i][row_index][1] = false;
				var row_state = me.window.row_id_map[i][row_index][2];
				if ( ac.chap.ROWSTATE_FOLD_EXPAND == (row_state & ac.chap.ROWSTATE_FOLD_EXPAND) )
				{
					// was collapsed, will expand
					me.window.views[i].expandFolding(row_index);
				}
				else
				{
					if ( ac.chap.ROWSTATE_FOLD_STOP == (row_state & ac.chap.ROWSTATE_FOLD_STOP) )
					{
						// end marker, getting referenced index
						row_index = me.window.row_id_map[i][row_index][3][1];
					}
					var end_row_index = me.window.row_id_map[i][row_index][3][1];
					me.window.row_id_map[i][row_index][2] |= ac.chap.ROWSTATE_FOLD_EXPAND;
					for ( var ii=row_index; ii<=end_row_index; ii++ )
					{
						me.window.row_id_map[i][ii][1] = false;
						if ( ii != row_index ) //&& ii != end_row_index )
						{
							if ( 0 == ( me.window.row_id_map[i][ii][2] & ac.chap.ROWSTATE_FOLD_COLLAPSED ) )
							{
								me.window.row_id_map[i][ii][2] |= ac.chap.ROWSTATE_FOLD_COLLAPSED;
							}
						}
					}
					me.window.views[i].recalculateVisibleRows();
//					me.window.views[i].numVisibleRows -= (end_row_index-row_index);
//					alert(me.numVisibleRows);
				}
			}
			$runafter(100, function(){me.window.renderText(true)});
		});
		bar_offset += this.options.rowHeight;
	}
	this.nodeSidebar = this.nodeSidebar.$;
}

ac.chap.View.prototype.renderChunk = function(chunk)
{
	var tokens = [];
	var n = this.window.language.chunkRules.length;
	if ( this.window.options.syntaxHighlightingEnabled )
	{
		for ( var i=0; i<n; i++ )
		{
			var m = true;
			var r_offset = 0;
			var r_chunk = chunk;
			var re = this.window.language.chunkRules[i][0];
			var result_index = this.window.language.chunkRules[i][1];
			var token_type = this.window.language.chunkRules[i][2];
			var infinite_check = 200;
			while ( '' != r_chunk && null != m )
			{
				if ( 0 == infinite_check-- )
				{
					console.warn('Error in RegExp definition (chunk): %s for: %s.', re, r_chunk);
					break;
				}
				// console.log(r_chunk);
				m = re.exec(r_chunk);
				if ( null != m)
				{
					if (!m[result_index])
					{
						console.warn('Error in RegExp definition (invalid result index: %i): %s for: %s', result_index, re, r_chunk);
						continue;
					}
					var index = m.index + m[0].indexOf(m[result_index]);
					tokens[r_offset + index] = [token_type, m[result_index]];
					r_offset += index + m[result_index].length;
					r_chunk = r_chunk.substr(index+m[result_index].length);
					// console.log('%o, index:%s, len:%s, %s', m, index, m[result_index].length, m[result_index]);
				}
			}
		}
	}
	//console.log(tokens);
	n = tokens.length;
	var font_style = ';font:' + this.window.options.font.size + 'px ' + this.window.options.font.family;
	if ( 0 < n )
	{
		var rend_chunk = '';
		var offset = 0;
		for ( i=0; i<n; i++ )
		{
			if ( 'undefined' == typeof tokens[i] || '' == tokens[i][1] )
			{
				continue;
			}
			var token = tokens[i];
			rend_chunk += ch_encode_markup(chunk.substr(offset, i-offset));
			if ( this.theme.colorScheme[token[0]] )
			{
				rend_chunk += '<span style="' + this.theme.colorScheme[token[0]] + font_style + '">' + ch_encode_markup(token[1]) + '</span>';				
			}
			else
			{
				rend_chunk += ch_encode_markup(token[1]);
			}
			i += token[1].length - 1;
			// offset = i + token[1].length;
			offset = i + 1;
			// console.log(token, offset, rend_chunk);
		}
		rend_chunk += ch_encode_markup(chunk.substr(offset));
		chunk = rend_chunk;
	}
	else
	{
		chunk = ch_encode_markup(chunk);
	}
	return chunk;
}

ac.chap.View.prototype.renderTextRow = function(node, rowIndex, renderedPreviously)
{
	var row = this.window.char_map[rowIndex];
	var rendered_row = '';
	var offset = 0;
	var font_style = ';font:' + this.window.options.font.size + 'px ' + this.window.options.font.family;
	var interpolation = this.window.language.stringInterpolation;

	var row_state = this.window.row_id_map[this.index][rowIndex][2];

	if ( 'undefined' != typeof this.window.syntax_map[rowIndex] && 0 < this.window.syntax_map[rowIndex].length )
	{
		// console.log(this.window.syntax_map[rowIndex]);
		var n = this.window.syntax_map[rowIndex].length;
		for ( var i=0; i<n; i++ )
		{
			var row_syntax = this.window.syntax_map[rowIndex][i];
			var token_type = row_syntax[0];
			var start_offset = row_syntax[1];
			if ( -1 == start_offset )
			{
				start_offset = 0;
			}
			var end_offset = row_syntax[2]

			rendered_row += this.renderChunk(row.substr(offset, start_offset-offset));
			var chunk = -1 == end_offset ? row.substr(start_offset) : row.substr(start_offset, end_offset-start_offset);
			if ( this.theme.colorScheme[token_type] )
			{
				if (interpolation && ac.chap.TOKEN_DOUBLE_QUOTED == token_type )
				{
					// console.log('interpolate: %s', chunk);
					var re = new RegExp(interpolation[0], 'i');
					var m = null;
					var new_chunk = '';
					while (true)
					{
						// console.info('passing: %s', chunk);
						m = re.exec(chunk);
						if (!m)
						{
							// console.log('nada');
							break;
						}
						// for (var i in m)
						// {
						// 	console.debug(i + ':' + m[i]);
						// }
						new_chunk += '<span style="' + this.theme.colorScheme[token_type] + font_style + '">' + ch_encode_markup(chunk.substring(0, m.index)) + '</span>';
						new_chunk += this.renderChunk(chunk.substr(m.index, m[interpolation[1]].length));
						chunk = chunk.substr(m.index + m[interpolation[1]].length);
						// console.warn(chunk);
					}
					new_chunk += '<span style="' + this.theme.colorScheme[token_type] + font_style + '">' + ch_encode_markup(chunk) + '</span>';
					// console.info(new_chunk);
					rendered_row += new_chunk;
				}
				else
				{
					rendered_row += '<span style="' + this.theme.colorScheme[token_type] + font_style + '">'+ch_encode_markup(chunk)+'</span>';					
					// console.log(rendered_row);
				}
			}
			else
			{
				rendered_row += ch_encode_markup(chunk);
			}
			offset = -1 == end_offset ? row.length : end_offset;
		}		
	}
	rendered_row += this.renderChunk(row.substr(offset));
	// console.log(rendered_row);
	// rendering custom selection (search results, errors and such)
	// !!!!!!!!!!
	// NOT USED NOW !!!!!
	// !!!!!!!!!!
	// !!!!!!!!!!
	// !!!!!!!!!!
	// !!!!!!!!!!
	if ( false && ac.chap.ROWSTATE_SELECTION == (row_state & ac.chap.ROWSTATE_SELECTION) )
	{
		var range = this.window.row_id_map[this.index][rowIndex][5];
		if ( 0 == range[0] && this.window.char_map[rowIndex].length == range[1] )
		{
			rendered_row = '<span style="width:auto;display:block;'+(''==rendered_row ? ('height:'+this.options.rowHeight+'px;'):'')+this.theme.selectionStyle+'">'+rendered_row+'</span>';
		}
		else
		{
	//		console.log(range);
			var raw = rendered_row;
			var n = raw.length;
			var col_index = 0;
			var selection_started = false;
			var offset = 0;
		//	console.log('before: %s', raw);
			for ( var i=0; i<n; i++ )
			{
				//console.log('step %s: %s', i, rendered_row);
				var ch = raw.charAt(i);
				if ( '<' == ch )
				{
					if ( selection_started )
					{
						var c = '</span>';
						rendered_row = rendered_row.substr(0, i+offset)+c+rendered_row.substr(i+offset);
						offset += c.length;
					}
					var ix = raw.substr(i).indexOf('>');
					i += ix;
		//			console.log('ix: %s', ix);

					if ( selection_started )
					{
						var c = '<span style="'+this.theme.selectionStyle+'">';
						rendered_row = rendered_row.substr(0, i+offset+1)+c+rendered_row.substr(i+offset+1);
						offset += c.length;
					}
					continue;
				}
				if ( range[0] == col_index )
				{
					selection_started = true;
					var c = '<span style="'+this.theme.selectionStyle+'">';
					rendered_row = rendered_row.substr(0, i+offset)+c+rendered_row.substr(i+offset);
					offset += c.length;
				}
				if ( selection_started && range[1]-1 < col_index )
				{
					selection_started = false;
					var c = '</span>';
					rendered_row = rendered_row.substr(0, i+offset)+c+rendered_row.substr(i+offset);
					break;
				}
				if ( '&' == ch )
				{
					if ( '&lt;' == raw.substr(i, 4) || '&gt;' == raw.substr(i, 4) )
					{
						i += 3;
					}
					else if ( '&amp;' == raw.substr(i, 5) )
					{
						i += 4;
					}
				}
				col_index++;
			}
			if ( selection_started )
			{
				rendered_row += '</span>';
			}
		}
	}
//	console.log(rendered_row);
	// making intelligent tabelators - note, using simple replace of \t doesn't work
	var ix = 0;
	var tab = this.options.tabelator;
	var raw = this.window.char_map[rowIndex];
	var tab_stack = [];
	while ( -1 != ix )
	{
		ix = raw.indexOf('\t');
		if ( -1 != ix )
		{
			var tab_length = tab.length - (ix % tab.length);
			raw = raw.substr(0,ix)+tab.substr(0, tab_length)+raw.substr(ix+1);
			tab_stack.push(tab_length);
		}
	}
	for ( var i=0; i<tab_stack.length; i++ )
	{
		rendered_row = rendered_row.replace(/\t/, tab.substr(0, tab_stack[i]));
	}
	// word wrap
	var num_subrows = 1;
	if ( this.options.wordWrap && this.numCols < raw.length )
	{
		var raw = rendered_row;

		var printable = '';
		var n = rendered_row.length;
		var offset = 1;
		for ( i=0; i<n; i++ )
		{
			var ch = rendered_row.charAt(i);
			if ( '<' == ch && 'b' != rendered_row.charAt(i+1) )
			{
				ix = rendered_row.substr(i).indexOf('>');
				if ( -1 == ix )
				{
					break;
				}
				i += ix;
				continue;
			}
			var n_ch = 0;
			if ( '&' == ch )
			{
				if ( '&lt;' == rendered_row.substr(i,4) || '&gt;' == rendered_row.substr(i,4) )
				{
					n_ch = 3;
				}
				else if ( '&amp;' == rendered_row.substr(i,5) )
				{
					n_ch = 4;
				}
			}
			printable += ch.charAt(0);
			if ( this.numCols == printable.length )
			{
				raw = raw.substr(0, i+offset+n_ch)+'<br>'+raw.substr(i+offset+n_ch);
				num_subrows++;
				offset += 4;
				printable = '';
			}
			i += n_ch;
		}
		rendered_row = raw;
	}
	if ( ac.chap.ROWSTATE_FOLD_EXPAND == (row_state & ac.chap.ROWSTATE_FOLD_EXPAND) )
	{
		var end_index = this.window.row_id_map[this.index][rowIndex][3][1];
		var content = ch_encode_markup(this.window.char_map.slice(rowIndex, end_index+1).join('\n').replace(/"/ig, "''"));
		rendered_row += '<a href="javascript:ac.chap.route(\'expand-folding\', \'window-id\', '+this.index+', '+rowIndex+')"><div class="folding-expand-inner" style="position:absolute" title="?"></div></a>'.embed(content);
	}
	node.setAttribute('num-subrows', num_subrows);
	
	if ( $__tune.isIE )
	{
		// IE trims input source in innerHTML
	    rendered_row = ch_encode_markup_spaces(rendered_row);
	}
	node.innerHTML = rendered_row;
}

ac.chap.View.prototype.recalculateVisibleRows = function()
{
	var map = this.window.row_id_map[this.index];
	var n = map.length;
	var i = 0;
	var num_visibles = 0;
	while ( i < n )
	{
		var state = map[i][2];
		if ( 0 == (ac.chap.ROWSTATE_FOLD_COLLAPSED & state) )
		{
			num_visibles++;
		}
		i++;
	}
	this.numVisibleRows = num_visibles;
}

ac.chap.View.prototype.getVisibleRowIndices = function()
{
	var map = this.window.row_id_map[this.index];
	var i = 0;
	var index = this.startRow;
	var indices = [];
	while ( i++ <= this.numRows )
	{
		if ( 'undefined' == typeof this.window.row_id_map[this.index][index] )
		{
			break;
		}
		var state = this.window.row_id_map[this.index][index][2];
		if ( ac.chap.ROWSTATE_FOLD_COLLAPSED == (ac.chap.ROWSTATE_FOLD_COLLAPSED & state) )
		{
			// collapsed
			i--;
			index++;
			continue;
		}
		indices.push(index);
		if ( ac.chap.ROWSTATE_FOLD_EXPAND == (state & ac.chap.ROWSTATE_FOLD_EXPAND) )
		{
			// collapsed folding
			var refered_row_index = this.window.row_id_map[this.index][index][3][1];
			index = refered_row_index + 1;
		}
		else
		{
			index++;
		}
	}
	return indices;
}

ac.chap.View.prototype.renderRowSidebar = function(position, rowIndex, rowNode, forceCompleteRedraw)
{
	if (!this.nodeSidebar.firstChild.childNodes.item(position))
	{
		return;
	}
	var bar_node = this.nodeSidebar.firstChild.childNodes.item(position).firstChild;
	if ( 0 == rowNode.offsetHeight )
	{
		rowNode.style.height = this.options.rowHeight;
	}
	var num_subrows = parseInt(rowNode.getAttribute('num-subrows'));
	var cache_id = forceCompleteRedraw ? 'none' : (num_subrows+':'+this.window.row_id_map[this.index][rowIndex].join('-'));
	if (bar_node.getAttribute('sidebar-cache-id') == cache_id && 'none' != cache_id)
	{
		return;
	}
	if ('none' != cache_id)
	{
		bar_node.setAttribute('sidebar-cache-id', cache_id);
		bar_node.firstChild.style.fontSize = (this.window.options.font.size-2) + 'px';
	}
	// console.log(cache_id);
	
	var row_height = num_subrows * this.options.rowHeight;
	bar_node.parentNode.style.height = row_height + 'px';
	if (forceCompleteRedraw)
	{
		bar_node.firstChild.style.fontSize = (this.window.options.font.size-2) + 'px';		
	}
	var ht = rowIndex+1;
	if ( this.options.wordWrap )
	{
		var htt = '<div style="height:'+this.options.rowHeight+'px;" class="wrapped-row"></div>';
		for ( var i=1; i<num_subrows; i++ )
		{
			ht += htt;
		}
	}
	bar_node.firstChild.innerHTML = ht;
	bar_node.setAttribute('row-index', rowIndex);

	var row_state = this.window.row_id_map[this.index][rowIndex][2];
	var fold_marker = (ac.chap.ROWSTATE_FOLD_START == (row_state & ac.chap.ROWSTATE_FOLD_START)) || (ac.chap.ROWSTATE_FOLD_STOP == (row_state & ac.chap.ROWSTATE_FOLD_STOP));
	if ( !fold_marker )
	{
		bar_node.lastChild.className = 'void';
	}
	else
	{
		bar_node.lastChild.style.display = 'block';
		if ( ac.chap.ROWSTATE_FOLD_EXPAND == (row_state & ac.chap.ROWSTATE_FOLD_EXPAND) )
		{
			// folding may expand
			bar_node.lastChild.className = 'folding-expand';
		}
		else
		{			
			if ( ac.chap.ROWSTATE_FOLD_START == (row_state & ac.chap.ROWSTATE_FOLD_START) )
			{
				// folding starts
				bar_node.lastChild.className = 'folding-start';
			}

			if ( ac.chap.ROWSTATE_FOLD_STOP == (row_state & ac.chap.ROWSTATE_FOLD_STOP) )
			{
				// folding stops
				bar_node.lastChild.className = 'folding-stop';
			}				
		}
	}
	if ( ac.chap.ROWSTATE_BOOKMARK == (row_state & ac.chap.ROWSTATE_BOOKMARK) )
	{
		// bookmark
		bar_node.firstChild.nextSibling.className = 'bookmark-default';
	}
	else
	{
		bar_node.firstChild.nextSibling.className = 'void';
	}	
}

ac.chap.View.prototype.renderSelection = function()
{
	var row_indices = this.getVisibleRowIndices();
	var num_rows = row_indices.length;
	var node_cache = document.createElement('div');
	var tab = this.options.tabelator;
	// console.log('RENDER SELECTION for: ');
	for ( var i=0; i<num_rows; i++ )
	{
		var row_index = row_indices[i];
		if (!this.window.row_id_map[this.index][row_index])
		{
			continue;
		}
		// console.log('row: %o', this.window.row_id_map[this.index][row_index]);
		var row_state = this.window.row_id_map[this.index][row_index][2];
		if ( ac.chap.ROWSTATE_SELECTION == (row_state & ac.chap.ROWSTATE_SELECTION) )
		{
			var node_row = document.getElementById('row-'+this.window.instanceId+'-'+this.index+'-'+row_index);
			if ( null == node_row )
			{
				continue;
			}
			var range = [this.window.row_id_map[this.index][row_index][5][0], this.window.row_id_map[this.index][row_index][5][1]];
			// console.log('selection range: %o', range);
//			console.log(range);
			if ( -1 == range[1] )
			{
				continue;
			}
			var render_whole_row = false;
			if ( 0 == range[0] && this.window.char_map[row_index].length == range[1] )
			{
				render_whole_row = ( this.window.row_id_map[this.index][row_index+1] && ac.chap.ROWSTATE_SELECTION == (this.window.row_id_map[this.index][row_index+1][2] & ac.chap.ROWSTATE_SELECTION) );
			}
			var cachid = range[0]+'-'+range[1];
			var node_id = 'rsel-'+this.window.instanceId+'-'+this.index+'-'+row_index;
			var node_row_selection = document.getElementById(node_id);
			if ( null != node_row_selection && node_row_selection.getAttribute('cachid') == cachid)
			{
				node_row_selection.style.top = node_row.offsetTop + 'px';
				node_cache.appendChild(node_row_selection);
			}
			else
			{
				node_row_selection = node_cache.appendChild(document.createElement('div'));
				node_row_selection.id = node_id;
				node_row_selection.style.background = this.theme.selectionStyle;
				node_row_selection.style.position = 'absolute';
				node_row_selection.style.top = node_row.offsetTop + 'px';
				node_row_selection.setAttribute('cachid', cachid);
				node_row_selection.style.height = this.options.rowHeight + 'px';
				if ( render_whole_row )
				{
					node_row_selection.style.left = '0px';
					node_row_selection.style.width = node_row.offsetWidth + 'px';
					node_row_selection.style.height = node_row.offsetHeight + 'px';
				}
				else
				{
					if ( this.options.wordWrap )
					{
						var raw_row = this.window.char_map[row_index];
						var ix_c = 0;
						var ix_r = 0;
						var offset = [0,-1, 0,-1];
						for ( var ii=0; ii<raw_row.length; ii++ )
						{
							var ch = raw_row.charAt(ii);
							if ( ii == range[0] )
							{
								offset[0] = ix_r;
								offset[1] = ix_c;
							}
							if ( '\t' == ch )
							{
								var tab_length = tab.length - (ix_c % tab.length);
								ix_c += tab_length;
							}
							else
							{
								ix_c++;
							}
							if ( ix_c > this.numCols )
							{
								ix_r++;
								ix_c -= this.numCols;
							}
							if ( ii == range[1] )
							{
								offset[2] = ix_r;
								offset[3] = ix_c;
								break;
							}
						}
						if ( -1 == offset[3] )
						{
							offset[2] = ix_r+1;//offset[0]+1;
						}
						node_row_selection.style.top = (node_row.offsetTop + this.options.rowHeight*offset[0]) + 'px';
//						console.log('%o', offset);
						if ( offset[0] == offset[2] )
						{
							// selection stays non-wrapped
							node_row_selection.style.left = offset[1]*this.options.colWidth + 'px';
							node_row_selection.style.width = ((offset[3]-offset[1])*this.options.colWidth) + 'px';
//							console.log(node_row_selection.style.width);
						}
						else
						{
							// finishing current node
							if ( -1 == offset[1] )
							{
								// caret stays on the end of the row
								node_row_selection.style.left = (ix_c*this.options.colWidth) + 'px';
								node_row_selection.style.width = (node_row.offsetWidth - (ix_c*this.options.colWidth)) + 'px';								
							}
							else
							{
								node_row_selection.style.left = (offset[1]*this.options.colWidth) + 'px';
								node_row_selection.style.width = (node_row.offsetWidth - (offset[1]*this.options.colWidth)) + 'px';								
							}
							// marking as non-cacheable
							node_row_selection.removeAttribute('cachid');
							// creating additional ones
							for ( ii=offset[0]+1; ii<=offset[2]; ii++ )
							{
								node_row_selection = node_cache.appendChild(document.createElement('div'));
								node_row_selection.style.background = this.theme.selectionStyle;
								node_row_selection.style.position = 'absolute';
								node_row_selection.style.left = '0px';
								node_row_selection.style.top = (node_row.offsetTop+ii*this.options.rowHeight) + 'px';
								node_row_selection.style.height = this.options.rowHeight + 'px';
								if ( ii != offset[2] )
								{
									node_row_selection.style.width = node_row.offsetWidth + 'px';									
								}
								else
								{
									node_row_selection.style.width = ((offset[3])*this.options.colWidth) + 'px';
								}
							}
						}
						
					}
					else
					{
						var offset_x1 = this.getRenderedStringDimension(row_index, 0, range[0])[0];
						var offset_x2 = this.getRenderedStringDimension(row_index, 0, range[1]+1)[0];
						node_row_selection.style.left = offset_x1 + 'px';
						node_row_selection.style.width = (offset_x2 - offset_x1) + 'px';
					}
				}
			}
			// console.log('selection after range: %o', this.window.row_id_map[this.index][row_index][3]);
			
		}
	}
	// console.log('%o', this.window.row_id_map[this.index][0]);
	var ht = node_cache.innerHTML;
	this.nodeSelectionArea.innerHTML = ht;
}

ac.chap.View.prototype.renderText = function(forceCompleteRedraw)
{
	var row_indices = this.getVisibleRowIndices();
	var num_rows = row_indices.length;
//	console.log('view: %s - row indices: %o', this.index, row_indices);

//	console.log('view: %s - num rows x cols [%s x %s]', this.index, this.numRows, this.numCols);
	// checking to see if only one row changed - the most usual case
	var changed_row_index = -1;
	var changed_row_position = -1;
	for ( var i=0; i<num_rows; i++ )
	{
		var row_index = row_indices[i];
		if ( !this.window.row_id_map[this.index][row_index][1] )
		{
			// changed
			if (-1 == changed_row_index)
			{
				changed_row_index = row_index;
				changed_row_position = i;
			}
			else
			{
				// more than two rows changed
//				console.log('changed on '+row_index);
				changed_row_index = -2;
				break;
			}
		}
	}
//	console.log('changed row: %s', changed_row_index);
//	console.log('rendered for %s ? %s', this.index, this.window.row_id_map[this.index][2][1] ? 'YES' : 'NO');
	var scroll_hash = this.index+'-'+row_indices.length+'-'+this.window.row_id_map[this.index][row_indices[0]][0]+'-'+this.window.row_id_map[this.index][row_indices[row_indices.length-1]][0]+'-'+this.nodeScrollArea.$.scrollHeight+'-'+Math.floor(this.nodeScrollArea.$.scrollTop/this.options.rowHeight);
//	console.log('hash: %s  changed index: %s', scroll_hash, changed_row_index);
	var already_rendered = -2 != changed_row_index && (null != this.nodeEditArea.getAttribute('last-scroll')) && (this.nodeEditArea.getAttribute('last-scroll') == scroll_hash);
	this.nodeEditArea.setAttribute('last-scroll', scroll_hash);

	if ( already_rendered && 0 <= changed_row_index )
	{
		// one row change
		var row_node = document.getElementById('row-'+this.window.instanceId+'-'+this.index+'-'+changed_row_index);
		if ( null != row_node && null != row_node.parentNode && this.window.row_id_map[this.index][changed_row_index][0] == row_node.getAttribute('row-id') )
		{
			this.renderTextRow(row_node, changed_row_index);
			if ( '' == row_node.innerHTML )
			{
				row_node.style.height = this.options.rowHeight+'px';
			}
			else
			{
				row_node.style.height = null;
			}
			this.renderRowSidebar(changed_row_position, changed_row_index, row_node);

			this.window.row_id_map[this.index][changed_row_index][1] = true;
			already_rendered = true;
//			console.log('view: %s, one row only %s', this.index, changed_row_index);
		}
	}
	var top_offset = - this.nodeScrollArea.$.scrollTop % this.options.rowHeight;
	var row_width = (this.options.wordWrap ? this.wrapWidth : this.nodeFillArea.$.offsetWidth)+'px';
	if ( forceCompleteRedraw || !already_rendered )
	{
//		var num_rendered_subrows = 0;
		for ( i=0; i<num_rows; i++ )
		{
			var row_index = row_indices[i];

			var is_row_changed = !this.window.row_id_map[this.index][row_index][1];

			// marking row as unchanged
			this.window.row_id_map[this.index][row_index][1] = true;
			
			var row_node = document.getElementById('row-'+this.window.instanceId+'-'+this.index+'-'+row_index);
			if ( !is_row_changed )
			{
				is_row_changed = (null == row_node) || (null == row_node.parentNode) || (row_node.getAttribute('row-id') != this.window.row_id_map[this.index][row_index][0]);
			}
			if ( null == row_node || null == row_node.parentNode )
			{
				is_row_changed = true;
				
				// console.log(this.options.rowTemplate);
				row_node = this.options.rowTemplate.cloneNode(false);
				row_node.id = 'row-'+this.window.instanceId+'-'+this.index+'-'+row_index;
				row_node.style.width = row_width;
				row_node.setAttribute('row-index', row_index);
			}
			if ( forceCompleteRedraw || is_row_changed )
			{
				row_node.setAttribute('row-id', this.window.row_id_map[this.index][row_index][0]);
				if (forceCompleteRedraw)
				{
					row_node.style.minHeight = this.options.rowTemplate.style.minHeight;
					row_node.style.lineHeight = this.options.rowTemplate.style.lineHeight;
					row_node.style.font = this.options.rowTemplate.style.font;
				}
				this.renderTextRow(row_node, row_index);
			}
			if ( '' == row_node.innerHTML )
			{
				row_node.style.height = this.options.rowHeight+'px';
			}
			else
			{
				row_node.style.height = null;
			}
			this.nodeEditAreaCache.appendChild(row_node);

			// rendering side bar
			this.renderRowSidebar(i, row_index, row_node, forceCompleteRedraw);
			//num_rendered_subrows += parseInt(row_node.getAttribute('num-subrows'));
		}
		// clearing remaining sidebar rows
		for ( i=num_rows; i<this.numRows; i++ )
		{
			if (this.nodeSidebar.firstChild.childNodes.item(i) && this.nodeSidebar.firstChild.childNodes.item(i).firstChild)
			{
				var bar_node = this.nodeSidebar.firstChild.childNodes.item(i).firstChild;
				bar_node.lastChild.className = 'void';
				bar_node.firstChild.nextSibling.className = 'void';
				bar_node.firstChild.innerHTML = '';
			}
		}

		this.nodeEditArea.style.top = this.nodeSelectionArea.style.top = (this.startRowOffset*this.options.rowHeight)+'px';
		if ( $__tune.isSafari )
		{
			// Safari is extremely fast when doing DOM
			this.nodeEditArea.innerHTML = '';
			while ( this.nodeEditAreaCache.firstChild )
			{
				this.nodeEditArea.appendChild(this.nodeEditAreaCache.firstChild);
			}
		}
		else
		{
			// other browsers are a bit lazy..
			var ht = this.nodeEditAreaCache.innerHTML
			this.nodeEditArea.innerHTML = ht;
			this.nodeEditAreaCache.innerHTML = '';
		}

// TODO: NNN is the number of subrows in WHOLE document.. hard to calculate on-the-fly (too slow), affects word-wrapped documents only..
//		var fill_area_h = (this.numVisibleRows+NNN)*this.options.rowHeight;
//		console.log('num visible for view :%s = %s, row_id.len = %s', this.index, this.numVisibleRows, this.window.row_id_map[this.index].length);

		var fill_area_h = (this.numVisibleRows+2)*this.options.rowHeight;
		if ( this.nodeRoot.h()-$__tune.ui.scrollbarWidth > fill_area_h )
		{
			fill_area_h = this.nodeRoot.h()-$__tune.ui.scrollbarWidth;
		}
		this.nodeFillArea.h(fill_area_h);
		
	}
	else
	{
		this.nodeEditAreaCache.innerHTML = '';
	}
	if ( parseInt(this.nodeSidebar.firstChild.style.top) != top_offset )
	{
		this.nodeSidebar.firstChild.style.top  = (top_offset)+'px';
		this.nodeSidebar.firstChild.style.height  = (this.nodeSidebar.offsetHeight - $__tune.ui.scrollbarWidth - top_offset)+'px';		
	}
	this.renderSelection();
}



if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}
