/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Chap - Text Editing Component widget - Settings file
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 * NOTE: snippets code initialization/parsing/running *IS* hard wizardry code. 
 */

if ( 'undefined' == typeof ac )
{
	var ac = {chap:{}};
}


$class('ac.chap.KeyMap',
{
	construct:function()
	{
		this.definition = {};
		this.isMac = true;
		this.wordCompleteCache = null;
		this.snippetCompleteCache = null;
		this.searchKeyword = '';
		this.initDefinition();
	}
});

ac.chap.KeyMap.prototype.initDefinition = function()
{
}

ac.chap.KeyMap.prototype.importCommands = function(commands)
{
	var n = commands.length;
	for ( var i=0; i<n; i++ )
	{
		var command = commands[i];
		if ( $isset(command.key_activation) )
		{
//			console.debug('Compiling key `?` for snippet #?'.embed(snippet.key_activation, i));
			this.compile("KEY: ?\ncustom(action:'RunCommand', commandIndex:?)\n".embed(command.key_activation, i));
		}
	}
}

ac.chap.KeyMap.prototype.importSnippets = function(snippets)
{
	var n = snippets.length;
	for ( var i=0; i<n; i++ )
	{
		var snippet = snippets[i];
		if ( $isset(snippet.key_activation) )
		{
//			console.debug('Compiling key `?` for snippet #?'.embed(snippet.key_activation, i));
			this.compile("KEY: ?\ncustom(action:'RunSnippet', snippetIndex:?)\n".embed(snippet.key_activation, i));
		}
	}
//	console.debug('%o',this.definition);
}

ac.chap.KeyMap.prototype.action_NotDefined = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	console.warn('There is no custom action defined for key code: %s and control keys mask: %s.', keyCode, controlKeysMask);
}

ac.chap.KeyMap.prototype.action_RunCommand = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	var command = $getdef(component.commands[params.commandIndex], null);
	if ( null == command )
	{
		console.warn('There is no command at index `%s`.', params.commandIndex);
		return;
	}
	return component.runCommand(keyCode, controlKeysMask, caretRow, caretCol, command, params);
}

ac.chap.KeyMap.prototype.action_RunSnippet = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	var snippet = $getdef(component.snippets[params.snippetIndex], null);
	if ( null == snippet )
	{
		console.warn('There is no snippet at index `%s`.', params.snippetIndex);
		return;
	}
	return this.snippetInit(snippet, component, caretRow, caretCol, true);
}

ac.chap.KeyMap.prototype.action_RunVirtualSnippet = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	var result = this.snippetInit(params.snippet, component, caretRow, caretCol, true);
	return result;
}


ac.chap.KeyMap.prototype.action_ToggleBookmark = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	component.toggleBookmark(caretRow);
	$runafter(100, function(){component.renderText()});
	return 0;
}

ac.chap.KeyMap.prototype.action_GoToBookmark = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	component.scrollToBookmark(caretRow, params['direction']);
	return 0;
}

ac.chap.KeyMap.prototype.action_WordComplete = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	if ( !component.language.wordDelimiter.test(component.getCharAt(caretRow, caretCol-1)) )
	{
		// no word char before caret
		return;
	}
	var wcc = this.wordCompleteCache;
	if ( !wcc )
	{
		wcc = {position:[-1,-1], results:[], index:-1};
	}
	var proceed_complete = false;
	if ( wcc.position[0] != caretRow || wcc.position[1] != caretCol )
	{
		// new search
		var max_words = 300;
		var words_prev = component.getWordAt(caretRow, caretCol, -max_words-1);
		var words_next = component.getWordAt(caretRow, caretCol, max_words);
		var looking_for = words_prev[0];
		var looking_for_len = looking_for.length;
//		console.log('new search for: %s', looking_for);
		var found_words = [looking_for];
		var found_words_index = '';
		for ( var i=0; i<max_words; i++ )
		{
			if ( words_prev[i+1] && words_prev[i+1].length > looking_for_len && words_prev[i+1].substr(0, looking_for_len) == looking_for )
			{
				if ( -1 == found_words_index.indexOf(' '+words_prev[i+1]) )
				{
					found_words.push(words_prev[i+1]);
					found_words_index += ' '+words_prev[i+1];
				}
			}
			if ( words_next[i] && words_next[i].length > looking_for_len && words_next[i].substr(0, looking_for_len) == looking_for )
			{
				if ( -1 == found_words_index.indexOf(' '+words_next[i]) )
				{					
					found_words.push(words_next[i]);
					found_words_index += ' '+words_next[i];
				}
			}
		}
		if ( 1 < found_words.length )
		{
//			console.log('results found: %o', found_words);
			wcc.results = found_words;
			wcc.index = 0;
			proceed_complete = true;
		}
	}
	else
	{
		proceed_complete = true;
	}
	var num_results = wcc.results.length;
	if ( proceed_complete && 0 < num_results )
	{
		var index = wcc.index;
		index += params.direction ? 1 : -1;
		if ( num_results <= index )
		{
			index = 0;
		}
		else if ( 0 > index )
		{
			index = num_results-1;
		}
//		console.log('n:%s i:%s', num_results, index);
		// let's not add the following operation to the transaction/undo log
		component.stopTransactionLog();
		component.runAction(ac.chap.ACTION_CARET, {move:'prev_word'});
		component.runAction(ac.chap.ACTION_SELECTION, {add:true});
		component.runAction(ac.chap.ACTION_DELETE, {character:false});
		component.runAction(ac.chap.ACTION_INSERT, {string:wcc.results[index]});
		component.startTransactionLog();
		wcc.index = index;
		wcc.position = [component.caret.position[0], component.caret.position[1]];
	}
	else
	{
		wcc.results = [];
	}
	this.wordCompleteCache = wcc;
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;
}

ac.chap.KeyMap.prototype.getAffectedRows = function(component, caretRow)
{
	var from_row = caretRow;
	var to_row = caretRow;
	if (null != component.selection)
	{
		var start_pos = component.selection.startPosition[0];
		var end_pos = component.selection.endPosition[0];
		if (-1 == component.selection.endPosition[1])
		{
			end_pos--;
		}
		from_row = Math.min(start_pos, end_pos);
		to_row = Math.max(start_pos, end_pos);
	}
	return [from_row, to_row];
}

ac.chap.KeyMap.prototype.action_Indent = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	var affected_rows = this.getAffectedRows(component, caretRow);
	var tab = component.getTabelator();
	for (var i=affected_rows[0]; i<=affected_rows[1]; i++)
	{
		if ('right' == params.direction)
		{
			component.insertIntoCharacterMap(tab, i, 0);			
		}
		else
		{
			var row = component.char_map[i];
			var index = 0;
			while (('\t' == row.charAt(index) || ' ' == row.charAt(index)) && (row.length > index) && (tab.length > index)) index++;
			if (0 < index)
			{
				component.removeFromCharacterMap(i, 0, i, index);
			}
		}
	}
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT | ac.chap.ACTION_RES_SELECTIONCHANGED;	
}

ac.chap.KeyMap.prototype.action_Comment = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	if (!component.language)
	{
		return 0;
	}
	var markers = component.language.singleRowCommentStartMarkers;
	if (0 == markers.length)
	{
		return 0;
	}
	var marker = markers[0];
	var tab = component.getTabelator();
	var affected_rows = this.getAffectedRows(component, caretRow);
	var tab = component.getTabelator();
	var prepend_text = marker + ' ';
	for (var i=affected_rows[0]; i<=affected_rows[1]; i++)
	{
		var row = component.char_map[i];
		var index = row.indexOf(marker);
		if (-1 != index && 0 == row.substring(0, index).replace(tab, '').replace(' ', ''))
		{
			// was commented
			component.removeFromCharacterMap(i, 0, i, index+marker.length);
		}
		else
		{
			// will be commented
			component.insertIntoCharacterMap(marker, i, 0);
		}
	}
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT | ac.chap.ACTION_RES_SELECTIONCHANGED;	
}

ac.chap.KeyMap.prototype.action_RuntimeOption = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	component.setRuntimeOption(params['key'], params['value']);
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT | ac.chap.ACTION_RES_SELECTIONCHANGED;	
}

ac.chap.KeyMap.prototype.action_SearchInteractive = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	component.showInteractiveSearch();
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_SELECTIONCHANGED;
}

ac.chap.KeyMap.prototype.action_SetSearchKeyword = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	if (params['keyword'])
	{
		this.searchKeyword = params['keyword'];
		return 0;
	}
	if (component.selection && component.selection.startPosition[0] == component.selection.endPosition[0])
	{
		this.searchKeyword = component.getSelection();
		return ac.chap.ACTION_RES_SELECTIONCHANGED;
	}
	return 0;
}

ac.chap.KeyMap.prototype.action_SearchKeyword = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	if ('' == this.searchKeyword)
	{
		return 0;
	}
	row_index = caretRow;
	var index = 0;
	var search_down = 'down' == params['direction'];
	do
	{
		var row = component.char_map[row_index];
		var offset = 0;
		console.log(ac.chap.activeComponent.activeView);
		if (row_index == caretRow)
		{
			if (search_down)
			{
				// if (row.substring(caretCol, this.searchKeyword.length) == this.searchKeyword)
				// {
				// 	// offset = this.searchKeyword.length;
				// }
				row = row.substr(caretCol)
				offset += caretCol;
			}
			else
			{
				if (row.substring(caretCol-this.searchKeyword.length, caretCol))
				{
					offset = this.searchKeyword.length;
				}
				row = row.substring(0, caretCol - offset);
				offset = 0;
			}
		}
		index = search_down ? row.indexOf(this.searchKeyword) : row.lastIndexOf(this.searchKeyword);
		if (-1 != index)
		{
			index += offset;
			component.runAction(ac.chap.ACTION_SELECTION, {remove:true});
			component.runAction(ac.chap.ACTION_CARET, {moveTo:[row_index, index]});
			component.runAction(ac.chap.ACTION_CARET, {store:true});
			component.runAction(ac.chap.ACTION_CARET, {moveTo:[row_index, index+this.searchKeyword.length]});
			component.runAction(ac.chap.ACTION_SELECTION, {add:true});
			return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_SELECTIONCHANGED | ac.chap.ACTION_RES_SCROLLTOCARET;
		}
		row_index += search_down ? 1 : -1;
		if (search_down && row_index == component.char_map.length)
		{
			row_index = 0;
		}
		else if (!search_down && -1 == row_index)
		{
			row_index = component.char_map.length-1;
		}
	}
	while (caretRow != row_index);
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_SELECTIONCHANGED;
}

ac.chap.KeyMap.prototype.action_SmartIndent = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	// console.log(params);
	var line = component.getLineAt(caretRow);
	var m = params['indent_tab_when_ends'] ? line.match(/^([ \t]*)(.*)$/) : line.match(/^([ \t]*)([^ \t]*)/);
	// console.log(m);
	var prepend_text = m[1];
	if (params['indent_tab_when_ends'] || params['indent_tab_when_starts'])
	{
		m[2] = m[2].trim();
		var indent_when_values = params['indent_tab_when_ends'] ? params['indent_tab_when_ends'].split(' ') : params['indent_tab_when_starts'].split(' ');
		for (var i=0; i<indent_when_values.length; i++)
		{
			if ((params['indent_tab_when_ends'] && indent_when_values[i] == m[2].substr(m[2].length-indent_when_values[i].length)) || (params['indent_tab_when_starts'] && indent_when_values[i] == m[2].substr(0, indent_when_values[i].length)))
			{
				prepend_text += component.getTabelator();
				break;
			}
		}
	}
	// console.log(prepend_text);
	if (params['split_line'])
	{
		component.runAction(ac.chap.ACTION_INSERT, {row:true});		
	}
	else
	{
		component.runAction(ac.chap.ACTION_CARET, {move:'row_end'});
		prepend_text = (params['set_char_at_end'] ? params['set_char_at_end'] : '') + '\n' + prepend_text;
	}
	// console.log('prepend_text: %s', prepend_text);
	component.runAction(ac.chap.ACTION_INSERT, {string:prepend_text});
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;
}

ac.chap.KeyMap.prototype.action_SmartUnindent = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	if (!params['starts_with'])
	{
		console.warn('Missing starts_with parameter for SmartUnindent.');
		return 0;
	}
	if (!params['ends_with'])
	{
		console.warn('Missing ends_with parameter for SmartUnindent.');
		return 0;
	}
	// console.log(params);
	var line = component.getLineAt(caretRow);
	var starts_with = params['starts_with'].split(' ');
	var ends_with = params['ends_with'].split(' ');
	if (starts_with.length != ends_with.length)
	{
		console.warn('Non-matching start and end tokens for SmartUnindent.');
		return 0;
	}
	var trim_line = line.trim() + String.fromCharCode(keyCode);
	var proceed = false;
	for (var i=0; i<ends_with.length; i++)
	{
		if (ends_with[i] == trim_line)
		{
			proceed = true;
			break;
		}				
	}
	var prepend_text = null;
	if (proceed)
	{
		var row = caretRow - 1;
		var need_nth_match = 0;
		var match_from_end = 'end' == params['match_from'];
		while (0 <= row && null == prepend_text)
		{
			line = component.getLineAt(row);
			var m = match_from_end ? line.match(/^([ \t]*)(.*)$/) : line.match(/([ \t]*)([^ \t]*)/);
			m[2] = m[2].trim();
			
			
			for (i=0; i<ends_with.length; i++)
			{
				if ((match_from_end && ends_with[i] == m[2].substr(m[2].length-ends_with[i].length)) || (!match_from_end && ends_with[i] == m[2].substr(0, ends_with[i].length)))
				{
					need_nth_match++;
					trim_line = line.trim();
					break;
				}				
			}
			for (i=0; i<starts_with.length; i++)
			{
				if ((match_from_end && starts_with[i] == m[2].substr(m[2].length-starts_with[i].length)) || (!match_from_end && starts_with[i] == m[2].substr(0, starts_with[i].length)))
				{
					if (0 == need_nth_match)
					{
						prepend_text = m[1] + trim_line;
					}
					need_nth_match--;
					break;
				}				
			}
			// console.log('row: %i, %o', row, m);
			row--;
		}
	}
	// console.log(prepend_text);
	if (null != prepend_text)
	{
		component.runAction(ac.chap.ACTION_CARET, {move:'row_start'});
		component.runAction(ac.chap.ACTION_SELECTION, {add:true});
		component.runAction(ac.chap.ACTION_DELETE, {'char':true});
		component.runAction(ac.chap.ACTION_INSERT, {string:prepend_text});
		component.runAction(ac.chap.ACTION_CARET, {move:'row_end'});
	}
	else
	{
		component.runAction(ac.chap.ACTION_INSERT, {string:String.fromCharCode(keyCode)});
	}
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;
}

ac.chap.KeyMap.prototype.action_AutoComplete = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	var selected_text = component.getSelection();
	var inserted_text = params.text;
	if ('' != selected_text)
	{
		component.runAction(ac.chap.ACTION_DELETE, {character:true});
		if (params['use_selection'])
		{
			inserted_text = selected_text + params.text;
		}
	}
	component.runAction(ac.chap.ACTION_INSERT, {string:String.fromCharCode(keyCode)});
	component.runAction(ac.chap.ACTION_INSERT, {string:inserted_text, skipCaretChange:'' == selected_text});
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;
}

ac.chap.KeyMap.prototype.action_SnippetComplete = function(keyCode, controlKeysMask, caretRow, caretCol, component, params)
{
	var scc = this.snippetCompleteCache;
	var proceed_as_normal_tab = null == scc;
	var selection_changed = false;
	var tab_activation = null;

	if ( proceed_as_normal_tab )
	{
		if ( null != component.selection )
		{
			tab_activation = '';
		}
		else
		{
			if ( component.language.wordDelimiter.test(component.getCharAt(caretRow, caretCol-1)) )
			{
				tab_activation = component.getWordAt(caretRow, caretCol, -1);
			}
		}
	}

	if ( proceed_as_normal_tab && null != tab_activation )
	{
//		console.log(tab_activation);
		var snippets = component.snippets;
//		console.log('%o', snippets);
		var found_snippets = [];
		for ( var i=0; i<snippets.length; i++ )
		{
			var snippet = snippets[i];
			if ( snippet.tab_activation == tab_activation )
			{
				found_snippets.push(snippet);
			}
		}
//		console.log(found_snippets);
		if ( 0 < found_snippets.length)
		{
			return this.snippetInit(found_snippets[0], component, caretRow, caretCol, ''==tab_activation, tab_activation);
		}
	}
	if ( proceed_as_normal_tab )
	{
		if ( null != scc )
		{
			component.removeActionListener(scc.callbackIndex);
			component.removeSelection();
		}
		component.runAction(ac.chap.ACTION_INSERT, {string:'\t'});
	}
	else
	{
		// changing to next tabstop
		// stopping current listener
		component.removeActionListener(scc.callbackIndex);
		component.removeSelection();
		if ( 0 != scc.activeTabStopIndex )
		{
			// there is another possible tabstop
			var found = false;
			for ( var i=scc.activeTabStopIndex+1; i<scc.tabstops.length; i++ )
			{
				if ( scc.tabstops[i] )
				{
					scc.activeTabStopIndex = i;
					found = true;
					break;
				}
			}
			if ( !found )
			{
				// let's activate last $0 tabstop
				scc.activeTabStopIndex = 0;
			}
			// move caret to the tabstop position
			var tabstop = scc.tabstops[scc.activeTabStopIndex];
//			console.log('new active #%s', scc.activeTabStopIndex);
			for ( var tab_id in scc.tabstops )
			{
				var placeholder = scc.tabstops[tab_id];
//				console.log('#%s : %o', tab_id, placeholder);
			}
			
			component.runAction(ac.chap.ACTION_SELECTION, {remove:true});
			component.runAction(ac.chap.ACTION_CARET, {moveTo:scc.insertCaretPosition});
			component.runAction(ac.chap.ACTION_CARET, {moveBy:'column', value:tabstop[2]-(scc.wasSelection?0:scc.tabActivation.length)});

			if ( '' != tabstop[1] )
			{
				component.runAction(ac.chap.ACTION_CARET, {store:true});
				component.runAction(ac.chap.ACTION_CARET, {moveBy:'column', value:tabstop[1].length});
				component.runAction(ac.chap.ACTION_SELECTION, {add:true});
				selection_changed = true;
			}
			
			if ( 0 != scc.activeTabStopIndex )
			{
				scc.firstInitialized = true;
				// adding new listener
				scc.callbackIndex = component.addActionListener(ac.chap.ACTION_LISTENER_BOTH, this, this.snippetCompleteActionListener);
//				console.log('activating next tabstop: %s', scc.activeTabStopIndex);
			}
			else
			{
//				console.log('END at $0');
				scc = null;
			}
			this.snippetCompleteCache = scc;
		}
	}
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT | (selection_changed ? ac.chap.ACTION_RES_SELECTIONCHANGED : 0);
}

ac.chap.KeyMap.prototype.snippetInit = function(snippet, component, caretRow, caretCol, wasSelection, tabActivation)
{
	tabActivation = tabActivation || '';
	var code = snippet.code;
	var code_chunks = [];
	var re = '';
	var m = [];
	var selection_changed = false;

	// [preprocessing - indentation]
	var indent_line = component.char_map[component.getCaretPosition()[0]];
	var indent_string = indent_line.match(/[\s]*/)[0];
	code = code.replace(/\n/g, "\n" + indent_string);

	// [preprocessing - escape]
	code = code.replace(/\\\$/g, '\0');

	// [preprocessing - simple variables]
	re = /(^|[^\\])(\${1,2})([a-zA-Z][\w_\-\+]*)/;
	while ( true )
	{
		m = re.exec(code);
		if ( null == m )
		{
			break;
		}
		var is_escaped = 2 == m[2].length;
		var var_name = m[3];
		var value = component.getVariableValue(var_name);
//debug		value = "'"+value+"\n'";
		if ( is_escaped )
		{
			value = value.replace(/'/g, "\\'").replace(/\n/g, "\\n");
		}
//		console.log('found %s = %s', var_name, value);
		code = code.substr(0, m.index+m[1].length)+value+code.substr(m.index+m[0].length);
	}

	// [preprocessing - variables with default values]
	re = /(^|[^\\])(\${1,2})\{([a-zA-Z][\w_\-\+]*)\:([^\}]*)\}/;
	while ( true )
	{
		m = re.exec(code);
		if ( null == m )
		{
			break;
		}
		var is_escaped = 2 == m[2].length;		
		var var_name = m[3];
		var default_value = m[4];
		var value = component.getVariableValue(var_name, default_value);
//debug		value = "'"+value+"\n'";
		if ( is_escaped )
		{
			value = value.replace(/'/g, "\\'").replace(/\n/g, "\\n");
		}
//		console.log('found %s (def:%s) = %s', var_name, default_value, value);
		code = code.substr(0, m.index+m[1].length)+value+code.substr(m.index+m[0].length);
	}
	
	// [preprocessing - variables with regular transformations]
	re = /(^|[^\\])(\${1,2})\{([a-zA-Z][\w_\-\+]*)\/([^\/]*)\/([^\/]*)\/([^\}]*)\}/;
	while ( true )
	{
		m = re.exec(code);
		if ( null == m )
		{
			break;
		}
		var is_escaped = 2 == m[2].length;		
		var var_name = m[3];
		var pattern = m[4];
		var replacement = m[5];
		var options = m[6];
		var value = component.getVariableValue(var_name);
//		console.log('found %s (pattern:%s  repl:%s  opt:%s) = %s', var_name, pattern, replacement, options, value);
		try
		{
			eval('value = value.replace(/?/?, "?");'.embed(pattern, options, replacement.replace(/"/g, '\"')));			
		}
		catch (e)
		{
			console.error('Snippet runtime error. Regular transformation for variable `%s`, pattern `%s`, replacement `%s` and options `%s` failed. Error: `%s`.', var_name, pattern, replacement, options, e);
		}
//		console.log('result: %s', value);
//debug		value = "'"+value+"\n'";
		if ( is_escaped )
		{
			value = value.replace(/'/g, "\\'").replace(/\n/g, "\\n");
		}
		code = code.substr(0, m.index+m[1].length)+value+code.substr(m.index+m[0].length);
	}
	
	// [preprocessing - variables with custom transformations]
	re = /(^|[^\\])(\${1,2})\{([a-zA-Z][\w_\-\+]*)\|([^\}]*)\}/;
	while ( true )
	{
		m = re.exec(code);
		if ( null == m )
		{
			break;
		}
		var is_escaped = 2 == m[2].length;
		var var_name = m[3];
		var transformation = m[4];
		var value = component.getVariableValue(var_name);
//		console.log('found %s (transformation:%s) = %s', var_name, transformation, value);
		try
		{
			if ( '.' == transformation.charAt(0) )
			{
				eval('value = value?'.embed(transformation));
			}
			else
			{
				eval('value = this.snippetTransform_?(value, component)'.embed(transformation));
			}
		}
		catch (e)
		{
			console.error('Snippet runtime error. Custom transformation for variable `%s` and transformation `%s` failed. Error: `%s`.', var_name, transformation, e);
		}
//		console.log('result: %s', value);
//debug		value = "'"+value+"\n'";
		if ( is_escaped )
		{
			value = value.replace(/'/g, "\\'").replace(/\n/g, "\\n");
		}
		code = code.substr(0, m.index+m[1].length)+value+code.substr(m.index+m[0].length);
	}	

	if ( wasSelection && null != component.selection)
	{
		component.runAction(ac.chap.ACTION_DELETE, {character:false});
		caretRow = component.caret.position[0];
		caretCol = component.caret.position[1];
	}
	
	// [executing backsticks]
	var execution_scheduled = false;

	re = /`(([^`]|\\`)*)`/;
	while ( true )
	{
		m = re.exec(code);
		if ( null == m )
		{
			break;
		}
		var exec_code = m[1];
		var code_rows = exec_code.split('\n');
		if ( 1 == code_rows )
		{
			console.warn('Snippet definition error. Backstick code too short. You might be missing declaration or there is no code body. Further execution terminated. Source: `%s`', exec_code);
			break;
		}
		var declaration = exec_code.split('\n')[0].trim();
		var body = code_rows.slice(1).join('\n');
		var output = '';
//		console.log('execute: declaration: %s body: %s', declaration, body);
		if ( '/local/javascript' == declaration )
		{
			// executing local code
//			console.log('local code');
			try
			{
				eval(body);
			}
			catch (e)
			{
				console.error('Snippet runtime error. Backstick execution of local code for declaration `%s` and source code `%s` failed. Error: `%s`.', declaration, body, e);
				break;
			}
		}
		else if ( '/remote/post' == declaration )
		{
			// executing remote post
			var action = '';
			var params = {};
			try
			{
				eval(body);
			}
			catch (e)
			{
				console.error('Snippet runtime error #01. Backstick execution of remote code for declaration `%s` and source code `%s` failed. Error: `%s`.', declaration, body, e);
				break;
			}
//			console.log('remote call');
			params.a = action;
			$rpost( params,
				function(output)
				{
					// creating virtual snippet
					var v_snippet = {};
					if ( snippet.tab_activation )
					{
						v_snippet.tab_activation = snippet.tab_activation;
					}
					if ( snippet.key_activation )
					{
						v_snippet.key_activation = snippet.key_activation;
					}
					v_snippet.code = code.substr(0, m.index)+output+code.substr(m.index+m[0].length);
					v_snippet.name = snippet.name;
//					console.log('v-snippet: %o', v_snippet);
					var result = component.runAction(ac.chap.ACTION_CUSTOM, {action:'RunVirtualSnippet', snippet:v_snippet});
					component.processActionResult(ac.chap.ACTION_RES_REDRAWTEXT==(result & ac.chap.ACTION_RES_REDRAWTEXT), ac.chap.ACTION_RES_REDRAWCARET==(result & ac.chap.ACTION_RES_REDRAWCARET));
					if ( ac.chap.ACTION_RES_SELECTIONCHANGED==(result & ac.chap.ACTION_RES_SELECTIONCHANGED) )
					{
						component.hideCaret();
					}
				},
				function(e)
				{
					console.error('Snippet runtime error #02. Backstick execution of remote code for declaration `%s` and source code `%s` failed. Error: `%s`.', declaration, body, e);
				},
				'POST', ac.chap.activeComponent.options.remoteBackendURL
			);
			execution_scheduled = true;

			if ( !wasSelection )
			{
				component.runAction(ac.chap.ACTION_CARET, {move:'prev_word'});
				component.runAction(ac.chap.ACTION_SELECTION, {add:true});
				component.runAction(ac.chap.ACTION_DELETE, {character:true});
//				selection_changed = true;
			}

			break;
		}
		code = code.substr(0, m.index)+output+code.substr(m.index+m[0].length);
	}

	if ( !execution_scheduled )
	{
		var tabstops = [];

		// [getting tabstops/placeholders]
		re = /(^|[^\\\{])\$\{(\d)\:([^\}\{]*)\}/;
		var any_change = true;
		var tab_id = 0;
		// two cycles to bypass classical recursion for nested tabstops
		while ( any_change )
		{
			any_change = false;
			code_chunks = [];
			while ( true )
			{
				m = re.exec(code);
//				console.log(code);
//				console.log(m);
				if ( null != m )
				{
					if ( m[0])
					var start_ix = m.index + m[1].length;
					tab_id = m[2];
					tabstops[tab_id] = ['ph', m[3], -1, -1];
					code_chunks.push(code.substr(0, start_ix)+'#<CHAP_PLACEHOLDER_BEGIN:'+tab_id+'>#');
					code = code.substr(start_ix+4, m[3].length)+'#<CHAP_PLACEHOLDER_END:'+tab_id+'>#'+code.substr(start_ix+m[0].length-m[1].length);
					any_change = true;
				}
				else
				{
					break;
				}
			}
			code_chunks.push(code);
			code = code_chunks.join('');
		}
		re = /#<CHAP_PLACEHOLDER_BEGIN\:(\d)>#/;
		while ( true )
		{
			m = re.exec(code)
			if ( null == m )
			{
				break;
			}
			tabstops[m[1]][1] = tabstops[m[1]][1].replace(/#<CHAP_PLACEHOLDER_(BEGIN|END):\d>#/g, '');
			tabstops[m[1]][2] = m.index;
			tabstops[m[1]][3] = tabstops[m[1]][1].length;
			code = code.substr(0, m.index)+code.substr(m.index+m[0].length).replace('#<CHAP_PLACEHOLDER_END:'+m[1]+'>#', '');
		}

		// [getting mirrors]
		re = /\{\$\{(\d)\:([^\}]*)\}\}/;
		while ( true )
		{
			m = re.exec(code)
			if ( null == m )
			{
				break;
			}
			code = code.substr(0, m.index)+m[2]+code.substr(m.index+m[0].length);
			var ix_end = code.indexOf('{$'+m[1]+'}');
			if ( -1 == ix_end )
			{
				console.error('Invalid snippet definition. Mirror `?` does not have `{$?}` mirrored location specified.'.embed(m[1], m[1]));
				break;
			}
			tabstops[m[1]] = ['mi', m[2], m.index, m[2].length, ix_end];
			if ( m.index > ix_end )
			{
				console.error('Unsupported feature. Mirror `?` should have mirrored location positioned AFTER itself.'.embed(m[1]));
			}
			code = code.substr(0, ix_end)+code.substr(ix_end+4);
		}

		// [getting tabstops]
		re = /(^|[^\\])\$(\d)/;
		while (true)
		{
			m = re.exec(code);
			if ( null == m )
			{
				break;
			}
			tab_id = m[2];
			if ( tabstops[tab_id] )
			{
				console.error('Invalid snippet definition. Tabstop `?` already defined as placeholder at position `?`. Snippet source: `?`.'.embed(tab_id, m.index, code));
				break;
			}
			var start_ix = m.index+m[1].length;
			tabstops[tab_id] = ['ts', '', start_ix, 0];
			code = code.substr(0, start_ix)+code.substr(start_ix+2);
			var offset = m[1].length + 2;
			for ( var tab_id in tabstops )
			{
				// console.log('adjusting: %s, %s < %s', tab_id, start_ix, tabstops[tab_id][2]);
				if ( 'mi' == tabstops[tab_id][0] )
				{
					if ( start_ix < tabstops[tab_id][2] )
					{
						tabstops[tab_id][2] -= offset;								
					}
					if ( start_ix < tabstops[tab_id][4] )
					{
						tabstops[tab_id][4] -= offset;								
					}
				}
				else if ( 'ph' == tabstops[tab_id][0] && start_ix < tabstops[tab_id][2] )
				{
					tabstops[tab_id][2] -= offset;
				}
			}
		}
		// $0 not defined, will be at the end of the snippet by default
		if ( !tabstops[0] )
		{
			tabstops[0] = ['ts', '', code.length, 0];
		}
	
		// [postprocessing - unescape]
		code = code.replace(/\0/g, '$');


		for ( var tab_id in tabstops )
		{
			var placeholder = tabstops[tab_id];
//			console.log('#%s : %o', tab_id, placeholder);
		}
		var scc = 
		{
			firstInitialized:true,
			insertCaretPosition:[caretRow, caretCol],
			tabstops: tabstops,
			callbackIndex: -1,
			activeTabStopIndex:tabstops[1] ? 1 : 0,
			activeTabStopRange:[],
			activeTabStopContent:'',
			activeTabStopNested:[],
			wasSelection:wasSelection,
			tabActivation:tabActivation
		}

		if ( !scc.wasSelection )
		{
			component.runAction(ac.chap.ACTION_CARET, {move:'prev_word'});
			component.runAction(ac.chap.ACTION_SELECTION, {add:true});
			component.runAction(ac.chap.ACTION_DELETE, {character:true});
		}

		var tabstop = tabstops[scc.activeTabStopIndex];
		

		component.runAction(ac.chap.ACTION_INSERT, {string:code.substr(0, tabstop[2])});
		component.runAction(ac.chap.ACTION_INSERT, {string:code.substr(tabstop[2]), skipCaretChange:true});

		// selecting default value
		var selection_changed = false;
		if ( '' != tabstop[1] )
		{
			component.runAction(ac.chap.ACTION_CARET, {store:true});
			component.runAction(ac.chap.ACTION_CARET, {moveBy:'column', value:tabstop[1].length});
			component.runAction(ac.chap.ACTION_SELECTION, {add:true});
			selection_changed = true;
		}

		if ( 0 != scc.activeTabStopIndex )
		{
			// starting action listener
			this.snippetCompleteCache = scc;					
			this.snippetCompleteCache.callbackIndex = component.addActionListener(ac.chap.ACTION_LISTENER_BOTH, this, this.snippetCompleteActionListener);
		}
	}
	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT | (selection_changed ? ac.chap.ACTION_RES_SELECTIONCHANGED : 0);
//	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT;
}

ac.chap.KeyMap.prototype.snippetCompleteActionListener = function(component, action, type, actionResult, actionType, params, caretRow, caretCol)
{
	var scc = action.snippetCompleteCache;

	if ( ac.chap.ACTION_LISTENER_BEFORE == type && !scc.firstInitialized )
	{
		// before action listener
		// check if we are still in the tabstop range
//		var offset = component.char_map[caretRow].substr()
		// console.log('activeTabStopRange: %o', scc.activeTabStopRange);
		if ( caretRow < scc.activeTabStopRange[0] || caretRow > scc.activeTabStopRange[2] || caretCol < scc.activeTabStopRange[1] || caretCol > scc.activeTabStopRange[3] )
		{
			// out of range, canceling whole snippet logic
			component.removeActionListener(scc.callbackIndex);
			component.removeSelection();
			delete action.snippetCompleteCache;
			// console.log('CANCELED');
			return;
		}
//		console.log('before: %s - [%s,%s]', actionType, caretRow, caretCol);
	}
	else
	{
		// after action listener
		if ( scc.firstInitialized )
		{
			scc.firstInitialized = false;
			var tabstop = scc.tabstops[scc.activeTabStopIndex];
			caretCol -= tabstop[1].length;
			var code_rows = tabstop[1].split('\n');
			var num_code_rows = code_rows.length;
			var to_caret_row = caretRow + num_code_rows - 1;
			var to_caret_col = (to_caret_row == caretRow ? caretCol : 0) + code_rows[num_code_rows-1].length;
			scc.activeTabStopRange = [caretRow, caretCol, to_caret_row, to_caret_col];
			scc.stopMarker = component.char_map[to_caret_row].substr(to_caret_col);
			// creating list of nested tabstops
			for ( var i in scc.tabstops )
			{
				if ( i == scc.activeTabStopIndex )
				{
					continue;
				}
				var c_tabstop = scc.tabstops[i];
				if ( c_tabstop[2] >= tabstop[2] && (c_tabstop[2] + c_tabstop[3] <= tabstop[2] + tabstop[3]) )
				{
					scc.activeTabStopNested[i] = true;
				}
			}
			if ( 'mi' != tabstop[0] )
			{
				scc.activeTabStopContent = tabstop[1];
			}
			scc.firstRealRun = false;
			
//			action.snippetCompletePostInit(component, caretRow, caretCol);
			// console.log('firstRealRun: %o', scc.activeTabStopRange);
		}
		else
		{
			// console.log('next: %o', scc.activeTabStopRange);
			// adjust the range by finding the stop marker
			var n = component.char_map.length;
			var i = scc.activeTabStopRange[0];
			var found = false;
			var max_iter = 50;
//			var offset_range = [scc.activeTabStopRange[2], scc.activeTabStopRange[3]];
			var new_content = '';
			var old_content = scc.activeTabStopContent;
			while ( i<n && 0 < max_iter-- )
			{
				var ix = '' == scc.stopMarker ? component.char_map[i].length : component.char_map[i].indexOf(scc.stopMarker);
				if ( -1 != ix )
				{
					scc.activeTabStopRange[2] = i;
					scc.activeTabStopRange[3] = ix;
					// console.log('setting [3] to %i, stop marker: `%s`', ix, scc.stopMarker);
					new_content += (i==scc.activeTabStopRange[0]?component.char_map[i].substring(scc.activeTabStopRange[1], ix) : component.char_map[i].substr(0, ix));
					scc.activeTabStopContent = new_content;
					found = true;
					break;
				}
				new_content += (i==scc.activeTabStopRange[0]?component.char_map[i].substr(scc.activeTabStopRange[1]) : component.char_map[i])+'\n';
				i++;
			}
			if ( !scc.firstRealRun )
			{
				scc.activeTabStopContent = new_content;				
			}
			if ( !found )
			{
				// could not find stop marker, canceling whole snippet logic
				component.removeActionListener(scc.callbackIndex);
				component.removeSelection();
				delete action.snippetCompleteCache;
				// console.log('COULD NOT FIND STOPMARKER');
				return;
			}
			
			var offset = new_content.length - old_content.length;
			if ( 'mi' == scc.tabstops[scc.activeTabStopIndex][0] )
			{
				// mirror
//				console.log('Offset: %s OLD: %s NEW: %s will move: ', offset, old_content, new_content, scc.tabstops[scc.activeTabStopIndex][4]-scc.tabstops[scc.activeTabStopIndex][2]-scc.tabstops[scc.activeTabStopIndex][3]);
				//scc.tabstops[scc.activeTabStopIndex][4] += offset;
				var current_caret_pos = [component.caret.position[0], component.caret.position[1]];
				// disabling listeners
				component.stopActionListeners();
				// removing potential selection
				component.runAction(ac.chap.ACTION_SELECTION, {remove:true});
				// moving where it started
				component.runAction(ac.chap.ACTION_CARET, {moveTo:[scc.activeTabStopRange[0], scc.activeTabStopRange[1]]});
				// moving by offset and length of new content
				component.runAction(ac.chap.ACTION_CARET, {moveBy:'column', value:(1 + scc.tabstops[scc.activeTabStopIndex][4]-scc.tabstops[scc.activeTabStopIndex][2]-scc.tabstops[scc.activeTabStopIndex][3]+new_content.length)});
				if ( 0 < old_content.length )
				{
					// storing position
					component.runAction(ac.chap.ACTION_CARET, {store:true});
					// moving by old content length
//					console.log('move before delete:'+old_content.length);
					component.runAction(ac.chap.ACTION_CARET, {moveBy:'column', value:old_content.length});
					// selecting
					component.runAction(ac.chap.ACTION_SELECTION, {add:true});
					// deleting
					component.runAction(ac.chap.ACTION_DELETE, {character:false});
				}
				// inserting new content
				component.runAction(ac.chap.ACTION_INSERT, {string:new_content});
				// returning back to caret
				component.runAction(ac.chap.ACTION_CARET, {moveTo:current_caret_pos});
				// enabling listeners
				component.startActionListeners();
				//adjusting stopmarker for mirrored placeholder AFTER original
				if ( 0 < scc.tabstops[scc.activeTabStopIndex][4] )
				{
					scc.stopMarker = component.char_map[scc.activeTabStopRange[2]].substr(scc.activeTabStopRange[3]);					
				}
			}
			if ( !scc.firstRealRun )
			{
				scc.firstRealRun = true;
				if ( 'mi' == scc.tabstops[scc.activeTabStopIndex][0] && '' != scc.tabstops[scc.activeTabStopIndex][1] )
				{
					offset = new_content.length - scc.tabstops[scc.activeTabStopIndex][1].length;
				}
			}
			
//			console.log('offset: %s', offset);
			var active_offset = scc.tabstops[scc.activeTabStopIndex][2];
			if ( 0 != offset )
			{
				// changed, readjusting tabstops after this and killing all nested
				for ( i in scc.tabstops )
				{
					if ( i == scc.activeTabStopIndex )
					{
						continue;
					}
					var tabstop = scc.tabstops[i];
					if ( tabstop[2] > active_offset )
					{
						if ( scc.activeTabStopNested[i] )
						{
							// nested
							delete scc.tabstops[i];
						}
						else
						{
							tabstop[2] += offset;
							// console.log('ADJUSTING: #%s by %s, new: %s', i, offset, tabstop[2]);
						}
					}
				}
			}
		}
		// console.log('after %s(%s, %s) : %o', actionType, caretRow, caretCol, scc.activeTabStopRange);
	}
}


ac.chap.KeyMap.prototype.compile = function(source)
{
	/* example:
	
		KEY: -13+shift
			selection(add:true)
			caret(move:'up')
			
		KEY: -27
			caret(move:'row_end')
			
		...
		..
		.
	*/
	var rows = source.split('\n');
	var n =  rows.length;
	var re_definition = /^KEY\:\s*[-\d]*[\+\w\s]*$/;
	var re_chain = /^[^\(]*\(.*\)\s*$/;
	var src = '';
	var chain = [];
	var last_key_code = null;
	for ( var i=0; i<n; i++ )
	{
		rows[i] = rows[i].trim();
		if ( re_definition.test(rows[i]) )
		{
			if ( null != last_key_code )
			{
				src += chain.join(',\n');
				src += '\n];\n'
				chain = [];
			}
			var s = rows[i].split(':')[1].split('+');
			var key_code = parseInt(s[0]);
			var control_keys = ['ac.chap.CKEY_NONE'];
			for ( var ii=1; ii<s.length; ii++ )
			{
				control_keys.push('ac.chap.CKEY_'+s[ii].trim().toUpperCase());
			}
			src += "\nif('undefined'==typeof this.definition['?']) {this.definition['?']=[];}\n".embed(key_code, key_code);
			src += "this.definition['?'][?] = [\n".embed(key_code, control_keys.join('|'));
			last_key_code = key_code;
		}
		if ( re_chain.test(rows[i]) )
		{
			var ix = rows[i].indexOf('(');
			var action_type = 'ac.chap.ACTION_'+rows[i].substr(0,ix).trim().toUpperCase();
			var params = rows[i].substring(ix+1, rows[i].length-1).replace(/\:CR/g, '\\n');
			chain.push( action_type+', {'+params+'}' );
		}
	}
	if ( null != last_key_code )
	{
		src += chain.join(',\n');
		src += '\n];\n'
		chain = [];
	}
	var result = true;
	try
	{
		eval(src);
	}
	catch(e)
	{
		result = e;
		console.error('Error while compiling Chap keymap definition: %o. Compiled source: %s', e, src);
	}
	return result;
}

ac.chap.keymap = {};




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
	this.cssId = '';
	this.background = '#fff';
	this.textColor = '#000';
	this.caretRowStyleActive = '#ededed';
	this.selectionStyle = '#c4dbff';
	this.caretColor = '#000';
}

ac.chap.Theme.prototype.renderCaret = function(caretMode, node)
{
	if ( 1 == caretMode )
	{
		node.style.borderRight = '1px solid '+this.caretColor;
	}
	else
	{
		node.style.height = (parseInt(node.style.height)-1)+'px';
		node.style.borderBottom = '1px solid '+this.caretColor;
	}
}

ac.chap.Theme.prototype.adjustCaretPosition = function(caretMode, pos)
{
	if ( 1 == caretMode )
	{
		pos[0]++;
	}
	else
	{
		pos[0] += pos[2];
	}
	return pos;
}

ac.chap.theme = {};



$class('ac.chap.Language',
{
	construct:function()
	{
		this.foldingStartMarkers = [];
		this.foldingStopMarkers = [];
		this.singleRowCommentStartMarkers = [];
		this.multiRowCommentStartMarker = '';
		this.multiRowCommentEndMarker = '';
		this.initDefinition();
	}
});

ac.chap.Language.prototype.initDefinition = function()
{
	this.singleQuoteStringMarker = "'";
	this.singleQuoteStringMarkerException = '\\';
	this.doubleQuoteStringMarker = '"';
	this.doubleQuoteStringMarkerException = '\\';
	this.chunkRules = 
	[
		[/(([^\w]|^)(\d{1,}[\d\.Ee]*)([^w]|$))/i, 3, ac.chap.CHUNK_NUMBER],
		[/(\+|\-|\*|\/|\=|\!|\^|\%|\||\&|\<|\>)/i, 0, ac.chap.CHUNK_OPERATOR],
		[/(\(|\)|\[|\]|\{|\})/i, 0, ac.chap.CHUNK_PARENTHESIS]
	];
	this.wordDelimiter = /[\w\.\d]/;
	this.indentIgnoreMarker = /[\.]/;
}


ac.chap.lang = {};



if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}

