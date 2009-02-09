/*
 * AC Fry - JavaScript Framework v1.0
 *
 * Data.Calendar extension
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*--------*/

fry.calendar = 
{
	util:
	{
		getUnixTimestamp:function()
		{
			return new Date().getTime()/1000;
		}
	},
	format:
	{
		dateTime:function(d, localeCode)
		{
			var ft = '--';
			if ( 0 >= d )
			{
				return ft;
			}
			try
			{
				if ( 'object' != typeof d)
				{
					// timestamp entered
					d = new Date(d*1000);
				}
				var m = d.getMinutes();
				var time_p = ' '+d.getHours()+':'+(10>m?'0':'')+m;
				switch ( localeCode )
				{
					case 'cs':
					{
						ft = d.getDate()+'.'+(d.getMonth()+1)+' '+d.getFullYear()+time_p
					}; break;
					default:
					{
						ft = (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear()+time_p
					}
				}
			}
			catch(e){}
			return ft;
		}
	}
}

/*--------*/

if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}