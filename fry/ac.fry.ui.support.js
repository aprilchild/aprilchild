/*
 * AC Fry - JavaScript Framework v1.0
 *
 * UI Support extension - Snippets/Effects/Path/Mathematics/Animation
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*--------*/

if ( 'undefined' == typeof fry.ui.theme )
{
	fry.ui.theme = {name:'apple'};
}

// declaring default `fry.ui.snippet` namespace
fry.ui.snippet = 
{
	RoundBox:function(width, radius, cssClassName, onContentCallback, surfaceBackgroundColor)
	{
		surfaceBackgroundColor = surfaceBackgroundColor || '#fff';
		var node = $$().n(cssClassName).w(width);
		node.a($$()).n('up-left').s('background-color:?'.embed(surfaceBackgroundColor)).w(width).a($$()).w(width-radius).n('up').a($$()).n('up-right').s('background-color:?'.embed(surfaceBackgroundColor)).w(radius);
		var c_node = node.a($$()).w(width).a($$()).n('inner');
		node.a($$()).n('down-left').s('background-color:?'.embed(surfaceBackgroundColor)).w(width).a($$()).w(width-radius).n('down').a($$()).n('down-right').s('background-color:?'.embed(surfaceBackgroundColor)).w(radius);
		if ( onContentCallback )
		{
			onContentCallback(c_node);
		}
		return node;
	},
	RoundBoxTransparent:function(width, radius, cssClassName, onContentCallback)
	{
		if ( !radius.length )
		{
			// shared radius for x and y
			radius = [radius, radius];
		}
		var node = $$().n(cssClassName).w(width);
		var l_node = node.a($$()).w(width);
		l_node.a($$()).n('up-left').w(radius[0]);
		l_node.a($$()).n('up').w(width-2*radius[0]).pos(true).x(radius[0]).y(0).h(radius[1]);
		l_node.a($$()).n('up-right').w(radius[0]).pos(true).x(width-radius[0]).y(0).h(radius[1]);
		
		var c_node = node.a($$()).w(width).a($$()).n('inner');
		
		l_node = node.a($$()).w(width).pos(true).h(radius[1]);
		l_node.a($$()).n('down-left').w(radius[0]).h(radius[1]);
		l_node.a($$()).n('down').w(width-2*radius[0]).pos(true).x(radius[0]).y(0).h(radius[1]);
		l_node.a($$()).n('down-right').w(radius[0]).pos(true).x(width-radius[0]).y(0).h(radius[1]);
		

		if ( onContentCallback )
		{
			onContentCallback(c_node);
		}
		if ( $__tune.isIE )
		{
		    // stupid IE7 rendering
    		node.s('height:100%');		    
		}
		return node;
	},
	ChangeRoundBox:function(node, cssClassName)
	{
		node.n(cssClassName);
	},
	ShadowedBox:function(width, height, cssClassName, onContentCallback, offsetFromTop)
	{
		offsetFromTop = offsetFromTop || 0;
		var node = $$().n(cssClassName).w(width);
		if ( null != height )
		{
			node.h(height);
		}
		if ( onContentCallback )
		{
			onContentCallback(node);
		}
		fry.ui.snippet.ApplyShadowedBox(node, cssClassName, offsetFromTop);
		return node;
	},
	ApplyShadowedBox:function(node, cssClassName, offsetFromTop, imagePathPrefix)
	{
		cssClassName = cssClassName || 'shadow-box';
		offsetFromTop = offsetFromTop || 0;
		imagePathPrefix = imagePathPrefix || '';
		// adding placeholder
		var placeholder = null;
		if ( 0 != node.$.childNodes.length )
		{
			placeholder = node.ib($$(), node.fc());
		}
		else
		{
			placeholder = node.a($$());
		}
		var h = node.h();
		var w = node.w();
		// 00
		node.ib($$('img'), placeholder).pos(true).x(-12).y(-5).w(17).h(5).sa('src', '?mm/i/theme/?/?-00.png'.embed(imagePathPrefix, fry.ui.theme.name, cssClassName));
		// 01
		node.ib($$(), placeholder).pos(true).x(5).y(-5).w(w-10).h(5).s('background-image:url(?mm/i/theme/?/?-01.png);background-repeat:repeat-x'.embed(imagePathPrefix, fry.ui.theme.name, cssClassName));		
		// 02
		node.ib($$('img'), placeholder).pos(true).x(w-5).y(-5).w(17).h(5).sa('src', '?mm/i/theme/?/?-02.png'.embed(imagePathPrefix, fry.ui.theme.name, cssClassName));
		// 03
		node.ib($$('img'), placeholder).pos(true).x(w).y(0).w(12).h(19).sa('src', '?mm/i/theme/?/?-03.png'.embed(imagePathPrefix, fry.ui.theme.name, cssClassName));
		// 04
		node.ib($$(), placeholder).pos(true).x(w).y(19).w(12).h(h-19).s('background-image:url(?mm/i/theme/?/?-04.png);background-repeat:repeat-y'.embed(imagePathPrefix, fry.ui.theme.name, cssClassName));
		// 05
		node.ib($$('img'), placeholder).pos(true).x(w-20).y(h).w(32).h(18).sa('src', '?mm/i/theme/?/?-05.png'.embed(imagePathPrefix, fry.ui.theme.name, cssClassName));
		// 06
		node.ib($$(), placeholder).pos(true).x(20).y(h).w(w-40).h(18).s('background-image:url(?mm/i/theme/?/?-06.png);background-repeat:repeat-x'.embed(imagePathPrefix, fry.ui.theme.name, cssClassName));		
		// 07
		node.ib($$('img'), placeholder).pos(true).x(-12).y(h).w(32).h(18).sa('src', '?mm/i/theme/?/?-07.png'.embed(imagePathPrefix, fry.ui.theme.name, cssClassName));
		// 08
		node.ib($$(), placeholder).pos(true).x(-12).y(19).w(12).h(h-19).s('background-image:url(?mm/i/theme/?/?-08.png);background-repeat:repeat-y'.embed(imagePathPrefix, fry.ui.theme.name, cssClassName));
		// 09
		node.ib($$('img'), placeholder).pos(true).x(-12).y(0).w(12).h(19).sa('src', '?mm/i/theme/?/?-09.png'.embed(imagePathPrefix, fry.ui.theme.name, cssClassName));
		placeholder.rs();
		delete placeholder;
	},
	ResizeShadowedBox:function(node, width, height)
	{
		node.w(width).h(height);
		node = node.fc()
		// 00
		node = node.ns();
		// 01
		node.w(width-10);
		node = node.ns();
		// 02
		node.x(width-5)
		node = node.ns();
		// 03
		node.x(width);
		node = node.ns();
		// 04
		node.x(width).h(height-19);
		node = node.ns();
		// 05
		node.x(width-20).y(height);
		node = node.ns();
		// 06
		node.y(height).w(width-40);
		node = node.ns();
		// 07
		node.y(height);
		node = node.ns();
		// 08
		node.h(height-19);
		node = node.ns();
	},
	Button:function(type, label, callbackOnClick)
	{
		var node = $$('table').sa('cellSpacing', 0).n('button-?'.embed(type));
		var tr = node.a($$('tbody')).a($$('tr')).n('button-inner');
		tr.a($$('td')).n('l').p().a($$('td')).n('c').a($$('a')).t(label).e('click', callbackOnClick).p().p().a($$('td')).n('r');
		return node;
	},
	TablePairedInfo:function(node, title, keys, callbackOnPair)
	{
		var tbody = node.a($$('table')).n('tab-pair-info').a($$('tbody'));
		if ( '' != title )
		{
			tbody.a($$('tr')).n('title').a($$('td')).sa('colSpan', 2).t(title);
		}
		for ( var i=0; i<keys.length; i++ )
		{
			var pair = keys[i];
			if ( callbackOnPair )
			{
				var pair = callbackOnPair(pair);
			}
			tbody.a($$('tr')).a($$('td')).n('key').t(pair[0]?pair[0]:'--').p().a($$('td')).n('value').t(pair[1]?pair[1]:'--');
		}
	}
}

fry.ui.interval = 
{
	PI:3.14159265358979,
	hPI:1.57079632679,
	
	Linear:function(limit)
	{
		var i = 1;
		this.next = function()
		{
			if ( i > limit )
			{
				return null;
			}
			return i++;	
		}
	},
	SlowDown:function(limit)
	{
		var dx = fry.ui.interval.hPI / limit;
		var i = 0;
		this.next = function()
		{
			if ( i == limit )
			{
				return null;
			}
			return Math.sin(i++*dx)*limit;
		}
	},
	FastSlowDown:function(limit)
	{
		var i = 0;
		this.next = function()
		{
			if ( i == limit )
			{
				return null;
			}
			return 1+limit-limit/(1+i++);
		}
	},
	SlowUp:function(limit)
	{
		var dx = fry.ui.interval.hPI / limit;
		var i = limit;
		this.next = function()
		{
			if ( i == -1 )
			{
				return null;
			}
			return limit - Math.sin(i--*dx)*limit;
		}
	}
}

fry.ui.anim = 
{
	ByFunction:function(interval, waitInterval, func, callback)
	{
		var d = interval.next();
		if ( null != d )
		{
			var pos = func(d);
			if ( $isset(pos.x) )
			{
				this.x(pos.x);
			}
			if ( $isset(pos.y) )
			{
				this.y(pos.y);
			}
			if ( $isset(pos.w) )
			{
				this.w(pos.w);
			}
			if ( $isset(pos.h) )
			{
				this.h(pos.h);
			}
			var caller = this;
			$runafter(waitInterval, function()
			{
				caller.animByFunction(interval, waitInterval, func, callback);
			});
		}
		else
		{
			if ('function' == typeof callback)
			{
				callback();
			}
		}
		return this;
	}
}

for ( var i in fry.ui.anim )
{
	ACNode.prototype['anim'+i] = fry.ui.anim[i];
}

fry.ui.draw = 
{
	Begin:function()
	{
		this.__drawBufferNode = document.createElement('div');
		this.__drawBufferNode.style.position = 'absolute';
		this.__drawBufferNode.style.top = this.__drawBufferNode.style.left = '0';
		this.__drawBufferStack = [];
		return this;
	},
	End:function(discard)
	{
		if ( 'object' != typeof this.__drawBufferNode )
		{
			throw new FryException(409, 'fry/ui/support: Cannot end drawings before starting it. Call the drawBegin() method before drawEnd().')
		}
		if ( discard )
		{
			delete this.__drawBufferNode;
			delete this.__drawBufferStack;
		}
		else
		{
			this.$.appendChild(this.__drawBufferNode);
			if ( 0 < this.__drawBufferStack.length )
			{
				var ht = this.$.innerHTML;
				this.$.innerHTML = ht + this.__drawBufferStack.join('');
			}
			this.drawBegin();
		}
		return this;
	},
	__write:function(node)
	{
		if ( 'object' != typeof node )
		{
			throw new FryException(238, 'fry/ui/support: Invalid object passed as parameter for __write method. Check your drawing primitive code.');
		}
		var is_arr = node instanceof Array;
		if ( 'object' != typeof this.__drawBufferNode )
		{
			// direct draw
			if ( is_arr )
			{
				var ht = this.$.innerHTML;
				this.$.innerHTML = ht + node.join('');
			}
			else
			{
				this.$.appendChild(node);
			}
		}
		else
		{
			// buffered draw
			if ( is_arr )
			{
				this.__drawBufferStack = this.__drawBufferStack.concat(node);
			}
			else
			{
				this.__drawBufferNode.appendChild(node);
			}
		}
	},
	HorizontalLine:function(x, y, w, color, thickness)
	{
		color = color || '#000';
		thickness = thickness || 1;
		this.draw__write( $$().pos(true).s('background:'+color).x(x).y(y).w(w).h(thickness).$ );
		return this;
	},
	VerticalLine:function(x, y, h, color, thickness)
	{
		color = color || '#000';
		thickness = thickness || 1;
		this.draw__write( $$().pos(true).s('background:'+color).x(x).y(y).w(thickness).h(h).$ );
		return this;
	},
	Line:function(x1, y1, x2, y2, color, thickness)
	{
		x1 = Math.floor(x1);
		y1 = Math.ceil(y1);
		x2 = Math.floor(x2);
		y2 = Math.ceil(y2);
		color = color || '#000';
		thickness = thickness || 1;
		var dx = Math.abs(x2-x1);
		var dy = Math.abs(y2-y1);
		var is_h = dx > dy;
		var d = is_h ? dx/dy : dy/dx;
		var n = is_h ? dy : dx;
		var sign = 1;
		var swap = function()
		{
			var ty = y2;
			y2 = y1;
			y1 = ty;
			var tx = x2;
			x2 = x1;
			x1 = tx;			
		}
		if ( is_h )
		{
			if ( x1 > x2 )
			{
				swap();
			}
			if ( y1 > y2 )
			{
				sign = -1;				
			}
		}
		else
		{
			if ( y1 > y2 )
			{
				swap();
			}
			if ( x1 > x2 )
			{
				sign = -1;				
			}
		}
		if ( 0 == n )
		{
			if ( is_h )
			{
				return this.drawHorizontalLine(x1, y1, dx, color, thickness);
			}
			else
			{
				return this.drawVerticalLine(x1, y1, dy, color, thickness);
			}
		}
		var mt = thickness/2;
		var stack = [];
		var dd = Math.ceil(d);
		for ( var i=0; i<n; i++ )
		{
			if ( $__tune.isSafari )
			{
				// Safari has much faster DOM than string manipulation
				var node = document.createElement('div');
				node.style.position = 'absolute';
				node.style.background = color;
				if ( is_h )
				{
					node.style.left = Math.floor(x1+d*i)+'px';
					node.style.top = Math.floor(y1+sign*i-mt)+'px';
					node.style.width = dd+'px';
					node.style.height = thickness+'px';
				}
				else
				{
					node.style.left = Math.floor(x1+sign*i-mt)+'px';
					node.style.top = Math.floor(y1+d*i)+'px';
					node.style.height = dd+'px';
					node.style.width = thickness+'px';
				}
				this.draw__write(node);
			}
			else
			{
				var t = '<div style="position:absolute;background:'+color;
				if ( is_h )
				{
					t += ';left:'+Math.floor(x1+d*i)+'px;';
					t += 'top:'+Math.floor(y1+sign*i-mt)+'px;';
					t += 'width:'+dd+'px;';
					t += 'height:'+thickness+'px';
				}
				else
				{
					t += ';left:'+Math.floor(x1+sign*i-mt)+'px;';
					t += 'top:'+Math.floor(y1+d*i)+'px;';
					t += 'height:'+dd+'px;';
					t += 'width:'+thickness+'px';
				}
				t += ';font:1px arial"></div>';
				stack.push(t);
				// a magic number, it helps Opera and Firefox not to have too big array stack, so we flush it occasionally
				if ( 600 == stack.length )
				{
					this.draw__write(stack);
					stack = [];					
				}
			}
		}
		if ( !$__tune.isSafari )
		{
			this.draw__write(stack);
		}
		return this;
	},
	Polygon:function(points, color, thickness, isOpened)
	{
		var n = points.length;
		if ( 3 > n )
		{
			throw new FryException(989, 'fry/ui/support: Polygon must have at least 3 points.');
		}
		n--;
		mt = 2 < thickness ? thickness/2 : 0;
		mt = 0;
		for ( var i=0; i<n; i++ )
		{
			this.drawLine(points[i][0]+mt, points[i][1]+mt, points[i+1][0], points[i+1][1], color, thickness);
		}
		if ( !isOpened )
		{
			this.drawLine(points[0][0]+mt, points[0][1]+mt, points[n][0], points[n][1], color, thickness);
		}
		return this;
	},
	Circle:function(x, y, radius, outlineColor, fillColor, thickness)
	{
		var qpoints = [];
		var rr = radius*radius;
		for ( var i=0; i<radius; i++ )
		{
			qpoints.push([x+i, y+Math.floor(Math.sqrt(rr-i*i))]);
		}
		qpoints.push([x+radius, y]);
		this.drawPolygon(qpoints, outlineColor, thickness, true);
		$foreach ( qpoints, function(point)
		{
			point[0] = x - (point[0]-x);
		});
		this.drawPolygon(qpoints, outlineColor, thickness, true);
		$foreach ( qpoints, function(point)
		{
			point[1] = y - (point[1]-y);
		});
		this.drawPolygon(qpoints, outlineColor, thickness, true);
		$foreach ( qpoints, function(point)
		{
			point[0] = x + (x-point[0]);
		});
		this.drawPolygon(qpoints, outlineColor, thickness, true);
		delete qpoints;
		return this;
	}
}

for ( var i in fry.ui.draw )
{
	ACNode.prototype['draw'+i] = fry.ui.draw[i];
}

fry.ui.effect = 
{
	Stop:function(node)
	{
		$foreach ((node.ga('fry-effects') || '').split(','), function(effect)
		{
			var m = fry.ui.effect['__stop'+effect];
			if ( m )
			{
				m(node);
			}
		});
	},
	__reg:function(node, effectName)
	{
		node.sa('fry-effects', (node.ga('fry-effects')||'')+',?'.embed(effectName));
	},
	__unreg:function(node, effectName)
	{
		var re = new RegExp();
		re.pattern = '/,?/g'.embed(effectName);
		node.sa('fry-effects', (node.ga('fry-effects')||'').replace(re.pattern, ''));
	},
	Pulsing:function(node, minOpacity, maxOpacity)
	{
		minOpacity = minOpacity || 0.0;
		maxOpacity = maxOpacity || 1.0;
		node.sa('eff-pulsing', node.o());
		node.sa('eff-pulsing-c', 2*Math.random());
		$runinterval(1, 0, 100, function(i, control)
		{
			if ( null != node.ga('eff-pulsing-stop') )
			{
				node.ra('eff-pulsing-stop');
				node.o(node.ga('eff-pulsing'));
				node.ra('eff-pulsing');
				control.stop();
			}
			else
			{
				var c = parseFloat(node.ga('eff-pulsing-c'));
				var o = Math.abs(Math.cos(c));
				if ( o < minOpacity )
				{
					o = minOpacity;
				}
				else if ( o > maxOpacity )
				{
					o = maxOpacity;
				}
				node.o(o);
				node.sa('eff-pulsing-c', c+0.18);
				control.to = i+1;
			}
		});
		fry.ui.effect.__reg(node, 'Pulsing');
	},
	__stopPulsing:function(node)
	{
		if ( node.ga('eff-pulsing') )
		{
			node.sa('eff-pulsing-stop', '1');
		}
		fry.ui.effect.__unreg(node, 'Pulsing');
	},
	FadeOut:function(node, speed, callback)
	{
		speed = speed || 5;
		if ( 0 >= speed )
		{
			return;
		}
		node.sa('eff-fadeout', node.o());
		var offset = node.o()/speed;
		node.sa('eff-fadeout-offset', offset);
		$runinterval(1, speed, 50, function(i, control)
		{
		    if ( !node.is() )
		    {
		        return;
		    }
			if ( speed == i || null != node.ga('eff-fadeout-stop') )
			{
				node.o(0);
				control.stop();
				if ( callback )
				{
					callback(node);					
				}
			}
			node.o(node.o()-parseFloat(node.ga('eff-fadeout-offset')));
		});
		fry.ui.effect.__reg(node, 'FadeOut');
	},
	__stopFadeOut:function(node)
	{
		if ( node.is() && node.ga('eff-fadeout') )
		{
			node.sa('eff-fadeout-stop', '1');
		}
		fry.ui.effect.__unreg(node, 'FadeOut');
	},
	FadeIn:function(node, speed, callback)
	{
		speed = speed || 5;
		if ( 0 >= speed )
		{
			return;
		}
		node.sa('eff-fadein', node.o());
		var offset = node.o()/speed;
		node.sa('eff-fadein-offset', offset);
		node.o(0);
		$runinterval(1, speed, 50, function(i, control)
		{
		    if ( !node.is() )
		    {
		        return;
		    }
			if ( speed == i || null != node.ga('eff-fadein-stop') || !node.is() || null == node.ga('eff-fadein-offset') )
			{
				node.o(1);
				control.stop();
				if ( callback )
				{
					callback(node);					
				}
			}
			node.o(node.o()+parseFloat(node.ga('eff-fadein-offset')));				
		});
		fry.ui.effect.__reg(node, 'FadeIn');
	},
	__stopFadeIn:function(node)
	{
		if ( node.ga('eff-fadein') )
		{
			node.sa('eff-fadein-stop', '1');
		}
		fry.ui.effect.__unreg(node, 'FadeIn');
	}
}


/*--------*/

if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}