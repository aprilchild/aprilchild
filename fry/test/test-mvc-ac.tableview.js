/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.TableView widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/* Customization, API example

// [1] we define our own model extending default class `ac.TableViewWidgetModel`

/*  ---------------------------------------------------------------- 
	ExampleModel < ac.TableViewWidgetModel
*/
$class('ExampleModel < ac.TableViewWidgetModel');

// [1.A] we need to override the `loadElements` method of the original class, this is where our own data need to be acquired
ExampleModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
	// let's create some fake data, normally this would be the place where you call remote server for real data
	// adding list data consists of appending new elements into acElem object passed as a paremeter
	var alphabet = 'AFGHI.odvB.xmlCFry DQ.pngPNVMDIaskJavaScriptdrepo OWP.SDFrameworkEJQRSTU v.1.0VW3199803NO XYKLMP343l kfjdaorp.eweri Z012589absc.gif ADd eBiofghijkl.mst uvwxnopq.html';
	
	// pretend, that in some minor cases, data could not been retrieved
	if ( 0.2 > Math.random() )
	{
		callbackOnError('Could not load elements. Random error code would be '+Math.random());
		return;
	}

	var num_elements = 3 + Math.floor( 160*Math.random() );
//	var num_elements = 19;
	for ( var i=0; i<num_elements; i++ )
	{
		// appending new child object
		var child_elem = acElem.appendChild($new(ACElement));
		child_elem.properties = 
		{
			label: alphabet.substr(Math.floor(Math.random()*(alphabet.length-12)), 2+Math.floor(Math.random()*10)),
			size: Math.floor(50000*Math.random()),
			dateCreated: fry.calendar.util.getUnixTimestamp() - (-100000 + Math.floor(2000000*Math.random())),
			version: 1+Math.floor(100*Math.random())
		};
	}
	// we have finished appending new child objects, let's commit the operation using `callbackOnSuccess` callback.
	callbackOnSuccess();
}

// [2] we define our own controller extending default class `ac.TableViewWidgetController`

/*  ---------------------------------------------------------------- 
	ExampleController < ac.TableViewWidgetController
*/

$class('ExampleController < ac.TableViewWidgetController');

ExampleController.prototype.allowMultipleSelection = function()
{
	// sometimes multiple selection is supported, sometimes not
	return 0.5 > Math.random();
}

ExampleController.prototype.onGetElementValueForEditing = function(acElem, colId)
{
	return acElem.properties[colId];
}

ExampleController.prototype.onElementValueEdited = function(acElem, colId, value, callbackOk, callbackError)
{
	// this is the place to call for remote operation causing actual rename
	if ( 'label' != colId )
	{
		// we will not update other column than label, however you are not limited to, just follow the code after this condition to see how it's done...
		alert('Changing directly without remote backend operation...');
		acElem.properties[colId] = value;
		callbackOk();
		return;
	}
	var was_canceled = false;
	// we call the helper function to display alert window
	var win = alertUser('Renaming...', 'Renaming ? to ?<br/>Please wait.'.embed(acElem.properties.label, value), function()
	{
		// canceled
		was_canceled = true;
	});
	// let's simulate remote operation ($rpost( ... ))
	// now sleep for a while, this is where you operation is running and waiting for response
	$runafter(2000, function()
	{
		if ( !was_canceled )
		{
			win.close();
			acElem.properties.label = value;
			callbackOk();
		}
		else
		{
			callbackError();
		}
		ac.widget.focus(this.widget);
	});	
}

ExampleController.prototype.onElementValueCanceled = function(acElem, colId, value)
{
}

ExampleController.prototype.onGetElementValueEditor = function(acElem, colId)
{
	// we will return default text editor for both label and version columns. you can easily create your own custom editors such as calendar, color picker...
	return $new(ac.ValueEditorText);
}



// [3] we define our own view extending default class `ac.TableViewWidgetView`
// view actually affects final rendering of the widget (data of our model)

/*  ---------------------------------------------------------------- 
	ExampleView < ac.TableViewWidgetView
*/

$class('ExampleView < ac.TableViewWidgetView');

ExampleView.prototype.renderElementInRow = function(acElem, rowData)
{
	// rowdata contains prepared data structure we must fill with our values with any fancy formatting we want...
	with ( acElem.properties )
	{
		rowData['label'] = '&nbsp; ?'.embed(label);
		rowData['size'] = 0 == size ? '--' : $_(size).surroundTag('strong');
		rowData['dateCreated'] = fry.calendar.format.dateTime(dateCreated);
		rowData['version'] = version;
	}
}

ExampleView.prototype.renderDetail = function(acElem, node)
{
	var r_node = node.a($$()).s('margin:8px');
	r_node.t('<h3>Detail of ?</h3>'.embed(acElem.properties.label));
	r_node.at('<p><strong>Version</strong> ?</p>'.embed(acElem.properties.version));
}


ExampleView.prototype.renderElementLoadError = function(listContainer, error, node)
{
	alertUser('An error occured', 'Error while loading.<p>Message: ?</p>'.embed(error), function(){});
}

// [4] let's define a helper function for showing elements operation alerts - used to inform user of copying and such..
function alertUser(title, msg, callbackOnClose)
{
	// let's define window view if not previously defined
	if ( 'undefined' == typeof View )
	{
		$class('View < ac.WindowWidgetView');
	}
	View.prototype.onRenderTitle = function(node, params)
	{
		node.t(title);
	}
	View.prototype.onRenderContent = function(node, params)
	{
		var caller = this;
		node.a($$()).s('padding:8px;').t('?<br/><br/>'.embed(msg)).a($crec('Cancel', function()
		{
			caller.widget.close();
		}));
	}		
	// let's define window controller if not previously defined
	if ( 'undefined' == typeof Controller )
	{
		$class('Controller < ac.WindowWidgetController');
	}
	Controller.prototype.onClose = function()
	{
		callbackOnClose();
		return true;
	}		
	var win = $new
	(
		ac.WindowWidget,
		$new(ac.WindowWidgetModel),
		$new(View, {isModal:true, hasStatus:false, hasCloseButton:false, defaultSize:{width:340,height:100}}),
		$new(Controller)
	);
	// we defined .acw-window-modal-bg.alert CSS class in test.ac.browser.css to overide default modal surround
	win.show(null, 'alert');
	ac.widget.focus(win);
	return win;
}




// each dynamically loaded script must end with the following statements
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}