/*
 * AC Fry - JavaScript Framework v1.0
 *
 * XML extension
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*--------*/

fry.xml =
{
	support:
	{
		obj:{init:false, domDoc:null, xslTempl:null, domParser:null, xmlSerial:null},
		init:function()
		{
			with ( fry.xml.support )
			{
				if ( obj.init )
				{
					return;
				}
				try
				{
					if ( $__tune.isIE )
					{
						$foreach ( ['Msxml2.FreeThreadedDOMDocument.4.0', 'Msxml2.FreeThreadedDOMDocument', 'Msxml.FreeThreadedDOMDocument'], function(progid, i, control)
						{
							try
							{
								var o = new ActiveXObject(progid);
								obj.domDoc = function()
								{
									return new ActiveXObject(progid);
								}
								delete o;
								control.stop();
							}
							catch(ee){}
						});
						$foreach ( ['MSXML2.XSLTemplate.4.0', 'MSXML2.XSLTemplate'], function(progid, i, control)
						{
							try
							{
								var o = new ActiveXObject(progid);
								obj.xslTempl = function()
								{
									return new ActiveXObject(progid);
								}
								delete o;
								control.stop();
							}
							catch(ee){}
						});
					}
					else
					{
						if ( DOMParser )
						{
							obj.domParser = new DOMParser();
						}
						if ( XMLSerializer )
						{
							obj.xmlSerial = new XMLSerializer();
						}
						obj.domDoc = function()
						{
							return document.implementation.createDocument('','',null);
						}
					}
				}
				catch (e)
				{
					throw new FryException(300, 'fry.xml: Uncapable user agent `?`.'.embed(e));
				}
				obj.init = true;
			}
		}
	},
	util:
	{
		removeAllChildren:function(node)
		{
			while ( 0 != node.childNodes.length )
			{
				node.removeChild(node.firstChild);
			}				
		},
		nodeText:function(node, t)
		{
			if ( $notset(t) )
			{
				t = '';
				$foreach (node.childNodes, function(node)
				{
					if ( 3 == node.nodeType || 4 == node.nodeType )
					{
						t += node.data;
					}							
				});
				return t;
			}
			fry.xml.util.removeAllChildren(node);
			node.appendChild(node.ownerDocument.createCDATASection(t));
		},
		innerXML:function(node, xmls)
		{
			if ( node instanceof fry.xml.Document )
			{
				node = node.document;
			}
			if ( $notset(xmls) )
			{
				if ( $__tune.isIE )
				{
					return node.xml;
				}
				else
				{
					return fry.xml.support.obj.xmlSerial.serializeToString(node);
				}
			}
			try
			{
				var doc = null;
				if ( $__tune.isIE )
				{
					doc = fry.xml.support.obj.domDoc();
					doc.loadXML(xmls);
				}
				else
				{
					doc = fry.xml.support.obj.domParser.parseFromString(xmls, 'text/xml');
				}
				var clone = function(toNode, fromNode)
				{
					$foreach ( fromNode.childNodes, function(node)
					{
						switch ( node.nodeType )
						{
							case 1:
							{
								// element node
								var nn = toNode.appendChild(toNode.ownerDocument.createElement(node.tagName));
								for ( var i=0; i<node.attributes.length; i++ )
								{
									nn.setAttribute( node.attributes.item(i).name, node.attributes.item(i).value );
								}
								clone(nn, node);
							};break;
							case 3:
							{
								// text node
								toNode.appendChild(toNode.ownerDocument.createTextNode(node.data));
							};break;
							case 4:
							{
								// CDATA node
								toNode.appendChild(toNode.ownerDocument.createCDATASection(node.data));
							};break;
						}
					});
				}
				fry.xml.util.removeAllChildren(node);
				if ( 9 == node.nodeType )
				{
					var dd = doc.documentElement;
					var nn = node.appendChild(node.createElement(dd.tagName));
					for ( var i=0; i<dd.attributes.length; i++ )
					{
						nn.setAttribute( dd.attributes.item(i).name, dd.attributes.item(i).value );
					}
					doc = dd;
					node = node.documentElement;
				}
				clone(node, doc);
				delete doc;
			}
			catch (e)
			{
				alert(e.message);
				throw new FryException(301, 'fry.xml: Error when setting innerXML snippet `?`[max 200 chars included] to node. ?'.embed(xmls.substr(0,200), e));
			}
		},
		encodeCDATA:function(data)
		{
		    return data.replace( /<\!\[CDATA\[/g, '```~~~```!```[```CDATA```[').replace( /\]\]>/g, ']```]```~~~' );
		},
		decodeCDATA:function(data)
		{
		    return data.replace( /```~~~```\!```\[```CDATA```\[/g, '<![CDATA[').replace( /\]```\]```~~~/g, ']]>' );
		}
	}
}

fry.xml.support.init();

$class('fry.xml.Document',
{
	construct:function(xmls)
	{
		if ( 'object' == typeof xmls )
		{
			xmls = this.getSourceFromObject(xmls);
		}
		this.document = fry.xml.support.obj.domDoc();
		if ( xmls )
		{
			this.innerXML(xmls);
		}
		else
		{
			this.document.appendChild(this.createElement('root'));
		}
	},
	destruct:function()
	{
		delete this.document;
	}
});

fry.xml.Document.prototype.innerXML = function(xmls)
{
	if ( $notset(xmls) )
	{
		return fry.xml.util.innerXML(this);
	}
	fry.xml.util.innerXML(this, xmls);	
}

fry.xml.Document.prototype.getSourceFromObject = function(o, propName)
{
	propName = propName || 'object';
	var xmls = '<'+propName;
	if ( o.$ )
	{
		for ( var i in o.$ )
		{
			if ( 'function' != typeof o.$[i] && 'object' != typeof o.$[i] )
			{
				xmls += ' ?="?"'.embed(i, $_(o.$[i]).replace(/"/g, '&quot;'));				
			}
		}
	}
	xmls += '>';
	if ( 'object' != typeof o )
	{
		xmls += '<![CDATA[?]]>'.embed(o);
	}
	else
	{
		for ( var i in o )
		{
			if ( 'function' == typeof o[i] || '$' == i )
			{
				continue;
			}
			if ( 'object' == typeof o[i] )
			{
				if ( o[i].push )
				{
					// is an array
					var item_name = o[i].__name || i;
					if ( i != item_name )
					{
						xmls += '<'+i+'>';
					}
					for ( var ii=0; ii<o[i].length; ii++ )
					{
						xmls += this.getSourceFromObject(o[i][ii], item_name);
					}
					if ( i != item_name )
					{
						xmls += '</'+i+'>';
					}
					continue;
				}
			}
			if ( '_' == i )
			{
				if ( '' != o[i] )
				{
					xmls += '<![CDATA['+o[i]+']]>';				
				}
			}
			else
			{
				xmls += this.getSourceFromObject(o[i], i);			
			}
		}		
	}
	return xmls+'</?>'.embed(propName);
}

// returns xml document serialized into object, the opposite can be done by passing document to the constructor
fry.xml.Document.prototype.serialize = function(node, o)
{
	o = o || {_:''};
	node = node || this.root();
	var num_elements = 0;
	var map = {};
	for ( var i=0; i<node.childNodes.length; i++ )
	{
		var child_node = node.childNodes.item(i);
		if ( 1 == child_node.nodeType )
		{
			var prop_name = child_node.tagName;
			var o_child = this.serialize(child_node);
			if ( o[prop_name] )
			{
				// already exists, will become an array
				if ( !o[prop_name].push )
				{
					// not an array yet
					o[prop_name] = [o[prop_name], o_child];
				}
				else
				{
					o[prop_name].push(o_child);
				}
			}
			else
			{
				o[prop_name] = o_child;
				map[num_elements] = prop_name;
				num_elements++;
			}
		}
		else if ( 3 == child_node.nodeType || 4 == child_node.nodeType )
		{
			o._ += child_node.data;
		}
	}
	if ( !o.$ )
	{
		if ( 0 == node.attributes.length && 0 == num_elements )
		{
			o = o._;
		}
		else
		{			
			o.$ = {};
			for ( i=0; i<node.attributes.length; i++ )
			{
				var attr = node.attributes.item(i);
				o.$[attr.name] = attr.value;
			}
			if ( 1 == num_elements && o[map[0]] instanceof Array )
			{
				// plain array
				o = o[map[0]];
				o.__name = map[0];
			}
			else
			{
				// adding iterator
				o.__length = function()
				{
					return num_elements;
				}
				o.__item = function(index)
				{
					return o[map[index]];
				}
				o.__key = function(index)
				{
					return map[index];
				}
				o.__remove = function(index)
				{
					delete o[map[index]];
					delete map[index];
					num_elements--;
				}
			}
		}
	}
	return o;
}

fry.xml.Document.prototype.createElement = function(tagName)
{
	return this.document.createElement(tagName);
}

fry.xml.Document.prototype.createTextNode = function(text)
{
	return this.document.createTextNode(text);
}

fry.xml.Document.prototype.createCDATASection = function(data)
{
	return this.document.createCDATASection(data);
}

fry.xml.Document.prototype.root = function()
{
	if ( this.document )
	{
		return this.document.documentElement;
	}
	return null;
}

fry.xml.Document.prototype.g = function(q)
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
		var qq = q[qIndex];
		var is_final_index = q.length-1 == qIndex;
		var ls = node.getElementsByTagName(qq[0]);
		if ( 2 == qq.length )
		{
			// specific node required
			if ( is_final_index )
			{
				// store results
				lst.push(ls.item(parseInt(qq[1])));
			}
			else
			{
				lookup(ls.item(parseInt(qq[1])), qIndex+1);
			}
		}
		else
		{
			// all nodes required
			for ( var i=0; i<ls.length; i++ )
			{
				if ( is_final_index )
				{
					lst.push(ls.item(i));
				}
				else
				{
					lookup(ls.item(i), qIndex+1);
				}
			}
		}
	}
	lookup(this.document, 0);
	if ( 0 == lst.length )
	{
		return null;
	}
	if ( 1 == lst.length )
	{
		return lst[0];
	}
	return lst;	
}


var $xmlcreate = function(xmls)
{
	return $new(fry.xml.Document, xmls);
}
var $xmlinner = fry.xml.util.innerXML;
var $xmltext = fry.xml.util.nodeText;
var $xmlserialize = function(xd)
{
	if ( 'object' == typeof xd && xd.serialize )
	{
		return xd.serialize();
	}
	else
	{
		xd = $xmlcreate(xd);
		var o = xd.serialize();
		$delete(xd);
		return o;
	}
}
var $xmldeserialize = function(o)
{
	return $new(fry.xml.Document, o);
}


/*--------*/

if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}