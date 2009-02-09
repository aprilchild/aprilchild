/*
 * AC Fry - JavaScript Framework v1.0
 *
 * Terminal component
 *
 * (c)2008 Petr Krontorád, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorád, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*--------*/

if (!self['ac'])
{
	ac = {}
}

ac.terminal = {
	version: 1.0,
	instanceId: 1,
	activeComponent: null,
	
	IN_ACTION_INSERT: 1,
	IN_ACTION_REMOVE: 2,
	IN_ACTION_CARET: 4,
	IN_ACTION_SELECTION: 8,
	
	IN_PPSTATE_REDRAW_CARET_NOBLINK: 1,
	IN_PPSTATE_REDRAW_CARET: 2,
	IN_PPSTATE_REDRAW_SELECTION: 4,
	
	SPECIAL_COMMAND_INTERRUPT: 1
}

ac.terminal.getActiveComponent = function()
{
	return ac.terminal.activeComponent;
}

ac.terminal.setActiveComponent = function(component)
{
    fry.keyboard.initialize();
	if (null != ac.terminal.activeComponent)
	{
		ac.terminal.activeComponent.blur();
	}
	ac.terminal.activeComponent = component;
	if (null != component)
	{
		if (ac.widget)
		{
			ac.widget.focus(component);
		}
		ac.terminal.activeComponent.focus();
	}
	else
	{
		if (!ac.widget)
		{
			fry.keyboard.stop();
		}
	}
    // fry.keyboard.initialize();
    // if (null != ac.terminal.activeComponent)
    // {
    //  ac.terminal.activeComponent.blur();
    // }
    // ac.terminal.activeComponent = component;
    // if (null != component)
    // {
    //  ac.terminal.activeComponent.focus();
    // }
    // else
    // {
    //  fry.keyboard.stop();
    // }
}

ac.terminal.keyboardListener = function(code, mask)
{
	if (null == ac.terminal.activeComponent)
	{
		return;
	}
	return ac.terminal.activeComponent.standaloneKeyboardListener(code, mask);
}

if ('undefined' == typeof ac['widget'])
{
	// terminal is not a part of Fry MVC, must handle keyboardListener itself
	fry.keyboard.addListener(ac.terminal.keyboardListener);
}

ac.terminal.caretListener = function()
{
	if (null == ac.terminal.activeComponent)
	{
		return;
	}
	ac.terminal.activeComponent.redrawCaret();
}

ac.terminal.caretThread = setInterval(ac.terminal.caretListener, 600);

$class('ac.terminal.Window',
{
	construct:function(options, userId)
	{
		this.instanceId = ac.terminal.instanceId++;
		this.userId = userId | 0;

		this.options = null;
		this.caret = {position:0, blink:true, displayed:true, node:null, nextBlink:0, hidden:false};
		this.selection = {begin:-1, end:-1, active:false};
		this.snippets = {};
		this.history = {list:[], position:0};
		
		this.readListener = null;
		this.specialCommandsListener = null;

		this.setOptions(options||{});
	},
	destruct:function()
	{
	    $delete(this.options);
		this.hide();
	}
});

ac.terminal.Window.prototype.setOptions = function(options)
{
	
}

ac.terminal.Window.prototype.onSystemClipboardCopy = function()
{
	return this.getSelection();
}

ac.terminal.Window.prototype.onSystemClipboardCut = function()
{
	this.postProcessInputAction(this.performInputAction(ac.terminal.IN_ACTION_REMOVE, {direction:true}));
    return true;
    // this.runAction(ac.chap.ACTION_CLIPBOARD, {cut:true});
    // return this.processActionResult(true, true);
}

ac.terminal.Window.prototype.onSystemClipboardPaste = function(content)
{
	this.postProcessInputAction(this.performInputAction(ac.terminal.IN_ACTION_INSERT, {char:content}));
	return true;
    // this.runAction(ac.chap.ACTION_CLIPBOARD, {paste:true, content:content});
    // return this.processActionResult(true, true);
}

ac.terminal.Window.prototype.hasKeyboardListenerActive = function()
{
	return true;
}

ac.terminal.Window.prototype.keyboardListener = function(code, mask)
{
	// console.log(code + ' > ' +mask);
	var state = 0;
	var was_ctrl_key = fry.keyboard.CTRL_KEY == (mask & fry.keyboard.CTRL_KEY);
	var was_alt_key = fry.keyboard.ALT_KEY == (mask & fry.keyboard.ALT_KEY);
	var was_shift_key = fry.keyboard.SHIFT_KEY == (mask & fry.keyboard.SHIFT_KEY);
	if (fry.keyboard.CONTROL_CODE == (mask & fry.keyboard.CONTROL_CODE))
	{
        // if (fry.keyboard.PASTE == (mask & fry.keyboard.PASTE))
        // {
        //  // pasted text from clipboard received
        //  state = component.performInputAction(ac.terminal.IN_ACTION_INSERT, {char:fry.keyboard.clipboard.pastedContent});
        // }
        // else if (fry.keyboard.CUT == (mask & fry.keyboard.CUT))
        // {
        //  // cut, let's clear selection if it exists
        //  if (component.selection.active)
        //  {
        //      state = component.performInputAction(ac.terminal.IN_ACTION_REMOVE, {direction:true});
        //  }
        // }
        // else if (fry.keyboard.SIG_CLIPBOARD_GET == (mask & fry.keyboard.SIG_CLIPBOARD_GET))
        // {
        //  // need to return selected content
        //  return component.getSelection();
        // }
		// control character
		switch (code)
		{
			case -8: // DELETE
			{
				state = this.performInputAction(ac.terminal.IN_ACTION_REMOVE, {direction:true});
			};break;
			case -46: // BACKSPACE
			{
				state = this.performInputAction(ac.terminal.IN_ACTION_REMOVE, {direction:false});
			};break;
			case -37: // ARR_LEFT
			{
				state = this.performInputAction(ac.terminal.IN_ACTION_SELECTION, was_shift_key? {begin:true} : {end:true});
				state |= this.performInputAction(ac.terminal.IN_ACTION_CARET, {move: was_ctrl_key || was_alt_key ? 'word-left' : 'left'});
			};break;
			case -39: // ARR_RIGHT
			{
				state = this.performInputAction(ac.terminal.IN_ACTION_SELECTION, was_shift_key? {begin:true} : {end:true});
				state |= this.performInputAction(ac.terminal.IN_ACTION_CARET, {move: was_ctrl_key || was_alt_key ? 'word-right' : 'right'});
			};break;
			case -40: // ARR_DOWN
			{
				if (was_ctrl_key)
				{
					state = this.performInputAction(ac.terminal.IN_ACTION_SELECTION, was_shift_key? {begin:true} : {end:true});
					state |= this.performInputAction(ac.terminal.IN_ACTION_CARET, {move:'end'});
				}
				else
				{
					var pos = this.history.position;
					var str = '';
					if (pos < this.history.list.length-1)
					{
						this.history.position++;
						str = this.history.list[pos+1];
					}
					else
					{
						this.history.position = this.history.list.length;
					}
					state = this.performInputAction(ac.terminal.IN_ACTION_INSERT, {string:str});
				}
			};break;
			case -38: // ARR_UP
			{
				if (was_ctrl_key)
				{
					state = this.performInputAction(ac.terminal.IN_ACTION_SELECTION, was_shift_key? {begin:true} : {end:true});
					state |= this.performInputAction(ac.terminal.IN_ACTION_CARET, {move:'home'});
				}				
				else
				{
					var pos = this.history.position;
					if (0 < pos)
					{
						this.history.position--;
						state = this.performInputAction(ac.terminal.IN_ACTION_INSERT, {string:this.history.list[pos-1]});
					}
				}
			};break;
			case -27: // Escape
			{
				this.history.position = this.history.list.length;
				state = this.performInputAction(ac.terminal.IN_ACTION_INSERT, {string:''});
			};break;
			case -36: // HOME
			{
				state = this.performInputAction(ac.terminal.IN_ACTION_SELECTION, was_shift_key? {begin:true} : {end:true});
				state |= this.performInputAction(ac.terminal.IN_ACTION_CARET, {move:'home'});
			};break;
			case -35: // END
			{
				state = this.performInputAction(ac.terminal.IN_ACTION_SELECTION, was_shift_key? {begin:true} : {end:true});
				state |= this.performInputAction(ac.terminal.IN_ACTION_CARET, {move:'end'});
			};break;
			case -9: // TAB
			{
				line = this.readLine().trim();
				for (var mark in this.snippets)
				{
					if (mark == line)
					{
						return this.performInputAction(ac.terminal.IN_ACTION_INSERT, {string:this.snippets[mark]});
					}
				}
			}
		}
	}
	else
	{
		// printable
		if ((97 == code || 1 == code) && was_ctrl_key)
		{
			// CTRL+A = HOME
			state = this.performInputAction(ac.terminal.IN_ACTION_SELECTION, was_shift_key? {begin:true} : {end:true});
			state |= this.performInputAction(ac.terminal.IN_ACTION_CARET, {move:'home'});
		}
		else if ((101 == code || 5 == code) && was_ctrl_key)
		{
			// CTRL+E = END
			state = this.performInputAction(ac.terminal.IN_ACTION_SELECTION, was_shift_key? {begin:true} : {end:true});
			state |= this.performInputAction(ac.terminal.IN_ACTION_CARET, {move:'end'});
		}
		else if ((99 == code || 3 == code) && was_ctrl_key)
		{
			// CTRL+C => interrupt signal
			if (this.specialCommandsListener)
			{
				this.specialCommandsListener(component, ac.terminal.SPECIAL_COMMAND_INTERRUPT);
			}
		}
		else
		{
			// default insert
			state = this.performInputAction(ac.terminal.IN_ACTION_INSERT, {char:String.fromCharCode(code)});
		}
	}
	if (0 != state)
	{
		this.postProcessInputAction(state);
	}
	else if (this.readListener)
	{
		line = this.readLine();
		var component = this;
		this.readListener(component, -code, mask, function(state)
		{
			if (state)
			{
				component.postProcessInputAction(state);
			}
		});
	}
	// disabling further actions
	return true;
}

// called if terminal is not a part of Fry MVC 
ac.terminal.Window.prototype.standaloneKeyboardListener = function(code, mask)
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

ac.terminal.Window.prototype.focus = function()
{
	this.showCaret();
}

ac.terminal.Window.prototype.blur = function()
{
	this.hideCaret(true);
}

// compatibility layer with AC Fry Widget library
ac.terminal.Window.prototype.onFocus = function()
{
	ac.terminal.setActiveComponent(this);
	this.focus();
}

ac.terminal.Window.prototype.onBlur = function()
{
	ac.terminal.setActiveComponent(null);
	this.blur();
}

ac.terminal.Window.prototype.onResize = function(width, height)
{
}

ac.terminal.Window.prototype.hide = function()
{
	this.containerNode.rs();
}

ac.terminal.Window.prototype.show = function(node)
{
	node = $(node);
	var width = node.w();
	var height = node.h();
	// creating container
	var me = this;
	this.containerNode = node.a($$()).pos(true).w(width-3).h(height-5).s('overflow:auto;padding-bottom:5px;padding-left:3px').n('ac-terminal').e('click', function(evt)
	{
		ac.terminal.setActiveComponent(me);
		evt.stopPropagation();
	});
	// adding output area
	this.outputNode = this.containerNode.a($$()).n('output').w(width-23).s('overflow:hidden');
	// adding input area
	this.inputNode = this.containerNode.a($$('pre')).w(width-33).t('<span></span><span></span>').n('input').$;
	// marking as active
	setTimeout(function(){ac.terminal.setActiveComponent(me)}, 600);
}

ac.terminal.Window.prototype.addToHistory = function(line)
{
	pos = this.history.list.length;
	if (0 == pos || this.history.list[pos-1] != line)
	{
		this.history.list.push(line);
		this.history.position = pos+1;
	}
}

ac.terminal.Window.prototype.setSnippets = function(snippets)
{
	this.snippets = snippets;
}

ac.terminal.Window.prototype.redrawCaret = function()
{
	if (!this.caret.blink)
	{
		var t = new Date().getTime();
		if (this.caret.nextBlink < t)
		{
			this.caret.displayed = false;
			this.caret.blink = true;
		}
	}
	if (null == this.caret.node)
	{
		var pre = this.containerNode.a($$('pre')).t('<span>y</span>');
		this.caret.node = this.containerNode.ib($$(), this.containerNode.fc()).n('caret').pos(true).x(0).y(0).w(pre.fc().w()).h(pre.h()).$;
		pre.rs();
	}
	if (this.selection.active)
	{
		this.caret.node.style.visibility = 'hidden';
		return;
	}
	if (!this.caret.hidden && this.caret.displayed || !this.caret.blink)
	{
		this.caret.node.style.top = this.inputNode.offsetTop + 'px';
		var orig_content = this.readLine();
		var new_content = orig_content.substring(0, this.caret.position).encodeMarkup() + '<span id="caret_insertion" style="position:absolute"></span>' + orig_content.substr(this.caret.position).encodeMarkup();
		
		var d_buffer = this.containerNode.$.appendChild(this.inputNode.cloneNode(true));
		
		d_buffer.style.position = 'absolute';
		d_buffer.lastChild.innerHTML = new_content;
		var caret_insertion = document.getElementById('caret_insertion');
		offset = [caret_insertion.offsetLeft, caret_insertion.offsetTop];
		this.caret.node.style.left = (offset[0] + 3) + 'px';
		this.caret.node.style.top = (this.inputNode.offsetTop + offset[1] - 2) + 'px';
		d_buffer.parentNode.removeChild(d_buffer);
		this.caret.node.style.visibility = 'visible';
	}
	else
	{
		this.caret.node.style.visibility = 'hidden';
	}
	this.caret.displayed = !this.caret.displayed;
}

ac.terminal.Window.prototype.redrawSelection = function()
{
	var input_node = this.inputNode.lastChild;
	var range = [Math.min(this.selection.begin, this.selection.end), Math.max(this.selection.begin, this.selection.end)];
	var orig_content = this.readLine();
	var new_content = orig_content;
	if (-1 < range[0])
	{
		new_content = orig_content.substr(0, range[0]).encodeMarkup() + '<span class="selection">' + orig_content.substring(range[0], range[1]).encodeMarkup() + '</span>' + orig_content.substr(range[1]).encodeMarkup();
	}
	input_node.innerHTML = new_content;
}

ac.terminal.Window.prototype.getSelection = function()
{
	if (!this.selection.active)
	{
		return '';
	}
	// var input_node = this.inputNode.lastChild;
	var range = [Math.min(this.selection.begin, this.selection.end), Math.max(this.selection.begin, this.selection.end)];
	var orig_content = this.readLine();
	if (-1 < range[0])
	{
		return orig_content.substring(range[0], range[1]);
	}
	return '';
}

ac.terminal.Window.prototype.clearSelection = function()
{
	var input_node = this.inputNode.lastChild;
	var range = [Math.min(this.selection.begin, this.selection.end), Math.max(this.selection.begin, this.selection.end)];
	var orig_content = this.readLine();
	if (-1 < range[0])
	{
		this.caret.position = range[0];
		input_node.innerHTML = orig_content.substr(0, range[0]).encodeMarkup() + orig_content.substr(range[1]).encodeMarkup();
	}
}

ac.terminal.Window.prototype.hideCaret = function(redraw)
{
	this.caret.hidden = true;
	if (redraw)
	{
		this.redrawCaret();
	}
}

ac.terminal.Window.prototype.showCaret = function()
{
	this.caret.hidden = false;
	this.caret.displayed = true;
	this.redrawCaret();
}

ac.terminal.Window.prototype.writeLine = function(msg, discardInput)
{
    if (0 == msg.indexOf('^MARKUP^JS^'))
    {
        code = msg.split('^JS^');
        try
        {
            eval(code[1]);
        }
        catch (e)
        {
            console.error(e);
        }
        msg = '^MARKUP^' + code[2];
    }
	if (0 != msg.indexOf('^MARKUP^'))
	{
		msg = msg.encodeMarkup().replace(/\n/g, '<br/>');
		if ($__tune.isIE)
		{
			msg = msg.replace(/ /g, '&nbsp;');
		}
		if ('' == msg)
		{
			msg = '&nbsp;';
		}
		msg = msg.replace(/\^SX\-(\d{1,})\^/g, function() {return '<span class="sx_'+arguments[1]+'">'}).replace(/\^\/SX\^/g, '</span>');
	}
	else
	{
		msg = msg.substr(8);
	}
	this.outputNode.a($$('pre')).t(msg);
	this.containerNode.$.scrollTop = this.containerNode.$.scrollHeight;
	if (discardInput)
	{
		this.caret.blink = true;
		this.caret.displayed = false;
		this.redrawCaret();
		this.caret.position = 0;
		this.inputNode.lastChild.innerHTML = '';
	}
}

ac.terminal.Window.prototype.writeSnippetsHelp = function()
{
	var msg = "List of available snippets (type shortcut and press `TAB` to invoke):\n";
	var list = [];
	var longest = 0;
	for (var mark in this.snippets)
	{
		longest = Math.max(longest, mark.length);
		list.push([mark, this.snippets[mark]]);
	}
	if (0 == list.length)
	{
		list.push("No snippets are currently available.");
	}
	else
	{
		var tmp = '                                                ';
		for (var i=0; i<list.length; i++)
		{
			list[i] = '  ' + list[i][0] + tmp.substring(0, 4 + longest-list[i][0].length) + list[i][1];
		}
	}
	this.writeLine(msg);
	this.writeLine(list.join('\n'));
}

ac.terminal.Window.prototype.readLine = function()
{
	return this.inputNode.lastChild.innerHTML.replace(/<.*selection[^>]*>([^<]*)<\/[^>]*>/, function(){return arguments[1];}).decodeMarkup();
}

ac.terminal.Window.prototype.setInputPrefix = function(prefix)
{
	this.inputNode.getElementsByTagName('span')[0].innerHTML = prefix;
}

ac.terminal.Window.prototype.addSpecialCommandsListener = function(listener)
{
	this.specialCommandsListener = listener;
}

ac.terminal.Window.prototype.addReadListener = function(listener)
{
	this.readListener = listener;
}


ac.terminal.Window.prototype.performInputAction = function(actionType, params)
{
	switch (actionType)
	{
		case ac.terminal.IN_ACTION_INSERT:
		{
			if (params.char)
			{
				var state = 0;
				if (this.selection.active)
				{
					this.clearSelection();
					state = this.performInputAction(ac.terminal.IN_ACTION_SELECTION, {end:true});
				}
				var content = this.readLine()
				var pos = this.caret.position;
				var new_content = content.substring(0, pos) + params.char + content.substr(pos);
				this.inputNode.lastChild.innerHTML = new_content.encodeMarkup();
				if (1 == params.char.length)
				{
					return state | this.performInputAction(ac.terminal.IN_ACTION_CARET, {move:'right'});
				}
				else
				{
					return state | this.performInputAction(ac.terminal.IN_ACTION_CARET, {move_right_by:params.char.length});
				}
			}
			if ('undefined' != typeof params.string)
			{
				if (this.selection.active)
				{
					this.performInputAction(ac.terminal.IN_ACTION_SELECTION, {end:true});
				}
				this.inputNode.lastChild.innerHTML = params.string.encodeMarkup();
				return state | this.performInputAction(ac.terminal.IN_ACTION_CARET, {move:'end'});
			}
		}; break;
		case ac.terminal.IN_ACTION_REMOVE:
		{
			if (this.selection.active)
			{
				this.clearSelection();
				return ac.terminal.IN_PPSTATE_REDRAW_CARET_NOBLINK | this.performInputAction(ac.terminal.IN_ACTION_SELECTION, {end:true});
			}
			var content = this.readLine();
			var pos = this.caret.position + (params.direction? 0 : 1);
			var new_content = content.substring(0, pos-1) + content.substr(pos);
			this.inputNode.lastChild.innerHTML = new_content.encodeMarkup();
			if (params.direction)
			{
				return this.performInputAction(ac.terminal.IN_ACTION_CARET, {move:'left'});
			}
			return ac.terminal.IN_PPSTATE_REDRAW_CARET_NOBLINK;
		}; break;
		case ac.terminal.IN_ACTION_CARET:
		{
			var text = this.readLine();
			var text_len = text.length;
			if (params['move'])
			{
				switch (params['move'])
				{
					case 'left':
					{
						this.caret.position--;
					};break;
					case 'right':
					{
						this.caret.position++;
					};break;
					case 'word-left':
					{
						var text_upto_caret = text.substring(0, this.caret.position);
						var index = text_upto_caret.lastIndexOf(' ');
						if (0 <= index)
						{
							this.caret.position = index;
						}
						else
						{
							this.caret.position = 0;
						}
					};break;
					case 'word-right':
					{
						var text_from_caret = text.substr(this.caret.position+1);
						var index = text_from_caret.indexOf(' ');
						if (0 <= index)
						{
							this.caret.position += (index + 1);
						}
						else
						{
							this.caret.position = text_len;
						}
					};break;
					case 'home':
					{
						this.caret.position = 0;
					};break;
					case 'end':
					{
						this.caret.position = text_len;
					};break;
				}
			}
			else if (params['move_left_by'])
			{
				this.caret.position -= params['move_left_by'];
			}
			else if (params['move_right_by'])
			{
				this.caret.position += params['move_right_by'];
			}
			if (0 > this.caret.position)
			{
				this.caret.position = 0;
			}
			if (text_len < this.caret.position)
			{
				this.caret.position = text_len;
			}
			if (this.selection.active)
			{
				this.selection.end = this.caret.position;
			}
			return ac.terminal.IN_PPSTATE_REDRAW_CARET_NOBLINK;
		};break;
		case ac.terminal.IN_ACTION_SELECTION:
		{
			if (params['begin'])
			{
				if (this.selection.active)
				{
					return ac.terminal.IN_PPSTATE_REDRAW_SELECTION;
				}
				this.selection.begin = this.caret.position;
				this.selection.end = this.caret.position;
				this.selection.active = true;
				return ac.terminal.IN_PPSTATE_REDRAW_SELECTION | ac.terminal.IN_PPSTATE_REDRAW_CARET;
			}
			else if (params['end'])
			{
				if (!this.selection.active)
				{
					return ac.terminal.IN_PPSTATE_REDRAW_SELECTION;
				}
				this.selection.active = false;
				this.selection.begin = -1;
				this.selection.end = -1;
				return ac.terminal.IN_PPSTATE_REDRAW_SELECTION | ac.terminal.IN_PPSTATE_REDRAW_CARET;
			}
		};break;
	}
}

ac.terminal.Window.prototype.postProcessInputAction = function(state)
{
	if (ac.terminal.IN_PPSTATE_REDRAW_SELECTION == (state & ac.terminal.IN_PPSTATE_REDRAW_SELECTION))
	{
		this.redrawSelection();
	}
	if (ac.terminal.IN_PPSTATE_REDRAW_CARET == (state & ac.terminal.IN_PPSTATE_REDRAW))
	{
		this.redrawCaret();
	}
	if (ac.terminal.IN_PPSTATE_REDRAW_CARET_NOBLINK == (state & ac.terminal.IN_PPSTATE_REDRAW_CARET_NOBLINK))
	{
		this.caret.blink = false;
		this.redrawCaret();
		this.caret.nextBlink = new Date().getTime()+800;
	}
	this.containerNode.$.scrollTop = this.containerNode.$.scrollHeight;
}



/*--------*/
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}