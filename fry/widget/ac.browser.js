/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Browser widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/*  ---------------------------------------------------------------- 
	ac.BrowserWidgetModel < ac.HierarchicalWidgetModel
*/

$class('ac.BrowserWidgetModel < ac.HierarchicalWidgetModel');



/*  ---------------------------------------------------------------- 
	ac.BrowserWidgetView < ac.HierarchicalWidgetView
*/
$class('ac.BrowserWidgetView < ac.HierarchicalWidgetView',
{
	construct:function(options)
	{
		this.options.defaultColumnWidth = $getdef(this.options.defaultColumnWidth, 190);
		this.options.minColumnWidth = $getdef(this.options.minColumnWidth, 100);
		this.options.maxColumnWidth = $getdef(this.options.maxColumnWidth, 400);
		this.options.sortElementsAlphabetically = $getdef(this.options.sortElementsAlphabetically, false);
	}
});

ac.BrowserWidgetView.prototype.renderElementInList = function(acElem, node)
{
	node.t(acElem.id);
}

ac.BrowserWidgetView.prototype.renderElementInListIcon = function(acElem)
{
	return '<img src="mm/i/theme/?/browser.?.(inactive).gif" width="13" height="13" border="0"/>'.embed(fry.ui.theme.name, acElem.isCollection?'folder':'item');
}

ac.BrowserWidgetView.prototype.renderElementDetail = function(acElem, node)
{
	node.t('<h1>Detail</h1><p>?</p>'.embed(acElem.id));
}

ac.BrowserWidgetView.prototype.renderElementSelection = function(acElem, node, mode)
{
	node.n(mode);
	for ( var i=0; i<node.$.childNodes.length; i++ )
	{
		var td = $(node.$.childNodes.item(i));
		if ( 0 == i )
		{
			// changing folder.(active).gif > folder.(midactive).gif etc.
			td.g('img').sa('src', td.g('img').ga('src').replace(/\([^\)]*\)/, '(?)'.embed(mode) ));
		}
		else if ( 2 == i && 'last' == td.n() )
		{
			td.g('img').sa('src', 'mm/i/theme/?/browser.arrow.(?).gif'.embed(fry.ui.theme.name, mode));
		}
	}	
}

/*  ---------------------------------------------------------------- 
	ac.BrowserWidgetController < ac.WidgetController
*/
$class('ac.BrowserWidgetController < ac.HierarchicalWidgetController');

ac.BrowserWidgetController.prototype.onElementValueEdited = function(acElem, colId, value, callbackOk, callbackError)
{
	// mapping to element `rename` operation
	this.onElementRename(acElem, value, callbackOk, callbackError);
}



/*  ---------------------------------------------------------------- 
	ac.BrowserWidgetDnDAdapter < ac.HierarchicalDnDAdapter
*/
$class('ac.BrowserWidgetDnDAdapter < ac.HierarchicalDnDAdapter');

ac.BrowserWidgetDnDAdapter.prototype.getElementNode = function(acElem)
{
	return this.widget.getElementNode(acElem).g('td:1');
}

ac.BrowserWidgetDnDAdapter.prototype.getHighlightingNode = function(node)
{
	return node.p();
}

/*  ---------------------------------------------------------------- 
	ac.BrowserWidgetColumpDropAdapter < fry.ui.DropAdapter
*/
$class('ac.BrowserWidgetColumpDropAdapter < fry.ui.DropAdapter',
{
	construct:function(node, widget, acElem)
	{
	    this.widget = widget;
		this.acElem = acElem;
	}
});

ac.BrowserWidgetColumpDropAdapter.prototype.onPutData = function(data, sourceNode, sourceAdapter, offsetX, offsetY, controlKeyPressed, allTargets, targetIndex)
{
	if ( 1 == allTargets.length )
	{
		// only container affected, otherwise, actual drop target chosen (handled in ac.BrowserWidgetDnDAdapter adapter)
		this.widget.copyElementsToClipboard(data.elements, controlKeyPressed);
		this.widget.changeSelection(this.acElem, true);
		ac.widget.pasteClipboard(this.widget);
	}
}


/*  ---------------------------------------------------------------- 
	ac.BrowserWidget < ac.HierarchicalWidget
*/
$class('ac.BrowserWidget < ac.HierarchicalWidget',
{
	construct:function()
	{
	    this.properties.columns = [];
		this.properties.lastDropOverTarget = null;
	}
});

ac.BrowserWidget.prototype.onKeyPress = function(evt)
{
	$__tune.behavior.clearSelection();
	var holder = this.renderingNode.fc().fc();
	var caller = this;
	switch ( evt.key )
	{
		case 65: // A - SELECT ALL
		{
			if ( evt.isAnyControlKeyPressed() )
			{
				var acElem = this.getLastSelection();
				if ( null != acElem )
				{
					if ( !acElem.isCollection )
					{
						acElem = acElem.parentElement;
					}
					this.highliteSelection(true, false);
					this.removeSelection();
					$foreach ( acElem.elements, function(elem)
					{
						
						if ( caller.controller.onElementFilter(elem) )
						{
							caller.addSelection(elem);							
						}
					});
					$__tune.behavior.clearSelection();
					this.highliteSelection(false, true);
				}
			}
		};break;
		case 68: // D - DUPLICATE (copy selection and paste)
		{
			if ( evt.isAnyControlKeyPressed() )
			{
				this.copySelectionToClipboard(true);
				this.changeSelection(this.getLastSelection(), true);
				ac.widget.pasteClipboard(this);
			}			
		};break;
		case 67: // C - COPY
		{
		}
		case 88: // X - CUT
		{
			if ( evt.isAnyControlKeyPressed() )
			{
				this.copySelectionToClipboard(67==evt.key);
			}			
		};break;
		case evt.KEY_ESCAPE:
		{
			this.highliteSelection(true);
			this.removeSelection();
		};break;
		case evt.KEY_ARR_UP: {} case evt.KEY_ARR_DOWN:
		{
			var selection = this.getSelection();
			var acElem = null;
			if ( 0 == selection.length || selection[0] == this.model.rootElement )
			{
				// no previous selection
				var level = holder.$.childNodes.length;
				acElem = selection[0] || this.properties.columns[level-1];
				if ( 0 < acElem.elements.length )
				{
					var elem = acElem.elements[0];
					while ( null != elem && !this.controller.onElementFilter(elem) )
					{
						elem = elem.nextSibling();
					}
					if ( null != elem )
					{
						this.changeSelection(elem, true);						
					}
				}
			}
			else
			{
				var is_up = evt.key == evt.KEY_ARR_UP;
				// get last active selection
				for ( var i=selection.length-1; i>=0; i-- )
				{
					if ( null != this.getElementNode(selection[i]) )
					{
						acElem = selection[i];
						break;
					}
				}
				if ( null == acElem )
				{
					// there's no active selection
					return;
				}
				var elem = acElem;
				while ( null != elem )
				{
					elem = is_up ? elem.previousSibling() : elem.nextSibling();
					if ( null == elem || this.controller.onElementFilter(elem) )
					{
						break;
					}
				}
				if ( null == elem || elem == acElem )
				{
					return;
				}
				this.changeSelection(elem, !evt.shiftKey);
			}
			this.scrollIntoView(elem);
		};break;
		case evt.KEY_ARR_RIGHT:
		{
			var acElem = this.getLastSelection();
			if ( null != acElem )
			{
				this.renderElement(acElem);
				if ( acElem.hasChildren() )
				{
					var elem = acElem.elements[0];
					while ( null != elem && !this.controller.onElementFilter(elem) )
					{
						elem = elem.nextSibling();
					}
					if ( null != elem )
					{
						this.changeSelection(elem, true);						
					}
				}
			}
		};break;
		case evt.KEY_ARR_LEFT:
		{
			var acElem = this.getLastSelection();
			if ( null != acElem )
			{
				if ( this.model.rootElement != acElem.parentElement )
				{
					this.renderElement(acElem.parentElement);
					this.changeSelection(acElem.parentElement, true);
				}				
			}
		};break;
	}
	evt.stop();
}

ac.BrowserWidget.prototype.postHighliteSelection = function(acElem)
{
	// adding selection down to root
	acElem = acElem.parentElement;
	while ( null != acElem && this.model.rootElement != acElem )
	{
		acElem.setStateExpanded();
		var node = this.getElementNode(acElem);
		if ( null != node )
		{
			this.highliteElementNode(acElem, node, 'midactive');
		}
		acElem = acElem.parentElement;
	}				
}

ac.BrowserWidget.prototype.postValueEditing = function()
{
	var editor = this.valueEditor;
	this.view.renderElementInList(editor.acElem, editor.node);
	if ( !editor.acElem.isCollection )
	{
		this.renderElement(editor.acElem);
	}
}

ac.BrowserWidget.prototype.scrollIntoView = function(acElem)
{
	var holder = this.renderingNode.fc().fc();
	if ( holder.w() > this.renderingNode.w() )
	{
		holder.p().$.scrollLeft = holder.w() - this.renderingNode.w();
	}
	if ( !acElem )
	{
		return;
	}
	var node = this.getElementNode(acElem);
	if ( null == node )
	{
		return;
	}
	var node_pos = node.fc().abspos();
	var container_node = node.gp('div').p();
	var container_pos = container_node.abspos();
	var offset_h = node_pos.y - container_pos.y;
	container_node.$.scrollTop = offset_h - Math.floor(container_node.h()/2);
	
}

ac.BrowserWidget.prototype.showFrom = function(acElem, highliteAfter)
{
	acElem = acElem || this.getLastSelection();
	if ( 'object' != typeof acElem )
	{
		acElem = this.model.rootElement;
	}
	var show_list = [];
	var elem = acElem;
	while ( this.model.rootElement != elem )
	{
		if ( !elem )
		{
			break;
		}
		show_list.push(elem);
		elem = elem.parentElement;
	}
	show_list.push(elem);
	var col_index = 0;
	for ( var i=show_list.length-1; i>=0; i-- )
	{
		var elem = show_list[i];
		if ( elem && this.getElementChildrenSum(elem) != elem.getChildrenStamp() )
		{
			// not rendered yet
			this.renderElement(elem);	
		}
	}
	if ( highliteAfter )
	{
		this.changeSelection(acElem, true);
	}
	delete show_list;
	this.controller.onAfterShowFrom(acElem);
}

ac.BrowserWidget.prototype.render = function()
{
	var caller = this;
	this.containerNode.s('overflow:hidden');
	this.renderingNode = this.containerNode.a($$()).n('acw-browser ?'.embed(this.cssClassName));
	var container = this.renderingNode.a($$()).n('container').h(this.containerNode.h()).w(this.containerNode.w()+$__tune.ui.scrollbarWidth).s('overflow:scroll;clip:rect(0 ?px ?px 0)'.embed(this.containerNode.w(), this.containerNode.h()));
	container.e('scroll', function(evt)
	{
		if ( 0 != container.$.scrollTop )
		{
			container.$.scrollTop = 0;			
		}
	})
	container.a($$()).n('holder').h(container.h()).w(0);
	this.renderElement();
}

ac.BrowserWidget.prototype.renderElement = function(acElem, onRenderCallback)
{
	acElem = acElem || this.model.rootElement;
	var caller = this;
	var level = this.model.getElementLevel(acElem);
	var holder = this.renderingNode.fc().fc();
	var holder_width = holder.w();
	var scrollbarWidth = $__tune.ui.scrollbarWidth;
	
	var columns = holder.$.childNodes;
	var num_columns = columns.length;
	for  (var i=num_columns-1; i>level; i--)
	{
		holder_width -= $(columns.item(i)).w();
		$(columns.item(i)).rs();
		this.properties.columns[i] = null;
	}
	this.properties.columns[level] = acElem;
	this.setElementChildrenSum(acElem);
	var inner = null;
//	var col_width = acElem.widgetProperties.browserColWidth = acElem.widgetProperties.browserColWidth || this.view.options.defaultColumnWidth;
	var col_width = this.getElementWidgetProperty(acElem, 'col-width', false) || this.view.options.defaultColumnWidth;
	this.setElementWidgetProperty(acElem, 'col-width', col_width);
	var col_container = null;
	if ( columns.length <= level )
	{
		holder.w(holder_width+col_width)
		// rendering column
		col_container = holder.a($$()).n('column').h(holder.h()).w(col_width);
		if ( !$__tune.isOpera )
		{
			col_container.pos(false);
		}
		if ( acElem.isCollection )
		{
			col_container.e('click', function(evt)
			{
				var dw = 0;
				var holder = caller.renderingNode.fc().fc();
				var num_columns = holder.$.childNodes.length;
				while ( null != col_container.ns() )
				{
					var col_node = col_container.ns();
					dw += col_node.w();
					col_node.rs();
					delete col_node;
				}
				if ( 0 != dw )
				{
					holder.w(holder.w()-dw);
				}
				caller.changeSelection(acElem, true);
				delete holder;
			});
		}
		var column = col_container.a($$()).n('scroll').h(holder.h()).s('width:auto');
		inner = column.a($$()).n('browser-inner');
		// resizer
		var resizer = col_container.a($$()).n('acw-browser-resizer').pos(true).x(col_width-scrollbarWidth).y(holder.h()-2*scrollbarWidth).w(scrollbarWidth).h(scrollbarWidth);
		resizer.addDrag(fry.ui.drag.MODE_HORIZONTAL,
		{
			onDragMove:function(node, nx, ny, ox, oy)
			{
				var new_width = col_container.w()+ox;
				var offsetX = 0;
				var o = caller.view.options;
				if ( o.minColumnWidth > new_width )
				{
					offsetX = o.minColumnWidth - new_width;
				}
				if ( o.maxColumnWidth < new_width )
				{
					offsetX = o.maxColumnWidth - new_width;
				}
				ox += offsetX;
				col_container.w(col_container.w()+ox);
				holder.w(holder.w()+ox);
				resizer.x(resizer.x()+ox);
				caller.setElementWidgetProperty(acElem, 'col-width', ox + caller.getElementWidgetProperty(acElem, 'col-width'));
//				acElem.widgetProperties.browserColWidth += ox;
				return {x:nx+offsetX, y:ny};
			}
		});
		delete resizer;
	}
	else
	{
		col_container = $(columns.item(level));
		// changing width of container
		col_container.w(col_width);
		// changing x of resizer
		col_container.lc().x(col_width-scrollbarWidth);
		inner = col_container.fc().fc();
		holder.w(holder_width);
	}
	if ( caller.controller.allowOperations() )
	{
		col_container.addDnD(fry.ui.dnd.MODE_DROP, $new(ac.BrowserWidgetColumpDropAdapter, col_container, this, acElem));
	}
	inner.t('');
	if ( acElem.isCollection )
	{
		var render = function()
		{
			var tbody = inner.t('').a($$('table')).sa('cellSpacing',0).a($$('tbody'));
			var tr_index = 0;
			$foreach ( acElem.elements, function(elem)
			{
				if ( !caller.controller.onElementFilter(elem) )
				{
					// not passed through filter, will not render
					return;
				}
				caller.setElementNode(elem, null);
				var tr = tbody.a($$('tr')).sa('elid', elem.id).i(caller.genUniqIdent('ec-?-?', elem.id));
				// icon
				tr.a($$('td')).sa('vAlign', 'top').n('first').t(caller.view.renderElementInListIcon(elem, elem.isCollection)).w(18);
				// label
				caller.view.renderElementInList(elem, tr.a($$('td')).n('label').sa('width', '99%'));
				// arrow
				var td = tr.a($$('td')).w(11);
				if ( elem.isCollection )
				{
					td.n('last').t('<img src="mm/i/theme/?/browser.arrow.(inactive).gif" width="7" height="7" border="0"/>'.embed(fry.ui.theme.name));
				}
				else
				{
					td.t('<img src="mm/i/theme/void.gif" width="7" height="7" border="0"/>');
				}
				delete td;
				tr.e('click', function(evt)
				{
					ac.widget.focus(caller);
					caller.setElementNode(elem, tr);
					var is_meta_key = evt.isAnyControlKeyPressed();
					if ( is_meta_key && caller.controller.allowMultipleSelection() )
					{
						if ( 'active' == tr.ga('himode') )
						{
							// already selected
							caller.highliteSelection(true);
							caller.removeSelection(elem);
							caller.highliteSelection(false, true);
						}
						else
						{
							caller.changeSelection(elem, false);
						}
					}
					else
					{
						caller.changeSelection(elem, true);						
					}
					evt.stop();
					if ( !is_meta_key )
					{
						if ( elem == caller.properties.columns[level+1] && (null==tr.ga('rename-interval') || fry.ui.util.getMillis()-800>tr.ga('rename-interval')) )
						{
							// expanded detail already, will offer rename
							if ( false && caller.controller.allowRename() )
							{
								// preparing editor
								var col_id = '';
								var editor = caller.controller.onGetElementValueEditor(elem, col_id);
								if ( null == editor )
								{
									return;
								}
								if ( null != caller.valueEditor )
								{
									caller.valueEditCanceled();
								}
								editor.setOwnerWidget(caller);
								
								var enode = tr.g('td:1');
								caller.valueEditor = {
									node:enode,
									acElem:elem,
									colId:col_id,
									value:caller.controller.onGetElementValueForEditing(elem, col_id),
									editor:editor
								};
								// rendering editor
								editor.render(enode, enode.w(), caller.valueEditor.value);								
							}
						}
						else
						{
							caller.renderElement(elem);							
						}
						tr.sa('rename-interval', fry.ui.util.getMillis());
					}
					caller.controller.onElementClick(elem, evt);
				});
				tr.e('dblclick', function(evt)
				{
					$__tune.behavior.clearSelection();
					caller.changeSelection(elem, true);
					caller.controller.onElementDblClick(elem, evt);
					evt.stop();
				});
				if ( caller.controller.allowOperations() )
				{
					tr.addDnD(elem.isCollection ? fry.ui.dnd.MODE_BOTH_POINTER : fry.ui.dnd.MODE_DRAG_POINTER, $new(ac.BrowserWidgetDnDAdapter, tr.fc().ns(), caller, elem));					
				}
				delete tr;
			});
			caller.scrollIntoView();
			if ( onRenderCallback )
			{
				onRenderCallback();
			}
			delete tbody;
			caller.controller.onAfterRenderElement(acElem);
		}
		if ( acElem.hasState(acElem.STATE_WILL_LOAD) )
		{
			inner.a($$()).n('loading');
			acElem.removeAllChildren();
			acElem.setState(acElem.STATE_LOADING|acElem.STATE_COLLAPSED);
			caller.model.loadElements(acElem,
				function()
				{
					// on success
					acElem.setState(acElem.STATE_EXPANDED|acElem.STATE_LOADED);
					if ( caller.view.options.sortElementsAlphabetically )
					{
						acElem.sort(function(element)
						{
							return caller.controller.onGetElementValueForSorting(element);
						});
					}
					if ( caller.properties.columns[level] == acElem )
					{
						// user hasn't clicked on another element to render yet
						render();
					}
				},
				function(e)
				{
					// on error
					acElem.setState(acElem.STATE_EXPANDED|acElem.STATE_LOADED);
					if ( caller.properties.columns[level] == acElem )
					{
						caller.view.renderElementLoadError(acElem, e, inner.t('').a($$()).n('error'));						
					}
				}
			);
		}
		else
		{
			render();
		}
	}
	else
	{
		// rendering detail
		var detail = inner.a($$()).n('detail');
		this.view.renderElementDetail(acElem, detail);
		delete detail;
	}
	delete col_container;
	delete inner;
	delete columns;
	delete holder;
}



		
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}