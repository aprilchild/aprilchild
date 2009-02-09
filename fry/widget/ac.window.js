/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Window widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/*  ---------------------------------------------------------------- 
	ac.WindowWidgetModel < ac.WidgetModel
*/

$class('ac.WindowWidgetModel < ac.WidgetModel');


/*  ---------------------------------------------------------------- 
	ac.WindowWidgetView < ac.WidgetView
*/
$class('ac.WindowWidgetView < ac.WidgetView',
{
	construct:function(options)
	{
		this.setDefaultOptions(options);
	}
});

ac.WindowWidgetView.prototype.setDefaultOptions = function(options)
{
	if ( 'undefined' == typeof this.options.defaultSize )
	{
		this.options.defaultSize = {width:400, height:350};
	}
	if ( 'undefined' == typeof this.options.defaultPosition )
	{
		var ppos = fry.ui.info.page;
		this.options.defaultPosition = {x:Math.floor(((ppos.width-this.options.defaultSize.width)/2)), y:Math.floor(((ppos.height-this.options.defaultSize.height)/2))};
	}
	if ( 'undefined' == typeof this.options.minSize )
	{
		this.options.minSize = {width:100, height:100};
	}
	if ( 'undefined' == typeof this.options.maxSize )
	{
		this.options.maxSize = fry.ui.info.page;
	}
	if ( 'undefined' == typeof this.options.isModal )
	{
		this.options.isModal = false;
	}
	if ( 'undefined' == typeof this.options.isMovable )
	{
		this.options.isMovable = true;
	}
	if ( 'undefined' == typeof this.options.isResizable )
	{
		this.options.isResizable = true;
	}
	if ( 'undefined' == typeof this.options.hasTitle )
	{
		this.options.hasTitle = true;
	}
	if ( 'undefined' == typeof this.options.isScrollable )
	{
		this.options.isScrollable = true;
	}
	if ( 'undefined' == typeof this.options.isResizable )
	{
		this.options.isResizable = true;
	}
	if ( 'undefined' == typeof this.options.hasStatus )
	{
		this.options.hasStatus = true;
	}	
	if ( 'undefined' == typeof this.options.hasBorder )
	{
		this.options.hasBorder = true;
	}
	if ( 'undefined' == typeof this.options.hasShadows )
	{
		this.options.hasShadows = true;
	}
	if ( 'undefined' == typeof this.options.hasMinimizeButton )
	{
		this.options.hasMinimizeButton = false;
	}
	if ( 'undefined' == typeof this.options.hasMaximizeButton )
	{
		this.options.hasMaximizeButton = false;
	}
}

ac.WindowWidgetView.prototype.onRenderTitle = function(node, params)
{
}

ac.WindowWidgetView.prototype.onRenderContent = function(node, params)
{
}

ac.WindowWidgetView.prototype.onRenderStatus = function(node, params)
{
}

/*  ---------------------------------------------------------------- 
	ac.WindowWidgetController < ac.WidgetController
*/
$class('ac.WindowWidgetController < ac.WidgetController');

ac.WindowWidgetController.prototype.onFocus = function()
{
}

ac.WindowWidgetController.prototype.onBlur = function()
{
}

// return false to disable closing
ac.WindowWidgetController.prototype.onResize = function(node, width, height)
{
}

// return false to disable closing
ac.WindowWidgetController.prototype.onClose = function()
{
	return true;
}

// return false to disable minimizing
ac.WindowWidgetController.prototype.onMinimize = function()
{
	return true;
}

// return false to disable maximizing
ac.WindowWidgetController.prototype.onMaximize = function()
{
	return true;
}


/*  ---------------------------------------------------------------- 
	ac.WindowWidgetDragAdapter < fry.ui.DragAdapter
*/
$class('ac.WindowWidgetDragAdapter < fry.ui.DragAdapter',
{
	construct:function(node, widget)
	{
	    this.widget = widget;
	}
});

ac.WindowWidgetDragAdapter.prototype.onDragStart = function()
{
	ac.widget.focus(this.widget);
}

ac.WindowWidgetDragAdapter.prototype.onDragStop = function()
{
}



/*  ---------------------------------------------------------------- 
	ac.WindowWidget < ac.Widget
*/
$class('ac.WindowWidget < ac.Widget',
{
	construct:function()
	{
		this.isModal = false;
		this.position = null;
		this.size = null;
		this.titleNode = null;
		this.statusNode = null;
		this.contentNode = null;
	}
});

ac.WindowWidget.prototype.onFocus = function()
{
	if ( !this.renderingNode.is() )
	{
		return;
	}
	if ( null == this.renderingNode.ga('window-z') )
	{
		this.renderingNode.sa('window-z', this.renderingNode.z());		
	}
	this.renderingNode.z(15000);
	if ( null != this.titleNode )
	{
		this.titleNode.n('window-title ? active'.embed(this.isModal?'modal':''));
	}
	this.controller.onFocus();
}

ac.WindowWidget.prototype.onBlur = function()
{
	if ( this.isModal )
	{
		return;
	}
	if ( !this.renderingNode.is() )
	{
		return;
	}
	this.renderingNode.z(this.renderingNode.ga('window-z'));
	if ( null != this.titleNode )
	{
		this.titleNode.n('window-title ?'.embed(this.isModal?'modal':''));		
	}
	this.controller.onBlur();
}

ac.WindowWidget.prototype.close = function()
{
	if ( this.controller.onClose() )
	{
		this.setModal(false);
		this.hide();
	}
}

ac.WindowWidget.prototype.minimize = function()
{
	if ( this.controller.onMinimize() )
	{
	}
}

ac.WindowWidget.prototype.maximize = function()
{
	if ( this.controller.onMaximize() )
	{
	}
}

ac.WindowWidget.prototype.onResize = function(width, height)
{
	this.renderingNode.w(width).h(height);
	// resizing shadow
	var opt = this.view.options;
	if ( opt.hasShadows )
	{
		fry.ui.snippet.ResizeShadowedBox(this.renderingNode, width, height);
	}
	var h = height;
	if ( opt.hasTitle )
	{
		h -= this.titleNode.h();
		this.titleNode.w(width);
		this.titleNode.fc().w(width);
	}
	if ( opt.hasStatus )
	{
		h -= this.statusNode.h()+2;
		this.statusNode.w(width);
		this.statusNode.y(height-this.statusNode.h()-2);
	}
	this.contentNode.w(width);
	this.contentNode.h(h);
	this.contentNode.fc().h(h-1);
	// moving resizer
	var pos = this.renderingNode.abspos();
	this.contentNode.ns().x(width-18).y(height-18);
	this.controller.onResize(this.contentNode.fc(), width, h-1);
}

ac.WindowWidget.prototype.setModal = function(isModal)
{
	if ( isModal == this.isModal )
	{
		return;
	}
	if ( isModal )
	{
		var pinf = fry.ui.info.page;
		$().a($$()).i('w-modal-bg-?'.embed(this.ident)).pos(true).x(pinf.scroll.left||0).y(pinf.scroll.top||0).w(pinf.width).h(pinf.height).z(14999).n('acw-window-modal-bg ?'.embed(this.cssClassName)).e('click', function(evt)
		{
			evt.stop();
		});
		this.titleNode.n('window-title modal');
	}
	else
	{
		$('w-modal-bg-?'.embed(this.ident)).rs();
	}
	this.isModal = isModal;
	
}

ac.WindowWidget.prototype.setScrollable = function(isScrollable)
{
	if ( isScrollable == this.isScrollable )
	{
		return;
	}
	this.contentNode.fc().n('window-content-inner ?'.embed(isScrollable?'scrollable':''));
	this.isScrollable = isScrollable;
}

ac.WindowWidget.prototype.setTitle = function(params)
{
	if ( this.view.options.hasTitle )
	{
		this.view.onRenderTitle(this.titleNode.g('td:1').lc(), params);		
	}
}

ac.WindowWidget.prototype.setContent = function(params)
{
	this.view.onRenderContent(this.contentNode.fc(), params);
}

ac.WindowWidget.prototype.setStatus = function(params)
{
	if ( this.view.options.hasStatus )
	{
		this.view.onRenderStatus(this.statusNode.fc(), params);	
	}
}

ac.WindowWidget.prototype.render = function()
{
	var opt = this.view.options;
	if ( null == this.size )
	{
		this.position = opt.defaultPosition;
		this.size = opt.defaultSize;
	}
	if ( true && 'undefined' != typeof fry.ui.snippet && opt.hasShadows )
	{
		this.renderingNode = $().a(fry.ui.snippet.ShadowedBox(this.size.width, this.size.height, 'shadow-box', null, opt.hasTitle?10:0)).n('acw-window ?'.embed(this.cssClassName)).pos(true).x(this.position.x).y(this.position.y);
	}
	else
	{
		this.renderingNode = $().a($$()).n('acw-window ?'.embed(this.cssClassName)).pos(true).x(this.position.x).y(this.position.y).w(this.size.width).h(this.size.height);
		opt.hasShadows = false;
	}
	if ( opt.hasTitle )
	{
		this.renderTitle();
	}
	if ( opt.hasStatus )
	{
		this.renderStatus();
	}
	this.renderContent();
	if ( opt.isResizable )
	{
		var caller = this;
		var dim = {w:0, h:0};
		var resizer = this.renderingNode.a($$()).n('resizer').pos(true).x(this.size.width-18).y(this.size.height-(opt.hasStatus?16:18));
		resizer.addDrag(fry.ui.drag.MODE_STANDARD, 
		{
			onDragMove:function(dragNode, nx, ny, offsetX, offsetY)
			{
				var pos = caller.renderingNode.abspos();
				var w = nx-pos.x+18;
				var h = ny-pos.y+18;
				var do_resize = true;
				if ( w < opt.minSize.width )
				{
					nx = pos.x+opt.minSize.width;
					do_resize = false;
				}
				if ( w > opt.maxSize.width )
				{
					nx = pos.x+opt.maxSize.width;
					do_resize = false;
				}
				if ( h < opt.minSize.height )
				{
					ny = pos.y+opt.minSize.height;
					do_resize = false;
				}
				if ( h > opt.maxSize.height )
				{
					ny = pos.y+opt.maxSize.height;
					do_resize = false;
				}
				if ( do_resize )
				{
					ac.widget.resize(caller, w, h);
					dim.w = w;
					dim.h = h;
				}
				return {x:nx, y:ny};
			},
			onDragStart:function()
			{
				ac.widget.focus(caller);
			},
			onDragStop:function()
			{
				return true;
			},
			onGetCursorNode:function()
			{
				return resizer.dup().n('acw-window-resizer');
			}
		});
	}
	if ( opt.isModal )
	{
		this.setModal(true);
	}
}

ac.WindowWidget.prototype.renderTitle = function()
{
	var caller = this;
	var opt = this.view.options;
	var node = this.renderingNode.a($$()).n('window-title ?'.embed(this.isModal?'modal':'')).pos(true).x(0).y(0).w(this.size.width);
	node.a($$('table')).w(this.size.width).sa('cellSpacing',0).a($$('tbody')).a($$('tr')).a($$('td')).n('lbg').p().a($$('td')).n('bg').p().a($$('td')).n('rbg');
	// close/maxi/mini buttons
	var buttons_container = node.g('td:1').a($$()).n('window-buttons').e('mouseover', function()
	{
		buttons_container.n('window-buttons active');
	}).e('mouseout', function()
	{
		buttons_container.n('window-buttons');		
	});
	var buttons = buttons_container.a($$('table')).sa('cellSpacing',0).a($$('tbody')).a($$('tr'));
	buttons.a($$('td')).n('button-close').e('click', function(evt)
	{
		caller.close();
	});
	var button = buttons.a($$('td'));
	if ( opt.hasMinimizeButton )
	{
		button.n('button-minimize').e('click', function(evt)
		{
			if ( caller.controller.onMinimize )
			{
				caller.minimize();
			}
		});
	}
	button = buttons.a($$('td'));
	if ( opt.hasMaximizeButton )
	{
		button.n('button-maximize').e('click', function(evt)
		{
			if ( caller.controller.onMaximize )
			{
				caller.maximize();
			}
		});
	}
	// hack for resizing
	var label = node.g('td:1').a($$()).n('window-label').pos(true).s('width:80%');//.w(this.size.width-20-node.g('td:0').w()-node.g('td:0').ns().ns().w()-buttons.gp('div').w());
	this.view.onRenderTitle(label);
	node.addDrag(fry.ui.drag.MODE_STANDARD, $new(ac.WindowWidgetDragAdapter, this.renderingNode, this));
	this.titleNode = node;
	delete node;
}

ac.WindowWidget.prototype.renderStatus = function()
{
	var opt = this.view.options;
	var node = this.renderingNode.a($$()).n('window-status').pos(true).w(this.size.width).x(0);
	node.y(this.size.height-node.h());
	this.view.onRenderStatus(node.a($$()).n('window-status-inner'));
	node.addDrag(fry.ui.drag.MODE_STANDARD, $new(ac.WindowWidgetDragAdapter, this.renderingNode, this));
	this.statusNode = node;
	delete node;
}

ac.WindowWidget.prototype.renderContent = function()
{
	var opt = this.view.options;
	var h = this.size.height;
	if ( opt.hasTitle )
	{
		h -= this.titleNode.h();
	}
	if ( opt.hasStatus )
	{
		h -= this.statusNode.h();
	}
	var node = this.renderingNode.a($$()).n('window-content').h(h).pos(true).y(opt.hasTitle?this.titleNode.h():0).w(this.size.width);
	var inner = node.a($$()).n('window-content-inner ?'.embed(opt.isScrollable?'scrollable':'')).h(h-1);
	this.view.onRenderContent(inner);
	this.contentNode = node;
	delete inner;
	delete node;
}

if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}