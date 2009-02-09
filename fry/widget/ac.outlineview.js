/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.OutlineView widget < ac.TableView widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/*  ---------------------------------------------------------------- 
	ac.OutlineViewWidgetModel < ac.HierarchicalWidgetModel
*/

$class('ac.OutlineViewWidgetModel < ac.HierarchicalWidgetModel');

/*  ---------------------------------------------------------------- 
	ac.OutlineViewWidgetView < ac.TableViewWidgetView
*/
$class('ac.OutlineViewWidgetView < ac.TableViewWidgetView');

// you can return null to omit icon rendering
ac.OutlineViewWidgetView.prototype.renderElementInListIcon = function(acElem)
{
	return '<img src="mm/i/theme/?/browser.?.(inactive).gif" width="13" height="13" border="0"/>'.embed(fry.ui.theme.name, acElem.isCollection?'folder':'item');
}


/*  ---------------------------------------------------------------- 
	ac.OutlineViewWidgetController < ac.TableViewWidgetController
*/
$class('ac.OutlineViewWidgetController < ac.TableViewWidgetController');

ac.OutlineViewWidgetController.prototype.onElementValueEdited = function(acElem, colId, value, callbackOk, callbackError)
{
	// mapping to element `rename` operation
	this.onElementRename(acElem, value, callbackOk, callbackError);
}


/*  ---------------------------------------------------------------- 
	ac.OutlineViewWidget < ac.HierarchicalWidget, ac.TableViewWidget
*/
$class('ac.OutlineViewWidget < ac.HierarchicalWidget, ac.TableViewWidget',
{
	construct:function()
	{
		this.properties.recursiveRendering = true;
		this.properties.actualListContainer = this.model.rootElement;
	}
});


ac.OutlineViewWidget.prototype.render = function()
{
	var caller = this;
	this.containerNode.s('overflow:hidden');
	this.renderingNode = this.containerNode.a($$()).n('acw-outlineview ?'.embed(this.cssClassName)).w(this.containerNode.w()).h(this.containerNode.h()+$__tune.ui.scrollbarWidth);
	this.renderingNode.pos(true).s('clip:rect(0 ?px ?px 0)'.embed(this.containerNode.w(), this.containerNode.h()));
	
	this.renderHeader();
	this.renderRows();
}

ac.OutlineViewWidget.prototype.expandElement = function(acElem)
{
	var node = this.getElementNode(acElem);
	if ( null == node )
	{
		return;
	}
	node.fc().fc().fc().n('arrow-down');
	if ( acElem.hasState(acElem.STATE_EXPANDED) )
	{
		return;
	}
	var node_after = node;
	if ( node.ns() && -1 != node.ns().n().indexOf('info-detail') )
	{
		node_after = node.ns();
	}
	if ( 'true' != node.ga('was-expanded') )
	{
		// need to render it for the first time
		this.renderRows(acElem, node_after);
		node.sa('was-expanded', 'true');
	}
	else
	{
		// was already collapsed before, nodes are stored in repository
		var caller = this;
		var node_parent = node.p();
		acElem.map(function(elem)
		{
			if ( acElem == elem )
			{
				return true;
			}
			var node_elem = caller.getElementNode(elem);
			if ( null == node_elem )
			{
				return false;
			}
			node_after = node_parent.ia(node_elem, node_after);
			return elem.hasState(elem.STATE_EXPANDED);
		});
		this.colorizeRows();
	}
	acElem.setStateExpanded();
	this.scrollIntoView(acElem);
}

ac.OutlineViewWidget.prototype.collapseElement = function(acElem)
{
	var node = this.getElementNode(acElem);
	if ( null == node )
	{
		return;
	}
	node.fc().fc().fc().n('arrow-right');
	if ( acElem.hasState(acElem.STATE_COLLAPSED) )
	{
		return;
	}
	var caller = this;
	acElem.map(function(elem)
	{
		if ( elem == acElem )
		{
			return true;
		}
		var node_elem = caller.getElementNode(elem);
		if ( null == node_elem )
		{
			return false;
		}
		var ns = node_elem.ns();
		if ( null != ns && -1 != ns.n().indexOf('info-detail') )
		{
			node_elem.lc().g('blockquote:0').n('');
			ns.rs();
		}
		caller.repositoryNode.a(node_elem);
		return !elem.hasState(elem.STATE_COLLAPSED);
	});
	acElem.setStateCollapsed();
	this.colorizeRows();
	this.scrollIntoView(acElem);
}

ac.OutlineViewWidget.prototype.renderFirstColumn = function(acElem, col_data, level, tr_node, node )
{
	var caller = this;
	var render_children = false;
	// used for editing
	tr_node.sa('level', 40*level);
	// check to see if the element is a collection
	if ( acElem.isCollection )
	{
		// yes, rendering controls - we will collapse the collection by default
		acElem.setStateCollapsed();
		node.a($$()).n('arrow-right').w(28).h(11).s('background-repeat:no-repeat;margin-left:?px'.embed(level*40)).e('click', function(evt)
		{
			evt.stop();
			var is_expanded = acElem.hasState(acElem.STATE_EXPANDED);
			if ( is_expanded )
			{
				caller.collapseElement(acElem);
			}
			else
			{
				caller.expandElement(acElem);
			}
			ac.widget.focus(caller);
		});
	}
	else
	{
		// not a collection
		node.t('<div class="arrow-void" style="margin-left:?px"></div>'.embed(16 + level*40));
	}
	var i_src = this.view.renderElementInListIcon(acElem);
	if ( null != i_src )
	{
		node.lc().a($$().s('margin-left:?px;'.embed(acElem.isCollection?16:0)).w(13).h(13).t('?'.embed(i_src)));
	}
	node.a($$('blockquote')).s('padding-left:?px'.embed(30+40*level)).t(col_data||'--');
	return false;
}

ac.OutlineViewWidget.prototype.getElementLevel = function(acElem)
{
	return this.model.getElementLevel(acElem);
}



		
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}