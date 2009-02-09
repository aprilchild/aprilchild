/*
 * AC Fry - JavaScript Framework v1.0
 *
 * Data structures extension
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*--------*/

/*  ---------------------------------------------------------------- 
	ACRelation
*/
$class('ACRelation',
{
	construct:function(id)
	{
		this.id = id || '';
		this.sourceElement = null;
		this.targetElement = null;
		this.sourceElementItemIndex = -1;
		this.targetElementItemIndex = -1;
		this.properties = {};
	},
	destruct:function()
	{
	}
});

ACRelation.prototype.addSourceElement = function( acElem, itemIndex )
{
	itemIndex = $getdef(itemIndex, 0);
	if ( $isset(acElem.properties.items[itemIndex]) )
	{
		this.sourceElement = acElem;
		this.sourceElementItemIndex = itemIndex;
	}
}

ACRelation.prototype.addTargetElement = function( acElem, itemIndex )
{
	itemIndex = $getdef(itemIndex, 0);
	if ( $isset(acElem.properties.items[itemIndex]) )
	{
		this.targetElement = acElem;
		this.targetElementItemIndex = itemIndex;
	}
}

ACRelation.prototype.toString = function( deep, level )
{
    return this.sourceElement+'\n['+this.sourceElementItemIndex+']\n'+this.targetElement+'\n['+this.targetElementItemIndex+']\n';
}


/*  ---------------------------------------------------------------- 
	ACElement
*/
$class('ACElement',
{
	construct:function(id)
	{
		this.STATE_COLLAPSED = 1; 	// element is collapsed
		this.STATE_EXPANDED = 2;  	// element is expanded
		this.STATE_LOADED = 4;		// element has loaded its children
		this.STATE_LOADING = 8;		// element has children that are loading at the moment
		this.STATE_WILL_LOAD = 16;	// element has children to be loaded (it's known that element has children but they are not loaded yet)

		this.id = id || this.genUniqueId();
		this.state = this.STATE_COLLAPSED;
		this.index = 0;
		this.parentElement = null;
		this.rootElement = this;
		this.elements = [];
		this.properties = {};
		this.widgetProperties = {};
		this.isCollection = false;
	},
	destruct:function()
	{
		for ( var i in this.elements )
		{
			$delete(this.elements[i]);
		}
	}
});

ACElement.prototype.genUniqueId = function()
{
	return (''+Math.random()).replace(/\./g, '-');
}

ACElement.prototype.hasChildren = function()
{
	for ( var i in this.elements )
	{
		if ( $isset(this.elements[i]) )
		{
			return true;
		}
	}
	return false;
}

ACElement.prototype.setId = function( id )
{
   this.id = id;
}

ACElement.prototype.setProperties = function( properties )
{
	for ( var i in properties )
	{
		this.properties[i] = properties[i];
	}
}

ACElement.prototype.setState = function( state )
{
	this.state = state;
}

ACElement.prototype.setStateCollapsed = function()
{
	this.state = (this.state & 65533)|this.STATE_COLLAPSED;
}

ACElement.prototype.setStateExpanded = function()
{
	this.state = (this.state & 65534)|this.STATE_EXPANDED;
}

ACElement.prototype.hasState = function( state )
{
	return state == ( this.state & state );
}

ACElement.prototype.getElement = function( el )
{
   if ( 'string' == typeof el )
   {
       return this.getElementById( el, true );
   }
   return el;
}

ACElement.prototype.sort = function( callbackGetSortValue, sortingOrder )
{
	var order = sortingOrder || 0;
	this.elements.sort(function(element1, element2)
	{
		var v1 = (0 == order ? callbackGetSortValue(element1) : callbackGetSortValue(element2));
		var v2 = (0 == order ? callbackGetSortValue(element2) : callbackGetSortValue(element1));
//		alert(v1+' vs '+v2+' : '+(v1<v2));
		return v1==v2 ? 0 : (v1<v2? -1 : 1);		
	});
	/*
	QuickSort(this.elements, function(element1, element2, canBeEqual)
	{
		var v1 = (0 == order ? callbackGetSortValue(element1) : callbackGetSortValue(element2));
		var v2 = (0 == order ? callbackGetSortValue(element2) : callbackGetSortValue(element1));
		return canBeEqual ? v1<=v2 : v1<v2;
	});
	*/
	for ( var i=0; i<this.elements.length; i++ )
	{
		this.elements[i].index = i;
		if ( 0 != this.elements[i].elements.length )
		{
			this.elements[i].sort(callbackGetSortValue, order);
		}
	}
}

ACElement.prototype.getChildrenStamp = function()
{
	var csum = [this.id+'|'+this.state];
	for ( var i=0; i<this.elements.length; i++ )
	{
		csum.push(this.elements[i].id+'|'+this.elements[i].state);
	}
	return csum.join('/');
}

ACElement.prototype.search = function( searchCallback )
{
	var res = searchCallback(this);
	if ( null != res )
	{
		return res;
	}
	for ( var i=0; i<this.elements.length; i++ )
	{
		res = this.elements[i].search(searchCallback);
		if ( null != res )
		{
			return res;
		}
	}
	return null;
}

ACElement.prototype.traverseElement = function( traverseCallback )
{
    if ( traverseCallback(this) )
    {
        return this;
    }
    var n = this.elements.length;
    for ( var i=0; i<n; i++ )
    {
    	var res = this.elements[i].traverseElement( traverseCallback );
    	if ( null != res )
    	{
    		return res;
    	}
    }
    return null;
}

ACElement.prototype.map = function( callback )
{
	if ( false != callback(this) )
	{
	    var n = this.elements.length;
	    for ( var i=0; i<n; i++ )
	    {
			this.elements[i].map(callback);
	    }
	}
}

ACElement.prototype.findChild = function( el )
{
   el = this.getElement( el );
   var n = this.elements.length;
   for ( var i=0; i<n; i++ )
   {
       if ( el == this.elements[i] )
       {
           return el;
       }
   }
   return null;
}

// called for the root element of the hierarchy only
ACElement.prototype.onAfterAppend = function(newEl)
{
}

ACElement.prototype.appendChild = function( newEl )
{
	if ( null != newEl.parentElement )
	{
		if ( this == newEl.parentElement )
		{
			throw new FryException(84, 'fry/data: Unable to append child element. Child already exists.')
		}
		var el = this;
		while ( el )
		{
			if ( el == newEl )
			{
				throw new FryException(85, 'fry/data: Unable to append child element. Impossible nesting (parent cannot become child of its child).')				
			}
			el = el.parentElement;
		}
		var p = newEl.parentElement
		var n = p.elements.length;
        for ( i=newEl.index; i<n-1; i++ )
        {
            p.elements[i] = p.elements[i+1];
            p.elements[i].index--;
        }
		p.elements.length = n-1;
	}
	var ix = this.elements.length;
	this.elements[ix] = newEl;
	newEl.index = ix;
	newEl.parentElement = this;
	newEl.rootElement = this.rootElement;
	this.rootElement.onAfterAppend(newEl);
	return newEl;
}

ACElement.prototype.insertBefore = function( newEl, refEl )
{
	if ( newEl == refEl )
	{
		return newEl;
	}
	if ( 0 == this.elements.length )
	{
		return this.appendChild( newEl );
    }
    else
    {
        if ( null != newEl.parentElement )
        {
        	newEl = newEl.parentElement.removeChild( newEl );
        }
        var n = this.elements.length;
        for ( var i=0; i<n; i++ )
        {
            if ( refEl == this.elements[i] )
            {
                break;
            }
        }
        var ix = n;
        while ( ix > i )
        {
            this.elements[ix] = this.elements[ix-1];
            this.elements[ix].index++;
            ix--;
        }
        this.elements[i] = newEl;
        newEl.parentElement = this;
        newEl.rootElement = this.rootElement;
        newEl.index = i;
        this.elements.length = n+1;
        return newEl;
    }
}
 
ACElement.prototype.insertAfter = function( newEl, refEl )
{
 	if ( null == refEl )
 	{
 		return null;
 	}
    var n = this.elements.length;
    if ( 0 == n )
    {
        return this.appendChild( newEl );
    }
    else
    {
        if ( null != newEl.parentElement )
        {
        	newEl = newEl.parentElement.removeChild( newEl );
        }
        n = this.elements.length;
        for ( var i=0; i<n; i++ )
        {
            if ( refEl == this.elements[i] )
            {
                break;
            }
        }
		i++;
		var ix = n;
		while ( ix > i )
		{
			this.elements[ix] = this.elements[ix-1];
			this.elements[ix].index++;
			ix--;
		}
		this.elements[i] = newEl;
		newEl.parentElement = this;
		newEl.rootElement = this.rootElement;
		newEl.index = i;
		this.elements.length = n+1;
		return newEl;
	}
}

ACElement.prototype.removeChild = function( el )
{
    var n = this.elements.length;
    if ( 'object' == typeof el && this == el.parentElement )
    {
        for ( i=el.index; i<n-1; i++ )
        {
            this.elements[i] = this.elements[i+1];
            this.elements[i].index--;
        }
        el = el.cloneElement( true );
        el.parentElement = null;
        $delete(this.elements[n-1]);
        this.elements.length = n-1;
        return el;
    }
	throw new FryException(89, 'fry/data: Unable to remove child element. Parent does not contain child element.')
}

ACElement.prototype.removeAllChildren = function()
{
    var n = this.elements.length;
    if ( 0 == n )
    {
    	return;
    }
    for ( var i=0; i<n; i++ )
    {
    	if ( this.elements[i] )
    	{
    		$delete(this.elements[i]);
    	}
    }
    this.elements = new Array();
}
 
ACElement.prototype.moveUp = function( el )
{
    var origEl = this.findChild( el );
    if ( null != origEl )
    {
        var ix = origEl.index;
        if ( 0 < ix )
        {
            this.elements[ix].index--;
            this.elements[ix-1].index++;
            var a = this.elements[ix-1];
            this.elements[ix-1] = this.elements[ix];
            this.elements[ix] = a;
        }
    }
}
 
ACElement.prototype.moveDown = function( el )
{
    var origEl = this.findChild( el );
    if ( null != origEl )
    {
        var ix = origEl.index;
        if ( this.elements.length-1 > origEl.index )
        {
            this.elements[ix].index++;
            this.elements[ix+1].index--;
            var a = this.elements[ix+1];
            this.elements[ix+1] = this.elements[ix];
            this.elements[ix] = a;
        }
    }
}

ACElement.prototype.nextSibling = function()
{
	if ( this.parentElement.elements[this.index+1] )
	{
		return this.parentElement.elements[this.index+1];
	}
	return null;
}

ACElement.prototype.previousSibling = function()
{
	if ( this.parentElement.elements[this.index-1] )
	{
		return this.parentElement.elements[this.index-1];
	}
	return null;	
}

ACElement.prototype.getElementById = function( id, deep )
{
	deep = $getdef(deep, true);
    if ( this.id == id )
    {
        return this;
    }
    var n = this.elements.length;
    for ( var i=0; i<n; i++ )
    {
        if ( id == this.elements[i].id )
        {
            return this.elements[i];
        }
        else
        {
            if ( deep )
            {
                var el = this.elements[i].getElementById( id, deep );
                if ( null != el )
                {
                    return el;
                }
            }
        }
    }
    return null;
}
 
ACElement.prototype.cloneElement = function( deep, onCloneCallback, firstCallbackOnly )
{
	onCloneCallback = onCloneCallback || null;
	firstCallbackOnly = firstCallbackOnly || false;
    var o = $new(ACElement, this.genUniqueId());
	if ( 'undefined' != typeof this.onCloneProperties )
	{
		o.onCloneProperties = this.onCloneProperties;
	}
	for ( var i in this )
	{
		if ( 'function' != typeof this[i] && 'index' != i && 'rootElement' != i && 'parentElement' != i && 'widgetProperties' != i && 'elements' != i )
		{
			o[i] = this.onCloneProperties(this[i]);
		}
	}
	o.index = 0;
	o.rootElement = null;
	o.parentElement = null;
	o.widgetProperties = {};
	o.elements = [];
	if ( null != this.rootElement )
	{
	    while ( null != this.rootElement.getElementById(o.id) )
		{
			o.id = o.genUniqueId();
		}		
	}
	if ( null != onCloneCallback )
	{
		onCloneCallback(o, this);
	}
    if ( deep )
    {
        var n = this.elements.length;
        for ( var i=0; i<n; i++ )
        {
            o.appendChild( this.elements[i].cloneElement( true, firstCallbackOnly ? null : onCloneCallback ) );
        }
    }
    return o;
}

ACElement.prototype.onCloneProperties = function(op)
{
	if ( 'object' != typeof op )
	{
		return op;
	}
	var p = {};
	for ( var i in op )
	{
		if ( 'object' == typeof op[i] )
		{
			p[i] = this.onCloneProperties(op[i]);
		}
		else
		{
			p[i] = op[i];
		}
	}
	return p;
}

ACElement.prototype.toString = function( deep, level )
{
	deep = $getdef(deep, true);
	level = $getdef(level, '\t');
    var n = this.elements.length;
    var t = 'ACElement: '+this.index+'['+this.id+'] total:'+n+'\n';
    for ( var i in this.elements )
    {
        t += level+this.elements[i].toString( deep, level+'\t' );
    }
    return t;        
}



/* Miscellanous utilities */

/* Q-Sort */

function QuickSort(vec, comparator, loBound, hiBound )
{
	if ( $notset(comparator) )
	{
		comparator = function(element1, element2, canBeEqual) { return canBeEqual?element1<=element2:element1 < element2; };
	}
	$loBound = $getdef(loBound, 0);
	$hiBound = $getdef(hiBound, vec.length-1);
	var pivot, loSwap, hiSwap, temp;
	// Two items to sort
	if (hiBound - loBound == 1)
	{
		if (!comparator(vec[loBound],vec[hiBound]))
		{
			temp = vec[loBound];
			vec[loBound] = vec[hiBound];
			vec[hiBound] = temp;
		}
		return;
	}
	// Three or more items to sort
	pivot = vec[parseInt((loBound + hiBound) / 2)];
	vec[parseInt((loBound + hiBound) / 2)] = vec[loBound];
	vec[loBound] = pivot;
	loSwap = loBound + 1;
	hiSwap = hiBound;
	do {
		// Find the right loSwap
		while (loSwap <= hiSwap && comparator(vec[loSwap],pivot,true))
		{
			loSwap++;
		}
		// Find the right hiSwap
		while (comparator(pivot, vec[hiSwap]))
		{
			hiSwap--;
		}
		// Swap values if loSwap is less than hiSwap
		if (loSwap < hiSwap)
		{
			temp = vec[loSwap];
			vec[loSwap] = vec[hiSwap];
			vec[hiSwap] = temp;
		}
	} while (loSwap < hiSwap);
	vec[loBound] = vec[hiSwap];
	vec[hiSwap] = pivot;
	// 2 or more items in first section		
	if (loBound < hiSwap - 1)
	{
		QuickSort(vec, comparator, loBound, hiSwap - 1);
	}
	// 2 or more items in second section
	if (hiSwap + 1 < hiBound)
	{
		QuickSort(vec, comparator, hiSwap + 1, hiBound);
	}
}


/*--------*/
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}