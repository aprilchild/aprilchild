/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.DropDownList widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/*  ---------------------------------------------------------------- 
	ac.DropDownListWidgetModel < ac.ListWidgetModel
*/

$class('ac.DropDownListWidgetModel < ac.ListWidgetModel');


ac.DropDownListWidgetModel.prototype.addItem = function(item, index)
{
	if ( 'object' != typeof item )
	{
		item = {key:item, value:item, index:-1};
	}
	return $call(this, 'ac.ListWidgetModel.addItem', item, index);
}

/*  ---------------------------------------------------------------- 
	ac.DropDownListWidgetView < ac.WidgetView
*/
$class('ac.DropDownListWidgetView < ac.WidgetView',
{
	construct:function()
	{
		this.options.width = $getdef(this.options.width, 160);
		this.options.isWritable = $getdef(this.options.isWritable, true);
	}
});

ac.DropDownListWidgetView.prototype.renderOptionItem = function(item, node)
{
	node.t(item);
}

ac.DropDownListWidgetView.prototype.renderValueItem = function(item, node)
{
	node.t(item);
}

/*  ---------------------------------------------------------------- 
	ac.DropDownListWidgetController < ac.WidgetController
*/
$class('ac.DropDownListWidgetController < ac.WidgetController');

ac.DropDownListWidgetController.prototype.onItemSelect = function(item)
{
}

/*  ---------------------------------------------------------------- 
	ac.DropDownListWidget < ac.ListWidget
*/
$class('ac.DropDownListWidget < ac.ListWidget',
{
	construct:function()
	{
		this.nodeOptions = null;
	}
});

ac.DropDownListWidget.prototype.onKeyPress = function(evt)
{
	$__tune.behavior.clearSelection();
	if ( !this.nodeOptions )
	{
		return;
	}
	evt.stop();
	var caller = this;
	var item = this.getSelection();
	var is_writable = this.view.options.isWritable;
	switch ( evt.key )
	{
		case evt.KEY_ARR_UP: {} case evt.KEY_ARR_DOWN:
		{
			is_up = evt.key == evt.KEY_ARR_UP;
			if ( !item )
			{
				item = this.model.items[0];
			}
			else
			{
				var index = item.index + (is_up ? -1:1);
				item = this.model.items[index];
			}
			if ( !item )
			{
				return;
			}
			this.selection = item;
			this.renderOptionItemHover(item, $(this.nodeOptions.$.childNodes.item(item.index)));
		};break;
		case evt.KEY_ENTER:{} case evt.KEY_ARR_RIGHT:
		{
			if ( item )
			{
				if ( is_writable )
				{
					var input = this.renderingNode.g('td:1/input:0').$;
					input.value = item.value;
					input.focus();
					input.select();
				}
				else
				{
					this.view.renderValueItem(item, this.renderingNode.g('td:1/div:0').t(''));
				}
				this.hideOptions();
				if ( !is_writable || evt.KEY_ENTER != evt.key )
				{
					this.performSelect();
				}
			}
		};break;
		case evt.KEY_ESCAPE:
		{
			this.hideOptions();
		};break;
		default:
		{
			if ( !is_writable )
			{
				return;
			}
			$foreach (this.model.items, function(item, i, control)
			{
				if ( item.value.toUpperCase().charCodeAt(0) == evt.key )
				{
					caller.selection = item;
					caller.renderOptionItemHover(item, $(caller.nodeOptions.$.childNodes.item(item.index)));
					control.stop();
				}
			});
		};break;
	}
}

ac.DropDownListWidget.prototype.onFocus = function()
{
	if ( this.view.options.isWritable )
	{
		this.renderingNode.g('td:1/input:0').$.focus();
	}	
}

ac.DropDownListWidget.prototype.onBlur = function()
{
	this.hideOptions();
	if ( this.view.options.isWritable )
	{
		this.renderingNode.g('td:1/input:0').$.blur();
	}
}

ac.DropDownListWidget.prototype.performSelect = function()
{
	if ( this.view.options.isWritable )
	{
		var input = this.renderingNode.g('td:1/input:0').$;
		this.controller.onItemSelect(input.value);
	}
	else
	{
		this.controller.onItemSelect(this.selection);		
	}
}

ac.DropDownListWidget.prototype.render = function()
{
	this.selection = null;
	var caller = this;
	this.renderingNode = this.containerNode.a($$()).n('acw-dropdownlist ?'.embed(this.cssClassName)).w(this.view.options.width).h(19).pos(true);
	var td = this.renderingNode.a($$('table')).sa('cellSpacing',0).a($$('tbody')).a($$('tr')).a($$('td')).n('left').w(3);
	var td = td.p().a($$('td')).n('value').w(this.view.options.width-21);
	if ( this.view.options.isWritable )
	{
		var input = td.a($$('input')).sa('type', 'text').w(this.view.options.width-26);
		
		var selectNextItem = function(offset)
		{
			offset = offset || 1;
			var item = caller.getSelection();
			if ( !item || 'object' != typeof item )
			{
				item = caller.model.items[0];
			}
			else
			{
				var index = item.index + offset;
				if ( caller.model.items.length == index )
				{
					index = 0;
				}
				if ( 0 > index )
				{
					index = caller.model.items.length-1;
				}
				item = caller.model.items[index];
			}
			if ( !item )
			{
				return;
			}
			caller.selection = item;
			input.$.value = item.value;
			input.$.select();
		}
		
		input.e('focus', function(evt)
		{
			input.$.select();
		}).e('blur', function(evt)
		{
		}).e('click', function(evt)
		{
			input.$.select();
		}).e('keydown', function(evt)
		{
			evt.stop();
			input.$.focus();
			if ( $__tune.isSafari )
			{
				if ( 50 > fry.ui.util.getMillis() - ac.widget.lastPress.d )
				{
					return;
				}
				ac.widget.lastPress.d = fry.ui.util.getMillis();
			}
			switch ( evt.keyCode )
			{
				case evt.KEY_ARR_UP:
				{
					selectNextItem();
				};break;
				case evt.KEY_ARR_DOWN:
				{
					input.$.blur();
					caller.showOptions();				
				};break;
			}
		}).e('keyup', function(evt)
		{
			switch ( evt.keyCode )
			{
				case evt.KEY_ENTER:
				{
					input.$.blur();
					caller.selection = input.$.value;
					caller.performSelect();
				};break;
			}
		}).e('dblclick', function(evt)
		{
			selectNextItem();
			caller.performSelect();
		}).e('mousewheel', function(evt)
		{
			selectNextItem( 0 > evt.wheelDelta ? -1 : 1 );
		});
		if ( $__tune.isSafari )
		{
			// HACK: hiding input borders
			input.s('margin:0;height:19px');
			var w = caller.view.options.width;
			input.p().a($$()).w(w-24).h(1).pos(true).x(1).y(0).s('background:#777');
			input.p().a($$()).w(w-24).h(1).pos(true).x(1).y(1).s('background:#C7C7C7');
			input.p().a($$()).w(2).h(16).pos(true).x(1).y(2).s('background:#fff');
			input.p().a($$()).w(w-24).h(1).pos(true).x(1).y(18).s('background:#D8D8D8');
			input.p().a($$()).w(2).h(16).pos(true).x(w-27).y(2).s('background:#fff');
		}
	}
	else
	{
		var input = td.a($$()).w(this.view.options.width-23).h(13).s('overflow:hidden').e('click', function(evt)
		{
			evt.stop();
			caller.showOptions();
		});
	}
	var control = td.p().a($$('td')).n('control').w(18).e('click', function(evt)
	{
		evt.stop();
		if ( caller.nodeOptions )
		{
			caller.hideOptions();
		}
		else
		{
			caller.showOptions();			
		}
	});
	this.renderingNode.e('mouseover', function(evt)
	{
		ac.widget.focus(caller);
	})
}

ac.DropDownListWidget.prototype.hideOptions = function()
{
	if ( this.nodeOptions )
	{
		this.nodeOptions.rs();
		this.nodeOptions = null;
	}
}

ac.DropDownListWidget.prototype.renderOptionItemHover = function(item, node)
{
	$foreach ( node.p().$.childNodes, function(n)
	{
		$(n).n('item');
	})
	node.n('item selected');	
}

ac.DropDownListWidget.prototype.showOptions = function()
{
	this.hideOptions();
	ac.widget.focus(this);
	var caller = this;
	var options = this.view.options;
	var node = $().a($$()).n('acw-dropdownlist ? options'.embed(this.cssClassName)).w(options.width-2).s('overflow:scroll');
	node.sa('widget-ident', this.ident);
	var height = 0;
	$foreach ( this.model.items, function(item)
	{
		var node_i = node.a($$()).n('item ?'.embed(caller.selection==item?'selected':'')).e('mouseover', function(evt)
		{
			caller.renderOptionItemHover(item, node_i);
		}).e('click', function(evt)
		{
			evt.stop();
			caller.selection = item;
			if ( options.isWritable )
			{
				var input = caller.renderingNode.g('td:1/input:0').$;
				input.value = item.value;
				input.focus();
				input.select();
			}
			else
			{
				caller.view.renderValueItem(item, caller.renderingNode.g('td:1/div:0').t(''));
			}
			caller.hideOptions();
			caller.performSelect();
		});
		caller.view.renderOptionItem(item, node_i);
		height += node_i.h();
	});
	var pos = this.renderingNode.abspos();
	height += $__tune.ui.scrollbarWidth;
	if ( height > pos.y+fry.ui.info.page.height )
	{
		height = fry.ui.info.page.height - pos.y;
	}
	node.pos(true).x(pos.x+($__tune.isGecko?1:0)).y(pos.y+18).h(height).s('clip:rect(0 ?px ?px 0)'.embed(node.w()+2, height-$__tune.ui.scrollbarWidth+2));
	this.nodeOptions = node;
}



		
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}