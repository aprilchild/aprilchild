/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.stub.BOCombo stub widget
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
	ac.stub.BOComboModel < ac.HierarchicalWidgetModel
*/

$class('ac.stub.BOComboModel < ac.HierarchicalWidgetModel',
{
	construct:function(rootElement)
	{
		this.rootElement = rootElement;
	}
});


/*  ---------------------------------------------------------------- 
	ac.stub.BOComboView < ac.HierarchicalWidgetView
*/

$class('ac.stub.BOComboView < ac.WidgetView');

ac.stub.BOComboView.prototype.renderElementInRow = function(acElem, rowData)
{
}

ac.stub.BOComboView.prototype.renderElementInListIcon = function(acElem)
{
	return '<img src="mm/i/theme/?/browser.?.(inactive).gif" width="13" height="13" border="0"/>'.embed(fry.ui.theme.name, acElem.isCollection?'folder':'item');
}

ac.stub.BOComboView.prototype.renderElementDetail = function(acElem, node)
{
	node.t('<h1>Detail</h1><p>?</p>'.embed(acElem.id));
}

ac.stub.BOComboView.prototype.renderElementOutlineviewDetail = function(acElem, node)
{
	node.t('<h1>Detail</h1><p>?</p>'.embed(acElem.id));
}

ac.stub.BOComboView.prototype.renderLoadingMessage = function(acElem, node, marginLeft)
{
}

/*  ---------------------------------------------------------------- 
	ac.stub.BOComboController < ac.WidgetController
*/
$class('ac.stub.BOComboController < ac.HierarchicalWidgetController');

ac.stub.BOComboController.prototype.allowRename = function()
{
	return true;
}

ac.stub.BOComboController.prototype.onElementClipboardCopy = function(acElemLst, isCopy, callbackOk)
{
	callbackOk();
}

ac.stub.BOComboController.prototype.onElementClipboardCut = function(acElemLst, callbackOk)
{
	callbackOk();
}

ac.stub.BOComboController.prototype.onElementValueEdited = function(acElem, colId, value, callbackOk, callbackError)
{
	this.onElementRename(acElem, value, callbackOk, callbackError);
}

ac.stub.BOComboController.prototype.onGetElementValueForSorting = function(acElem)
{
	return acElem.properties.label.toLowerCase();
}

ac.stub.BOComboController.prototype.allowOperations = function()
{
	return true;
}

/*  ---------------------------------------------------------------- 
	ac.stub.BOComboBrowserModel < ac.BrowserWidgetModel
*/
$class('ac.stub.BOComboBrowserModel < ac.BrowserWidgetModel');

ac.stub.BOComboBrowserModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
	this.widget.getComboWidget().model.loadElements(acElem, callbackOnSuccess, callbackOnError);
}


/*  ---------------------------------------------------------------- 
	ac.stub.BOComboBrowserView < ac.BrowserWidgetView
*/
$class('ac.stub.BOComboBrowserView < ac.BrowserWidgetView');


ac.stub.BOComboBrowserView.prototype.renderElementInList = function(acElem, node)
{
	var label_id = this.widget.getComboWidget().outlineview.properties.columns[0].id;
	row_data = {label_id:acElem.id};
	this.widget.getComboWidget().outlineview.view.renderElementInRow(acElem, row_data);
	node.t(row_data[label_id]);
}

ac.stub.BOComboBrowserView.prototype.renderElementInListIcon = function(acElem)
{
	return this.widget.getComboWidget().view.renderElementInListIcon(acElem);
}

ac.stub.BOComboBrowserView.prototype.renderElementDetail = function(acElem, node)
{
	this.widget.getComboWidget().view.renderElementDetail(acElem, node);
}

ac.stub.BOComboBrowserView.prototype.renderLoadingMessage = function(acElem, node, marginLeft)
{
	return this.widget.getComboWidget().view.renderLoadingMessage(acElem, node, marginLeft);
}

/*  ---------------------------------------------------------------- 
	ac.stub.BOComboBrowserController < ac.BrowserWidgetController
*/
$class('ac.stub.BOComboBrowserController < ac.BrowserWidgetController');

ac.stub.BOComboBrowserController.prototype.allowMultipleSelection = function()
{
	return this.widget.getComboWidget().controller.allowMultipleSelection();
}

ac.stub.BOComboBrowserController.prototype.allowOperations = function()
{
	return this.widget.getComboWidget().controller.allowOperations();
}

ac.stub.BOComboBrowserController.prototype.allowRename = function()
{
	return this.widget.getComboWidget().controller.allowRename();
}

ac.stub.BOComboBrowserController.prototype.onSelectionChanged = function(selection)
{
	this.widget.getComboWidget().controller.onSelectionChanged(selection);
}

ac.stub.BOComboBrowserController.prototype.onElementClick = function(acElem, evt)
{
	this.widget.getComboWidget().controller.onElementClick(acElem, evt);
}

ac.stub.BOComboBrowserController.prototype.onElementDblClick = function(acElem, evt)
{
	this.widget.getComboWidget().controller.onElementDblClick(acElem, evt);
}

ac.stub.BOComboBrowserController.prototype.onElementFilter = function(acElem)
{
	return this.widget.getComboWidget().controller.onElementFilter(acElem);
}

ac.stub.BOComboBrowserController.prototype.onElementDuplicate = function(newElement, oldLabel, newParentElement, duplicitIteration)
{
	this.widget.getComboWidget().controller.onElementDuplicate(newElement, oldLabel, newParentElement, duplicitIteration);
}

ac.stub.BOComboBrowserController.prototype.onElementMoveCopy = function(acElemLst, targetElement, isMove, callbackOk)
{
	this.widget.getComboWidget().controller.onElementMoveCopy(acElemLst, targetElement, isMove, callbackOk);
}

ac.stub.BOComboBrowserController.prototype.onElementRename = function(acElem, label, callbackOk, callbackError)
{
	this.widget.getComboWidget().controller.onElementRename(acElem, label, callbackOk, callbackError);
}

ac.stub.BOComboBrowserController.prototype.onElementClipboardCopy = function(acElemLst, isCopy, callbackOk)
{
	this.widget.getComboWidget().controller.onElementClipboardCopy(acElemLst, isCopy, callbackOk);
}

ac.stub.BOComboBrowserController.prototype.onElementClipboardCut = function(acElemLst, callbackOk)
{
	this.widget.getComboWidget().controller.onElementClipboardCut(acElemLst, callbackOk);
}

ac.stub.BOComboBrowserController.prototype.onGetElementValueForEditing = function(acElem, colId)
{
	return this.widget.getComboWidget().controller.onGetElementValueForEditing(acElem, colId);
}

ac.stub.BOComboBrowserController.prototype.onGetElementValueForSorting = function(acElem)
{
	return this.widget.getComboWidget().controller.onGetElementValueForSorting(acElem);
}

ac.stub.BOComboBrowserController.prototype.onElementValueEdited = function(acElem, colId, value, callbackOk, callbackError)
{
	this.widget.getComboWidget().controller.onElementValueEdited(acElem, colId, value, callbackOk, callbackError);
}

ac.stub.BOComboBrowserController.prototype.onElementValueCanceled = function(acElem, colId, value)
{
	this.widget.getComboWidget().controller.onElementValueCanceled(acElem, colId, value);
}

ac.stub.BOComboBrowserController.prototype.onGetElementValueEditor = function(acElem, colId)
{
	return this.widget.getComboWidget().controller.onGetElementValueEditor(acElem, colId);
}

ac.stub.BOComboBrowserController.prototype.onAfterShowFrom = function(acElem)
{
	return this.widget.getComboWidget().controller.onAfterShowFrom(acElem);
}

ac.stub.BOComboBrowserController.prototype.onAfterRenderElement = function(acElem)
{
	return this.widget.getComboWidget().controller.onAfterRenderElement(acElem);
}



/*  ---------------------------------------------------------------- 
	ac.stub.BOComboOutlineViewView < ac.OutlineViewWidgetView
*/
$class('ac.stub.BOComboOutlineViewView < ac.OutlineViewWidgetView');

ac.stub.BOComboOutlineViewView.prototype.renderElementInRow = function(acElem, row_data)
{
	this.widget.getComboWidget().view.renderElementInRow(acElem, row_data);
}

ac.stub.BOComboOutlineViewView.prototype.renderElementInListIcon = function(acElem)
{
	return this.widget.getComboWidget().view.renderElementInListIcon(acElem);
}

ac.stub.BOComboOutlineViewView.prototype.renderDetail = function(acElem, node)
{
	this.widget.getComboWidget().view.renderElementOutlineviewDetail(acElem, node);
}

ac.stub.BOComboOutlineViewView.prototype.renderLoadingMessage = ac.stub.BOComboBrowserView.prototype.renderLoadingMessage;

/*  ---------------------------------------------------------------- 
	ac.stub.BOComboOutlineViewController < ac.OutlineViewWidgetController
*/
$class('ac.stub.BOComboOutlineViewController < ac.OutlineViewWidgetController');

ac.stub.BOComboOutlineViewController.prototype.allowMultipleSelection = ac.stub.BOComboBrowserController.prototype.allowMultipleSelection;

ac.stub.BOComboOutlineViewController.prototype.allowOperations = ac.stub.BOComboBrowserController.prototype.allowOperations;

ac.stub.BOComboOutlineViewController.prototype.allowRename = ac.stub.BOComboBrowserController.prototype.allowRename;

ac.stub.BOComboOutlineViewController.prototype.onSelectionChanged = ac.stub.BOComboBrowserController.prototype.onSelectionChanged;

ac.stub.BOComboOutlineViewController.prototype.onElementClick = ac.stub.BOComboBrowserController.prototype.onElementClick;

ac.stub.BOComboOutlineViewController.prototype.onElementDblClick = ac.stub.BOComboBrowserController.prototype.onElementDblClick;

ac.stub.BOComboOutlineViewController.prototype.onElementFilter = ac.stub.BOComboBrowserController.prototype.onElementFilter;

ac.stub.BOComboOutlineViewController.prototype.onElementDuplicate = ac.stub.BOComboBrowserController.prototype.onElementDuplicate;

ac.stub.BOComboOutlineViewController.prototype.onElementMoveCopy = ac.stub.BOComboBrowserController.prototype.onElementMoveCopy;

ac.stub.BOComboOutlineViewController.prototype.onElementRename = ac.stub.BOComboBrowserController.prototype.onElementRename;

ac.stub.BOComboOutlineViewController.prototype.onElementClipboardCopy = ac.stub.BOComboBrowserController.prototype.onElementClipboardCopy;

ac.stub.BOComboOutlineViewController.prototype.onElementClipboardCut = ac.stub.BOComboBrowserController.prototype.onElementClipboardCut;

ac.stub.BOComboOutlineViewController.prototype.onGetElementValueForEditing = ac.stub.BOComboBrowserController.prototype.onGetElementValueForEditing;

ac.stub.BOComboOutlineViewController.prototype.onElementValueEdited = ac.stub.BOComboBrowserController.prototype.onElementValueEdited;

ac.stub.BOComboOutlineViewController.prototype.onElementValueCanceled = ac.stub.BOComboBrowserController.prototype.onElementValueCanceled;

ac.stub.BOComboOutlineViewController.prototype.onGetElementValueEditor = ac.stub.BOComboBrowserController.prototype.onGetElementValueEditor;

ac.stub.BOComboOutlineViewController.prototype.onAfterShowFrom = ac.stub.BOComboBrowserController.prototype.onAfterShowFrom;

ac.stub.BOComboOutlineViewController.prototype.onAfterRenderElement = ac.stub.BOComboBrowserController.prototype.onAfterRenderElement;

/*  ---------------------------------------------------------------- 
	ac.stub.BOCombo < ac.HierarchicalWidget
*/
$class('ac.stub.BOCombo < ac.HierarchicalWidget',
{
	construct:function()
	{
	    this.viewMode = 0; // 0 - browser, 1 - outlineview
		this.browser = null;
		this.outlineview = null;
		
		this.comboPaneNode = null;
		this.browserShown = false;
		this.outlineviewShown = false;

		this.initChildWidgets();		
	}
});

ac.stub.BOCombo.prototype.getSelection = function()
{
	if ( 0 == this.viewMode )
	{
		return this.browser.getSelection();
	}
	return this.outlineview.getSelection();
}

ac.stub.BOCombo.prototype.preInitChildWidgets = function()
{
}

ac.stub.BOCombo.prototype.initChildWidgets = function()
{
	this.preInitChildWidgets();
	this.browser = $new
	(
		ac.BrowserWidget,
		$new(ac.stub.BOComboBrowserModel, null),
		$new(ac.stub.BOComboBrowserView, {sortElementsAlphabetically:true}),
		$new(ac.stub.BOComboBrowserController),
		this.getComboParentWidget()
	);
	this.outlineview = $new
	(
		ac.OutlineViewWidget,
		this.browser.model,
		$new(ac.stub.BOComboOutlineViewView),
		$new(ac.stub.BOComboOutlineViewController),
		this.getComboParentWidget()
	);
	var caller = this;
	this.browser.getComboWidget = this.outlineview.getComboWidget = function()
	{
		return caller;
	}
}

ac.stub.BOCombo.prototype.getBrowserController = function()
{
	return this.browser.controller;
}

ac.stub.BOCombo.prototype.getOutlineViewController = function()
{
	return this.outlineview.controller;
}

ac.stub.BOCombo.prototype.onFocus = function()
{
}

ac.stub.BOCombo.prototype.onBlur = function()
{
}

ac.stub.BOCombo.prototype.addColumn = function(id, name, width, sortCallback, isInfoColumn, isEditable)
{
	return this.outlineview.addColumn(id, name, width, sortCallback, isInfoColumn, isEditable);
}

ac.stub.BOCombo.prototype.showFrom = function(acElem)
{
	if ( 0 == this.viewMode )
	{
		// will show in browser
		this.browser.showFrom(acElem, true);
	}
	else
	{
		this.outlineview.showFrom(acElem);
	}
}

ac.stub.BOCombo.prototype.getComboParentWidget = function()
{
	return null;
}

ac.stub.BOCombo.prototype.showBrowser = function()
{
	if ( !this.browserShown )
	{
		this.browser.show(this.comboPaneNode, this.cssClassName);
		this.browserShown = true;
	}
}

ac.stub.BOCombo.prototype.showOutlineView = function()
{
	if ( !this.outlineviewShown )
	{
		this.outlineview.setListContainer(this.browser.model.rootElement);
		this.outlineview.show(this.comboPaneNode, this.cssClassName);
		this.outlineviewShown = true;
	}
}

ac.stub.BOCombo.prototype.show = function(node, cssClassName)
{
	this.browserShown = false;
	this.outlineviewShown = false;
	$call(this, 'ac.Widget.show', node, cssClassName);
	this.removeSelection();
}

ac.stub.BOCombo.prototype.render = function()
{
}


	
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}