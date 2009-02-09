/*
 * AC Fry - JavaScript Framework v1.0
 *
 * Adobe AIR extension
 *
 * (c)2007 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*--------*/

var console = 
{
	log:function()
	{
		console.__puts('log', arguments);
	},
	info:function()
	{
		console.__puts('info', arguments);
	},
	warn:function()
	{
		console.__puts('warn', arguments);
	},
	error:function()
	{
		console.__puts('error', arguments);		
	},
	
	__puts:function(type, args)
	{
		var msg = type+': ';
		var content = args[0];
		if ( 1 < args.length )
		{
			for ( var i=1; i<args.length; i++ )
			{
				var ix = content.indexOf('%');
				if ( -1 == ix )
				{
					break;
				}
				content = content.substr(0, ix)+args[i]+content.substr(ix+1);
			}
		}
		runtime.trace(msg+content);
	}
	
}

/*--------*/
