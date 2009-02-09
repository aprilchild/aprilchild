/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.FileChooser widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/* Customization, API example

// [1] we define our own model extending default class `ac.FileChooserWidgetModel`

/*  ---------------------------------------------------------------- 
	ExampleModel < ac.FileChooserWidgetModel
*/
$class('ExampleModel < ac.FileChooserWidgetModel');

// [1.A] we need to override the `getVolumes` method of the original class, this is the list of volumes displayed within the left pane
ExampleModel.prototype.getVolumes = function()
{
	// let's declare couple of volumes
	var volumes = [];
	var num_volumes = 4+Math.floor(7*Math.random());
	for ( var i=0; i<num_volumes; i++ )
	{
		// each volume starts with root element
		var root = $new(ACElement);
		root.isCollection = true;
		root.setState(root.STATE_WILL_LOAD);
		root.properties.label = 'Volume ?'.embed(i+1);
		root.properties.size = 0;
		root.properties.dateCreated = 0;

		var volume = 
		{
			rootElement:root,
			lastElement:null	// you can specify default active volume element if you want
		}
		// for convenience is also allowed just to return root volume element in volumes array. `volumes.push(root)`.
		volumes.push(volume);
	}
	return volumes;
}	


// [1.B] we need to override the `loadElements` method of the original class, this is where our own volume data need to be acquired
ExampleModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
	// let's create some fake data, normally this would be the place where you call remote server for real data
	var alphabet = 'AFGHI.odvB.xmlCFry DQ.pngPNVMDIaskJavaScriptdrepo OWP.SDFrameworkEJQRSTU v.1.0VW3199803NO XYKLMP343l kfjdaorp.eweri Z012589absc.gif ADd eBiofghijkl.mst uvwxnopq.html';
	
	// pretend, that in some minor cases, data could not been retrieved
	if ( 0.1 > Math.random() )
	{
		callbackOnError('Could not load elements. Random error code would be '+Math.random());
		return;
	}

	var num_elements = 2 + Math.floor( 30*Math.random() );
	for ( var i=0; i<num_elements; i++ )
	{
		// appending new child object
		var child_elem = acElem.appendChild($new(ACElement));
		// randomly define whether the object is a collection
		child_elem.isCollection = 0.2 > Math.random();
		if ( child_elem.isCollection )
		{
			// if so, set the state as `STATE_WILL_LOAD` so that when expanded, new trip to this method is performed (recursion)
			child_elem.setState(child_elem.STATE_WILL_LOAD);
		}
		child_elem.properties = 
		{
			label: alphabet.substr(Math.floor(Math.random()*(alphabet.length-12)), 2+Math.floor(Math.random()*10)),
			size: child_elem.isCollection ? 0 : Math.floor(50000*Math.random()),
			dateCreated: child_elem.isCollection ? 0 : fry.calendar.util.getUnixTimestamp() - (-100000 + Math.floor(2000000*Math.random()))
		};
	}
	// we have finished appending new child objects, let's commit the operation using `callbackOnSuccess` callback.
	callbackOnSuccess();
}

ExampleModel.prototype.getSearchHistoryValues = function()
{
	return ['Januli', 'Tomuli', 'Fry', 'frame'];
}


// [2] we define our own controller extending default class `ac.FileChooserWidgetController`

/*  ---------------------------------------------------------------- 
	ExampleController < ac.FileChooserWidgetController
*/

$class('ExampleController < ac.FileChooserWidgetController');

ExampleController.prototype.onSearchValue = function(inputValue)
{
	$('result').a($$()).t('Now searching for `?`'.embed(inputValue));
}

// [3] we define our own view extending default class `ac.FileChooserWidgetView`
// view actually affects final rendering of the widget (data of our model)

/*  ---------------------------------------------------------------- 
	ExampleView < ac.FileChooserWidgetView
*/

$class('ExampleView < ac.FileChooserWidgetView');

ExampleView.prototype.renderElementInRow = function(acElem, rowData)
{
	// rowdata contains prepared data structure we must fill with our values with any fancy formatting we want...
	with ( acElem.properties )
	{
		rowData['label'] = label;
		rowData['size'] = 0 == size ? '--' : $_(size).surroundTag('strong');
		rowData['dateCreated'] = fry.calendar.format.dateTime(dateCreated);
	}
	if (!acElem.isCollection && this.options.actAsSaveDialog)
	{
		rowData['label'] = rowData['label'].surroundTag('em');
	}
}

// called when rendering volume in the left pane, acElem is the root element of the volume
ExampleView.prototype.renderVolume = function(acElem, node)
{
	node.t(acElem.properties.label);
}

// this is what is rendered in case of expanding full detail of the non-collection element
ExampleView.prototype.renderElementDetail = function(acElem, node)
{
	with ( acElem.properties )
	{
		var ht = '<h1>'+label+'</h1>';
		// rest of the properties is going to be rendered into a table, notice call for locale keywords
		ht += '<table class="browser-info" cellspacing="0" cellpadding="0">'
		ht += '<tr><td class="key">?</td><td class="value">? ?</td></tr>'.embed(client.lc.get('lU_size'), size, client.lc.get('l_bytes'));
		ht += '<tr><td class="key">ID</td><td class="value" style="font-size:9px">?</td></tr>'.embed(acElem.id);
		ht += '</table>';
		node.t(ht);
	}
}




// each dynamically loaded script must end with the following statements
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}