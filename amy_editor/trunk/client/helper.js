/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Helpers

  *------------------------------------------------------------------------------------------
*/

amy.util =
{
	shorten:function(t, maxChars)
	{
		t = t || '';
		maxChars = maxChars || 18;
		if ( t.length <= maxChars )
		{
			return t;
		}
		var mid = Math.floor(maxChars/2);
		return '?..?'.embed(t.substr(0,mid), t.substr(t.length-mid));
	},
	
	get_parsed_date:function(dateStr)
	{
		// examples of dateStr 2007-12-21 23:28:45
		if ('NULL' == dateStr)
		{
			return null;
		}
		var parts = dateStr.split(' ');
		var d = parts[0].split('-');
		var t = parts[1].split(':');
		var dt = new Date(d[0], d[1]-1, d[2], t[0], t[1], t[2]);
		return dt;
	},
	get_microtime:function(t)
	{
		return Math.floor(t.getTime()/1000);
	},
	// 00:00:02.613066 to seconds
	get_parsed_time_difference:function(str)
	{
		parts = str.split(':');
		return 3600*parseInt(parts[0]) + 60*parseInt(parts[1]) + parseInt(parts[2].split('.')[0]);
	},
	
	text_preview:function(str)
	{
		return amy.util.shorten(str, 400).encodeMarkup().replace(/\n/g, '<br/>').replace(/\t/g, '&nbsp; &nbsp; ').replace(/ /g, '&nbsp; ');
	},
	
	filesize:function(bytes)
	{
		var v = Math.round(bytes/1024, 2);
		if ( 0 == v )
		{
			return '? ?'.embed(bytes, $loc('f_bytes'));
		}
		else if ( 1000 < v )
		{
			v = Math.round(bytes/1048576, 2);
			return '? ?'.embed(v, $loc('f_megabytes'));
		}
		return '? ?'.embed(v, $loc('f_kilobytes'));
	},

	bool:function(value)
	{
		return $loc('bool?'.embed(value?'Yes':'No'));
	},
	
	camelize:function(str)
	{
		// hello_controller -> HelloController
		return ('_' + str).camelize();
	},
	
	get_key_combination_symbol:function(key_combination)
	{
		// 65+ctrl+shift -> <img src="mm/i/symbol_ctrl"/><img src="mm/i/symbol_shift"/>A
		var symbol = key_combination.split('+');
		if (/[0-9]*/.test(symbol[0]))
		{
			symbol.push(symbol.shift());
		}
		return symbol.join('+').replace(/[0-9]{2,3}/i, function(){return String.fromCharCode(arguments[0]);}).replace(/ctrl|shift|alt|meta/g, function(){return '<img src="mm/i/symbol_'+arguments[0].toLowerCase()+'.gif" width="12" height="12" align="top"/>';}).replace(/\+/g, '');
	},

	file_basename:function(path)
	{
		return path.split('/').pop();
	}	
}

amy.ui =
{
	showDialog:function(title, width, height, onContentCallback, onCloseCallback)
	{
		var x = Math.floor((fry.ui.info.page.width-width)/2);
		var y = Math.floor((fry.ui.info.page.height-height)/2);
		return amy.ui.showGenericDialog(title, x, y, width, height, 0, onContentCallback, onCloseCallback);
	},
	showGenericDialog: function(title, x, y, width, height, windowType, onContentCallback, onCloseCallback)
	{
		if ( 'undefined' == typeof amy.ui.WDialogView )
		{
			$class('amy.ui.WDialogView < ac.WindowWidgetView');
		}
		amy.ui.WDialogView.prototype.onRenderTitle = function(node, params)
		{
			node.t(title);
		}
		amy.ui.WDialogView.prototype.onRenderContent = onContentCallback;
		// let's define window controller if not previously defined
		if ( 'undefined' == typeof amy.ui.WDialogController )
		{
			$class('amy.ui.WDialogController < ac.WindowWidgetController');
		}
		amy.ui.WDialogController.prototype.onClose = onCloseCallback;
		var options = {isModal:true, hasStatus:true, hasCloseButton:true, defaultSize:{width:width, height:height}, defaultPosition:{x:x, y:y}};
		amy.ui.winDialog = $new
		(
			ac.WindowWidget,
			$new(ac.WindowWidgetModel),
			$new(amy.ui.WDialogView, options),
			$new(amy.ui.WDialogController)
		);
		amy.ui.winDialog.show(null, 'dialog-window');
		ac.widget.focus(amy.ui.winDialog);
		return amy.ui.winDialog;
	}
}
