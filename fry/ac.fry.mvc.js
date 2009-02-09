/*
 * AC Fry - JavaScript Framework v1.0
 *
 * MVC (Model/View/Controller) extension
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */



/*  ---------------------------------------------------------------- 
	fry.script namespace
*/
fry.script =
{
	buffer:[],
	loaded:false,
	loadcounter:0,
	loadurl:'',
	callback:null,
	prefix:'',
	
	load:function(url)
	{
		var b = fry.script.buffer;
		b[b.length] = fry.script.prefix+url;
	},
	
	__start:function()
	{
		var b = fry.script.buffer;
		for ( var i in b )
		{
			fry.script.__load(b[i]);
			delete b[i];
			$runafter(50, fry.script.__wait);
			return;
		}
		if ( null != fry.script.callback )
		{
			fry.script.callback();
		}			
	},

	__load:function(url)
	{
		console.log('Loading script: %s', url);
		fry.script.loaded = false;
		fry.script.loadcounter = 0;
		fry.script.loadurl = url;
		var n = $$('script').sa('type', 'text/javascript').sa('src', url);
		$(document.documentElement).g('head').a(n);
	},
	
	__wait:function()
	{
		var timeout = 1000;
		if ( $isset(client.conf.loader.timeout) )
		{
			timeout = client.conf.loader.timeout;
		}
		if ( !fry.script.loaded )
		{
			if ( timeout > fry.script.loadcounter++ )
			{
				$runafter(100, fry.script.__wait);
			}
			else
			{
				var msg = 'Error while loading script: ?.'.embed(fry.script.loadurl);
				window.status = msg;
				console.log(msg);
			}
		}
		else
		{
			fry.script.__start();
		}
	},
	
	register:function()
	{
		fry.script.loaded = true;
	}
	
};


if ( $isset(client) )
{
	client.model = {};
	client.view = {};
	client.controller = {};
	client.lc = 
	{
		get: function(token, replacements)
		{
			var s = client.lc.dict[token] || null;
			if ( null == s )
			{
				return 'LC not found `'+token+'`';
			}
			s = s[client.conf.locale] || null;
			if ( null == s )
			{
				return 'LC[`'+client.conf.locale+'`] not found `'+token+'`';
			}
			if ( replacements )
			{
				for ( var i in replacements )
				{
					eval('s = s.replace(/@@'+i+'/g, replacements[i]);');
				}
			}
			if ( -1 != s.indexOf('@@') )
			{
				s = s.replace(/@@[^ ]*/g, ''); 
			}
			return s;
		},
		dict:{}
		
	};
	
	// actionCommand support
	client.controller.actionCommands = [];
	client.controller.addActionCommand = function(callback, params, callee)
	{
		var idCommand = 'acomm'+(new Date().getMilliseconds())+(Math.random()+'').substr(2,4);
		client.controller.actionCommands[idCommand] = [callback, params, callee?callee:this];
		return idCommand;
	}
	client.controller.removeActionCommand = function(idCommand)
	{
		if ( client.controller.actionCommands[idCommand] )
		{
			delete client.controller.actionCommands[idCommand];
		}
	}
	client.controller.performActionCommand = function(idCommand, additionalParameters)
	{
		if ( $isset(client.controller.actionCommands[idCommand]) )
		{
			var command = client.controller.actionCommands[idCommand];
			command[0].call(command[2], idCommand, command[1], additionalParameters);
			// GC
			for ( var i in client.controller.actionCommands )
			{
				if ( !client.controller.actionCommands[i][0] )
				{
					delete client.controller.actionCommands[i];
				}
			}
		}
	}
	client.controller.createActionCommandLink = function(label, c, params)
	{
		var id = client.controller.addActionCommand(c, params);
		return $$('a').sa('href', 'javascript:client.controller.performActionCommand(\'?\')'.embed(id)).t(label).sa('title',label.stripMarkup()).sa('mouseover', 'window.status=\'?\''.embed(label.stripMarkup()));
	}

	// importing most used methods into global namespace, to disable it, set `client.conf.disableGlobalNamespaceImport:true`;
	if ( ! client.conf.disableGlobalNamespaceImport )
	{
		var $include = fry.script.load;
		var $addc = client.controller.addActionCommand;
		var $remc = client.controller.removeActionCommand;
		var $runc = client.controller.performActionCommand;
		var $crec = client.controller.createActionCommandLink;
		var $loc = client.lc.get;
	}
}


$__tune.event.addListener(self, 'load', function(evt)
{
	if ( $isset(client) && $isset(client.conf) )
	{
		var prefix = '';
		$foreach ( $(document.documentElement).g('script'), function(n, i, control)
		{
			var ix = n.$.src.lastIndexOf('ac.fry.mvc.js');
			if ( -1 != ix )
			{
				prefix = n.$.src.substr(0,ix);
				control.stop();
			}
			if ( 'true' != n.ga('loader') )
			{
				return;
			}
			ix = n.$.src.lastIndexOf('/');
			if ( -1 != ix )
			{
				prefix = n.$.src.substr(0,ix+1);
				control.stop();
			}
		});
		if ( !client.conf.loader )
		{
			client.conf.loader = {timeout:50};
		}
		if ( !client.conf.fry.path )
		{
			client.conf.fry.path = 'client/fry/';
		}
		fry.script.prefix = prefix;
		if ( !fry.__production_mode )
		{
			$include('ac.fry.keyboard.js');
			$include('ac.fry.ui.js');
			$include('ac.fry.xml.js');
			$include('ac.fry.data.js');
			$include('ac.fry.ui.widget.js');
		}
		else
		{
			ac.init();
		}
		if ( !client.conf.fry.theme )
		{
			client.conf.fry.theme = 'apple';
		}
		// $include('theme/?.js'.embed(client.conf.fry.theme));
		fry.script.callback = function()
		{
			fry.ui.theme.name = client.conf.fry.theme;
			if ( null != fry_ui_init )
			{
				fry_ui_init();
				fry_ui_init = null;
			}
			console.log('AC Fry Core loaded.');
			if ( client.onload )
			{
				client.onload();
			}
			fry.script.callback = function()
			{
				if ( $isset(client.onstart) )
				{
					if ( 'undefined' != typeof client_lc )
					{
						client.conf.locale = client.conf.locale || 'en';
						client.lc.dict = client_lc;
					}
					client.onstart();
				}
			}
			fry.script.__start();
		}
		fry.script.__start();
	}
});