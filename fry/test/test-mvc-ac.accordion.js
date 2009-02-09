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


/* Customization, API example

// [1] we don't need to define our own model, since it's very simple and we can just use default `ac.AccordionWidgetModel`


// [2] we define our own controller extending default class `ac.AccordionWidgetController`

/*  ---------------------------------------------------------------- 
	ExampleController < ac.AccordionWidgetController
*/

$class('ExampleController < ac.AccordionWidgetController');

// following method is called when tabpane is rendering certain tab content
ExampleController.prototype.onOpen = function(pane, index, node)
{
	node.t('Hello, this is the #? accordion content pane with name <strong>?</strong>.<br/><br/>'.embed(index, pane.label));
	// this is a way how to call container method from within outer code
	node.a($crec('Collapse this pane', function(idCommand)
	{
		pane.model.widget.collapsePane(pane.index);
	}));
	node.a($$('br'));
	node.a($crec('Collapse this pane and expand after 2 seconds', function(idCommand)
	{
		pane.model.widget.collapsePane(pane.index);
		$runafter(2000, function(){pane.model.widget.expandPane(pane.index)});
	}));
	node.a($$('br'));
	node.a($crec('Remove this pane', function(idCommand)
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
}

// [3] we define our own view extending default class `ac.AccordionWidgetView`
// view actually affects final rendering of the widget (data of our model)

/*  ---------------------------------------------------------------- 
	ExampleView < ac.AccordionWidgetView
*/

$class('ExampleView < ac.AccordionWidgetView');


ExampleView.prototype.renderTitle = function(pane, index, node)
{
	// called when rendering pane's title, this is actually redundant since it copies behavior of default view method `ac.AccordionWidgetView>renderTitle`.
	node.t('?'.embed(pane.label));
}





// each dynamically loaded script must end with the following statements
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}