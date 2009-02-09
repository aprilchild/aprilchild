/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.TabPane widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/*  ---------------------------------------------------------------- 
	ac.TabPaneWidgetModel < ac.ContainerWidgetModel
*/
$class('ac.TabPaneWidgetModel < ac.ContainerWidgetModel');

ac.TabPaneWidgetModel.prototype.checkPaneAdapter = function(pane)
{
	$foreach ( ['onOpen', 'onClose', 'onShow', 'onHide', 'isContentScrollable'], function(method)
	{
		pane.adapter[method] = pane.adapter[method] || ac.TabPaneWidgetController.prototype[method];
	});
	return pane;
}

/*  ---------------------------------------------------------------- 
	ac.TabPaneWidgetController < ac.ContainerWidgetController
*/
$class('ac.TabPaneWidgetController < ac.ContainerWidgetController');


/*  ---------------------------------------------------------------- 
	ac.TabPaneWidgetView < ac.ContainerWidgetView
*/
$class('ac.TabPaneWidgetView < ac.ContainerWidgetView',
{
	construct:function()
	{
		if ( 'undefined' == typeof this.options.position )
		{
			this.options.position = 'bottom';
		}
		if ( 'undefined' == typeof this.options.startingTabOffset )
		{
			this.options.startingTabOffset = 8;
		}
		if ( 'undefined' == typeof this.options.hasTabClosingButtons )
		{
			this.options.hasTabClosingButtons = true;
		}
		if ( 'undefined' == typeof this.options.tabSpacing )
		{
			this.options.tabSpacing = 0;
		}
	}
});

ac.TabPaneWidgetView.prototype.renderTitle = function(pane, index, node)
{
	node.t(pane.label);
}

/*  ---------------------------------------------------------------- 
	ac.TabPaneWidget < ac.ContainerWidget
*/
$class('ac.TabPaneWidget < ac.ContainerWidget',
{
	construct:function()
	{
		this.activePaneIndex = -1;
		this.titlesNode = null;
		this.hiderNode = null;
		this.activeTitlePos = [];
	}
});

ac.TabPaneWidget.prototype.onResize = function(width, height)
{
	// console.log('Resize: %s x %s', width, height);
	this.renderingNode.w(width).h(height);
	var contents = this.renderingNode.fc();
	var titles = contents.ns();
	var tit_h = titles.h();
	contents.w(width).h(height-tit_h);
	var lst = contents.$.childNodes;
	for (var i=0; i<lst.length; i++)
	{
		$(lst.item(i)).w(width-2).h(height-tit_h);
	}
	titles.w(width);
}

ac.TabPaneWidget.prototype.getContentsPaneHeight = function()
{
	return this.renderingNode.h()-this.titlesNode.h();
}

ac.TabPaneWidget.prototype.renderAdditional = function()
{
	// adjusting css class name
	this.renderingNode.n('acw-tabpane ?'.embed(this.cssClassName));
	var is_bottom = 'bottom' == this.view.options.position;
	
	// rendering "more" node
	this.nodeMore = this.renderingNode.a($$()).pos(true).x(this.renderingNode.w()-16).n('more').w(14).h(9).d(false);
	
	// creating titles
	this.titlesNode = this.renderingNode.a($$()).n('titles ?'.embed(is_bottom?'bottom':''));
	this.renderTitles();
	
	var h = this.titlesNode.h();
	this.resizeContents(is_bottom ? 0 : h, -h);
	
	var offset_y = this.renderingNode.h()-h;
	this.titlesNode.x(is_bottom?offset_y:0).w(this.renderingNode.w()).h(h).pos(true).x(0).y(is_bottom?offset_y:0).s('clip:rect(0 ?px ?px 0)'.embed(this.renderingNode.w(),h));
	
	this.nodeMore.y(6+(is_bottom?offset_y:0)).z(this.renderingNode.z()+1);
	// creating popup menu widget
	this.menuPopup = null;
	if ( ac.MenuWidget )
	{
		$class('ac.TabPaneWidgetMenuModel < ac.MenuWidgetModel');

		ac.TabPaneWidgetMenuModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
		{
			acElem.removeAllChildren();
			var parent_widget = acElem.properties.parentWidget;
			var num_panes = parent_widget.model.panes.length;
			for ( var i=parent_widget.firstInvisibleIndex; i<num_panes; i++ )
			{
				var pane = parent_widget.model.panes[i];
				var child_elem = acElem.appendChild($new(ACElement));
				child_elem.isCollection = false;
				var test_node = $$();
				parent_widget.view.renderTitle(pane, pane.index, test_node);
				child_elem.properties.label = test_node.t().stripMarkup();
				child_elem.properties.isActive = true;
				child_elem.properties.isVisible = true;
				child_elem.properties.isSeparator = false;
				child_elem.properties.index = pane.index;
			}
			callbackOnSuccess();
		}		
		
		$class('ac.TabPaneWidgetMenuView < ac.MenuWidgetView');
		
		ac.TabPaneWidgetMenuView.prototype.renderMenuItem = function(acElem, node, isTopMenuBar)
		{
			node.t(acElem.properties.label);
		}

		$class('ac.TabPaneWidgetMenuController < ac.MenuWidgetController');

		ac.TabPaneWidgetMenuController.prototype.performAction = function(acElem)
		{
			acElem.parentElement.properties.parentWidget.switchPane(acElem.properties.index);
			acElem.parentElement.properties.parentWidget.menuVisible = false;
		}
		
		
		var menu_item = $new(ACElement);
		// will let model to load data
		menu_item.setState(menu_item.STATE_WILL_LOAD);
		menu_item.properties.isVisible = true;
		menu_item.properties.isActive = true;
		menu_item.properties.isSeparator = false;
		menu_item.properties.parentWidget = this;
		this.menuPopup = $new
		(
			ac.MenuWidget,
			$new(ac.TabPaneWidgetMenuModel, menu_item),
			$new(ac.TabPaneWidgetMenuView, {startsWithTopMenuBar:false}),
			$new(ac.TabPaneWidgetMenuController),
			this
		);
		this.menuVisible = false;
		var caller = this;
		this.nodeMore.e('click', function(evt)
		{
			evt.stop();
			if ( caller.menuVisible )
			{
				caller.menuNode.rs();
				caller.menuPopup.hide();
			}
			caller.menuPopup.model.rootElement.setState(caller.menuPopup.model.rootElement.STATE_WILL_LOAD);
			caller.menuNode = $().a($$()).pos(true);
			caller.menuPopup.show(caller.menuNode, 'tabpane');
			var menu_height = caller.menuPopup.menuNodes[0].h();
			var menu_width = caller.menuPopup.menuNodes[0].w();
			var ref_node = caller.renderingNode;
			var pos = ref_node.abspos();
			caller.menuPopup.menuNodes[0].x(pos.x+ref_node.w()-menu_width-30).y('bottom' == caller.view.options.position ? (pos.y+ref_node.h()-menu_height) : pos.y);
			caller.menuVisible = true;
		})
	}
	
	// rendering hider node
	this.renderHider();
}

ac.TabPaneWidget.prototype.renderHider = function()
{
	// hider node
	if ( null != this.hiderNode )
	{
		this.hiderNode.rs();
	}
	if ( 0 == this.activeTitlePos.length )
	{
		return;
	}
	this.hiderNode = this.renderingNode.a($$()).pos(true).h(0).n('hider').z(this.renderingNode.z()+1);
	var w = this.activeTitlePos[1]-2;
	var offset_x = this.activeTitlePos[0]+this.activeTitlePos[1];
	if ( this.renderingNode.w() < offset_x )
	{
		w -= (offset_x - this.renderingNode.w()) - 1;
	}
	if ( this.activeTitlePos[0] )
	{
		this.hiderNode.x(this.activeTitlePos[0]).y('bottom'==this.view.options.position?(this.containerNode.h()-this.titlesNode.h()-1):this.titlesNode.h()).w(w);
	}
}

ac.TabPaneWidget.prototype.renderTitles = function()
{
	var caller = this;
	var is_bottom = 'bottom' == this.view.options.position;
	var holder = this.titlesNode.t('').a($$()).pos(true).x(0).y(0);
	var total_w = this.titlesNode.w() - 18;
	var w = this.view.options.startingTabOffset;
	this.activeTitlePos = [];
	this.nodeMore.d(false);
	$foreach ( this.model.panes, function(pane, i, control)
	{
		w += caller.view.options.tabSpacing;
		var is_active = i == caller.activePaneIndex;
		var node = holder.a($$()).n('title ?active ?'.embed(is_active?'':'in', is_bottom?'bottom':'')).x(w).y(0);
		// check for key bindings
		if ( pane.key )
		{
			var k = pane.key;
			caller.registerKeyAction(k.string, function(){caller.switchPane(pane.index)}, k.text, k.scope, node);
		}
		var tr = node.a($$()).n('inner').a($$('table')).sa('cellPadding',0).sa('cellSpacing',0).a($$('tbody')).a($$('tr'));
		if ( caller.view.options.hasTabClosingButtons )
		{
			tr.a($$('td')).t('<div class="button-close" src="mm/i/theme/void.gif" width="14" height="14" border="0"/>').e('click', function(evt)
			{
				evt.stop();
				caller.closePane(i);
			});			
		}
		caller.view.renderTitle(pane, i, tr.a($$('td')).n('label'));
		if ( is_active )
		{
			// setting hider info
			caller.activeTitlePos = [w+1, node.w()];
			if ( node.ps() )
			{
				node.ps().s('border-right-width:0');
			}
		}
		delete tr;
		var node_w = node.w();
		if ( total_w < w + node_w )
		{
			control.stop();
			caller.nodeMore.d(true);
			if ( is_active )
			{
				caller.activeTitlePos = [];
				node.ps().s('border-right-width:1px');
			}
			caller.firstInvisibleIndex = i;
			node.rs();
			return;
		}
		var pw = w;
		// setting absolute position AFTER to acquire real width
		node.e('click', function(evt)
		{
			evt.stop();
			if ( i != caller.activePaneIndex )
			{
				var last_node = $(holder.$.childNodes.item(caller.activePaneIndex));
				if ( null != last_node )
				{
					last_node.n('title inactive ?'.embed(is_bottom?'bottom':''));
					if ( last_node.ps() )
					{
						last_node.ps().s('border-right-width:1px');
					}
				}
				caller.activeTitlePos = [pw+1, node.w()]
				node.n('title active ?'.embed(is_bottom?'bottom':''));
				if ( node.ps() )
				{
					node.ps().s('border-right-width:0');
				}
				caller.renderHider();
				caller.renderPane(i);
			}
		});
		node.pos(true);
		// adding Drag
		/*
		node.addDrag(fry.ui.drag.MODE_HORIZONTAL,
		{
			onDragMove:function(node, nx, ny, ox, oy)
			{
				return null;
			},
			onGetCursorNode:function()
			{
				var cnode = $$().n('acw-tabpane ?'.embed(caller.cssClassName)).w(node_w).h(node.h()).s('clip:rect(0 ?px ?px 0)'.embed(node_w, node.h())).o(0.8);
				cnode.a($$()).n('titles').a(node.dup().x(0).y(0));
				return cnode;
			}
		});
		*/
		w += node_w;
	});
	holder.w(w);
}


ac.TabPaneWidget.prototype.renderWhenEmpty = function()
{
	this.activeTitlePos = [0,0];
}

ac.TabPaneWidget.prototype.renderAfterClosePane = function()
{
	this.renderTitles();
	this.renderHider();
}

ac.TabPaneWidget.prototype.renderAfterAddPane = function()
{
	this.renderTitles();
	this.renderHider();
}

ac.TabPaneWidget.prototype.renderAfterSwitchPane = function()
{
	this.renderTitles();
	this.renderHider();
}


if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}