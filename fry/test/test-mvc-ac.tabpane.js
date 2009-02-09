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

/* Customization, API example

// [1] we don't need to define our own model, since it's very simple and we can just use default `ac.TabPaneWidgetModel`


// [2] we define our own controller extending default class `ac.TabPaneWidgetController`

/*  ---------------------------------------------------------------- 
	ExampleController < ac.TabPaneWidgetController
*/

$class('ExampleController < ac.TabPaneWidgetController');

// following method is called when tabpane is rendering certain tab content
ExampleController.prototype.onOpen = function(pane, index, node)
{
	node.s('margin:8px');
	node.t('Hello, this is the #? tab content with name <strong>?</strong>.<br/><br/>'.embed(index, pane.label));
	// this is a way how to call container method from within outer code
	node.a($crec('Close this tab', function(idCommand)
	{
		// we can safely remove the command via `$remc` since the tab is closed anyway 
		$remc(idCommand);
		pane.model.widget.closePane(pane.index);
	}));
	node.a($$('br'));
	node.a($crec('Add new after this one', function(idCommand)
	{
		pane.model.widget.addPane({label:'New pane', adapter:$new(ExampleController)}, pane.index+1);
	}));
	node.a($$('br'));
	node.a($$('br'));
	node.a($crec('Hide/Destroy tabpane', function(idCommand)
	{
		// we can safely remove the command via `$remc` since the tab is closed anyway 
		$remc(idCommand);
		pane.model.widget.hide();
	}));
}

// [3] we define our own view extending default class `ac.TabPaneWidgetView`
// view actually affects final rendering of the widget (data of our model)

/*  ---------------------------------------------------------------- 
	ExampleView < ac.TabPaneWidgetView
*/

$class('ExampleView < ac.TabPaneWidgetView');


ExampleView.prototype.renderTitle = function(pane, index, node)
{
	// called when rendering pane's title, this is actually redundant since it copies behavior of default view method `ac.TabPaneWidgetView>renderTitle`.
	node.t('?'.embed(pane.label));
}

ExampleView.prototype.renderEmptyPane = function(node)
{
	// called when all tab panes are closed to render something instead.
	node.t('<h2>The TabPane is empty.</h2>').s('padding:8px');
	var caller = this;
	node.a($crec('Open new tab', function(idCommand)
	{
		$remc(idCommand);
		caller.widget.addPane({label:'New pane', adapter:$new(ExampleController)});
	}));
}




// each dynamically loaded script must end with the following statements
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}