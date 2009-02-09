/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Accordion widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*  ---------------------------------------------------------------- 
	ac.AccordionWidgetModel < ac.ContainerWidgetModel
*/
$class('ac.AccordionWidgetModel < ac.ContainerWidgetModel');

// P - Checks accordion pane adapter for proper methods. If particular method is not defined, it is replaced by default one.
// p(o) - accordion pane object.
// = adjusted pane object.
ac.AccordionWidgetModel.prototype.checkPaneAdapter = function(pane)
{
	$foreach ( ['onOpen', 'onClose', 'onShow', 'onHide', 'isContentScrollable'], function(method)
	{
		pane.adapter[method] = pane.adapter[method] || ac.AccordionWidgetController.prototype[method];
		pane.isExpanded = false;
	});
	return pane;
}

/*  ---------------------------------------------------------------- 
	ac.AccordionWidgetController < ac.ContainerWidgetController
*/
$class('ac.AccordionWidgetController < ac.ContainerWidgetController');


/*  ---------------------------------------------------------------- 
	ac.AccordionWidgetView < ac.WidgetView
*/
$class('ac.AccordionWidgetView < ac.WidgetView',
{
	construct:function(options)
	{
		this.options.animate = $getdef(this.options.animate, true);
		this.options.onlyOneOpened = $getdef(this.options.onlyOneOpened, false);
	}
});

ac.AccordionWidgetView.prototype.renderTitle = function(pane, index, node)
{
	node.t(pane.label);
}

/*  ---------------------------------------------------------------- 
	ac.AccordionWidget < ac.ContainerWidget
*/
$class('ac.AccordionWidget < ac.ContainerWidget');

ac.AccordionWidget.prototype.render = function()
{
	var caller = this;
	this.renderingNode = this.containerNode.a($$()).n('acw-accordion ?'.embed(this.cssClassName)).pos(true).w(this.containerNode.w()).h(this.containerNode.h());
	if ( this.view.options.onlyOneOpened )
	{
		this.renderingNode.s('overflow:hidden');
	}
	this.renderPanes();
}

ac.AccordionWidget.prototype.onResize = function(width, height)
{
	this.renderingNode.w(width);
	var caller = this;
	var node_pane = this.renderingNode.fc();
	while (node_pane && node_pane.is())
	{
		node_pane.fc().w(width);
		node_pane.fc().ns().s('clip:rect(0 ?px ?px 0)'.embed(width, height));
		node_pane.fc().ns().w(width);
		node_pane.fc().ns().fc().w(width);
		node_pane = node_pane.ns();
	}
}

ac.AccordionWidget.prototype.animatePane = function(panes, contents)
{
	var num_panes = panes.length;
	var num_steps = 6;
	var offsets = [];
	var ws = [];
	var h_nodes = [];
	for ( var i=0; i<num_panes; i++ )
	{
		if ( panes[i].isExpanded )
		{
			contents[i].v(true).o(0).w(contents[i].p().fc().w()-10);
		}
		offsets[i] = contents[i].h()/num_steps;
		ws[i] = contents[i].w()+10;
		h_nodes[i] = contents[i].ns();
	}
	$runinterval( 1, num_steps, 50, function(step)
	{
		var total_h = 0;
		for ( var i=0; i<num_panes; i++ )
		{
			var h = 0;
			if ( num_steps == step )
			{
				if ( !panes[i].isExpanded )
				{
					contents[i].v(false);
				}
				else
				{
					h = contents[i].h();
				}
			}
			else
			{
				h = Math.floor(offsets[i] * (panes[i].isExpanded?step:(num_steps-step)));					
			}
			if ( num_panes-1 == i && 1 < num_panes )
			{
				h = contents[i].h() - total_h;
			}
			total_h += h;
			h_nodes[i].h(h);
			contents[i].s('clip:rect(0 ?px ?px 0)'.embed(ws[i], h)).o(1/num_steps*(panes[i].isExpanded?step:(num_steps-step)));
		}
	});
}

ac.AccordionWidget.prototype.renderPanes = function()
{
	if ( null == this.renderingNode )
	{
		return;
	}
	var caller = this;
	var opt = this.view.options;
	this.renderingNode.t('');
	
	var renderContent = function(pane, node)
	{
		if ( !pane.isOpen )
		{
			pane.adapter.onOpen(pane, pane.index, node);
			pane.isOpen = true;
		}
	}
	
	$foreach( this.model.panes, function(pane, index)
	{
		pane.isOpen = false;
		var node = caller.renderingNode.a($$()).n('pane ? ?'.embed(0==index?'first':'', caller.model.panes.length-1==index?'last':''));
		// rendering title
		var tr = node.a($$()).n('title').a($$('table')).sa('cellPadding',0).sa('cellSpacing',0).a($$('tbody')).a($$('tr'));
		var content = node.a($$()).n('content').d(pane.isExpanded);
		content.a($$()).n('content-inner');
		if ( opt.animate )
		{
			content.pos(true).d(true).v(pane.isExpanded);
			// creating helper node
			var h_node = content.p().ia($$(), content).w(1);
		}
		var arrow = tr.a($$('td')).n('arrow');
		arrow.t('<img src="mm/i/theme/?/arrow-?.png" width="12" height="11"/>'.embed(fry.ui.theme.name, pane.isExpanded?'down':'right'));
		tr.e('click', function(evt)
		{
			evt.stop();
			$__tune.behavior.clearSelection();
			pane.isExpanded = !pane.isExpanded;
			arrow.fc().sa('src', 'mm/i/theme/?/arrow-?.png'.embed(fry.ui.theme.name, pane.isExpanded?'down':'right'));
			if ( pane.isExpanded )
			{
				renderContent(pane, content.fc());
			}
			if ( opt.onlyOneOpened )
			{
				// check to see if other pane is expanded
				var prev_pane = caller.model.panes[caller.activePaneIndex];
				if ( index != caller.activePaneIndex && prev_pane )
				{
					var prev_node = $(caller.renderingNode.$.childNodes.item(caller.activePaneIndex));
					var prev_content = prev_node.fc().ns();
					prev_pane.isExpanded = false;
					prev_node.fc().g('table:0/td:0/img').sa('src', 'mm/i/theme/?/arrow-right.png'.embed(fry.ui.theme.name));
					if ( opt.animate )
					{
						caller.animatePane([prev_pane, pane], [prev_content,content]);
					}
					else
					{
						prev_content.d(false);
					}
				}
				else
				{
					if ( opt.animate )
					{
						caller.animatePane([pane], [content]);
					}
				}
			}
			if ( opt.animate )
			{
				if ( !opt.onlyOneOpened )
				{
					caller.animatePane([pane], [content]);
				}
			}
			else
			{
				content.d(pane.isExpanded);
			}
			caller.activePaneIndex = index;
		});
		caller.view.renderTitle(pane, index, tr.a($$('td')).n('label'));
		if ( pane.isExpanded )
		{
			renderContent(pane, content.fc());
		}
	});
}

ac.AccordionWidget.prototype.collexpaPane = function(index, isExpanded)
{
	var pane = this.model.panes[index];
	if ( !pane )
	{
		return;
	}
	if ( pane.isExpanded == isExpanded )
	{
		return;
	}
	pane.isExpanded = isExpanded;
	if ( this.renderingNode && this.renderingNode.is() )
	{
		var node = $(this.renderingNode.$.childNodes.item(index));
		var content = node.fc().ns();
		if ( pane.isExpanded && !pane.isOpen )
		{
			if ( !pane.isOpen )
			{
				pane.adapter.onOpen(pane, pane.index, content.fc());
				pane.isOpen = true;
			}		
		}

		node.fc().g('table:0/td:0/img').sa('src', 'mm/i/theme/?/arrow-?.png'.embed(fry.ui.theme.name, pane.isExpanded?'down':'right'));
		if ( this.view.options.animate )
		{
			this.animatePane([pane], [content]);
		}
		else
		{
			content.d(pane.isExpanded);
		}		
	}
}

ac.AccordionWidget.prototype.collapsePane = function(index)
{
	this.collexpaPane(index, false);
}

ac.AccordionWidget.prototype.expandPane = function(index)
{
	this.collexpaPane(index, true);
}

ac.AccordionWidget.prototype.resizePane = function(index, height)
{
	if ( this.renderingNode && this.renderingNode.is() )
	{
		var node = $(this.renderingNode.$.childNodes.item(index));
		var content = node.fc().ns();
		content.h(height);
		content.s('clip:rect(0 ?px ?px 0)'.embed(content.w(), height));
		content.fc().h(height);
		content.ns().h(height);
		node = null;
		content = null;
	}	
}

ac.AccordionWidget.prototype.switchPane = function(index)
{
	if ( !this.model.panes[index] )
	{
		return;
	}
	if ( this.activePaneIndex == index )
	{
		return;
	}
	var prev_pane_index = this.activePaneIndex;
	if ( !this.model.panes[index].isExpanded )
	{
		if (this.view.options.onlyOneOpened)
		{
			if (this.model.panes[this.activePaneIndex] && this.model.panes[this.activePaneIndex].isExpanded)
			{
				this.collapsePane(this.activePaneIndex);				
			}
		}
		this.expandPane(index);
		this.activePaneIndex = index;
	}
}

ac.AccordionWidget.prototype.closePane = function(index)
{
	var pane = this.model.panes[index];
	if ( !pane.adapter.onClose(pane, index) )
	{
		return;
	}
	this.model.removePane(index);
	this.activePaneIndex = -1;
	if ( this.activePaneIndex == index )
	{
		if ( num_panes-1 == index )
		{
			this.activePaneIndex--;
		}
	}
	else if ( this.activePaneIndex > index )
	{
		this.activePaneIndex--;
	}
	this.renderPanes();
}

ac.AccordionWidget.prototype.addPane = function(pane, afterIndex)
{
	afterIndex = $getdef(afterIndex, 0 <= this.activePaneIndex ? this.activePaneIndex : 0);
	if ( this.model.panes[this.activePaneIndex] )
	{
		this.model.panes[this.activePaneIndex].isExpanded = false;
	}
	this.activePaneIndex = this.model.addPane(pane, afterIndex);
	this.renderPanes();
}




if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}