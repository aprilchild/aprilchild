/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Menu widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/* Customization, API example

// [1] we define our own model extending default class `ac.MenuWidgetModel`

/*  ---------------------------------------------------------------- 
	ExampleModel < ac.MenuWidgetModel
*/
$class('ExampleModel < ac.MenuWidgetModel');

// [1.A] we need to override the `loadElements` method of the original class, this is where our own data need to be acquired
ExampleModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
	// let's create some fake data, normally this would be the place where you call remote server for real data
	var alphabet = 'AFGHI odvB xmlCFry DQ pngPNVMDIaskJavaScriptdrepo OWP SDFrameworkEJQRSTU v 1 0VW3199803NO XYKLMP343l kfjdaorp eweri Z012589absc gif ADd eBiofghijkl mst uvwxnopq html';
	var keys = 'ABSCDEFGHIJKLMNOPQRSTUVWXYZ';
	// pretend, that in some minor cases, data could not been retrieved
	if ( 0.05 > Math.random() )
	{
		callbackOnError('Could not load elements. Random error code would be '+Math.random());
		return;
	}

	var num_elements = 2 + Math.floor( 10*Math.random() );
	for ( var i=0; i<num_elements; i++ )
	{
		// appending new child object
		var child_elem = $new(ACElement);
		// randomly define whether the object is a collection (submenu)
		child_elem.isCollection = 0.4 > Math.random();
		if ( child_elem.isCollection )
		{
			// if so, set the state as `STATE_WILL_LOAD` so that when expanded, new trip to this method is performed (recursion)
			child_elem.setState(child_elem.STATE_WILL_LOAD);
		}
		
		// creating random label
		child_elem.properties.label = '??'.embed(child_elem.isCollection ? 'M' : 'Item ', alphabet.substr(Math.floor(Math.random()*(alphabet.length-12)), 2+Math.floor(Math.random()*10)));		
		// in some rare cases, item is not active
		child_elem.properties.isActive = 0.1 < Math.random();
		// not event visible
		child_elem.properties.isVisible = 0.1 < Math.random();
		// and maybe separator
		child_elem.properties.isSeparator = 0.8 < Math.random();
		if ( 0.4 > Math.random() )
		{
			// adding some key shortcut
			child_elem.properties.key = ['?+Shift'.embed(keys.charCodeAt(Math.floor(25*Math.random()))), 'global'];
		}
		// !IMPORTANT NOTICE!
		// due widget design - we must call appendChild AFTER defining key shotcut, otherwise it wouldn't get (the shortcut) registered and activated!
		acElem.appendChild(child_elem);
	}
	// we have finished appending new child objects, let's commit the operation using `callbackOnSuccess` callback.
	callbackOnSuccess();
}

// [2] we define our own controller extending default class `ac.MenuWidgetController`

/*  ---------------------------------------------------------------- 
	ExampleController < ac.MenuWidgetController
*/

$class('ExampleController < ac.MenuWidgetController');

ExampleController.prototype.isActive = function(acElem)
{
	return acElem.properties.isActive;
}

ExampleController.prototype.isVisible = function(acElem)
{
	return acElem.properties.isVisible;
}

ExampleController.prototype.isSeparator = function(acElem)
{
	return acElem.properties.isSeparator;
}

ExampleController.prototype.getKeyCode = function(acElem)
{
	return acElem.properties.key || null;
}

ExampleController.prototype.performAction = function(acElem)
{
	alert('You have just activated ? with #?.'.embed(acElem.properties.label, acElem.id));
}


// [3] we define our own view extending default class `ac.MenuWidgetView`
// view actually affects final rendering of the widget (data of our model)

/*  ---------------------------------------------------------------- 
	ExampleView < ac.MenuWidgetView
*/

$class('ExampleView < ac.MenuWidgetView');


ExampleView.prototype.renderMenuItem = function(acElem, node, isTopMenuBar)
{
	node.t(acElem.properties.label);
}






// each dynamically loaded script must end with the following statements
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}