/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.MapGraph widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


/* Customization, API example

// [1] we define our own model extending default class `ac.MapGraphWidgetModel`

/*  ---------------------------------------------------------------- 
	ExampleModel < ac.MapGraphWidgetModel
*/

$class('ExampleModel < ac.MapGraphWidgetModel');

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
	
	// let's limit the nesting level
	if ( 20 < level )
	{
		callbackOnSuccess();
		return;
	}

	// let's simulate some pause usually caused by trip to server
	$runafter( Math.floor(2000*Math.random()), function()
	{

		// pretend, that in some minor cases, data could not been retrieved
		if ( 0.1 > Math.random() )
		{
			callbackOnError('Could not load elements. Random error code would be '+Math.random());
			return;
		}

		var num_elements = 1 + Math.floor( 6*Math.random() );
		for ( var i=0; i<num_elements; i++ )
		{
			// appending new child object
			var child_elem = acElem.appendChild($new(ACElement));
			// randomly define whether the object is a collection
			child_elem.isCollection = 0.4 > Math.random();
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
			child_elem.properties.label = alphabet.substr(Math.floor(Math.random()*(alphabet.length-12)), 2+Math.floor(Math.random()*10)).substr(0,8);
			// creating size information
			child_elem.properties.size = child_elem.isCollection ? 0 : Math.floor(50000*Math.random());
			// creating version information
			child_elem.properties.version = 1+Math.floor(20*Math.random());
		
		}
		// we have finished appending new child objects, let's commit the operation using `callbackOnSuccess` callback.
		callbackOnSuccess();
	});
}

// [2] we define our own controller extending default class `ac.MapGraphWidgetController` - for tree mode, we need to define underlying tree operations as 
//	   defined in the ac.IOperationsWidgetController interface.

/*  ---------------------------------------------------------------- 
	ExampleController < ac.MapGraphWidgetController
*/
$class('ExampleController < ac.MapGraphWidgetController');


// allowing multiple selection, set to false if you don't want any
ExampleController.prototype.allowMultipleSelection = function()
{
	return true;
}

// to support elements operations such as COPY and MOVE, we MUST enable callback in the followings two methods handling clipboard
// we can look to selections (acElemLst) an optionally remove any elements we do not want to include in our operations
ExampleController.prototype.onElementClipboardCut = function(acElemLst, callbackOk)
{
	// we enable it, otherwise there couldn't be any call to callbackOk(). remove the following line to disable it (or do not overide the method at the first place).
	callbackOk();
}

ExampleController.prototype.onElementClipboardCopy = function(acElemLst, isCopy, callbackOk)
{
	// we enable it, otherwise there couldn't be any call to callbackOk(). remove the following line to disable it (or do not overide the method at the first place).
	callbackOk();
}

// returns real value for editing - it may differ from the value used in view rendering
ExampleController.prototype.onGetElementValueForEditing = function(acElem, colId)
{
	return acElem.properties.label;
}

// called when the need for change of element label is required, this is enforced automatically in situations as copying elements to the same collection etc.
ExampleController.prototype.onElementDuplicate = function(newElement, oldLabel, newParentElement, duplicitIteration)
{
	newElement.properties.label = 'Copy ?of ?'.embed(1==duplicitIteration?'':'? '.embed(duplicitIteration), oldLabel);
}

// called when actual change in the elements tree is required - moving/copying 
ExampleController.prototype.onElementMoveCopy = function(acElemLst, targetElement, isMove, callbackOk)
{
	var was_canceled = false;
	var labels = [];
	// let's get list of all labels to be displayed in alert window
	$foreach ( acElemLst, function(acElem)
	{
		labels.push(acElem.properties.label);
	});
	// we call the helper function to display alert window
	var win = alertUser('?ing...'.embed(isMove?'Mov':'Copy'), '?ing ? item(s) (?) to ?<br/>Please wait.'.embed(isMove?'Mov':'Copy', labels.length, labels.join(', '), targetElement.properties.label), function()
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
			callbackOk();			
		}
		ac.widget.focus(this.widget);
	})
}


// [3] we define our own view extending default class `ac.MapGraphWidgetView`
// view actually affects final rendering of the widget (data of our model)

/*  ---------------------------------------------------------------- 
	ExampleView < ac.MapGraphWidgetView
*/
$class('ExampleView < ac.MapGraphWidgetView');


ExampleView.prototype.renderElement = function(acElem, node)
{
	// due using the view for both modes, we'll separate the code
	if ( this.widget.model.hasImplicitRelations() )
	{
		node.s('font-size:10px');
		// called when rendering an element in implicit tree mode
		if ( acElem.isCollection )
		{
			node.t(acElem.properties.label.surroundTag('strong'));
		}
		else
		{
			node.t(acElem.properties.label);
		}
	}
	else
	{
		$call(this, 'ac.MapGraphWidgetView.renderElement', node, acElem);
	}
}

ExampleView.prototype.renderElementSelection = function(acElem, node, mode)
{
	node.n('inner ?'.embed(mode));
}

ExampleView.prototype.renderElementHeader = function(acElem, node)
{
	node.t(acElem.properties.label);
}

ExampleView.prototype.renderElementBody = function(acElem, node)
{
	node.t(acElem.properties.label);
}

ExampleView.prototype.renderElementFooter = function(acElem, node)
{
	node.t('f ?'.embed(acElem.properties.label));
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