/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.TableView widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/*  ---------------------------------------------------------------- 
	ac.TableViewWidgetModel < ac.ListWidgetModel
*/

$class('ac.TableViewWidgetModel < ac.ListWidgetModel');


/*  ---------------------------------------------------------------- 
	ac.TableViewWidgetView < ac.HierarchicalWidgetView
*/
$class('ac.TableViewWidgetView < ac.HierarchicalWidgetView',
{
	construct:function(options)
	{
		if ( 'undefined' == typeof this.options.minColumnWidth )
		{
			this.options.minColumnWidth = 80;
		}
		if ( 'undefined' == typeof this.options.maxColumnWidth )
		{
			this.options.maxColumnWidth = 300;
		}
		if ( 'undefined' == typeof this.options.skipFirstSort )
		{
			this.options.skipFirstSort = false;
		}
		this.firstSort = true;
	}
});

ac.TableViewWidgetView.prototype.renderElementInRow = function(acElem, row_data)
{
}

ac.TableViewWidgetView.prototype.renderDetail = function(acElem, node)
{
}

ac.TableViewWidgetView.prototype.renderLoadingMessage = function(acElem, node, marginLeft)
{
	return null;	
}

ac.TableViewWidgetView.prototype.renderElementSelection = function(acElem, node, mode)
{
	var is_odd = -1 != node.n().indexOf('odd');
	node.n('? ?'.embed(is_odd ? 'odd':'even', mode));
	var is_expanded = null != node.ns() && 'info-detail' == node.ns().n().substr(0,11);
	if ( is_expanded )
	{
		if ( 'active' == mode )
		{
			node.ns().n('? active'.embed(node.ns().n()));			
		}
		else
		{
			node.ns().n(node.ns().n().replace(/active/, ''));
		}
	}
	// changing folder.(active).gif > folder.(midactive).gif etc.
	var img = node.g('td:0/img:0');
	if ( null != img && 'string' == typeof img.ga('src') )
	{
		img.sa('src', img.ga('src').replace(/\([^\)]*\)/, '(?)'.embed(mode)));			
	}	
}

/*  ---------------------------------------------------------------- 
	ac.TableViewWidgetController < ac.WidgetController, ac.IOperationsWidgetController
*/
$class('ac.TableViewWidgetController < ac.WidgetController, ac.IOperationsWidgetController');


ac.TableViewWidgetController.prototype.onElementClick = function(acElem, evt)
{
}

ac.TableViewWidgetController.prototype.onElementDblClick = function(acElem, evt)
{
}


/*  ---------------------------------------------------------------- 
	ac.TableViewDnDAdapter < ac.HierarchicalDnDAdapter
*/

$class('ac.TableViewDnDAdapter < ac.HierarchicalDnDAdapter');

ac.TableViewDnDAdapter.prototype.getElementNode = function(acElem)
{
	var node = this.widget.getElementNode(acElem);
	if ( null != node )
	{
		return node.g('blockquote:0');
	}
	return null;
}

ac.TableViewDnDAdapter.prototype.getHighlightingNode = function(node)
{
	return node.gp('tr');
}

ac.TableViewDnDAdapter.prototype.expandElement = function(acElem)
{
	this.widget.expandElement(acElem);
}


/*  ---------------------------------------------------------------- 
	ac.TableViewHeaderDragAdapter < fry.ui.DragAdapter
*/
$class('ac.TableViewHeaderDragAdapter < fry.ui.DragAdapter',
{
	construct:function(node, widget)
	{
		this.widget = widget;
	}
});

ac.TableViewHeaderDragAdapter.prototype.getColumnIndex = function()
{
	return parseInt(this.node.ga('index'));
}

ac.TableViewHeaderDragAdapter.prototype.listRowNodes = function()
{
	var lst = [this.node.p()];
	$foreach ( this.widget.scrollNode.g('tbody:0').$.childNodes, function(tr)
	{
		if ( 1 != tr.nodeType )
		{
			return;
		}
		tr = $(tr);
		if ( -1 == tr.n().indexOf('info-detail') )
		{
			lst.push(tr);
		}
	});
	// must include hidden rows from repository
	if ( null != this.widget.repositoryNode )
	{
		$foreach ( this.widget.repositoryNode.$.childNodes, function(tr)
		{
			if ( 1 != tr.nodeType )
			{
				return;
			}
			tr = $(tr);
			if ( -1 == tr.n().indexOf('info-detail') )
			{
				lst.push(tr);			
			}
		});		
	}
	return lst;
}

ac.TableViewHeaderDragAdapter.prototype.applyColumnProperties = function(callback)
{
	var index = this.getColumnIndex();
	$foreach ( this.listRowNodes(), function(tr)
	{
		callback($(tr.$.childNodes.item(index)));			
	})
}

ac.TableViewHeaderDragAdapter.prototype.swapColumns = function(index_1, index_2)
{
	var lst = this.listRowNodes();
	if ( lst[0].$.childNodes.item(index_1) && lst[0].$.childNodes.item(index_2) )
	{
		lst[0].$.childNodes.item(index_1).setAttribute('index', index_2);
		lst[0].$.childNodes.item(index_2).setAttribute('index', index_1);
		if ( index_1 > index_2 )
		{
			var tmp = index_1;
			index_1 = index_2;
			index_2 = tmp;
		}
		for ( var i=0; i<lst.length; i++ )
		{
			var tr = lst[i];
			tr.ib($(tr.$.childNodes.item(index_2)), $(tr.$.childNodes.item(index_1)));
		}
	}
	with ( this.widget.properties )
	{
		var old_sort_index = sorting.colIndex;
		if ( sorting.colIndex == index_1 )
		{
			sorting.colIndex = index_2;
		}
		else if ( sorting.colIndex == index_2 )
		{
			sorting.colIndex = index_1;
		}
		var col = columns[index_1];
		columns[index_1] = columns[index_2];
		columns[index_2] = col;
	}
	lst = null;
}

ac.TableViewHeaderDragAdapter.prototype.onDragStart = function()
{
	var p = this.node.p();
	this.column_count = p.$.childNodes.length - 1;
	this.table_width = p.gp('*:2').w()-$__tune.ui.scrollbarWidth;
	var pos = p.gp('*:2').abspos();
	this.table_offsetX = pos.x;
	this.column_width = this.node.w();
	this.cursorNode = null;
}

ac.TableViewHeaderDragAdapter.prototype.onDragStop = function()
{
	this.node.o(1.0).v(true);
	this.applyColumnProperties(function(node)
	{
		if ( node )
		{
			node.n(node.ga('prev_class'));			
		}
	});
	this.widget.renderHeaderResizeBars();
}

ac.TableViewHeaderDragAdapter.prototype.onDragMove = function( dragNode, nx, ny, ox, oy )
{
	var x = nx - this.table_offsetX;
	if ( 0 > x )
	{
		return {x:this.table_offsetX, ny:ny};
	}
	if ( x > this.table_width - this.column_width - 2 )
	{
		return {x:this.table_offsetX + this.table_width - this.column_width - 2, y:ny};
	}
	var index = this.getColumnIndex();
	if ( 0 < x - this.node.$.offsetLeft )
	{
		// moving to right
		if ( this.column_count > index + 1 )
		{
			// not the last column
			var next_col = this.node.p().g('td:?'.embed(index+1));
			var mid_w = Math.floor(next_col.w()/2);
			if ( x - this.node.$.offsetLeft > mid_w )
			{
				this.swapColumns(index, index+1);
			}
		}
	}
	else
	{
		// moving to left
		if ( (!this.widget.properties.recursiveRendering && 0 < index) || 1 < index )
		{
			// cannot swap first column at index 0 or second column in case of recursive rendering (outlineview)
			var prev_col = this.node.p().g('td:?'.embed(index-1));
			var mid_w = Math.floor(prev_col.w()/2);
			if ( this.node.$.offsetLeft - x > mid_w )
			{
				this.swapColumns(index, index-1);
			}
			
		}
	}
	return {x:nx, y:ny};
};

ac.TableViewHeaderDragAdapter.prototype.onGetCursorNode = function()
{
	var scroll_node = this.widget.scrollNode;
	var default_td_height = fry.ui.theme.conf.table.rowHeight;
	var min_y = scroll_node.$.scrollTop;
	var max_y = min_y + scroll_node.$.offsetHeight-$__tune.ui.scrollbarWidth+default_td_height;
	var index = this.getColumnIndex();
	
	var node = $$().n(scroll_node.p().n());
	var tbody_header = node.a($$('table')).sa('cellSpacing',0).sa('cellPadding',0).a($$('tbody'));
	var tbody = node.a($$('table')).sa('cellSpacing',0).sa('cellPadding',0).a($$('tbody'));
	
	var is_offset = false;
	var offset_y = 0;
	tbody_header.a($$('tr')).n('header').a(this.node.dup());

	$foreach ( this.widget.scrollNode.g('tbody:0').$.childNodes, function(tr)
	{
		if ( 1 != tr.nodeType )
		{
			return;
		}
		tr = $(tr);
		var is_detail = -1 != tr.n().indexOf('info-detail');
		var td = is_detail ? tr.fc() : tr.g('td:'+index);
		if ( min_y-default_td_height < td.$.offsetTop && max_y >= td.$.offsetTop )
		{
			if ( is_detail )
			{
				tbody.a($$('tr')).n(td.n()).a($$('td').h(td.h()+($__tune.isGecko?0:2)));				
			}
			else
			{
				if ( !is_offset )
				{
					offset_y = td.$.offsetTop-min_y-($__tune.isSafari?1:0);
					is_offset = true;
				}
				var new_td = tbody.a($$('tr')).n(0==i%2?'odd':'even').a(td.dup());
				new_td.h($__tune.isSafari?default_td_height:td.$.offsetHeight);
			}
		}
	});

	if ( is_offset )
	{
		tbody.p().pos(true).y(scroll_node.$.offsetTop+offset_y).x(0).s('clip:rect(?px ?px ?px 0)'.embed(-offset_y, tbody_header.fc().fc().w(), max_y-min_y+offset_y));
	}
	this.applyColumnProperties(function(node)
	{
		node.sa('prev_class', node.n());
		node.n('invisible');
	});
	node.o(0.7).s('border-right:1px solid #ddd;border-left:1px solid #ddd').h(scroll_node.h()).fc().g('td:0').s('border-left-color:transparent');
	if ( $__tune.isGecko )
	{
		node.s('border-top:0px solid transparent');
		tbody_header.p().y(-1).pos(false);
	}
	return node;
};

/*  ---------------------------------------------------------------- 
	ac.TableViewHeaderResizeDragAdapter < fry.ui.DragAdapter
*/
$class('ac.TableViewHeaderResizeDragAdapter < fry.ui.DragAdapter',
{
	construct:function(node, widget, col1, col2)
	{
		this.widget = widget;
		this.col1 = col1;
		this.col2 = col2;
		this.origOffset = 0;
	}
});

ac.TableViewHeaderResizeDragAdapter.prototype.listRowNodes = function()
{
	var lst = [this.widget.renderingNode.g('tbody:0/tr:0')];
	$foreach ( this.widget.scrollNode.g('tbody:0').$.childNodes, function(tr)
	{
		if ( 1 != tr.nodeType )
		{
			return;
		}
		tr = $(tr);
		if ( -1 == tr.n().indexOf('info-detail') )
		{
			lst.push(tr);
		}
	});
	// must include hidden rows from repository
	if ( null != this.widget.repositoryNode )
	{
		$foreach ( this.widget.repositoryNode.$.childNodes, function(tr)
		{
			if ( 1 != tr.nodeType )
			{
				return;
			}
			tr = $(tr);
			if ( -1 == tr.n().indexOf('info-detail') )
			{
				lst.push(tr);			
			}
		});		
	}
	return lst;	
}

ac.TableViewHeaderResizeDragAdapter.prototype.onDragStart = function()
{
	this.origOffset = this.node.x();
	var col1 = this.col1;
	var col2 = this.col2;
	$foreach ( this.listRowNodes(), function(tr, i)
	{
		var td1 = $(tr.$.childNodes.item(col1));
		td1.sa('r-width', td1.w());
		var td2 = $(tr.$.childNodes.item(col2));
		td2.sa('r-width', td2.w());
		if ( 0 == i )
		{
			td1.fc().sa('r-width', td1.fc().w());
			td2.fc().sa('r-width', td2.fc().w());
		}
	});
	
}

ac.TableViewHeaderResizeDragAdapter.prototype.onDragStop = function()
{
	this.widget.renderHeaderResizeBars();
}

ac.TableViewHeaderResizeDragAdapter.prototype.onDragMove = function( dragNode, nx, ny, ox, oy )
{
	var dx = nx - this.origOffset;
	var col1 = this.col1;
	var col2 = this.col2;
	var min_col_width = this.widget.view.options.minColumnWidth;
	$foreach ( this.listRowNodes(), function(tr, i, control)
	{
		var td1 = $(tr.$.childNodes.item(col1));
		var w1 = parseInt(td1.ga('r-width'))+dx;
		var td2 = $(tr.$.childNodes.item(col2));
		var w2 = parseInt(td2.ga('r-width'))-dx;
		if ( 0 == i)
		{
			// constraints
			if ( w1 < min_col_width || w2 < min_col_width )
			{
				control.stop();
				return;
			}
			td1.fc().w(parseInt(td1.fc().ga('r-width'))+dx);
			td2.fc().w(parseInt(td2.fc().ga('r-width'))-dx);
		}
		td1.w(w1);
		td2.w(w2);
	});
}
/*

ac.TableViewHeaderDragAdapter.prototype.applyColumnProperties = function(callback)
{
	var index = this.getColumnIndex();
	$foreach ( this.listRowNodes(), function(tr)
	{
		callback($(tr.$.childNodes.item(index)));			
	})
}

ac.TableViewHeaderDragAdapter.prototype.swapColumns = function(index_1, index_2)
{
	var lst = this.listRowNodes();
	if ( lst[0].$.childNodes.item(index_1) && lst[0].$.childNodes.item(index_2) )
	{
		lst[0].$.childNodes.item(index_1).setAttribute('index', index_2);
		lst[0].$.childNodes.item(index_2).setAttribute('index', index_1);
		if ( index_1 > index_2 )
		{
			var tmp = index_1;
			index_1 = index_2;
			index_2 = tmp;
		}
		for ( var i=0; i<lst.length; i++ )
		{
			var tr = lst[i];
			tr.ib($(tr.$.childNodes.item(index_2)), $(tr.$.childNodes.item(index_1)));
		}
	}
	with ( this.widget.properties )
	{
		var old_sort_index = sorting.colIndex;
		if ( sorting.colIndex == index_1 )
		{
			sorting.colIndex = index_2;
		}
		else if ( sorting.colIndex == index_2 )
		{
			sorting.colIndex = index_1;
		}
		var col = columns[index_1];
		columns[index_1] = columns[index_2];
		columns[index_2] = col;
	}
	lst = null;
}

ac.TableViewHeaderDragAdapter.prototype.onDragStart = function()
{
	var p = this.node.p();
	this.column_count = p.$.childNodes.length - 1;
	this.table_width = p.gp('*:2').w()-$__tune.ui.scrollbarWidth;
	var pos = p.gp('*:2').abspos();
	this.table_offsetX = pos.x;
	this.column_width = this.node.w();
	this.cursorNode = null;
}

ac.TableViewHeaderDragAdapter.prototype.onDragStop = function()
{
	this.node.o(1.0).v(true);
	this.applyColumnProperties(function(node)
	{
		if ( node )
		{
			node.n(node.ga('prev_class'));			
		}
	});
}

ac.TableViewHeaderDragAdapter.prototype.onDragMove = function( dragNode, nx, ny, ox, oy )
{
	var x = nx - this.table_offsetX;
	if ( 0 > x )
	{
		return {x:this.table_offsetX, ny:ny};
	}
	if ( x > this.table_width - this.column_width - 2 )
	{
		return {x:this.table_offsetX + this.table_width - this.column_width - 2, y:ny};
	}
	var index = this.getColumnIndex();
	if ( 0 < x - this.node.$.offsetLeft )
	{
		// moving to right
		if ( this.column_count > index + 1 )
		{
			// not the last column
			var next_col = this.node.p().g('td:?'.embed(index+1));
			var mid_w = Math.floor(next_col.w()/2);
			if ( x - this.node.$.offsetLeft > mid_w )
			{
				this.swapColumns(index, index+1);
			}
		}
	}
	else
	{
		// moving to left
		if ( (!this.widget.properties.recursiveRendering && 0 < index) || 1 < index )
		{
			// cannot swap first column at index 0 or second column in case of recursive rendering (outlineview)
			var prev_col = this.node.p().g('td:?'.embed(index-1));
			var mid_w = Math.floor(prev_col.w()/2);
			if ( this.node.$.offsetLeft - x > mid_w )
			{
				this.swapColumns(index, index-1);
			}
			
		}
	}
	return {x:nx, y:ny};
};

ac.TableViewHeaderDragAdapter.prototype.onGetCursorNode = function()
{
	var scroll_node = this.widget.renderingNode.lc();
	var default_td_height = fry.ui.theme.conf.table.rowHeight;
	var min_y = scroll_node.$.scrollTop;
	var max_y = min_y + scroll_node.$.offsetHeight-$__tune.ui.scrollbarWidth+default_td_height;
	var index = this.getColumnIndex();
	
	var node = $$().n(scroll_node.p().n());
	var tbody_header = node.a($$('table')).sa('cellSpacing',0).sa('cellPadding',0).a($$('tbody'));
	var tbody = node.a($$('table')).sa('cellSpacing',0).sa('cellPadding',0).a($$('tbody'));
	
	var is_offset = false;
	var offset_y = 0;
	tbody_header.a($$('tr')).n('header').a(this.node.dup());

	$foreach ( this.node.gp('tbody').p().ns().g('tbody:0').$.childNodes, function(tr)
	{
		if ( 1 != tr.nodeType )
		{
			return;
		}
		tr = $(tr);
		var is_detail = -1 != tr.n().indexOf('info-detail');
		var td = is_detail ? tr.fc() : tr.g('td:'+index);
		if ( min_y-default_td_height < td.$.offsetTop && max_y >= td.$.offsetTop )
		{
			if ( is_detail )
			{
				tbody.a($$('tr')).n(td.n()).a($$('td').h(td.h()+($__tune.isGecko?0:2)));				
			}
			else
			{
				if ( !is_offset )
				{
					offset_y = td.$.offsetTop-min_y-($__tune.isSafari?1:0);
					is_offset = true;
				}
				var new_td = tbody.a($$('tr')).n(0==i%2?'odd':'even').a(td.dup());
				new_td.h($__tune.isSafari?default_td_height:td.$.offsetHeight);
			}
		}
	});

	if ( is_offset )
	{
		tbody.p().pos(true).y(this.widget.renderingNode.lc().$.offsetTop+offset_y).x(0).s('clip:rect(?px ?px ?px 0)'.embed(-offset_y, tbody_header.fc().fc().w(), max_y-min_y+offset_y));
	}
	this.applyColumnProperties(function(node)
	{
		node.sa('prev_class', node.n());
		node.n('invisible');
	});
	node.o(0.7).s('border-right:1px solid #ddd;border-left:1px solid #ddd').h(this.widget.renderingNode.lc().h()).fc().g('td:0').s('border-left-color:transparent');
	if ( $__tune.isGecko )
	{
		node.s('border-top:0px solid transparent');
		tbody_header.p().y(-1).pos(false);
	}
	return node;
};
*/


/*  ---------------------------------------------------------------- 
	ac.TableViewWidget < ac.ListWidget
*/
$class('ac.TableViewWidget < ac.ListWidget',
{
	construct:function()
	{
	    this.properties.renderedElement = null;
		this.properties.columns = [];
    	this.properties.sorting = {};
		this.properties.sorting.colIndex = 0;
		this.properties.sorting.order = 0; /* 0-ascending, 1-descending */
		this.properties.currentlyRendered = [];
		this.properties.actualListContainer = null;
		this.properties.recursiveRendering = false;
		this.valueEditor = null;
	}
});

ac.TableViewWidget.prototype.isSelectionCollapsedAfterDehighlighting = function()
{
	return false;
}

ac.TableViewWidget.prototype.addColumn = function(id, name, width, sortCallback, isInfoColumn, isEditable)
{
	with ( this.properties )
	{
		for ( var i in columns )
		{
			var column = columns[i];
			if ( column.id == id )
			{
				return -1;
			}
		}
		var n = columns.length;
		columns[n] = {id:id, name:name, width:width, sortCallback:sortCallback, isInfoColumn:true==isInfoColumn, isEditable:true==isEditable};
	}
	return n;
}

ac.TableViewWidget.prototype.postValueEditing = function()
{
	var row_data = {};
	this.view.renderElementInRow(this.valueEditor.acElem, row_data);
	this.valueEditor.node.t(row_data[this.valueEditor.colId]);	
}

ac.TableViewWidget.prototype.setSortingBy = function(colId, order)
{
	with ( this.properties )
	{
		if ( 'undefined' == typeof order )
		{
			// set default ascending order
			order = 0;
		}
		for ( var i in columns )
		{
			var column = columns[i];
			if ( column.id == colId )
			{
				sorting.colIndex = i;
				sorting.order = order;
				return true;
			}
		}
	}
	return false;
}

ac.TableViewWidget.prototype.redrawRows = function()
{
	var caller = this;
	var parent = this.scrollNode.g('tr:0').p();
	var placeholder = parent.ib($$('tr'), this.scrollNode.g('tr:0'));
	var rearrangeRows = function(element)
	{
		for ( var i=0; i<element.elements.length; i++ )
		{
			var child_elem = element.elements[i];
			var node = caller.getElementNode(child_elem);
			if ( null == node || !node.is() )
			{
				// not displayed, skip it
				continue;
			}
			if ( 'true' == node.p().ga('repository') )
			{
				// in repository, skip it
				continue;
			}
			var has_expanded_detail = null != node.ns() && 'info-detail' == node.ns().n().substr(0,11);
			if ( has_expanded_detail )
			{
				var d_node = parent.ib(node.ns(), placeholder);
				parent.ib(node, d_node);
			}
			else
			{
				parent.ib(node, placeholder);				
			}
			if ( caller.properties.recursiveRendering && child_elem.hasChildren() )
			{
				// may have children expanded
				if ( child_elem.isCollection && child_elem.hasState(child_elem.STATE_EXPANDED) )
				{
					rearrangeRows(child_elem);					
				}
			}
		}
	}
	try
	{
		rearrangeRows(this.properties.actualListContainer);
		this.setElementChildSum(this.properties.actualListContainer);
	}
	catch(e)
	{
	}
	placeholder.rs();
	delete placeholder;

	this.colorizeRows();	
}

ac.TableViewWidget.prototype.sortRows = function()
{
	// perform actual sorting - using "live" sorting of already rendered rows, not the re-render mechanism
	if ( !this.properties.actualListContainer.hasChildren() )
	{
		// nothing to be sorted
		return;		
	}
	// let's sort
	var sorting = this.properties.sorting;
	var columns = this.properties.columns;
	
	this.properties.actualListContainer.sort(function(element)
	{
		return columns[sorting.colIndex].sortCallback(element);
	}, sorting.order);

	// rearrange rows according newly set sort properties
	this.redrawRows();
	
}

ac.TableViewWidget.prototype.onKeyPress = function(evt)
{
	evt.stop();
	$__tune.behavior.clearSelection();
	var caller = this;
	switch ( evt.key )
	{
		case 65: // A - SELECT ALL
		{
			if ( evt.isAnyControlKeyPressed() )
			{
			}
		};break;
		case 68: // D - DUPLICATE
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
		};break;
		case evt.KEY_ARR_UP: {} case evt.KEY_ARR_DOWN:
		{
			var selection = this.getSelection();
			var acElem = null;
			if ( 0 == selection.length )
			{
				// no previous selection
				acElem = this.properties.actualListContainer;
				if ( acElem.elements[0] )
				{
					var elem = acElem.elements[0];
					var i = 0;
					while ( null != elem && !this.controller.onElementFilter(elem) )
					{
						if ( 'function' == typeof elem.nextSibling )
						{
							elem = elem.nextSibling();
						}
						else
						{
							elem = acElem.elements[++i];
						}
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
				acElem = this.getLastSelection();
				if ( null == acElem )
				{
					// there's no active selection
					return;
				}
				var tr_node = this.getElementNode(acElem);
				if ( null == tr_node )
				{
					return;
				}
				var sib_node = is_up ? tr_node.ps() : tr_node.ns();
				if ( null == sib_node )
				{
					return;
				}
				if ( -1 != sib_node.n().indexOf('info-detail') )
				{
					sib_node = is_up ? sib_node.ps() : sib_node.ns();
				}
				if ( null == sib_node )
				{
					return;
				}
				var elem_id = sib_node.i().substr(this.genUniqIdent('ec-?-?','').length);
				var sib_elem = this.model.getElementById(elem_id);
				if ( null != sib_elem )
				{
					this.changeSelection(sib_elem, !evt.shiftKey);
					this.scrollIntoView(sib_elem);
				}
			}
		};break;
		case evt.KEY_ARR_RIGHT:
		{
			acElem = this.getLastSelection();
			if ( null == acElem )
			{
				// there's no active selection
				return;
			}
			this.expandElement(acElem);
		};break;
		case evt.KEY_ARR_LEFT:
		{
			acElem = this.getLastSelection();
			if ( null == acElem )
			{
				// there's no active selection
				return;
			}
			this.collapseElement(acElem);
		};break;
	}
}

ac.TableViewWidget.prototype.setListContainer = function(acElem)
{
	this.properties.actualListContainer = acElem;
}

ac.TableViewWidget.prototype.onFocus = function()
{
	this.renderingNode.g('table:0/td:?'.embed(this.properties.sorting.colIndex)).n('selected');
	$call(this, 'ac.IOperationsWidget.onFocus');
}

ac.TableViewWidget.prototype.onBlur = function()
{
	if (this.renderingNode && this.renderingNode.is())
	{
		this.renderingNode.g('table:0/td:?'.embed(this.properties.sorting.colIndex)).n('');
	}
	$call(this, 'ac.IOperationsWidget.onBlur');
}

// overriden in outlineview or any similar widget
ac.TableViewWidget.prototype.expandElement = function(acElem)
{
}

// overriden in outlineview or any similar widget
ac.TableViewWidget.prototype.collapseElement = function(acElem)
{
}

ac.TableViewWidget.prototype.scrollIntoView = function(acElem)
{
	var node = this.getElementNode(acElem);
	if ( null == node )
	{
		return;
	}
	var area_pos = this.scrollNode.abspos();
	var node_pos = node.fc().abspos();
	var offset_h = node_pos.y - area_pos.y;
	this.scrollNode.$.scrollTop = offset_h - Math.floor(this.scrollNode.h()/2);
}

ac.TableViewWidget.prototype.showFrom = function(acElem)
{
	var containerElem = acElem.isCollection ? acElem : acElem.parentElement;
	if (!containerElem)
	{
		return;
	}
	if ( containerElem == this.properties.actualListContainer && this.getElementChildrenSum(containerElem) == containerElem.getChildrenStamp() )
	{
		// already rendered
		var selection = this.getSelection();
		if ( selection[0] == acElem )
		{
			// no change of selection needed
			return;
		}
	}
	else
	{
		this.setListContainer(containerElem);
		// remove existing rows
		this.scrollNode.fc().fc().rc();
		this.repositoryNode.rc();
		this.properties.currentlyRendered = [];
		this.renderRows();		
	}
	this.changeSelection(acElem, true);
	this.controller.onAfterShowFrom(acElem);
}

ac.TableViewWidget.prototype.moveTo = function(x, y, isOffset)
{
	isOffset = $getdef(isOffset, false);
	x = $getdef(x, isOffset ? 0 : this.containerNode.x());
	var offset_x = isOffset ? x : this.containerNode.x() - x;
	y = $getdef(y, isOffset ? 0 : this.containerNode.y());
	var offset_y = isOffset ? y : this.containerNode.y() - y;
	this.containerNode.x(this.containerNode.x()+offset_x).y(this.containerNode.y()+offset_y);
}

ac.TableViewWidget.prototype.resizeTo = function(width, height, isOffset)
{
	isOffset = $getdef(isOffset, false);
	width = $getdef(width, isOffset ? 0 : this.renderingNode.w());
	var offset_w = isOffset ? width : this.renderingNode.w() - width;
	height = $getdef(height, isOffset ? 0 : this.renderingNode.height);
	var offset_h = isOffset ? height : this.renderingNode.h() - height;
	
	this.containerNode.w(this.containerNode.w()+offset_w).h(this.containerNode.h()+offset_h);
	width = this.containerNode.w();
	height = this.containerNode.h();
	
	this.renderingNode.w(width).h(height+$__tune.ui.scrollbarWidth);
//	this.renderingNode.s('clip:rect(0 ?px ?px 0)'.embed(width, height));
	var header = this.renderingNode.g('table:0');
	header.w(header.w()+offset_w);
	this.scrollNode.w(this.scrollNode.w()+offset_w).h(this.scrollNode.h()+offset_h);
}

ac.TableViewWidget.prototype.render = function()
{
	var caller = this;
	this.containerNode.s('overflow:hidden');
	this.renderingNode = this.containerNode.a($$()).n('acw-tableview ?'.embed(this.cssClassName)).w(this.containerNode.w()).h(this.containerNode.h()+$__tune.ui.scrollbarWidth);
	this.renderingNode.pos(true).s('clip:rect(0 ?px ?px 0)'.embed(this.containerNode.w(), this.containerNode.h()));
	this.renderHeader();
	
	if ( null == this.properties.actualListContainer )
	{
		var listContainer = $new(ACElement);
		/*
		listContainer.setState = function(state)
		{
			caller.model.items = listContainer.elements;
			listContainer.state = state;
		}
		listContainer.hasState = function(state)
		{
			if ( state == listContainer.STATE_WILL_LOAD )
			{
				return caller.model.isLoaded;
			}
			return true;
		};
		*/
		listContainer.setState(listContainer.STATE_WILL_LOAD);
		listContainer.elements = this.model.items;
		this.properties.actualListContainer = listContainer;		
	}

	this.renderRows();
}

ac.TableViewWidget.prototype.renderHeader = function(renderingNode)
{
	var caller = this;
	renderingNode = renderingNode || this.renderingNode;
	var num_columns = this.properties.columns.length;

	if ( 0 == num_columns )
	{
		throw new FryException(500, 'widget/tableview: No columns specified.');
	}
	// calculating real column widths
	var total_width = renderingNode.w() - $__tune.ui.scrollbarWidth;
	var left_width = total_width;
	var col_real_widths = [];
	

	$foreach ( this.properties.columns, function(column, i)
	{
		var width = column.width;
		col_real_widths[i] = parseInt(width);
		if ( -1 != (''+width).indexOf('%') )
		{
			// percentual value
			col_real_widths[i] = Math.floor( total_width*parseInt(column.width.replace(/\%/g, ''))/100 );
		}
		left_width -= col_real_widths[i];
	});
	var left_width_offset = parseInt(Math.floor(left_width/num_columns));
	left_width = total_width;
	for ( var i=0; i<num_columns; i++ )
	{
		col_real_widths[i] += left_width_offset;
		left_width -= col_real_widths[i];
	}
	// what's left is added to first column
	col_real_widths[0] += left_width;
	
	var sorting = this.properties.sorting;
	
	// rendering header columns
	var tr = renderingNode.a($$('table')).sa('cellSpacing',0).sa('cellPadding',0).w(total_width+$__tune.ui.scrollbarWidth).a($$('tbody')).a($$('tr')).n('header');
	$foreach ( col_real_widths, function(width, i)
	{
		var is_selected = i==sorting.colIndex && ac.widget.isFocused(caller);
		var td = tr.a($$('td')).sa('index', i).w(width).t('<div class="label">?</div><div class="sort-?"></div>'.embed(caller.properties.columns[i].name), is_selected?(0==sorting.order?'asc':'desc'):'').n(is_selected?'selected':'');
		td.fc().w(width-30);
		if ( caller.properties.columns[i].isInfoColumn)
		{
			// info column is not sortable, therefore no need for capturing click event
			return;
		}
		if ( 0 < i || !caller.properties.recursiveRendering )
		{
			// supporting column swap drags
			td.addDrag(fry.ui.drag.MODE_HORIZONTAL, $new(ac.TableViewHeaderDragAdapter, td, caller));
		}
		// adding click listener
		td.e('click', function(evt)
		{
			$__tune.behavior.clearSelection();
			var header_tds = td.p().$.childNodes;
			if ( sorting.colIndex == td.ga('index') )
			{
				sorting.order = ( sorting.order + 1 ) & 1;
			}
			else
			{
				sorting.colIndex = td.ga('index');
				for ( var ii=0; ii<header_tds.length-1; ii++ )
				{
					$(header_tds.item(ii)).n('').lc().n('');
				}
				sorting.order = 0;
			}
			td.n('selected').lc().n('sort-?'.embed(0==sorting.order?'asc':'desc'));

			caller.sortRows();
		
		});
	});
	// rendering inactive top-right corner
	var td = tr.a($$('td')).w($__tune.ui.scrollbarWidth).t('&nbsp;').n('corner');
	// setting active sorting column header
	var td = $(tr.$.childNodes.item(sorting.colIndex));
	td.lc().n('sort-?'.embed(0==sorting.order?'asc':'desc'));
	
	// rendering header columns resize drags
	this.renderHeaderResizeBars();

	// rendering body scroll node
	this.scrollNode = renderingNode.a($$()).w(renderingNode.w()).h(renderingNode.h()-td.gp('*:3').h()-$__tune.ui.scrollbarWidth).s('overflow:auto');
	
	if ( $__tune.isSafari || $__tune.isGecko )
	{
		// Opera does not support event inside position:relative
		this.scrollNode.pos(false);
	}
	this.scrollNode.a($$('table')).sa('cellPadding', 0).sa('cellSpacing', 0).w(total_width).a($$('tbody'));

	// creating row repository
	this.repositoryNode = this.containerNode.a($$('table')).v(false).pos(true).x(-2*renderingNode.w()).a($$('tbody')).sa('repository', 'true');
	
	this.col_real_widths = col_real_widths;
}

ac.TableViewWidget.prototype.renderHeaderResizeBars = function()
{
	var caller = this;
	var tr = this.renderingNode.g('tr:0');
	var pos_widget = this.renderingNode.abspos();
	if ( this.properties.resizeBars )
	{
		$foreach ( this.properties.resizeBars, function(bar)
		{
			bar.rs();
		});
	}
	this.properties.resizeBars = [];
	$foreach ( tr.g('td'), function(td, i)
	{
		if ( caller.properties.columns.length -1 < i )
		{
			return;
		}
		var pos = td.abspos();
		if ( 0 < i )
		{
			// rendering left resize
			var node_resize = caller.renderingNode.a($$()).pos(true).x(pos.x-pos_widget.x).y(pos.y-pos_widget.y).w(4).h(td.h()).s('cursor:?'.embed($__tune.isSafari?'w-resize':'ew-resize'));
			node_resize.addDrag(fry.ui.drag.MODE_HORIZONTAL, $new(ac.TableViewHeaderResizeDragAdapter, node_resize, caller, i-1, i));
			caller.properties.resizeBars.push(node_resize);
		}
		if ( caller.properties.columns.length -1 > i )
		{
			// rendering right resize
			var node_resize = caller.renderingNode.a($$()).pos(true).x(pos.x-pos_widget.x+td.w()-4).y(pos.y-pos_widget.y).w(4).h(td.h()).s('cursor:?'.embed($__tune.isSafari?'e-resize':'ew-resize'));
			node_resize.addDrag(fry.ui.drag.MODE_HORIZONTAL, $new(ac.TableViewHeaderResizeDragAdapter, node_resize, caller, i, i+1));
			caller.properties.resizeBars.push(node_resize);
		}
	})	
}

ac.TableViewWidget.prototype.renderRows = function(listContainer, afterRowNode, fromElementIndex, toElementIndex)
{
	if ( 'undefined' == typeof listContainer || null == listContainer )
	{
		listContainer = this.properties.actualListContainer;
	}
	// check for concurrent load - synchronization
	with ( this.properties )
	{
		for ( var i in currentlyRendered )
		{
			if ( currentlyRendered[i] == listContainer )
			{
				return;
			}
		}
		currentlyRendered.push(listContainer);
	}
	
	var level = this.getElementLevel(listContainer) - this.getElementLevel(this.properties.actualListContainer);
	var table = this.scrollNode.fc();
	// creating new row node using header row duplicate
	// the node serves as a placeholder for appending new nodes and is removed after rendering child elements
	var tr = this.renderingNode.g('tr:0').dup().n('');
	if ( 'corner' == tr.lc().n() )
	{
		tr.lc().rs();
	}
	$foreach ( tr.$.childNodes, function(node)
	{
		// removing possible look&feel from header duplicate
		$(node).t('').s('background-image:none');
	});
	var tbody = table.fc();
	if ( afterRowNode && null != afterRowNode.ns() )
	{
		tr = tbody.ib(tr, afterRowNode.ns());
	}
	else
	{
		tr = tbody.a(tr);
	}
	var tr_template = tr.dup();
	delete tr;
	var caller = this;
	var render = function()
	{
		// children available, let's render
		if ( 0 == listContainer.elements.length )
		{
			tr.rs();
			// nothing to render
			return;
		}
		var check_maximum = 'undefined' == typeof fromElementIndex;
		if ( check_maximum )
		{
			fromElementIndex = 0;
		}
		if ( 'undefined' == typeof toElementIndex )
		{
			toElementIndex = listContainer.elements.length;
		}
		if ( toElementIndex > listContainer.elements.length )
		{
			toElementIndex = listContainer.elements.length;			
		}
		//console.log('Rendering rows [%s..%s]', fromElementIndex, toElementIndex);
		// sorting elements hierarchy first
		var sorting = caller.properties.sorting;
		var columns = caller.properties.columns;
		
		if ( check_maximum )
		{
			if (!caller.view.firstSort || (caller.view.firstSort && !caller.view.options.skipFirstSort))
			{
				listContainer.sort(function(element)
				{
					return columns[sorting.colIndex].sortCallback(element);
				}, sorting.order);
				caller.view.firstSort = true;				
			}
		}
		

		// rendering sorted row elements
		var max_height = Math.floor(2*caller.renderingNode.h()/3);
		var actual_height = 0;
		for ( var i=fromElementIndex; i<toElementIndex; i++ )
		{
			var child_elem = listContainer.elements[i];
			if ( !caller.controller.onElementFilter(child_elem) )
			{
				continue;
			}
			// acquiring row data
			var row_data = {};
			caller.view.renderElementInRow(child_elem, row_data);
			var render_children = false;
			// getting columns template from header while concurrently creating new TR
			var tr_child = tr_template.dup();
			var tds = tr_child.$.childNodes;
			for ( var ii=0; ii<tds.length; ii++ )
			{
				var td = $(tds[ii]);
				td.a($$()).n('tableview-inner');//.s('width:100%');
				var col_data = row_data[columns[ii].id];
				var ht = '';
				if ( 0 == ii )
				{
					// first column, has special rendering mode
					render_children = caller.renderFirstColumn(child_elem, col_data, level, tr_child, td.fc());
				}
				else
				{
					if ( columns[ii].isInfoColumn )
					{
						// rendering info column
						td.n('info').e('click', function(evt)
						{
							$__tune.behavior.clearSelection();
							evt.stop();
							var bq = evt.$;
							if ( 'b' != evt.$.$.tagName.toLowerCase().substr(0,1) )
							{
								bq = evt.$.g('blockquote:0');
							}
							var is_expanded = 'expanded' == bq.n();
							var parent_tr = evt.$.gp('tr');
							var sel_elem = caller.properties.actualListContainer.getElementById(parent_tr.ga('tvw-id'));
							if ( is_expanded )
							{
								// will collapse
								bq.n('');
								parent_tr.ns().rs();
							}
							else
							{
								// will expand
								bq.n('expanded');
								var is_active = 'active' == parent_tr.ga('himode');
								var c_td = parent_tr.p().ia($$('tr').n('info-detail?'.embed(is_active?' active':'')), parent_tr).a($$('td')).sa('colSpan', tds.length);
								c_td.s('padding-left:?px'.embed(40*caller.getElementLevel(sel_elem)));
								caller.view.renderDetail(sel_elem, c_td);
							}
						}).fc().a($$('blockquote')).t('&nbsp;');
					}
					else
					{
						// rendering standard column
						td.fc().a($$('blockquote')).t(col_data||'--');						
					}
				}
				if ( 0 == ii && caller.properties.recursiveRendering && caller.controller.allowOperations() )
				{
					// supported in inherited widgets only (tree-like)					
					td.addDnD(fry.ui.dnd.MODE_BOTH_POINTER, $new(ac.TableViewDnDAdapter, td, caller, child_elem));
				}
				var startEdit = function(evt, sel_elem)
				{
					var tde = evt.$;
					while ( 'td' != tde.$.tagName.toLowerCase() )
					{
						tde = tde.p();
					}
					var sel_column = null;
					$foreach ( columns, function(c, j, control)
					{
						if ( c.id == tde.ga('colid') )
						{
							sel_column = c;
							control.stop();
						}
					});
					if ( null == sel_column )
					{
						return;
					}
					if ( sel_column.isEditable )
					{
						// editable column
						var edited_value = caller.controller.onGetElementValueForEditing(sel_elem, sel_column.id);
						if ( null == edited_value )
						{
							return;
						}
						var editor = caller.controller.onGetElementValueEditor(sel_elem, sel_column.id);
						if ( null == editor )
						{
							return;
						}
						if ( null != caller.valueEditor )
						{
							caller.valueEditCanceled();
						}
						editor.setOwnerWidget(caller);
						var inode = tde.g('blockquote:0').t('');
						caller.valueEditor = {
							node:inode,
							acElem:sel_elem,
							colId:sel_column.id,
							value:edited_value,
							editor:editor
						};
						var w = inode.w()-40;
						if ( tde.p().ga('level') )
						{
							w -= tde.p().ga('level');
						}
						editor.render(inode, w, caller.valueEditor.value);
					}
				}
				if ( !columns[ii].isInfoColumn )
				{
					td.sa('colid', columns[ii].id);
					td.fc().e('click', function(evt)
					{
						// selecting the row
						evt.stop();
						$__tune.behavior.clearSelection();
						var tr = evt.$.gp('tr');
						var sel_elem = caller.properties.actualListContainer.getElementById(tr.ga('tvw-id'));
						ac.widget.focus(caller);
						caller.controller.onElementClick(sel_elem, evt);
						if ( false && 'active' == tr.ga('himode') )
						{
							startEdit(evt, sel_elem);
							return;
						}
						caller.changeSelection(sel_elem, !evt.isAnyControlKeyPressed());
					});
					td.e('dblclick', function(evt)
					{
						evt.stop();
						$__tune.behavior.clearSelection();
						var sel_elem = caller.properties.actualListContainer.getElementById(evt.$.gp('tr').ga('tvw-id'));
						caller.changeSelection(sel_elem, false, true);
						ac.widget.focus(caller);
						caller.controller.onElementDblClick(sel_elem, evt);
						startEdit(evt, sel_elem);
					});
				}
				delete col_data;
				delete td;
			}
			delete tds;
			delete row_data;
			var orig_elem_node = caller.getElementNode(child_elem);
			if ( null != orig_elem_node )
			{
				orig_elem_node.rs();
			}
			tr_child.i(caller.genUniqIdent('ec-?-?', child_elem.id)).sa('tvw-id', child_elem.id);
			caller.setElementNode(child_elem, tr_child);
			tr_child = tbody.ib(tr_child, tr);
			if ( caller.properties.recursiveRendering && render_children )
			{
				// recursive call for rendering children
				caller.renderRows(child_elem, tr_child);
			}
			if ( !check_maximum )
			{
				continue;
			}
			actual_height += tr_child.fc().$.offsetHeight;
			delete tr_child;
			delete child_elem;
			if ( actual_height > max_height )
			{
				var range = i-fromElementIndex;
				var thread_counter = 1;
				for ( ii=i; ii<toElementIndex; ii+=range)
				{
					var from_index = ii;
					var to_index = ii+range;
					eval('$runafter('+(1800*thread_counter++)+', function(){caller.renderRows(null, null, '+from_index+', '+to_index+');})');
				}
				break;
			}
			caller.controller.onAfterRenderElement(listContainer);			
		}
		// removing placeholder
		tr.rs();
		// coloring rows
		caller.colorizeRows();
		with ( caller.properties )
		{
			for ( i in currentlyRendered )
			{
				if ( listContainer == currentlyRendered[i] )
				{
					delete currentlyRendered[i];
					break;
				}
			}		
		}
	}
	delete tr_template;
	
	// check to see if children are loaded
	if ( listContainer.hasState(listContainer.STATE_WILL_LOAD) )
	{
		// children to be loaded yet
		listContainer.removeAllChildren();
		var loading_msg = this.view.renderLoadingMessage(listContainer, tr.fc(), level*40);
		if ( null == loading_msg )
		{
			loading_msg = '<img src="mm/i/theme/?/loading.gif" width="16" height="16" border="0" style="margin-top:2px;margin-left:?px"/>'.embed(fry.ui.theme.name, (level*40));
		}
		tr.fc().t(loading_msg);
		this.model.loadElements(listContainer, 
			function()
			{
				// on success
				listContainer.setState(listContainer.STATE_EXPANDED|listContainer.STATE_LOADED);
				render();
			},
			function(error)
			{
				// on failure to load
				listContainer.setState(listContainer.STATE_EXPANDED|listContainer.STATE_LOADED);
				tr.rs();
				// we will just notify the view, there's no consistent and clear way of displaying error in the tableview, so it's up to the implementation how to handle it (displaying popup window message, ignore it, ...)
				caller.view.renderElementLoadError(listContainer, error, $$());
			}
		);
	}
	else
	{
		render();
	}
//	delete listContainer;	
}

ac.TableViewWidget.prototype.renderFirstColumn = function(acElem, col_data, level, tr_node, node)
{
	node.a($$()).n('tableview-inner').a($$('blockquote')).t(col_data || '--');
	return false;
}

ac.TableViewWidget.prototype.colorizeRows = function()
{
	var ix = 0;
	$foreach ( this.scrollNode.g('tbody:0').$.childNodes, function(tr)
	{
		tr = $(tr);
		var was_selected = null != tr.ga('himode') && 'inactive' != tr.ga('himode');
		if ( 'info-detail' == tr.n().substr(0,11) || !tr.v() )
		{
			return;
		}
		tr.n( '? ?'.embed(0 == ix++ % 2 ? 'even' : 'odd', was_selected ? 'active' : '') );
	});
}

ac.TableViewWidget.prototype.getElementLevel = function(acElem)
{
	return 0;
}



		
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}