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


/* Customization, API example

// [1] we skip defining our own model since window widget does not require any model data - we use default ac.WindowWidgetModel



// [2] we define our own controller extending default class `ac.WindowWidgetController`

/*  ---------------------------------------------------------------- 
	ExampleController < ac.WindowWidgetController
*/

$class('ExampleController < ac.WindowWidgetController');


// [3] we define our own view extending default class `ac.WindowWidgetView`
// view actually affects final rendering of the widget (data of our model)

/*  ---------------------------------------------------------------- 
	ExampleView < ac.WindowWidgetView
*/

$class('ExampleView < ac.WindowWidgetView');

ExampleView.prototype.onRenderTitle = function(node, params)
{
	params = params || 'Title ?'.embed(Math.random());
	node.t(params);
}

ExampleView.prototype.onRenderContent = function(node, params)
{
	var caller = this;
	if ( 'undefined' != typeof params )
	{
		node.t('Cleared: ?<br/>'.embed(params));
		node.a($crec('Clear window content', function(idCommand)
		{
			$remc(idCommand);
			caller.widget.setContent('B message');
		}));
		return;
	}
	node.t('Random window content ?<br/>'.embed(Math.random()));
	node.a($crec('Close this window', function(idCommand)
	{
		// we can safely remove the command via `$remc` since the tab is closed anyway 
		$remc(idCommand);
		caller.widget.close();
	})).p().a($$('br'));;
	node.a($crec('Make window modal', function(idCommand)
	{
		caller.widget.setModal(true);
	})).p().a($$('br'));
	node.a($crec('Make window modaless', function(idCommand)
	{
		caller.widget.setModal(false);
	})).p().a($$('br'));
	node.a($crec('Make window scrollable', function(idCommand)
	{
		caller.widget.setScrollable(true);
	})).p().a($$('br'));
	node.a($crec('Make window non-scrollable', function(idCommand)
	{
		caller.widget.setScrollable(false);
	})).p().a($$('br'));
	node.a($crec('Clear window content', function(idCommand)
	{
		$remc(idCommand);
		caller.widget.setContent('A message');
	})).p().a($$('br'));
	node.a($crec('Set random title', function(idCommand)
	{
		caller.widget.setTitle('Title ?'.embed(Math.random()));
	})).p().a($$('br'));
	node.a($crec('Set random status', function(idCommand)
	{
		caller.widget.setStatus('Status ?'.embed(Math.random()));
	})).p().a($$('br'));
	
	$runinterval(1, 100, 500+5000*Math.random(), function()
	{
		node.a($$()).t('Random line ?'.embed(Math.random()));
	});
}

ExampleView.prototype.onRenderStatus = function(node, params)
{
	params = params || 'First random status ?'.embed(Math.random());
	node.t(params);
}




// each dynamically loaded script must end with the following statements
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}