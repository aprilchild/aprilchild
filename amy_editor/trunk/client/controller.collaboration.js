/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Collaboration controller support

  *------------------------------------------------------------------------------------------
*/

client.controller.messaging = {running:false, thread:null, types:['Unrecognized', 'Approve', 'Join', 'Notification', 'Chat', 'UserInfo']}

client.controller.startMessaging = function()
{
	if ( client.controller.messaging.running )
	{
		return;
	}
	client.controller.messaging.thread = setInterval(client.controller.checkMessages, 7000);
	client.controller.messaging.running	= true;
}

client.controller.stopMessaging = function()
{
	if ( !client.controller.messaging.running )
	{
		return;
	}
	clearInterval(client.controller.messaging.thread);
}

client.controller.checkMessages = function()
{
	if ( !client.controller.messaging.running )
	{
		return;
	}
	var ids = [];
	for ( var i=0; i<client.model.collaborations.length; i++ )
	{
		if (!client.model.collaborations[i].endMessaging)
		{
			ids.push(client.model.collaborations[i].collaboratorId);			
		}
	}
	if (0 == ids.length)
	{
		return;
	}
	client.model.loadCollaborationMessages(ids, function(message, iterator)
	{
		var params = [];
		$foreach(message.params, function(param)
		{
			params.push(param);
		});
		message.params = params;
		client.controller.handleMessage(message);
	}, 
	function(e)
	{
		console.warn(e);
	});
}

client.controller.handleMessage = function(message)
{
	try
	{
		var msg_handler = $getdef(client.controller.messaging.types[message.type], 'Unrecognized');
		client.controller['processMessage'+msg_handler](message);		
	}
	catch (e)
	{
		console.warn('Error while handling message %o, exception: %e', message, e);
	}
}

client.controller.processMessageUnrecognized = function(message)
{
	console.warn('processing unrecognized message #%i', message.id);
	$rpost
	(
		{a:'collaboration_handle_message', id:message.id, routine:'trash'},
		function(){}, function(){}
	);
}

client.controller.processMessageApprove = function(message)
{
	var coll_me = message.collaborator_receiver_id;
	// console.log('aprove %s', coll_me);
	var collaboration = client.model.getCollaboration(coll_me);
	var resource = collaboration.resource;
	$rpost
	(
		{a:'collaboration_handle_message', id:message.id, routine:'call', collaborator_id:coll_me, pars:[collaboration.lastRemoteTransId, resource.editor.getText()]},
		function(r)
		{
			// console.log('approved %o', message);
			collaboration.addCollaborator(message.collaborator_sender_id);
			if ( !collaboration.started )
			{
				collaboration.start();
			}
		},
		function(e)
		{
			client.view.showFlashMessage($log('flash_collaboration_error', {path:resource.path}), 3);
		 	console.warn('Error when approving ? : ?'.embed(resource.path, e));
		}
	);
}

client.controller.processMessageJoin = function(message)
{
	var transid = message.params[0];
	var content = message.params[1].replace(/\\"/g, '"');
	var coll_me = message.collaborator_receiver_id;
	var collaboration = client.model.getCollaboration(coll_me);
	var remote_path = collaboration.resource.split('/');
	$rpost
	(
		{a:'collaboration_handle_message', id:message.id, routine:'call', collaborator_id:coll_me},
		function(r)
		{
			console.info('Joining in editing of `?` with actual content: `?`'.embed(remote_path, content.substr(0,100)));
			collaboration.addCollaborator(message.collaborator_sender_id);

			var label = remote_path[remote_path.length-1];
			collaboration.resource = client.controller.createNewResource(label, content, true);
			collaboration.start(); //active_pane, transid);
		},
		function(e)
		{
			console.warn('Error when joining: ?'.embed(e));
		}
	);
}

client.controller.processMessageNotification = function(message)
{
	var coll_me = message.collaborator_receiver_id;
	var collaboration = client.model.getCollaboration(coll_me);
	var params = [];
	var notification_type = message.params.shift();
	// console.log('notification_type: %s', notification_type);
	var callback = client.controller['notification_before_?'.embed(notification_type)];
	if ('function' == typeof callback)
	{
		params = callback(message, message.params);
	}
	$rpost
	(
		{a:'collaboration_handle_message', id:message.id, routine:'call', collaborator_id:coll_me, pars:params},
		function(r)
		{
			var callback = client.controller['notification_success_?'.embed(notification_type)];
			if ('function' == typeof callback)
			{
				callback(message, r, message.params);
			}
		},
		function(e)
		{
			console.warn('Error when new collaborator: ?'.embed(e));
			var callback = client.controller['notification_failure_?'.embed(notification_type)];
			if ('function' == typeof callback)
			{
				callback(message, e, message.params);
			}
		}
	);
}

client.controller.notification_before_end_collaboration = function(message, params)
{
	console.info('! End collaboration session. #%i', params[0]);
	return [];
}

client.controller.notification_success_end_collaboration = function(message, result, params)
{
	console.info('Collaboration session ended. DONE. Collaborator #%i', params[0]);
	var coll_me = message.collaborator_receiver_id;
	var collaboration = client.model.getCollaboration(coll_me);
	collaboration.stop();
	collaboration.endMessaging = true;
	if (collaboration.resource && collaboration.resource.isShared)
	{
		// other party ended the collaboration, we have a document not attached to anything, let's transform it to new one
		collaboration.resource.isNew = true;
		collaboration.resource.isShared = false;
		collaboration.resource.properties.isOpen = true;
		collaboration.resource.properties.isExternal = true;
		collaboration.resource.isCollaborating = false;
	}
	client.view.showFlashMessage('Collaboration ended.', 3);
	client.controller.collaborationRenderUpdate = true;
}

client.controller.notification_before_inactive_collaborator = function(message, params)
{
	console.info('Inactive collaborator. #%i', params[0]);
	return [];
}

client.controller.notification_success_inactive_collaborator = function(message, result, params)
{
	console.info('Inactive collaborator. DONE. Collaborator #%i', params[0]);
	client.view.showFlashMessage('Collaborator left.', 3);
	client.controller.collaborationRenderUpdate = true;
}


client.controller.notification_before_new_collaborator = function(message, params)
{
	console.info('New collaborator active. Checking. Collaborator #%i', params[0]);
	return [];
}

client.controller.notification_success_new_collaborator = function(message, result, params)
{
	console.info('New collaborator active. DONE. Collaborator #%i', params[0]);
	client.view.showFlashMessage('Invited collaborator is ready.', 3);
	client.controller.collaborationRenderUpdate = true;
}



client.controller.processMessageUserInfo = function(message)
{
	var coll_me = message.collaborator_receiver_id;
	var collaboration = client.model.getCollaboration(coll_me);
	$rpost
	(
		{a:'collaboration_handle_message', id:message.id, routine:'call', collaborator_id:coll_me, pars:[]},
		function(r)
		{
			var info = [];
			$foreach(r, function(item)
			{
				info[item.key] = item.value;
			});
			console.warn('updating collaborator info: %o', info);
			collaboration.updateCollaborator(info);
			client.controller.collaborationRenderUpdate = true;
		},
		function(e)
		{
			console.warn('Error when loading user info: : ?'.embed(e));
		}
	);
}





client.controller.collaborationRenderUpdate = false;

client.controller.renderCollaborationList = function(force)
{
	if (!client.controller.collaborationRenderUpdate && !force)
	{
		return;
	}
	if (0.2 > Math.random())
	{
		// TODO : do it properly! there's the whole issue with this pane and its refreshing...
		client.widgets.rightPane.renderTitles();
	}
	if (!client.nodes.collaborationEmpty)
	{
		return;
	}
	
	client.controller.collaborationRenderUpdate = false;
	client.nodes.collaborationEmpty.v(false);
	client.nodes.collaborationList.v(false);
	
	var node = client.nodes.collaborationList;
	node.rc();
	var coll_index = 1;
	node.a($$()).s('margin:4px').a($crec('Manually refresh list', function(commandId)
	{
		$remc(commandId);
		client.controller.renderCollaborationList(true);
		
	}));
	var width = node.ns().w()-20;
	for (var i in client.model.collaborations)
	{
		var collaboration = client.model.collaborations[i];
		console.log('rendering collaboration: %o', collaboration);
		var node_coll = node.a($$()).s('padding:8px;margin:4px;').w(width);
		var pane_index = -1;
		node_coll.a($$()).s('background:#ACBACF; -webkit-border-radius:3px; -moz-border-radius:3px; padding:4px; width:auto');
		var label = '...';
		if (collaboration.resource && collaboration.resource.editor)
		{
			pane_index = collaboration.resource.editor.pane.index;
			label = collaboration.resource.properties.label;
			node_coll.lc().a($crec('<strong>?</strong>'.embed(label), function(commandId, index)
			{
				// console.log(index);
				if (-1 != index)
				{
					client.widgets.rightPane.switchPane(index);
					if (client.widgets.rightPane.model.panes[index])
					{
						ac.widget.focus(client.widgets.rightPane.model.panes[index].editor);
					}
				}
			}, pane_index)).s('color:?;text-decoration:none'.embed(-1!=pane_index ? '#fff' : '#000'));
		}
		else
		{
			node_coll.lc().t('<strong>?</strong>'.embed(label));
		}
		var status = collaboration.endMessaging ? 'stop' : (collaboration.started ? 'start' : 'init');
		node_coll.a($$()).t('<div style="color:#777;margin-top:5px"><img src="mm/i/coll-?.png" width="13" height="13" align="base" /> Status:  ?.</div>'.embed(status, $loc('coll_status_'+status)));
		var ht = '<div style="margin-top:6px;padding:3px;background:#f0f0f0;-moz-border-radius:3px;-webkit-border-radius:3px;border:1px solid #ddd"><table cellspacing="0" width="95%"><tbody>';
		for (var ii=0; ii<collaboration.collaborators.length; ii++)
		{
			ht += '<tr>';
			var collaborator = collaboration.collaborators[ii];
			if (collaborator.loaded)
			{
				var email = collaborator.email.replace('info@april-child.com', '--');
				ht += '<td width="20">' + $$().a(client.view.renderUserIcon(16, '#f0f0f0', collaborator.picture)).t() + '</td><td style="font-weight:bold">' + collaborator.nickname + '</td><td style="font-size:10px;color:#888" width="60">' + amy.util.get_parsed_time_difference(collaborator.last_activity_seconds_offset) + ' sec.</td></tr><tr><td colspan="2" style="color:#444">' + email + '</td><td></td><td></td>';
			}
			else
			{
				ht += '<td colspan="4" style="font-size:10px;color:#888">Information to be loaded shortly...</td>';
			}
			ht += '</tr>';
		}
		ht += '</tbody></table></div>';
		node_coll.a($$()).t(ht);
		coll_index++;
	}
	if (1 == coll_index)
	{
		client.nodes.collaborationEmpty.v(true);		
	}
	else
	{
		client.nodes.collaborationList.v(true);		
	}
}

