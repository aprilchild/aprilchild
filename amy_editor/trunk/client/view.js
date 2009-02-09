/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Common views

  *------------------------------------------------------------------------------------------
*/

client.view.renderEditorStatus = function(node)
{
	node.n('editor-status').h(28);
	var tr = node.a($$('table')).sa('cellspacing',0).w(node.w()).a($$('tbody')).a($$('tr'));
	tr.a($$('td')).w(10);
	tr.a($$('td')).w(10);
	tr.a($$('td')).w(24);
	tr.a($$('td')).w(150);
	tr.a($$('td')).w(90);
	tr.a($$('td')).w(150);
	tr.a($$('td')).w(150);
	tr.a($$('td'));
}

client.view.flashForceKill = false;
client.view.lastFlashMessage = '';

client.view.getFlashMessage = function()
{
	return client.view.lastFlashMessage;
}

client.view.showFlashMessage = function(message, timeoutInSec)
{
	client.view.lastFlashMessage = message;
	timeoutInSec = timeoutInSec | 0;
	if ( null != client.nodes.flashMessage && client.nodes.flashMessage.is() )
	{
		client.view.flashForceKill = true;
		client.nodes.flashMessage.rs();
	}
	var node = fry.ui.snippet.RoundBoxTransparent(400, 20, 'rbox', function(node)
	{
		node.a($$()).n('message').t(message).e('click', function(evt)
		{
			client.nodes.flashMessage.rs();
		});
	}, 'transparent').o(0.85).v(false);
	client.nodes.flashMessage = $().a(node);
	var x = Math.floor((fry.ui.info.page.width-node.w())/2);
	var y = Math.floor((fry.ui.info.page.height-node.$.offsetHeight)/3);
	client.nodes.flashMessage.v(true).pos(true).x(x).y(y).z(999999);
	if ( 0 != timeoutInSec )
	{
		setTimeout(client.view.hideFlashMessage, timeoutInSec*1000);
	}
}

client.view.hideFlashMessage = function(step)
{
	if (client.view.flashForceKill)
	{
		client.view.flashForceKill = false;
		return;
	}
	step = 'undefined' == typeof step ? 5 : step;
	if ( null != client.nodes.flashMessage && client.nodes.flashMessage.is() )
	{
		if ( 0 == step )
		{
			client.nodes.flashMessage.rs();
			return;
		}
		client.nodes.flashMessage.o(step*0.15);
		setTimeout('client.view.hideFlashMessage('+(step-1)+')', 50);
	}
}

client.view.showTooltip = function(x, y, text)
{
    client.view.hideTooltip();
    var node = $().a($$()).n('tooltip').pos(true).x(x).y(y).addDrag(fry.ui.drag.MODE_STANDARD, { });
    node.a($$()).n('tooltip-border').a($$()).n('tooltip-inner').t('<pre>?</pre>'.embed(text));
    if ( 40 < node.w() )
    {
        fry.ui.snippet.ApplyShadowedBox(node);
    }
    client.nodes.tooltip = node;
}

client.view.hideTooltip = function()
{
    if ( client.nodes.tooltip && client.nodes.tooltip.is() )
    {
        client.nodes.tooltip.rs();
    }
}

client.view.showHTMLPageWindow = function(title, content, callbackOnClose)
{
    return client.view.showDialogWindow($getdef(title, $loc('wt_html_page')), {width:800, height:550}, function(widget, node)
    {
        var w = node.w();
        var h = node.h();
        var inner_node = node.a($$()).n('html-page-inner').pos(true).w(w-8).h(h-8).x(8).y(8);
        
    	inner_node.a(fry.ui.snippet.RoundBoxTransparent(w-16, 20, 'rbox-be', function(node)
    	{
    		node.h(h-56);
    	}, 'transparent').o(0.35));
    	
    	inner_node.a($$()).pos(true).x(14).y(14).w(w-32).h(h-42).s('overflow:auto').n('edit-inn');        
        inner_node.lc().t(content);
    }, callbackOnClose);
}

client.view.showDialogWindow = function(title, winPosition, callbackOnRenderContent, callbackOnClose)
{
	var was_canceled = true;
	if ( 'undefined' == typeof WDialogView )
	{
		$class('WDialogView < ac.WindowWidgetView');
	}
	WDialogView.prototype.onRenderTitle = function(node, params)
	{
		node.t(title);
	}
	WDialogView.prototype.onRenderContent = function(node, params)
	{
	    callbackOnRenderContent(this.widget, node);
	}
	// let's define window controller if not previously defined
	if ( 'undefined' == typeof WDialogController )
	{
		$class('WDialogController < ac.WindowWidgetController');
	}
	WDialogController.prototype.onClose = function()
	{
		fry.keyboard.disableTextfieldsEditation();
        callbackOnClose();
		return true;
	}
	winPosition = $getdef(winPosition, {width:480, height:380});
	var options = {isModal:true, hasStatus:false, hasCloseButton:true, defaultSize:winPosition};
	if ( $isset(winPosition.x) )
	{
		options.defaultPosition = winPosition;
	}
	client.widgets.winDialog = $new
	(
		ac.WindowWidget,
		$new(ac.WindowWidgetModel),
		$new(WDialogView, options),
		$new(WDialogController)
	);
	client.widgets.winDialog.show(null, 'dialog-window');
	fry.keyboard.allowTextfieldsEditation();
	ac.widget.focus(client.widgets.winDialog);
	return client.widgets.winDialog;
}

client.view.showWizardDialogWindow = function(title, contentId, contentParams, locale, winPosition)
{
	if ( 'undefined' == typeof WWizardDialogView )
	{
		$class('WWizardDialogView < ac.WindowWidgetView');
	}
	WWizardDialogView.prototype.onRenderTitle = function(node, params)
	{
		node.t(title);
	}
	WWizardDialogView.prototype.onRenderContent = function(node, params)
	{
		node.a($$()).n('htmldialog').t(amy.wizards[contentId].template);
		if ('function' == typeof amy.wizards[contentId].onLaunch)
		{
			amy.wizards[contentId].onLaunch(contentParams);			
		}
		fry.keyboard.allowTextfieldsEditation();
	}
	// let's define window controller if not previously defined
	if ( 'undefined' == typeof WWizardDialogController )
	{
		$class('WWizardDialogController < ac.WindowWidgetController');
	}
	WWizardDialogController.prototype.onClose = function()
	{
		fry.keyboard.disableTextfieldsEditation();
		return true;
	}
	winPosition = $getdef(winPosition, {width:480, height:Math.min(fry.ui.info.page.height-80, 480)});
	var options = {isModal:true, hasStatus:false, hasCloseButton:true, defaultSize:winPosition};
	if ( $isset(winPosition.x) )
	{
		options.defaultPosition = winPosition;
	}
	client.widgets.winWizardDialog = $new
	(
		ac.WindowWidget,
		$new(ac.WindowWidgetModel),
		$new(WWizardDialogView, options),
		$new(WWizardDialogController)
	);
	client.widgets.winWizardDialog.show(null, 'dialog-window');
	fry.keyboard.allowTextfieldsEditation();
	ac.widget.focus(client.widgets.winWizardDialog);
	
	return client.widgets.winWizardDialog;
}

client.view.hideWizardDialogWindow = function()
{
	if (client.widgets.winWizardDialog)
	{
		client.widgets.winWizardDialog.close();
	}
}

client.view.showHTMLDialogWindow = function(title, url, winPosition)
{
	if ( 'undefined' == typeof WHTMLDialogView )
	{
		$class('WHTMLDialogView < ac.WindowWidgetView');
	}
	WHTMLDialogView.prototype.onRenderTitle = function(node, params)
	{
		node.t(title);
	}
	WHTMLDialogView.prototype.onRenderContent = function(node, params)
	{
		node.a($$('iframe')).s('width:100%;height:100%;overflow:auto').$.src = url;
	}
	// let's define window controller if not previously defined
	if ( 'undefined' == typeof WHTMLDialogController )
	{
		$class('WHTMLDialogController < ac.WindowWidgetController');
	}
	WHTMLDialogController.prototype.onClose = function()
	{
		return true;
	}
	winPosition = $getdef(winPosition, {width:680, height:Math.min(fry.ui.info.page.height-80, 480)});
	var options = {isModal:true, hasStatus:false, hasCloseButton:true, defaultSize:winPosition};
	if ( $isset(winPosition.x) )
	{
		options.defaultPosition = winPosition;
	}
	client.widgets.winHtmlDialog = $new
	(
		ac.WindowWidget,
		$new(ac.WindowWidgetModel),
		$new(WHTMLDialogView, options),
		$new(WHTMLDialogController)
	);
	client.widgets.winHtmlDialog.show(null, 'dialog-window');
	ac.widget.focus(client.widgets.winHtmlDialog);
	
	return client.widgets.winHtmlDialog;
}

client.view.hideHTMLDialogWindow = function()
{
	if (client.widgets.winHtmlDialog)
	{
		client.widgets.winHtmlDialog.close();
	}
}

client.view.showFileChooser = function(callback, saveAsFilename)
{
	// creating a widget
	var widget = $new
	(
		ac.FileChooserWidget,
		$new(amy.FileChooserModel),
		$new(amy.FileChooserView, {}),
		$new(amy.FileChooserController)
	);
	// adding columns for tableview
	widget.addColumn('label', client.lc.get('h_label'), '40%', function(acElem)
	{
		return acElem.properties.label.toLowerCase();
	});
	widget.addColumn( 'size', $loc('h_size'), '20%', function(acElem)
	{
		return parseInt(acElem.properties.size);
	});
	widget.addColumn( 'dateModified', $loc('h_date_modified'), '20%', function(acElem)
	{
		return parseInt(acElem.properties.dateModified);
	});
	client.widgets.fileChooser = widget;
	var backup = {};
	for (var i in client.model.projects)
	{
		root = client.model.projects[i].treeRootItem;
		root.traverseElement(function(elem)
		{
			backup[elem.id] = elem.hasState(elem.STATE_EXPANDED);
		});
	}
	function restore_state(acElem)
	{
		for (var i in client.model.projects)
		{
			root = client.model.projects[i].treeRootItem;
			root.traverseElement(function(elem)
			{
				if ('undefined' != typeof backup[elem.id])
				{
					if (backup[elem.id])
					{
						elem.setStateExpanded();
					}
					else
					{
						elem.setStateCollapsed();
					}
				}
			});
			root.tree.hide();
			if (null != acElem)
			{
				var elem = acElem;
				while (null != elem)
				{
					elem.setStateExpanded();
					elem = elem.parentElement;
				}
			}
			root.sort(function(elem){return elem.properties.label.toLowerCase();});
			root.tree.show(root.tree.containerNode, 'amy-project');
		}
	}
	var filename = $getdef(saveAsFilename, null)
	client.widgets.fileChooser.view.options.actAsSaveDialog = null != filename;
	client.widgets.fileChooser.view.options.saveAsFilename = filename;
	var active_component = ac.chap.getActiveComponent();
	ac.chap.setActiveComponent(null);
	client.widgets.fileChooser.show
	(
		'',
		function(selectedElement, parentElement, filename)
		{
			restore_state(selectedElement);
			ac.chap.setActiveComponent(active_component);
			if (client.widgets.fileChooser.view.options.actAsSaveDialog)
			{
				fry.keyboard.disableTextfieldsEditation();
				callback(selectedElement, parentElement, filename);
			}
			else
			{
				fry.keyboard.disableTextfieldsEditation();
				callback(selectedElement);
			}
		},
		function(wasSelected)
		{
			restore_state();
			ac.chap.setActiveComponent(active_component);
			fry.keyboard.disableTextfieldsEditation();
			callback(null);
		},
		client.controller.createNewFolder
	);
	fry.keyboard.allowTextfieldsEditation();
}

client.view.renderUserIcon = function(size, borderColor, iconUrl)
{
	if ('undefined' == typeof borderColor )
	{
		borderColor = '#aaa';
	}
	if ('undefined' == typeof iconUrl)
	{
		iconUrl = client.model.user.getIconUrl();
	}
 	if (0 == iconUrl.trim().length)
	{
		iconUrl = 'mm/i/pictures/j.png';
	}
	var border_size = Math.floor(size/11);
	var border_radius = Math.floor(0.1*size);
	var node = $$().w(size).h(size).s('-webkit-border-radius:?px;-moz-border-radius:?px;border:?px solid ?;'.embed(border_radius, border_radius, border_size, borderColor));
	node.a($$('img')).w(size).h(size).$.src = iconUrl;
	return node;
}

/*  ---------------------------------------------------------------- 
	amy.LeftPaneView < ac.TabPaneWidgetView
*/

$class('amy.LeftPaneView < ac.TabPaneWidgetView');


amy.LeftPaneView.prototype.renderTitle = function(pane, index, node)
{
	// called when rendering pane's title, this is actually redundant since it copies behavior of default view method `ac.TabPaneWidgetView>renderTitle`.
	node.t('?'.embed(pane.label));
}


/*  ---------------------------------------------------------------- 
	amy.RightPaneView < ac.TabPaneWidgetView
*/

$class('amy.RightPaneView < ac.TabPaneWidgetView');


amy.RightPaneView.prototype.renderTitle = function(pane, index, node)
{
	// console.log(pane);
	var resource = pane.acElem;
	if (resource.collaboration)
	{
		var icon = 'init';
		if (resource.collaboration.started)
		{
			icon = 'start';
		}
		else if (resource.collaboration.endMessaging)
		{
			icon = 'stop';
		}
		node.t('<img src="mm/i/coll-?.png" valign="bottom" width="13" height="13" style="position:absolute;top:4px;left:22px"/> <span style="padding-left:13px">?</span>'.embed(icon, resource.properties.label));
	}
	else
	{
		node.t('?'.embed(resource.properties.label));
	}
	if (node.p())
	{
		node.p().p().p().p().p().s('-webkit-border-top-left-radius: 10px;-webkit-border-top-right-radius: 2px;');
	}
}

amy.RightPaneView.prototype.renderEmptyPane = function(node)
{
	// called when all tab panes are closed to render something instead.
	var w = 160;
	var h = 190;
	var y = Math.floor((fry.ui.info.page.height-22-25-h)/2);
	node.a($$()).pos(true).x(Math.floor((node.w()-w)/2)).y(y).w(w).h(h).s('background:url(mm/i/no-tab.gif)');
}


/*  ---------------------------------------------------------------- 
	amy.ProjectsAccordionView < ac.AccordionWidgetView
*/

$class('amy.ProjectsAccordionView < ac.AccordionWidgetView');


amy.ProjectsAccordionView.prototype.renderTitle = function(pane, index, node)
{
	var info = pane.project.info;
	var description = info.description ? info.description : info.url.replace('http://', '');
	node.t('<table class="project-info" style="margin-right:4px"><tbody><tr><td><div class="name">?</div><div class="url">?</div></td><td width="12" valign="top"></td></tr></tbody></table>'.embed(amy.util.shorten(info.name, 32), amy.util.shorten(description, 40)));
	var close_button = node.g('td:1').pos(true).a($$('img')).w(12).h(12);
	if ($__tune.isIE)
	{
		close_button.pos(true).x(260);
	}
	close_button.$.src = 'mm/i/accordion-pane-close.png';
	close_button.e('click', function(evt)
	{
		this.widget.closePane(index);
	});
	node.ps().fc().pos(false).p().p().p().p().p().h(34);
}


/*  ---------------------------------------------------------------- 
	amy.ProjectsTreeView < ac.TreeWidgetView
*/
$class('amy.ProjectsTreeView < ac.TreeWidgetView');


amy.ProjectsTreeView.prototype.renderElement = function(acElem, node)
{
	var label = amy.util.shorten(acElem.properties.label, 32);
	if ( acElem.isCollection )
	{
		node.t(label.surroundTag('strong'));
	}
	else
	{
		node.t(label);			
	}
}

amy.ProjectsTreeView.prototype.renderElementIcon = function(acElem, isSelected)
{
	return 'mm/i/?.png'.embed(acElem.isCollection?'folder':'document');
}



/*  ---------------------------------------------------------------- 
	amy.FileChooserView < ac.FileChooserWidgetView
*/

$class('amy.FileChooserView < ac.FileChooserWidgetView');

amy.FileChooserView.prototype.renderElementInRow = function(acElem, rowData)
{
	// rowdata contains prepared data structure we must fill with our values with any fancy formatting we want...
	with ( acElem.properties )
	{
		rowData['label'] = amy.util.shorten(label, 25);
		rowData['size'] = 0 == size ? '--' : $_(size).surroundTag('strong');
		rowData['dateModified'] = fry.calendar.format.dateTime(dateModified);
	}
	if (!acElem.isCollection && this.options.actAsSaveDialog)
	{
		rowData['label'] = rowData['label'].surroundTag('em');
	}
}

// called when rendering volume in the left pane, acElem is the root element of the volume
amy.FileChooserView.prototype.renderVolume = function(acElem, node)
{
	// console.log(acElem);
	node.t(acElem.properties.label).s('font-size:11px');//volume.properties.project.name);
}

// this is what is rendered in case of expanding full detail of the non-collection element
amy.FileChooserView.prototype.renderElementDetail = function(acElem, node)
{
	with (acElem.properties)
	{
		var ht = '<h1>'+label+'</h1>';
		// rest of the properties is going to be rendered into a table, notice call for locale keywords
		ht += '<table class="browser-info" cellspacing="0" cellpadding="0">'
		ht += '<tr><td class="key">?</td><td class="value">?</td></tr>'.embed($loc('lU_size'), amy.util.filesize(size));
		ht += '<tr><td class="key">?</td><td class="value">?</td></tr>'.embed($loc('lU_date_modified'), fry.calendar.format.dateTime(dateModified));
		ht += '<tr><td class="key">?</td><td class="value">?</td></tr>'.embed($loc('lU_content_type'), contentType);
		var parts = label.split('.');
		var bundle_name = client.model.getBundleByExtension(parts[parts.length-1]).info.name;
		ht += '<tr><td class="key">?</td><td class="value">?</td></tr>'.embed($loc('lU_bundle'), bundle_name);
		ht += '<tr><td class="key">?</td><td class="value">?</td></tr>'.embed($loc('lU_version'), version);
		ht += '</table>';
		node.t(ht);
	}
	var preview = node.a($$()).n('preview');
	if (acElem.properties.content)
	{
		preview.t(amy.util.text_preview(acElem.properties.content));
		return;
	}
	// loading content
	if (0 == acElem.properties.contentType.indexOf('text/'))
	{
		// text
		preview.t($loc('preview_content_loading'));

		client.model.loadProjectResource(acElem, function(content)
		{
			acElem.properties.content = content;
			if (preview.is())
			{
				preview.t(amy.util.text_preview(content));
			}
		},
		function(e)
		{
			if (preview.is())
			{
				preview.t($loc('preview_content_error'));
			}
		});
	}
	else if (0 == acElem.properties.contentType.indexOf('image/'))
	{
		// image
		preview.t('<img src="' + client.model.getPreviewProjectResourceURL(acElem) + '" width="?" />'.embed(node.w()-16));
	}
	else
	{
		preview.t($loc('preview_content_cannot_display'));
	}
}

/*  ---------------------------------------------------------------- 
	amy.BundleEditorTreeView < ac.TreeWidgetView
*/
$class('amy.BundleEditorTreeView < ac.TreeWidgetView');


amy.BundleEditorTreeView.prototype.renderElement = function(acElem, node)
{
	var label = amy.util.shorten(acElem.properties.label, 20);
	node.t(label.encodeMarkup());
}

amy.BundleEditorTreeView.prototype.renderElementIcon = function(acElem, isSelected)
{
	return 'mm/i/treeico-?.png'.embed(acElem.type);
}



/*  ---------------------------------------------------------------- 
	amy.PopupMenuView < ac.MenuWidgetView
*/

$class('amy.PopupMenuView < ac.MenuWidgetView');

amy.PopupMenuView.prototype.renderMenuItem = function(acElem, node, isTopMenuBar)
{
	node.t(amy.util.shorten(acElem.properties.label, 32));
}


/*  ---------------------------------------------------------------- 
	amy.MainMenuView < ac.MenuWidgetView
*/

$class('amy.MainMenuView < ac.MenuWidgetView');


amy.MainMenuView.prototype.renderMenuItem = function(acElem, node, isTopMenuBar)
{
	var ht = acElem.properties.label;
	if (acElem.properties.hasIcon)
	{
		node.a(client.view.renderUserIcon(12, '#bbb')).pos(true).x(4).p().at(ht)
	}
	else
	{
		node.t(ht);
	}
	if (acElem.properties.small)
	{
		node.s('font-size:11px');
	}
}


/*  ---------------------------------------------------------------- 
	amy.AddressBookView < ac.TableViewWidgetView
*/

$class('amy.AddressBookView < ac.TableViewWidgetView');

amy.AddressBookView.prototype.renderElementInRow = function(acElem, rowData)
{
	var icon = $$().a(client.view.renderUserIcon(14, '#bbb', acElem.properties.icon)).p();
	rowData['icon'] = icon.t();
	rowData['nickname'] = acElem.properties.nickname;
	rowData['email'] = acElem.properties.email;
}

amy.AddressBookView.prototype.renderDetail = function(acElem, node)
{
	var r_node = node.a($$()).s('margin:8px');
	r_node.a(client.view.renderUserIcon(48, '#ddd', acElem.properties.icon)).s('float:left');
	r_node.at('<h3 style="margin-left:64px">?</h3>'.embed(acElem.properties.nickname));
	r_node.at('<p style="margin-left:64px"><strong>E-mail</strong> <a href="mailto:?">?</a></p>'.embed(acElem.properties.email, acElem.properties.email));
}


amy.AddressBookView.prototype.renderElementLoadError = function(listContainer, error, node)
{
//	alertUser('An error occured', 'Error while loading.<p>Message: ?</p>'.embed(error), function(){});
}


