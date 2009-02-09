/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Tree widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/*  ---------------------------------------------------------------- 
	ac.TreeWidgetModel < ac.HierarchicalWidgetModel
*/

$class('ac.TreeWidgetModel < ac.HierarchicalWidgetModel');


/*  ---------------------------------------------------------------- 
	ac.TreeWidgetView < ac.WidgetView
*/
$class('ac.TreeWidgetView < ac.WidgetView',
{
	construct:function(options)
	{
		if ( 'undefined' == typeof this.options.showRootElement )
		{
			this.options.showRootElement = true;
		}
		if ( 'undefined' == typeof this.options.hasElementIcon )
		{
			this.options.hasElementIcon = false;
		}
	}
});


ac.TreeWidgetView.prototype.renderElement = function(acElem, node)
{
	node.t(acElem.id);
}

ac.TreeWidgetView.prototype.renderElementIcon = function(acElem, isSelected)
{
	window.status = 'mm/i/theme/?/browser.?.(?).gif'.embed(fry.ui.theme.name, acElem.isCollection?'folder':'item', isSelected?'active':'inactive');
	return 'mm/i/theme/?/browser.?.(?).gif'.embed(fry.ui.theme.name, acElem.isCollection?'folder':'item', isSelected?'active':'inactive');
}

/*  ---------------------------------------------------------------- 
	ac.TreeWidgetController < ac.WidgetController
*/
$class('ac.TreeWidgetController < ac.WidgetController');

ac.TreeWidgetController.prototype.allowEditing = function()
{
	return true;
}

ac.TreeWidgetController.prototype.onElementClick = function(acElem, evt)
{
}

/*  ---------------------------------------------------------------- 
	ac.TreeWidgetDnDAdapter < fry.ui.DragAdapter, fry.ui.DropAdapter
*/
$class('ac.TreeWidgetDnDAdapter < fry.ui.DragAdapter, fry.ui.DropAdapter',
{
	construct:function(node, widget, acElem)
	{
	    this.widget = widget;
		this.acElem = acElem;
		this.insertionNode = null;
		this.lastInsertionIndex = [-1,0]; // [0] - acElem index, [1] - position, -1 above 1 below
		this.data = null;
	}
});

ac.TreeWidgetDnDAdapter.prototype.onGetCursorNode = function()
{
	this.data = {widget:this.widget, elements:[this.acElem], nodes:[]};
	return $$().n('acw-tree-dnd-cursor').t(this.node.t());
}

ac.TreeWidgetDnDAdapter.prototype.clearInsertion = function()
{
	if ( null != this.insertionNode )
	{
		this.insertionNode.rs();
		this.insertionNode = null;
		this.lastInsertionIndex = [-1,0];
	}
}

ac.TreeWidgetDnDAdapter.prototype.onDragEnter = function(firstEnter, offsetX, offsetY, sourceNode, sourceAdapter)
{
	var source_index = -1;
	if ( 'undefined' != typeof sourceAdapter && 'undefined' != typeof sourceAdapter.acElem )
	{
		var source_index = sourceAdapter.acElem.index;
	}
	
	var pos = this.node.abspos();
	if ( null == this.insertionNode )
	{
		var node = $().a($$()).n('insertion-point').h(7).w(this.node.w()).pos(true).x(pos.x).z(90000);
		node.a($$()).n('head');
		this.insertionNode = node;		
	}
	if ( this.widget.model.rootElement == this.acElem )
	{
		// cannot render, cannot put anything above or below root		
		this.clearInsertion();
		return;
	}
	var is_below = this.node.h()/2 < offsetY;
	if ( is_below )
	{
		// rendering BELOW
		if ( -1 != source_index && this.acElem.index + 1 == source_index )
		{
			// cannot render, next acElem is below, wouldn't change position
			this.clearInsertion();
			return;
		}
		offsetY = this.node.h();
	}
	else
	{
		// rendering ABOVE
		offsetY = 0;
		if ( -1 != source_index && this.acElem.index - 1 == source_index )
		{
			// cannot render, previous acElem is above, wouldn't change position
			this.clearInsertion();
			return;
		}
	}
	this.lastInsertionIndex = [source_index, is_below?1:-1];
	this.insertionNode.y(pos.y+offsetY-4);
}

ac.TreeWidgetDnDAdapter.prototype.onDragLeave = function(lastLeave)
{
	this.clearInsertion();
}

ac.TreeWidgetDnDAdapter.prototype.onPutData = function(data, sourceNode, sourceAdapter, offsetX, offsetY, controlKeyPressed)
{
	if ( $notset(data) || $notset(data.widget) )
	{
		console.log('unsupported %o', data);
		// unsupported data type received
		return;
	}
	// not supporting multiple selection yet, so we ignore it reducing to first element only
	var acElem = data.elements[0];
	if ( this.widget == data.widget )
	{
		console.log('internal source');
		// coming internally from this widget
		if ( acElem.index != this.lastInsertionIndex[0] )
		{
			return;
		}		
	}
	else
	{
		console.log('external source');
		// data from external widget
		acElem = this.widget.controller.onDnDTransformSource(this, acElem);
		console.log('%o', acElem);
		if ( null == acElem )
		{
			// not supported source object or canceled
			return;
		}
		// suppressing the copy - element is coming from external source therefore is always new
		controlKeyPressed = false;		
	}
	this.widget.changeElementPosition(acElem, this.acElem, this.lastInsertionIndex[1], controlKeyPressed);
}

ac.TreeWidgetDnDAdapter.prototype.onGetData = function()
{
	return this.data;
}


/*  ---------------------------------------------------------------- 
	ac.TreeWidget < ac.Widget
*/
$class('ac.TreeWidget < ac.Widget',
{
	construct:function()
	{
	}
});

ac.TreeWidget.prototype.onBlur = function()
{
	var caller = this;
	$foreach ( this.getSelection(), function(elem)
	{
		var container = caller.getElementNode(elem);
		if ( !container || !container.fc() || !container.ps() )
		{
			return;
		}
		var header = container.fc();
		var lside = container.ps();
		header.n('header midactive');
		header.p().lc().n('header-midactive-decor');
		if ( elem.isCollection && lside.fc() )
		{
			lside.fc().sa('src', 'mm/i/theme/?/arrow-?.png'.embed(fry.ui.theme.name, elem.hasState(elem.STATE_COLLAPSED)?'right':'down'));
		}
		if ( caller.view.options.hasElementIcon )
		{
			var url = caller.view.renderElementIcon(elem, true);
			header.s({backgroundImage:'url(?)'.embed(url.replace(/\)/g, '\\)').replace(/\(/g, '\\(')).replace(/active/, 'midactive')});
		}		
	});
}

ac.TreeWidget.prototype.onFocus = function()
{
	var caller = this;
	$foreach ( this.getSelection(), function(elem)
	{
		var container = caller.getElementNode(elem);
		if ( !container || !container.is() )
		{
			return;
		}
		var header = container.fc();
		var lside = container.ps();
		header.n('header active');
		header.p().lc().n('header-active-decor');
		if ( elem.isCollection && lside.fc() )
		{
			lside.fc().sa('src', 'mm/i/theme/?/arrow-?.png'.embed(fry.ui.theme.name, elem.hasState(elem.STATE_COLLAPSED)?'right':'down'));
		}
		if ( caller.view.options.hasElementIcon )
		{
			var url = caller.view.renderElementIcon(elem, true);
			header.s({backgroundImage:'url(?)'.embed(url.replace(/\)/g, '\\)').replace(/\(/g, '\\('))});
		}
	});
}

ac.TreeWidget.prototype.getElementNode = function(acElem)
{
	return $(this.genUniqIdent('te-?-?', acElem.id));
}

ac.TreeWidget.prototype.highliteElement = function(acElem, hiOff)
{
	var container = this.getElementNode(acElem);
	if ( !container || !container.is() )
	{
		return;
	}
	var header = container.fc();
	var lside = container.ps();
	var is_selected = -1 != header.n().indexOf('active');
	if ( hiOff && !is_selected || !hiOff && is_selected )
	{
		return;
	}
	if ( is_selected )
	{
		header.n('header');
		header.p().lc().rs();
		if ( acElem.isCollection && lside.fc() )
		{
			lside.fc().sa('src', 'mm/i/theme/?/arrow-?.png'.embed(fry.ui.theme.name, acElem.hasState(acElem.STATE_COLLAPSED)?'right':'down'));
		}
	}
	else
	{
		header.n('header active');
		var pos = this.renderingNode.abspos();
		var hpos = header.abspos();
//		header.p().a($$()).pos(true).x(pos.x-hpos.x).y(header.y()).h(header.h()-1).w(hpos.x-pos.x+1).z(this.renderingNode.z()).n('header-active-decor');
		if ( acElem.isCollection && lside.fc() )
		{
			lside.fc().sa('src', 'mm/i/theme/?/arrow-?.png'.embed(fry.ui.theme.name, acElem.hasState(acElem.STATE_COLLAPSED)?'right':'down'));
		}
		header.p().a($$()).pos(true).x(0).y((!$__tune.isGecko?this.renderingNode.fc().$.scrollTop:0) + hpos.y-pos.y-($__tune.isGecko?1:0)).h(header.h()-1).w(hpos.x-pos.x+1).z(this.renderingNode.z()).n('header-active-decor');
	}
	if ( this.view.options.hasElementIcon )
	{
		var url = this.view.renderElementIcon(acElem, !is_selected);
		header.s({backgroundImage:'url(?)'.embed(url.replace(/\)/g, '\\)').replace(/\(/g, '\\('))});
	}
}

ac.TreeWidget.prototype.changeSelection = function(acElem, removePrevious)
{
	if ( removePrevious )
	{
		// dehighlighting selection
		var caller = this;
		$foreach ( this.getSelection(), function(elem)
		{
			caller.highliteElement(elem, true);
		});
	}
	this.addSelection(acElem, removePrevious);
	this.highliteElement(acElem, false);
}

ac.TreeWidget.prototype.changeElementPosition = function(acElem, refElem, position, isCopy)
{
	// both element nodes found
	if ( isCopy )
	{
		acElem = acElem.cloneElement(true);
	}
	else
	{
		// checking bad insertions
		var elem = refElem;
		while ( this.model.rootElement != elem )
		{
			if ( elem == acElem )
			{
				return;
			}
			elem = elem.parentElement;
		}
	}
	var parentElem = refElem.parentElement;
	if ( -1 == position )
	{
		// insert before
		parentElem.insertBefore(acElem, refElem);
	}
	else
	{
		// insert after
		parentElem.insertAfter(acElem, refElem);
	}
	this.renderingNode.rs();
	this.render();
}

ac.TreeWidget.prototype.onResize = function(width, height)
{
	console.log(width, height);
	this.renderingNode.w(width).h(height);
	this.renderingNode.fc().w(width).h(height);
}

ac.TreeWidget.prototype.render = function()
{
	// adjusting container
	this.containerNode.s('overflow:hidden');
	this.renderingNode = this.containerNode.a($$()).n('acw-tree ?'.embed(this.cssClassName));
	var holder = this.renderingNode.a($$()).n('tree-inner').y(0).h(this.containerNode.h()).w(this.containerNode.w());
	// var holder = this.renderingNode.a($$()).n('tree-inner').y(0).w(this.containerNode.w());
	this.renderElement();
	// highlighting selection
	var caller = this;
	$foreach ( this.getSelection(), function(elem)
	{
		caller.highliteElement(elem);
	});	
}

ac.TreeWidget.prototype.redrawElement = function(acElem, callbackOnLoad)
{
	var body_id = this.genUniqIdent('b-?-?',acElem.id);
	var body = $(body_id);
	if (!body)
	{
	    return;
	}
	if (!body.p().is())
	{
	    return;
	}
	var renderingNode = body.p().p().rc();
	this.renderElement(acElem, renderingNode, callbackOnLoad);
}

ac.TreeWidget.prototype.renderElement = function(acElem, renderingNode, callbackOnLoad)
{
	acElem = acElem || this.model.rootElement;
	var is_root = 'undefined' == typeof renderingNode;
	renderingNode = renderingNode || this.renderingNode.fc();
	var caller = this;
	var is_collapsed = acElem.hasState(acElem.STATE_COLLAPSED);
	var body_id = this.genUniqIdent('b-?-?',acElem.id);
	
	var node = $(renderingNode).a($$()).n('root'+(is_root?'absolute':''));
	var lside = node.a($$()).n('lside').w(14).h(11).pos(true).z(this.renderingNode.z()+1);
	
	var renderChildrenWithLoad = function()
	{
		acElem.removeAllChildren();
		lside.fc().sa('src', 'mm/i/theme/?/arrow.loading.gif'.embed(fry.ui.theme.name));
		acElem.setState(acElem.STATE_LOADING|acElem.STATE_COLLAPSED);
		caller.model.loadElements(acElem,
			function()
			{
				// on success
				body.t('');
				acElem.setState(acElem.STATE_EXPANDED|acElem.STATE_LOADED);
				if ( !acElem.hasChildren() )
				{
					// removing arrow
					lside.fc().rs();
				}
				else
				{
					body.d(true);
					$foreach ( acElem.elements, function(elem)
					{
						caller.renderElement(elem, body);
					});
					lside.fc().sa('src', 'mm/i/theme/?/arrow-down.png'.embed(fry.ui.theme.name));
				}
				var selection = caller.getSelection();
				if ( null != selection && 0 != selection.length )
				{
					caller.changeSelection(selection[0], true);
				}
				if (callbackOnLoad)
				{
				    callbackOnLoad(true);
				}
			},
			function(e)
			{
				// on error
				lside.fc().sa('src', 'mm/i/theme/?/arrow-down.png'.embed(fry.ui.theme.name));
				acElem.setState(acElem.STATE_EXPANDED|acElem.STATE_LOADED);
				body.d(true);
				caller.view.renderElementLoadError(acElem, e, body.d(true).a($$()).n('error'));
				if (callbackOnLoad)
				{
				    callbackOnLoad(false);
				}
			}
		);
	}
	
	var renderChildrenLoaded = function()
	{
		if ( !acElem.hasChildren() )
		{
			lside.fc().rs();
		}
		else
		{
			var body = $(body_id).rc();
			$foreach ( acElem.elements, function(elem)
			{
				caller.renderElement(elem, body);
			});
		}
	}

	var container = node.a($$()).n('elem-container').i(this.genUniqIdent('te-?-?', acElem.id));
	var header = container.a($$()).n('header');
	if ( !is_root || this.view.options.showRootElement )
	{
		this.view.renderElement(acElem, header);
	}
	else
	{
		// root element not visible
		container.s('margin-left:0');
		lside.d(false);
		header.d(false);
	}
	if ( this.view.options.hasElementIcon )
	{
		var url = this.view.renderElementIcon(acElem);
		header.s('background-image:url(?);background-repeat:no-repeat;background-position:1px 0;padding-left:18px'.embed(url.replace(/\)/g, '\\)').replace(/\(/g, '\\(')));
	}
	header.e('click', function(evt)
	{
		ac.widget.focus(caller);
		evt.stop();
		caller.controller.onElementClick(acElem);
		var is_selected = -1 != header.n().indexOf('active');
		if ( !is_selected )
		{
			var remove_previous = true;
			if ( caller.controller.allowMultipleSelection() )
			{
				if ( evt.isAnyControlKeyPressed() )
				{
					remove_previous = false;
				}
			}
			caller.changeSelection(acElem, remove_previous);
		}
		else
		{
			if ( caller.controller.allowMultipleSelection() && evt.isAnyControlKeyPressed() )
			{
				caller.removeSelection(acElem);
				caller.highliteElement(acElem, is_selected);				
			}
		}
	});
	// adding DnD
	header.addDnD(fry.ui.dnd.MODE_BOTH_POINTER, $new(ac.TreeWidgetDnDAdapter, header, this, acElem));
	if ( acElem.isCollection )
	{
		if ( !is_root || this.view.options.showRootElement )
		{
			lside.t('<img src="mm/i/theme/?/arrow-?.png" width="12" height="12" border="0"?/>'.embed(fry.ui.theme.name, is_collapsed?'right':'down', $__tune.isIE?' style="position:absolute;left:-16px"':''), -1 != header.n().indexOf('active')?'active':'inactive');
			lside.fc().e('click', function(evt)
			{
				if ( acElem.hasState(acElem.STATE_LOADING) )
				{
					return;
				}
				if ( acElem.hasState(acElem.STATE_EXPANDED) )
				{
					// let's collapse it
					$(body_id).d(false);
					lside.fc().sa('src', 'mm/i/theme/?/arrow-right.png'.embed(fry.ui.theme.name));
					acElem.setStateCollapsed();
					var selection = caller.getSelection();
					if ( null != selection && 0 != selection.length )
					{
    					caller.changeSelection(selection[0], true);
					}
				}
				else
				{
					// let's expand it
					acElem.setStateExpanded();
					$(body_id).d(true);
					if ( !acElem.hasState(acElem.STATE_WILL_LOAD) )
					{
						// already loaded
						renderChildrenLoaded();
						lside.fc().sa('src', 'mm/i/theme/?/arrow-down.png'.embed(fry.ui.theme.name));
    					var selection = caller.getSelection();
    					if ( null != selection && 0 != selection.length )
    					{
        					caller.changeSelection(selection[0], true);
    					}
					}
					else
					{
						// load'em first
						renderChildrenWithLoad();
					}
				}
			});			
		}
		else
		{
			// root element not rendered
			if (lside && lside.is())
			{
				lside.t('<img src="mm/i/theme/void.gif" width="12" height="12" border="0"/>');
			}
		}

		if ( null != $(body_id) )
		{
			$(body_id).rs();
		}
		var body = container.a($$()).n('body').i(body_id).d(false);
		if ( !is_collapsed )
		{
			if ( acElem.hasState(acElem.STATE_WILL_LOAD) )
			{
				// children to be loaded first
				renderChildrenWithLoad();
			}
			else
			{
				body.d(true);
				// children loaded, render'em
				renderChildrenLoaded();
			}
		}
	}
	node.a($$('br')).d(false).s('clear:both');
}

		
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}