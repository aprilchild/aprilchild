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


/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetModel < ac.stub.BOComboModel
*/

$class('ac.FileChooserWidgetModel < ac.stub.BOComboModel');

ac.FileChooserWidgetModel.prototype.getVolumes = function()
{
	return [];
}

ac.FileChooserWidgetModel.prototype.getSearchHistoryValues = function()
{
	return [];
}


/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetView < ac.stub.BOComboView
*/
$class('ac.FileChooserWidgetView < ac.stub.BOComboView');

ac.FileChooserWidgetView.prototype.setOptions = function(options)
{
	if ( 'undefined' == typeof this.options.window )
	{
		this.options.window = 
		{
			defaultSize:
			{
				width:Math.floor(fry.ui.info.page.width*0.8),
				height:Math.floor(fry.ui.info.page.height*0.85)
			}
		};
	}
	if ( 'undefined' == typeof this.options.onlyFoldersVisible )
	{
		this.options.onlyFoldersVisible = false;
	}
	if ( 'undefined' == typeof this.options.actAsSaveDialog )
	{
		this.options.actAsSaveDialog = false;
	}
	this.options.window.isModal = true;
	this.options.window.hasStatus = false;
	this.options.window.isResizable = false;
	this.options.window.isScrollable = false;
}

ac.FileChooserWidgetView.prototype.onRenderTitle = function(node)
{
	node.t(client.lc.get('acfilechooser_title_for_?'.embed(this.options.actAsSaveDialog ? 'save' : 'open')));
}

ac.FileChooserWidgetView.prototype.renderVolume = function(acElem, node)
{
	node.t(acElem.id);
}

/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetController < ac.stub.BOComboController
*/
$class('ac.FileChooserWidgetController < ac.stub.BOComboController');

ac.FileChooserWidgetController.prototype.allowOperations = function()
{
	return false;
}

ac.FileChooserWidgetController.prototype.onSelectionChanged = function(selection)
{
	this.widget.fillPathSelection(selection[0]);
}

ac.FileChooserWidgetController.prototype.onElementClick = function(acElem, evt)
{
	var volume = this.widget.volumes[this.widget.activeVolumeIndex];
	if ( volume )
	{
		volume.lastElement = acElem;
	}	
}

ac.FileChooserWidgetController.prototype.onElementDblClick = function(acElem, evt)
{
	this.widget.choose();
}

ac.FileChooserWidgetController.prototype.onElementFilter = function(acElem)
{
	var filter_string = this.widget.searchbox.getValue().trim();
	if ( '' == filter_string )
	{
		return !this.widget.view.options.onlyFoldersVisible || acElem.isCollection;
	}
	var label_id = this.widget.outlineview.properties.columns[0].id;
	row_data = {label_id:acElem.id};
	this.widget.outlineview.view.renderElementInRow(acElem, row_data);
	var elem_label = row_data[label_id];
	return -1 != elem_label.indexOf(filter_string) && (!this.widget.view.options.onlyFoldersVisible || acElem.isCollection);
}


ac.FileChooserWidgetController.prototype.postShowFrom = function(acElem)
{
	this.widget.fillPathSelection(acElem);
}


/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetWindowController < ac.WindowWidgetController
*/

$class('ac.FileChooserWidgetWindowController < ac.WindowWidgetController');

ac.FileChooserWidgetWindowController.prototype.onClose = function()
{
	var filechooser = this.widget.parentWidget;
	if ( null != filechooser.onCloseCallback )
	{
		filechooser.onCloseCallback(0<filechooser.getSelection().length);
	}
	return true;
}


/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetWindowView < ac.WindowWidgetView
*/

$class('ac.FileChooserWidgetWindowView < ac.WindowWidgetView');

ac.FileChooserWidgetWindowView.prototype.onRenderTitle = function(node)
{
	this.widget.parentWidget.view.onRenderTitle(node);
}

ac.FileChooserWidgetWindowView.prototype.onRenderContent = function(node)
{
	this.widget.parentWidget.renderBasePanes(node);
}


/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetSearchBoxModel < ac.SearchBoxWidgetModel
*/
$class('ac.FileChooserWidgetSearchBoxModel < ac.SearchBoxWidgetModel');

/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetSearchBoxView < ac.SearchBoxWidgetView
*/
$class('ac.FileChooserWidgetSearchBoxView < ac.SearchBoxWidgetView');

/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetSearchBoxController < ac.SearchBoxWidgetController
*/
$class('ac.FileChooserWidgetSearchBoxController < ac.SearchBoxWidgetController');

ac.FileChooserWidgetSearchBoxController.prototype.onSearchValue = function(inputValue)
{
	var filechooser = this.widget.parentWidget.parentWidget;	
	var acElem = filechooser.browser.model.rootElement.getElementById($comboget(filechooser.pathCombo));
	if ( null != acElem )
	{
		filechooser.showFrom(acElem);
	}
}

ac.FileChooserWidgetSearchBoxController.prototype.onInputValueCleared = function(inputValue)
{
	this.widget.setValue('');
	return true;
}


/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetTreeModel < ac.TreeWidgetModel
*/
$class('ac.FileChooserWidgetTreeModel < ac.TreeWidgetModel');

/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetTreeView < ac.TreeWidgetView
*/
$class('ac.FileChooserWidgetTreeView < ac.TreeWidgetView');


ac.FileChooserWidgetTreeView.prototype.renderElement = function(acElem, node)
{
	this.widget.parentWidget.parentWidget.view.renderVolume(acElem, node.a($$('span')));
}


/*  ---------------------------------------------------------------- 
	ac.FileChooserWidgetTreeController < ac.TreeWidgetController
*/
$class('ac.FileChooserWidgetTreeController < ac.TreeWidgetController');

ac.FileChooserWidgetTreeController.prototype.allowMultipleSelection = function()
{
	return false;
}

ac.FileChooserWidgetTreeController.prototype.onElementClick = function(acElem, evt)
{
	this.widget.parentWidget.parentWidget.showVolume(acElem.properties.volume);
}



/*  ---------------------------------------------------------------- 
	ac.FileChooserWidget < ac.stub.BOCombo
*/
$class('ac.FileChooserWidget < ac.stub.BOCombo');

ac.FileChooserWidget.prototype.preInitChildWidgets = function()
{
	this.window = null;
	this.pathCombo = null;
	this.searchbox = null;
	this.tree = null;
	
	this.leftPaneNode = null;
	
	this.volumes = [];
	this.activeVolumeIndex = 0;
	
	this.onChooseCallback = null;
	this.onCloseCallback = null;

	this.window = $new
	(
		ac.WindowWidget,
		$new(ac.WindowWidgetModel),
		$new(ac.FileChooserWidgetWindowView, this.view.options.window),
		$new(ac.FileChooserWidgetWindowController),
		this
	);
	this.searchbox = $new
	(
		ac.SearchBoxWidget,
		$new(ac.FileChooserWidgetSearchBoxModel, this.model.getSearchHistoryValues()),
		$new(ac.FileChooserWidgetSearchBoxView),
		$new(ac.FileChooserWidgetSearchBoxController),
		this.window
	);
	var caller = this;
	var treeElem = $new(ACElement);
	treeElem.setState(treeElem.STATE_EXPANDED | treeElem.STATE_LOADED);
	treeElem.isCollection = true;
	$foreach ( this.model.getVolumes(), function(volume, index)
	{
		if ( 'undefined' == typeof volume.rootElement )
		{
			volume = {rootElement:volume, lastElement:null};
		}
		volume.index = index;
		caller.volumes.push(volume);
		var vol_tree = $new(ACElement);
		vol_tree.isCollection = false;
		vol_tree.properties.volume = volume;
		vol_tree.properties.label = volume.rootElement.properties.label;
		treeElem.appendChild(vol_tree);
	});
	this.tree = $new
	(
		ac.TreeWidget,
		$new(ac.FileChooserWidgetTreeModel, treeElem),
		$new(ac.FileChooserWidgetTreeView, {showRootElement:false, hasElementIcon:false}),
		$new(ac.FileChooserWidgetTreeController),
		this.window
	);
	if ( treeElem.hasChildren() )
	{
		this.tree.addSelection(treeElem.elements[0]);
	}
}

ac.FileChooserWidget.prototype.choose = function(withFilename)
{
	var selection = this.getSelection();
	if ( 0 < selection.length && 'object' == typeof selection[0] )
	{
		this.addSelection(selection[0], true);
		var filename = '';
		if (this.view.options.actAsSaveDialog)
		{
			filename = $getdef(withFilename, this.getSaveInputBox().$.value);
			// console.log(filename);
		}
		this.close();
		if ( this.onChooseCallback )
		{
			if (this.view.options.actAsSaveDialog)
			{
				var elem = selection[0];
				while (null != elem && !elem.isCollection)
				{
					elem = elem.parentElement;
				}
				this.onChooseCallback(selection[0], elem, filename);
			}
			else
			{
				this.onChooseCallback(selection[0]);
			}
		}
	}
}

ac.FileChooserWidget.prototype.close = function()
{
	this.window.close();
}


/* BOCombo overidden methods */

ac.FileChooserWidget.prototype.getComboParentWidget = function()
{
	return this.window;
}
/* end of BOCombo overidden methods */

ac.FileChooserWidget.prototype.getSaveInputBox = function()
{
	return $('filename-?'.embed(this.ident));
}

ac.FileChooserWidget.prototype.setSaveFilename = function(filename)
{
	var input_box = this.getSaveInputBox();
	if (input_box.is())
	{
		input_box.$.value = filename;
		if ('' != filename)
		{
			var ix = filename.lastIndexOf('.');
			if (-1 == ix)
			{
				ix  = filename.length;
			}
			$__tune.selection.setRange(input_box.$, 0, ix);
		}
		else
		{
			input_box.$.focus();
		}
	}
}

ac.FileChooserWidget.prototype.fillPathSelection = function(acElem)
{
	if (!acElem || null == acElem || 'object' != typeof acElem)
	{
		return;
	}
	try
	{		
		var caller = this;
		var label_id = this.outlineview.properties.columns[0].id;
		
		if (this.view.options.actAsSaveDialog)
		{
			if (acElem.isCollection)
			{
				
			}
			else
			{
				var row_data = {label_id:acElem.id};
				this.outlineview.view.renderElementInRow(acElem, row_data);
				this.setSaveFilename(row_data[label_id].stripMarkup());
			}
		}
		
		if ( !acElem.isCollection )
		{
			acElem = acElem.parentElement;
		}
		$combofill( this.pathCombo.t(''), function()
		{
			if ( null == acElem )
			{
				return false;
			}
			var item = [];
			if ( null == acElem.parentElement )
			{
				// volume
				var node = $$();
				caller.view.renderVolume(acElem, node);
				item = [acElem.id, node.t().stripMarkup()];
			}
			else
			{
				var row_data = {label_id:acElem.id};
				caller.outlineview.view.renderElementInRow(acElem, row_data);
				item = [acElem.id, row_data[label_id].stripMarkup()];
			}
			acElem = acElem.parentElement;
			return item;
		});
	}
	catch (e)
	{
		console.warn('Error while filling path in selection: %o', e);
	}
}

ac.FileChooserWidget.prototype.showVolume = function(volume)
{
	if ( !volume )
	{
		return;
	}
	var root_elem = volume.rootElement;
	var last_elem = volume.lastElement || root_elem;
	this.browser.model.rootElement = root_elem;
	if ( 0 == this.viewMode )
	{
		this.outlineview.setVisibility(false);
		this.showBrowser();
		this.browser.showFrom(last_elem, true);
		this.browser.setVisibility(true);
	}
	else
	{
		this.browser.setVisibility(false);
		this.showOutlineView();
		this.outlineview.setListContainer(last_elem);
		this.outlineview.showFrom(last_elem);
		this.outlineview.setVisibility(true);
	}
	this.fillPathSelection(this.browser.model.rootElement);
}

ac.FileChooserWidget.prototype.show = function(cssClassName, onChooseCallback, onCloseCallback, onCreateFolderCallback)
{
	this.browserShown = false;
	this.outlineviewShown = false;
	$call(this, 'ac.Widget.show', null, cssClassName);
	this.removeSelection();
	if (this.view.options.actAsSaveDialog)
	{
		var caller = this;
		var input_box = this.getSaveInputBox();
		if (input_box.is())
		{
			var filename = $getdef(this.view.options.saveAsFilename, '');
			this.view.options.saveAsFilename = filename;
			input_box.e('keyup', function(evt)
			{
				if (evt.KEY_ENTER == evt.keyCode)
				{
					caller.choose(evt.$.$.value);
				}
				else if (evt.KEY_ESCAPE == evt.keyCode)
				{
					evt.$.$.value = caller.view.options.saveAsFilename;
				}
			});
			this.setSaveFilename(filename);
		}
		if (onCreateFolderCallback)
		{
			var title = $getdef(this.view.options.dialogNewFolderTitle, client.lc.get('acfilechooser_dialog_new_folder_title'));
			var label = $getdef(this.view.options.dialogNewFolderLabel, client.lc.get('acfilechooser_dialog_new_folder_label'));
			var label_creating_folder = $getdef(this.view.options.dialogNewFolderLabelCreating, client.lc.get('acfilechooser_dialog_new_folder_label_creating'));
			var label_creating_folder_failed = $getdef(this.view.options.dialogNewFolderLabelCreatingFailed, client.lc.get('acfilechooser_dialog_new_folder_label_creating_failed'));
			var butt_cancel = $getdef(this.view.options.dialogNewFolderButtonCancel, client.lc.get('acfilechooser_dialog_new_folder_butt_cancel'));
			var butt_ok = $getdef(this.view.options.dialogNewFolderButtonOK, client.lc.get('acfilechooser_dialog_new_folder_butt_ok'));

			var button = this.nodeBottom.a($$('input')).x(14).sa('type', 'button').sa('value', this.view.options.buttonNewFolderTitle||client.lc.get('acfilechooser_button_new_folder')).e('click', function()
			{
				// let's ask for folder name
				if ( 'undefined' == typeof ac.FileChooserDialogView )
				{
					$class('ac.FileChooserDialogView < ac.WindowWidgetView');
				}
				ac.FileChooserDialogView.prototype.onRenderTitle = function(node, params)
				{
					node.t(title);
				}
				ac.FileChooserDialogView.prototype.onRenderContent = function(node, params)
				{
					function get_new_label()
					{
						var input = $('new-folder-name-?'.embed(caller.ident));
						if (input && input.is())
						{
							var value = input.$.value.trim();
							if ('' == value || -1 != value.indexOf('/'))
							{
								return null;
							}
							return value;
						}
						return null;
					}
					function proceed()
					{
						var selection = caller.getSelection();
						if ( 0 < selection.length && 'object' == typeof selection[0] )
						{
							var parent_element = selection[0];
							caller.addSelection(parent_element, true);
							var new_label = get_new_label();
							if (null == new_label)
							{
								return;
							}
							var label_id = caller.outlineview.properties.columns[0].id;
							// checking whether an element with the same label already exists
							for (var i in parent_element.elements)
							{
								var elem = parent_element.elements[i];
								var row_data = {label_id:elem.id};
								caller.outlineview.view.renderElementInRow(elem, row_data);
								if (row_data[label_id].stripMarkup() == new_label)
								{
									return;
								}
							}
							node.t('<div class="info">?</div>'.embed(label_creating_folder));
							onCreateFolderCallback(new_label, parent_element, function(acElem)
							{
								// creation succeeded
								parent_element.appendChild(acElem);
								caller.dialogWindow.close();
								caller.showFrom(parent_element);
							},
							function(e)
							{
								// creation failed
								node.t('<div class="info">?</div>'.embed(label_creating_folder_failed));
								$runafter(2000, function(){caller.dialogWindow.close()});
							});
						}
					}

					node.t('<table cellspacing="0" cellpadding="0"><tbody><tr><td class="label">?</td><td class="input"><input class="text" type="text" id="new-folder-name-?" value="" /></td></tr><tr><td colspan="2" class="buttons"><input class="button" type="button" value="?" /><input class="button" type="button" value="?" /></td></tr></tbody></table>'.embed(label, caller.ident, butt_cancel, butt_ok));
					node.g('input:0').e('keyup', function(evt)
					{
						evt.stop();
						if (evt.KEY_ENTER == evt.keyCode)
						{
							proceed();
						}
						else if (evt.KEY_ESCAPE == evt.keyCode)
						{
							caller.dialogWindow.close();
						}
					}).$.focus();
					node.g('input:2').e('click', function(evt)
					{
						// OK handler
						evt.stop();
						proceed();
					});
					node.g('input:1').e('click', function(evt)
					{
						// Cancel handler
						evt.stop();
						caller.dialogWindow.close();
					});
				}
				// let's define window controller if not previously defined
				if ( 'undefined' == typeof ac.FileChooserDialogController )
				{
					$class('ac.FileChooserDialogController < ac.WindowWidgetController');
				}
				ac.FileChooserDialogController.prototype.onClose = function()
				{
					return true;
				}
				var options = {isModal:true, hasStatus:false, isResizable:false, hasCloseButton:true, defaultSize:{width:450, height:110}};
				caller.dialogWindow = $new
				(
					ac.WindowWidget,
					$new(ac.WindowWidgetModel),
					$new(ac.FileChooserDialogView, options),
					$new(ac.FileChooserDialogController)
				);
				caller.dialogWindow.show(null, 'filechooser-dialog-window');
				ac.widget.focus(caller.dialogWindow);
			});
			
			// this.onCreateFolderCallback
		}
	}
	this.onChooseCallback = onChooseCallback;
	this.onCloseCallback = onCloseCallback;
}

ac.FileChooserWidget.prototype.render = function()
{
	this.window.show(null, this.cssClassName);
	ac.widget.focus(this.window);
}

ac.FileChooserWidget.prototype.renderBasePanes = function(node)
{
	var w = node.w()-2;
	var h = node.h()+1;
	var top_pane = node.a($$()).n('acw-filechooser ? top-pane'.embed(this.cssClassName)).w(w);
	this.renderTopPane(top_pane);
	var h_top = top_pane.h()+1;
	var mid_pane = node.a($$()).n('acw-filechooser ? mid-pane'.embed(this.cssClassName)).w(w).y(h_top);
	var bottom_pane = node.a($$()).n('acw-filechooser ? bottom-pane'.embed(this.cssClassName)).w(w);
	var h_bottom = bottom_pane.h();
	bottom_pane.y(h-h_bottom-1).x(1).pos(true);
	mid_pane.h(h-h_top-h_bottom).x(1).pos(true);

	this.renderBottomPane(bottom_pane);
	this.renderMidPane(mid_pane);

	this.showVolume(this.volumes[this.activeVolumeIndex]);
}

ac.FileChooserWidget.prototype.renderTopPane = function(node)
{
	var caller = this;
	if (this.view.options.actAsSaveDialog)
	{
		node.h(82);
		node.a($$()).n('save-form').t('<table><tbody><tr><td class="label">?</td><td><input type="text" id="filename-?" value=""/></td></tr></tbody></table>'.embed( $getdef(this.view.options.labelSaveAs, client.lc.get('acfilechooser_label_save_as')), this.ident, $getdef(this.view.options.saveAsFilename, '')));
	}
	else
	{
		node.h(40);		
	}
	var node_buttons = node.a($$()).n('buttons');
	node_buttons.a($$()).n('left-arrow');
	node_buttons.a($$()).n('right-arrow');
	node_buttons.a($$()).n('switch browser').e('click', function(evt)
	{
		evt.$.n('switch ?'.embed(1==caller.viewMode?'browser':'outlineview'));
		if ( 0 == caller.viewMode )
		{
			// will switch to outlineview
			caller.browser.setVisibility(false);
			caller.showOutlineView();
			var selection = caller.browser.getSelection();
			if ( 0 != selection.length )
			{
				caller.outlineview.showFrom(selection[0]);
			}
			caller.outlineview.setVisibility(true);
			ac.widget.focus(caller.outlineview);
		}
		else
		{
			// will switch to browser
			caller.outlineview.setVisibility(false);
			caller.showBrowser();
			var selection = caller.outlineview.getSelection();
			if ( 0 != selection.length )
			{
				caller.browser.showFrom(selection[0], true);
			}
			caller.browser.setVisibility(true);
			ac.widget.focus(caller.browser);
		}
		caller.viewMode = ++caller.viewMode & 1;
	});
	this.pathCombo = node_buttons.a($$()).n('path-selection').a($$('select')).e('change', function(evt)
	{
		var id = $comboget(caller.pathCombo);
		var elem = caller.browser.model.rootElement.getElementById(id);
		if ( null != elem )
		{
			caller.showFrom(elem);
		}
	});
	var search_node = node_buttons.a($$()).n('search-box').pos(true);
	search_node.x(node.w()-search_node.w()-9);
	this.searchbox.show(search_node, this.cssClassName);
}

ac.FileChooserWidget.prototype.renderMidPane = function(node)
{
	var left_pane = node.a($$()).n('left-pane').pos(true).x(0).y(0).h(node.h());
	// rendering left pane - volumes
	this.tree.show(left_pane, 'acw-filechooser ?'.embed(this.cssClassName));
	this.leftPaneNode = left_pane;
	this.comboPaneNode = node.a($$()).n('right-pane').pos(true).x(left_pane.w()).y(0).h(node.h()).w(node.w()-left_pane.w());
}

ac.FileChooserWidget.prototype.renderBottomPane = function(node)
{
	var caller = this;
	var operation = this.view.options.actAsSaveDialog ? 'save' : 'open'
	node.a($$('input')).sa('type', 'button').sa('value', this.view.options.buttonCancelTitle||client.lc.get('acfilechooser_button_cancel_for_?'.embed(operation))).e('click', function()
	{
		caller.close();
	});
	node.a($$('input')).sa('type', 'button').sa('value', this.view.options.buttonChooseTitle||client.lc.get('acfilechooser_button_?'.embed(operation))).e('click', function()
	{
		caller.choose();
	});
	node.lc().x(node.w()-node.lc().w()-14);
	node.fc().x(node.w()-node.lc().w()-node.fc().w()-28);
	this.nodeBottom = node;
}

	
if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}