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


/* Customization, API example

// [1] we define our own model extending default class `ac.DropDownListWidgetModel`

/*  ---------------------------------------------------------------- 
	ExampleModel < ac.DropDownListWidgetModel
*/

$class('ExampleModel < ac.DropDownListWidgetModel');

// [2] we define our own controller extending default class `ac.DropDownListWidgetController`

/*  ---------------------------------------------------------------- 
	ExampleController < ac.DropDownListWidgetController
*/

$class('ExampleController < ac.DropDownListWidgetController');

ExampleController.prototype.onItemSelect = function(item)
{
	$('result').a($$()).t('Selected `?` from list `?`'.embed('string'==typeof item?item:item.key, this.widget.ident));
}

// [3] we define our own view extending default class `ac.DropDownListWidgetView`
// view actually affects final rendering of the widget (data of our model)

/*  ---------------------------------------------------------------- 
	ExampleView < ac.DropDownListWidgetView
*/

$class('ExampleView < ac.DropDownListWidgetView');


ExampleView.prototype.renderOptionItem = function(item, node)
{
	// when an option item is rendered, this method is called for actual rendering
	node.s('padding:1px');
	node.a($$()).s('width:14px;height:11px;border:1px solid #555;position:absolute;left:1px;background:?'.embed(item.key));
	node.a($$()).s('width:90px;height:13px;margin-left:20px').t(item.value);
}

ExampleView.prototype.renderValueItem = function(item, node)
{
	// if the widget is not writable, this method is called to render content of the value box, otherwise, standard input is rendered
	// in our case, the value will look like any other option item
	this.renderOptionItem(item, node);
	node.s('padding:0');
}


// [4] we define another view for FONT list

/*  ---------------------------------------------------------------- 
	ExampleFontView < ac.DropDownListWidgetView
*/

$class('ExampleFontView < ac.DropDownListWidgetView');


ExampleFontView.prototype.renderOptionItem = function(item, node)
{
	// when an option item is rendered, this method is called for actual rendering
	node.a($$()).s('width:auto;padding:2px;font:?'.embed(item.key)).t(item.value);
}

ExampleFontView.prototype.renderValueItem = function(item, node)
{
	node.t(item.value);
}




// each dynamically loaded script must end with the following statements
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}