/*
 * AC Fry - JavaScript Framework v1.0
 *
 * Advanced keyboard handling
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*--------*/

fry.keyboard = 
{
	initialized:false,
	last_down_evt: null,
	ignore_further_events: false,
	stopped:true,
	paste: {was:false, none:function(){}},
	down: {none:function(){}},
	press: {none:function(){}},
	shared:{},
	buffer: [],
	listener: null,
	clipboard:{node:null, ie:{node:null}, pastedContent:'', copiedContent:'', content:''},
	CONTROL_CODE:1,
	ALT_KEY:2,
	CTRL_KEY: 4,
	SHIFT_KEY:8,
	META_KEY:16,
	COPY: 128,
	CUT: 256,
	PASTE: 512,
	SIG_CLIPBOARD_GET:1024
}

fry.keyboard.initialize = function()
{
	if (fry.keyboard.initialized)
	{
		fry.keyboard.start();
		return;
	}
	var react_as = 'none';
	
	if ($__tune.isGecko)
	{
		react_as = 'ff_' + ($__tune.isMac ? 'mac' : 'win');
	}
	else if ($__tune.isSafari)
	{
		react_as = 'webkit';
	}
	else if ($__tune.isIE)
	{
		react_as = 'ie';
	}
	else if ($__tune.isOpera)
	{
		react_as = 'opera';
	}
	// following scroll listeners will accomplish movement of helper textareas if page scrolls. Due focusing, page would scroll up when pressing paste combination.
	document.onscroll = function(evt)
	{
		if (fry.keyboard.clipboard.node)
		{
			fry.keyboard.clipboard.node.style.top = ($__tune.isSafari? document.body.scrollTop : document.documentElement.scrollTop) + 'px';
		}
	}
	if ($__tune.isIE)
	{
		document.body.onscroll = function(evt)
		{
			if (fry.keyboard.clipboard.node)
			{
				fry.keyboard.clipboard.node.style.top = document.documentElement.scrollTop + 'px';
			}
			if (fry.keyboard.clipboard.ie.node)
			{
				fry.keyboard.clipboard.ie.node.style.top = document.documentElement.scrollTop + 'px';
			}
		}
	}
	var code = "document.onkeydown = function(evt) {\n";
	code += "if (fry.keyboard.stopped) { return; }\n";
	code += "fry.keyboard.ignore_further_events = false;\n";
	code += "var result = null;\n";
	code += $__tune.isIE ? 'evt = event;\n' : '';
	code += (''+fry.keyboard.paste[react_as]).replace(/function[ ]+\(evt\)/, '').replace(/return /g, 'result=').replace(/^[^{]*{/, '').replace(/\}\s*$/, '').replace('fry.keyboard.shared.copy(evt);', (''+fry.keyboard.shared.copy).replace(/function[ ]+\(evt\)/, '').replace(/return /g, 'result=').replace(/^[^{]*{/, '').replace(/\}\s*$/, ''));
	code += "if (fry.keyboard.ignore_further_events) {	return;	}\n";
	code += "if (result) { fry.keyboard.prepareClipboard();	fry.keyboard.paste.was = true; fry.keyboard.clipboard.node.value = ''; fry.keyboard.clipboard.node.focus();	return true; }\n";
	code += "else { ";
	code += $__tune.isIE ? "if (86 == event.keyCode && event.ctrlKey){ fry.keyboard.clipboard.ie.node.value = ''; fry.keyboard.clipboard.ie.node.focus(); }\n" : "";
	code += "}\n";
	code += (''+fry.keyboard.down[react_as]).replace(/function[ ]+\(evt\)/, '').replace(/^[^{]*{/, '').replace(/\}\s*$/, '') + "\n}"
	code = code.replace(/fry\.keyboard\.([A-Z_]+)/g, function() {return fry.keyboard[arguments[1]];});
    // alert(code);
	eval(code);
	
	code = "document.onkeypress = function(evt)	{\n";
	code += "if (fry.keyboard.stopped || fry.keyboard.ignore_further_events) { return; }\n";
	code += "if (fry.keyboard.paste.was) {\n";
	if (!$__tune.isIE)
	{
	    code += "setTimeout(function() {\n";
		if ($__tune.isSafari)
		{
		    // bug in WebKit - append \n if inserted value ends with \n causing double \n as resulting read value
		    code += "var v = fry.keyboard.clipboard.node.value; if ('\\n\\n' == v.substr(v.length-2,2)) {v = v.substr(0, v.length-1);}fry.keyboard.clipboard.node.value = v;\n";
		}
		code += "fry.keyboard.pushKey(fry.keyboard.clipboard.node.value, fry.keyboard.CONTROL_CODE | fry.keyboard.PASTE); fry.keyboard.clipboard.node.blur(); fry.keyboard.paste.was = false;	}, 20);\n";
	}
	code += "return; }\n";
	if ($__tune.isIE)
	{
    	code += "evt = event;\n"
	}
	code += (''+fry.keyboard.press[react_as]).replace(/function[ ]+\(evt\)/, '').replace(/^[^{]*{/, '').replace(/\}\s*$/, '') + "\n}"
	code = code.replace(/fry\.keyboard\.([A-Z_]+)/g, function() {return fry.keyboard[arguments[1]];});
    // alert(code);
	eval(code);
	
	document.onkeydown2 = function(evt)
	{
		if (fry.keyboard.stopped)
		{
			return;
		}
		fry.keyboard.ignore_further_events = false;
		var result = fry.keyboard.paste[react_as](evt || event);
		if (fry.keyboard.ignore_further_events)
		{
			return;
		}
		if (result)
		{
			fry.keyboard.prepareClipboard();
			fry.keyboard.paste.was = true;
			fry.keyboard.clipboard.node.value = '';
			fry.keyboard.clipboard.node.focus();
			return true;
		}
		else
		{
			if ($__tune.isIE)
			{
				if (86 == event.keyCode && event.ctrlKey)
				{
					fry.keyboard.clipboard.ie.node.value = '';
					fry.keyboard.clipboard.ie.node.focus();
				}
			}			
		}
		return fry.keyboard.down[react_as](evt || event);
	}
	document.onkeypress2 = function(evt)
	{
		if (fry.keyboard.stopped || fry.keyboard.ignore_further_events)
		{
			return;
		}
		if (fry.keyboard.paste.was)
		{
			if (!$__tune.isIE)
			{
				setTimeout(function()
				{
					if ($__tune.isSafari)
					{
						// bug in WebKit - append \n if inserted value ends with \n causing double \n as resulting read value
						var v = fry.keyboard.clipboard.node.value;
						if ('\n\n' == v.substr(v.length-2,2))
						{
							v = v.substr(0, v.length-1);
						}
						fry.keyboard.clipboard.node.value = v;
					}
					fry.keyboard.pushKey(fry.keyboard.clipboard.node.value, fry.keyboard.CONTROL_CODE | fry.keyboard.PASTE);
					fry.keyboard.clipboard.node.blur();
					fry.keyboard.paste.was = false;
				}, 20);
			}
			return;
		}
		return fry.keyboard.press[react_as](evt || event);
	}
	if ($__tune.isIE)
	{
		fry.keyboard.prepareClipboard();
		fry.keyboard.clipboard.ie = {node:$().a($$('textarea')).pos(true).x(-2000).y(document.documentElement.scrollTop).w(20).h(20).e('paste', function(evt)
		{
			if (fry.keyboard.stopped)
			{
				return;
			}
			setTimeout(function(){
				fry.keyboard.paste.was = false;
				fry.keyboard.pushKey(fry.keyboard.clipboard.ie.node.value, fry.keyboard.CONTROL_CODE | fry.keyboard.PASTE);
			}, 10);
		}).$};
	}
	if ($__tune.isGecko && $__tune.isMac)
	{
		document.onkeyup = function(evt)
		{
			if (evt.metaKey && !evt.ctrlKey && !evt.altKey && !evt.shiftKey && 65 <= evt.keyCode && 128 >= evt.keyCode)
			{
				fry.keyboard.pushKey(evt.keyCode + 32, fry.keyboard.META_KEY);
				evt.preventDefault();
				return true;
			}
		}
	}
	fry.keyboard.initialized = true;
	fry.keyboard.start();
}

fry.keyboard.start = function()
{
	fry.keyboard.stopped = false;
}

fry.keyboard.stop = function()
{
	fry.keyboard.stopped = true;
}

fry.keyboard.disableTextfieldsEditation = function()
{
	fry.keyboard.allowTextfieldsEditation(true);
}

fry.keyboard.allowTextfieldsEditation = function(disable)
{
	var lst = document.getElementsByTagName('input');
	var n = lst.length;
	for (var i=0; i<n; i++)
	{
		var item = lst.item(i);
		if ('text' == item.type || 'password' == item.type)
		{
			if (disable)
			{
				item.onfocus = null;
				item.onblur = null;
				item.onkeydown = null;
				item.onkeypress = null;
				item.onkeyup = null;
				continue;
			}
			$(item).e('keydown', function(evt){evt.stopPropagation();}).e('keypress', function(evt){evt.stopPropagation();}).e('keyup', function(evt){evt.stopPropagation();});
			item.onfocus = function(evt)
			{
				fry.keyboard.stop();
			}
			item.onblur = function(evt)
			{
				fry.keyboard.start();
			}
		}
	}
	lst = document.getElementsByTagName('textarea');
	var n = lst.length;
	for (var i=0; i<n; i++)
	{
		var item = lst.item(i);
		if (disable)
		{
			item.onfocus = null;
			item.onblur = null;
			item.onkeydown = null;
			item.onkeypress = null;
			item.onkeyup = null;
			continue;
		}
		$(item).e('keydown', function(evt){evt.stopPropagation();}).e('keypress', function(evt){evt.stopPropagation();});
		item.onfocus = function(evt)
		{
			fry.keyboard.stop();
		}
		item.onblur = function(evt)
		{
			fry.keyboard.start();
		}
	}
}

fry.keyboard.prepareClipboard = function()
{
	if (fry.keyboard.clipboard.node)
	{
		return;
	}
	fry.keyboard.clipboard.node = $().a($$('textarea')).w(20).h(20).pos(true).x(-2000).y($__tune.isSafari? document.body.scrollTop : document.documentElement.scrollTop).$;
}

fry.keyboard.shared.copy = function(evt)
{
	fry.keyboard.prepareClipboard();
	// acquiring clipboard content to be copied into system clipboard
	fry.keyboard.clipboard.copiedContent = '';
	if (fry.keyboard.listener)
	{
		var content = fry.keyboard.listener(0, fry.keyboard.CONTROL_CODE | fry.keyboard.SIG_CLIPBOARD_GET);
		if ('string' == typeof content)
		{
			fry.keyboard.clipboard.copiedContent = content;
		}
	}
	fry.keyboard.clipboard.node.value = fry.keyboard.clipboard.copiedContent;
	fry.keyboard.clipboard.node.select();
	fry.keyboard.clipboard.node.focus();
	setTimeout('fry.keyboard.clipboard.node.blur()', 200);
	fry.keyboard.clipboard.content = fry.keyboard.clipboard.copiedContent;
	fry.keyboard.ignore_further_events = true;
	// sending control code
	fry.keyboard.pushKey(0, fry.keyboard.CONTROL_CODE | (88 == evt.keyCode ? fry.keyboard.CUT : fry.keyboard.COPY));
	return false;
}

fry.keyboard.paste.ff_win = function(evt)
{
	return 86 == evt.keyCode && 0 == evt.charCode && 86 == evt.which && evt.ctrlKey;
}

fry.keyboard.down.ff_win = function(evt)
{
	fry.keyboard.last_down_evt = evt;
	return true;
}

fry.keyboard.press.ff_win = function(evt)
{
	if (null != fry.keyboard.last_down_evt)
	{
		var mask = (evt.altKey ? 2 : 0) + (evt.ctrlKey ? 4 : 0) + (evt.shiftKey ? 8 : 0) + (evt.metaKey ? 16 : 0);
		var code = !evt.keyCode ? evt.charCode : evt.keyCode;
		if (evt.keyCode == evt.charCode && evt.keyCode == fry.keyboard.last_down_evt.charCode)
		{
			code = fry.keyboard.last_down_evt.keyCode;
		}
		if (evt.keyCode == fry.keyboard.last_down_evt.keyCode && (0 == evt.which || 32 > evt.keyCode))
		{
			// control code
			mask++;
		}
		if (!fry.keyboard.pushKey(code, mask))
		{
			return true;
		}
	}
	evt.preventDefault();
	evt.stopPropagation();
	return false;
}

fry.keyboard.paste.ff_mac = function(evt)
{
	fry.keyboard.last_down_evt = null;
	// catching Command+C, Command+X, it's a FF.mac hack
	if (evt.metaKey && ((67 == evt.keyCode && 0 == evt.charCode && 67 == evt.which) || (88 == evt.keyCode && 0 == evt.charCode && 88 == evt.which)))
	{
		return fry.keyboard.shared.copy(evt);
	}
	else
	{
    	return 86 == evt.keyCode && 0 == evt.charCode && 86 == evt.which && evt.metaKey;
	}
}

fry.keyboard.down.ff_mac = function(evt)
{
	return false;
}

fry.keyboard.press.ff_mac = function(evt)
{
	if (null != fry.keyboard.last_down_evt)
	{
		return;
	}
	var mask = (evt.altKey ? 2 : 0) + (evt.ctrlKey ? 4 : 0) + (evt.shiftKey ? 8 : 0) + (evt.metaKey ? 16 : 0);
	if (!evt.charCode || (evt.charCode == evt.keyCode))
	{
		// control code
		fry.keyboard.pushKey(evt.keyCode, 1 + mask);
	}
	else
	{
		if (!fry.keyboard.pushKey(evt.charCode, mask))
		{
			return true;
		}
	}
	evt.preventDefault();
	evt.stopPropagation();
	return false;
}

fry.keyboard.paste.webkit = function(evt)
{
	if ($__tune.isMac)
	{
		return (86 == evt.keyCode && (0 == evt.charCode || 118 == evt.charCode) && evt.metaKey);
	}
	else
	{
		return (86 == evt.keyCode && (0 == evt.charCode || 118 == evt.charCode) && evt.ctrlKey);
	}
}

fry.keyboard.down.webkit = function(evt)
{
	if (0 != evt.keyCode && (48 > evt.keyCode || (111 < evt.keyCode && 128 > evt.keyCode) || 60000 < evt.charCode))
	{
		var mask = (evt.altKey ? 2 : 0) + (evt.ctrlKey ? 4 : 0) + (evt.shiftKey ? 8 : 0) + (evt.metaKey ? 16 : 0);
		if (!evt.charCode || 111 < evt.keyCode || 32 > evt.charCode || 60000 < evt.charCode)
		{
			// control code
			fry.keyboard.pushKey(evt.keyCode, 1 + mask);
		}
		else
		{
			if (!fry.keyboard.pushKey(evt.charCode, mask))
			{
				return true;
			}
		}
		evt.preventDefault();
		evt.stopPropagation();
		fry.keyboard.last_down_evt = null;
		return false;
	}
	fry.keyboard.last_down_evt = evt;
	return true;
}

fry.keyboard.press.webkit = function(evt)
{
	if (null != fry.keyboard.last_down_evt)
	{
		var mask = (evt.altKey ? 2 : 0) + (evt.ctrlKey ? 4 : 0) + (evt.shiftKey ? 8 : 0) + (evt.metaKey ? 16 : 0);
		var code = !evt.keyCode ? evt.charCode : evt.keyCode;
		if (evt.keyCode == evt.charCode && evt.keyCode == fry.keyboard.last_down_evt.charCode && evt.keyCode > 60000)
		{
			code = fry.keyboard.last_down_evt.keyCode;
		}
		if (evt.keyCode == fry.keyboard.last_down_evt.keyCode && 48 > evt.keyCode)
		{
			// control code
			mask++;
		}
		else
		{
			var r_mask = fry.keyboard.SHIFT_KEY + fry.keyboard.META_KEY;
			if (r_mask == (mask & r_mask) && 97 <= code && 122 >= code)
			{
				code -= 32;
			}
		}
		if (!fry.keyboard.pushKey(code, mask))
		{
			return true;
		}
	}
	evt.preventDefault();
	evt.stopPropagation();
	return false;			
}

fry.keyboard.paste.ie = function(evt)
{
	if (evt.ctrlKey && (67 == evt.keyCode || 88 == evt.keyCode))
	{
		// ctrl+c, ctrl+x
		return fry.keyboard.shared.copy(evt);
	}
	else
	{
    	return false;
	}
}

fry.keyboard.down.ie = function(evt)
{
	fry.keyboard.last_down_evt = evt;
	if (48 > evt.keyCode || (111 < evt.keyCode && 128 > evt.keyCode))
	{
		// control code for IE
		var mask = 1 + (evt.altKey ? 2 : 0) + (evt.ctrlKey ? 4 : 0) + (evt.shiftKey ? 8 : 0) + (evt.metaKey ? 16 : 0);
		return !fry.keyboard.pushKey(evt.keyCode, mask)
	}
	else
	{
		var code = evt.keyCode;
		// disabling some other keys (A, F, N, R, S, T)
		if (82 == evt.keyCode || 65 == evt.keyCode || 83 == evt.keyCode || 70 == evt.keyCode || 78 == evt.keyCode || 84 == evt.keyCode)
		{
			if (!evt.shiftKey)
			{
				code += 32;
			}
			var mask = (evt.altKey ? 2 : 0) + (evt.ctrlKey ? 4 : 0) + (evt.shiftKey ? 8 : 0) + (evt.metaKey ? 16 : 0);
			return !fry.keyboard.pushKey(code, mask);
		}
	}
	return true;			
}

fry.keyboard.press.ie = function(evt)
{
	if (null != fry.keyboard.last_down_evt)
	{
		var mask = (evt.altKey ? 2 : 0) + (evt.ctrlKey ? 4 : 0) + (evt.shiftKey ? 8 : 0) + (evt.metaKey ? 16 : 0);
		return !fry.keyboard.pushKey(evt.keyCode, mask);
	}
	return false;			
}


fry.keyboard.paste.opera = function(evt)
{
	return 86 == evt.keyCode && 86 == evt.which && evt.ctrlKey;
}

fry.keyboard.down.opera = function(evt)
{
	fry.keyboard.last_down_evt = evt;
	return false;
}

fry.keyboard.press.opera = function(evt)
{
	var e = fry.keyboard.last_down_evt;
	var mask = (evt.altKey ? 2 : 0) + (evt.ctrlKey ? 4 : 0) + (evt.shiftKey ? 8 : 0) + (evt.metaKey ? 16 : 0);
	var prev_mask = (e.altKey ? 2 : 0) + (e.ctrlKey ? 4 : 0) + (e.shiftKey ? 8 : 0) + (e.metaKey ? 16 : 0);
	if ((evt.keyCode == fry.keyboard.last_down_evt.keyCode || 0 == e.keyCode) && (0 == evt.which || 48 > e.keyCode || 111 < e.keyCode))
	{
		mask++;
	}
	if (!fry.keyboard.pushKey(evt.keyCode, mask))
	{
		return true;
	}
	evt.preventDefault();
	evt.stopPropagation();
	return false;
}

fry.keyboard.addListener = function(listener)
{
	fry.keyboard.listener = listener;
}

fry.keyboard.removeListener = function(listener)
{
    fry.keyboard.listener = null;
}


fry.keyboard.pushKey = function(code, mask)
{
	if (32 == code)
	{
		mask = mask & 65534;
	}
	var was_clipboard_copy = false;
	var was_clipboard_cut = false;
	if ($__tune.isMac)
	{
		was_clipboard_copy = (99 == code) && (fry.keyboard.META_KEY == (mask & fry.keyboard.META_KEY));
		was_clipboard_cut = (120 == code) && (fry.keyboard.META_KEY == (mask & fry.keyboard.META_KEY));
	}
	else
	{
		was_clipboard_copy = (1 == code || 99 == code) && (fry.keyboard.CTRL_KEY == (mask & fry.keyboard.CTRL_KEY));
		was_clipboard_cut = (24 == code || 120 == code) && (fry.keyboard.CTRL_KEY == (mask & fry.keyboard.CTRL_KEY));
	}
	if (was_clipboard_copy || was_clipboard_cut)
	{
		fry.keyboard.prepareClipboard();
		fry.keyboard.clipboard.copiedContent = '';
		var was_custom_content = false;
		if (fry.keyboard.listener)
		{
			var content = fry.keyboard.listener(0, fry.keyboard.CONTROL_CODE | fry.keyboard.SIG_CLIPBOARD_GET);
			if ('string' == typeof content)
			{
				was_custom_content = true;
				fry.keyboard.clipboard.copiedContent = content;
			}
		}
		if (was_custom_content)
		{
			fry.keyboard.clipboard.node.value = fry.keyboard.clipboard.copiedContent;
			fry.keyboard.clipboard.node.select();
			fry.keyboard.clipboard.node.focus();
		}
		fry.keyboard.pushKey(0, fry.keyboard.CONTROL_CODE | (was_clipboard_cut ? fry.keyboard.CUT : fry.keyboard.COPY));
		fry.keyboard.clipboard.content = fry.keyboard.clipboard.copiedContent;
		// returning false will enforce propagation
		return !was_custom_content;
	}
	if (fry.keyboard.PASTE == (mask & fry.keyboard.PASTE))
	{
		fry.keyboard.clipboard.pastedContent = code;
		fry.keyboard.clipboard.content = fry.keyboard.clipboard.pastedContent;
		code = 0;
	}
	// filtering out solo-keys Ctrl, Shift, Alt that are triggered by some browsers.
	if ((17 == code && 5 == (mask & 5)) || (16 == code && 9 == (mask & 9)) || (18 == code && 3 == (mask & 3)))
	{
		return true;
	}
	// filtering out Command+V on FF.mac
	if (118 == code && 16 == mask)
	{
		return true;
	}
	if (fry.keyboard.listener)
	{
        // console.info(code);
	    if (13 != code && 0 != (mask & (fry.keyboard.CONTROL_CODE + fry.keyboard.META_KEY + fry.keyboard.CTRL_KEY)))
	    {
	        // some keystroke occured that we really want to know about the listener result, we have to call it immediatelly
			return fry.keyboard.listener(code, mask);
	    }
	    else
	    {
	        // let's ease the pain of the browser
            setTimeout('fry.keyboard.listener('+code+','+mask+')', 10);
	    }
	}
	else
	{
		fry.keyboard.buffer.unshift([code, mask]);
	}
	return true;
}

fry.keyboard.popKey = function()
{
	return fry.keyboard.buffer.pop();
}

fry.keyboard.getClipboardContent = function()
{
	return fry.keyboard.clipboard.content;
}


/*--------*/
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}