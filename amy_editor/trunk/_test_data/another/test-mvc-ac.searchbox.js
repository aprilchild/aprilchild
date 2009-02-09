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


/* Customization, API example

// [1] we define our own model extending default class `ac.SearchBoxWidgetModel`

/*  ---------------------------------------------------------------- 
	ExampleModel < ac.SearchBoxWidgetModel
*/
$class('ExampleModel < ac.SearchBoxWidgetModel');

// [1.A] we need to override the `loadListeningResultset` method of the original class, this is where our own data need to be acquired
ExampleModel.prototype.loadListeningResultset = function(inputValue, callbackOk, callbackError)
{
	var rs = [];
	// in some cases, an error is returned
	if ( 0.1 > Math.random() )
	{
		callbackError();
		return;
	}
	// in some case we won't find anything
	if ( 0.2 > Math.random() )
	{
		callbackOk([]);
		return;
	}
	var num_results = 1 + Math.floor(20*Math.random());
	var alpha = 'abcdefghijklmnopqrstuvwxyz';
	var generateWord = function()
	{
		var w = '';
		var num_letters = Math.floor(7*Math.random());
		for ( var i=0; i<num_letters; i++ )
		{
			var letter = alpha.charAt(Math.floor(26*Math.random()));
			if ( 0.3 > Math.random() )
			{
				letter = letter.toUpperCase();
			}
			w += letter;
		}
		return w;
	}
	for  ( var i=0; i<num_results; i++ )
	{
		var word = generateWord()+inputValue+generateWord();
		rs.push(word);
	}
	callbackOk(rs);
}

// [2] we define our own controller extending default class `ac.SearchBoxWidgetController`

/*  ---------------------------------------------------------------- 
	ExampleController < ac.SearchBoxWidgetController
*/

$class('ExampleController < ac.SearchBoxWidgetController');

ExampleController.prototype.onSearchValue = function(inputValue)
{
	$('result').a($$()).t('Now searching for `?`'.embed(inputValue));
}

// [3] we define our own view extending default class `ac.SearchBoxWidgetView`
// view actually affects final rendering of the widget (data of our model)

/*  ---------------------------------------------------------------- 
	ExampleView < ac.SearchBoxWidgetView
*/

$class('ExampleView < ac.SearchBoxWidgetView');







// each dynamically loaded script must end with the following statements
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}