/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Common models

  *------------------------------------------------------------------------------------------
*/


client.model.loadPreferences = function(callback)
{
	$rpost
	(
		{a:'load_settings', name:'file-map'},
		function(settings)
		{
			$foreach (settings.file, function(mapping)
			{
				var tmp = mapping.split('|');
				if ( 1 == tmp.length )
				{
					console.warn('Invalid file mappings definition: '+mapping+'. Need to be in form: <extensions_list>|bundle_id|language_id.');
					return;
				}
				var bundle_id = tmp[1];
				var language_id = ( 2 == tmp.length ) ? bundle_id+'_default' : tmp[2];
				var theme_id = ( 3 > tmp.length ) ? 'default' : tmp[3];
				var extensions = tmp[0].split(',');
				for ( var i=0; i<extensions.length; i++ )
				{
					client.model.settings.extensionMap[extensions[i].substr(1)] = [bundle_id, language_id, theme_id];
				}
			});
			$rpost
			(
				{a:'list_themes'},
				function(themes)
				{
					$foreach ( themes, function(theme)
					{
						client.model.setupTheme(theme);
					})
					$rpost
					(
						{a:'list_bundles'},
						function(bundles)
						{
							$foreach ( bundles, function(bundle)
							{
								client.model.setupBundle(bundle);
							})
							// initializing default bundle
							client.model.initializeBundle('default', function(succeeded)
							{
								if ( succeeded )
								{
									console.info('Bundle `default` initialized and ready.');
									callback(true);						
								}
								else
								{
									console.error('Bundle `default` not initialized properly.');
									callback(false);
								}
							});
						},
						function(e)
						{
							console.error('Error while loading preferences (list_bundles): '+e);
							callback(false);
						}
					)
				},
				function(e)
				{
					console.error('Error while loading preferences (list_themes): '+e);
					callback(false);
				}
			)			
		},
		function(e)
		{
			console.error('Error while loading preferences (file-map): '+e);
			callback(false);
		}
	);

}


/* util namespace */

client.model.util = 
{
	getExtension: function(path)
	{
		var ix = path.lastIndexOf('.');
		if ( -1 == ix )
		{
			return '';
		}
		return path.substring(ix+1, path.length);
	}
}

/*	SETTINGS
	_______________________________________________________________ */

client.model.settings = {extensionMap:{}};




/*	Common model classes
	_______________________________________________________________ */

/*  ---------------------------------------------------------------- 
	amy.PopupMenuModel < ac.MenuWidgetModel
*/
$class('amy.PopupMenuModel < ac.MenuWidgetModel');

amy.PopupMenuModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
	client.callbacks.popupMenuLoadElements(acElem);
	callbackOnSuccess();
}

/*  ---------------------------------------------------------------- 
	amy.MainMenuModel < ac.MenuWidgetModel
*/
$class('amy.MainMenuModel < ac.MenuWidgetModel');

amy.MainMenuModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
	if ( 'bundle-snippets' == acElem.type )
	{
		return this.loadBundleSnippetsElement(acElem, callbackOnSuccess, callbackOnError);
	}
	if ( 'bundle-commands' == acElem.type )
	{
		return this.loadBundleCommandsElement(acElem, callbackOnSuccess, callbackOnError);
	}
	if ('identity' == acElem.type)
	{
		return this.loadIdentityElement(acElem, callbackOnSuccess, callbackOnError);
	}
	var g_item = null;
	var iem = null;
	
	if (!client.conf.masquerade)
	{
		// Amy
		g_item = acElem.appendChild($new(ACElement));
		g_item.isCollection = true;
		g_item.properties.label = $loc('mg_Amy');

		//		About
		var item = g_item.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.label = $loc('mi_Amy_About');
		item.properties.commandId = 'amy__about';

/*
		//		Preferences
		item = g_item.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.label = $loc('mi_Amy_Preferences');
		item.properties.commandId = 'amy__preferences';
*/	
	
	
	}

	// File
	g_item = acElem.appendChild($new(ACElement));
	g_item.isCollection = true;
	g_item.properties.label = $loc('mg_File');
	
	// 		New
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_File_New');
	item.properties.commandId = 'file__new';
	item.properties.key = ['?+?'.embed(110, $__tune.isMac?'meta':'ctrl'), 'global'];
	g_item.appendChild(item);

	// 		New From Template
	sg_item = g_item.appendChild($new(ACElement));
	sg_item.isCollection = true;
	sg_item.properties.label = $loc('mi_File_NewFromTemplate');


	// generating list of bundle templates
	for (var id in client.model.bundles)
	{
		var bundle = client.model.bundles[id];
		var n_item = sg_item.appendChild($new(ACElement));
		n_item.isCollection = true;
		n_item.properties.label = bundle.info.name;
		var i = 0;
		$foreach (bundle.templates, function(template)
		{
			var item = n_item.appendChild($new(ACElement));
			item.properties.bundleId = bundle.id;
			item.properties.templateIndex = i++;
			item.isCollection = false;
			item.properties.label = template.split(';')[1];
			item.properties.commandId = 'file__new_from_template';
			item.properties.commandParams = ['bundleId', 'templateIndex'];
		});
		if (0 == n_item.elements.length)
		{
			sg_item.removeChild(n_item);
		}
	}

    // 		------------------

    // 		New Folder
    item = g_item.appendChild($new(ACElement));
    item.isCollection = false;
    item.properties.label = $loc('mi_File_NewFolder');
    item.properties.commandId = 'file__new_folder';
	item.properties.isActive = client.controller.checkIfNewFolderPossible;


    // 		------------------
    item = g_item.appendChild($new(ACElement));
    item.isCollection = false;
    item.properties.isSeparator = true;

	// 		New From Disk
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_File_NewFromDisk');
	item.properties.commandId = 'file__new_from_disk';

	// 		New From URL
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_File_NewFromURL');
	item.properties.commandId = 'file__new_from_url';

    // 		------------------
    item = g_item.appendChild($new(ACElement));
    item.isCollection = false;
    item.properties.isSeparator = true;

    // 		Open project
    item = g_item.appendChild($new(ACElement));
    item.isCollection = false;
    item.properties.label = $loc('mi_File_OpenProject');
    item.properties.commandId = 'file__open_project';

    // 		Open file
    item = $new(ACElement);
    item.isCollection = false;
    item.properties.label = $loc('mi_File_OpenFile');
    item.properties.commandId = 'file__open_file';
	item.properties.isActive = client.controller.checkIfOpenFilePossible;
	item.properties.key = ['?+?'.embed(111, $__tune.isMac?'meta':'ctrl'), 'global'];
	g_item.appendChild(item);

	// 		------------------
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.isSeparator = true;
	
    // 		Refresh list
    item = $new(ACElement);
    item.isCollection = false;
    item.properties.label = $loc('mi_File_RefreshList');
    item.properties.commandId = 'file__refresh_list';
	item.properties.key = ['?+?'.embed(107, $__tune.isMac?'meta':'ctrl'), 'global']; // meta/ctrl + K
	g_item.appendChild(item);

	// 		------------------
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.isSeparator = true;
	
	// 		Collaboration
	sg_item = g_item.appendChild($new(ACElement));
	sg_item.isCollection = true;
	sg_item.properties.label = $loc('mi_File_Collaboration');
	
	// 			Invite
	item = sg_item.appendChild($new(ACElement, 'file__collaboration__invite'));
	item.isCollection = false;
	item.properties.label = $loc('mi_File_CollaborationInvite');
	item.properties.commandId = 'file__collaboration__invite';
	item.properties.isActive = client.controller.checkIfCollaborationPossible;
	
	// 			Accept
	item = sg_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_File_CollaborationAccept');
	item.properties.commandId = 'file__collaboration__accept';

	// 		------------------
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.isSeparator = true;

	// 		Save
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_File_Save');
	item.properties.commandId = 'file__save';
	item.properties.isActive = client.controller.checkIfCanSave;
	item.properties.key = ['?+?'.embed(115, $__tune.isMac?'meta':'ctrl'), 'global'];
	g_item.appendChild(item);

	// 		Save As
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_File_SaveAs');
	item.properties.commandId = 'file__save_as';
	item.properties.isActive = client.controller.checkIfCanSaveAs;

	// 		Save To Disk
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_File_SaveToDisk');
	item.properties.commandId = 'file__save_to_disk';
	item.properties.isActive = client.controller.checkIfCanClose;

	// 		------------------
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.isSeparator = true;

	// 		Close
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_File_Close');
	item.properties.commandId = 'file__close';
	item.properties.isActive = client.controller.checkIfCanClose;
	
	
	// Edit
	g_item = acElem.appendChild($new(ACElement));
	g_item.isCollection = true;
	g_item.properties.label = $loc('mg_Edit');

	//		Undo
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_Edit_Undo');
	item.properties.commandId = 'edit__undo';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['?+?'.embed(122, $__tune.isMac?'meta':'ctrl'), 'global'];
	g_item.appendChild(item);

	//		Redo
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_Edit_Redo');
	item.properties.commandId = 'edit__redo';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['?+?+shift'.embed(90, $__tune.isMac?'meta':'ctrl'), 'global'];
	g_item.appendChild(item);
	
	
	// 		------------------
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.isSeparator = true;

	//		Mode
	sg_item = g_item.appendChild($new(ACElement));
	sg_item.isCollection = true;
	sg_item.properties.label = $loc('mi_Edit_Mode');

	//			Insert
	item = sg_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_Edit_Mode_Insert');
	item.properties.commandId = 'edit__mode__insert';
	item.properties.isActive = client.controller.checkIfActiveResource;

	//			Overwrite
	item = sg_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_Edit_Mode_Overwrite');
	item.properties.commandId = 'edit__mode__overwrite';
	item.properties.isActive = client.controller.checkIfActiveResource;

	
	
	// 		------------------
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.isSeparator = true;

	//		Completion
	sg_item = g_item.appendChild($new(ACElement));
	sg_item.isCollection = true;
	sg_item.properties.label = $loc('mi_Edit_Completion');

	//			Next
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_Edit_Completion_Next');
	item.properties.commandId = 'edit__completion__next';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['-27', 'global', '<img src="mm/i/theme/apple/menu-symbol-escape.png" width="15" height="12"/>'];
	sg_item.appendChild(item);

	//			Previous
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_Edit_Completion_Prev');
	item.properties.commandId = 'edit__completion__prev';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['-27+shift', 'global', '<img src="mm/i/theme/apple/menu-symbol-escape.png" width="15" height="12"/>'];
	sg_item.appendChild(item);



	
	// View
	g_item = acElem.appendChild($new(ACElement));
	g_item.isCollection = true;
	g_item.properties.label = $loc('mg_View');

	// 		Font
	sg_item = g_item.appendChild($new(ACElement));
	sg_item.isCollection = true;
	sg_item.properties.label = $loc('mi_View_Font');

	//			Bigger
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_View_FontBigger');
	item.properties.commandId = 'view__font__bigger';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['?+?'.embed(43, $__tune.isMac?'meta':'ctrl'), 'global'];
	sg_item.appendChild(item);

	//			Smaller
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_View_FontSmaller');
	item.properties.commandId = 'view__font__smaller';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['?+?'.embed(45, $__tune.isMac?'meta':'ctrl'), 'global'];
	sg_item.appendChild(item);

	//			Default
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_View_FontDefault');
	item.properties.commandId = 'view__font__default';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['?+?'.embed(48, $__tune.isMac?'meta':'ctrl'), 'global'];
	sg_item.appendChild(item);

	// 			------------------
	item = sg_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.isSeparator = true;

	//			Custom selection
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_View_FontSelection');
	item.properties.commandId = 'view__font__selection';
	item.properties.isActive = client.controller.checkIfActiveResource;
	sg_item.appendChild(item);


	// 		Wrap
	sg_item = g_item.appendChild($new(ACElement));
	sg_item.isCollection = true;
	sg_item.properties.label = $loc('mi_View_Wrap');

	//			On
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_View_WrapOn');
	item.properties.commandId = 'view__wrap__on';
	item.properties.isActive = client.controller.checkIfActiveResource;
	sg_item.appendChild(item);

	//			Off
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_View_WrapOff');
	item.properties.commandId = 'view__wrap__off';
	item.properties.isActive = client.controller.checkIfActiveResource;
	sg_item.appendChild(item);


	// 		------------------
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.isSeparator = true;


	// 		Project
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_View_Project');
	item.properties.commandId = 'view__project';

	// 		Collaborate
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_View_Collaboration');
	item.properties.commandId = 'view__collaboration';


/*
	// 		Fast file browser
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_View_FastFileIndex');
	item.properties.commandId = 'view__fast_file_index';

	// 		Fast function browser
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_View_FastFunctionIndex');
	item.properties.commandId = 'view__fast_function_index';
*/

/*	
	// Text
	g_item = acElem.appendChild($new(ACElement));
	g_item.isCollection = true;
	g_item.properties.label = $loc('mg_Text');
*/

	// Navigation
	g_item = acElem.appendChild($new(ACElement));
	g_item.isCollection = true;
	g_item.properties.label = $loc('mg_Navigation');

	// 		AddBookmark
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_Navigation_ToggleBookmark');
	item.properties.commandId = 'navigation__toggle_bookmark';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['-113', 'global', 'F2'];
	g_item.appendChild(item)

	// 		NextBookmark
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_Navigation_NextBookmark');
	item.properties.commandId = 'navigation__next_bookmark';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['-113+?'.embed($__tune.isMac?'meta':'ctrl'), 'global', 'F2'];
	g_item.appendChild(item)

	// 		PrevBookmark
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_Navigation_PrevBookmark');
	item.properties.commandId = 'navigation__prev_bookmark';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['-113+shift+?'.embed($__tune.isMac?'meta':'ctrl'), 'global', 'F2'];
	g_item.appendChild(item)

	// 		------------------
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.isSeparator = true;

	// 		NextFileTab
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_Navigation_NextFileTab');
	item.properties.commandId = 'navigation__next_file_tab';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['-39+alt+?'.embed($__tune.isMac?'meta':'ctrl'), 'global', '<img src="mm/i/theme/apple/menu-symbol-arr_right.png" width="15" height="12"/>'];
	g_item.appendChild(item)

	// 		PrevFileTab
	item = $new(ACElement);
	item.isCollection = false;
	item.properties.label = $loc('mi_Navigation_PrevFileTab');
	item.properties.commandId = 'navigation__prev_file_tab';
	item.properties.isActive = client.controller.checkIfActiveResource;
	item.properties.key = ['-37+alt+?'.embed($__tune.isMac?'meta':'ctrl'), 'global', '<img src="mm/i/theme/apple/menu-symbol-arr_left.png" width="15" height="12"/>'];
	g_item.appendChild(item)


	// Bundles
	g_item = acElem.appendChild($new(ACElement));
	g_item.isCollection = true;
	g_item.properties.label = $loc('mg_Bundles');
	
	// 		Bundle Editor
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_Bundles_Bundle_Editor');
	item.properties.commandId = 'bundles__bundle_editor';

	// 		------------------
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.isSeparator = true;	


	// Dynamic list of bundles
	var bundles = client.model.listBundles();
	$foreach (bundles, function(bundle)
	{
		sg_item = g_item.appendChild($new(ACElement));
		sg_item.isCollection = true;
		sg_item.type = 'bundle';
		sg_item.properties.label = bundle.name.encodeMarkup();
		sg_item.properties.bundleId = bundle.id;

		var dg_item = sg_item.appendChild($new(ACElement));
		dg_item.isCollection = true;
		dg_item.type = 'bundle-snippets';
		dg_item.properties.label = 'Snippets';
		dg_item.properties.bundleId = bundle.id;
		dg_item.properties.path = '';
        dg_item.setState(dg_item.STATE_COLLAPSED | dg_item.STATE_WILL_LOAD);

		item = sg_item.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.isSeparator = true;	

		dg_item = sg_item.appendChild($new(ACElement));
		dg_item.isCollection = true;
		dg_item.type = 'bundle-commands';
		dg_item.properties.label = 'Commands';
		dg_item.properties.bundleId = bundle.id;
		dg_item.properties.path = '';
        dg_item.setState(dg_item.STATE_COLLAPSED | dg_item.STATE_WILL_LOAD);
	});
	
	
	// Identity
	g_item = acElem.appendChild($new(ACElement));
	g_item.isCollection = true;
	g_item.type = 'identity';
	g_item.properties.label = $loc('mg_Identity');
    g_item.setState(g_item.STATE_WILL_LOAD);
	client.model.user.rootMenuIdentityElement = g_item;
	
	
	// Tools
	g_item = acElem.appendChild($new(ACElement));
	g_item.isCollection = true;
	g_item.properties.label = $loc('mg_Tools');
	
	// 		Export syntax highlighting
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_Tools_ExportSyntaxHighlighting');
	item.properties.commandId = 'tools__export_syntaxt_highlighting';

	
	// Help
	g_item = acElem.appendChild($new(ACElement));
	g_item.isCollection = true;
	g_item.properties.label = $loc('mg_Help');
	
	// 		Contents
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_Help_Contents');
	item.properties.commandId = 'help__contents';


	// 		Blog
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_Help_Blog');
	item.properties.commandId = 'help__blog';
	
	
	// Debug
	g_item = acElem.appendChild($new(ACElement));
	g_item.isCollection = true;
	g_item.properties.label = $loc('mg_Debug');
	
	//		Show Console
	item = g_item.appendChild($new(ACElement));
	item.isCollection = false;
	item.properties.label = $loc('mi_Debug_Show_Console');
	item.properties.commandId = 'debug__show_console';
	

	callbackOnSuccess();
}
