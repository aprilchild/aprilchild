/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Project support controller

  *------------------------------------------------------------------------------------------
*/


client.controller.getActiveResource = function()
{
	var active_pane = client.widgets.rightPane.getActivePane();
	if (null != active_pane)
	{
		return active_pane.acElem;
	}
	return null;
}

client.controller.showOpenProject = function(defaultProjectURL)
{
	default_project_url = defaultProjectURL || '';
    client.view.showWizardDialogWindow($loc('wt_open_project'), 'open_project', {default_project_url:default_project_url}, client.conf.locale, {width:800, height:590});
}

client.controller.openProject = function(project)
{
	$runafter(1000, client.view.hideWizardDialogWindow);
	client.controller.addProjectPane(client.model.addProject(project));
}

client.controller.addProjectPane = function(project)
{
	client.controller.toggleProjectAccordion(true);
	if ($notset(client.widgets.projectsAccordion))
	{
		// creating accordion widget
		widget = $new
		(
			ac.AccordionWidget,
			$new(ac.AccordionWidgetModel, []),
			$new(amy.ProjectsAccordionView, {animate:true, onlyOneOpened:true}),
			client.widgets.leftPane
		);
		widget.show(client.nodes.projectsNode.lc(), 'projects');
		client.widgets.projectsAccordion = widget;
	}
	var accordion = client.widgets.projectsAccordion;
	accordion.addPane({project:project, adapter:$new(amy.ProjectsAccordionController)}, accordion.model.panes.length);//, pane.index+1);
	accordion.expandPane(accordion.model.panes.length-1);
}

client.controller.createNewResource = function(label, content, shared)
{
	var acElem = $new(ACElement);
	acElem.path = null;
	acElem.isShared = true == shared;
	acElem.properties.label = label;
	acElem.properties.isOpen = true;
	acElem.properties.isExternal = true;
	acElem.properties.isNew = true;
	acElem.properties.content = content;
	
	client.widgets.rightPane.addPane({label:acElem.properties.label, acElem:acElem, adapter:$new(amy.RightPaneController)});
	return acElem;
}

client.controller.createNewFolder = function(label, parentResource, callbackOk, callbackError)
{
	client.model.createProjectFolderResource(label, parentResource, callbackOk, callbackError);
}

client.controller.saveNewResource = function(resource, newLabel, content, parentResource, callbackOk, callbackError)
{
	client.model.createProjectResource(resource, newLabel, content, parentResource, callbackOk, callbackError, 
	function(callbackAnswer)
	{
		// resource already exists, let's ask if overwrite
		var msg = client.view.getFlashMessage();
		client.view.hideFlashMessage();
	    client.view.showWizardDialogWindow($loc('wt_ask_document_overwrite'), 'ask_document_overwrite', {label:newLabel, parentPath:parentResource.path, callbackComplete:function(overwrite)
		{
			if (overwrite)
			{
				client.view.showFlashMessage(msg);
			}
			callbackAnswer(overwrite);
		}}, client.conf.locale, {width:432, height:250});
	});
}

client.controller.openResource = function(resource, synchronizeAfterwards)
{
	client.widgets.rightPane.addPane({label:resource.properties.label, acElem:resource, adapter:$new(amy.RightPaneController)});
	resource.properties.isOpen = true;
	if (synchronizeAfterwards)
	{
		var tabpane = client.widgets.rightPane;
		for (var i in tabpane.model.panes)
		{
			if (tabpane.model.panes[i].acElem == resource)
			{
				tabpane.switchPane(tabpane.model.panes[i].index);
				ac.widget.focus(tabpane.model.panes[i].editor);
				break;
			}
		}
	}
}

client.controller.openResourceAt = function(project, path)
{
    console.log(project);
    var root_resource = project['treeRootItem'];
    if (!root_resource)
    {
        console.warn("Project has no tree root item resource.");
        return;
    }
    var path_parts = path.split('/');
    var actual_resource = root_resource;
    var found_resource = null;
    for (var i=1; i<path_parts.length; i++)
    {
        if (actual_resource.hasState(actual_resource.STATE_WILL_LOAD))
        {
            console.log("Needs to load children of: %s", actual_resource.path);
            actual_resource.setStateExpanded();
            console.log(root_resource.tree);
            root_resource.tree.redrawElement(actual_resource, function(result)
            {
                if (result)
                {
                    client.controller.openResourceAt(project, path);
                }
            });
            found_resource = null;
            break;
        }
        found_resource = actual_resource.search(function(resource)
        {
            // console.log(resource);
            if (path_parts[i] == resource.properties.label)
            {
                return resource;
            }
        });
        if (found_resource)
        {
            console.log('found: ' + found_resource.path);
            actual_resource = found_resource;
        }
        else
        {
            console.log('not found: ' + path_parts[i]);
            break;
        }
    }
    if (found_resource)
    {
        console.log('YEP! found one, definitely! %s', found_resource.path);
        client.controller.openResource(found_resource, true);
    }
}


/*  ---------------------------------------------------------------- 
	amy.ProjectsAccordionController < ac.AccordionWidgetController
*/

$class('amy.ProjectsAccordionController < ac.AccordionWidgetController');

amy.ProjectsAccordionController.prototype.onOpen = function(pane, index, node)
{
	var num_panes = pane.model.panes.length;
	var title_height = 36;
	var w = node.p().p().w();
	var h = node.p().p().p().h() - (title_height * num_panes) + num_panes - 1;
	for (var i=0; i<num_panes-1; i++)
	{
		pane.model.panes[i].tree.containerNode.h(h);
		ac.widget.resize(pane.model.panes[i].tree, w, h);
	}
	node.w(w).h(h).s('padding:0;margin:0').p().w(w).h(h).s('padding:0;margin:0');
	var widget = $new
	(
		ac.TreeWidget,
		$new(amy.ProjectsTreeModel, pane.project.treeRootItem),
		$new(amy.ProjectsTreeView, {showRootElement:false, hasElementIcon:true}),
		$new(amy.ProjectsTreeController),
		client.widgets.projectsAccordion
	);
	pane.tree = widget;
	pane.project.treeRootItem.tree = widget;
	pane.project.treeRootItem.accordionPane = pane;
	pane.project.treeRootItem.sort(function(elem){return elem.properties.label.toLowerCase();});
	widget.show(node.pos(true), 'amy-project');
}

amy.ProjectsAccordionController.prototype.onClose = function(pane, index)
{
	console.log(pane.model.panes.length);
	if (1 == pane.model.panes.length)
	{
		$runafter(100, function()
		{
			client.controller.toggleProjectAccordion();
		});
	}
	return true;
}

/*  ---------------------------------------------------------------- 
	amy.ProjectsTreeController < ac.TreeWidgetController
*/
$class('amy.ProjectsTreeController < ac.TreeWidgetController');

amy.ProjectsTreeController.prototype.onElementClick = function(acElem, evt)
{
	if (!acElem.isCollection)
	{
		if (acElem.properties.isOpen)
		{
			var tabpane = client.widgets.rightPane;
			for (var i in tabpane.model.panes)
			{
				if (tabpane.model.panes[i].acElem == acElem)
				{
					tabpane.switchPane(tabpane.model.panes[i].index);
					ac.widget.focus(tabpane.model.panes[i].editor);
					break;
				}
			}
		}
		else
		{
			if (0 == acElem.properties.contentType.indexOf('text/'))
			{
				// text
				client.controller.openResource(acElem);
			}
			else if (0 == acElem.properties.contentType.indexOf('image/'))
			{
				// image
				client.view.showHTMLDialogWindow('Preview', client.model.getPreviewProjectResourceURL(acElem));
			}
			else
			{
//				preview.t($loc('preview_content_cannot_display'));
			}			
		}
	}
}


/*  ---------------------------------------------------------------- 
	amy.FileChooserController < ac.FileChooserWidgetController
*/

$class('amy.FileChooserController < ac.FileChooserWidgetController');

amy.FileChooserController.prototype.onSearchValue = function(inputValue)
{
	$('result').a($$()).t('Now searching for `?`'.embed(inputValue));
}

