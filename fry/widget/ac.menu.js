/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Menu widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/*  ---------------------------------------------------------------- 
	ac.MenuWidgetModel < ac.HierarchicalWidgetModel
*/

$class('ac.MenuWidgetModel < ac.HierarchicalWidgetModel');

ac.MenuWidgetModel.prototype.onAppendElement = function(newElem)
{
	var key_code = this.widget.controller.getKeyCode(newElem);
	if (key_code)
	{
		var key_string = key_code[0];
		var scope = key_code[1];
		var controller = this.widget.controller;
		this.widget.registerKeyAction(key_string, function(){if(newElem){controller.performAction(newElem);}; return true}, '', scope);
	}
}

/*  ---------------------------------------------------------------- 
	ac.MenuWidgetView < ac.WidgetView
*/
$class('ac.MenuWidgetView < ac.WidgetView',
{
	construct:function(options)
	{
		if ( 'undefined' == typeof this.options.startsWithTopMenuBar )
		{
			this.options.startsWithTopMenuBar = true;
		}
		if ( 'undefined' == typeof this.options.menuItemWidth )
		{
			this.options.menuItemWidth = 220;
		}
	}
});

ac.MenuWidgetView.prototype.renderMenuItem = function(acElem, node, isTopMenuBar)
{
	node.t(acElem.id);
}

/*  ---------------------------------------------------------------- 
	ac.MenuWidgetController < ac.WidgetController
*/
$class('ac.MenuWidgetController < ac.WidgetController');

ac.MenuWidgetController.prototype.isVisible = function(acElem)
{
	return true;
}

ac.MenuWidgetController.prototype.isActive = function(acElem)
{
	return true;
}

ac.MenuWidgetController.prototype.isSeparator = function(acElem)
{
	return false;
}

ac.MenuWidgetController.prototype.getKeyCode = function(acElem)
{
	return acElem.properties.key || null;
}

ac.MenuWidgetController.prototype.performAction = function(acElem)
{
}

/*  ---------------------------------------------------------------- 
	ac.MenuWidget < ac.HierarchicalWidget
*/
$class('ac.MenuWidget < ac.HierarchicalWidget',
{
	construct:function()
	{
		this.menuNodes = [];
		this.lastNode = null;
		this.lastTopNode = null;
		this.topMenuExpanded = false;
	}
});

ac.MenuWidget.prototype.onKeyPress = function(evt)
{
	evt.stop();
	$__tune.behavior.clearSelection();
	var caller = this;
	var acElem = this.getSelection();
	switch ( evt.key )
	{
		case evt.KEY_ARR_UP: {} case evt.KEY_ARR_DOWN:
		{
			var is_up = evt.key == evt.KEY_ARR_UP;
			if ( !acElem )
			{
				acElem = caller.model.rootElement.elements[0];
				var node = caller.menuNodes[caller.menuNodes.length-1];
				if ( !node )
				{
					return;
				}
				node = node.g('td:0');
				while ( true )
				{
					if ( !acElem )
					{
						return;
					}
					if ( !acElem.properties.menu.adapter.isVisible(acElem) )
					{
						continue;
					}
					if ( acElem.properties.menu.adapter.isActive(acElem) && !acElem.properties.menu.adapter.isSeparator(acElem) )
					{
						break;
					}
					acElem = acElem.nextSibling();
					if ( null != acElem )
					{
						node = node.p().ns().fc();						
					}
				}
				if ( !is_up && acElem && acElem.parentElement == caller.model.rootElement && caller.view.options.startsWithTopMenuBar )
				{
					// top bar movement
					caller.renderTopMenuItemHover(acElem, caller.renderingNode.g('table/td:?'.embed(acElem.index)));
					return;
				}
				caller.renderMenuItemHover(acElem, node);						
			}
			else
			{
				if ( !is_up && acElem && acElem.parentElement == caller.model.rootElement && caller.view.options.startsWithTopMenuBar )
				{
					// top bar movement
					if ( !caller.topMenuExpanded )
					{
						caller.topMenuExpanded = true;
						caller.renderTopMenuItemHover(acElem, caller.renderingNode.g('table/td:?'.embed(acElem.index)));
					}
					return;
				}
				var node = caller.lastNode;
				while ( true )
				{
					acElem = is_up ? acElem.previousSibling() : acElem.nextSibling();
					if ( null == acElem )
					{
						return;
					}
					if ( !acElem.properties.menu.adapter.isVisible(acElem) )
					{
						continue;
					}
					node = is_up ? node.p().ps().fc() : node.p().ns().fc();
					if ( acElem.properties.menu.adapter.isActive(acElem) && !acElem.properties.menu.adapter.isSeparator(acElem) )
					{
						break;
					}
				}
				caller.renderMenuItemHover(acElem, node);
			}
		};break;
		case evt.KEY_ARR_RIGHT:
		{
			if ( acElem && acElem.parentElement == caller.model.rootElement && caller.view.options.startsWithTopMenuBar )
			{
				// top menu bar movement
				if ( acElem.nextSibling() )
				{
					caller.renderTopMenuItemHover(acElem.nextSibling(), caller.lastTopNode.ns());
				}
				return;				
			}
			var node = caller.menuNodes[caller.menuNodes.length-1];
			if ( acElem && node)
			{
				node = node.g('td:0');
				if ( acElem.isCollection && node )
				{
					acElem = acElem.elements[0];
					while ( true )
					{
						if ( !acElem )
						{
							return;
						}
						if ( !acElem.properties.menu.adapter.isVisible(acElem) )
						{
							continue;
						}
						if ( acElem.properties.menu.adapter.isActive(acElem) && !acElem.properties.menu.adapter.isSeparator(acElem) )
						{
							break;
						}
						acElem = acElem.nextSibling();
						node = node.p().ns().fc();
					}
					caller.renderMenuItemHover(acElem, node);						
				}
				else
				{
					caller.performAction(acElem);
				}
			}
		};break;
		case evt.KEY_ARR_LEFT:
		{
			if ( acElem )
			{
				if ( acElem.parentElement != caller.model.rootElement )
				{
					acElem = acElem.parentElement;
					var level = caller.model.getElementLevel(acElem) - (caller.view.options.startsWithTopMenuBar ? 1 : 0);
					var node = caller.menuNodes[level-1];
					if ( !caller.menuNodes[level-1] )
					{
						return;
					}
					var lst = node.g('table:0/tr/td');
					for ( var i=0; i<lst.length; i++ )
					{
						if ( 'item selected' == lst[i].n() )
						{
							caller.renderMenuItemHover(acElem, lst[i]);
							return;
						}
					}
				}
				else
				{
					// top menu bar movement
					if ( acElem.previousSibling() )
					{
						caller.renderTopMenuItemHover(acElem.previousSibling(), caller.lastTopNode.ps());
					}
				}
			}
		};break;
		case evt.KEY_ENTER:
		{
			if ( acElem )
			{
				if ( !acElem.isCollection )
				{
					caller.performAction(acElem);
				}
			}
		};break;
		case evt.KEY_ESCAPE:
		{
			caller.onBlur();
		};break;
		default:
		{
			
			if ( !acElem )
			{
				acElem = caller.model.rootElement;
			}
			else
			{
				acElem = acElem.parentElement;
			}
			var level = caller.model.getElementLevel(acElem);
			var node = caller.menuNodes[level];
			if ( !node )
			{
				return;
			}
			node = node.g('tr:0');
			$foreach (acElem.elements, function(elem, i, control)
			{
				if ( !elem.properties.menu.adapter.isVisible(elem) )
				{
					return;
				}
				if ( elem.properties.menu.adapter.isActive(elem) && !elem.properties.menu.adapter.isSeparator(elem) && elem.properties.label )
				{
					if ( elem.properties.label.toUpperCase().charCodeAt(0) == evt.key )
					{
						caller.renderMenuItemHover(elem, node.fc());
						control.stop();
					}
				}
				if ( !node.ns() )
				{
					control.stop();
					return;
				}
				node = node.ns();
			});
		};break;
	}
}

ac.MenuWidget.prototype.onFocus = function()
{
}

ac.MenuWidget.prototype.onBlur = function()
{
	this.unregisterAllKeyActions();
	this.removeMenuNodes();
	$foreach ( this.model.rootElement.elements, function(acElem)
	{
		acElem.setStateCollapsed();
	});
	if ( this.view.options.startsWithTopMenuBar )
	{
		$foreach ( this.renderingNode.g('table/td'), function(node)
		{
			if ( 'item selected' == node.n() )
			{
				node.n('item');
			}
		});
		this.topMenuExpanded = false;		
	}
}

ac.MenuWidget.prototype.hideContextMenu = function()
{
	this.onBlur();
}

ac.MenuWidget.prototype.removeMenuNodes = function()
{
	$foreach ( this.menuNodes, function(node, i, control)
	{
		if ( fry.ui.effect )
		{
			fry.ui.effect.FadeOut(node, 2, function(node)
			{
				node.rs();
			});			
		}
		else
		{
			node.rs();
		}
	});
	this.menuNodes = [];
}

ac.MenuWidget.prototype.performAction = function(acElem)
{
	if ( acElem.properties.menu.adapter.isActive(acElem) )
	{
		acElem.properties.menu.adapter.performAction(acElem);
	}
	this.onBlur();
}

ac.MenuWidget.prototype.checkChildAdapters = function(acElem)
{
	var caller = this;
	$foreach ( acElem.elements, function(acElem)
	{
		if ( !acElem.properties.menu )
		{
			acElem.properties.menu = {};
		}
		if ( !acElem.properties.menu.adapter )
		{
			acElem.properties.menu.adapter = {};
		}
		acElem.properties.menu.adapter.widget = caller;
		// checking the adapter
		$foreach ( ['isVisible', 'isActive', 'isSeparator', 'getKeyCode', 'performAction'], function(method)
		{
			if ( !acElem.properties.menu.adapter[method] )
			{
				acElem.properties.menu.adapter[method] = caller.controller[method];
			}
		})
		if ( acElem.isCollection )
		{
			caller.checkChildAdapters(acElem);
		}
	});
}

ac.MenuWidget.prototype.render = function()
{
	this.selection = null;
	var caller = this;
	var has_topbar = this.view.options.startsWithTopMenuBar;
	this.checkChildAdapters(this.model.rootElement);
	this.renderingNode = this.containerNode.a($$()).n('acw-menu ? ?'.embed(has_topbar?'top':'', this.cssClassName));
	var launchRender = function()
	{
		if ( has_topbar )
		{
			caller.containerNode.s('overflow:hidden');
			caller.renderingNode.w(10000);
			caller.renderingNode.pos(true).s('clip:rect(0 ?px ?px 0)'.embed(caller.containerNode.w(), caller.containerNode.h()));
			caller.renderTopMenuBar();
		}
		else
		{
			caller.renderMenu(caller.model.rootElement, caller.renderingNode, true);
		}		
	}
	
	var acElem = this.model.rootElement;
	if ( acElem.hasState(acElem.STATE_WILL_LOAD) )
	{
		acElem.removeAllChildren();
		acElem.setState(acElem.STATE_LOADING|acElem.STATE_COLLAPSED);
		caller.model.loadElements(acElem,
			function()
			{
				// on success
				acElem.setState(acElem.STATE_EXPANDED|acElem.STATE_LOADED);
				caller.checkChildAdapters(acElem);
				launchRender();
			},
			function(e)
			{
				// on error
				acElem.setState(acElem.STATE_EXPANDED|acElem.STATE_LOADED);
				caller.view.renderElementLoadError(acElem, e, caller.renderingNode);
			}
		);			
	}
	else
	{
		launchRender();
	}
}

ac.MenuWidget.prototype.renderTopMenuBar = function()
{
	var caller = this;
	var tr = this.renderingNode.a($$('table')).sa('cellSpacing',0).a($$('tbody')).a($$('tr'));
	$foreach (this.model.rootElement.elements, function(acElem)
	{
		caller.renderMenuItem(acElem, tr.a($$('td')).n('item'), true);
	});
}

ac.MenuWidget.prototype.renderMenuItem = function(acElem, node, isTopBar)
{
	var caller = this;

	var container = node.a($$()).n('menu-inner');
	if ( !acElem.isCollection && acElem.properties.menu.adapter.isActive(acElem) )
	{
		// single item
		node.e('click', function(evt)
		{
			evt.stop();
			caller.performAction(acElem);
		});			
	}
	if ( isTopBar )
	{
		caller.view.renderMenuItem(acElem, container, true);
		if ( acElem.isCollection )
		{
			node.e('click', function(evt)
			{
				evt.stop();
				caller.topMenuExpanded = !caller.topMenuExpanded;
				caller.renderTopMenuItemHover(acElem, node);						
			});
		}
		node.e('mouseover', function(evt)
		{
			ac.widget.focus(caller);
			if ( acElem == caller.selection || !caller.topMenuExpanded )
			{
				return;
			}
			caller.renderTopMenuItemHover(acElem, node);
		});
	}
	else
	{
		var tr = container.a($$('table')).sa('cellSpacing',0).w(container.w()).a($$('tbody')).a($$('tr'));
		var td = tr.a($$('td')).n('icon');
		if ( true )
		{
			// TODO: check for icon
		}
		caller.view.renderMenuItem(acElem, tr.a($$('td')).n('label ?'.embed(acElem.properties.menu.adapter.isActive(acElem)?'':'inactive')), false);
		var td = tr.a($$('td')).n('key ?'.embed(acElem.isCollection?'collection':''));
		if ( !acElem.isCollection )
		{
			// check for assigned key shortcut
			var key_code = acElem.properties.menu.adapter.getKeyCode(acElem);
			if ( null != key_code )
			{
				var key_string = key_code[0];
				var key_parts = key_string.split('+');
				var fmt_key_string = key_code[2] ? key_code[2] : String.fromCharCode(key_parts[0]).toUpperCase();
				key_parts.shift();
				for (var i=0; i<key_parts.length; i++)
				{
					fmt_key_string = '<span class="key-symbol ?"></span>?'.embed(key_parts[i].toLowerCase(), fmt_key_string);
				}
				// fmt_key_string = key_parts.join('+') + fmt_key_string;
				td.t('<div class="shortcut">?</div>'.embed(fmt_key_string));
			}
			else if (acElem.properties.keyLikeSymbol)
			{
				td.t(acElem.properties.keyLikeSymbol.surroundTag('span'));
			}
		}
		node.e('mouseover', function(evt)
		{
			evt.stop();
			caller.renderMenuItemHover(acElem, node);
		});
	}
	if ( acElem.hasState(acElem.STATE_WILL_LOAD) )
	{
		acElem.removeAllChildren();
		acElem.setState(acElem.STATE_LOADING|acElem.STATE_COLLAPSED);
		caller.model.loadElements(acElem,
			function()
			{
				// on success
				acElem.setState(acElem.STATE_COLLAPSED|acElem.STATE_LOADED);
				caller.checkChildAdapters(acElem);
			},
			function(e)
			{
				// on error
				acElem.setState(acElem.STATE_COLLAPSED|acElem.STATE_LOADED);
				caller.view.renderElementLoadError(acElem, e, node);
			}
		);
	}
}

ac.MenuWidget.prototype.renderTopMenuItemHover = function(acElem, node)
{
	if ( this.lastTopNode )
	{
		this.lastTopNode.n('item');
	}
	node.n('item selected');
	this.selection = acElem;
	this.lastTopNode = node;
	if ( !this.topMenuExpanded )
	{
		this.removeMenuNodes();
		return;
	}
	// might be collection
	if ( !acElem.hasChildren() )
	{
		// no children, don't show anything
		this.removeMenuNodes();
		return;
	}
	// check to see if any visible items exists, if not then again, don't show anything
	var visible = false;
	for ( var i in acElem.elements )
	{
		if ( acElem.elements[i].properties.menu.adapter.isVisible(acElem.elements[i]) )
		{
			visible = true;
			break;
		}
	}
	if ( !visible )
	{
		return;
	}
	this.renderMenu(acElem, node, true);
	this.menuNodes[this.menuNodes.length-1].s('border-top-color:#ddd');
}

ac.MenuWidget.prototype.renderMenuItemHover = function(acElem, node)
{
	ac.widget.focus(this);
	if ( this.selection == acElem )
	{
		if ( !acElem.isCollection && acElem.properties.menu.adapter.isActive(acElem))
		{
			node.n('item selected');
		}
		return;
	}
	if ( this.lastNode )
	{
		if ( this.selection != acElem.parentElement )
		{
			this.lastNode.n('item');						
		}
	}
	if ( acElem.properties.menu.adapter.isActive(acElem) )
	{
		this.renderMenu(acElem, node, false);
		node.n('item selected');
	}
	this.lastNode = node;
	this.selection = acElem;	
}

ac.MenuWidget.prototype.renderMenu = function(acElem, refNode, isRefDirectionBottom)
{
	this.unregisterAllKeyActions();
	var level = this.model.getElementLevel(acElem) - (this.view.options.startsWithTopMenuBar ? 1 : 0);
	var last_level = !this.selection ? 0 : this.model.getElementLevel(this.selection) - (this.view.options.startsWithTopMenuBar ? 1 : 0);
	for ( var i=level; i<this.menuNodes.length; i++ )
	{
		if ( this.menuNodes[i] )
		{
			if ( fry.ui.effect )
			{
				fry.ui.effect.FadeOut(this.menuNodes[i], 3, function(node)
				{
					node.rs();
				});
			}
			else
			{
				this.menuNodes[i].rs();				
			}
		}
		delete this.menuNodes[i];
	}
	this.menuNodes.length = level;
	if ( last_level > level )
	{
		if ( this.menuNodes[level-1])
		{
			$foreach ( this.menuNodes[level-1].g('table:0/tr/td:0'), function(node)
			{
				if ( 'item selected' == node.n() )
				{
					node.n('item');				
				}
			});			
		}
	}
	if ( !acElem.hasChildren() )
	{
		return;
	}
	// highlighting previous selected menu item
	refNode.n('item selected');
	var pos = refNode.abspos();
	if ( isRefDirectionBottom )
	{
		// will render UNDER refNode
		pos.y += refNode.h()+($__tune.isSafari?0:1);
		pos.x -= 1;
	}
	else
	{
		// will render RIGHT to refNode
		pos.x += refNode.w();
		pos.y -= 1;
	}
	var caller = this;
	var tbody = null;
	
	var node = null;
	// check to see if modal window active
	var is_modal_widget = false;
	var offset_x = 0;
	var offset_y = 0;
	if ( ac.widget.focusedWidget )
	{
	    var widget = ac.widget.focusedWidget;
	    while ( !is_modal_widget && widget )
	    {
    	    is_modal_widget = $getdef(widget.isModal, false);
    	    widget = widget.parentWidget;
	    }
	}
	if ( is_modal_widget )
	{
	    var rend_node = ac.widget.focusedWidget.renderingNode;
    	node = rend_node.a($$()).pos(true).w(this.view.options.menuItemWidth).n('acw-menu menu ?'.embed(this.cssClassName));
    	var pos_off = rend_node.abspos();
    	offset_x = pos_off.x;
    	offset_y = pos_off.y;
	}
	else
	{
    	node = $().a($$()).pos(true).w(this.view.options.menuItemWidth).n('acw-menu menu ?'.embed(this.cssClassName));	    
	}
	node.sa('widget-ident', this.ident);
	tbody = node.a($$('table')).sa('cellSpacing',0).w(this.view.options.menuItemWidth).a($$('tbody'));
	node.x(pos.x-offset_x).y(pos.y-offset_y);
	var num_items = 0;
	$foreach (acElem.elements, function(acElem)
	{
		if ( acElem.properties.menu.adapter.isVisible(acElem) )
		{
			if ( acElem.properties.menu.adapter.isSeparator(acElem) )
			{
				// separator
				tbody.a($$('tr')).a($$('td')).n('separator');
			}
			else
			{
				// normal item
				caller.renderMenuItem(acElem, tbody.a($$('tr')).a($$('td')).n('item'), false);
			}
			num_items++;
		}
	});
	if ( 0 == num_items )
	{
		// nothing to render
		node.rs();
		return;
	}
	// rendering shadows
	if ( 'undefined' != typeof fry.ui.snippet )
	{
		node.h(node.h());
		fry.ui.snippet.ApplyShadowedBox(node, 'shadow-box', 5);
	}
	this.menuNodes[level] = node;
	
	var menu_height = node.h();
	var menu_width = node.w();
	var x = node.x();
	var y = node.y();

	var pos_at = 'top';
	if ( y+menu_height > fry.ui.info.page.height )
	{
		pos_at = 'bottom';
		// Gecko on mac has troubles overwriting scrollbars
		if ( $__tune.isGecko && $__tune.isMac )
		{
			y -= 19;
		}
	}
	if ( x+30+menu_width > fry.ui.info.page.width )
	{
		x -= (menu_width+30);
	}
	node.x(x).y(('bottom' == pos_at ? (y-menu_height) : y));//+Math.floor(referingNode.h()/2));
	
	delete node;
}


		
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}