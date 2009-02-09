/*
 * AC Fry - JavaScript Framework v1.0
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/* Reserving global `fry` object */
var fry = 
{
	version:1.0,
	__production_mode:false
};

// String prototype enhancements
String.prototype.camelize = function()
{
	return this.replace( /([-_].)/g, function(){ return arguments[0].substr(1).toUpperCase();} );
}

String.prototype.decamelize = function()
{
	return this.replace( /([A-Z])/g, function(){ return '-'+arguments[0].toLowerCase();} );
}

String.prototype.trim = function()
{
    return this.replace(/(^\s*)|(\s*$)/g, '' );
}

String.prototype.stripLines = function()
{
	return this.replace( /\n/g, '' );
}

String.prototype.stripMarkup = function()
{
	return this.replace( /<(.|\n)+?>/g, '' );
}

String.prototype.replaceMarkup = function( charRep )
{
	return this.replace( /(<(.|\n)+?>)/g, function()
	{
		var t = '';
		for ( var i=0; i<arguments[0].length; i++ )
		{
			t += charRep;
		}
		return t;
	} );
}

String.prototype.encodeMarkup = function()
{
	return this.replace( /&/g, '&amp;' ).replace( />/g, '&gt;' ).replace( /</g, '&lt;' );
}

String.prototype.decodeMarkup = function()
{
	return this.replace( /&lt;/g, '<' ).replace( /&gt;/g, '>' ).replace( /&amp;/g, '&' );
}

String.prototype.surround = function(t, side)
{
	side = side || 3;
	return (1==1&side?t:'')+this+(2==2&side?t:'');
}

String.prototype.surroundTag = function(t)
{
	return '<'+t+'>'+this+'</'+t+'>';
}

// example of use: var pattern = '? is ?; alert(pattern.embed('Decin', 'sunny')); pattern = '@city is @weather'; alert(pattern.embed({weather:'cloudy', city:'Decin'}))
String.prototype.embed = function()
{
	var t = this;
	if ( 1 == arguments.length && 'object' == typeof arguments[0] )
	{
		// named placeholders
		for ( var i in arguments[0] )
		{
			eval('var re=/@'+i+'/g;');
			t = t.replace(re, arguments[0][i]);
		}
	}
	else
	{
		// anonymous placeholders `?`
		for ( var i=0; i<arguments.length; i++ )
		{
			var ix = t.indexOf('?');
			if ( -1 != ix )
			{
				t = t.substr(0,ix)+arguments[i]+t.substr(ix+1);
				continue;
			}
			break;
		}
	}
	return t;
}

// Tuning helpers - dealing with user-agent differences
var $__tune = 
{
	__prop:{},
	isIE:('function' == typeof window.ActiveXObject),
	isSafari:-1!=navigator.appVersion.indexOf('AppleWebKit'),
	isOpera:-1!=navigator.appName.indexOf('pera'),
	isMac:-1!=navigator.appVersion.indexOf('intosh'),
	isGecko:false,
	node:
	{
		getOpacity:function(node)
		{
		    if ( !node || !node.style )
		    {
		        return 1.0;
		    }
			if ( $__tune.isIE )
			{
				var f = node.style.filter;
				if ( !f || -1 == f.indexOf('alpha') )
				{
					return 1.0;
				}
				return 1.0;
			}
			return parseFloat(node.style[$__tune.isGecko?'MozOpacity':'opacity'] || 1.0);
		},
		setOpacity:function(node, opacity)
		{
		    if ( !node || !node.style )
		    {
		        return;
		    }
		    if ( 0 > opacity )
		    {
		        opacity = 0;
		    }
		    if ( 1 < opacity )
		    {
		        opacity = 1;
		    }
			if ( $__tune.isIE )
			{
				node.style.filter = 'alpha(opacity='+(100*opacity)+')';
			}
			else
			{
				node.style.opacity = opacity;
				node.style.MozOpacity = opacity;
			}
		},
		getPageScrollPosition:function()
		{
			var d = document.documentElement;
			if ( d && d.scrollTop) 
			{
				return [d.scrollLeft, d.scrollTop];
			} 
			else if (document.body) 
			{
				return [document.body.scrollLeft, document.body.scrollTop];
			}
			else
			{
				return [0, 0];
			}
		}
	},
	event:
	{
		get:function(evt, type)
		{
			if ( $notset(evt.target) )
			{
				evt.target = evt.srcElement;
				evt.stopPropagation = function()
				{
					window.event.cancelBubble = true;
				};
			}
			evt.stop = function()
			{
				evt.stopPropagation();
				evt.stopped = true;
			}
			evt.$ = $(evt.target);
			if ( $notset(evt.pageX) )
			{
				evt.pageX = evt.clientX + document.body.scrollLeft;
				evt.pageY = evt.clientY + document.body.scrollTop;
			}
			evt.getOffsetX = function()
			{
				if ( $notset(evt.offsetX) )
				{
					var pos = evt.$.abspos();
					evt.offsetX = evt.pageX - pos.x;
					evt.offsetY = evt.pageY - pos.y;
				}
				return evt.offsetX;
			}
			evt.getOffsetY = function()
			{
				if ( $notset(evt.offsetY) )
				{
					var pos = evt.$.abspos();
					evt.offsetX = evt.pageX - pos.x;
					evt.offsetY = evt.pageY - pos.y;
				}
				return evt.offsetY;				
			}
			evt.isAnyControlKeyPressed = function()
			{
				return evt.metaKey||evt.ctrlKey||evt.altKey||evt.shiftKey;
			}
			evt.KEY_ESCAPE = 27;
			evt.KEY_ENTER = 13;
			evt.KEY_ARR_RIGHT = 39;
			evt.KEY_ARR_LEFT = 37;
			evt.KEY_ARR_UP = 38;
			evt.KEY_ARR_DOWN = 40;
			return evt;
		},
		addListener:function(node, type, listener)
		{
			if ( $__tune.isIE && node.attachEvent )
			{
                node.attachEvent('on'+type, listener);
			}
			else
			{
				node.addEventListener(type, listener, false);
			}
		},
		removeListener:function(node, type, listener)
		{
			if ( node.detachEvent )
			{
                node.detachEvent('on'+type, listener);
                node['on'+type] = null;
			}
			else if ( node.removeEventListener )
			{
				node.removeEventListener(type, listener, false);
			}				
		}		
	},
	behavior:
	{
		disablePageScroll:function()
		{
			if ( $notset($__tune.__prop.page_scroll) )
			{
				$__tune.__prop.page_scroll = [$().s().overflow, $().ga('scroll')];
			}
			$().s('overflow:hidden').sa('scroll', 'no');
		},
		enablePageScroll:function()
		{
			$().s('overflow:auto').sa('scroll', 'yes');
		},
		disableCombos:function()
		{
			$().g('select', function(node)
			{
				node.sa('__dis_combo', node.s().visibility);
				$(node).v(false);
			});
		},
		enableCombos:function()
		{
			$().g('select', function(node)
			{
				node.s({visibility:node.ga('__dis_combo') || 'visible'});
			});
		},
		clearSelection:function()
		{
			try
			{
				if ( window.getSelection )
				{
					if ( $__tune.isSafari )
					{
						window.getSelection().collapse();
					}
					else
					{
						window.getSelection().removeAllRanges();
					}
				}
				else
				{
					if ( document.selection )
					{
						if ( document.selection.empty )
						{
							document.selection.empty();
						}
						else
						{
							if ( document.selection.clear )
							{
								document.selection.clear();
							}
						}
					}
				}
			}
			catch (e) {}
		},
		makeBodyUnscrollable:function()
		{
			$().s('position:fixed').w(fry.ui.info.page.width);
		}
	},
	ui:
	{
		scrollbarWidth:-1!=navigator.appVersion.indexOf('intosh')?15:17
	},
	selection:
	{
		setRange:function(el, selectionStart, selectionEnd)
		{
			if (el.setSelectionRange)
			{
				el.focus();
				el.setSelectionRange(selectionStart, selectionEnd);
			}
			else if (el.createTextRange)
			{
				var range = el.createTextRange();
				range.collapse(true);
				range.moveEnd('character', selectionEnd);
				range.moveStart('character', selectionStart);
				range.select();
			}
		}
	}
}
// some browsers masks its presence having Gecko string somewhere inside its userAgent field...
$__tune.isGecko = !$__tune.isSafari&&!$__tune.isIE&&-1!=navigator.userAgent.indexOf('ecko');
$__tune.isSafari2 = $__tune.isSafari && -1 != navigator.appVersion.indexOf('Kit/4');
$__tune.isSafari3 = $__tune.isSafari && -1 != navigator.appVersion.indexOf('Kit/5');


// Node manipulations

function ACNode(node)
{
	this.$ = node;
	if ( node )
	{
		node.setAttribute('fryis', '1');		
	}
}
// `$$` creates new node
ACNode.prototype.$$ = function(tagName)
{
	return $$(tagName);
}
// *is* - tells whether node is a part of the active DOM tree (that is displayed on page). Node may exist only in memory before appending or after removing when references, in which case node.is() will return false.
ACNode.prototype.is = function()
{
	return this.$ && null != this.$.parentNode;
}
// *i*d
ACNode.prototype.i = function(id)
{
	if ( 'undefined' == typeof id )
	{
		return this.$.id||'';
	}
	this.$.id = id;
	return this;
}
// class *n*ame
ACNode.prototype.n = function(n)
{
	if ( 'undefined' == typeof n)
	{
		return this.$.className||'';
	}
	this.$.className = n;
	return this;
}
// *e*vent listener, if called with one argument only, previously registered listeners are removed
ACNode.prototype.e = function(t, c, oneUseOnly)
{
	var ser_type_id = 'fryse-'+t;
	if ( !c )
	{
		if ( null != this.$.getAttribute(ser_type_id) )
		{
			var ser_listeners = this.$.getAttribute(ser_type_id).split(',');
	//		console.log('*E* removing listeners for %s, listeners: %s', t, ser_listeners);
			for ( var i=0; i<ser_listeners.length; i++ )
			{
				$__tune.event.removeListener(this.$, t, self[ser_listeners[i]]);
				self[ser_listeners[i]] = null;
			}
			this.$['on'+t] = null;
			this.$.removeAttribute(ser_type_id);
		}
		return this;
	}
	var hash = t+(''+Math.random()).substr(2);
	var ser_listeners = null != this.$.getAttribute(ser_type_id) ? this.$.getAttribute(ser_type_id).split(',') : [];
	ser_listeners.push(hash);
	this.$.setAttribute(ser_type_id, ser_listeners.join(','));
//	console.log('*E* add listener self.%s for %s', hash, t);
	self[hash] = function(evt)
	{
		evt.removeListener = function()
		{
			$__tune.event.removeListener(evt.$.$, t, self[hash]);
//			console.log('*E* remove listener self.%s for %s', hash, t);
			c = null;
			evt = null;
			self[hash] = null;
		}
		evt = evt || self.event;
		if ( null != c )
		{
			c($__tune.event.get(evt));			
		}
		if ( null != evt )
		{
			if ( oneUseOnly )
			{
				evt.removeListener();
				return;
			}
			else if ( evt.stopped )
			{
//				console.log('*E* stop self.%s for %s', hash, t);
				evt = null;				
			}
		}
	};
	this.$.setAttribute('fryhe', 1);
	$__tune.event.addListener(this.$, t, self[hash]);
	return this;
}

function __fry_esupressed(evt)
{
	evt = evt || self.event;
	if ( !evt.stopPropagation )
	{
		evt.cancelBubble = true;
	}
	else
	{
		evt.stopPropagation();
	}
	evt = null;
	return false;
}
// *e*vent *s*upressed - special case when you want to receive an event, do nothing about it and stop it from propagating
ACNode.prototype.es = function(t)
{
	if ( $__tune.isIE && this.$.attachEvent )
	{
        this.$.attachEvent('on'+t, __fry_esupressed);
	}
	else if ( this.$.addEventListener )
	{
		this.$.addEventListener(t, __fry_esupressed, false);
	}
}
// *x* coordinate
ACNode.prototype.x = function(x)
{
	if ( 'undefined' == typeof x )
	{
		return parseInt(this.$.style.left||0);
	}
	this.$.style.left = x+'px';
	return this;
}
// *y* coordinate
ACNode.prototype.y = function(y)
{
	if ( 'undefined' == typeof y )
	{
		return parseInt(this.$.style.top||0);
	}
	this.$.style.top = y+'px';
	return this;
}
// *abs*olute page *pos*ition coordinates (you can optionally specify node to which the position is calculated), returns {x:, y:} coordinates
ACNode.prototype.abspos = function(n)
{
	if ( document.getBoxObjectFor )
	{
		var p = document.getBoxObjectFor(this.$);
		return {x:p.x, y:p.y};
	}
	if ( this.$.getBoundingClientRect )
	{
		var p = this.$.getBoundingClientRect();
		return {x:p.left+(document.documentElement.scrollLeft || document.body.scrollLeft), y:p.top+(document.documentElement.scrollTop || document.body.scrollTop)};
	}
	var p = {x:0, y:0};
	var n2 = this.$;
	while ( document.body != n2 && document != n2 && n != n2 )
	{
		p.x += n2.offsetLeft - n2.scrollLeft;
		p.y += n2.offsetTop - n2.scrollTop;
		if ( n2.offsetParent )
		{
			n2 = n2.offsetParent;
		}
		else
		{
			n2 = n2.parentNode;
		}
	}
	return p;
}
// *pos*ition, if true - absolute, false - relative
ACNode.prototype.pos = function(p)
{
	if ( 'undefined' == typeof p )
	{
		return 'absolute' == this.$.style.position;
	}
	this.$.style.position = p ? 'absolute' : 'relative';
	return this;
}
// *z*-index coordinate
ACNode.prototype.z = function(z)
{
	if ( 'undefined' == typeof z )
	{
		return parseInt(this.$.style.zIndex||0);
	}
	this.$.style.zIndex = z;
	return this;
}
// *w*idth
ACNode.prototype.w = function(w)
{
	if ( 'undefined' == typeof w )
	{
		return parseInt(this.$.style.width||this.$.offsetWidth);
	}
	this.$.style.width = w+'px';
	return this;
}
// *h*eight
ACNode.prototype.h = function(h)
{
	if ( 'undefined' == typeof h )
	{
		return parseInt(this.$.style.height||this.$.offsetHeight);
	}
	this.$.style.height = h+'px';
	if ( $__tune.isIE && 8 > h )
	{
		this.$.style.fontSize = '1px';
	}
	return this;
}
// *s*tyle information - argument can be either "{color:'red', backgroundColor:'blue'}" or "'color:red;background-color:blue'"
ACNode.prototype.s = function(s)
{
	if ( 'undefined' == typeof s )
	{
		return this.$.style;
	}
	if ( 'object' == typeof s )
	{
		for ( var n in s )
		{
			this.$.style[n] = s[n];
		}
	}
	else if ( 'string' == typeof s )
	{
		if ( '' != s )
		{
			var styles = s.split(';');
			for ( var i=0; i<styles.length; i++ )
			{
				var style = styles[i].split(':');
				if ( 2 == style.length )
				{
					this.$.style[style[0].trim().camelize()] = style[1].trim();
				}
			}
		}
	}
	return this;
}
// *o*pacity
ACNode.prototype.o = function(o)
{
	if ( 'undefined' == typeof o )
	{
		return $__tune.node.getOpacity(this.$);
	}
	$__tune.node.setOpacity(this.$, o);
	return this;
}
// *d*isplay
ACNode.prototype.d = function(d)
{
	if ( 'undefined' == typeof d )
	{
		return 'none' != this.$.style.display;
	}
	this.$.style.display = d ? 'block' : 'none';
	return this;						
}
// *v*isibility
ACNode.prototype.v = function(v)
{
	if ( 'undefined' == typeof v )
	{
		return 'hidden' != this.$.style.visibility;
	}
	this.$.style.visibility = v ? 'visible' : 'hidden';
	return this;			
}
// H*T*ML source (equivalent to infamous innerHTML, remember innerHTML is not considered *evil* here - see the KISS principle, plus it's actually faster than DOM)
ACNode.prototype.t = function(t)
{
	if ( 'undefined' == typeof t )
	{
		return this.$.innerHTML;
	}
	this.rc();
	this.$.innerHTML = t;
	return this;
}
// *p*arent node
ACNode.prototype.p = function(p)
{
	if ( 'undefined' == typeof p )
	{
		return $(this.$.parentNode);
	}
	return $(p).a(this);
}
// *g*et child node(s), the format of a query might be either `[['table',0],['tr',2],['td',4]]`, `['table',['tr',2],['td',4]]`, 'table:0/tr:2/td:4' or 'table/tr:2/td:4'. you can use `*` in path for any node
ACNode.prototype.g = function(q)
{
	var lst = [];
	if ( 'string' == typeof q )
	{
		var qt = q.split('/');
		q = [];
		for ( var i=0; i<qt.length; i++ )
		{
			var qtt = qt[i].split(':');
			q[q.length] = qtt;
		}
	}
	var lookup = function(node, qIndex)
	{
		if ( !node )
		{
			return;
		}
		var qq = q[qIndex];
		var is_final_index = q.length-1 == qIndex;
		var ls = node.getElementsByTagName(qq[0]);
		var num = ls.length;
		if ( 2 == qq.length )
		{
			// specific node required
			if ( is_final_index )
			{
				// store results
				lst.push($(ls.item(parseInt(qq[1]))));
			}
			else
			{
				lookup(ls.item(parseInt(qq[1])), qIndex+1);
			}
		}
		else
		{
			// all nodes required
			for ( var i=0; i<num; i++ )
			{
				if ( is_final_index )
				{
					lst.push($(ls.item(i)));
				}
				else
				{
					lookup(ls.item(i), qIndex+1);
				}
			}
		}
		ls = null;
	}
	lookup(this.$, 0);
	lookup = null;
	var num = lst.length;
	if ( 1 == num )
	{
		return lst[0];
	}
	else if ( 0 == num )
	{
		lst = null;
	}
	return lst;
}
// *g*et *p*arent node at some path - allows for returning grand-grand-grand...parent node. imagine node tree: `div>div>table>tbody>tr>td>` and node at `td`
// to return second div you would call `gp('tr/tbody/table/div')` or `tr/table/div:1`, first div could be acquired using `table/div:2` etc. you can use `*` for any node.
ACNode.prototype.gp = function(q)
{
	if ( 'string' == typeof q )
	{
		q = q.split('/');
	}
	var fq = [];
	for ( var i=0; i<q.length; i++ )
	{
		if ( -1 != q[i].indexOf(':') )
		{
			q[i] = q[i].split(':');
			for ( var ii=0; ii<q[i][1]; ii++ )
			{
				fq.push(q[i][0]);
			}
		}
		else
		{
			fq.push(q[i]);
		}
	}
	var c = 0;
	var p = this.$;
	while ( p && c < fq.length)
	{
		p = p.parentNode;
		if ( '*' == fq[c] || fq[c] == p.tagName.toLowerCase() )
		{
			c++;
		}
	}
	return $(p);
}
// *a*ppends child node
ACNode.prototype.a = function(n)
{
	if ( 'undefined' != typeof n['$'] )
	{
		n = n.$;
	}
	return $(this.$.appendChild(n));
}
// *a*ppend H*T*ML code - adds innerHTML to existing node code
ACNode.prototype.at = function(t)
{
	var ht = this.$.innerHTML;
	this.$.innerHTML = ht + t;
	return this;
}
// *r*emoves child node
ACNode.prototype.r = function(n)
{
	n = $(n);
	if ( null != n && n.is() )
	{
		n.rs();
	}
	return this;
}
// *r*emove *c*hildren
ACNode.prototype.rc = function()
{
	if ( !this.$ )
	{
		return this;
	}
	__fry_gcnode(this.$, true);
	return this;
}
// *r*emoves *s*elf - ! does not return self - therefor the call to .rs() must always be the last in a pipe
ACNode.prototype.rs = function()
{
	if ( !this.$ )
	{
		return;
	}
	__fry_gcnode(this.$);
	this.$ = null;
}
// *i*nserts *c*hild node before specific referenced node (rn)
ACNode.prototype.ib = function(n, rn)
{
	if ( 'undefined' != typeof n['$'] )
	{
		n = n.$;
	}
	if ( 'undefined' != typeof rn['$'] )
	{
		rn = rn.$;
	}
	return $(this.$.insertBefore(n,rn));
}
// *i*nserts *c*hild node after specific referenced node (rn)
ACNode.prototype.ia = function(n, rn)
{
	if ( 'undefined' != typeof n['$'] )
	{
		n = n.$;
	}
	if ( null == $(rn).ns() )
	{
		return $(this.$.appendChild(n));
	}
	else
	{
		return $(this.$.insertBefore(n,($(rn).ns()).$));
	}
}
// *f*irst *c*hild of the node - always returns first $-ed node (ignoring text, comment etc. nodes)
ACNode.prototype.fc = function()
{
	if ( !this.$ )
	{
		return null;
	}
	var n = this.$.firstChild;
	while ( null != n && 1 != n.nodeType )
	{
		n = n.nextSibling;
	}
	return null != n ? $(n) : null;
}
// *l*ast *c*hild of the node - always returns last $-ed node (ignoring text, comment etc. nodes)
ACNode.prototype.lc = function()
{
	if ( !this.$ )
	{
		return null;
	}
	var n = this.$.lastChild;
	while ( null != n && 1 != n.nodeType )
	{
		n = n.previousSibling;
	}
	return null != n ? $(n) : null;			
}
// *n*ext *s*ibling of the node - always returns first $-ed node (ignoring text, comment etc. nodes)
ACNode.prototype.ns = function()
{
	var n = this.$.nextSibling;
	while ( null != n && 1 != n.nodeType )
	{
		n = n.nextSibling;
	}
	return null != n ? $(n) : null;
}
// *p*revious *s*ibling of the node - always returns last $-ed node (ignoring text, comment etc. nodes)
ACNode.prototype.ps = function()
{
	var n = this.$.previousSibling;
	while ( null != n && 1 != n.nodeType )
	{
		n = n.previousSibling;
	}
	return null != n ? $(n) : null;			
}
// *g*et *a*ttribute
ACNode.prototype.ga = function(n)
{
    if ( !this.$ )
    {
        return null;
    }
	return this.$.getAttribute(n);
}
// *s*et *a*ttribute
ACNode.prototype.sa = function(n, v)
{
	this.$.setAttribute(n, v);
	return this;
}
// *r*emove *a*ttribute
ACNode.prototype.ra = function(n)
{
	this.$.removeAttribute(n);
	return this;
}
// *dup*licate node
ACNode.prototype.dup = function()
{
	return $(this.$.cloneNode(true));
}

// `$_` converts any value into string - useful for numeric values before calling for String enhanced methods.
var $_ = function(t)
{
	return ''+t;
}

// `$$` creates new node with specified tag name, returns $-ed node
var $$ = function(n)
{
	return $(document.createElement(n||'div'));
}

// returns $-ed node for existing node, argument can be either ID string or node itself (standard or $-ed). If argument is omitted, returns the body node
var $ = function(id)
{
	if ( 'undefined' == typeof id )
	{
		return $(document.body || document.getElementsByTagName('body').item(0));
	}
	if ( 'undefined' == id || null == id )
	{
		return null;
	}
	if ( 'object' != typeof id )
	{
		return new ACNode(document.getElementById(id));
	}
	else
	{
		if ( id instanceof ACNode )
		{
			return id;
		}
		if ( 1 != id.nodeType )
		{
			return null;
		}
		return new ACNode(id);
	}
}

// Language constructs

/*  $class
	======
	Creates new class, multiple class inheritance is allowed.
	Usage:
	
	$class('AClass',
	{
		construct:function(a)
		{
			this.a = a || '';
		},
		destruct:function()
		{
			$delete(this.a);
		}
	});
	AClass.prototype.hello = function(msg)
	{
		alert(msg + this.a);
	}
	$class('BClass < AClass',
	{
		construct:function(a, b)
		{
			this.b = b || '';
		}
	});
	$class('CClass');
	$class('DClass < BClass, CClass');
	DClass.prototype.hello = function(msg, msg2)
	{
		$call(this, 'AClass.hello', msg);
		alert(msg2 + this.b);
	}
*/
var $class = function(className, methods)
{
	if ( 'string' != typeof className )
	{
		throw new FryException(29, 'Class inheritance error. Undefined class name.');
	}
	var n = className.split('<');
	className = n[0].replace(/ /g, '');
	var bases = [];
	if ( 1 == n.length )
	{
		// no inheritance, will inherit from `Object`
		bases[0] = 'Object';
	}
	else
	{
		// defined inheritance, might be multiple eg. `ClassA < ClassB, ClassC`
		bases = n[1].split(',');
	}
	var getSource = function(s)
	{
		s = ''+s;
		return s.substring(s.indexOf('{')+1, s.lastIndexOf('}'));
	}
	var getParams = function(s, p)
	{
		p = p || {};
		s = ''+s;
		s = s.substring(s.indexOf('(')+1, s.indexOf(')')).split(',');
		for ( var i in s )
		{
			var n = s[i].replace(/ /g, '');
			if ( !p[n] && '' != n )
			{
				p[n] = true;
			}
		}
		return p;
	}
	var preprocessSource = function(s, cn)
	{
		// parsing source code and replacing calls to base constructor or methods
		eval('var re = /'+cn+'\.([^\\(]*)\\(([\\)]*)/g;');		
		s = s.replace(re, function()
		{
			return 'this.__'+cn+'_'+arguments[1]+'.call(this'+(''==arguments[2].replace(/ /g, '')?',':'')+arguments[2];
		});
		eval('re = /'+cn+'[^\\(]*\\(([\\)]*)/g;');
		s = s.replace(re, function()
		{
			return 'this.__'+cn+'_construct.call(this'+(''==arguments[1].replace(/ /g, '')?',':'')+arguments[1];
		});
		return s;
	}	
	methods = methods || {};
	var c_code = '';
	var d_code = '';
	var params = {};
	for ( var i in bases )
	{
		bases[i] = bases[i].replace(/ /g, '');
		if ( 'Object' == bases[i] )
		{
			continue;
		}
		eval('var b_code='+bases[i]+';');
		params = getParams(b_code, params);
		b_code = getSource(b_code);
		c_code += b_code+';';
		eval('var d_code='+bases[i]+'.prototype.destruct||"{}";');
		d_code = getSource(d_code);
		d_code += d_code+';';
	}
	params = getParams(methods.construct||'', params);
	var p = [];
	for ( var i in params)
	{
		p.push(i);
	}
	if ( methods.construct )
	{
		// own constructor defined
		oc_code = getSource(methods.construct);
		for ( var i in bases )
		{
			if ( 'Object' != bases[i] )
			{
				oc_code = preprocessSource(oc_code, bases[i]);				
			}
		}
		c_code += oc_code;
	}	
	d_code += methods.destruct ? getSource(methods.destruct) : '';
	try
	{
		eval('var newClass=function('+p.join(',')+'){'+c_code+'};');		
	}
	catch (e)
	{
		throw new FryException(30, 'Class inheritance error. Class `?`, constructor: `?`, error message: `?`.'.embed(className, c_code, e));
	}
	newClass.prototype = new Object();
	for ( var i in bases )
	{
		if ( 'Object' == bases[i] )
		{
			continue;
		}
		// creating links to base class methods
		var p_base = bases[i].replace(/\./g, '_');
		eval('for(var m in '+bases[i]+'.prototype){newClass.prototype[m]='+bases[i]+'.prototype[m]; if ("__" !=m.substr(0,2)) {newClass.prototype["__'+p_base+'_"+m]='+bases[i]+'.prototype[m];}}');
	}
	// creating class metadata for reflection
	newClass.prototype.__class_name = className;
	newClass.prototype.__base_class_names = bases;
	eval('newClass.prototype.construct=function('+p.join(',')+'){'+c_code+'};')
	eval('newClass.prototype.destruct=function(){'+d_code+'};')
	eval(className+'=newClass');
}


// $new
// ====
// Creates new object.
// Usage: $new(ClassName, [arguments])
var $new = function()
{
	if ( !arguments[0] )
	{
		throw new FryException(31, 'Object instantiation error. Invalid class provided `?`.'.embed(arguments[0]));
	}
	var arg_list = [];
	for ( var i=1; i<arguments.length; i++ )
	{
		arg_list.push('arguments['+i+']');
	}
	try
	{
		eval('var obj = new arguments[0]('+arg_list.join(',')+');');
	}
	catch(e)
	{
		throw new FryException(32, 'Object instantiation error. Class: `?`, num arguments: `?`, error message: `?`.'.embed(arguments[0].prototype.__class_name, arg_list.length, e));
	}
	return obj;
}

// $delete
// =======
// Safely deletes object (destructors of each base class are called automatically).
// Usage: $delete(object)
var $delete = function(object)
{
	if ( 'object' != typeof object )
	{
		return;
	}
	try
	{
		if ( 'string' == typeof object.__base_class_names )
		{
			var bases = object.__base_class_names.split(',');
			for ( var i in bases )
			{
				if ( 'Object' != bases[i] )
				{
					$call(object, bases[i]+'.destruct()');				
				}
			}
		}
		if ( object.destruct )
		{
			object.destruct();
		}
		delete object;
	}
	catch(e)
	{
	}
}

// $call
// =====
// Calls a method/function of specific object, typically used from within method to call some base class method.
// Usage: $call(this, 'AClass.aMethod', [arguments])
var $call = function()
{
	caller = arguments[0];
	var arg_list = [];
	for ( var i=2; i<arguments.length; i++ )
	{
		arg_list.push('arguments['+i+']');
	}
	try
	{
		eval('var r = caller.__'+arguments[1].replace(/\./g, '_')+'.call(caller'+(0!=arg_list.length?',':'')+arg_list.join(',')+');');
	}
	catch (e)
	{
		throw new FryException(32, 'Function call error. Function `?`, num arguments: ?, error: `?`.'.embed(arguments[1], arguments.length-2, e));
	}
	return r;
}

// $runafter
// =========
// Runs embedded code after specified interval (in miliseconds, value 1000 means 1 second).
/* Usage:
	$runafter(100, function()
	{
		// your code
	})
*/
var $runafter = function(t, c)
{
	setTimeout(c, t);
}
// $runinterval
// ============
// Runs embedded code from step `from` to the `to` step, each step is delayed for specified interval.
/* Usage:
	$runinterval(1, 10, 100, function(step)
	{
		// your code that will repeat ten times
	})
*/
var $runinterval = function(from, to, interval, c)
{
	var i = from;
	var control = 
	{
		from:from,
		to:to,
		stopped:false,
		stop:function()
		{
			this.stopped = true;
		}
	}
	var t = self.setInterval(function()
	{
		if ( i > to && to>=from )
		{
			self.clearInterval(t);
		}
		else
		{
			c(i, control);
			if ( control.stopped )
			{
				self.clearInterval(t);
			}
		}
		i++;
	}, interval);
}
// $dotimes
// ========
// Repeats embedded code n times.
/* Usage:
	$dotimes(20, function(i)
	{
		// your code, i is the counter parameter
	})
*/
var $dotimes = function(n, c)
{
	for ( var i=0; i<n; i++ )
	{
		c(i);
	}
}
// $foreach
// ========
// Iterates through any kind of collection - it can be practically anything you might need, from arrays, serialized XML, DOM nodes, remote results etc.
/* Usage:
	$foreach ( node.g('table/tr'), function(tr, i, control)
	{
		if ( 5 > i )
		{
			control.skip();
			return;
		}
		tr.n(0==i%2 ? 'even' : 'odd');
		if ( 20 < i )
		{
			control.stop();
		}
	})
*/
var $foreach = function(o, c)
{
	if ( !o )
	{
		c = null;
		return;
	}
	if ( 'undefined' == typeof o.length && 'function' != typeof o.__length )
	{
		c = null;
		return;
	}
	var n = 'function' == typeof o.__length ? o.__length() : o.length;
	var control = 
	{
		stopped:false,
		stop:function()
		{
			this.stopped = true;
		},
		skipped:false,
		skip:function()
		{
			this.skipped = true;
		},
		removed:false,
		remove:function(stopAfterwards)
		{
			this.removed = true;
			this.stopped = true == stopAfterwards;
		}
	}
	// cannot just extend Array.prototype for `item()` method due bug in IE6 iteration mechanism. Some day (>2010 :) this might get fixed and will become obsolete
	for ( var i=0; i<n; i++ )
	{
		var item = null;
		if ( 'function' == typeof o.item )
		{
			item = o.item(i);
		}
		else if ( 'function' == typeof o.__item )
		{
			item = o.__item(i);
		}
		else
		{
			if ( 'undefined' == typeof o[i] )
			{
				continue;
			}
			item = o[i];
		}
		c(item, 'function' == typeof o.__key ? o.__key(i) : i, control);
		if ( control.removed )
		{
			control.removed = false;
			if ( 'undefined' != typeof o[i] )
			{
				delete o[i];
			}
			else
			{
				if ( 'function' == typeof o.removeItem )
				{
					o.removeItem(i);
				}
				else if ( 'function' == typeof o.__remove )
				{
					o.remove(i);
				}
			}
		}
		if ( control.stopped )
		{
			break;
		}
		if ( control.skipped )
		{
			control.skipped = false;
			continue;
		}
	}
	control = null;
	c = null;	
}
var $notset = function(value)
{
	return ( 'undefined' == typeof value || 'undefined' == value || null == value );
}
var $isset = function(value)
{
	return ( 'undefined' != typeof value && 'undefined' != value && null != value );
}
var $getdef = function(value, defaultValue)
{
	if ( 'undefined' == typeof value || 'undefined' == value || null == value )
	{
		return defaultValue;
	}
	return value;
}

var $combofill = function(n, c)
{
	var i = -1;
	n = $(n);
	while (-1<++i)
	{
		var v = c(i);
		if ( 'object' != typeof v )
		{
			break;
		}
		var option = n.a($$('option')).t(v[1]);
		option.$.value = v[0];
		if ( v[2] )
		{
			option.sa('selected', 'selected');
		}
	}
	return n;
}
var $comboget = function(n)
{
	var v = [];
	var options = $(n).$.options;
	for ( var i=0; i<options.length; i++ )
	{
		if ( '' != options[i].selected )
		{
			v[v.length] = options[i].value;
		}
	}
	if ( 1 == v.length )
	{
		return v[0];
	}
	if ( 0 == v.length && 0 < options.length )
	{
		return options[0].value;
	}
	return v;
}
var $comboset = function(n, v)
{
	var options = $(n).$.options;
	try
	{
		for ( var i=0; i<options.length; i++ )
		{
			if ( options[i].value == v )
			{
				options[i].selected = 'selected';
			}
		}
	}
	catch(e)
	{
	}
	return $(n);
}





/* Generic exception object */
function FryException(code, message)
{
	this.code = code;
	this.message = message;
}
FryException.prototype.toString = function()
{
	return 'Fry Exception: code[?] message[?]'.embed(this.code, this.message);
}

/* Remote call support (AJAX) */
fry.remote =
{
	support:
	{
		getRequestObject: function()
		{
			var obj = null;
			try
			{
				if ( $__tune.isIE )
				{
					$foreach ( ['MSXML2.XMLHTTP.5.0', 'MSXML2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0','MSXML2.XMLHTTP','Microsoft.XMLHTTP'], function(progid, index, control)
					{
						try
						{
							obj = new ActiveXObject(progid);
							control.stop();
						}
						catch(e){}
					});
				}
				else
				{
					obj = new XMLHttpRequest();
				}
			}
			catch(e){}
			return obj;
		}
	},
	/* Loosely based (especially status handling code) on YUI Library */
	post:function(callback, pars, httpMethod, url)
	{
		url = url || client.conf.fry.backendURL;
		if ( !url )
		{
			throw new FryException(1, 'Undefined backend URL specified in client.conf. Use client.conf.fry.backendURL=\'{YOUR_BACKEND_SCRIPT_URL}\'; to set it.');
		}
		var obj = fry.remote.support.getRequestObject();
		if ( !obj )
		{
			throw new FryException(2, 'Unable to acquire HTTP request object. Check to see if your browser is among supported browsers.');
		}
		if ( -1 != url.indexOf('?') )
		{
			url = url.embed(pars['a']);
			delete pars['a'];
		}
		obj.open(httpMethod||'POST', url, true);
		obj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		var postData = '';
		for ( var name in pars )
		{
			var value = pars[name];
			if ( 'object' == typeof value )
			{
				if ( value.join )
				{
					// array
					var n = value.length;
					for ( var i=0; i<n; i++ )
					{
						value[i] = (''+value[i]).replace(/\],\[/g, '`§~§[]§~§`');
					}
					value = '['+value.join('],[')+']';
					name += '(a)';
				}
				else
				{
					// object
					var values = '[';
					for ( var i in value )
					{
						values += i+'='+(''+value[i]).replace(/\],\[/g, '`§~§[]§~§`')+'],[';
					}
					value = '[' == values ? '' : values.substring(0, values.length-2);
					name += '(o)';
				}
			}
			postData += encodeURIComponent(name)+'='+encodeURIComponent(value)+'&';
		}
		obj.send(postData);
		var poll = window.setInterval
		(
			function()
			{
				if ( 4 == obj.readyState )
				{
					window.clearInterval(poll);
					callback(obj);
				}
			},
			150
		);
	},	
	result:function(s, callbackOk, callbackError)
	{
		var httpStatus;
		var responseObject;	
		try
		{
			httpStatus = s.status;
		}
		catch(e)
		{
			httpStatus = 13030;
		}
		if ( 200 == httpStatus )
		{
			// parsing response
			var r = null;
			var headers = s.getAllResponseHeaders();
			var contentType = (-1 != headers.indexOf('/xml') && s.responseXML) ? 'text/xml' : 'text/html';
			if ( 'text/xml' == contentType )
			{
				// text/xml
				try
				{
					r = $xmlserialize(s.responseText);
				}
				catch(e)
				{
					callbackError('Error while serializing remote-side response. Probably corrupted data. Error: `?`. Sent data `?`.'.embed(e.message, s.responseText));
				}
				try
				{
					callbackOk(r);					
				}
				catch(e)
				{
					throw new FryException(45, 'fry/remote: Error while executing callback after successful remote call. Error: `?`.'.embed(e.message));
				}
			}
			else
			{
				// text/html
				var code = s.responseText.substring(0,3);
				if ( '#S#' == code )
				{
					r = s.responseText.substr(3);
					callbackOk( r );
				}
				else
				{
					if ( '' == s.responseText )
					{
						callbackError('No data returned from remote side.');
					}
					else
					{
						callbackError('Invalid data returned from remote side: `?`.'.embed(s.responseText.substr('#E#'==code?3:0)));
					}					
				}
			}
		}
		else
		{
			switch (httpStatus)
			{
				// The following case labels are wininet.dll error codes that may be encountered.
				// Server timeout
				case 12002:
				// 12029 to 12031 correspond to dropped connections.
				case 12029:
				case 12030:
				case 12031:
				// Connection closed by server.
				case 12152:
				// See above comments for variable status.
				case 13030:
				default:
				{
					if ( callbackError )
					{
						callbackError('Connection ended up with status: '+httpStatus);
					}
				};break;
			}
		}
		delete s;
	},
	upload:
	{
		lastAdapter:null,
		// using SWFUpload component
		perform:function(adapter)
		{
			var url = client.conf.fry.backendURL;
			if ( !url )
			{
				throw new FryException(19, 'Undefined backend URL specified in client.conf. Use client.conf.fry.backendURL=\'{YOUR_BACKEND_SCRIPT_URL}\'; to set it.');
			}

			fry.remote.upload.lastAdapter = adapter;
			if ( null != $('SWFUpload') )
			{
				$('SWFUpload').rs();
			}
			$().a($$()).i('SWFUpload');
			mmSWFUpload.init
			({
				thirdPartyPath : client.conf.fry.path+'3rdparty',
				upload_backend : url+'?a='+adapter.onGetRemoteActionName(),
				target : 'SWFUpload',
				allowed_filesize : adapter.allowedFileSizeInKBytes,
				allowed_filetypes : adapter.allowedFileTypes,
				upload_start_callback : 'fry_remote_upload_onStart',
				upload_progress_callback : 'fry_remote_upload_onProgress',
				upload_complete_callback : 'fry_remote_upload_onComplete',
				upload_error_callback : 'fry_remote_upload_onError',
				upload_cancel_callback : 'fry_remote_upload_onCancel',
				upload_queue_complete_callback : 'fry_remote_upload_onQueueComplete'
			});
			$('SWFUpload').pos(true).x(1).y(1).w(1).h(1);
			mmSWFUpload.callSWF();
		}
	}
};

function fry_remote_upload_onStart(f)
{
	fry.remote.upload.lastAdapter.onStart(f);
}
function fry_remote_upload_onProgress(f, b)
{
	fry.remote.upload.lastAdapter.onProgress(f, b);
}
function fry_remote_upload_onComplete(f)
{
	fry.remote.upload.lastAdapter.onEnd(false, false, f);
}
function fry_remote_upload_onError(e)
{
	fry.remote.upload.lastAdapter.onEnd(false, true, e);
}
function fry_remote_upload_onCancel()
{
	fry.remote.upload.lastAdapter.onEnd(true);
}
function fry_remote_upload_onQueueComplete()
{
	fry.remote.upload.lastAdapter.onQueueEnd();
}



$class('fry.remote.upload.Adapter',
{
	construct:function(allowedFileSizeInKBytes, allowedFileTypes, additionalRemoteActionParams)
	{
		this.allowedFileSizeInKBytes = allowedFileSizeInKBytes || 2000;
		this.allowedFileTypes = allowedFileTypes || '*';
		this.additionalRemoteActionParams = additionalRemoteActionParams || '';
	}
});
fry.remote.upload.Adapter.prototype.onStart = function(fileObj)
{
}
fry.remote.upload.Adapter.prototype.onProgress = function(fileObj, bytesLoaded)
{
}
fry.remote.upload.Adapter.prototype.onEnd = function(wasCanceled, wasError, result)
{
}
fry.remote.upload.Adapter.prototype.onQueueEnd = function()
{
}
fry.remote.upload.Adapter.prototype.onGetRemoteActionName = function()
{
	return 'upload?'.embed(this.additionalRemoteActionParams ? ',?'.embed(this.additionalRemoteActionParams) : '');
}


/*  ---------------------------------------------------------------- 
	fry.cookie namespace
*/

fry.cookie =
{
	get:function(name)
	{
		//http://www.webreference.com/js/column8/functions.html
		var dc = document.cookie;
		var prefix = name + "=";
		var begin = dc.indexOf("; " + prefix);
		if (begin == -1) 
		{
			begin = dc.indexOf(prefix);
			if (begin != 0) return null;
		} 
		else
		{
			begin += 2;			
		}
		var end = document.cookie.indexOf(";", begin);
		if (end == -1)
		{
			end = dc.length;
		}
		return unescape( dc.substring(begin + prefix.length, end) );
	},
	remove:function(name, path, domain)
	{
		if (getCookie(name)) 
		{
			document.cookie = name + "=" + ((path) ? "; path=" + path : "") + ((domain) ? "; domain=" + domain : "") + "; expires=Thu, 01-Jan-70 00:00:01 GMT";
		}
	},
	set:function(name, value, expires, path, domain, secure)
	{
		var curCookie = name + "=" + escape(value) + ((expires) ? "; expires=" + expires.toGMTString() : "") + ((path) ? "; path=" + path : "") + ((domain) ? "; domain=" + domain : "") + ((secure) ? "; secure" : "");
		document.cookie = curCookie;
	}
}


var $post = fry.remote.post;
var $result = fry.remote.result;
var $rpost = function(params, callbackOk, callbackError, method, url)
{
	method = method || 'POST';
	url = url || client.conf.fry.backendURL;
	$post( function(s) { $result( s, 
		function(r) 
		{
			callbackOk(r);
		},
		function(e) 
		{
			// result Error
			callbackError(e);
		}
		) },
		params, method, url
	);
}
var $upload = function(adapter)
{
	fry.remote.upload.perform(adapter);
}



// Fry Garbage Collector mechanism
var __gc_trash_node = null;
var __gc_running = false;
var __gc_scheduled_timers = [];
var __gc_started_at = 0;

function __fry_gcnode_inner(inode)
{
	if ( null != inode.getAttribute('frydrag') )
	{
		$(inode).removeDrag();
	}
	if ( null != inode.getAttribute('frydnd') )
	{
		$(inode).removeDnD();
	}
	if ( null == inode.getAttribute('fryis') || null == inode.getAttribute('fryhe') )
	{
		inode = null;
		return;
	}
	inode.removeAttribute('fryhe');
	var lst = inode.attributes;
	var num = lst.length;
	for ( var i=0; i<num; i++ )
	{
		var attr_name = lst.item(i).name;
		if ( attr_name && 'fryse' == attr_name.substr(0,5) )
		{
			var type = attr_name.substr(6);
			var listeners = lst.item(i).value.split(',');
			for ( var ii=0; ii<listeners.length; ii++ )
			{
				$__tune.event.removeListener(inode, type, self[listeners[ii]]);
				inode['on'+type] = null;
				self[listeners[ii]] = null;
			}
		}
		attr = null;
	}
	lst = null;
	for ( var i in inode )
	{
		if ( 'on' == i.substr(0,2) && 'function' == typeof inode[i] )
		{
			inode[i] = null;
		}
	}
	inode = null;
}

function __fry_precaunode(node)
{
	var lst = node.getElementsByTagName('*');
	for ( var i=0; i<lst.length; i++ )
	{
		if ( '' != lst.item(i).id )
		{
			lst.item(i).id = '';
		}
	}
	lst = null;
	node.id = '';
	return node;
}

function __fry_gcnode(node, skipSelf)
{
	if ( null == __gc_trash_node )
	{
		// GC not available at the moment
		if ( skipSelf )
		{
			node.innerHTML = '';
		}
		else
		{
			if ( node.parentNode )
			{
				node.parentNode.removeChild(node);
			}
		}
		return;
	}
	if ( skipSelf )
	{
		try
		{
			while ( null != node.firstChild )
			{
				__gc_trash_node.appendChild(__fry_precaunode(node.firstChild));
			}
		}
		catch(e){}
	}
	else
	{
		try
		{
			__gc_trash_node.appendChild(__fry_precaunode(node));
		}
		catch(e){}
	}
//	console.log('GC scheduled.');
	__gc_scheduled_timers[__gc_scheduled_timers.length] = setTimeout('__fry_gc_recycle()', 10000+Math.floor(10000*Math.random()));
}

function __fry_gc_time()
{
	var d = new Date();
	return 60000*d.getMinutes()+1000*d.getSeconds()+d.getMilliseconds();
}

function __fry_gc_recycle()
{
	var n = __gc_scheduled_timers.length;
	for ( var i=0; i<n; i++ )
	{
		clearTimeout(__gc_scheduled_timers[i]);
	}
	__gc_scheduled_timers = [];
	if ( __gc_running )
	{
//		console.log('GC already running.');
		return;
	}
	__gc_running = true;
	__gc_started_at = __fry_gc_time();
//	console.log('GC running for %s nodes. Started at %s', __gc_trash_node.childNodes.length, __gc_started_at);
	while ( null != __gc_trash_node.firstChild )
	{
		var node = __gc_trash_node.firstChild;
		if ( 1 == node.nodeType )
		{
			var lst = node.getElementsByTagName('*');
			var num = lst.length;
			if ( __gc_started_at < __fry_gc_time() - 2000 )
			{
//				console.log('GC did not finish on time. Stopped at %s after %s msecs of running. Number of remaining nodes: %s.', __fry_gc_time(), __fry_gc_time()-__gc_started_at, __gc_trash_node.childNodes.length);
				__gc_running = false;
				__gc_scheduled_timers[__gc_scheduled_timers.length] = setTimeout('__fry_gc_recycle()', 7000+Math.floor(7000*Math.random()));
				return;
			}
			for ( var ii=0; ii<num; ii++ )
			{
				__fry_gcnode_inner(lst.item(ii));
			}
			lst = null;
		}
		__gc_trash_node.removeChild(node);
		node = null;
	}
//	console.log('GC finished');
	__gc_running = false;
}


$__tune.event.addListener(self, 'load', function(evt)
{
	__gc_trash_node = document.getElementsByTagName('body').item(0).appendChild(document.createElement('div'));
	__gc_trash_node.style.display = 'none';		
});
$__tune.event.addListener(self, 'unload', function(evt)
{
	__gc_trash_node = $().$;
	__fry_gc_recycle();
});