/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Tree widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/* Customization, API example

// [1] we define our own model extending default class `ac.TreeWidgetModel`

/*  ---------------------------------------------------------------- 
	ExampleModel < ac.TreeWidgetModel
*/

$class('ExampleModel < ac.TreeWidgetModel');

// [1.A] we need to override the `loadElements` method of the original class, this is where our own data need to be acquired
ExampleModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
	// let's create some fake data, normally this would be the place where you call remote server for real data
	var alphabet = 'AFGHI.odvB.xmlCFry DQ.pngPNVMDIaskJavaScriptdrepo OWP.SDFrameworkEJQRSTU v.1.0VW3199803NO XYKLMP343l kfjdaorp.eweri Z012589absc.gif ADd eBiofghijkl.mst uvwxnopq.html';
	

	// getting nested level information
	var level = 0;
	var tmpElem = acElem;
	while ( null != tmpElem.parentElement )
	{
		level ++;
		tmpElem = tmpElem.parentElement;
	}
	
	// we do not allow more than four levels in this simulation
	if ( 3 < level )
	{
		callbackOnSuccess();
		return;
	}

	// let's simulate some pause usually caused by trip to server
	$runafter( Math.floor(2000*Math.random()), function()
	{

		// pretend, that in some minor cases, data could not been retrieved
		if ( 0.2 > Math.random() )
		{
			callbackOnError('Could not load elements. Random error code would be '+Math.random());
			return;
		}

		var num_elements = Math.floor( 14*Math.random() );
		for ( var i=0; i<num_elements; i++ )
		{
			// appending new child object
			var child_elem = acElem.appendChild($new(ACElement));
			// randomly define whether the object is a collection
			child_elem.isCollection = 0.2 > Math.random();
			if ( child_elem.isCollection )
			{
				// now let's assume, some elements are expanded yielding in immediate load (calling this method)
				// some will remain collapsed and the method is called upon user action (expanding the node)
				if ( 0.5 > Math.random() )
				{
					child_elem.setState(child_elem.STATE_WILL_LOAD|child_elem.STATE_EXPANDED);
				}
				else
				{
					child_elem.setState(child_elem.STATE_WILL_LOAD|child_elem.STATE_COLLAPSED);
				}
			}
		
			// creating random label
			child_elem.properties.label = alphabet.substr(Math.floor(Math.random()*(alphabet.length-12)), 2+Math.floor(Math.random()*10));
			// creating size information
			child_elem.properties.size = child_elem.isCollection ? 0 : Math.floor(50000*Math.random());
			// creating version information
			child_elem.properties.version = 1+Math.floor(20*Math.random());
		
		}
		// we have finished appending new child objects, let's commit the operation using `callbackOnSuccess` callback.
		callbackOnSuccess();
	});
}

// [2] we define our own controller extending default class `ac.TreeWidgetController`

/*  ---------------------------------------------------------------- 
	ExampleController < ac.TreeWidgetController
*/
$class('ExampleController < ac.TreeWidgetController');


// [3] we define our own view extending default class `ac.TreeWidgetView`
// view actually affects final rendering of the widget (data of our model)

/*  ---------------------------------------------------------------- 
	ExampleView < ac.TreeWidgetView
*/
$class('ExampleView < ac.TreeWidgetView');


ExampleView.prototype.renderElement = function(acElem, node)
{
	// called when rendering an element
	with( acElem.properties )
	{
		// we'll render collections in bold gray - defined in CSS
		if ( acElem.isCollection )
		{
			node.t(label.surroundTag('strong'));
		}
		else
		{
			node.t(label);			
		}
	}
}





// each dynamically loaded script must end with the following statements
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}