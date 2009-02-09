#S#/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Chap - Text Editing Component widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

var ac = {};


ac.chap = 
{
	state:
	{
		active:null
	},
	TOKEN_MULTILINE_COMMENT:0,
	TOKEN_SINGLELINE_COMMENT:1,
	TOKEN_SINGLE_QUOTED:2,
	TOKEN_DOUBLE_QUOTED:3,
	TOKEN_NEWLINE:4,
	TOKEN_WHITESPACE:5,
	
	ROWSTATE_NONE:0,
	ROWSTATE_FOLD_STARTMARKER:1,
	ROWSTATE_FOLD_ENDMARKER:2,
	ROWSTATE_FOLD_EXPANDED:4,
	ROWSTATE_FOLD_COLLAPSED:8,
	ROWSTATE_SELECTION:16,
	ROWSTATE_BOOKMARK:32,
	
	CHUNK_KEYWORD:4,
	CHUNK_NUMBER:5,
	CHUNK_OPERATOR:6,
	CHUNK_PARENTHESIS:7,
	CHUNK_KEYWORD_CUSTOM:8,
	CHUNK_FUNCTION_NAME:9,
	CHUNK_LIBRARY:10
}

function __ms()
{
	var d = new Date();
	return 60000*d.getMinutes()+1000*d.getSeconds()+d.getMilliseconds();
}

$(document.documentElement).e('keydowsn', function(evt)
{
	evt.stop();
	return;

//	window.status = evt.keyCode;
	if ( null == ac.chap.state.active )
	{
		return;
	}
	if ( 86 == evt.keyCode && (evt.metaKey||evt.controlKey) )
	{
		ac.chap.state.active.clipboardContext.$.value = '';
		ac.chap.state.active.clipboardContext.$.focus();
	}
});

$(document.documentElement).e('keyup', function(evt)
{
	evt.stop();
	return;
//	window.status = String.fromCharCode(evt.charCode);
//	console.log('%o', evt);
	if ( null == ac.chap.state.active )
	{
		return;
	}
	ac.chap.state.active.insertIntoCharacterMap(String.fromCharCode(evt.charCode));
	ac.chap.state.active.renderText();
	ac.chap.state.active.caret.position.column++;
	ac.chap.state.active.showCaret();
	if ( 86 == evt.keyCode && (evt.metaKey||evt.controlKey) )
	{
		ac.chap.state.active.executiveContext.$.focus();
		ac.chap.state.active.executiveContext.$.value = ac.chap.state.active.clipboardContext.$.value;
//		ac.chap.state.active.executiveContext.$.blur();
	}
});


$class('ac.chap.Window',
{
	construct:function(options)
	{
		this.caret = null;
		this.options = null;
		this.state = null;
		
		this.views = [];
		this.activeView = null;
		this.viewLayoutNodes = [];

		this.char_map = [];
		this.row_id_map = [];
		this.syntax_map = [];
		this.style_map = [];

		this.row_id_sequence = 1;

		this.characterBuffer = null;
		this.characterBufferThread = null;
		
		this.setOptions(options||{});
		this.setState();
	}
});

ac.chap.Window.prototype.setOptions = function(options)
{
	this.options = 
	{
		initialCaretPosition:[0,0]
	};
	if ( $isset(options.initial_caret_position) )
	{
		this.options.initialCaretPosition = [options.initial_caret_position[0], options.initial_caret_position[1]];
	}
}

ac.chap.Window.prototype.setState = function()
{
	this.state =
	{
		charBufferRunning:false,
		lastKeyTimePressed:0
	}
	this.caret = 
	{
		position:[this.options.initialCaretPosition[0], this.options.initialCaretPosition[1]]
	}
	this.language = $new(ac.chap.lang.JavaScript);
}

ac.chap.Window.prototype.addView = function(layoutNode, options)
{
	var view_index = this.views.length;
	this.viewLayoutNodes.push(layoutNode);
	this.views.push($new(ac.chap.View, this, view_index, options||{}));
}

ac.chap.Window.prototype.edit = function(text)
{
	this.char_map = [];
	for ( var i=0; i<this.views.length; i++ )
	{
		this.row_id_map.push([]);
	}
	this.syntax_map = [];
	this.style_map = [];
	this.row_id_sequence = 1;
	
	this.insertIntoCharacterMap(text, 0, 0);
	this.tokenize(0);
	this.renderText();
}

ac.chap.Window.prototype.hide = function()
{
	for ( var i=0; i<this.views.length; i++ )
	{
		this.views[i].hide();
	}
	clearInterval(this.characterBufferThread);
	this.characterBuffer.rs();
}

ac.chap.Window.prototype.show = function()
{
	this.render();
}

ac.chap.Window.prototype.render = function()
{
	for ( var i=0; i<this.views.length; i++ )
	{
		this.views[i].render(this.viewLayoutNodes[i]);
	}

	var caller = this;
	this.state.lastKeyPressCall = 0;
	$(document.documentElement).e('keypress', function(evt)
	{
		evt.stop();
//		window.status = evt.keyCode+' ,  '+evt.charCode;
		var keyCode = caller.tuneKeyCode(evt);
		caller.addToCharacterBuffer(keyCode);			
	});

	this.characterBuffer = $().a($$()).pos(true).x(-900).y(-600).w(850).h(500).v(false).$;
	this.characterBufferThread = setInterval(function()
	{
		caller.processCharacterBuffer();
	}, 100);
}

ac.chap.Window.prototype.getTimestamp = function()
{
	var d = new Date();
	return 60000*d.getMinutes()+1000*d.getSeconds()+d.getMilliseconds();
}

ac.chap.Window.prototype.tuneKeyCode = function(evt)
{
	var keyCode = evt.keyCode;
	if ( $__tune.isSafari )
	{
		if ( 32 > keyCode )
		{
			keyCode = -keyCode;
		}
		if ( 63234 == keyCode )
		{
			keyCode = -37;
		}
		if ( 63232 == keyCode )
		{
			keyCode = -38;
		}
		if ( 63235 == keyCode )
		{
			keyCode = -39;
		}
		if ( 63233 == keyCode )
		{
			keyCode = -40;
		}
		if ( 32 >= keyCode || 59 == keyCode || 45 == keyCode || 46 == keyCode || 44 == keyCode || 58 == keyCode || 61 == keyCode || 43 == keyCode )
		{
			evt.preventDefault();				
		}
		window.status = keyCode;
//		evt.preventDefault();				
		var t = this.getTimestamp();
		if ( 0 > keyCode  && this.state.lastKeyPressCall > t-50 )
		{
			return;
		}
		this.state.lastKeyPressCall = t;
	}
	else if ( $__tune.isGecko )
	{
		if ( 0 != evt.keyCode )
		{
			keyCode = -evt.keyCode;
		}
		else
		{
			keyCode = evt.charCode;
		}
		if ( 32 >= keyCode )
		{
			evt.preventDefault();				
		}
	}
	else if ( $__tune.isIE )
	{
		
	}
	else if ( $__tune.isOpera )
	{
		evt.preventDefault();
		if ( !evt.shiftKey )
		{
			if ( 37 == keyCode || 38 == keyCode || 39 == keyCode || 40 == keyCode )
			{
				keyCode = -keyCode;
			}
		}
	}
	return keyCode;
}

ac.chap.Window.prototype.addToCharacterBuffer = function(keyCode)
{
//	$('debug-cbuff').at(' '+keyCode);
	var node = document.createElement('div');
	node.setAttribute('key-code', keyCode);
	this.characterBuffer.appendChild(node);
}

ac.chap.Window.prototype.processCharacterBuffer = function()
{
	if ( this.state.charBufferRunning )
	{
		return;
	}
	this.state.charBufferRunning = true;

	var redraw_text = false;
	var redraw_caret = false;
	
	while ( null != this.characterBuffer.firstChild )
	{
		var caret_row = this.caret.position[0];
		var caret_col = this.caret.position[1];

		var keyCode = parseInt(this.characterBuffer.firstChild.getAttribute('key-code'));
		if ( 0 > keyCode )
		{
			if ( -37 == keyCode )
			{
				// ARR_LEFT
				if ( 0 < caret_col )
				{
					caret_col--;
				}
				else
				{
					if ( 0 < caret_row )
					{
						caret_row--;
						caret_col = this.char_map[caret_row].length;
					}
				}
				this.changeCaretPosition(caret_row, caret_col);
			}
			else if ( -39 == keyCode )
			{
				// ARR_RIGHT
				if ( this.char_map[caret_row].length > caret_col )
				{
					caret_col++;
				}
				else
				{
					if ( 'undefined' != typeof this.char_map[caret_row+1] )
					{
						caret_row++;
						caret_col = 0;
					}
				}
				this.changeCaretPosition(caret_row, caret_col);
			}
			else if ( -38 == keyCode )
			{
				// ARR_UP
				if ( 0 < caret_row )
				{
					var move_end = this.char_map[caret_row].length == caret_col;
					if ( move_end )
					{
						caret_col = this.char_map[caret_row-1].length;
					}
					else
					{
						caret_col = Math.min(this.char_map[caret_row-1].length, caret_col);
					}
					this.changeCaretPosition(caret_row-1, caret_col);
				}
			}
			else if ( -40 == keyCode )
			{
				// ARR_DOWN
				if ( 'undefined' != typeof this.char_map[caret_row+1] )
				{
					var move_end = this.char_map[caret_row].length == caret_col;
					if ( move_end )
					{
						caret_col = this.char_map[caret_row+1].length;
					}
					else
					{
						caret_col = Math.min(this.char_map[caret_row+1].length, caret_col);
					}
					this.changeCaretPosition(caret_row+1, caret_col);
				}
			}
			else if ( -8 == keyCode )
			{
				// DELETE
				if ( 0 < caret_col )
				{
					this.removeFromCharacterMap(caret_row, caret_col-1);
					this.changeCaretPosition(caret_row, caret_col-1);
					redraw_text = true;
					redraw_caret = true;
				}
			}
			else if ( -13 == keyCode )
			{
				// ENTER
				this.insertIntoCharacterMap('\n');
				this.changeCaretPosition(caret_row+1, 0, true);
				redraw_text = true;
				redraw_caret = true;
			}
			else if ( -9 == keyCode )
			{
				// TAB
				this.insertIntoCharacterMap('\t');
				this.changeCaretPosition(caret_row, caret_col+1);
				redraw_text = true;
				redraw_caret = true;
			}
		}
		else
		{
			// getting string character
			var ch = String.fromCharCode(keyCode);
			this.insertIntoCharacterMap(ch);
			this.changeCaretPosition(caret_row, caret_col+1);
			redraw_text = true;
			redraw_caret = true;
		}
		this.state.lastKeyCode = keyCode;
		this.characterBuffer.removeChild(this.characterBuffer.firstChild);
	}
	if ( redraw_text )
	{
		var t = this.getTimestamp();
		if ( this.state.tokenizerTimer )
		{
			clearTimeout(this.state.tokenizerTimer);
		}
		if  ( this.state.scheduledTokenizerTime < t - 800 )
		{
			console.log('Tokenizer launched DIRECTLY at: '+this.getTimestamp());
			this.tokenize(0);
			this.state.scheduledTokenizerTime = this.getTimestamp() + 800;
		}
		else
		{
			var caller = this;
			this.state.tokenizerTimer = setTimeout(function()
			{
				console.log('Tokenizer launched at: '+caller.getTimestamp());
				caller.tokenize(0);
				caller.renderText();
				caller.state.scheduledTokenizerTime = caller.getTimestamp();
			}, 800);
		}
		this.renderText();
	}
	if ( redraw_caret )
	{
		this.showCaret();
	}
	this.state.charBufferRunning = false;
}

ac.chap.Window.prototype.changeCaretPosition = function(row, column, skipRedraw)
{
//	console.log('Changing caret position to [%s, %s]', row, column);
	if ( !skipRedraw )
	{
		this.hideCaret();
	}
	this.caret.position[0] = parseInt(row);
	this.caret.position[1] = parseInt(column);
	if ( !skipRedraw )
	{
		this.showCaret();
	}
//	this.__d();
}

ac.chap.Window.prototype.insertIntoCharacterMap = function(source, atRow, atColumn)
{
	if ( $notset(atRow) )
	{
		atRow = this.caret.position[0];
	}
	if ( $notset(atColumn) )
	{
		atColumn = this.caret.position[1];
	}
	
	var num_existing_rows = this.char_map.length;
	var new_rows = source.split('\n');
	var num_new_rows = new_rows.length;
	var num_views = this.views.length;
	
//	this.views[0].__d();
//	alert('before insert of '+num_new_rows+' rows');
	
	if ( 'undefined' == typeof this.char_map[atRow] )
	{
		this.char_map = this.char_map.concat(new_rows);
		for ( var i=0; i<num_new_rows; i++ )
		{
			for ( var ii=0; ii<num_views; ii++ )
			{
				this.row_id_map[ii][atRow+i] = [this.row_id_sequence, false, ac.chap.ROWSTATE_NONE, 0];
			}
			this.row_id_sequence++;
		}
	}
	else
	{
		if ( this.char_map[atRow].length < atColumn )
		{
			atColumn = this.char_map[atRow].length;
		}
		for ( var ii=0; ii<num_views; ii++ )
		{
			this.row_id_map[ii][atRow][1] = false;
		}
		if ( 1 == num_new_rows )
		{
			this.char_map[atRow] = this.char_map[atRow].substr(0, atColumn) + new_rows[0] + this.char_map[atRow].substr(atColumn);
		}
		else
		{
			var end_snippet = this.char_map[atRow].substr(atColumn);
			this.char_map[atRow] = this.char_map[atRow].substr(0, atColumn) + new_rows[0];
			var last_row_index = atRow + (num_new_rows-1);
			this.char_map = [].concat(this.char_map.slice(0, atRow+1), new_rows.slice(1), this.char_map.slice(atRow+1));
			var ins_map = [];
			for ( var i=1; i<num_new_rows; i++ )
			{
				ins_map[i-1] = [this.row_id_sequence++, false, ac.chap.ROWSTATE_NONE, 0];
			}
			for ( var ii=0; ii<num_views; ii++ )
			{			
				this.row_id_map[ii] = [].concat(this.row_id_map[ii].slice(0, atRow+1), ins_map, this.row_id_map[ii].slice(atRow+1));
			}
			this.char_map[last_row_index] += end_snippet;
			for ( var ii=0; ii<num_views; ii++ )
			{
				this.row_id_map[ii][last_row_index][1] = false;	
			}
		}
	}
//	this.views[0].__d();
//	alert('after insert of '+num_new_rows+' rows');
}

ac.chap.Window.prototype.removeFromCharacterMap = function(startRow, startCol, endRow, endCol)
{
	if ( 'undefined' == typeof endRow )
	{
		endRow = startRow;
		endCol = startCol+1;
	}
	var num_views = this.views.length;
	if ( startRow == endRow )
	{
		this.char_map[startRow] = this.char_map[startRow].substr(0, startCol)+this.char_map[startRow].substr(endCol);
		for ( var ii=0; ii<num_views; ii++ )
		{			
			this.row_id_map[ii][startRow][1] = false;
		}
	}
	else
	{
	}
}

ac.chap.Window.prototype.renderText = function()
{
	var num_views = this.views.length;
	for ( var i=0; i<num_views; i++ )
	{
		this.views[i].renderText();
	}
}

ac.chap.Window.prototype.showCaret = function()
{
	var num_views = this.views.length;
	for ( var i=0; i<num_views; i++ )
	{
		this.views[i].hideCaret();
		if ( this.activeView == this.views[i] )
		{
			this.views[i].showCaret();
		}
	}
}

ac.chap.Window.prototype.hideCaret = function()
{
	var num_views = this.views.length;
	for ( var i=0; i<num_views; i++ )
	{
		this.views[i].hideCaret();
	}
}

ac.chap.Window.prototype.captureEditAreaClick = function(evt, colIndex, view)
{
	this.activeView = view;
	ac.chap.state.active = this;
	evt.stop();
	var target  = evt.$.$;
	while ( null != target && 'pre' != target.tagName.toLowerCase() )
	{
		target = target.parentNode;
	}
	if ( null != target )
	{
		var row = parseInt(target.getAttribute('row-index'));
		var col = Math.min(colIndex, this.char_map[row].length);
		this.changeCaretPosition(row, col);
	}
}


ac.chap.Window.prototype.tokenize = function()
{
	var startRowIndex = 0;
	
	var source = this.char_map.slice(startRowIndex).join('\n');

	var total_rows = this.char_map.length;
	var syntax_map = [];

	var ml_start = this.language.multiLineCommentStartMarker;
	var ml_end = this.language.multiLineCommentEndMarker;
	var sq = this.language.singleQuoteStringMarker;	
	var dq = this.language.doubleQuoteStringMarker;	
	var sl_markers = this.language.singleLineCommentStartMarkers;
	
	var cursor = {row:startRowIndex, col:0};
	var col_offset = 0;
	
	var fillRowTokens = function(tokenType, fromRowIndex, toRowIndex, pars)
	{
		pars = pars || '';
		if ( -1 == toRowIndex )
		{
			toRowIndex = total_rows;
		}
		for ( var i=fromRowIndex; i<toRowIndex; i++ )
		{
			if ( 'undefined' == typeof syntax_map[i] )
			{
				syntax_map[i] = [];
			}
			syntax_map[i] = [[tokenType, -1, -1, pars]];
		}
	}

	var ixs = [
		[ac.chap.TOKEN_MULTILINE_COMMENT, -1, ml_start, ml_end],
		[ac.chap.TOKEN_SINGLE_QUOTED, -1, sq, sq],
		[ac.chap.TOKEN_DOUBLE_QUOTED, -1, dq, dq]
	];
	for ( var i=0; i<sl_markers.length; i++ )
	{
		ixs.push([ac.chap.TOKEN_SINGLELINE_COMMENT, -1, sl_markers[i], '\n']);
	}

	var __t = __ms();
	
	while ( true )
	{
		ixs[0][1] = source.indexOf(ml_start);
		ixs[1][1] = source.indexOf(sq);
		ixs[2][1] = source.indexOf(dq);
		for ( i=0; i<sl_markers.length; i++ )
		{
			ixs[3+i][1] = source.indexOf(sl_markers[i]);
		}
		var found_marker_index = -1;
		var lowest = source.length;
		for ( i=0; i<ixs.length; i++ )
		{
			if ( -1 != ixs[i][1] )
			{
				if ( lowest > ixs[i][1] )
				{
					found_marker_index = i;
					lowest = ixs[i][1];
				}
			}
		}
		if ( -1 == found_marker_index )
		{
			break;
		}
		var start_index = ixs[found_marker_index][1];
		var skipped_source = source.substr(0, start_index);
		var num_skipped_rows = skipped_source.split('\n').length;
		cursor.row += num_skipped_rows - 1;
		cursor.col = (1 == num_skipped_rows ? col_offset : 0) + skipped_source.length - ('\n'+skipped_source).lastIndexOf('\n');
		
		if ( 'undefined' == typeof syntax_map[cursor.row] )
		{
			syntax_map[cursor.row] = [];
		}
		
		var start_marker_len = ixs[found_marker_index][2].length;
		var end_marker_len = ixs[found_marker_index][3].length;
		source = source.substr(start_index+start_marker_len);

		var token_type = ixs[found_marker_index][0];
		
		var end_index = source.indexOf(ixs[found_marker_index][3]);
		if ( -1 == end_index )
		{
			syntax_map[cursor.row].push([token_type, cursor.col, -1, '']);
			fillRowTokens(token_type, cursor.row+1, -1);
			break;
		}
		else
		{
			var block_source = source.substr(0, end_index);
			var num_block_rows = '\n' == ixs[found_marker_index][3] ? 1 : block_source.split('\n').length;
			var cursor_col_end = block_source.length - ('\n'+block_source).lastIndexOf('\n');

			syntax_map[cursor.row].push([token_type, cursor.col, 1 == num_block_rows ? (cursor.col+end_index+start_marker_len+end_marker_len) : -1, ixs[found_marker_index][2]]);
			fillRowTokens(token_type, cursor.row+1, cursor.row+num_block_rows-1);
			if ( 1 == num_block_rows )
			{
				col_offset = cursor.col + end_index + start_marker_len + end_marker_len;
				if ( '\n' == ixs[found_marker_index][3] )
				{
					cursor.row++;
					col_offset = 0;
				}
			}
			else
			{
				if ( 'undefined' == typeof syntax_map[cursor.row+num_block_rows] )
				{
					syntax_map[cursor.row+num_block_rows-1] = [];
				}
				syntax_map[cursor.row+num_block_rows-1].push([token_type, -1, cursor_col_end + end_marker_len, '']);
//				var a = block_source.split('\n');
				col_offset = cursor_col_end + end_marker_len;
				cursor.row += num_block_rows -1;
			}
//			console.log(num_block_rows);
			source = source.substr(end_index+end_marker_len);
		}
	}
	delete ixs;
	delete source;

	
	
	var n = syntax_map.length;
	for ( i=0; i<n; i++ )
	{
		if ( 0 < i )
		{
			delete syntax_map[i-1];
		}
		if ( 'undefined' != typeof syntax_map[i] )
		{
			if ( 'undefined' != typeof this.syntax_map[i] )
			{
				// looking for change
				if ( syntax_map[i].length == this.syntax_map[i].length )
				{
					var changed = false;
					for ( var ii=0; ii<syntax_map[i].length; ii++ )
					{
						if ( syntax_map[i][ii].length != this.syntax_map[i][ii].length )
						{
							changed = true;
							break;
						}
						if ( syntax_map[i][ii][0] != this.syntax_map[i][ii][0] || syntax_map[i][ii][1] != this.syntax_map[i][ii][1] || syntax_map[i][ii][2] != this.syntax_map[i][ii][2] || syntax_map[i][ii][3] != this.syntax_map[i][ii][3] )
						{
							changed = true;
							break;
						}
					}
					if ( !changed )
					{
						continue;
					}
				}
			}
			this.syntax_map[i] = syntax_map[i];
		}
		else
		{
			if ( 'undefined' != typeof this.syntax_map[i] )
			{
				delete this.syntax_map[i];
			}
			else
			{
				// no change
				continue;
			}
		}
		for ( var ii=0; ii<this.views.length; ii++ )
		{
			// marking line as changed
			this.row_id_map[ii][i][1] = false;
		}
	}
	delete syntax_map;
	
	console.log('parsing for tokens took: %s msec', __ms()-__t);
	
//	this.views[0].__d();
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
		
		this.numRows = 0;
		this.numCols = 0;
		this.startRow = 0;
		this.startCol = 0;
		
		this.theme = null;
		
		this.setOptions(options);
	}
});

ac.chap.View.prototype.setOptions = function(options)
{
	this.options = 
	{
		tabelator:'  ',
		wordWrap:false,
		fontFixed:true,
		colWidth:0,
		lineHeight:0
	}
	if ( $isset(options.fontFixed) )
	{
		this.options.fontFixed = options.fontFixed;
	}
	if ( $isset(options.tabelator) )
	{
		this.options.tabelator = options.tabelator;
	}
	if ( this.options.fontFixed )
	{
		// getting column width and height
		var node = $().a($$('pre')).n('line').t('C').s('display:inline');
		this.options.colWidth = node.$.offsetWidth;
		this.options.lineHeight = node.$.offsetHeight;
		node.rs();
	}
	if ( $isset(options.theme) )
	{
		this.theme = $new(options.theme);
	}
}

ac.chap.View.prototype.getRenderedCharDimension = function(rowIndex, colIndex)
{
	if ( this.options.fontFixed )
	{
		return [this.options.colWidth, this.options.lineHeight];
	}
	if ( 'undefined' != typeof this.window.char_map[rowIndex] )
	{
		if ( colIndex < this.window.char_map[rowIndex].length )
		{
			var node = document.createElement('span');
			var ch = this.window.char_map[rowIndex].charAt(colIndex);
			if ( '\t' == ch )
			{
				ch = this.options.tabelator;
			}
			node.innerHTML = ch;
			return [node.offsetWidth, node.offsetHeight];
		}
	}
	return [0,0];
}

ac.chap.View.prototype.getRenderedStringDimension = function(rowIndex, colIndex, width)
{
	if ( 'undefined' != typeof this.window.char_map[rowIndex] )
	{
		if ( colIndex < this.window.char_map[rowIndex].length )
		{
			var str = this.window.char_map[rowIndex].substr(colIndex, width);
			if ( this.options.fontFixed )
			{
				str = str.replace(/\t/g, this.options.tabelator);
				return [this.options.colWidth*str.length, this.options.lineHeight];
			}
			else
			{
				var node = document.createElement('span');
				node.innerHTML = str;
				return [node.offsetWidth, node.offsetHeight];
			}
		}
	}
	return [0,0];
}

ac.chap.View.prototype.showCaret = function()
{
	var caret_row = this.window.caret.position[0];
	var caret_col = this.window.caret.position[1];
	var node_line = $('line-?-?'.embed(this.index, caret_row));
	if ( null != node_line && node_line.is() )
	{
		var pos = node_line.abspos();
		pos.x += this.getRenderedStringDimension(caret_row, 0, caret_col)[0];
		var dim = this.getRenderedCharDimension(caret_row, caret_col);
		pos.x -= dim[0];
		this.nodeCaret = $().a($$()).n('caret').pos(true).x(pos.x).y(pos.y).w(dim[0]).h(dim[1]);
	}
}

ac.chap.View.prototype.hideCaret = function()
{
	if ( null != this.nodeCaret && this.nodeCaret.is() )
	{
		this.nodeCaret.rs();
		this.nodeCaret = null;
	}
}

ac.chap.View.prototype.render = function(node)
{
	var w = node.$.offsetWidth;
	var h = node.$.offsetHeight;
	if ( this.options.fontFixed )
	{
		this.numCols = Math.floor(w/this.options.colWidth);
		this.numRows = Math.floor(h/this.options.lineHeight);
		w = this.numCols * this.options.colWidth;
		h = this.numRows * this.options.lineHeight;
	}
	else
	{
		this.numCols = -1;
		this.numRows = -1;
	}
	var caller = this;
	this.nodeScrollArea = node.a($$()).pos(true).w(w+$__tune.ui.scrollbarWidth).h(h+$__tune.ui.scrollbarWidth).n('scroll-area').s('overflow:scroll');
	this.nodeScrollArea.e('scroll', function(evt)
	{
		if ( caller.options.fontFixed )
		{
			caller.startRow = Math.floor(caller.nodeScrollArea.$.scrollTop/caller.options.lineHeight);
			if ( caller == caller.window.activeView )
			{
				caller.hideCaret();				
			}
			caller.renderText();
			if ( caller == caller.window.activeView && caller.startRow < caller.window.caret.position[0] )
			{
				caller.showCaret();
			}
		}
	});
	this.nodeFillArea = this.nodeScrollArea.a($$()).pos(true).x(0).y(0).w(w).h(h).n('fill-area').s('overflow:hidden');
	this.nodeEditArea = this.nodeFillArea.a($$()).pos(true).x(0).y(0).w(w).h(h).n('edit-area').s('overflow:hidden').e('click', function(evt)
	{
		var col_index = 1 + Math.floor((evt.getOffsetX()-caller.options.colWidth/2)/caller.options.colWidth);
		caller.window.captureEditAreaClick(evt, col_index, caller);
	}).$;

	this.nodeEditAreaCache = node.a($$()).pos(true).x(-700).y(-700).w(300).h(500).v(false).$;
}

ac.chap.View.prototype.__d = function()
{
	return;
	if ( 0 != this.index )
	{
		return;
	}
	var ht = '<p><em>Caret: [?,?], View: [?,?], Last keycode:[?]</em></p>'.embed(this.window.caret.position[0], this.window.caret.position[1], this.startRow, this.startCol, this.window.state.lastKeyCode);
	for ( var i=0; i<this.window.char_map.length; i++ )
	{
		ht += '<strong>'+i+'</strong> : '+this.window.char_map[i]+'<br>';
		var rid = this.window.row_id_map[this.index][i];
		ht += '&nbsp; &nbsp; <strong style="color:red">'+rid[0]+'</strong> <em>'+(rid[1]?'R':'NOT')+'</em> '+rid[2]+' ('+rid[3]+')<br>';
		var syx = this.window.syntax_map[i];
		ht += '&nbsp; &nbsp; SYNTAX: ';
		if ( 'undefined' == typeof syx || 'undefined' == syx )
		{
			ht += 'Not defined.';
		}
		else
		{
			for ( var ii=0; ii<syx.length; ii++ )
			{
				var token = syx[ii];
				ht += '<br>&nbsp; &nbsp; &nbsp; &nbsp; <strong style="color:green">'+token[0]+'</strong> ['+token[1]+','+token[2]+'] ('+token[3]+')';
			}
		}
		ht += '<br>';
	}
	var caller = this;
	$('debug').t('').a($$()).t('REFRESH').e('click', function(evt)
	{
		alert(1);
		evt.stop();
		caller.__d();
	});
	$('debug').at(ht);
}

ac.chap.View.prototype.renderChunk = function(chunk)
{
	var tokens = [];
	var n = this.window.language.chunkRules.length;
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
				alert('Error in regexp definition: '+re);
				break;
			}
//			console.log(r_chunk);
			m = re.exec(r_chunk);
			if ( null != m )
			{
				var index = m.index + m[0].indexOf(m[result_index]);
				tokens.push([token_type, m[result_index], r_offset + index]);
				r_offset += index + m[result_index].length;
				r_chunk = r_chunk.substr(index+m[result_index].length);
//				console.log('%o, index:%s, len:%s, %s', m, index, m[result_index].length, m[result_index]);
			}
		}
	}
	if ( 0 < tokens.length )
	{
//		console.log(tokens);
		tokens.sort(function(a, b)
		{
			return a[2] - b[2];
		});
		var rend_chunk = '';
		var offset = 0;
		for ( i=0; i<tokens.length; i++ )
		{
			var token = tokens[i];
			rend_chunk += chunk.substr(offset, token[2]-offset).encodeMarkup();
			rend_chunk += '<span style="' + this.theme.colorScheme[token[0]] + '">' + token[1] + '</span>';
			offset = token[2] + token[1].length;
		}
		rend_chunk += chunk.substr(offset).encodeMarkup();
		chunk = rend_chunk;
	}
	return chunk;
}

ac.chap.View.prototype.renderTextRow = function(node, rowIndex)
{
	var row = this.window.char_map[rowIndex];
	var rendered_row = '';
	var offset = 0;

	if ( 'undefined' != typeof this.window.syntax_map[rowIndex] && 0 < this.window.syntax_map[rowIndex].length )
	{
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
			rendered_row += '<span style="' + this.theme.colorScheme[token_type] + '">'+chunk+'</span>';
			offset = -1 == end_offset ? row.length : end_offset;
		}		
	}

	
	
//	console.log(syntax_map);

	rendered_row += this.renderChunk(row.substr(offset));

	rendered_row = rendered_row.replace(/\t/g, this.options.tabelator);
	node.innerHTML = rendered_row;
}

ac.chap.View.prototype.renderText = function()
{
	/*
	if ( 0 == this.index )
	{
		this.__d();
		alert('Before render text');		
	}
	*/
	var t = __ms();
	
	var start_row_offset = this.startRow;
	var end_row_offset = Math.min(this.window.char_map.length, start_row_offset+this.numRows);

	var start_col_offset = this.startCol;
	var proposed_end_col_offset = start_col_offset+this.numCols;
	var end_col_offset = 0;

	//this.highliteText(start_row_offset, end_row_offset);
	
	// checking to see if only one row changed - the most usual case
	var changed_row_index = -1;
	for ( var r=start_row_offset; r<end_row_offset; r++ )
	{
		if ( !this.window.row_id_map[this.index][r][1] )
		{
			// changed
			if ( -1 == changed_row_index )
			{
				changed_row_index = r;
			}
			else
			{
				// more than two lines changed
				changed_row_index = -2;
				break;
			}
		}
	}

//	this.__d();

	var already_rendered = false;//-1 == changed_row_index;//false;

	if ( 0 <= changed_row_index )
	{
		// one line change
//		console.log()
		this.window.row_id_map[this.index][changed_row_index][1] = true;
		var line = document.getElementById('line-'+this.index+'-'+changed_row_index);
		if ( null != line && null != line.parentNode && this.window.row_id_map[this.index][changed_row_index][0] == line.getAttribute('row-id') )
		{
			this.renderTextRow(line, changed_row_index);
			already_rendered = true;
//			console.log('single');
		}
	}
	if ( !already_rendered )
	{
		for ( r=start_row_offset; r<end_row_offset; r++ )
		{
			var end_col_offset = Math.min(this.window.char_map[r].length, proposed_end_col_offset);
			
			var row_rendered = this.window.row_id_map[this.index][r][1];
			
			// marking rendered
			this.window.row_id_map[this.index][r][1] = true;
			
			var line = document.getElementById('line-'+this.index+'-'+r);
			if ( row_rendered && null != line && null != line.parentNode )
			{
				if ( line.getAttribute('row-id') == this.window.row_id_map[this.index][r][0] )
				{
					this.nodeEditAreaCache.appendChild(line);
					continue;
				}
			}
			else if ( null == line || null == line.parentNode )
			{
				line = document.createElement('pre');
				line.className = 'line';
				line.id = 'line-'+this.index+'-'+r;
				line.style.height = this.options.lineHeight+'px';
				line.style.width = parseInt(this.nodeEditArea.style.width)+'px';

				line.setAttribute('row-index', r);
			}
			line.setAttribute('row-id', this.window.row_id_map[this.index][r][0]);

			this.renderTextRow(line, r);
			this.nodeEditAreaCache.appendChild(line);
		}
	
		this.nodeEditArea.innerHTML = '';
		this.nodeEditArea.style.left = (start_col_offset*this.options.colWidth)+'px';
		this.nodeEditArea.style.top  = (start_row_offset*this.options.lineHeight)+'px';

		this.nodeFillArea.h(this.window.char_map.length*this.options.lineHeight);

		while ( null != this.nodeEditAreaCache.firstChild )
		{
			this.nodeEditArea.appendChild(this.nodeEditAreaCache.firstChild);
		}
	}
	else
	{
		this.nodeEditAreaCache.innerHTML = '';
	}
	//console.log('render text for view %s = %s msecs', this.index, __ms()-t);
}


$class('ac.chap.Theme',
{
	construct:function()
	{
		this.colorScheme = [];
		this.initDefinition();
	}
});

ac.chap.Theme.prototype.initDefinition = function()
{
}

ac.chap.theme = {};


$class('ac.chap.theme.SlushPopies < ac.chap.Theme');

ac.chap.theme.SlushPopies.prototype.initDefinition = function()
{
	this.colorScheme[ac.chap.TOKEN_MULTILINE_COMMENT] = 'color:#888';
	this.colorScheme[ac.chap.TOKEN_SINGLELINE_COMMENT] = 'color:#888';
	this.colorScheme[ac.chap.TOKEN_SINGLE_QUOTED] = 'color:#a00';
	this.colorScheme[ac.chap.TOKEN_DOUBLE_QUOTED] = 'color:#a00';
	this.colorScheme[ac.chap.CHUNK_KEYWORD] = 'color:#00a';
	this.colorScheme[ac.chap.CHUNK_NUMBER] = 'color:teal';
	this.colorScheme[ac.chap.CHUNK_OPERATOR] = 'color:#3D5DAA';
	this.colorScheme[ac.chap.CHUNK_PARENTHESIS] = 'font-weight:bold';
	this.colorScheme[ac.chap.CHUNK_KEYWORD_CUSTOM] = 'color:#880';
	this.colorScheme[ac.chap.CHUNK_FUNCTION_NAME] = 'color:#622';
	this.colorScheme[ac.chap.CHUNK_LIBRARY] = 'color:#08f';
}



$class('ac.chap.Language',
{
	construct:function()
	{
		this.foldingStartMarker = [];
		this.foldingEndMarker = [];
		this.singleLineCommentStartMarkers = [];
		this.multiLineCommentStartMarker = '';
		this.multiLineCommentEndMarker = '';
		this.initDefinition();
	}
});

ac.chap.Language.prototype.initDefinition = function()
{
	this.singleQuoteStringMarker = "'";
	this.doubleQuoteStringMarker = '"';
	this.chunkRules = [];
}



ac.chap.lang = {};


$class('ac.chap.lang.Ruby < ac.chap.Language');

ac.chap.lang.Ruby.prototype.initDefinition = function()
{
	this.foldingStartMarker = ['def', 'class', 'if'];
	this.foldingEndMarker = ['end', 'end', 'end'];
	this.singleLineCommentStartMarkers = ['#'];
	this.singleQuoteStringMarker = "'";
	this.doubleQuoteStringMarker = '"';
}

$class('ac.chap.lang.JavaScript < ac.chap.Language');

ac.chap.lang.JavaScript.prototype.initDefinition = function()
{
	this.foldingStartMarker = ['{'];
	this.foldingEndMarker = ['}'];
	this.singleLineCommentStartMarkers = ['//', '#'];
	this.multiLineCommentStartMarker = '/*';
	this.multiLineCommentEndMarker = '*/';
	this.singleQuoteStringMarker = "'";
	this.doubleQuoteStringMarker = '"';
	this.chunkRules = 
	[
		[/(([^\w]|^)(break|case|catch|continue|default|do|else|finally|for|goto|if|import|package|return|switch|throw|try|while)([^\w]|$))/i, 3, ac.chap.CHUNK_KEYWORD],
		[/(([^\w]|^)(\d{1,}[\d\.Ee]*)([^w]|$))/i, 3, ac.chap.CHUNK_NUMBER],
		[/(\+|\-|\*|\/|\=|\!|\^|\%|\||\&)/i, 0, ac.chap.CHUNK_OPERATOR],
		[/(\(|\)|\[|\]|\{|\})/i, 0, ac.chap.CHUNK_PARENTHESIS],
		[/(([^\w]|^)(function|var|prototype|this)([^\w]|$))/i, 3, ac.chap.CHUNK_KEYWORD_CUSTOM],
		[/((prototype\.|function[ ]{1,})([\w]{1,}))/i, 3, ac.chap.CHUNK_FUNCTION_NAME],
		[/(([^\w]|^)(document|window|self|top|event|documentElement|write|close|open|status|alert|submit|prompt|console)([^\w]|$))/i, 3, ac.chap.CHUNK_LIBRARY]
	];
}



//$class('ac.chap.')



if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}



