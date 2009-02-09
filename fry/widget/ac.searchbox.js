/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.SearchBox widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/*  ---------------------------------------------------------------- 
	ac.SearchBoxWidgetModel < ac.WidgetModel
*/
$class('ac.SearchBoxWidgetModel < ac.WidgetModel',
{
	construct:function(recentSearches, suggestions)
	{
		this.suggestions = suggestions || [];
		if ( !ac.MenuWidget )
		{
			throw new FryException(201, 'widget/searchbox: fatal, menu widget not included.');
		}
		this.createRecentSearchesModel(recentSearches);
	}
});

ac.SearchBoxWidgetModel.prototype.createRecentSearchesModel = function(recentSearches)
{
	var caller = this;
	var root = $new(ACElement);
	
	var child = root.appendChild($new(ACElement));
	child.properties.label = client.lc.get('mi_recent_searches');
	child.properties.menu = { adapter:
	{
		isActive:function()
		{
			return false;
		}
	}}

	child = root.appendChild($new(ACElement));
	child.properties.separator = true;

	$foreach ( recentSearches, function(value)
	{
		var child = $new(ACElement);
		child.properties.label = value;
		root.appendChild(child);
	});
	
	child = root.appendChild($new(ACElement));
	child.properties.separator = true;
	
	child = root.appendChild($new(ACElement));
	child.properties.label = client.lc.get('mi_clear_recent_searches');
	child.properties.menu = { adapter:
	{
		isActive:function()
		{
			return 4 < root.elements.length;
		},
		performAction:function()
		{
			var num = root.elements.length-2;
			for ( var i=2; i<num; i++ )
			{
				root.removeChild(root.elements[2]);
			}
			caller.widget.showRecentSearches();
		},
		getKeyCode:function()
		{
			return 'shift+R';
		}
	}}
	this.recentSearchesModel = $new(ac.MenuWidgetModel, root);
	this.rootRecentSearchesElement = root;
}

ac.SearchBoxWidgetModel.prototype.addRecentSearch = function(value)
{
	var root = this.rootRecentSearchesElement;
	var child = $new(ACElement);
	child.properties.label = value;
	var num = root.elements.length;
	for ( var i=2; i<num-2; i++ )
	{
		if ( value == root.elements[i].properties.label )
		{
			return;
		}
	}
	if ( num - 3 > this.widget.view.options.numRecentSearches )
	{
		root.removeChild(root.elements[2]);
		num--;
	}
	root.insertBefore(child, root.elements[num-2]);	
}

ac.SearchBoxWidgetModel.prototype.exportRecentSearches = function()
{
	var rs = [];
	var root = this.rootRecentSearchesElement;
	var num = root.elements.length;
	for ( var i=2; i<num-2; i++ )
	{
		rs.push(root.elements[i].properties.label);
	}
	return rs;
}

ac.SearchBoxWidgetModel.prototype.loadSuggestions = function(inputValue, callbackOk, callbackError)
{
}

/*  ---------------------------------------------------------------- 
	ac.SearchBoxWidgetView < ac.WidgetView
*/
$class('ac.SearchBoxWidgetView < ac.WidgetView',
{
	construct:function()
	{
		if ( 'undefined' == typeof this.options.width )
		{
			this.options.width = 140;
		}
		if ( 'undefined' == typeof this.options.numRecentSearches )
		{
			this.options.numRecentSearches = 5;
		}
	}
});

ac.SearchBoxWidgetView.prototype.renderSuggestionItem = function(item, node)
{
	node.t(item.label);
}

ac.SearchBoxWidgetView.prototype.renderRecentSearchItem = function(item, node)
{
	node.t(item.label);
}

/*  ---------------------------------------------------------------- 
	ac.SearchBoxWidgetController < ac.WidgetController
*/
$class('ac.SearchBoxWidgetController < ac.WidgetController');

// called when clearing result, set to false and no clearing is allowed
ac.SearchBoxWidgetController.prototype.onInputValueCleared = function(inputValue)
{
	return true;
}
// called when selecting value from resultset, set to false to disable such selection
ac.SearchBoxWidgetController.prototype.onSuggestionItemChosen = function(item)
{
	return true;
}
// called when search value is ready to be put into search
ac.SearchBoxWidgetController.prototype.onSearchValue = function(inputValue)
{
}

// called when recent search history changes
ac.SearchBoxWidgetController.prototype.onRecentSearchesChanged = function(searches)
{
}

/*  ---------------------------------------------------------------- 
	ac.SearchBoxWidget < ac.Widget
*/
$class('ac.SearchBoxWidget < ac.Widget',
{
	construct:function()
	{
	    this.properties.recentSearchesShown = false;
		this.properties.suggestionsShown = false;
		this.recentSearchesMenu = null;
		this.lastValue = '';
	}
});

ac.SearchBoxWidget.prototype.onFocus = function()
{
	this.renderingNode.g('table/tr:0/td:1/input').$.focus();
}

ac.SearchBoxWidget.prototype.onBlur = function()
{
	this.renderingNode.g('table/tr:0/td:1/input').$.blur();
	if ( this.recentSearchesMenu )
	{
		this.recentSearchesMenu.hide();
	}
}

ac.SearchBoxWidget.prototype.getValue = function()
{
	return this.renderingNode.g('table/tr:0/td:1/input').$.value;	
}

ac.SearchBoxWidget.prototype.setValue = function(value, setFocused)
{
	this.renderingNode.g('table/tr:0/td:1/input').$.value = value;
	this.controller.onSearchValue(value);
	if ( setFocused )
	{
		ac.widget.focus(this);
	}
}

ac.SearchBoxWidget.prototype.runSearch = function(value)
{
	this.model.addRecentSearch(value);
	this.hideRecentSearches();
	this.hideSuggestions();
	this.controller.onRecentSearchesChanged(this.model.exportRecentSearches());
	this.controller.onSearchValue(value);
}

ac.SearchBoxWidget.prototype.render = function()
{
	var caller = this;
	this.renderingNode = this.containerNode.a($$()).n('acw-searchbox ?'.embed(this.cssClassName)).h(19).w(this.view.options.width).pos(true);
	var td = this.renderingNode.a($$('table')).sa('cellSpacing',0).a($$('tbody')).a($$('tr')).a($$('td')).n('recent').e('click', function(evt)
	{
		evt.stop();
		caller.showRecentSearches();
	});
	var input = td.p().a($$('td')).n('value').a($$('input')).sa('type', 'text').w(this.view.options.width-45);
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
		switch ( evt.keyCode )
		{
			case evt.KEY_ARR_UP:
			{
				input.$.blur();
				caller.showRecentSearches();				
			};break;
			case evt.KEY_ARR_DOWN:
			{
				caller.selectFromSuggestions();
			};break;
		}
	}).e('keyup', function(evt)
	{
		switch ( evt.keyCode )
		{
			case evt.KEY_ENTER:
			{
				input.$.blur();
				caller.runSearch(input.$.value);
			};break;
			default:
			{
				if ( caller.lastValue != input.$.value )
				{
					caller.lastValue = input.$.value;
					caller.showSuggestions(input.$.value);			
				}
			};break;
		}
	});
	if ( $__tune.isSafari )
	{
		// HACK: hiding input borders
		input.s('margin:0;height:19px');
		var w = caller.view.options.width;
		input.p().a($$()).w(w-40).h(1).pos(true).x(24).y(0).s('background:#777');
		input.p().a($$()).w(w-40).h(1).pos(true).x(24).y(1).s('background:#C7C7C7');
		input.p().a($$()).w(2).h(16).pos(true).x(24).y(2).s('background:#fff');
		input.p().a($$()).w(w-40).h(1).pos(true).x(24).y(18).s('background:#D8D8D8');
		input.p().a($$()).w(2).h(16).pos(true).x(w-23).y(2).s('background:#fff');
	}
	td.p().a($$('td')).n('clear').e('click', function(evt)
	{
		if ( caller.controller.onInputValueCleared(input.$.value) )
		{
			input.$.value = '';
			input.$.focus();
		}
	});
}

ac.SearchBoxWidget.prototype.selectFromSuggestions = function(value)
{
	
}

ac.SearchBoxWidget.prototype.hideSuggestions = function(value)
{
	
}

ac.SearchBoxWidget.prototype.showSuggestions = function(value)
{
	this.model.loadSuggestions(value, function(rs)
	{
		// dataset loaded
	},
	function(e)
	{
		// error
	});
}

ac.SearchBoxWidget.prototype.hideRecentSearches = function()
{
	if ( this.recentSearchesMenu )
	{
		this.recentSearchesMenu.hide();		
	}
}

ac.SearchBoxWidget.prototype.showRecentSearches = function()
{
	if ( !ac.MenuWidget )
	{
		throw new FryException(100, 'widget/searchbox: fatal, menu widget not included.')
	}
	if ( null == this.recentSearchesMenu )
	{
		// creating menu widget
		var caller = this;
		$class('ac.SearchBoxWidgetRecentSearchesView < ac.MenuWidgetView');
		ac.SearchBoxWidgetRecentSearchesView.prototype.renderMenuItem = function(acElem, node, isTopMenuBar)
		{
			node.t(acElem.properties.label);
		}
		$class('ac.SearchBoxWidgetRecentSearchesController < ac.MenuWidgetController');

		ac.SearchBoxWidgetRecentSearchesController.prototype.isSeparator = function(acElem)
		{
			return acElem.properties.separator;
		}

		ac.SearchBoxWidgetRecentSearchesController.prototype.performAction = function(acElem)
		{
			var input = caller.renderingNode.g('table/tr:0/td:1/input').$;
			input.value = acElem.properties.label;
			input.focus();
			input.select();
		}
		this.recentSearchesMenu = $new(ac.MenuWidget, this.model.recentSearchesModel, $new(ac.SearchBoxWidgetRecentSearchesView, {startsWithTopMenuBar:false, menuItemWidth:280}), $new(ac.SearchBoxWidgetRecentSearchesController), this);
		this.renderingNode.g('td:0').a($$()).pos(true).y(20);
		var pos = this.renderingNode.g('td:0').abspos();
		if ( pos.x + 280 > fry.ui.info.page.width )
		{
			this.renderingNode.g('td:0').fc().x(fry.ui.info.page.width-pos.x-290);
		}
	}
	else
	{
		this.recentSearchesMenu.hide();
	}
	this.recentSearchesMenu.show(this.renderingNode.g('td:0').fc());
	ac.widget.focus(this.recentSearchesMenu);
}


		
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}