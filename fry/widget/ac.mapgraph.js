/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.MapGraph widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/*  ---------------------------------------------------------------- 
	ac.MapGraphWidgetModel < ac.HierarchicalWidgetModel
*/

$class('ac.MapGraphWidgetModel < ac.HierarchicalWidgetModel',
{
	construct:function(rootElement, elements, relations)
	{
		if ( elements instanceof ACElement )
		{
			// tree structure with implicitly defined relations
			this.rootElement = elements;
			this.elements = null;
			this.relations = null;
		}
		else
		{
			// elements with explicitly defined relations
			this.rootElement = null;
			this.elements = elements;
			this.relations = relations || [];
		}
	},
	destruct:function()
	{
		
	}
});

ac.MapGraphWidgetModel.prototype.hasImplicitRelations = function()
{
	return null != this.rootElement;
}


/*  ---------------------------------------------------------------- 
	ac.MapGraphWidgetView < ac.WidgetView
*/

$class('ac.MapGraphWidgetView < ac.HierarchicalWidgetView',
{
	construct:function(options)
	{
		this.setOptions(options);
	}
});

ac.MapGraphWidgetView.prototype.setOptions = function(options)
{
	if ( 'undefined' == typeof this.options.marginSize )
	{
		this.options.marginSize = 4;
	}
	if ( 'undefined' == typeof this.options.boxDimension )
	{
		this.options.boxDimension = {width:120, height:90, marginRight:40, marginBottom:46};
	}
	if ( 'undefined' == typeof this.options.expandMode )
	{
		// choices: auto, collapse-siblings
		this.options.expandMode = 'collapse-siblings';
	}
	if ( 'undefined' == typeof this.options.keepCentered )
	{
		this.options.keepCentered = true;
	}
	if ( 'undefined' == typeof this.options.map )
	{
		this.options.map = {visible:true, width:140, mode:'auto'};
	}
	if ( 'undefined' == typeof this.options.graphUnit )
	{
		this.options.graphUnit = {x:64, y:64};
	}
	if ( 'undefined' == typeof this.options.hasElementHeader )
	{
		this.options.hasElementHeader = true;
	}
	if ( 'undefined' == typeof this.options.hasElementFooter )
	{
		this.options.hasElementFooter = true;
	}
	if ( 'undefined' == typeof this.options.hasGrid )
	{
		this.options.hasGrid = true;
	}
}


ac.MapGraphWidgetView.prototype.renderElement = function(acElem, node)
{
	if ( !this.widget.model.hasImplicitRelations() )
	{
		var node_header = null;
		if ( this.options.hasElementHeader )
		{
			node_header = node.a($$()).n('header');
			this.renderElementHeader(acElem, node_header.a($$()).n('inner'));
			node_header.w(node_header.w()).pos(true);
		}
		var node_body = node.a($$()).n('body');
		this.renderElementBody(acElem, node_body.a($$()).n('inner'));
		var node_footer = null;
		if ( this.options.hasElementFooter )
		{
			node_footer = node.a($$()).n('footer');
			this.renderElementFooter(acElem, node_footer.a($$()).n('inner'));
			node_footer.w(node_footer.w()).pos(true).y(node.h()-node_footer.h());
		}
		node_body.w(node_body.w()).pos(true).h(node.h()-(null!=node_header?node_header.h():0)-(null!=node_footer?node_footer.h():0)).y(null!=node_header?node_header.h():0);
	}
}

ac.MapGraphWidgetView.prototype.renderElementSelection = function(acElem, node, mode)
{
}

ac.MapGraphWidgetView.prototype.renderElementHeader = function(acElem, node)
{
}

ac.MapGraphWidgetView.prototype.renderElementBody = function(acElem, node)
{
}

ac.MapGraphWidgetView.prototype.renderElementFooter = function(acElem, node)
{
}


/*  ---------------------------------------------------------------- 
	ac.MapGraphWidgetController < ac.WidgetController
*/

$class('ac.MapGraphWidgetController < ac.HierarchicalWidgetController');

ac.MapGraphWidgetController.prototype.getCoords = function(acElem, proposedX, proposedY)
{
	// if null is returned, element is rendered according the default layout
	return null;
}

/*  ---------------------------------------------------------------- 
	ac.MapGraphWidgetMapFrameDragAdapter < fry.ui.DragAdapter
*/
$class('ac.MapGraphWidgetMapFrameDragAdapter < fry.ui.DragAdapter',
{
	construct:function(node, widget)
	{
		this.widget = widget;
	}
});

ac.MapGraphWidgetMapFrameDragAdapter.prototype.onDragMove = function(dragNode, nx, ny, offsetX, offsetY)
{
	nx = Math.max(0, nx);
	ny = Math.max(0, ny);
	var area_node = this.node.p().fc();
	if ( this.node.w() + nx > area_node.w() )
	{
		nx = area_node.w() - this.node.w();
	}
	if ( this.node.h() + ny > area_node.h() )
	{
		ny = area_node.h() - this.node.h();
	}
	// switching off scroll handler
	this.widget.syncRunning = true;
	var map_node = this.widget.nodeMap.fc();
	var rend_node = this.widget.renderingNode.$;
	rend_node.scrollLeft = Math.floor((nx/map_node.w())*rend_node.scrollWidth);
	rend_node.scrollTop = Math.floor((ny/map_node.h())*rend_node.scrollHeight);
	// switching it back on 
	this.widget.syncRunning = false;
	
	return {x:nx, y:ny}
}


/*  ---------------------------------------------------------------- 
	ac.MapGraphWidgetSelectionDragAdapter < fry.ui.DragAdapter
	
	Takes care of frame element selection.
*/
$class('ac.MapGraphWidgetSelectionDragAdapter < fry.ui.DragAdapter',
{
	construct:function(node, widget)
	{
		this.widget = widget;
		this.startPos = null;
		this.rendNodePos = null;
		this.startTimer = 0;
		this.checkTimer = 0;
		this.startDragPos = null;
		this.nodeSelection = null;
		this.isMetaKey = false;
	}
});

ac.MapGraphWidgetSelectionDragAdapter.prototype.onGetCursorNode = function()
{
	return $$();
}

ac.MapGraphWidgetSelectionDragAdapter.prototype.onDragStart = function(evt)
{
	var pos = evt.$.abspos();
	var rend_node_pos = this.widget.renderingNode.abspos();
	pos.x += evt.getOffsetX() - rend_node_pos.x -4;
	pos.y += evt.getOffsetY() - rend_node_pos.y -4;
	this.startPos = pos;
	this.rendNodePos = rend_node_pos;
	this.nodeSelection = this.widget.renderingNode.a($$()).o(0.5).n('acw-mapgraph-tree-drag-selection').pos(true).x(pos.x).y(pos.y).w(2).h(2);
	this.checkTimer = this.startTimer = fry.ui.util.getMillis();
	this.isMetaKey = evt.isAnyControlKeyPressed();
	return true;
}

ac.MapGraphWidgetSelectionDragAdapter.prototype.onDragStop = function()
{
	if ( null != this.nodeSelection )
	{
		this.nodeSelection.rs();		
	}
	return true;
}

ac.MapGraphWidgetSelectionDragAdapter.prototype.onDragMove = function(dragNode, nx, ny, offsetX, offsetY)
{
	if ( null == this.startDragPos )
	{
		this.startDragPos = {x:nx, y:ny};
	}
	var x = this.startPos.x;
	var y = this.startPos.y;
	var w = Math.abs(nx-this.startDragPos.x);
	var h = Math.abs(ny-this.startDragPos.y);
	if ( this.startDragPos.x > nx )
	{
		x -= w;
		if ( x < 0 )
		{
			w += x;
			x = 0;
		}
	}
	if ( this.startDragPos.y > ny )
	{
		y -= h;
		if ( y < 0 )
		{
			h += y;
			y = 0;
		}
	}
	this.nodeSelection.x(x).y(y).h(h).w(w);
	// checking underlying elements for intersection
	
	var t = fry.ui.util.getMillis();
	if ( t > this.checkTimer + 200 )
	{
		this.widget.checkSelection(this.startTimer, this.rendNodePos.x, this.rendNodePos.y, x, y, w, h, this.isMetaKey);
		this.checkTimer = t;
	}

	return {x:nx, y:ny};
}


/*  ---------------------------------------------------------------- 
	ac.MapGraphWidgetTreeDnDAdapter < ac.HierarchicalDnDAdapter
	
	Handles tree elements DnD.
	
*/
$class('ac.MapGraphWidgetTreeDnDAdapter < ac.HierarchicalDnDAdapter');

/*  ---------------------------------------------------------------- 
	ac.MapGraphWidget < ac.Widget
*/
$class('ac.MapGraphWidget < ac.HierarchicalWidget',
{
	construct:function()
	{
		this.mapNode = null;
		this.syncRunning = true;
	}
});

ac.MapGraphWidget.prototype.isRootElementSelectable = function()
{
	return true;
}

ac.MapGraphWidget.prototype.isSelectionCollapsedAfterDehighlighting = function()
{
	return false;
}


ac.MapGraphWidget.prototype.onKeyPress = function(evt)
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
		};break;
		case evt.KEY_ARR_RIGHT:
		{
		};break;
		case evt.KEY_ARR_LEFT:
		{
		};break;
	}
	evt.stop();
}

ac.MapGraphWidget.prototype.render = function()
{
	// adjusting container
	this.containerNode.s('overflow:hidden');
	this.renderingNode = this.containerNode.a($$()).n('acw-mapgraph ?'.embed(this.cssClassName));
	var margin = this.view.options.marginSize;
	this.renderingNode.s('overflow:auto').pos(true).x(margin).y(margin).w(this.containerNode.w()-2*margin).h(this.containerNode.h()-2*margin);
	
	if ( this.model.hasImplicitRelations() )
	{
		var caller = this;
		this.renderingNode.e('scroll', function(evt)
		{
			evt.stop();
			if ( !caller.syncRunning )
			{
				caller.synchronizeMapFrame();				
			}
		});		
		this.renderTreeStructure();
	}
	else
	{
		this.renderGraphStructure();
	}
}

ac.MapGraphWidget.prototype.checkSelection = function(t_started, rend_node_x, rend_node_y, sel_node_x, sel_node_y, sel_node_w, sel_node_h, is_meta_key)
{
	var caller = this;
	this.model.rootElement.traverseElement(function(acElem)
	{
		var node = caller.getElementNode(acElem);
		if ( null == node || !node.is() )
		{
			return false;
		}
		var mg_prop = caller.getElementWidgetProperty(acElem, 'c-cache', {coordsCache:{t:0, p:[]}});
		if ( mg_prop.coordsCache.t != t_started )
		{
			// not in cache yet
			mg_prop.coordsCache.t = t_started;
			var pos = node.abspos();
			var x = pos.x - rend_node_x;
			var y = pos.y - rend_node_y;
			mg_prop.coordsCache.p =
			[
				[x, y],
				[x+node.w(), y],
				[x+node.w(), y+node.h()],
				[x, y+node.h()]
			];
		}
		var was_active = false;
		for ( var i=0; i<4; i++ )
		{
			var coord = mg_prop.coordsCache.p[i];
			if ( coord[0] >= sel_node_x && coord[0] <= sel_node_x+sel_node_w && coord[1] >= sel_node_y && coord[1] <= sel_node_y+sel_node_h )
			{
				if ( is_meta_key )
				{
					if ( 'active' == node.ga('himode') )
					{
						// already selected
//						caller.highliteSelection(true);
//						caller.removeSelection(acElem);
//						caller.highliteSelection(false, true);
					}
					else
					{
//						caller.changeSelection(acElem, false);
					}
				}
				else
				{
//					caller.changeSelection(acElem, false);
				}				
				was_active = true;
				break;
			}
		}
		if ( !was_active )
		{
//			caller.removeSelection(acElem);
//			caller.highliteSelection(false, true);
//			caller.changeSelection(acElem, true);
//			caller.view.renderElementSelection(acElem, node, 'inactive');			
		}
		return false;
	});	
}

ac.MapGraphWidget.prototype.renderTreeStructure = function()
{
	this.renderTreeElement();
	if ( this.view.options.mapEnabled )
	{
		this.showTreeMap();
	}
	// adding selection capabilities
	var caller = this;
	this.selectionProp = {started:false, node:null, pos:null, t:0, tCheck:0};
	// currently disabled due some concurrency problems with individual elements DnD
	return;
	this.renderingNode.addDrag(fry.ui.drag.MODE_STANDARD, $new(ac.MapGraphWidgetSelectionDragAdapter, this.renderingNode, this));
}

ac.MapGraphWidget.prototype.showFrom = function(acElem)
{
	var elem = acElem;
	while ( elem != this.model.rootElement )
	{
		elem.setStateExpanded();
		if ( 'collapse-siblings' == this.view.options.expandMode )
		{
			for ( var i in acElem.parentElement.elements )
			{
				var sibling_elem = acElem.parentElement.elements[i];
				if ( sibling_elem && acElem != sibling_elem )
				{
					sibling_elem.setStateCollapsed();
				}
			}			
		}
		elem = elem.parentElement;
	}
	elem.setStateExpanded();
	this.lastShowFromElement = acElem;
	this.renderTreeElement(elem, this.renderingNode.t(''));
	this.lastShowFromElement = null;
	this.scrollIntoView(acElem);
	this.controller.onAfterShowFrom(acElem);
}

ac.MapGraphWidget.prototype.scrollIntoView = function(acElem)
{
	var node = $(this.genUniqIdent('e-?-?', acElem.id));
	if ( null != node && node.is() )
	{
		var pos = node.pos();
		this.syncRunning = true;
		this.renderingNode.scrollLeft = pos.x;
		this.renderingNode.scrollTop = pos.y;
		this.syncRunning = false;
		this.synchronizeMapFrame();
	}
}

ac.MapGraphWidget.prototype.collapseTreeElement = function(acElem)
{
	var parent_node = $(this.genUniqIdent('e-?-?', acElem.id));
	if ( null != parent_node && parent_node.is() )
	{
		if ( acElem.hasState(acElem.STATE_EXPANDED) )
		{
			acElem.setState(acElem.STATE_COLLAPSED);
			this.renderTreeElement(acElem, parent_node.p().t(''));
			this.highliteSelection(true, true);
			this.scrollIntoView(acElem);		
		}
	}
}

ac.MapGraphWidget.prototype.expandTreeElement = function(acElem)
{
	var parent_node = $(this.genUniqIdent('e-?-?', acElem.id));
	if ( null != parent_node && parent_node.is() )
	{
		if ( acElem.hasState(acElem.STATE_COLLAPSED) )
		{
			acElem.setStateExpanded();
			this.renderTreeElement(acElem, parent_node.p().t(''));
			if ( 'collapse-siblings' == this.view.options.expandMode && acElem != this.model.rootElement )
			{
				// collapsing other expanded siblings
				for ( var i in acElem.parentElement.elements )
				{
					var sibling_elem = acElem.parentElement.elements[i];
					if ( sibling_elem && acElem != sibling_elem )
					{
						this.collapseTreeElement(sibling_elem, true);
					}
				}
			}
			this.highliteSelection(true, true);
			this.scrollIntoView(acElem);		
		}
	}
2}

ac.MapGraphWidget.prototype.renderTreeElement = function(acElem, parentNode, skipLoading)
{
	acElem = acElem || this.model.rootElement;
	parentNode = parentNode || this.renderingNode;
	
	var boxDimension = this.view.options.boxDimension;
	var is_horizontal = this.view.options.direction;
	
	
	var caller = this;
	var render = function()
	{
		caller.syncRunning = true;
		var num_children = acElem.elements.length;
		var render_children = 0 != num_children && acElem.hasState(acElem.STATE_EXPANDED);
		
		var tbody = parentNode.a($$('table')).sa('cellSpacing','0').sa('is-node','true').i(caller.genUniqIdent('e-?-?', acElem.id)).sa('width', caller.view.options.keepCentered?'100%':'').a($$('tbody'));
		var tr = tbody.a($$('tr'));
		
		var td = tr.a($$('td')).sa('colSpan', num_children).sa('vAlign', 'top').sa('align', 'center');
		
		tr_inner = td.a($$('table')).sa('cellSpacing', '0').sa('width', '100%').a($$('tbody')).a($$('tr'));
		if ( acElem != caller.model.rootElement )
		{
			tr_inner.a($$('td')).sa('width', '50%').n('acw-mapgraph-tree-line-v').s('height:?px'.embed(boxDimension.marginBottom));
			tr_inner.a($$('td')).sa('width', '50%').t($__tune.isGecko?'&nbsp;':'');
		}
		else
		{
			tbody.p().s('margin-top:4px');
		}
		
		var td_inner = tr_inner.p().a($$('tr')).a($$('td')).sa('colSpan', '2').sa('align', 'center');
		var div_inner = td_inner.a($$()).s('padding:0 ?px 0 ?px'.embed(boxDimension.marginRight, boxDimension.marginRight)).n('acw-mapgraph-tree-element');
		
		var node_inner = div_inner.a($$()).n('inner').i(caller.genUniqIdent('ec-?-?', acElem.id)).s('width:?px;height:?px;'.embed(boxDimension.width, boxDimension.height));
		caller.setElementNode(acElem, node_inner);
		caller.view.renderElement(acElem, node_inner);
		node_inner.e('click', function(evt)
		{
			ac.widget.focus(caller);
			caller.setElementNode(acElem, node_inner);
			var is_meta_key = evt.isAnyControlKeyPressed();
			if ( is_meta_key && caller.controller.allowMultipleSelection() )
			{
				if ( 'active' == node_inner.ga('himode') )
				{
					// already selected
					caller.highliteSelection(true);
					caller.removeSelection(acElem);
					caller.highliteSelection(false, true);
				}
				else
				{
					caller.changeSelection(acElem, false);
				}
			}
			else
			{
				caller.changeSelection(acElem, true);						
			}
			evt.stop();			
			caller.controller.onElementClick(acElem, evt);
		});
		
		node_inner.addDnD(acElem.isCollection ? fry.ui.dnd.MODE_BOTH_POINTER : fry.ui.dnd.MODE_DRAG_POINTER, $new(ac.MapGraphWidgetTreeDnDAdapter, node_inner, caller, acElem));
		
		
		if ( render_children )
		{
			var img = td_inner.a($$());
			img.t('<img src="mm/i/theme/?/arrow-down.gif" width="12" height="11" style="margin-left:?px" />'.embed(fry.ui.theme.name, $__tune.isGecko?2:0)).fc().e('click', function(evt)
			{
				evt.stop();
				console.log('collapse');
				caller.collapseTreeElement(acElem);
			})
			
			tr_inner = tr_inner.p().a($$('tr'));
			tr_inner.a($$('td')).sa('width', '50%').n('acw-mapgraph-tree-line-v').s('height:?px'.embed(boxDimension.marginBottom))
			tr_inner.a($$('td')).t($__tune.isGecko?'&nbsp;':'');;
		}
		else
		{
			if ( acElem.isCollection && (acElem.hasState(acElem.STATE_WILL_LOAD) || 0 < num_children) )
			{
				var img = td_inner.a($$());
				img.t('<img src="mm/i/theme/?/arrow-right.gif" width="12" height="11" />'.embed(fry.ui.theme.name)).fc().e('click', function(evt)
				{
					evt.stop();
					console.log('expand');
					if ( acElem.hasState(acElem.STATE_WILL_LOAD) )
					{
						evt.$.sa('src', 'mm/i/theme/?/arrow.loading.gif'.embed(fry.ui.theme.name));
						caller.model.loadElements(acElem,
							function()
							{
								// on success
								acElem.setState(acElem.STATE_COLLAPSED|acElem.STATE_LOADED);
								caller.expandTreeElement(acElem);
							},
							function(e)
							{
								// on error
								acElem.setState(acElem.STATE_EXPANDED|acElem.STATE_LOADED);
								caller.view.renderElementLoadError(acElem, e, evt.$.p().t('').a($$()).n('error'));
							}
						);								
					}
					else
					{
						caller.expandTreeElement(acElem);						
					}
				})
			}
			caller.syncRunning = false;
			return;
		}

		var tr_lines = null;
		if ( 1 < num_children )
		{
			tr_lines = tbody.a($$('tr'));
		}
		var tr_children = tbody.a($$('tr'));
		
		var td_width = 0<num_children ? Math.floor(100/num_children) : '100';

		$foreach ( acElem.elements, function(child_elem, i)
		{
			if ( 1 < num_children )
			{
				var tr = tr_lines.a($$('td')).sa('width', '?%'.embed(td_width)).a($$('table')).sa('cellSpacing', '0').sa('width', '100%').a($$('tbody')).a($$('tr'));
				if ( 0 < i && i < num_children-1 )
				{
					tr.a($$('td')).sa('width', '100%').n('acw-mapgraph-tree-line-h').t('<img src="mm/i/theme/void.gif" width="1" height="1" />');
				}
				else
				{
					var td = tr.a($$('td')).sa('width', '50%');
					if ( 0 != i && num_children == i + 1 )
					{
						td.n('acw-mapgraph-tree-line-h');
						td.t('<img src="mm/i/theme/void.gif" width="1" height="1" />');
					}
					td = tr.a($$('td')).sa('width', '50%');
					if ( 0 == i )
					{
						td.n('acw-mapgraph-tree-line-h');
						td.t('<img src="mm/i/theme/void.gif" width="1" height="1" />');
					}				
				}				
			}
			td = tr_children.a($$('td')).sa('width', '?%'.embed(td_width)).sa('vAlign', 'top').s('text-align:center');
			caller.renderTreeElement(child_elem, td, true);
		});
		caller.syncRunning = false;
		caller.controller.onAfterRenderElement(acElem);
	}
	if ( (!skipLoading || this.lastShowFromElement == acElem) && acElem.hasState(acElem.STATE_WILL_LOAD) )
	{
		acElem.removeAllChildren();
		parentNode.t('<img src="mm/i/theme/?/arrow.loading.gif"/>'.embed(fry.ui.theme.name));
		acElem.setState(acElem.STATE_LOADING|acElem.STATE_COLLAPSED);
		caller.model.loadElements(acElem,
			function()
			{
				// on success
				acElem.setState(acElem.STATE_EXPANDED|acElem.STATE_LOADED);
				parentNode.t('');
				render();
				caller.showTreeMap();
			},
			function(e)
			{
				// on error
				acElem.setState(acElem.STATE_EXPANDED|acElem.STATE_LOADED);
				caller.view.renderElementLoadError(acElem, e, parentNode.t('').a($$()).n('error'));
			}
		);		
	}
	else
	{
		render();
		this.showTreeMap();
	}
}

ac.MapGraphWidget.prototype.renderTreeMap = function(node)
{
	var points = [];
	var rend_node_pos = this.renderingNode.abspos();
	$foreach ( this.renderingNode.g('table'), function(table)
	{
		if ( 'true' == table.ga('is-node') )
		{
			var pos = table.abspos();
			points.push([(pos.x+(table.w()/2))-rend_node_pos.x, pos.y-rend_node_pos.y]);
		}
	});
	var area_node = this.renderingNode.g('table:0');
	var r_x = node.w() / area_node.w();
	var r_y = node.h() / area_node.h();
	var i_w = r_x*this.view.options.boxDimension.width;
	if ( 0 == i_w )
	{
		i_w = 1;
	}
	var i_h = r_y*this.view.options.boxDimension.height;
	if ( 0 == i_h )
	{
		i_h = 1;
	}
	for ( var i=0; i<points.length; i++ )
	{
		node.a($$()).pos(true).x(Math.floor(points[i][0]*r_x-i_w/2)).y(Math.floor(points[i][1]*r_y+i_h/4)).w(i_w).h(i_h).n('item');
	}
}

ac.MapGraphWidget.prototype.showTreeMap = function(forceShow)
{
	this.hideTreeMap();
	if ( 0 == this.renderingNode.$.getElementsByTagName('table').length )
	{
		return;
	}
	var map_options = this.view.options.map;
	var area_node = this.renderingNode.g('table:0');
	var is_frame_visible = area_node.w() > this.renderingNode.w() || area_node.h() > this.renderingNode.h();
	if ( !forceShow && !is_frame_visible && 'auto' == map_options.mode )
	{
		return;
	}
	
	var height = Math.floor(map_options.width*area_node.h()/area_node.w());
	this.nodeMap = this.renderingNode.p().a($$()).n('acw-mapgraph-tree-map').pos(true).x(0).y(0).w(map_options.width).h(height);
	var node = this.nodeMap.a($$()).n('inner').pos(true).x(1).y(1).w(map_options.width-2).h(height-2);
	this.renderTreeMap(node);
	if ( is_frame_visible )
	{
		// rendering draggable frame
		var frame_node = this.nodeMap.a($$()).n('frame').o(0.6).pos(true);
		frame_node.addDrag(fry.ui.drag.MODE_STANDARD, $new(ac.MapGraphWidgetMapFrameDragAdapter, frame_node, this));
		this.synchronizeMapFrame();
		var caller = this;
		var rend_node = this.renderingNode.$;
		node.e('click', function(evt)
		{
			var offset = [evt.getOffsetX(), evt.getOffsetY()];
			if ( 'item' == evt.$.n() )
			{
				var pos = evt.$.abspos();
				offset[0] += pos.x;
				offset[1] += pos.y;
			}
			evt.stop();
			caller.syncRunning = true;
			rend_node.scrollLeft = Math.floor(rend_node.scrollWidth*evt.getOffsetX()/evt.$.w() - rend_node.offsetWidth/2);
			rend_node.scrollTop = Math.floor(rend_node.scrollHeight*evt.getOffsetY()/evt.$.h() - rend_node.offsetHeight/2);
			caller.syncRunning = false;
			caller.synchronizeMapFrame();
		})
	}
}

ac.MapGraphWidget.prototype.synchronizeMapFrame = function()
{
	if ( null == this.nodeMap || null == this.nodeMap.fc() )
	{
		return;
	}
	var map_options = this.view.options.map;
	var area_node = this.renderingNode.g('table:0');
	var height = Math.floor(map_options.width*area_node.h()/area_node.w())-2;
	var frame_x = map_options.width * this.renderingNode.$.scrollLeft/this.renderingNode.$.scrollWidth;
	var frame_y = height * this.renderingNode.$.scrollTop/this.renderingNode.$.scrollHeight;
	var frame_w = 1 + Math.floor(map_options.width * (this.renderingNode.w()-20) / area_node.w());
	if ( frame_w > this.nodeMap.fc().w() )
	{
		frame_w = this.nodeMap.fc().w();
	}
	var frame_h = 1 + Math.floor(height * (this.renderingNode.h()-20) / area_node.h());
	if ( frame_h > this.nodeMap.fc().h() )
	{
		frame_h = this.nodeMap.fc().h();
	}
	this.nodeMap.lc().x(frame_x).y(frame_y).w(frame_w).h(frame_h);
}

ac.MapGraphWidget.prototype.hideTreeMap = function()
{
	if ( null != this.nodeMap && this.nodeMap.is() )
	{
		this.nodeMap.rs();
	}
}

ac.MapGraphWidget.prototype.renderGraphStructure = function()
{
	this.toggleGrid();
	this.renderGraphElements();
	this.renderGraphRelations();
}

ac.MapGraphWidget.prototype.toggleGrid = function(forceShow)
{
	if ( !this.view.options.hasGrid )
	{
		return;
	}
	if ( '' != this.renderingNode.s().backgroundImage && !forceShow )
	{
		this.renderingNode.s('background-image:');
		return;
	}
	var grid = '10x10';
	var unit = this.view.options.graphUnit.x;
	$foreach ( [6, 8, 10, 12, 16], function(d, i, control)
	{
		if ( 0 == unit % d )
		{
			grid = '?x?'.embed(d,d);
			control.stop();
		}		
	});
	this.renderingNode.s('background-image:url(../mm/i/theme/?/mg-grid-?.gif)'.embed(fry.ui.theme.name, grid));
}

ac.MapGraphWidget.prototype.zoomIn = function()
{
	this.zoomTo(this.view.options.graphUnit.x*1.2, this.view.options.graphUnit.y*1.2);
}

ac.MapGraphWidget.prototype.zoomOut = function()
{
	this.zoomTo(this.view.options.graphUnit.x/1.2, this.view.options.graphUnit.y/1.2);
}

ac.MapGraphWidget.prototype.zoomTo = function(unitX, unitY)
{
	this.view.options.graphUnit.x = Math.floor(unitX);
	this.view.options.graphUnit.y = Math.floor(unitY);
	this.renderingNode.rc();
	this.toggleGrid(true);
	this.renderGraphElements();
	this.renderGraphRelations();
}

ac.MapGraphWidget.prototype.renderGraphElements = function()
{
	if ( 0 == this.model.elements.length )
	{
		return;
	}

	var caller = this;
	var x = 1;
	var y = 1;
	var graphUnit = this.view.options.graphUnit;
	
	$foreach ( this.model.elements, function(acElem)
	{
		var coords = {};
		if ( !acElem.widgetProperties || !acElem.widgetProperties.mapgraph )
		{
			coords = caller.controller.getCoords(acElem, x, y);
			if ( null == coords )
			{
				coords = {x:x, y:y};
			}
			acElem.widgetProperties = $getdef(acElem.widgetProperties, {});
			acElem.widgetProperties.mapgraph = {coords:coords};			
		}
		else
		{
			coords = acElem.widgetProperties.mapgraph.coords;
		}
		caller.renderGraphElement(acElem, caller.renderingNode, coords);
		x = coords.x + 2;
		y = coords.y;
		if ( caller.renderingNode.w() < (x+1)*graphUnit.x )
		{
			x = 1;
			y = coords.y + 2;
		}
	});
}

ac.MapGraphWidget.prototype.renderGraphElement = function(acElem, node, coords)
{
	var graphUnit = this.view.options.graphUnit;

	node = node.a($$()).w(graphUnit.x).h(graphUnit.y).pos(true).x(coords.x*graphUnit.x).y(coords.y*graphUnit.y).n('acw-mapgraph-graph-element');
	this.view.renderElement(node, acElem);
	node.addDrag(fry.ui.drag.MODE_STANDARD, {});
}

ac.MapGraphWidget.prototype.renderGraphRelations = function()
{
	if  ( 0 == this.model.relations.length )
	{
		return;
	}
	var caller = this;
	$foreach( this.model.relations, function(relation)
	{
		caller.renderGraphRelation(caller.renderingNode, relation);
	});
}

ac.MapGraphWidget.prototype.renderGraphRelation = function(node, relation)
{
	var graphUnit = this.view.options.graphUnit;

	// preparing containers for nodes and directions (used when animating by path)
	relation.properties.lines = {paths:[], nodes:[]};
	var lines = relation.properties.lines;

	var source_coords = relation.sourceElement.widgetProperties.mapgraph.coords;
	var target_coords = relation.targetElement.widgetProperties.mapgraph.coords;
	// each relation line consists of maximum of 4 lines
	// rendering first one 
	/*	,---,
	  	|   |----
		'---' */
	var x = (source_coords.x + 1) * graphUnit.x + 2;
	var index = relation.sourceElementItemIndex;
	var dh = graphUnit.y / relation.sourceElement.properties.items.length / 2;
	var y = source_coords.y*graphUnit.y + (1 + 2*index)*dh;
	
	var w = (1 + 2*index)*dh;
	var h = 0;
	var node_line = node.a($$()).pos(true).x(x).y(y).w(w).h(1).n('acw-mapgraph-relation-h');
	lines.paths.push([x, y]);
	lines.nodes.push(node_line);
	x += w;
	lines.paths.push([x, y]);
	// now there are 8 possibilites
	if ( source_coords.y > target_coords.y )
	{
		/*
			\ | /
			  O
		*/
		h = source_coords.y - target_coords.y;
		w = source_coords.x - target_coords.x;
		h = ((h-1)*graphUnit.y);
		y -= h;
		node_line = node.a($$()).pos(true).x(x).y(y).w(1).h(h).n('acw-mapgraph-relation-v');
		lines.nodes.push(node_line);
		lines.paths.push([x, y]);
		if ( source_coords.x < target_coords.x )
		{
			w = -w - 1;
		}
		else
		{
			w += 1;
			x -= w*graphUnit.x;
		}
		node_line = node.a($$()).pos(true).x(x).y(y).w(w*graphUnit.x).h(1).n('acw-mapgraph-relation-h');
		lines.nodes.push(node_line);
		h = y - (target_coords.y+1) * graphUnit.y;
		y -= h;
	}
	else if ( source_coords.y == target_coords.y )
	{
		/*
			- O -
		*/
		h = (0.5+0.25*Math.random())*graphUnit.y;
		var is_up = false;
		if ( y < (source_coords.y+0.5)*graphUnit.y )
		{
			// go up
			if ( 0 == source_coords.y )
			{
				h = graphUnit.y;
			}
			else
			{
				y -= h;	
				is_up = true;			
			}
		}
		node_line = node.a($$()).pos(true).x(x).y(y).w(1).h(h).n('acw-mapgraph-relation-v');
		lines.nodes.push(node_line);
		if ( !is_up )
		{
			y += node_line.h();
		}
		w = source_coords.x - target_coords.x;
		lines.paths.push([x, y]);
		if ( source_coords.x < target_coords.x )
		{
			w = -w - 1;
		}
		else
		{
			w += 1;
			x -= w*graphUnit.x;
		}
		node_line = node.a($$()).pos(true).x(x).y(y).w(w*graphUnit.x).h(1).n('acw-mapgraph-relation-h');
		lines.nodes.push(node_line);
		if ( is_up )
		{
			h = target_coords.y*graphUnit.y - y;
		}
		else
		{
			h = y - (target_coords.y+1) * graphUnit.y;
			y -= h
		}
	}
	else
	{
		/*
			O
		  / | \
		*/
		h = target_coords.y - source_coords.y;
		w = source_coords.x - target_coords.x;
		h = ((h-1)*graphUnit.y);
		node_line = node.a($$()).pos(true).x(x).y(y).w(1).h(h).n('acw-mapgraph-relation-v');
		lines.nodes.push(node_line);
		y += h;
		lines.paths.push([x,y]);
		if ( source_coords.x < target_coords.x )
		{
			w = -w - 1;
		}
		else
		{
			w += 1;
			x -= w*graphUnit.x;
		}
		node_line = node.a($$()).pos(true).x(x).y(y).w(w*graphUnit.x).h(1).n('acw-mapgraph-relation-h');
		lines.nodes.push(node_line);
		h = (target_coords.y) * graphUnit.y - y;
	}
	if ( source_coords.x < target_coords.x )
	{
		x += node_line.w();
	}
	y += 1;
	node_line = node.a($$()).pos(true).x(x).y(y).w(1).h(h).n('acw-mapgraph-relation-v');
	lines.nodes.push(node_line);
	// adding arrow
	var is_arrow_up = target_coords.y*graphUnit.y < y;
	node.a($$()).pos(true).x(x-4).y(is_arrow_up?y:(y+h-6)).n('acw-mapgraph-relation-end-?'.embed(is_arrow_up?'up':'down'));
	lines.paths.push([x, is_arrow_up?y+h:y]);
	lines.paths.push([x, is_arrow_up?y:y+h]);
}

ac.MapGraphWidget.prototype.hideGraphRelation = function(relation)
{
	$foreach ( relation.properties.lines.nodes, function(node, i, control)
	{
		node.rs();
		control.remove();
	});
	relation.properties.lines.nodes = null;
	relation.properties.lines.paths = null;
}

ac.MapGraphWidget.prototype.getGraphRelationPathPoints = function(relation, bySteps, byDelta)
{
	// please note, this is some kind hc code.. :)

	// calculation path length
	var path_length = 0;
	$foreach ( relation.properties.lines.nodes, function(node)
	{
		path_length += Math.max(node.h(), node.w());
	});
	if ( $notset(byDelta) )
	{
		// delta (distance between to points) was not specified, it's calculated
		byDelta = path_length / bySteps;
	}
	else
	{
		// number of steps was not specified - calculated
		bySteps = Math.floor(path_length / byDelta);
	}
	var points = [];
	var actual_path_index = 0;
	var paths = relation.properties.lines.paths;
	var point = [paths[0][0], paths[0][1]];

	var getNextPoint = function(offset)
	{
		offset = offset || byDelta;
		if ( !paths[actual_path_index+1] )
		{
			return;
		}
		var next_point = paths[actual_path_index+1];
		var ix = 0;
		if ( 0 == point[0] - next_point[0] )
		{
			// vertical line
			ix = 1;
		}
		var d = point[ix] + (point[ix]<next_point[ix]?1:-1)*offset;
		if ( Math.abs(d-point[ix]) > Math.abs(next_point[ix]-point[ix]) )
		{
			// next path requested
			var offset = Math.abs(d-point[ix]) - Math.abs(next_point[ix]-point[ix]);
			actual_path_index++;
			point = [paths[actual_path_index][0], paths[actual_path_index][1]];
			getNextPoint(offset);
		}
		else
		{
			point[ix] = d;				
			points.push([point[0], point[1]]);
		}
	}

	$dotimes(bySteps, function()
	{
		getNextPoint();
	});	
	return points;
}

ac.MapGraphWidget.prototype.animateGraphRelation = function(relation, numSteps, intervalMsec)
{
	numSteps = numSteps || 20;
	intervalMsec = intervalMsec || 60;
	
	var points = this.getGraphRelationPathPoints(relation, numSteps, 10);
	numSteps = points.length; // just a precaution..
	var a_node = null;
	var parent_node = this.renderingNode;
	$runinterval(1, numSteps, intervalMsec, function(step)
	{
		if ( null != a_node )
		{
			a_node.rs();
		}
		var point = points[step-1];
		a_node = parent_node.a($$()).pos(true).x(Math.floor(point[0])-6).y(Math.floor(point[1])-6).w(13).h(13).t('<img src="mm/i/theme/apple/browser.item.(active).gif"/>');
	});
}

if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}

