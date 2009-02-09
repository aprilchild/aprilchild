/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Chap - Text Editing Component - Core
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

ac.chap = 
{
	state:
	{
		active:null
	},

	TOKEN_MULTIROW_COMMENT:0,
	TOKEN_SINGLEROW_COMMENT:1,
	TOKEN_SINGLE_QUOTED:2,
	TOKEN_DOUBLE_QUOTED:3,
	TOKEN_NEWROW:4,
	TOKEN_WHITESPACE:5,
	
	ROWSTATE_NONE:0,
	ROWSTATE_FOLD_START:1,
	ROWSTATE_FOLD_STOP:2,
	ROWSTATE_FOLD_EXPAND:4,
	ROWSTATE_FOLD_COLLAPSED:8,
	ROWSTATE_SELECTION:16,
	ROWSTATE_BOOKMARK:32,
	
	CHUNK_KEYWORD:4,
	CHUNK_NUMBER:5,
	CHUNK_OPERATOR:6,
	CHUNK_PARENTHESIS:7,
	CHUNK_KEYWORD_CUSTOM:8,
	CHUNK_FUNCTION_NAME:9,
	CHUNK_LIBRARY:10,
	CHUNK_LIBRARY_CUSTOM:11,
	
	ACTION_CARET:1,
	ACTION_SELECTION:2,
	ACTION_INSERT:3,
	ACTION_UPDATE:4,
	ACTION_DELETE:5,
	ACTION_CLIPBOARD:6,
	ACTION_UNDO:7,
	ACTION_REDO:8,
	ACTION_CUSTOM:9,
	
	ACTION_RES_REDRAWCARET:1,
	ACTION_RES_REDRAWTEXT:2,
	ACTION_RES_SELECTIONCHANGED:4,
	ACTION_RES_SCROLLTOCARET:8,
	
	CKEY_NONE:0,
	CKEY_ALT:2,
	CKEY_CTRL:4,
	CKEY_SHIFT:8,
	CKEY_META:16,
	
	TRANSLOG_TYPE_INSERT:1,
	TRANSLOG_TYPE_REMOVE:2,
	
	ACTION_LISTENER_BEFORE:1,
	ACTION_LISTENER_AFTER:2,
	ACTION_LISTENER_BOTH:3
	
}



ac.chap.activeComponent = null;
ac.chap.instanceId = 1;

ac.chap.getActiveComponent = function()
{
	return ac.chap.activeComponent;
}

ac.chap.setActiveComponent = function(component)
{
	fry.keyboard.initialize();
	if (null != ac.chap.activeComponent)
	{
		ac.chap.activeComponent.blur();
	}
	ac.chap.activeComponent = component;
	if (null != component)
	{
		if (ac.widget)
		{
			ac.widget.focus(component);
		}
		ac.chap.activeComponent.focus();
	}
	else
	{
		if (!ac.widget)
		{
			fry.keyboard.stop();
		}
	}
}

ac.chap.route = function(type, windowId, viewIndex, pars)
{
	if ( null == ac.chap.activeComponent )
	{
		return;
	}
	if ( 'undefined' == typeof ac.chap.activeComponent.views[viewIndex] )
	{
		return;
	}
	switch ( type )
	{
		case 'expand-folding':
		{
			ac.chap.activeComponent.expandFolding(pars);
		}
	}
}

ac.chap.caretThread = setInterval(function()
{
	if (null != ac.chap.activeComponent)
	{
		ac.chap.activeComponent.showCaret(true, true);
	}
}, 600);

$(document.documentElement).e($__tune.isSafari2?'mousedown':'click', function(evt)
{
	var elem = evt.$.$;
	while ( null != elem && document.documentElement != elem )
	{
		if ( 'true' == elem.getAttribute('chap-view') )
		{
			evt.stop();
			return;
		}
		elem = elem.parentNode;
	}
	ac.chap.setActiveComponent(null);
});


ac.chap.keyboardListener = function(code, mask)
{
	if (null == ac.chap.activeComponent)
	{
		return;
	}
	return ac.chap.activeComponent.standaloneKeyboardListener(code, mask);
}
if ('undefined' == typeof ac['widget'])
{
	// chap is not a part of Fry MVC, must handle keyboardListener itself
	fry.keyboard.addListener(ac.chap.keyboardListener);
}

$class('ac.chap.Window',
{
	construct:function(options, userId)
	{
		this.instanceId = ac.chap.instanceId++;
		this.ident = 'ac-chap-' + this.instanceId;
		this.userId = userId | 0;
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
		
		this.language = null;
		this.keymap = null;
		this.snippets = [];
		this.commands = [];
		
		this.selection = null;
		this.transaction_log = [];
		this.redo_log = [];
		
		this.setOptions(options||{});
		this.setState();
	},
	destruct:function()
	{
	    $delete(this.state);
	    $delete(this.options);
	    $delete(this.char_map);
	    $delete(this.row_id_map);
	    $delete(this.syntax_map);
	    $delete(this.style_map);
		this.hide();
	    $delete(this.activeView);
	}
});

ac.chap.Window.prototype.focus = function()
{
	this.showCaret();
}

ac.chap.Window.prototype.blur = function()
{
	this.hideCaret();
}

// compatibility layer with AC Fry Widget library
ac.chap.Window.prototype.onFocus = function()
{
	ac.chap.setActiveComponent(this);
	this.focus();
}

ac.chap.Window.prototype.onBlur = function()
{
	ac.chap.setActiveComponent(null);
	this.blur();
}

ac.chap.Window.prototype.onResize = function(width, height)
{
}

ac.chap.Window.prototype.onSystemClipboardCopy = function()
{
	return this.getSelection();
}

ac.chap.Window.prototype.onSystemClipboardCut = function()
{
	this.runAction(ac.chap.ACTION_CLIPBOARD, {cut:true});
	return this.processActionResult(true, true);
}

ac.chap.Window.prototype.onSystemClipboardPaste = function(content)
{
	this.runAction(ac.chap.ACTION_CLIPBOARD, {paste:true, content:content});
	return this.processActionResult(true, true);
}

ac.chap.Window.prototype.hasKeyboardListenerActive = function()
{
	return true;
}
ac.chap.Window.prototype.onCut = function(selection, callbackOk)
{
}

ac.chap.Window.prototype.onPaste = function(selection, wasCut)
{
}

ac.chap.Window.prototype.setOptions = function(options)
{
	this.options = 
	{
		initialCaretPosition:[0,0],
		tokenizerLazyLaunch:900,
		syntaxHighlightingEnabled:true,
		remoteBackendURL:'',
		font:{
			size:11,
			family: $__tune.isMac ? "Consolas, 'Bitstream Vera Sans mono', 'Courier', 'Monaco', monospaced" : "Consolas, 'Courier New', 'Courier', monospaced",
			allowedSizes: [8, 9, 10, 11, 12, 13, 14, 17, 21, 24, 27, 30, 34, 38, 42]
		}
	};
	if ( $isset(options.initial_caret_position) )
	{
		this.options.initialCaretPosition = [options.initial_caret_position[0], options.initial_caret_position[1]];
	}
	if ( $isset(options.language) )
	{
		this.language = $new(options.language);
	}
	else
	{
		this.language = $new(ac.chap.Language);
	}
	if ( $isset(options.keymap) )
	{
		this.keymap = $new(options.keymap);
	}
	else
	{
		this.keymap = $new(ac.chap.KeyMap);
	}
	if ( $isset(options.syntaxHighlightingEnabled) )
	{
		this.options.syntaxHighlightingEnabled = options.syntaxHighlightingEnabled;
	}
	if ( $isset(options.remoteBackendURL) )
	{
		this.options.remoteBackendURL = options.remoteBackendURL;
	}
	else
	{
	    if ( client && client.conf && client.conf.fry )
	    {
	        this.options.remoteBackendURL = client.conf.fry.backendURL;
	    }
	}
	if ($isset(options.font))
	{
		if ($isset(options.font['size']))
		{
			this.options.font.size = options.font.size;			
		}
		if ($isset(options.font['family']))
		{
			this.options.font.family = options.font.family;
		}
	}
}

ac.chap.Window.prototype.setState = function()
{
	this.state =
	{
		lastKeyTimePressed:0,
		caretPhase:1,
		lastKeyCode:0,
		lastControlKey:0,
		lastCaretPosition:[],
		tokenizerTimer:null,
		scheduledTokenizerTime:0,
		transactionLogStopped:false,
		actionListeners:[],
		actionListenersStopped:false,
		caretListener:null,
		commandListener:null,
		transactionListener:[null,800],
		passThroughKeysListener:null
	}
	this.caret = 
	{
		position:[this.options.initialCaretPosition[0], this.options.initialCaretPosition[1]],
		mode:1 // 1 normal, 2 overwrite
	}
}

ac.chap.Window.prototype.addView = function(layoutNode, options, renderAfter)
{
	var view_index = this.views.length;
	this.viewLayoutNodes.push(layoutNode);
	this.views.push($new(ac.chap.View, this, view_index, options||{}));
	this.row_id_map[view_index] = [];
	if ( 0 < view_index )
	{
//		console.log(view_index);
		// creating duplicate
		var n = this.row_id_map[0].length;
		for ( var i=0; i<n; i++ )
		{
			var row = this.row_id_map[0][i];
			this.row_id_map[view_index][i] = [row[0], false, row[2], [], [], []];
		}
		//this.row_id_map[view_index] = [].concat(this.row_id_map[0].slice(0));
	}
	if ( renderAfter )
	{
		this.views[view_index].recalculateVisibleRows();
		this.views[view_index].render(this.viewLayoutNodes[view_index]);
		this.tokenize(0);
		this.renderText();
	}
//	console.log('%o', this.row_id_map[view_index]);
	return view_index;
}

ac.chap.Window.prototype.resizeView = function(viewIndex)
{
	if ( this.views[viewIndex] )
	{
		this.views[viewIndex].resize();
	}
}

ac.chap.Window.prototype.edit = function(text, setAsActive)
{
	this.char_map = [];
	for ( var i=0; i<this.views.length; i++ )
	{
//		this.row_id_map.push([]);
	}
	this.syntax_map = [];
	this.style_map = [];
	this.row_id_sequence = 1;
	this.transaction_log = [];
	this.redo_log = [];
	
	this.insertIntoCharacterMap(text, 0, 0);
	this.tokenize(0);
	this.renderText();
	setAsActive = setAsActive || true;
	if ( setAsActive )
	{
		ac.chap.setActiveComponent(this);
		if (0 < this.views.length)
		{
			this.activeView = this.views[0];
		}
	}
}

ac.chap.Window.prototype.hide = function()
{
	this.hideCaret();
	var n = this.views.length
	for ( var i=0; i<n; i++ )
	{
		this.views[i].hide();
    	$delete(this.views[i]);
	}
	$delete(this.views);
	ac.chap.setActiveComponent(null);
}

ac.chap.Window.prototype.show = function()
{
	this.render();
	ac.chap.setActiveComponent(this);
}

ac.chap.Window.prototype.showInteractiveSearch = function()
{
	if (this.activeView)
	{
		this.activeView.showInteractiveSearch();
	}
}

ac.chap.Window.prototype.hideInteractiveSearch = function()
{
	for (var i=0; i<this.views.length; i++)
	{
		this.views[i].hideInteractiveSearch();
	}
}

ac.chap.Window.prototype.toggleBookmark = function(rowIndex)
{
	var rowIndex = rowIndex || this.caret.position[0];
	for ( var i=0; i<this.views.length; i++ )
	{
		if ( 'undefined' == typeof this.row_id_map[i][rowIndex] )
		{
			return;
		}
		// marking as changed
		this.row_id_map[i][rowIndex][1] = false;
		var row_state = this.row_id_map[i][rowIndex][2];
		if ( ac.chap.ROWSTATE_BOOKMARK == (row_state & ac.chap.ROWSTATE_BOOKMARK) )
		{
			// already bookmarked
			this.row_id_map[i][rowIndex][2] &= (65535-ac.chap.ROWSTATE_BOOKMARK);
		}
		else
		{
			this.row_id_map[i][rowIndex][2] |= ac.chap.ROWSTATE_BOOKMARK;
		}
	}
}

ac.chap.Window.prototype.setRuntimeOption = function(key, value)
{
	var font_sizes = this.options.font.allowedSizes;
	var font_size = this.options.font.size;
	var redraw = false;
	if ('font' == key)
	{
		if ($isset(value['size']))
		{
			if (font_sizes[0] <= value.size && value.size <= font_sizes[font_sizes.length-1])
			{
				font_size = value.size;
				redraw = true;
			}
		}
		if ($isset(value['family']))
		{
			this.options.font.family = value.family;
		}
	}
	else if ('font.size' == key)
	{
		if ('bigger' == value)
		{
			for (var i=0; i<font_sizes.length; i++)
			{
				if (font_size < font_sizes[i])
				{
					font_size = font_sizes[i];
					break;
				}
			}
		}
		else if ('smaller' == value)
		{
			for (var i=font_sizes.length-1; i>= 0; i--)
			{
				if (font_size > font_sizes[i])
				{
					font_size = font_sizes[i];
					break;
				}
			}
		}
		else
		{
			if (font_sizes[0] <= value && value <= font_sizes[font_sizes.length-1])
			{
				font_size = value;
			}
		}
		this.options.font.size = font_size;
		redraw = true;
	}
	else if ('font.family' == key)
	{
		this.options.font.family = value;
		redraw = true;
	}
	else if ('word.wrap' == key)
	{
		if (this.activeView)
		{
			this.hideCaret();
			this.activeView.options.wordWrap = value;
			this.activeView.reloadOptions();
			this.showCaret();
		}
	}
	if (redraw)
	{
		this.hideCaret();
		var num_views = this.views.length;
		for (var i=0; i<num_views; i++)
		{
			this.views[i].reloadOptions();
		}
		this.showCaret();
	}
}

ac.chap.Window.prototype.scrollToBookmark = function(rowIndex, directionOffset)
{
	rowIndex = rowIndex || this.caret.position[0];
	var view = this.activeView;
	if (null == view)
	{
		return;
	}
	var num_rows = this.row_id_map[view.index].length;
	if (0 == num_rows)
	{
		return;
	}
	var start_index = rowIndex + directionOffset;
	if (1 == directionOffset)
	{
		num_rows = num_rows - start_index;
	}
	else
	{
		num_rows = rowIndex;
	}
	if (!this.findAndScrollToBookmark(view, start_index, num_rows, directionOffset))
	{
		// not found, try the other half reversed search
		if (1 == directionOffset)
		{
			start_index = 0;
			num_rows = rowIndex;
		}
		else
		{
			num_rows = this.row_id_map[view.index].length;
			start_index = num_rows - 1;
			num_rows -= rowIndex;
		}
		this.findAndScrollToBookmark(view, start_index, num_rows, directionOffset);
	}
}

ac.chap.Window.prototype.findAndScrollToBookmark = function(view, startIndex, numRowsToSearch, directionOffset)
{
	var i = 0;
	var active_index = startIndex;
	// console.log(startIndex, numRowsToSearch, directionOffset);
	while (i<numRowsToSearch)
	{
		// console.warn(i, active_index);
		var row_state = this.row_id_map[view.index][active_index][2];
		if (ac.chap.ROWSTATE_BOOKMARK == (row_state & ac.chap.ROWSTATE_BOOKMARK))
		{
			// found a bookmark
			view.scrollToRow(active_index, true);
			return true;
		}
		active_index += directionOffset;
		i++;
	}
	return false;
}

ac.chap.Window.prototype.setEditMode = function(mode)
{
	this.caret.mode = mode;
	ac.chap.setActiveComponent(this);
	this.tokenize();
	this.renderText();
}

ac.chap.Window.prototype.setTheme = function(theme)
{
	for ( var i=0; i<this.views.length; i++ )
	{
		this.views[i].setTheme(theme);
	}
}

ac.chap.Window.prototype.setLanguage = function(language)
{
	this.language = $new(language);
	this.tokenize();
	this.foldingize();
	this.renderText();
	this.showCaret();
}

ac.chap.Window.prototype.setSnippets = function(snippets)
{
	this.snippets = snippets;
	this.keymap.importSnippets(snippets);
}

ac.chap.Window.prototype.setCommands = function(commands)
{
	this.commands = commands;
	this.keymap.importCommands(commands);
}

ac.chap.Window.prototype.getTabelator = function(tabelator)
{
	if (0 < this.views.length)
	{
		return this.views[0].options.tabelator;
	}
	return '\t';
}

ac.chap.Window.prototype.setTabelator = function(tabelator)
{
	for ( var i=0; i<this.views.length; i++ )
	{
		this.views[i].options.tabelator = tabelator;
	}
}

ac.chap.Window.prototype.render = function()
{
	for ( var i=0; i<this.views.length; i++ )
	{
		this.views[i].render(this.viewLayoutNodes[i]);
	}
}


ac.chap.Window.prototype.getTimestamp = function()
{
	var d = new Date();
	return 60000*d.getMinutes()+1000*d.getSeconds()+d.getMilliseconds();
}

ac.chap.Window.prototype.keyboardListener = function(code, mask)
{
	var redraw_text = false;
	var redraw_caret = false;
	var scroll_to_caret = false;
	var selection_changed = false;
	this.state.lastKeyTimePressed = new Date().getTime();

	var key_code = code;
	var control_key = mask & 30;
	if (this.state.passThroughKeysListener && this.state.passThroughKeysListener(key_code, control_key))
	{
		return true;
	}
	var definition = $getdef(this.keymap.definition[key_code], this.keymap.definition[0]);
	definition = $getdef(definition[control_key], definition[ac.chap.CKEY_NONE]);
	if ( 'undefined' == typeof definition )
	{
		definition = this.keymap.definition[0][ac.chap.CKEY_NONE];
	}
	if (fry.keyboard.COPY == (mask & fry.keyboard.COPY))
	{
		return true;
	}
	// console.log(code, mask);
    var me = this;
	var num_actions = definition.length;
	for (var i=0; i<num_actions; i+=2)
	{
		var action_type = definition[i];
		var params = definition[i+1];
		params.keyCode = key_code;
		params.controlKey = control_key;
		if (!this.state.actionListenersStopped)
		{
		    var caret_row = this.caret.position[0];
		    var caret_col = this.caret.position[1];
			for (var ii in this.state.actionListeners)
			{
				var listener = this.state.actionListeners[ii];
				if (ac.chap.ACTION_LISTENER_BEFORE == (listener[0] & ac.chap.ACTION_LISTENER_BEFORE))
				{
				    if (!listener[3])
				    {
				        // synchronous
						listener[2](me, listener[1], ac.chap.ACTION_LISTENER_BEFORE, 0, action_type, params, caret_row, caret_col);
				    }
				    else
				    {
				        setTimeout(function(){listener[2](me, listener[1], ac.chap.ACTION_LISTENER_BEFORE, 0, action_type, params, caret_row, caret_col);}, 300);
				    }
				}
			}
		}
		var result = this.runAction(action_type, params);
		if  (!this.state.actionListenersStopped)
		{
		    var caret_row = this.caret.position[0];
		    var caret_col = this.caret.position[1];
			for (var ii in this.state.actionListeners)
			{
				var listener = this.state.actionListeners[ii];
				if (ac.chap.ACTION_LISTENER_AFTER == (listener[0] & ac.chap.ACTION_LISTENER_AFTER))
				{
				    if (!listener[3])
				    {
				        // synchronous
						listener[2](me, listener[1], ac.chap.ACTION_LISTENER_AFTER, result, action_type, params, caret_row, caret_col);
				    }
				    else
				    {
				        setTimeout(function(){listener[2](me, listener[1], ac.chap.ACTION_LISTENER_AFTER, result, action_type, params, caret_row, caret_col);}, 300);						        
				    }
				}
			}
		}
		if (!redraw_caret)
		{
			redraw_caret = ac.chap.ACTION_RES_REDRAWCARET == (result & ac.chap.ACTION_RES_REDRAWCARET);
		}
		if (!redraw_text)
		{
			redraw_text = ac.chap.ACTION_RES_REDRAWTEXT == (result & ac.chap.ACTION_RES_REDRAWTEXT);
		}
		if (!selection_changed)
		{
			selection_changed = ac.chap.ACTION_RES_SELECTIONCHANGED == (result & ac.chap.ACTION_RES_SELECTIONCHANGED);
		}
		if (!scroll_to_caret)
		{
			scroll_to_caret = ac.chap.ACTION_RES_SCROLLTOCARET == (result & ac.chap.ACTION_RES_SCROLLTOCARET);
		}
	}
	if (selection_changed)
	{
		redraw_caret = false;
		this.hideCaret();
	}
	else
	{
		this.state.lastCaretPosition = [this.caret.position[0], this.caret.position[1]];
		if (this.removeSelection())
		{
			redraw_text = true;
			redraw_caret = true;
		}
	}
	this.state.lastKeyCode = key_code;
	this.state.lastControlKey = control_key;
	if (scroll_to_caret)
	{
		// console.log('scroll to caret: '+this.caret.position[0]);
		this.activeView.scrollToRow(this.caret.position[0], false, true);
	}
	this.processActionResult(redraw_text, redraw_caret);
	// disabling further key actions
	return true;
}

// called if chap is not a part of Fry MVC 
ac.chap.Window.prototype.standaloneKeyboardListener = function(code, mask)
{
	if (fry.keyboard.CONTROL_CODE == (mask & fry.keyboard.CONTROL_CODE))
	{
		if (fry.keyboard.PASTE == (mask & fry.keyboard.PASTE))
		{
			// pasted text from clipboard received
			return this.onSystemClipboardPaste(fry.keyboard.getClipboardContent());
		}
		else if (fry.keyboard.CUT == (mask & fry.keyboard.CUT))
		{
			// cut, let's clear selection if it exists
			return this.onSystemClipboardCut();
		}
		else if (fry.keyboard.SIG_CLIPBOARD_GET == (mask & fry.keyboard.SIG_CLIPBOARD_GET))
		{
			// need to return selected content
			return this.onSystemClipboardCopy();
		}
		else
		{
			code = -code;
		}
	}
	return this.keyboardListener(code, mask);
}

ac.chap.Window.prototype.processActionResult = function(redrawText, redrawCaret)
{
	if ( redrawText )
	{
		var t = this.getTimestamp();
		if ( this.state.tokenizerTimer )
		{
			clearTimeout(this.state.tokenizerTimer);
		}
		if  ( this.state.scheduledTokenizerTime < t - this.options.tokenizerLazyLaunch )
		{
//			console.log('Tokenizer launched DIRECTLY at: '+this.getTimestamp());
			this.tokenize(0);
			this.state.scheduledTokenizerTime = this.getTimestamp() + this.options.tokenizerLazyLaunch;
		}
		else
		{
			var me = this;
			this.state.tokenizerTimer = setTimeout(function()
			{
//				console.log('Tokenizer launched at: '+me.getTimestamp());
				me.tokenize(0);
				me.state.scheduledTokenizerTime = me.getTimestamp();
				me.renderText();
				delete me;

			}, this.options.tokenizerLazyLaunch);
		}
		this.renderText();
	}
	if ( redrawCaret )
	{
		this.showCaret();
	}
}

ac.chap.Window.prototype.setUserId = function(userId)
{
    this.userId = userId;
    // console.info('User ID set to: %s', userId);
}

ac.chap.Window.prototype.addCaretListener = function(callback)
{
	this.state.caretListener = callback;
}

ac.chap.Window.prototype.removeCaretListener = function(callback)
{
	this.state.caretListener = null;
}

ac.chap.Window.prototype.addCommandListener = function(callback)
{
    this.state.commandListener = callback;
}

ac.chap.Window.prototype.removeCommandListener = function(callback)
{
    this.state.commandListener = null;
}

ac.chap.Window.prototype.addPassThroughKeysListener = function(callback)
{
	this.state.passThroughKeysListener = callback;
}

ac.chap.Window.prototype.removePassThroughKeysListener = function()
{
	this.state.passThroughKeysListener = null;
}

ac.chap.Window.prototype.addTransactionListener = function(callback, lazyRunMsecs)
{
    this.state.transactionListener = [callback, $getdef(lazyRunMsecs, 800)];
}

ac.chap.Window.prototype.hasTransactionListener = function()
{
	return null != this.state.transactionListener && null != this.state.transactionListener[0];
}

ac.chap.Window.prototype.removeTransactionListener = function(callback)
{
    this.state.transactionListener = null;
}

ac.chap.Window.prototype.addActionListener = function(type, action, callback, asynchronous)
{
	callbackIndex = this.state.actionListeners.length;
	this.state.actionListeners[callbackIndex] = [type, action, callback, asynchronous];
	return callbackIndex;
}

ac.chap.Window.prototype.removeActionListener = function(callbackIndex)
{
	delete this.state.actionListeners[callbackIndex];
}

ac.chap.Window.prototype.stopActionListeners = function()
{
	this.state.actionListenersStopped = true;
}

ac.chap.Window.prototype.startActionListeners = function()
{
	this.state.actionListenersStopped = false;
}

ac.chap.Window.prototype.getVariableValue = function(varName, defaultValue)
{
	var value = '';
	if ( 'CHAP_SELECTED_TEXT' == varName )
	{
		value = this.getSelection();
	}
	else if ( 'CHAP_CLIPBOARD_TEXT' == varName )
	{
		value = fry.keyboard.getClipboardContent();
	}
	else if ( 'CHAP_PREV_WORD' == varName )
	{
		value = this.getWordAt(this.caret.position[0], this.caret.position[1], -1);
	}
	else if ( 'CHAP_NEXT_WORD' == varName )
	{
		value = this.getWordAt(this.caret.position[0], this.caret.position[1], 1);
	}
	else if ( 0 == varName.indexOf('CHAP_WORD') )
	{
		words = [''];
		if ( !isNaN(varName.substr(9)) )
		{
			words = this.getWordAt(this.caret.position[0], this.caret.position[1], parseInt(varName.substr(9)));
			if ( 'string' == typeof words )
			{
				words = [words];
			}
		}
		value = words[words.length-1];
	}
	if ( '' == value || null == value )
	{
		value = defaultValue || '';
	}
	return value;
}

ac.chap.Window.prototype.runCommand = function(keyCode, controlKeysMask, caretRow, caretCol, command, params)
{
    if ( null == this.state.commandListener )
    {
        console.warn('There is no command listener defined.');
        return 0;
    }
    return this.state.commandListener(this, keyCode, controlKeysMask, caretRow, caretCol, command, params);
}

ac.chap.Window.prototype.runAction = function(actionType, params)
{
	var caret_row = this.caret.position[0];
	var caret_col = this.caret.position[1];
	var key_code = params.keyCode;
	var control_key = params.controlKey;
//	console.log('action_type:%s, params:%o', actionType, params);
	
	switch ( actionType )
	{
		case ac.chap.ACTION_CARET:
		{
			if ( $isset(params.store) )
			{
				this.state.lastCaretPosition = [caret_row, caret_col];
			}
			else if ( $isset(params.move) )
			{
				var direction = params.move;
				if ( 'left' == direction )
				{
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
					this.setCaretPosition(caret_row, caret_col);
					return ac.chap.ACTION_RES_REDRAWCARET;
				}
				else if ( 'right' == direction )
				{
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
					this.setCaretPosition(caret_row, caret_col);
					return ac.chap.ACTION_RES_REDRAWCARET;
				}
				else if ( 'up' == direction )
				{
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
						this.setCaretPosition(caret_row-1, caret_col);
						return ac.chap.ACTION_RES_REDRAWCARET;
					}
				}
				else if ( 'down' == direction )
				{
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
						this.setCaretPosition(caret_row+1, caret_col);
						return ac.chap.ACTION_RES_REDRAWCARET;
					}					
				}
				else if ( 'prev_word' == direction )
				{
					if ( 0 < caret_col )
					{
						var ch = this.char_map[caret_row].charAt(caret_col-1);
						var re = this.language.wordDelimiter;
						var look_for_wch = re.test(ch);
						while ( 0 != caret_col )
						{
							ch = this.char_map[caret_row].charAt(caret_col-1);
							if ( look_for_wch != re.test(ch) )
							{
								break;
							}
							caret_col--;
						}
					}
					else
					{
						if ( 0 < caret_row )
						{
							caret_row--;
							caret_col = this.char_map[caret_row].length;
						}
					}
					this.setCaretPosition(caret_row, caret_col);
					return ac.chap.ACTION_RES_REDRAWCARET;					
				}
				else if ( 'next_word' == direction )
				{
					if ( this.char_map[caret_row].length > caret_col )
					{
						var ch = this.char_map[caret_row].charAt(caret_col);
						var re = this.language.wordDelimiter;
						var look_for_wch = re.test(ch);
						while ( this.char_map[caret_row].length > caret_col )
						{
							ch = this.char_map[caret_row].charAt(caret_col);
							if ( look_for_wch != re.test(ch) )
							{
								break;
							}
							caret_col++;
						}
					}
					else
					{
						if ( 'undefined' != typeof this.char_map[caret_row+1] )
						{
							caret_row++;
							caret_col = 0;
						}
					}
					this.setCaretPosition(caret_row, caret_col);
					return ac.chap.ACTION_RES_REDRAWCARET;
				}
				else if ( 'prev_regexp' == direction )
				{
					if ( 0 < caret_col )
					{
						var row = this.char_map[caret_row].substring(0, caret_col);
						var re = new RegExp(params['re'].replace('|', '\\'));
						var matches = re.exec(row);
						if (0 == matches.length)
						{
							console.warning('Invalid RE definition for `prev_regexp\' direction in ACTION_CARET.move action in keymap.');
							caret_col--;
						}
						else
						{
							caret_col -= matches[0].length + 1;
						}
					}
					else
					{
						if ( 0 < caret_row )
						{
							caret_row--;
							caret_col = this.char_map[caret_row].length;
						}
					}
					this.setCaretPosition(caret_row, caret_col);
					return ac.chap.ACTION_RES_REDRAWCARET;
				}
				else if ( 'next_regexp' == direction )
				{
					if ( this.char_map[caret_row].length > caret_col )
					{
						var row = this.char_map[caret_row].substr(caret_col + 1);
						var re = new RegExp(params['re'].replace('|', '\\'));
						var matches = re.exec(row);
						if (0 == matches.length)
						{
							console.warning('Invalid RE definition for `next_regexp\' direction in ACTION_CARET.move action in keymap.');
							caret_col++;
						}
						else
						{
							caret_col += matches[0].length + 1;
						}
					}
					else
					{
						if ( 'undefined' != typeof this.char_map[caret_row+1] )
						{
							caret_row++;
							caret_col = 0;
						}
					}
					this.setCaretPosition(caret_row, caret_col);
					return ac.chap.ACTION_RES_REDRAWCARET;
				}
				else if ( 'row_start' == direction )
				{
					if ( 0 < caret_col )
					{
						caret_col = 0;
						this.setCaretPosition(caret_row, caret_col);				
						return ac.chap.ACTION_RES_REDRAWCARET;
					}
				}
				else if ( 'row_end' == direction )
				{
					if ( this.char_map[caret_row].length > caret_col )
					{
						caret_col = this.char_map[caret_row].length;
						this.setCaretPosition(caret_row, caret_col);				
						return ac.chap.ACTION_RES_REDRAWCARET;
					}
				}
				else if ( 'page_up' == direction )
				{
					if (this.activeView)
					{
						var row = caret_row - this.activeView.numRows;
						if (0 > row)
						{
							row = 0;
						}
						this.setCaretPosition(row, 0 != caret_col ? this.char_map[row].length : 0);
						return ac.chap.ACTION_RES_REDRAWCARET;
					}
					return 0;
				}
				else if ( 'page_down' == direction )
				{
					if (this.activeView)
					{
						var row = caret_row + this.activeView.numRows;
						if (this.char_map.length <= row)
						{
							row = this.char_map.length-1;
						}
						this.setCaretPosition(row, 0 != caret_col ? this.char_map[row].length : 0);
						return ac.chap.ACTION_RES_REDRAWCARET;
					}
					return 0;
				}
				else if ( 'doc_start' == direction )
				{
					this.setCaretPosition(0,0);
					return ac.chap.ACTION_RES_REDRAWCARET;
				}
				else if ( 'doc_end' == direction )
				{
					var last_index = this.char_map.length-1
					this.setCaretPosition(last_index, this.char_map[last_index].length-1);
					return ac.chap.ACTION_RES_REDRAWCARET;
				}
			}
			else if ( $isset(params.moveBy) )
			{
				var offset = params.moveBy;
				if ( 'column' == offset )
				{
					//move by params.value columns, newlines are counted as column, params.value may be negative indication caret moving to the left
					if ( 0 < params.value )
					{
						var range_source = (this.char_map[caret_row].substr(caret_col)+'\n'+this.char_map.slice(caret_row+1).join('\n')).substr(0, params.value);
						range_source = range_source.split('\n');
						caret_row += range_source.length-1;
						caret_col = range_source[range_source.length-1].length + (1==range_source.length ? caret_col : 0);
					}
					else
					{
						var range_source = (this.char_map.slice(0, caret_row).join('\n')+'\n'+this.char_map[caret_row].substr(0, caret_col));
						range_source = range_source.substr(range_source.length+params.value);
						range_source = range_source.split('\n');
						caret_row -= (range_source.length-1);
						caret_col = (1==range_source.length ? caret_col : this.char_map[caret_row].length) - range_source[0].length;
					}
					this.setCaretPosition(caret_row, caret_col);
					return ac.chap.ACTION_RES_REDRAWCARET;
				}
				else if ( 'row' == offset )
				{
					// move by params.value rows
				}
				else if ( 'page' == offset )
				{
					// move by params.value pages
				}
			}
			else if ( $isset(params.moveTo) )
			{
				// move to params.moveTo[0], params.moveTo[1]
				this.setCaretPosition(params.moveTo[0], params.moveTo[1]);
				return ac.chap.ACTION_RES_REDRAWCARET;
			}
		};break;
		case ac.chap.ACTION_SELECTION:
		{
			if ( $isset(params.remove) )
			{
				var changed = this.removeSelection();
				return ac.chap.ACTION_RES_REDRAWCARET | (changed ? ac.chap.ACTION_RES_REDRAWTEXT : 0);
			}
			else if ( $isset(params.add) )
			{
				this.addSelection([caret_row, caret_col], this.state.lastCaretPosition);
				this.renderSelection();
				return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_SELECTIONCHANGED;
			}
			else if ( $isset(params.all) )
			{
				$__tune.behavior.clearSelection();
				this.addAllSelection();
				this.renderSelection();
				return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_SELECTIONCHANGED;
			}
		};break;
		case ac.chap.ACTION_INSERT:
		{
			var str = null;
			if ( $isset(params.row) )
			{
				var ins_content = '\n';
				caret_col = 0;
				// if ( 0 < caret_row )
				// {
				// 	// indenting by previous row
				// 	var t = this.char_map[caret_row];
				// 	var n = t.length;
				// 	var re = this.language.indentIgnoreMarker;
				// 	while ( caret_col<n )
				// 	{
				// 		var ch = t.charAt(caret_col);
				// 		if ( !re.test(ch) )
				// 		{
				// 			break;
				// 		}
				// 		caret_col++;
				// 	}
				// 	ins_content += t.substr(0, caret_col);
				// }
				this.insertIntoCharacterMap(ins_content);
				this.setCaretPosition(caret_row+1, caret_col);
				return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;				
			}
			else if ( $isset(params.character) )
			{
				if ( 31 < key_code || -9 == key_code )
				{
					// getting string character
					str = -9 == key_code ? '\t' : String.fromCharCode(key_code);
				}
			}
			else if ( $isset(params.string) )
			{
				str = params.string;
			}
			// inserting string if specified
			if ( null != str )
			{
				if ( null != this.selection )
				{
					// inserting into selection, first, let's remove selected chunk
					var range_from = [this.selection.startPosition[0], this.selection.startPosition[1]];
					var range_to = [this.selection.endPosition[0], this.selection.endPosition[1]];
					var switched = false;
					if ( (range_to[0] < range_from[0]) || (range_to[0] == range_from[0] && range_to[1] < range_from[1]) )
					{
						var r = range_from;
						range_from = range_to;
						range_to = r;
						switched = true;
					}
					this.removeFromCharacterMap(range_from[0], range_from[1]+(switched?0:0), range_to[0], range_to[1]+(switched?0:1));
					this.setCaretPosition(range_from[0], range_from[1]);
					caret_row = range_from[0];
//					caret_col = range_from[1] - str.length + 1;
					caret_col = range_from[1];
					this.removeSelection();
				}
				else if ( 2 == this.caret.mode )
				{
					this.removeFromCharacterMap(caret_row, caret_col);
				}
				// console.log('inserting: `%s`', str.replace(/\n/g, '$'));
				this.insertIntoCharacterMap(str);
				if ( !params.skipCaretChange )
				{
					if ( -1 == str.indexOf('\n') )
					{
						caret_col += str.length;					
					}
					else
					{
						caret_row += str.length - str.replace(/\n/g, '').length;
						caret_col = str.length - str.lastIndexOf('\n') - 1;					
					}
					this.setCaretPosition(caret_row, caret_col);					
				}
				return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;
			}			
		};break;
		case ac.chap.ACTION_UPDATE:
		{
			
		};break;
		case ac.chap.ACTION_DELETE:
		{
			if ( $isset(params.row) )
			{
				if (this.getNumRows() == caret_row+1)
				{
					if (0 == caret_row)
					{
						this.removeFromCharacterMap(caret_row, 0, caret_row, this.char_map[caret_row].length);
						this.setCaretPosition(0, 0);
					}
					else
					{
						this.removeFromCharacterMap(caret_row-1, this.char_map[caret_row-1].length, caret_row, this.char_map[caret_row].length);
						this.setCaretPosition(caret_row-1, this.char_map[caret_row-1].length);						
					}
				}
				else
				{
					this.removeFromCharacterMap(caret_row, 0, caret_row+1, 0);
				}
				return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;
			}
			else if ( $isset(params.character) )
			{
				var after_caret = !params.character;
				var proceed_delete = true;
				if ( null != this.selection )
				{
					// removing selection
					var range_from = [this.selection.startPosition[0], this.selection.startPosition[1]];
					var range_to = [this.selection.endPosition[0], this.selection.endPosition[1]];
//					var range_to = [caret_row, caret_col];
					var switched = false;
					if ( (range_to[0] < range_from[0]) || (range_to[0] == range_from[0] && range_to[1] < range_from[1]) )
					{
						var r = range_from;
						range_from = range_to;
						range_to = r;
						switched = true;
					}
					this.removeFromCharacterMap(range_from[0], range_from[1], range_to[0], range_to[1]+(switched?0:1));
					caret_row = range_from[0];
					caret_col = range_from[1]+(after_caret?0:1);
					this.removeSelection();
				}
				else
				{
					var range_from = [caret_row, caret_col];
					var range_to = [caret_row, caret_col];
					if ( after_caret )
					{
						if ( caret_col == this.char_map[range_from[0]].length )
						{
							if ( this.char_map.length-1 == caret_row )
							{
								proceed_delete = false;
							}
							else
							{
								range_to[0]++;
								range_to[1] = 0;
							}
						}
						else
						{
							range_to[1]++;
						}
					}
					else
					{
						if ( 0 == caret_col )
						{
							if ( 0 == caret_row )
							{
								proceed_delete = false;
							}
							else
							{
								range_from[0]--;
								range_from[1] = this.char_map[range_from[0]].length;
							}
						}
						else
						{
							range_from[1]--;
						}
						caret_row = range_from[0];
						caret_col = range_from[1]+1;
					}
					if ( proceed_delete )
					{
//						console.log('%o - %o', range_from, range_to);
						this.removeFromCharacterMap(range_from[0], range_from[1], range_to[0], range_to[1]);
						this.removeSelection();
					}
				}
				if ( proceed_delete )
				{
					this.setCaretPosition(caret_row, caret_col-(after_caret?0:1));
					return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;				
				}
			}
		};break;
		case ac.chap.ACTION_CLIPBOARD:
		{
			if ( $isset(params.cut) )
			{
				if (null != this.selection)
				{
					return this.runAction(ac.chap.ACTION_DELETE, {character:true});
				}
			}
			else if ( $isset(params.paste) )
			{
				this.runAction(ac.chap.ACTION_INSERT, {string:params.content})
				return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;					
			}
		};break;
		case ac.chap.ACTION_UNDO:
		{
			//console.log('UNDO');
			var num_trecords = this.transaction_log.length;
			if ( 3 < num_trecords ) // ignoring first operation since it's the original source inserted using edit() method
			{
				var operation_type = this.transaction_log[num_trecords-3];
				var params = this.transaction_log[num_trecords-2];
				var source = this.transaction_log[num_trecords-1];
				if ( ac.chap.TRANSLOG_TYPE_INSERT == operation_type )
				{
					var range_from = [params[0], params[1]];
					var range_to = [params[0], params[1]];
					range_to[0] += (source.length - source.replace(/\n/g, '').length);
					var ix = source.lastIndexOf('\n');
					range_to[1] = -1 == ix ? (range_from[1]+source.length) : (source.length - ix);
					
//					this.removeFromCharacterMap(range_from[0], range_from[1], range_to[0], range_to[1], this.redo_log);
					this.removeFromCharacterMap(range_from[0], range_from[1], range_to[0], range_to[1]);//, this.redo_log);
					caret_row = range_from[0];
					caret_col = range_from[1];
					
				}
				else if ( ac.chap.TRANSLOG_TYPE_REMOVE == operation_type )
				{
					this.insertIntoCharacterMap(source, params[0], params[1]);
					caret_row = params[2];
					caret_col = params[3];
				}
				this.setCaretPosition(caret_row, caret_col);
				this.removeSelection();
				
				this.redo_log = [].concat(this.redo_log, this.transaction_log.slice(num_trecords-3, num_trecords));
				this.transaction_log = [].concat(this.transaction_log.slice(0, num_trecords-3));

				return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;
			}
		};break;
		case ac.chap.ACTION_REDO:
		{
			var num_trecords = this.redo_log.length;
			if ( 0 < num_trecords )
			{
				var operation_type = this.redo_log[num_trecords-3];
				var params = this.redo_log[num_trecords-2];
				var source = this.redo_log[num_trecords-1];
				this.redo_log = [].concat(this.redo_log.slice(0, num_trecords-3));
				if ( ac.chap.TRANSLOG_TYPE_REMOVE == operation_type )
				{
					this.removeFromCharacterMap(params[0], params[1], params[2], params[3]);
					caret_row = params[0];
					caret_col = params[1];

					this.setCaretPosition(caret_row, caret_col);
					this.removeSelection();
				}
				else if ( ac.chap.TRANSLOG_TYPE_INSERT == operation_type )
				{
					this.runAction(ac.chap.ACTION_INSERT, {string:source});
				}
				return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;
			}
		};break;
		case ac.chap.ACTION_CUSTOM:
		{
			var action_name = 'action_?'.embed($getdef(params.action, 'NotDefined'));
			if ( !this.keymap[action_name] )
			{
				console.warn('Action `%s` not defined in the keymap.', params.action);
				action_name = 'action_NotDefined';
			}
			return this.keymap[action_name](key_code, control_key, caret_row, caret_col, this, params);
		};break;
	}
	return 0;
}

ac.chap.Window.prototype.getActiveViewIndex = function()
{
	if ( null == this.activeView )
	{
		return -1;
	}
	return this.activeView.index;
}

ac.chap.Window.prototype.getCharAt = function(row, column)
{
	row = $getdef(row, this.caret.position[0]);
	column = $getdef(column, this.caret.position[1]);
	return this.char_map[row].charAt(column);
}

ac.chap.Window.prototype.getStringAt = function(row, column, width)
{
	row = $getdef(row, this.caret.position[0]);
	column = $getdef(column, this.caret.position[1]);
	width = $getdef(width, -1);
	// defaults to string before caret
//	console.log('getStringAt: %s, %s, %s', row, column, width);
	var source = '';
	if ( 0 > width )
	{
		// will go before [row,column]
		source = this.char_map.slice(0, row).join('\n')+'\n'+this.char_map[row].substr(0, column);
		return source.substr(source.length+width);
	}
	else
	{
		// will go after [row,column]
		source = this.char_map.slice(row).join('\n').substr(column);
		return source.substr(0, width);
	}
}

ac.chap.Window.prototype.getWordAt = function(row, column, numWords)
{
	// if numWords <0 returns words before otherwise after position. if omitted, default value is -1 that is word before caret
	// also, if more than one word is required, returns array of words as result
	row = $getdef(row, this.caret.position[0]);
	column = $getdef(column, this.caret.position[1]);
	numWords = $getdef(numWords, -1);
	var words = [];
	var re = this.language.wordDelimiter;
	var required_words = numWords;
	var direction_after = 0 < numWords;
	var next_word = true;
	required_words = Math.abs(-numWords);
	if ( !direction_after )
	{
		column--;
		if ( -1 == column )
		{
			row--;
			if ( -1 == row )
			{
				return words;
			}
			column = this.char_map[row].length-1;
		}
	}
	while (true)
	{
		var ch = this.char_map[row].charAt(column)
		if ( re.test(ch) )
		{
			if ( next_word )
			{
				words.push('');
				next_word = false;
			}
			// word character found
			if ( direction_after )
			{
				words[words.length-1] += ch;				
			}
			else
			{
				words[words.length-1] = ch + words[words.length-1];
			}
		}
		else
		{
			if ( required_words == words.length )
			{
				break;				
			}
			next_word = true;
		}
		
		column += (direction_after ? 1 : -1);
		if ( 0 > column )
		{
			row--;
			if ( -1 == row )
			{
				break;
			}
			next_word = true;
			column = this.char_map[row].length-1;				
		}
		else if ( this.char_map[row].length <= column )
		{
			row++;
			if ( this.char_map.length == row )
			{
				break;
			}
			next_word = true;
			column = 0;
		}
	}
	if ( 1 == required_words )
	{
		return words[0] ? words[0] : false;
	}
	return words;
}

ac.chap.Window.prototype.getLineAt = function(row)
{
    return this.char_map[row];
}

ac.chap.Window.prototype.getText = function()
{
	return this.char_map.join('\n');
}

ac.chap.Window.prototype.getNumRows = function()
{
    return this.char_map.length;
}

ac.chap.Window.prototype.getSyntaxHighlightingSource = function()
{
	if (null != this.activeView)
	{
		return this.activeView.getSyntaxHighlightingSource();
	}
	return 'ni';
}

ac.chap.Window.prototype.getCaretAbsolutePosition = function()
{
	if ( null != this.activeView )
	{
        var pos = this.activeView.getRenderedCharPosition(this.caret.position[0], this.caret.position[1]);
    	if ( null != pos )
    	{
    	    var root_pos = this.activeView.nodeScrollArea.abspos();
    	    return [pos[0]+root_pos.x+this.activeView.options.colWidth, pos[1]+root_pos.y+this.activeView.options.rowHeight];
    	}
    }
    return null;
}

ac.chap.Window.prototype.stopTransactionLog = function()
{
	this.state.transactionLogStopped = true;
}

ac.chap.Window.prototype.startTransactionLog = function()
{
	this.state.transactionLogStopped = false;
}

ac.chap.Window.prototype.addAllSelection = function()
{
	var num_rows = this.char_map.length;
	var num_views = this.views.length;
	for ( var i=0; i<num_rows; i++ )
	{
		for ( var ii=0; ii<num_views; ii++ )
		{
			this.row_id_map[ii][i][2] = this.row_id_map[ii][i][2] | ac.chap.ROWSTATE_SELECTION;
			this.row_id_map[ii][i][5][0] = 0;
			this.row_id_map[ii][i][5][1] = this.char_map[i].length;
		}
	}
	this.selection = 
	{
		startPosition: [0, 0],
		endPosition: [num_rows-1, this.char_map[num_rows-1].length]
	}
	// var me = this;
	// $runafter(300, function()
	// {
	// 	ac.chap.nodeClipboard.$.value = me.getSelection();
	// 	delete me;
	// });
}

ac.chap.Window.prototype.addSelection = function(range_to, range_from)
{
	// console.log('Adding selection: [%i, %i]', range_to, range_from);
	var num_views = this.views.length;
	if ( null == this.selection )
	{
		// no previous selection
		range_from = range_from || range_to;		
		this.selection = {};
		this.selection.startPosition = [range_from[0], range_from[1]];
	}
	else
	{
		var start_offset = Math.min(this.selection.startPosition[0], this.selection.endPosition[0]);
		var end_offset = Math.max(this.selection.startPosition[0], this.selection.endPosition[0]);
		for ( var i=start_offset; i<=end_offset; i++ )
		{
			for ( var ii=0; ii<num_views; ii++ )
			{
				this.row_id_map[ii][i][2] = (this.row_id_map[ii][i][2] & (65535-ac.chap.ROWSTATE_SELECTION));
			}
		}
		range_from = [this.selection.startPosition[0], this.selection.startPosition[1]];
	}
	if ( (range_to[0] < range_from[0]) || (range_to[0] == range_from[0] && range_to[1] < range_from[1]) )
	{
		range_from[1]--;
	}
	else
	{
		range_to[1]--;		
	}
	this.selection.endPosition = [range_to[0], range_to[1]];
	if ( (range_to[0] < range_from[0]) || (range_to[0] == range_from[0] && range_to[1] < range_from[1]) )
	{
		var r = range_from;
		range_from = range_to;
		range_to = r;
	}
	// console.log('%o - %o', range_from, range_to);
	for ( var i=0; i<num_views; i++ )
	{
		for ( var ii=range_from[0]; ii<=range_to[0]; ii++ )
		{
//			this.row_id_map[i][ii][1] = false;
			this.row_id_map[i][ii][2] = ac.chap.ROWSTATE_SELECTION;
			var range = [0, this.char_map[ii].length];
			if ( range_from[0] == ii )
			{
				range[0] = range_from[1];
			}
			if ( range_to[0] == ii )
			{
				range[1] = range_to[1];
			}
			this.row_id_map[i][ii][5][0] = range[0];
			this.row_id_map[i][ii][5][1] = range[1];
		}
	}
	// console.log('SELECTION ranges: %o - %o', this.selection.startPosition, this.selection.endPosition);
	// console.log('CARET: %o', this.caret.position);
}

ac.chap.Window.prototype.removeSelection = function(rowIndex, colIndex)
{
	var num_views = this.views.length;
	var num_rows = this.char_map.length;
	var changed = false;
	for ( var i=0; i<num_views; i++ )
	{
		for ( var ii=0; ii<num_rows; ii++ )
		{
			var row_state = this.row_id_map[i][ii][2];
			if ( ac.chap.ROWSTATE_SELECTION == (row_state & ac.chap.ROWSTATE_SELECTION) )
			{
				this.row_id_map[i][ii][1] = false;
				this.row_id_map[i][ii][2] = row_state & (65535-ac.chap.ROWSTATE_SELECTION);
				this.row_id_map[i][ii][5][0] = null;
				this.row_id_map[i][ii][5][1] = null;
				changed = true;
			}
		}
	}
	this.selection = null;
	return changed;
}

ac.chap.Window.prototype.getSelection = function()
{
	var selection_text = '';
	if ( null != this.selection )
	{
		var range_from = [this.selection.startPosition[0], this.selection.startPosition[1]];
		var range_to = [this.selection.endPosition[0], this.selection.endPosition[1]];
		if ( (range_to[0] < range_from[0]) || (range_to[0] == range_from[0] && range_to[1] < range_from[1]) )
		{
			var r = range_from;
			range_from = range_to;
			range_to = r;			
		}
		if ( range_from[0] == range_to[0] )
		{
			selection_text = this.char_map[range_from[0]].substring(range_from[1], range_to[1]+1);
		}
		else
		{
			selection_text = this.char_map[range_from[0]].substr(range_from[1]);
			selection_text = [].concat(selection_text, this.char_map.slice(range_from[0]+1, range_to[0]), this.char_map[range_to[0]].substr(0, range_to[1]+1)).join('\n');
		}
		// console.log('SELECTION: `%s`', selection_text.replace(/\n/g, '$'));
	}
	return selection_text;	
}

ac.chap.Window.prototype.getCaretPosition = function()
{
	return [this.caret.position[0], this.caret.position[1]];
}

ac.chap.Window.prototype.setCaretPosition = function(row, column)
{
	this.caret.position[0] = parseInt(row);
	this.caret.position[1] = parseInt(column);
}

ac.chap.Window.prototype.renderText = function(forceCompleteRedraw)
{
	var num_views = this.views.length;
	for ( var i=0; i<num_views; i++ )
	{
		this.views[i].renderText(forceCompleteRedraw);
	}
}

ac.chap.Window.prototype.renderSelection = function()
{
	var num_views = this.views.length;
	for ( var i=0; i<num_views; i++ )
	{
		this.views[i].renderSelection();
	}
}

ac.chap.Window.prototype.showCaret = function(skipScroll, whenAnimating)
{
	if (new Date().getTime() - 500 < this.state.lastKeyTimePressed)
	{
		this.state.caretPhase = 1;
	}
	var num_views = this.views.length;
	for ( var i=0; i<num_views; i++ )
	{
		if ( this.activeView == this.views[i] && null == this.selection )
		{
			this.views[i].showCaret(skipScroll?true:false);
			if (null != this.state.caretListener && !whenAnimating)
			{
				// this.state.caretListener(this.caret.position[0], this.caret.position[1]);
				var listener = this.state.caretListener;
				var r = this.caret.position[0];
				var c = this.caret.position[1];
				$runafter(30, function()
				{
					listener(r, c);
					delete listener;
				});
			}
		}
		else
		{
			this.views[i].hideCaret();
		}
	}
	this.state.caretPhase = ++this.state.caretPhase & 1;
}

ac.chap.Window.prototype.hideCaret = function()
{
	var num_views = this.views.length;
	for ( var i=0; i<num_views; i++ )
	{
		this.views[i].hideCaret();
	}
}

ac.chap.Window.prototype.captureEditAreaClick = function(evt, view)
{
	evt.stop();
	this.hideInteractiveSearch();
	this.activeView = view;
	
	var pos = evt.$.abspos();
	var offset_x = evt.pageX - pos.x;
	var offset_y = evt.pageY - pos.y + ($__tune.isGecko ? view.nodeScrollArea.$.scrollTop : 0);
	var target  = evt.$.$;
	var used = false;
	while ( null != target && target.tagName && 'pre' != target.tagName.toLowerCase() )
	{
		if ( !$__tune.isOpera )
		{
			offset_x += target.offsetLeft;
			offset_y += target.offsetTop;
			used = true;
		}
		target = target.parentNode;
	}
	var row_index = this.char_map.length-1;
	if ( target.tagName && used )
	{
		offset_y -= target.offsetTop;
	}
	if ( null == target )
	{
		return;
	}
	
	var row_index = target.getAttribute ? parseInt(target.getAttribute('row-index')) : row_index;
	var num_subrows = 1;
	var col_index = 0;
	if ( view.options.wordWrap )
	{
		num_subrows = 1 + Math.floor(offset_y/view.options.rowHeight);
//		console.log(num_subrows);
	}
	var i = 0;
	var num_chars = this.char_map[row_index].length;
	var mid_char_w = view.getRenderedCharDimension()[0] / 2;
	var subrow = 0;
	var subrow_offset = 0;
//	offset_y -=
//	console.log('offsets [%s x %s]', offset_x, offset_y);
	var w = view.options.colWidth * view.numCols;
	while ( i<num_chars )
	{
		var dim = view.getRenderedStringDimension(row_index, 0, i);
		if ( (Math.floor(dim[0]/w) + 1) == num_subrows )
		{
			if ( dim[0] % w > offset_x - mid_char_w )
			{
				col_index = i;
				break;
			}
			else if ( w - mid_char_w < offset_x && (dim[0] % w + 2*mid_char_w >= offset_x))
			{
				// last char
				col_index = i+1;
				break;
			}			
		}
		i++;
	}
//	console.log('%s, %s', row_index, col_index);
	if ( i == num_chars )
	{
		col_index = i;
	}
//	console.log('CHANGE CARET to: %s', col_index);
	this.hideCaret();
	if ( evt.shiftKey )
	{
		this.addSelection([row_index, col_index], this.state.lastCaretPosition);
		this.renderText();
	}
	else
	{
		this.setCaretPosition(row_index, col_index);
		this.state.caretPhase = 1;
		view.showCaret();
		this.state.lastCaretPosition = [this.caret.position[0], this.caret.position[1]];
		if ( this.removeSelection() )
		{
			this.renderText();
		}
	}
	ac.chap.setActiveComponent(this);
}

ac.chap.Window.prototype.foldingize = function()
{
	var startRowIndex = 0;

	var source_rows = this.char_map.slice(startRowIndex);

	// creating folding info
	var n = source_rows.length;
	var foldings = [];
	var foldings_index = -1;
	for ( var i=0; i<this.language.foldingStartMarkers.length; i++ )
	{
		var re_start = this.language.foldingStartMarkers[i];
		var re_parity = this.language.foldingParityMarkers[i];
		var re_stop = this.language.foldingStopMarkers[i];


		for ( var ii=startRowIndex; ii<n; ii++ )
		{
			if ( re_start.test(this.char_map[ii]) )
			{
//				console.log('START: #%s', ii);
				foldings.push([ii, -1, 0]);
				foldings_index = foldings.length-1;
			}

			if ( null != re_parity && re_parity.exec(this.char_map[ii]) )
			{
//				console.log('PARITY: #%s', ii);
				var ix = foldings_index;
				while ( 0 <= ix )
				{
					if ( -1 == foldings[ix][1] )
					{
						foldings[ix][2]++;
						break;
					}
					ix--;
				}
//				foldings[foldings_index][2]++;
			}

			if ( re_stop.exec(this.char_map[ii]) )
			{
//				console.log('STOP: #%s', ii);
				var ix = foldings_index;
				while ( 0 <= ix )
				{
					if ( -1 == foldings[ix][1] )
					{
						foldings[ix][2]--;
						if ( 0 == foldings[ix][2] )
						{
							foldings[ix][1] = ii;							
						}
						break;
					}
					ix--;
				}
			}
		}
	}

//	console.log('%o', foldings);
	n = foldings.length;
	for ( i=0; i<n; i++ )
	{
		var fold = foldings[i];
		if ( fold[0] == fold[1] || -1 == fold[1] )
		{
			continue;
		}
		for ( var ii=0; ii<this.views.length; ii++ )
		{
			this.row_id_map[ii][fold[0]][2] |= ac.chap.ROWSTATE_FOLD_START;
			this.row_id_map[ii][fold[0]][3][0] = 0;
			this.row_id_map[ii][fold[0]][3][1] = fold[1];
			this.row_id_map[ii][fold[1]][2] |= ac.chap.ROWSTATE_FOLD_STOP;
			this.row_id_map[ii][fold[1]][3][0] = 0
			this.row_id_map[ii][fold[1]][3][1] = fold[0];
		}
	}	
}

ac.chap.Window.prototype.tokenize = function()
{
	if ( !this.options.syntaxHighlightingEnabled )
	{
		return;
	}
	var startRowIndex = 0;
	this.foldingize();
	var source = this.char_map.slice(startRowIndex).join('\n');

	var total_rows = this.char_map.length;
	var syntax_map = [];

	var ml_start = this.language.multiRowCommentStartMarker;
	var ml_end = this.language.multiRowCommentEndMarker;
//	console.log(ml_end);
	var sq = this.language.singleQuoteStringMarker;	
	var sq_exception = this.language.singleQuoteStringMarkerException;
	var dq = this.language.doubleQuoteStringMarker;
	var dq_exception = this.language.doubleQuoteStringMarkerException;
	var sl_markers = this.language.singleRowCommentStartMarkers;
	
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
		[ac.chap.TOKEN_MULTIROW_COMMENT, -1, ml_start, ml_end, ''],
		[ac.chap.TOKEN_SINGLE_QUOTED, -1, sq, sq, sq_exception],
		[ac.chap.TOKEN_DOUBLE_QUOTED, -1, dq, dq, dq_exception]
	];
	for ( i=0; i<sl_markers.length; i++ )
	{
		ixs.push([ac.chap.TOKEN_SINGLEROW_COMMENT, -1, sl_markers[i], '\n', '']);
	}

	while ( true )
	{
		if ( '' != ml_start )
		{
			ixs[0][1] = source.indexOf(ml_start);
		}
		if ( '' != sq )
		{
			ixs[1][1] = source.indexOf(sq);
		}
		if ( '' != dq )
		{
			ixs[2][1] = source.indexOf(dq);
		}
		for ( i=0; i<sl_markers.length; i++ )
		{
			if ( '' != sl_markers[i] )
			{
				ixs[3+i][1] = source.indexOf(sl_markers[i]);
			}
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
		var sub_source = source;
		var end_index_offset = 0;
		var except = false;
		while ( 0 < end_index && '' != ixs[found_marker_index][4] && ixs[found_marker_index][4] == sub_source.charAt(end_index-end_marker_len) )
		{
			except = true;
			end_index_offset += end_index + end_marker_len;
			sub_source = sub_source.substr(end_index+end_marker_len);
			end_index = sub_source.indexOf(ixs[found_marker_index][3]);
		}
		if ( except && -1 != end_index )
		{
			end_index += end_index_offset;
		}
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

	var n = Math.max(syntax_map.length, this.syntax_map.length);
	for ( i=0; i<n; i++ )
	{
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
			// marking row as changed
			if (this.row_id_map[ii] && this.row_id_map[ii][i])
			{
				this.row_id_map[ii][i][1] = false;
			}
		}
		// console.log('%s marked as changed.', i);
	}
	
	delete syntax_map;
	delete fillRowTokens;
}

ac.chap.Window.prototype.expandFolding = function(rowIndex)
{
	var n = this.views.length;
	for ( var i=0; i<n; i++ )
	{
		this.views[i].expandFolding(rowIndex);
	}
}

ac.chap.Window.prototype.insertIntoCharacterMap = function(source, atRow, atColumn, skipLog, userId)
{
	if ( $notset(atRow) )
	{
		atRow = this.caret.position[0];
	}
	if ( $notset(atColumn) )
	{
		atColumn = this.caret.position[1];
	}
	userId = userId|this.userId;

	if ( !skipLog && !this.state.transactionLogStopped )
	{
		this.transaction_log.push(ac.chap.TRANSLOG_TYPE_INSERT);
		this.transaction_log.push([atRow, atColumn, userId]);
		this.transaction_log.push(source);
	}
	
	var num_existing_rows = this.char_map.length;
	var new_rows = source.split('\n');
	var num_new_rows = new_rows.length;
	var num_views = this.views.length;
//	console.log('NUMVIEWS: %s', num_views);
    if ( this.hasTransactionListener() )
    {
        var me = this;
        setTimeout(function()
        {
            me.state.transactionListener[0](me, ac.chap.TRANSLOG_TYPE_INSERT, userId, atRow, atColumn, num_existing_rows, num_new_rows, source);
            me = null;
        }, this.state.transactionListener[1]);
    }
	
	var i = ii = 0;
	
	if ( 'undefined' == typeof this.char_map[atRow] )
	{
		this.char_map = this.char_map.concat(new_rows);
		for ( i=0; i<num_new_rows; i++ )
		{
			for ( ii=0; ii<num_views; ii++ )
			{
				this.row_id_map[ii][atRow+i] = [this.row_id_sequence, false, ac.chap.ROWSTATE_NONE, [], [], []];
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
		for ( i=0; i<num_views; i++ )
		{
			this.row_id_map[i][atRow][1] = false;
		}
		if ( 1 == num_new_rows )
		{
			this.char_map[atRow] = this.char_map[atRow].substr(0, atColumn) + new_rows[0] + this.char_map[atRow].substr(atColumn);
		}
		else
		{
			var end_snippet = this.char_map[atRow].substr(atColumn);
			// console.log('end snippet: `%s`', end_snippet);
			this.char_map[atRow] = this.char_map[atRow].substr(0, atColumn) + new_rows[0];
			var last_row_index = atRow + (num_new_rows-1);
			this.char_map = [].concat(this.char_map.slice(0, atRow+1), new_rows.slice(1), this.char_map.slice(atRow+1));
			var ins_map = [];
			var start_sequence = this.row_id_sequence;
			for ( i=0; i<num_views; i++ )
			{
				ins_map[i] = [];
				start_sequence = this.row_id_sequence;
				for ( ii=1; ii<num_new_rows; ii++ )
				{
					ins_map[i][ii-1] = [start_sequence++, false, ac.chap.ROWSTATE_NONE, [], [], []];
				}
			}
			this.row_id_sequence = start_sequence;
			for ( i=0; i<num_views; i++ )
			{			
				this.row_id_map[i] = [].concat(this.row_id_map[i].slice(0, atRow+1), ins_map[i], this.row_id_map[i].slice(atRow+1));
			}
			this.char_map[last_row_index] += end_snippet;
			for ( i=0; i<num_views; i++ )
			{
				this.row_id_map[i][last_row_index][1] = false;	
			}
		}
	}
	// console.log('%o', this.char_map);
	if ( 1 < num_new_rows )
	{
		for ( i=0; i<num_views; i++ )
		{
			this.views[i].numVisibleRows += (num_new_rows-1);
		}		
	}
}

ac.chap.Window.prototype.removeFromCharacterMap = function(startRow, startCol, endRow, endCol, skipLog, userId)
{
	if ( 'undefined' == typeof endRow )
	{
		endRow = startRow;
		endCol = startCol+1;
	}
	userId = userId|this.userId;

	var source = '';
	var i = 0;
	var num_views = this.views.length;
	if ( startRow == endRow )
	{
		source = this.char_map[startRow].substring(startCol, endCol);
		this.char_map[startRow] = this.char_map[startRow].substr(0, startCol)+this.char_map[startRow].substr(endCol);
		for ( i=0; i<num_views; i++ )
		{			
			this.row_id_map[i][startRow][1] = false;
		}
	}
	else
	{
		source = this.char_map[startRow].substr(startCol) + '\n'+this.char_map.slice(startRow+1, endRow).join('\n') + '\n' + this.char_map[endRow].substr(0, endCol);

		this.char_map[startRow] = this.char_map[startRow].substr(0, startCol)+this.char_map[endRow].substr(endCol);
		this.char_map = [].concat(this.char_map.slice(0, startRow+1), this.char_map.slice(endRow+1));
		for ( i=0; i<num_views; i++ )
		{
			this.row_id_map[i][startRow][1] = false;
			this.row_id_map[i] = [].concat(this.row_id_map[i].slice(0, startRow), this.row_id_map[i].slice(endRow));
			if ( startRow < this.row_id_map[i].length-1 )
			{
				this.row_id_map[i][startRow+1][1] = false;
			}
			this.views[i].numVisibleRows -= (endRow-startRow);
		}
	}
	if ( !skipLog && !this.state.transactionLogStopped )
	{
		this.transaction_log.push(ac.chap.TRANSLOG_TYPE_REMOVE);
		this.transaction_log.push([startRow, startCol, endRow, endCol, userId|this.userId]);
		this.transaction_log.push(source);
	}
    if ( this.hasTransactionListener() )
    {
        var me = this;
        setTimeout(function()
        {
            me.state.transactionListener[0](me, ac.chap.TRANSLOG_TYPE_REMOVE, userId, startRow, startCol, endRow, endCol, source);
            me = null;
        }, this.state.transactionListener[1]);
    }
	return source;
}


if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}

