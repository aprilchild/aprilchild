/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Base controllers

  *------------------------------------------------------------------------------------------
*/


client.callbacks = {};
client.widgets = {};
client.nodes = {};


client.onstart = function(skipBrowserCheck)
{
	if (!skipBrowserCheck)
	{
		if (!($__tune.isSafari || $__tune.isGecko))
		{
			if ($__tune.isIE)
			{
				if (/MSIE 7|8|9/.test(navigator.appVersion))
				{
					return client.onstart(true);
				}
			}
			$('no-support-notice').d(true);
			return;
		}
	}
	else
	{
		$('no-support-notice').d(false);
	}
	// preventing default key actions such as backspace causing browser navigating to other pages
	ac.widget.addKeyAction(ac.widget.rootWidget, '-8', {__callback:function(){return true;}}, '', 'global');
	ac.widget.addKeyAction(ac.widget.rootWidget, '-9', {__callback:function(){return true;}}, '', 'global');
	ac.widget.addKeyAction(ac.widget.rootWidget, '-46', {__callback:function(){return true;}}, '', 'global');
	ac.widget.addKeyAction(ac.widget.rootWidget, '114+?'.embed($__tune.isMac?'meta':'ctrl'), {__callback:function(){return true;}}, '', 'global'); // command/ctrl+r
	ac.widget.addKeyAction(ac.widget.rootWidget, '113+?'.embed($__tune.isMac?'meta':'ctrl'), {__callback:function(){return true;}}, '', 'global'); // command/ctrl+q
	ac.widget.addKeyAction(ac.widget.rootWidget, '119+?'.embed($__tune.isMac?'meta':'ctrl'), {__callback:function(){return true;}}, '', 'global'); // command/ctrl+w
	ac.widget.addKeyAction(ac.widget.rootWidget, '91+?'.embed($__tune.isMac?'meta':'ctrl'), {__callback:function(){return true;}}, '', 'global'); // command/ctrl+[
	ac.widget.addKeyAction(ac.widget.rootWidget, '93+?'.embed($__tune.isMac?'meta':'ctrl'), {__callback:function(){return true;}}, '', 'global'); // command/ctrl+]

	var progress_bar = $('splash').g('strong');
	var progress_meter = '.';
	var timer = setInterval(function()
	{
		if (progress_bar && progress_bar.is())
		{
			var c = 16 * progress_meter.length;
			progress_bar.t(progress_meter).s('color:rgb(?,?,?)'.embed(c, c, c));
			progress_meter += '.';
			if (16 == progress_meter.length)
			{
				progress_meter = '.';
			}
		}
	}, 100);
	client.model.loadPreferences(function(result)
	{
		if ( result )
		{
			clearInterval(timer);
			progress_bar.p().rs();
            //client.controller.showBundleEditor();
			client.onlaunch();
		}
		else
		{
			// TODO: error handling, possibly showing some message saying `error occured`...
		}
	});
}

client.onlaunch = function()
{
	var h = fry.ui.info.page.height;
	var w = fry.ui.info.page.width;
	client.nodes.top = $().a($$()).pos(true).x(0).y(0).n('top').w(w).h(22);
	client.nodes.left = $().a($$()).pos(true).x(0).y(22).n('left').w(299).h(h-22);
	client.nodes.right = $().a($$()).pos(true).x(300).y(22).n('right').w(w-300).h(h-22).a($$()).pos(true).x(0).y(4).w(w-300).h(h-26);
	
	// creating menu
	var root_item = $new(ACElement);
	root_item.setState(root_item.STATE_WILL_LOAD);
	root_item.properties.isVisible = true;
	root_item.properties.isActive = true;
	root_item.properties.isSeparator = false;
	var widget = $new
	(
		ac.MenuWidget,
		$new(amy.MainMenuModel, root_item),
		$new(amy.MainMenuView, {startsWithTopMenuBar:true}),
		$new(amy.MainMenuController)
	);
	widget.show(client.nodes.top);
	client.widgets.menuTop = widget;

	// creating left pane
	// - 	creating left/bottom pane
	client.nodes.left.a($$()).n('bottom').pos(true).x(0).y(h-45).w(299).h(22);
	// -	creating tabpane
	widget = $new
	(
		ac.TabPaneWidget,
		$new(ac.TabPaneWidgetModel, [
			{label:$loc('project_pane'), adapter:$new(amy.LeftPaneController)},
			{label:$loc('collaborate_pane'), adapter:$new(amy.LeftPaneController)}			
		]),
		$new(amy.LeftPaneView, {position:'bottom', startingTabOffset:0, hasTabClosingButtons:false})
	);
	widget.show(client.nodes.left, 'left-pane');
	client.widgets.leftPane = widget;
	
	client.nodes.leftSplitter = client.nodes.left.lc().a($$()).n('left-splitter').pos(true).y(h-44).x(282);
	client.nodes.leftSplitter.addDrag(fry.ui.drag.MODE_HORIZONTAL, 
		function ()
		{
			return client.nodes.leftSplitter;
		},
		function ()
		{
		},
		function (node, nx, ny, ox, oy)
		{
			if (200>nx)
			{
				nx = 200;
			}
			if (600<nx)
			{
				nx = 600;
			}
			client.controller.resizeMainPanes(nx+17);
			return { x: nx, y: ny };
		},
		function()
		{
			client.controller.resizeMainPanes(fry.ui.drag.dragNode.x()+17);
			return true;
		},
		function()
		{
		},
		function()
		{
			var cursor_node = client.nodes.leftSplitter.dup(true);
			cursor_node.a($$()).w(1).h(h).pos(true).x(16).y(44-h).s('border-right:1px solid #cacaca').p().a($$()).w(w+16).h(1).pos(true).x(-w).y(-1).s('border-top:1px solid #cacaca');
			return cursor_node;
		}
	);

	// -	- collaboration pane
	

							
	// creating right pane
	// -	creating tabpane
	widget = $new
	(
		ac.TabPaneWidget,
		$new(ac.TabPaneWidgetModel, []),
		$new(amy.RightPaneView, {position:'top', tabSpacing:2, startingTabOffset:3})
	);
	widget.show(client.nodes.right, 'right-pane');
	client.widgets.rightPane = widget;
	amy.isReady = true;
	if ('' != client.conf.defaultProjectUrl)
	{
		client.controller.showOpenProject(client.conf.defaultProjectUrl);
	}
	else
	{
		// check collaboration hash link
		if ('' != client.conf.collaboration.hash)
		{
			client.commands.file__collaboration__accept(client.conf.collaboration.hash);
		}
	}
}


client.controller.resizeMainPanes = function(leftPaneWidth)
{
	var w = fry.ui.info.page.width;
	var h = fry.ui.info.page.height-22;
	client.nodes.left.w(leftPaneWidth);
	var rw = w-leftPaneWidth-1;
	client.nodes.right.p().w(rw).x(leftPaneWidth+1).fc().w(rw).h(h-4);
	ac.widget.resize(client.widgets.leftPane, leftPaneWidth, h);
	ac.widget.resize(client.widgets.rightPane, rw, h-4);
	client.nodes.leftSplitter.x(leftPaneWidth-17);
	client.nodes.left.fc().w(leftPaneWidth);
	client.nodes.projectsNode.w(leftPaneWidth);	
	if (client.widgets.projectsAccordion)
	{
		ac.widget.resize(client.widgets.projectsAccordion, leftPaneWidth, h);
	}
}

client.controller.showPopupMenu = function(referingNode, loadElementsCallback, performActionCallback)
{
	if ( null != client.widgets.menuPopup )
	{
		client.widgets.menuPopup.hide();
		client.nodes.menuPopup.rs();
	}
	else
	{
		client.widgets.menuPopup = $new
		(
			ac.MenuWidget,
			$new(amy.PopupMenuModel, $new(ACElement)),
			$new(amy.PopupMenuView, {startsWithTopMenuBar:false}),
			$new(amy.PopupMenuController)
		);
	}

	client.callbacks.popupMenuLoadElements = loadElementsCallback;
	client.callbacks.popupMenuPerformAction = performActionCallback;

	var menu = client.widgets.menuPopup;
	var model = menu.model;
	model.rootElement.setState(model.rootElement.STATE_WILL_LOAD);
//    var node = referingNode.a($$()).pos(true).x(-1000).v(false);
//    menu.show(node, 'popup');
    menu.show(referingNode, 'popup');
	/*
	var menu_height = menu.menuNodes[0].h();
	var menu_width = menu.menuNodes[0].w();

	var pos = referingNode.abspos();
	var pos_at = 'top';
	if ( pos.y+menu_height > fry.ui.info.page.height )
	{
		pos_at = 'bottom';
		// Gecko on mac has troubles overwriting scrollbars
		if ( $__tune.isGecko && $__tune.isMac )
		{
			pos.y -= 19;
		}
	}
	if ( pos.x+30+menu_width > fry.ui.info.page.width )
	{
		pos.x -= (menu_width+30);
	}
	menu.menuNodes[0].x(pos.x).y(('bottom' == pos_at ? (pos.y-menu_height) : pos.y));//+Math.floor(referingNode.h()/2));
	client.nodes.menuPopup = node.v(true);
	*/
	client.nodes.menuPopup = menu.renderingNode;//node.v(true);
}


client.controller.checkIfActiveResource = function()
{
	return null != client.controller.getActiveResource();
}

client.controller.checkIfCanClose = function()
{
	return null != client.controller.getActiveResource();
}

client.controller.checkIfCanSave = function()
{
	var resource = client.controller.getActiveResource();
	if (null == resource)
	{
		return false;
	}
	// TODO !
	return 0 != client.model.projects.length;
	return true;
	return !resource.isShared;
}

client.controller.checkIfCanSaveAs = function()
{
	// must have resource (working document)
	var resource = client.controller.getActiveResource();
	if (null == resource)
	{
		return false;
	}
	// must have a project to save to
	return 0 != client.model.projects.length;
	
	// TODO !
	return true;
	return !resource.isShared;
}

client.controller.checkIfOpenFilePossible = function()
{
	return 0 != client.model.projects.length;
}

client.controller.checkIfNewFolderPossible = function()
{
	return 0 != client.model.projects.length;
}

client.controller.checkIfCollaborationPossible = function()
{
	var resource = client.controller.getActiveResource();
	if (null == resource)
	{
		return false;
	}
	return !resource.isShared;
}

/*  ---------------------------------------------------------------- 
	amy.LeftPaneController < ac.TabPaneWidgetController
*/

$class('amy.LeftPaneController < ac.TabPaneWidgetController');

amy.LeftPaneController.prototype.onOpen = function(pane, index, node)
{
	var renderers = [this.renderProjectPane, this.renderCollaboratePane];
	node.h(client.nodes.left.h()-22);
	renderers[index](pane, node);
}

amy.LeftPaneController.prototype.onClose = function()
{
	return false;
}

amy.LeftPaneController.prototype.renderProjectPane = function(pane, node)
{
	node.w(node.w()+2);
	node.a($$()).pos(true).t(client.conf.masquerade?'':$loc('sc_no_project_opened')).v(true);
	node.a($$()).pos(true).w(node.w()).h(node.h()).v(false);
	client.nodes.projectsNode = node;
}

amy.LeftPaneController.prototype.renderCollaboratePane = function(pane, node)
{
	node.w(node.w()+2);
	client.nodes.collaborationList = node.a($$()).pos(true).h(node.h()).v(false);
	client.nodes.collaborationEmpty = node.a($$()).pos(true).h(node.h()).t($loc('sc_no_collaboration_active')).v(true);
	client.controller.collaborationRenderUpdate = true;
	client.controller.renderCollaborationList();
}

client.controller.toggleProjectAccordion = function(forceDefaultHide)
{
	var is_visible = forceDefaultHide ? true : client.nodes.projectsNode.fc().v();
	client.nodes.projectsNode.fc().v(!is_visible);
	client.nodes.projectsNode.lc().v(is_visible);
}

client.controller.editorPassTroughKeysListener = function(keyCode, mask)
{
	var control_key_mask = $__tune.isMac ? fry.keyboard.META_KEY : fry.keyboard.CTRL_KEY;
	var result = $__tune.isMac && $__tune.isGecko ? fry.keyboard.CTRL_KEY == (mask & fry.keyboard.CTRL_KEY) : false;
	if (result || control_key_mask == (mask & control_key_mask))
	{
		if (115 == keyCode)
		{
			// Command/Ctrl + S
			client.commands.file__save();
			result = true;
		}
		else if (110 == keyCode)
		{
			// Command/Ctrl + N
			client.commands.file__new();
			result = true;
		}
		else if (111 == keyCode)
		{
			// Command/Ctrl + O
			client.commands.file__open_file();
			result = true;
		}
		else if (48 == keyCode)
		{
			// Command/Ctrl + 0
			client.commands.view__font__default();
			result = true;
		}
		else if (119 == keyCode || 113 == keyCode)
		{
			// Command/Ctrl + W|Q
			result = true;
		}
	}
	if (!result)
	{
		control_key_mask += fry.keyboard.SHIFT_KEY;
		if (control_key_mask == (mask & control_key_mask))
		{
			if (44 == keyCode || 46 == keyCode)
			{
				// move right tabpane index to the left/right (Command|Ctrl + Shift + ,|.) - alias for Command/Ctrl + Alt + arrows left/right
				client.commands.navigation__move_file_tab(46 == keyCode ? 1 : -1);
				result = true;
			}
			// else if (49 < keyCode && 58 > keyCode)
			// {
			// 	var active_index = keyCode-49;
			// 	if (client.widgets.rightPane.model.panes.length > active_index)
			// 	{
			// 		client.widgets.rightPane.switchPane(active_index);
			// 	}
			// 	result = true;
			// }
		}
	}
	if (!result)
	{
		control_key_mask = fry.keyboard.ALT_KEY + ($__tune.isMac ? fry.keyboard.META_KEY : fry.keyboard.CTRL_KEY);
		if (control_key_mask == (mask & control_key_mask))
		{
			if (-37 == keyCode)
			{
				client.commands.navigation__prev_file_tab();
				result = true;
			}
			else if (-39 == keyCode)
			{
				client.commands.navigation__next_file_tab();
				result = true;
			}
		}
	}
	return result;
}


/*  ---------------------------------------------------------------- 
	amy.RightPaneController < ac.TabPaneWidgetController
*/

$class('amy.RightPaneController < ac.TabPaneWidgetController');


amy.RightPaneController.prototype.onOpen = function(pane, index, node)
{
	var acElem = pane.acElem;
	var me = this;
	node.s('border-top:1px solid #ccc').h(client.nodes.right.h()-23).w(node.p().w()).rc();
	pane.node = node;

	var createEditor = function(languageId, themeId, tabelator, source)
	{
		// preparing node stubs
		var w = node.w();
		var h = node.h();
		var node_views = node.a($$()).pos(true).x(0).y(1).w(w).h(h-18);
		var node_status = node.a($$()).pos(true).x(0).y(h-17).w(w).h(17);
		var remote_url = 'php' == client.conf.environment ? 'backend/amy_rexec.php' : '/amy_rexec/?/';
		
		pane.editor = $new(ac.chap.Window, {language:client.model.getLanguageClass(languageId), keymap:client.model.getKeymapClass(languageId), remoteBackendURL:remote_url});
		pane.editor.parentWidget = client.widgets.rightPane;
		pane.editor.addPassThroughKeysListener(client.controller.editorPassTroughKeysListener);
		
		pane.selectedLanguageId = languageId;
		me.addEditorView(pane, -1, themeId, tabelator);
		pane.editor.show();
		pane.editor.edit(source);
		pane.editor.setSnippets(client.model.listSnippetsByLanguage(languageId));
		pane.editor.setCommands(client.model.listCommandsByLanguage(languageId));
		pane.editor.addCommandListener(client.controller.commandListener);
		pane.editor.addTransactionListener(client.controller.transactionListener);
		pane.editor.pane = pane;
		acElem.editor = pane.editor;
		client.view.hideFlashMessage();
	}
	
	// var language_id = 'Amy_default';
	// var theme_id = 'default';
	// var tabelator = '    ';

	if ( 'undefined' != typeof acElem.properties.content )
	{
		// shared or newly created (File->New), content already acquired
		client.view.showFlashMessage($loc('flash_loading_?_file'.embed(acElem.isShared?'shared':'new'), {name:amy.util.file_basename(acElem.properties.label)}));
		client.model.initializeBundleByExtension(client.model.util.getExtension(acElem.properties.label), 
			function(languageId, tab, themeId)
			{
				// done loading bundle, let's create resource editor
				createEditor(languageId, themeId, tab, acElem.properties.content);
			}
		);
		return;
	}

	// must load content prior displaying
	// check for record in file extensions - will load bundle if not initialized prior loading the resource
	client.model.initializeBundleByExtension(client.model.util.getExtension(acElem.path),
		function(languageId, tab, themeId)
		{
			// done loading bundle, let's load the resource
			client.view.showFlashMessage($loc('flash_loading_file', {name:amy.util.file_basename(acElem.path)}));
			client.model.loadProjectResource(acElem,
				function(content)
				{
					// done loading document, let's create resource editor
					createEditor(languageId, themeId, tab, content);
					// $foreach (['file__collaboration__invite', 'edit__mode__insert', 'edit__mode__overwrite'], function(id)
					// {
					// 	client.widgets.menuTop.model.getElementById(id).properties.isActive = true;
					// });
				},
				function(e)
				{
					client.view.showFlashMessage($loc('flash_loading_file_failed', {name:amy.util.file_basename(acElem.path)}), 3);
				}
			);
		}
	);
	client.controller.collaborationRenderUpdate = true;
}

amy.RightPaneController.prototype.addEditorView = function(pane, parentViewIndex, themeId, tabelator)
{
	var parent_node = -1 == parentViewIndex ? pane.node.fc() : $(pane.node.fc().$.childNodes.item(parentViewIndex));
	var mid_h = parent_node.h();
	if ( -1 != parentViewIndex )
	{
		mid_h = Math.floor(mid_h/2)-4;
		// resizing parent view
		parent_node.h(mid_h);
		parent_node.fc().h(mid_h);
		pane.editor.resizeView(parentViewIndex);
		// rendering split bar
		var node_split = parent_node.a($$()).pos(true).x(0).y(mid_h).h(8).w(parent_node.w()-18).n('split-bar').a($$()).n('unsplit').w(12).h(10).pos(true).x(1).y(1).e('click', function(evt)
		{
			// cancel the split
		}).p();
		node_split.addDrag(fry.ui.drag.MODE_VERTICAL, 
			function ()
			{
				return node_split;
			},
			function ()
			{
			},
			function (node, nx, ny, ox, oy)
			{
				// if (200>nx)
				// {
				// 	nx = 200;
				// }
				// if (600<nx)
				// {
				// 	nx = 600;
				// }
				// client.controller.resizeMainPanes(nx+17);
				return { x: nx, y: ny };
			},
			function()
			{
				// client.controller.resizeMainPanes(fry.ui.drag.dragNode.x()+17);
				return true;
			},
			function()
			{
			},
			function()
			{
				var cursor_node = node_split.dup(true);
//				cursor_node.a($$()).w(1).h(h).pos(true).x(16).y(44-h).s('border-right:1px solid #cacaca').p().a($$()).w(w+16).h(1).pos(true).x(-w).y(-1).s('border-top:1px solid #cacaca');
				return cursor_node;
			}
		);
		
	}

	var w = parent_node.w();
	// adding new view node
	var node_view = pane.node.fc().a($$()).pos(true).x(0).w(w).h(mid_h).y(0);
	if ( -1 != parentViewIndex )
	{
		node_view.y(parent_node.y()+mid_h+8);
		parent_node.h(mid_h);
	}
	
	var node_editor = node_view.a($$()).pos(true).x(0).y(0).w(w-18).h(mid_h+1);
	var node_collaborate = node_view.a($$()).pos(true).x(w-18).y(1).w(17).h(mid_h).s('background:#eee;border-left:1px solid #d0d0d0');
	pane.nodeCollaborate = node_collaborate;

	pane.selectedThemeId = themeId;

	var view_index = pane.editor.addView(node_editor, {theme:client.model.getThemeClass(themeId), wordWrap:true, tabelator:tabelator}, -1!=parentViewIndex);
	node_view.sa('view-index', view_index);
	var me = this;

	if ( -1 != parentViewIndex )
	{
		return;
	}
	var node = pane.node.lc();
	client.view.renderEditorStatus(node);
	node.g('td:0').s('padding-top:2px').a($crec('<img src="mm/i/status-ico-split.gif" width="10" height="10"/>', function()
	{
		// un/split active editor view
		var view_index = pane.editor.getActiveViewIndex();
		if ( -1 != view_index )
		{
			me.addEditorView(pane, view_index, pane.selectedThemeId, tabelator);
		}
	}));
	node.g('td:1').s('padding-top:2px').a($crec('<img src="mm/i/status-ico-info.gif" width="10" height="10"/>', function()
	{
		// document info

	}));
	// list and selection of bundles
	node.g('td:2').a($crec('&nbsp; &nbsp;', function()
	{
		client.controller.showPopupMenu(node.g('td:2'),
			function(acElem)
			{
				acElem.removeAllChildren();
				var bundles = client.model.listBundles();
				for ( var i=0; i<bundles.length; i++ )
				{
					var bundle = bundles[i];
					var is_initialized = 1 == bundle.state;
					var child_elem = acElem.appendChild($new(ACElement));
					child_elem.isCollection = is_initialized;
					child_elem.properties.label = bundle.name + (is_initialized ? '' : ' *');
					child_elem.bundleId = bundle.id;
					if ( is_initialized )
					{
						// creating snippets menu part
						var snippets = client.model.listSnippets(bundle.id);
						for ( var ii=0; ii<snippets.length; ii++ )
						{
							snip_elem = child_elem.appendChild($new(ACElement))
							snip_elem.isCollection = false;
							snip_elem.properties.label = snippets[ii].name.encodeMarkup();
							snip_elem.bundleId = bundle.id;
							snip_elem.snippetIndex = ii;
						}
					}
				}
			},
			function(acElem)
			{
				if ( 1 == client.model.bundles[acElem.bundleId].state )
				{
					// already initialized
					if ( $isset(acElem.snippetIndex) )
					{
						// snippet menu item
						var snippet = client.model.snippets[acElem.bundleId][acElem.snippetIndex];
						pane.editor.runAction(ac.chap.ACTION_CUSTOM, {action:'RunSnippet', snippetIndex:acElem.snippetIndex});
						pane.editor.renderText();
						ac.chap.setActiveComponent(pane.editor);
//						alert('Run '+snippet.name);
					}
					return;
				}
				client.view.showFlashMessage($loc('flash_loading_bundle', {name:acElem.properties.label}));
				client.model.initializeBundle(acElem.bundleId, function(result)
				{
					if ( result )
					{
						client.view.hideFlashMessage();
						console.info('Bundle `'+acElem.bundleId+'` initialized.');
					}
					else
					{
						client.view.showFlashMessage($loc('flash_loading_bundle_failed', {name:acElem.properties.label}), 3);
						console.info('Bundle `'+acElem.bundleId+'` failed.');
					}
				});
			}
		);
	})).s('display:block;width:auto').p().s('background-image:url(mm/i/status-ico-bundles.gif);background-repeat:no-repeat;background-position:?px 1px'.embed(node.g('td:2').w()-19));
	pane.editor.addCaretListener(function(caretRow, caretCol)
	{
		node.g('td:3').t($loc('editor_status_caret_position', {row:caretRow+1, col:caretCol+1}));
		client.view.hideTooltip();
	});
	var caret = pane.editor.caret;
	node.g('td:4').a($crec($loc('editor_status_caret_mode_'+caret.mode), function()
	{
		if ( 1 == pane.editor.caret.mode )
		{
			pane.editor.setEditMode(2);
		}
		else
		{
			pane.editor.setEditMode(1);
		}
		node.g('td:4').fc().t($loc('editor_status_caret_mode_'+caret.mode));
	}));
	// list and selection of languages
	node.g('td:5').a($crec(client.model.getLanguageName(pane.selectedLanguageId), function()
	{
		client.controller.showPopupMenu(node.g('td:5'),
			function(acElem)
			{
				acElem.removeAllChildren();
				var languages = client.model.listLanguages();
				for ( var i=0; i<languages.length; i++ )
				{
					var language = languages[i];
					var child_elem = acElem.appendChild($new(ACElement));
					child_elem.isCollection = false;
					child_elem.properties.label = language.name;
					child_elem.languageId = language.id;
				}
			},
			function(acElem)
			{
				pane.selectedLanguageId = acElem.languageId;
				node.g('td:5').fc().t(client.model.getLanguageName(acElem.languageId));
				pane.editor.setTabelator(client.model.getLanguageTabelator(acElem.languageId));
				pane.editor.setLanguage(client.model.getLanguageClass(acElem.languageId));
				pane.editor.setSnippets(client.model.listSnippetsByLanguage(acElem.languageId));
				pane.editor.setCommands(client.model.listCommandsByLanguage(acElem.languageId));
			}
		);
	})).s('display:block;width:auto').p().s('background-image:url(mm/i/status-ico-arrows.gif);background-repeat:no-repeat;background-position:?px 1px'.embed(node.g('td:5').w()-4));
	// list and selection of themes
	node.g('td:6').a($crec(client.model.getThemeName(pane.selectedThemeId), function()
	{
		client.controller.showPopupMenu(node.g('td:6'),
			function(acElem)
			{
				acElem.removeAllChildren();
				var themes = client.model.listThemes();
				for ( var i=0; i<themes.length; i++ )
				{
					var theme = themes[i];
					var child_elem = acElem.appendChild($new(ACElement));
					child_elem.isCollection = false;
					child_elem.properties.label = theme.name;
					child_elem.themeId = theme.id;
				}
			},
			function(acElem)
			{
				pane.selectedThemeId = acElem.themeId;
				node.g('td:6').fc().t(client.model.getThemeName(acElem.themeId));
				pane.editor.setTheme(client.model.getThemeClass(acElem.themeId));
			}
		);
	})).s('display:block;width:auto').p().s('background-image:url(mm/i/status-ico-arrows.gif);background-repeat:no-repeat;background-position:?px 1px'.embed(node.g('td:6').w()-4));

	node.g('td:7').t('<img src="mm/i/ico-method.gif" />');	
}

amy.RightPaneController.prototype.onClose = function(pane, index)
{
	pane.acElem.properties.isOpen = false;
	pane.acElem.editor = null;
    if ( this.collaborateThread )
    {
        clearInterval(this.collaborateThread);
        $delete(this.collaborateInfo);
    }
	var resource = pane.acElem;
    // console.log('%o', resource);
    if (!resource.isNew)
    {
        client.model.removeOpenedResource(resource);
    }
	if (resource.collaboration)
	{
		resource.collaboration.stop();
	}
    pane.editor.pane = null;
	$delete(pane.editor);
	client.controller.collaborationRenderUpdate = true;
	// if ( 1 == client.widgets.rightPane.model.panes.length )
	// {
	// 	$foreach (['file__collaboration__invite', 'edit__mode__insert', 'edit__mode__overwrite'], function(id)
	// 	{
	// 		client.widgets.menuTop.model.getElementById(id).properties.isActive = false;
	// 	});
	// }
	return true;
}

amy.RightPaneController.prototype.onShow = function(pane, index, activePaneIndex)
{
	if (null == pane.acElem.path)
	{
		// not part of the project
	}
	else
	{
		var root_tree_item = pane.acElem.rootElement;
		root_tree_item.accordionPane.model.widget.switchPane(root_tree_item.accordionPane.index);
		root_tree_item.tree.changeSelection(pane.acElem, true);
	}
	ac.widget.focus(pane.editor);
	client.controller.collaborationRenderUpdate = true;
	// if ($__tune.isSafari)
	// {
	// 	// safari has bug with scrolling - doesn't keep scrollbar positions when returned to view
	// 	pane.editor.renderText();
	// }
	return true;
}

client.controller.commandListener = function(component, keyCode, controlKeysMask, caretRow, caretCol, command, params)
{
    // getting input text
    var input = '';
    switch (command.input_type)
    {
        case 'none':
        {            
        };break;
        case 'selected_text':
        {
            input = component.getSelection();
            if ( command.output_type in ['replace_selected_text', 'insert_as_text', 'insert_as_snippet'] )
            {
                component.runAction(ac.chap.ACTION_DELETE, {character:true});
            }
        };break;
        default: // entire_document
        {
            input = component.getText();
        }
    }
    if ( '' == input )
    {
        switch (command.input_type_or)
        {
            case 'document':
            {
                input = component.getText();
            };break;
            case 'line':
            {
                input = component.getLineAt(caretRow);
            };break;
            case 'word':
            {
                input = component.getWordAt(caretRow, caretCol);
            };break;
            case 'char':
            {
                input = getCharAt(caretRow, caretCol);
            };break;
        }
    }
    // calling the command remote
    $rpost
    (
        {a:'command', bundle:command.bundle_id, command:command.path + '/' + command.filename, text:input},
        function(result)
        {
            switch ( command.output_type )
            {
                case 'discard': // do nothing
                {
                };break;
                case 'replace_document': case 'replace_selected_text': case 'insert_as_text':
                {
                    if ( 'replace_document' == command.output_type )
                    {
                        component.runAction(ac.chap.ACTION_SELECTION, {all:true});                        
                        component.runAction(ac.chap.ACTION_DELETE, {character:true});
                    }
                    component.runAction(ac.chap.ACTION_INSERT, {string:result});
        			component.processActionResult(true, true);
                };break;
                case 'insert_as_snippet':
                {
					var snippet = {};
					if ( snippet.tab_activation )
					{
						snippet.tab_activation = 'virtual';
					}
					snippet.code = result;
					snippet.name = 'virtual';
					console.log('snippet: %o', snippet);
					result = component.runAction(ac.chap.ACTION_CUSTOM, {action:'RunVirtualSnippet', snippet:snippet});
					component.processActionResult(ac.chap.ACTION_RES_REDRAWTEXT==(result & ac.chap.ACTION_RES_REDRAWTEXT), ac.chap.ACTION_RES_REDRAWCARET==(result & ac.chap.ACTION_RES_REDRAWCARET));
					if ( ac.chap.ACTION_RES_SELECTIONCHANGED==(result & ac.chap.ACTION_RES_SELECTIONCHANGED) )
					{
						component.hideCaret();
					}
                };break;
                case 'show_as_html':
                {
//                    console.info('HTML: %s', result);
                    client.view.showHTMLPageWindow(command.name, result, function()
                    {
                        // callback when closed
                    });
                };break;
                case 'show_as_tooltip':
                {
//                    console.info('Tooltip: %s', result);
                    var pos = component.getCaretAbsolutePosition();
                    if ( null != pos )
                    {
                        client.view.showTooltip(pos[0], pos[1], result);
                    }
                };break;
                case 'create_new_document':
                {
//                    console.info('New document: %s', result)
                    client.commands.file__new(command.name+'.txt', result);
                };break;
            }
            console.info(result);
        },
        function(e)
        {
            client.view.showFlashMessage(e, 2);
        },
        'POST', component.options.remoteBackendURL
    );
//    console.log(input);
//    console.log('Command: %s -> %o keycode: %s', params.commandIndex, command, keyCode);
//	component.runAction(ac.chap.ACTION_INSERT, {string:'Ahoj '+params.commandIndex});
//	return ac.chap.ACTION_RES_REDRAWCARET | ac.chap.ACTION_RES_REDRAWTEXT | ac.chap.ACTION_RES_SELECTIONCHANGED;
	return ac.chap.ACTION_RES_SELECTIONCHANGED;
}

client.controller.transactionListener = function(component, type, userId, startRow, startCol, numNewRows, numExistingRows, source)
{
    /*
    ac.chap.TRANSLOG_TYPE_REMOVE
    ac.chap.TRANSLOG_TYPE_INSERT
    */
	// console.warn('type: %s  userId: %s, startRow: %s, startCol: %s, numNewRows: %s, numExistingRows: %s, source: %s', type, userId, startRow, startCol, numNewRows, numExistingRows, source);
	// console.info('Caret absolute position: %o', component.getCaretAbsolutePosition(startRow, startCol));
	// console.info('Absolute char position: %o', component.activeView.getRenderedCharPosition(startRow, startCol));

    var pane = component.pane;
    if ( $notset(pane.collaborateThread) )
    {
        pane.collaborateInfo = [];
        var node = component.pane.nodeCollaborate;
        pane.collaborateThread = setInterval(function()
        {
            var num_rows = component.getNumRows();
            var h = node.h();
            var row_height = h / num_rows;
            var t = component.getTimestamp();
            var fade_in_msecs = 20000;
            var node_buffer = $$();
            for ( var i in pane.collaborateInfo )
            {
                var nodes = [];
				// console.debug(pane.collaborateInfo[i]);
                for ( var ii in pane.collaborateInfo[i] )
                {
                    var state = t - pane.collaborateInfo[i][ii][0];
                    if ( fade_in_msecs > state )
                    {
						var row_index = i;
                        nodes.push(node_buffer.a($$()).pos(true).x(6).y(Math.floor(row_height*i)-1).w(12).h(Math.max(2, Math.floor(row_height))).s('background-color: '+(pane.editor.userId==ii?'#78AAF0':'#AA4C10')+';background-image:url(mm/i/editor-collaborate-bg.png);background-repeat:repeat-y').o(1-state/fade_in_msecs).sa('row-index', row_index).e('click', function(evt)
						{
							evt.stop();
							ac.widget.focus(component);
							component.activeView.scrollToRow(evt.$.ga('row-index'), true);
						}).e('mouseover', function(evt)
						{
							evt.stop();
							evt.$.$.title = 'Line ?'.embed(parseInt(evt.$.ga('row-index'))+1);
						}));
                        continue;
                    }
                    delete pane.collaborateInfo[i][ii];
                }
                var num_nodes = nodes.length;
                if ( 1 < num_nodes )
                {
                    // adjusting widths
                    var node_w = Math.max(1, Math.floor(12/num_nodes));
                    for ( ii=0; ii<num_nodes; ii++ )
                    {
                        nodes[ii].w(node_w).x(6+ii*node_w);
                    }
                }
                if ( 0 != pane.collaborateInfo[i].length )
                {
                    continue;
                }
                delete pane.collaborateInfo[i];
            }
			// rendering actual rowview
//			var first_visible_rows = 
            node.rc().a(node_buffer);//t(node_buffer.t());
        }, 3500);
    }
    if ( $notset(pane.collaborateInfo[startRow]) )
    {
        pane.collaborateInfo[startRow] = [];
    }
    pane.collaborateInfo[startRow][userId] = [component.getTimestamp()];
//    console.log(userId);
}



/*  ---------------------------------------------------------------- 
	amy.PopupMenuController < ac.MenuWidgetController
*/

$class('amy.PopupMenuController < ac.MenuWidgetController');

amy.PopupMenuController.prototype.isSeparator = function(acElem)
{
	return $getdef(acElem.properties.isSeparator, false);
}

amy.PopupMenuController.prototype.performAction = function(acElem)
{
	client.callbacks.popupMenuPerformAction(acElem);
}


/*  ---------------------------------------------------------------- 
	amy.MainMenuController < ac.MenuWidgetController
*/

$class('amy.MainMenuController < ac.MenuWidgetController');

amy.MainMenuController.prototype.isActive = function(acElem)
{
	if ('function' == typeof acElem.properties.isActive)
	{
		return acElem.properties.isActive();
	}
	return $getdef(acElem.properties.isActive, true);
}

amy.MainMenuController.prototype.isVisible = function(acElem)
{
	return $getdef(acElem.properties.isVisible, true);
}

amy.MainMenuController.prototype.isSeparator = function(acElem)
{
	return $getdef(acElem.properties.isSeparator, false);
}

amy.MainMenuController.prototype.getKeyCode = function(acElem)
{
	return acElem.properties.key || null;
}

amy.MainMenuController.prototype.performAction = function(acElem)
{
	if ( acElem.properties.commandId )
	{
		if ('function' != typeof client.commands[acElem.properties.commandId])
		{
			console.warn('Command %s not implemented yet.', acElem.properties.commandId);
			return;
		}
		try
		{
			if (!acElem.properties.commandParams)
			{
				client.commands[acElem.properties.commandId]();
			}
			else
			{
				var cmd = 'client.commands[acElem.properties.commandId]';
				var pars = [];
				for (var i=0; i<acElem.properties.commandParams.length; i++)
				{
					pars.push("acElem.properties['?']".embed(acElem.properties.commandParams[i]));
				}
				eval('?(?);'.embed(cmd, pars.join(',')));
			}
		}
		catch (e)
		{
			console.warn("Error while execiting command `%s': %o", acElem.properties.commandId, e);
		}
	}
}
