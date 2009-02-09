/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.stub.BOMCombo stub widget
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */


if ( 'undefined' == typeof ac.stub )
{
	ac.stub = {};
}

/*  ---------------------------------------------------------------- 
	ac.stub.BOMComboModel < ac.stub.BOComboModel
*/

$class('ac.stub.BOMComboModel < ac.stub.BOComboModel');


/*  ---------------------------------------------------------------- 
	ac.stub.BOMComboView < ac.stub.BOComboView
*/
$class('ac.stub.BOMComboView < ac.stub.BOComboView');

ac.stub.BOMComboView.prototype.renderElementMapgraphDetail = function(acElem, node)
{
}

ac.stub.BOMComboView.prototype.renderElementMapgraphDetailSelection = function(acElem, node, mode)
{
}

/*  ---------------------------------------------------------------- 
	ac.stub.BOMComboController < ac.stub.BOComboController
*/
$class('ac.stub.BOMComboController < ac.stub.BOComboController');


/*  ---------------------------------------------------------------- 
	ac.stub.BOMComboBrowserModel < ac.stub.BOComboBrowserModel
*/
$class('ac.stub.BOMComboBrowserModel < ac.stub.BOComboBrowserModel');

ac.stub.BOMComboBrowserModel.prototype.hasImplicitRelations = function()
{
	return true;
}

/*  ---------------------------------------------------------------- 
	ac.stub.BOMComboBrowserView < ac.stub.BOComboBrowserView
*/
$class('ac.stub.BOMComboBrowserView < ac.stub.BOComboBrowserView');

/*  ---------------------------------------------------------------- 
	ac.stub.BOMComboBrowserController < ac.stub.BOComboBrowserController
*/
$class('ac.stub.BOMComboBrowserController < ac.stub.BOComboBrowserController');

/*  ---------------------------------------------------------------- 
	ac.stub.BOMComboOutlineViewView < ac.stub.BOComboOutlineViewView
*/
$class('ac.stub.BOMComboOutlineViewView < ac.stub.BOComboOutlineViewView');

/*  ---------------------------------------------------------------- 
	ac.stub.BOMComboOutlineViewController < ac.stub.BOComboOutlineViewController
*/
$class('ac.stub.BOMComboOutlineViewController < ac.stub.BOComboOutlineViewController');

/*  ---------------------------------------------------------------- 
	ac.stub.BOMComboMapGraphView < ac.MapGraphWidgetView
*/
$class('ac.stub.BOMComboMapGraphView < ac.MapGraphWidgetView');

ac.stub.BOMComboMapGraphView.prototype.renderElement = function(acElem, node)
{
	this.widget.getComboWidget().view.renderElementMapgraphDetail(acElem, node);	
}

ac.stub.BOMComboMapGraphView.prototype.renderElementSelection = function(acElem, node, mode)
{
	this.widget.getComboWidget().view.renderElementMapgraphDetailSelection(acElem, node, mode);
}

/*  ---------------------------------------------------------------- 
	ac.stub.BOMComboMapGraphController < ac.MapGraphWidgetController
*/
$class('ac.stub.BOMComboMapGraphController < ac.MapGraphWidgetController');


ac.stub.BOMComboMapGraphController.prototype.allowMultipleSelection = ac.stub.BOMComboBrowserController.prototype.allowMultipleSelection;

ac.stub.BOMComboMapGraphController.prototype.allowRename = ac.stub.BOMComboBrowserController.prototype.allowRename;

ac.stub.BOMComboMapGraphController.prototype.onSelectionChanged = ac.stub.BOMComboBrowserController.prototype.onSelectionChanged;

ac.stub.BOMComboMapGraphController.prototype.onElementClick = ac.stub.BOMComboBrowserController.prototype.onElementClick;

ac.stub.BOMComboMapGraphController.prototype.onElementDblClick = ac.stub.BOMComboBrowserController.prototype.onElementDblClick;

ac.stub.BOMComboMapGraphController.prototype.onElementFilter = ac.stub.BOMComboBrowserController.prototype.onElementFilter;

ac.stub.BOMComboMapGraphController.prototype.onElementDuplicate = ac.stub.BOMComboBrowserController.prototype.onElementDuplicate;

ac.stub.BOMComboMapGraphController.prototype.onElementMoveCopy = ac.stub.BOMComboBrowserController.prototype.onElementMoveCopy;

ac.stub.BOMComboMapGraphController.prototype.onElementRename = ac.stub.BOMComboBrowserController.prototype.onElementRename;

ac.stub.BOMComboMapGraphController.prototype.onElementClipboardCopy = ac.stub.BOMComboBrowserController.prototype.onElementClipboardCopy;

ac.stub.BOMComboMapGraphController.prototype.onElementClipboardCut = ac.stub.BOMComboBrowserController.prototype.onElementClipboardCut;

ac.stub.BOMComboMapGraphController.prototype.onGetElementValueForEditing = ac.stub.BOMComboBrowserController.prototype.onGetElementValueForEditing;

ac.stub.BOMComboMapGraphController.prototype.onElementValueEdited = ac.stub.BOMComboBrowserController.prototype.onElementValueEdited;

ac.stub.BOMComboMapGraphController.prototype.onElementValueCanceled = ac.stub.BOMComboBrowserController.prototype.onElementValueCanceled;

ac.stub.BOMComboMapGraphController.prototype.onGetElementValueEditor = ac.stub.BOMComboBrowserController.prototype.onGetElementValueEditor;

ac.stub.BOMComboMapGraphController.prototype.onAfterShowFrom = ac.stub.BOComboBrowserController.prototype.onAfterShowFrom;

ac.stub.BOMComboMapGraphController.prototype.onAfterRenderElement = ac.stub.BOComboBrowserController.prototype.onAfterRenderElement;


/*  ---------------------------------------------------------------- 
	ac.stub.BOMCombo < ac.stub.BOCombo
*/
$class('ac.stub.BOMCombo < ac.stub.BOCombo',
{
	construct:function()
	{
		this.mapgraph = null;
		this.mapgraphShown = false;
		this.initChildWidgets(true);
	}
});

ac.stub.BOMCombo.prototype.getSelection = function()
{
	if ( 0 == this.viewMode )
	{
		return this.browser.getSelection();
	}
	else if ( 1 == this.viewMode )
	{
		return this.outlineview.getSelection();		
	}
	return this.mapgraph.getSelection();
}

ac.stub.BOMCombo.prototype.initChildWidgets = function(forced)
{
	if ( !forced )
	{
		return;
	}
	this.preInitChildWidgets();
	var options = 'undefined' != typeof this.view.options.browser ? this.view.options.browser : {};
	options.sortElementsAlphabetically = true;
	this.browser = $new
	(
		ac.BrowserWidget,
		$new(ac.stub.BOMComboBrowserModel, null),
		$new(ac.stub.BOMComboBrowserView, options),
		$new(ac.stub.BOMComboBrowserController),
		this.getComboParentWidget()
	);
	this.outlineview = $new
	(
		ac.OutlineViewWidget,
		this.browser.model,
		$new(ac.stub.BOMComboOutlineViewView),
		$new(ac.stub.BOMComboOutlineViewController, 'undefined' != typeof this.view.options.outlineview ? this.view.options.outlineview : {}),
		this.getComboParentWidget()
	);
	this.mapgraph = $new
	(
		ac.MapGraphWidget,
		this.browser.model,
		$new(ac.stub.BOMComboMapGraphView, 'undefined' != typeof this.view.options.mapgraph ? this.view.options.mapgraph : {}),
		$new(ac.stub.BOMComboMapGraphController),
		this.getComboParentWidget()
	);
	var caller = this;
	this.browser.getComboWidget = this.outlineview.getComboWidget = this.mapgraph.getComboWidget = function()
	{
		return caller;
	}
}

ac.stub.BOMCombo.prototype.getMapGraphController = function()
{
	return this.mapgraph.controller;
}

ac.stub.BOMCombo.prototype.getActualWidget = function()
{
	if ( 0 == this.viewMode )
	{
		return this.browser;
	}
	else if ( 1 == this.viewMode )
	{
		return this.outlineview;
	}
	else
	{
		return this.mapgraph;
	}	
}

ac.stub.BOMCombo.prototype.showFrom = function(acElem)
{
	if ( 0 == this.viewMode )
	{
		this.browser.showFrom(acElem, true);
	}
	else if ( 1 == this.viewMode )
	{
		this.outlineview.showFrom(acElem);
	}
	else
	{
		this.mapgraph.showFrom(acElem);		
	}
}

ac.stub.BOMCombo.prototype.showMapGraph = function()
{
	if ( !this.mapgraphShown )
	{
		this.mapgraph.show(this.comboPaneNode, this.cssClassName);
		this.mapgraphShown = true;
	}
}

ac.stub.BOMCombo.prototype.show = function(node, cssClassName)
{
	this.browserShown = false;
	this.outlineviewShown = false;
	this.mapgraphShown = false;
	$call(this, 'ac.Widget.show', node, cssClassName);
	this.removeSelection();
}

ac.stub.BOMCombo.prototype.setModel = function(acElem)
{
	this.browserShown = false;
	this.outlineviewShown = false;
	this.mapgraphShown = false;
	$delete(this.browser.model.rootElement);
	this.browser.model.rootElement = acElem;
	this.showFrom(acElem);
}
	
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}