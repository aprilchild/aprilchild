/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	UI commands dispatcher

  *------------------------------------------------------------------------------------------
*/

client.commands = {};
client.commands.amy__about = function()
{
	client.view.showHTMLDialogWindow($loc('mg_Amy'), 'contents/about.html');
}

client.commands.amy__preferences = function()
{
	console.info('Amy>Preferences');
}

client.commands.identity__sign_in = function()
{
	client.controller.userSignIn();
}

client.commands.identity__sign_out = function()
{
	client.controller.userSignOut();
}

client.commands.identity__register = function()
{
	client.controller.userRegister();
}

client.commands.identity__change_icon = function()
{
	client.controller.userChangeIcon();
}

client.commands.identity__address_book = function()
{
	client.controller.showAddressBook();
}

client.commands.identity__notifications = function()
{
//	client.controller.showAddressBook('browser');
}

client.commands.file__new = function(documentName, documentText)
{
	client.controller.createNewResource($getdef(documentName, $loc('doc_untitled')), $getdef(documentText, ''));
}

client.commands.file__new_from_template = function(bundleId, templateIndex)
{
	client.model.initializeBundle(bundleId, function(bundle)
	{
		if (bundle.templates[templateIndex])
		{
			var template = bundle.templates[templateIndex];
		    client.view.showWizardDialogWindow($loc('wt_new_filename'), 'new_filename', {mask:template.filename, name:template.name, callbackComplete:function(name)
			{
				var title = template.filename.replace(/\$AMY\{name\}/g, name);
				var content = template.content.replace(/\$AMY\{name\}/g, name).replace(/\$AMY\{camelize:name\}/g, amy.util.camelize(name));
				content = content.replace(/\$AMY\{date_created\}/g, new Date()).replace(/\$AMY\{user_nickname\}/g, client.conf.user.credentials.nickname);
				client.controller.createNewResource(title, content);
			}}, client.conf.locale, {width:434, height:260});
		}
	})
	console.log('bundleid: %s, template: %s', bundleId, templateIndex);
	// client.controller.createNewResource($getdef(documentName, $loc('doc_untitled')), $getdef(documentText, ''));
}

client.commands.file__open_project = function()
{
    client.controller.showOpenProject();
}

client.commands.file__open_remote = function()
{
}

client.commands.file__open_file = function()
{
	client.view.showFileChooser(function(resource)
	{
		if (null != resource)
		{
			client.controller.openResource(resource, true);
		}
	});
}

client.commands.file__refresh_list = function()
{
    var pane = client.widgets.projectsAccordion.getActivePane();
    if (null == pane)
    {
        return;
    }
    var tree = pane.tree;
    var project = pane.project;
    var selected_tree_elem = tree.getSelection();
    if (0 == selected_tree_elem.length)
    {
        selected_tree_elem = project.treeRootItem;
    }
    else
    {
        selected_tree_elem = selected_tree_elem[0];
    }
    if (!selected_tree_elem.isCollection)
    {
        selected_tree_elem = selected_tree_elem.parentElement;
    }
    selected_tree_elem.setState(selected_tree_elem.STATE_WILL_LOAD);
    tree.redrawElement(selected_tree_elem, function(result)
    {
        if (!result)
        {
            console.error('Error while loading elements.');
            return;
        }
        var project = client.model.getProjectForResource(selected_tree_elem);
        for (var i=0 in project.openedResources)
        {
            var opened_resource = project.openedResources[i];
            if (selected_tree_elem.path == opened_resource.path.substr(0, selected_tree_elem.path.length))
            {
                // in the path, need to reload as well
                // console.log('re-open %o', opened_resource);
                // console.log('in %i, %o', selected_tree_elem.elements.length, selected_tree_elem);
                var new_opened_resource = selected_tree_elem.search(function(resource)
                {
                    // console.log(opened_resource.path + ' vs ' + resource.path);
                    if (opened_resource.path == resource.path)
                    {
                        return resource;
                    }
                    return null;
                });
                if (!new_opened_resource)
                {
                    console.warn('New resource element could not been found.');
                }
                else
                {
                    new_opened_resource.properties.isOpen = true;
                    new_opened_resource.editor = opened_resource.editor;
                    // new_opened_resource.editor.pane = opened_resource.editor.pane;
            		var tabpane = client.widgets.rightPane;
            		for (var i in tabpane.model.panes)
            		{
            			if (tabpane.model.panes[i].acElem == opened_resource)
            			{
            			    tabpane.model.panes[i].acElem = new_opened_resource;
            				break;
            			}
            		}
                    project.openedResources[i] = new_opened_resource;
		            tree.changeSelection(new_opened_resource, true);
                    // console.log('new resource %o', new_opened_resource);
                }
                // var content = opened_resource.editor.getText();
            }
            else
            {
                // unchanged
                // console.log('unchanged: %o', opened_resource)
            }
        }            
    });
}

client.commands.file__save = function()
{
	var resource = client.controller.getActiveResource();
	if ( null == resource )
	{
		return;
	}
	if (resource.properties.isNew)
	{
		return client.commands.file__save_as();
	}
	client.view.showFlashMessage($loc('flash_saving_file', {name:amy.util.file_basename(resource.path)}));
	client.model.saveProjectResource(resource,
		function()
		{
			client.view.hideFlashMessage();
		},
		function(e)
		{
			client.view.showFlashMessage($loc('flash_saving_file_failed', {name:amy.util.file_basename(resource.path)}), 3);
			console.warn('Error while saving: %s', e);
		}
	);
}

client.commands.file__save_as = function()
{
	var resource = client.controller.getActiveResource();
	if ( null == resource )
	{
		return;
	}
	client.view.showFileChooser(function(selectedResource, parentResource, filename)
	{
		if (null != parentResource)
		{
			var content = resource.editor.getText();
			var full_path = (parentResource.path + '/' + filename).replace(/\/\//g, '/');
			client.view.showFlashMessage($loc('flash_saving_file', {name:amy.util.file_basename(full_path)}));
			client.controller.saveNewResource(resource, filename, content, parentResource, 
			function(r)
			{
				client.view.hideFlashMessage();
				if (null == r)
				{
					// saving to resource that already exists - user was prompted and canceled overwrite. so, nothing actually happened, but it's not an error per se.
					return;
				}
				// saving succeeded
				resource.properties.isNew = false;
				resource.isCollection = false;
				resource.properties.label = r.basename;
				resource.properties.size = r.size;
				resource.properties.dateCreated = r.date_created;
				resource.properties.dateModified = r.date_modified;
				resource.properties.contentType = r.content_type;
				resource.properties.version = r.version;
				resource.path = '?/?'.embed(parentResource.path, r.basename).replace(/\/\//g, '/');
				resource.setState(resource.STATE_LOADED|resource.STATE_COLLAPSED);
				parentResource.appendChild(resource);
				try
				{
					client.widgets.rightPane.renderTitles();
					var tree = parentResource.rootElement.tree;
					tree.hide();
					parentResource.sort(function(elem){return elem.properties.label.toLowerCase()});
					tree.show(tree.containerNode, 'amy-project');
				}
				catch (e)
				{
					console.error('Error: %o', e);
				}
			},
			function(e)
			{
				// failed
				client.view.showFlashMessage($loc('flash_saving_file_failed', {name:amy.util.file_basename(full_path)}), 3);
			});
		}
	}, resource.properties.label);
}

client.commands.file__save_to_disk = function()
{
	var resource = client.controller.getActiveResource();
	if ( null == resource )
	{
		return;
	}
	client.model.saveResourceToDisk(resource);
}

client.commands.file__collaboration__invite = function()
{
	var resource = client.controller.getActiveResource();
	if ( null == resource )
	{
		return;
	}
	var message = resource.editor.getText().substring(0, 100);
    client.view.showWizardDialogWindow($loc('wt_collaboration_invite'), 'collaboration_invite', {resource:resource, message:message, callbackComplete:
		function(collaboration)
		{
			// console.log(collaboration);
			client.view.showFlashMessage($loc('flash_invitation_hash', {hash:collaboration.invitationHash}), 7);
			client.controller.startMessaging();
		}
	}, client.conf.locale, {width:732, height:420});
}

client.commands.file__collaboration__accept = function(hash)
{
	function proceed(hash)
	{
		client.view.showFlashMessage($loc('flash_invitation_accept'));
		client.model.acceptCollaboration(hash, function(collaboration)
		{
			console.info('Accepted invitation %s', collaboration.invitationId);
			client.view.showFlashMessage($loc('flash_invitation_accept_succeeded'), 3);
			client.view.hideFlashMessage();
			client.controller.startMessaging();
		},
		function(e)
		{
			client.view.showFlashMessage($loc('flash_invitation_accept_failed'), 3);
			console.warn(e);
		});		
	}
	if ('undefined' == typeof hash || 32 != hash.length)
	{
	    client.view.showWizardDialogWindow($loc('wt_collaboration_accept'), 'collaboration_accept', {callbackComplete:proceed}, client.conf.locale, {width:732, height:400});
	}
	else
	{
		proceed(hash);
	}
}

client.commands.file__close = function()
{
	var active_pane = client.widgets.rightPane.getActivePane();
	if ( null == active_pane )
	{
		return;
	}
	client.widgets.rightPane.closePane();
}

client.commands.debug__show_console = function()
{
	console.open();
}

client.commands.edit__undo = function()
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.runAction(ac.chap.ACTION_UNDO, {});
	editor.processActionResult(true, true);
	ac.widget.focus(editor);
}

client.commands.edit__redo = function()
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.runAction(ac.chap.ACTION_REDO, {});
	editor.processActionResult(true, true);
	ac.widget.focus(editor);
}

client.commands.edit__mode__change = function(mode)
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.setEditMode(mode);
	ac.widget.focus(editor);
}

client.commands.edit__mode__insert = function()
{
	client.commands.edit__mode__change(1);
}

client.commands.edit__mode__overwrite = function()
{
	client.commands.edit__mode__change(2);
}

client.commands.edit__completion__do = function(direction)
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.runAction(ac.chap.ACTION_CUSTOM, {action:'WordComplete', direction:direction});
	editor.processActionResult(true, true);
	ac.widget.focus(editor);
}

client.commands.edit__completion__next = function()
{
	client.commands.edit__completion__do(true);
}

client.commands.edit__completion__prev = function()
{
	client.commands.edit__completion__do(false);
}



client.commands.get_active_editor = function()
{
	var active_pane = client.widgets.rightPane.getActivePane();
	if (null == active_pane || !active_pane.editor)
	{
		return null;
	}
	return active_pane.editor;
}

client.commands.view__font__bigger = function()
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.setRuntimeOption('font.size', 'bigger');
	ac.widget.focus(editor);
}

client.commands.view__font__smaller = function()
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.setRuntimeOption('font.size', 'smaller');
	ac.widget.focus(editor);
}

client.commands.view__font__default = function()
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.setRuntimeOption('font.size', 11);
	ac.widget.focus(editor);
}

client.commands.view__wrap__on = function()
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.setRuntimeOption('word.wrap', true);
	ac.widget.focus(editor);
}

client.commands.view__wrap__off = function()
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.setRuntimeOption('word.wrap', false);
	ac.widget.focus(editor);
}

client.commands.view__project = function()
{
	client.widgets.leftPane.switchPane(0);
}

client.commands.view__collaboration = function()
{
	client.widgets.leftPane.switchPane(1);
}

client.commands.view__fast_file_index = function()
{
	console.info('View>FastFileIndex');
}

client.commands.view__fast_function_index = function()
{
	console.info('View>FastFunctionIndex');
}

client.commands.navigation__toggle_bookmark = function()
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.toggleBookmark();
	editor.renderText();
	ac.widget.focus(editor);
}

client.commands.navigation__move_bookmark = function(direction)
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	editor.scrollToBookmark(false, direction);
	ac.widget.focus(editor);
}

client.commands.navigation__next_bookmark = function()
{
	client.commands.navigation__move_bookmark(1);
}

client.commands.navigation__prev_bookmark = function()
{
	client.commands.navigation__move_bookmark(-1);
}

client.commands.navigation__move_file_tab = function(direction)
{
	var active_index = client.widgets.rightPane.activePaneIndex;
	var last_index = client.widgets.rightPane.model.panes.length-1;
	active_index += direction;
	if (0 > active_index)
	{
		active_index = last_index;
	}
	else if (last_index < active_index)
	{
		active_index = 0;
	}
	client.widgets.rightPane.switchPane(active_index);
}

client.commands.navigation__prev_file_tab = function()
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	client.commands.navigation__move_file_tab(-1);
}

client.commands.navigation__next_file_tab = function()
{
	var editor = client.commands.get_active_editor();
	if (null == editor)
	{
		return;
	}
	client.commands.navigation__move_file_tab(1);
}

client.commands.bundles__run_snippet = function(bundleId, snippetIndex)
{
	console.log('Running snippet #%i for bundle: %s', snippetIndex, bundleId);
	var resource = client.controller.getActiveResource();
	if ( null == resource )
	{
		return;
	}
	var last_chap_snippet_index = resource.editor.snippets.length;
	resource.editor.snippets.push(client.model.snippets[bundleId][snippetIndex]);
	resource.editor.runAction(ac.chap.ACTION_CUSTOM, {action:'RunSnippet', snippetIndex:last_chap_snippet_index});
	resource.editor.processActionResult(true, false);
	resource.editor.snippets.pop();
}

client.commands.bundles__run_command = function(bundleId, commandIndex)
{
	console.log('Running command #%i for bundle: %s', commandIndex, bundleId);
	var resource = client.controller.getActiveResource();
	if ( null == resource )
	{
		return;
	}
	var last_chap_command_index = resource.editor.commands.length;
	resource.editor.commands.push(client.model.commands[bundleId][commandIndex]);
	resource.editor.runAction(ac.chap.ACTION_CUSTOM, {action:'RunCommand', commandIndex:last_chap_command_index});
	resource.editor.processActionResult(true, false);
	resource.editor.commands.pop();
}

client.commands.tools__export_syntaxt_highlighting = function()
{
	var active_pane = client.widgets.rightPane.getActivePane();
	if ( null == active_pane )
	{
		return;
	}
	alert(active_pane.chap.getSyntaxHighlightingSource())
}

client.commands.help__contents = function()
{
	client.view.showHTMLDialogWindow($loc('mg_Help'), 'website/manual/en/');
}

client.commands.help__blog = function()
{
	window.open('http://www.april-child.com/blog/');
}

client.commands.bundles__bundle_editor = function()
{
	client.controller.showBundleEditor();
}
