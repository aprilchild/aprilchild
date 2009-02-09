/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Projects model support

  *------------------------------------------------------------------------------------------
*/


/*	PROJECTS
	_______________________________________________________________ */
	

client.model.projects = [];


client.model.addProject = function(project)
{
	project.url = 'http://' + project.url.replace(/http:\/\//, '').replace(/\/\//g, '/');
	var root_item = $new(ACElement);
	root_item.isCollection = true;
	root_item.setState(root_item.STATE_WILL_LOAD|root_item.STATE_EXPANDED);
	root_item.path = '/';
	root_item.type = 'project';
	root_item.properties.label = project.name;
	root_item.properties.project = project;
	var ix = client.model.projects.length;
	client.model.projects[ix] = {info:project, treeRootItem:root_item};
	project.openedResources = [];
	return client.model.projects[ix];
}

client.model.appendResources = function(acElem, resources)
{
	$foreach (resources, function(resource)
	{
		var child_elem = $new(ACElement);
		child_elem.isCollection = '1' == resource.is_collection;
		child_elem.properties.label = resource.basename;
		child_elem.properties.size = resource.size;
		child_elem.properties.dateCreated = resource.date_created;
		child_elem.properties.dateModified = resource.date_modified;
		child_elem.properties.contentType = resource.content_type;
		child_elem.properties.version = resource.version;
		child_elem.path = '?/?'.embed(acElem.path, resource.basename).replace(/\/\//g, '/');
		child_elem.setState(child_elem.STATE_WILL_LOAD|child_elem.STATE_COLLAPSED);
		acElem.appendChild(child_elem);
	});
	acElem.sort(function(elem){return elem.properties.label.toLowerCase()});
}

client.model.openProject = function(acElem, callbackOk, callbackError)
{
	var project = acElem.properties.project;
	$rpost
	(
		{
			a:'project_open',
			url:project.url,
			ticket:project.ticket
		},
		function (r_project)
		{
			// console.log('%o', r_project);
			client.model.appendResources(acElem, r_project.resources);
			callbackOk();
		},
		function (e)
		{
			callbackError(e);
		},
		'POST',
		client.conf.fry.backendURL.replace('amy', 'amy_project_manager')
	);	
}

client.model.getProjectForResource = function(acElem)
{
	if ('project' == acElem.type)
	{
		return acElem.properties.project;
	}
	while (null != acElem.parentElement && 'project' != acElem.parentElement.type)
	{
		acElem = acElem.parentElement;
	}
	return null != acElem.parentElement ? acElem.parentElement.properties.project : null;
}

client.model.createProjectFolderResource = function(label, parentResource, callbackOk, callbackError)
{
	var project = client.model.getProjectForResource(parentResource);
	console.log(project);
	$rpost
	(
		{
			a:'project_create_folder_resource',
			url:project.url,
			ticket:project.ticket,
			path:parentResource.path,
			label:label
		},
		function (resource)
		{
			var child_elem = $new(ACElement);
			child_elem.isCollection = true;
			child_elem.properties.label = label
			child_elem.properties.size = 0;
			child_elem.properties.dateCreated = 0;//resource.size;
			child_elem.path = '?/?'.embed(parentResource.path, label).replace(/\/\//g, '/');
			callbackOk(child_elem);
		},
		function (e)
		{
			callbackError(e);
		},
		'POST',
		client.conf.fry.backendURL.replace('amy', 'amy_project_manager')
	);
}

client.model.createProjectResource = function(resource, newLabel, content, parentResource, callbackOk, callbackError, callbackAskOverwrite)
{
	var project = client.model.getProjectForResource(parentResource);
	// check to see if resource already exists
	function continue_saving()
	{
		$rpost
		(
			{
				a:'project_create_resource',
				url:project.url,
				ticket:project.ticket,
				path:parentResource.path,
				label:newLabel,
				content:content
			},
			function(r)
			{
				callbackOk(r);
			},
			callbackError,
			'POST',
			client.conf.fry.backendURL.replace('amy', 'amy_project_manager')
		);
	}	
	var new_path = (parentResource.path + '/' + newLabel).replace(/\/\//g, '/');
	$rpost
	(
		{
			a:'project_load_resource',
			url:project.url,
			ticket:project.ticket,
			path:new_path
		},
		function (resource)
		{
			callbackAskOverwrite(function(overwrite)
			{
				if (overwrite)
				{
					continue_saving();
				}
				callbackOk(null);
			});
		},
		function (e)
		{
			continue_saving();
		},
		'POST',
		client.conf.fry.backendURL.replace('amy', 'amy_project_manager')
	);
}

client.model.getPreviewProjectResourceURL = function(acElem)
{
	var project = client.model.getProjectForResource(acElem);
	var url = client.conf.fry.backendURL.replace('amy', 'amy_project_manager')
	if ( -1 != url.indexOf('?') )
	{
		url = url.embed('project_preview_resource');
	}
	else
	{
		url = url + '?a=project_preview_resource'
	}
	return url + (-1 == url.indexOf('?') ? '?' : '&') + 'path=' + encodeURIComponent(acElem.path) + '&url=' + encodeURIComponent(project.url) + '&ticket=' + project.ticket;
	// return 'backend/amy_project_manager.php?a=project_preview_resource&path=' + encodeURIComponent(acElem.path) + '&url=' + encodeURIComponent(project.url) + '&ticket=' + project.ticket;
}

client.model.loadProjectResource = function(acElem, callbackOk, callbackError)
{
	var project = client.model.getProjectForResource(acElem);
	$rpost
	(
		{
			a:'project_load_resource',
			url:project.url,
			ticket:project.ticket,
			path:acElem.path
		},
		function (resources)
		{
			if (acElem.isCollection)
			{
				client.model.appendResources(acElem, resources);				
			}
			else
			{
				project.openedResources.push(acElem);
			}
			callbackOk(resources);
		},
		function (e)
		{
			callbackError(e);
		},
		'POST',
		client.conf.fry.backendURL.replace('amy', 'amy_project_manager')
	);
}

client.model.removeOpenedResource = function(acElem)
{
	var project = client.model.getProjectForResource(acElem);
    if (project)
    {
        for (var i in project.openedResources)
        {
            if (acElem == project.openedResources[i])
            {
                project.openedResources = [].concat(project.openedResources.slice(0, i), project.openedResources.slice(i+1));
                return;
            }
        }
    }
}

client.model.saveProjectResource = function(acElem, callbackOk, callbackError)
{
	var project = client.model.getProjectForResource(acElem);
	var editor = acElem.editor;
	$rpost
	(
		{
			a:'project_save_resource',
			url:project.url,
			ticket:project.ticket,
			path:acElem.path,
			content:editor.getText()
		},
		callbackOk,
		callbackError,
		'POST',
		client.conf.fry.backendURL.replace('amy', 'amy_project_manager')
	);
}


client.model.saveResourceToDisk = function(resource)
{
	url = client.conf.fry.backendURL;
	action = 'download_resource';
	if ( -1 != url.indexOf('?') )
	{
		url = url.embed(action) + '?';
	}
	else
	{
		url = url + "?a=" + action + '&';
	}
	var form = $().a($$());
	form.t('<form id="f_download" method="post" target="_download" action="?"><input id="f_filename" name="filename"><textarea id="f_content" name="content"></textarea></form>'.embed(url));
	$('f_filename').$.value = resource.properties.label;
	$('f_content').$.value = resource.editor.getText();
	$('f_download').$.submit();
	form.rs();
}



/*  ---------------------------------------------------------------- 
	amy.ProjectsTreeModel < ac.TreeWidgetModel
*/
$class('amy.ProjectsTreeModel < ac.TreeWidgetModel');

amy.ProjectsTreeModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
	if ('project' == acElem.type)
	{
		client.model.openProject(acElem, callbackOnSuccess, callbackOnError);
	}
	else
	{
		client.model.loadProjectResource(acElem, callbackOnSuccess, callbackOnError);
	}
}


/*  ---------------------------------------------------------------- 
	amy.FileChooserModel < ac.FileChooserWidgetModel
*/
$class('amy.FileChooserModel < ac.FileChooserWidgetModel');


amy.FileChooserModel.prototype.getVolumes = function()
{
	// alert(volumes);
	var volumes = [];
	for (var i in client.model.projects)
	{
		volumes.push(client.model.projects[i].treeRootItem);
	}
	return volumes;
}	



amy.FileChooserModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
	client.model.loadProjectResource(acElem, callbackOnSuccess, callbackOnError);
}

amy.FileChooserModel.prototype.getSearchHistoryValues = function()
{
	return ['Januli', 'Tomuli', 'Fry', 'frame'];
}
