/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Collaboration model support

  *------------------------------------------------------------------------------------------
*/


/*	COLLABORATION
	_______________________________________________________________ */

$class('amy.Collaboration',
{
	construct:function(collaboratorId, isMasterUser, documentId, invitationId, invitationHash, userId, resource)
	{
		// console.log('creating collaboration with collaborator ID: %s', collaboratorId);
		this.collaboratorId = collaboratorId;
		this.documentId = documentId;
		this.invitationId = invitationId;
		this.invitationHash = invitationHash;
		this.userId = userId;
		this.isMasterUser = isMasterUser;
		this.collaborators = [];
		this.lastLocalTransId = -1;
		this.lastRemoteTransId = -1;
		this.started = false;
		this.endMessaging = false;
		this.resource = resource;
		if ('object' == typeof resource)
		{
			resource.collaboration = this;
		}
		this.collaborationNodes = [];
	}
});

amy.Collaboration.prototype.getTransactionData = function()
{
	var chap = this.resource.editor;
	if (!chap || !chap.transaction_log)
	{
		return '';
	}
	var transactions = [];
	for ( var i=this.lastLocalTransId; i<chap.transaction_log.length; i+=3 )
	{
		transactions.push(('['+chap.transaction_log[i]+',['+chap.transaction_log[i+1].join(',').replace(',,', ',0,').replace('NaN','0')+']:'+Base64.encode(chap.transaction_log[i+2])));
	}
	this.lastLocalTransId = i;
	return this.documentId+'|'+this.collaboratorId+'|'+this.lastRemoteTransId+'|'+transactions.join('\n');
}

amy.Collaboration.prototype.setTransactionData = function(transactions)
{
	var chap = this.resource.editor;
	var last_transid = this.lastRemoteTransId;
	chap.stopTransactionLog();
	var changed_content = {insert:[], remove:[]};
	var are_rows_copied = false;
	var virtual_row_nodes = [];
	var virtual_char_map = [];
	var document_id = this.documentId;
	$foreach (transactions, function(transaction)
	{
		try
		{
			last_transid = transaction.transaction_id;
			var ix = transaction.log.indexOf(':');
			eval('var log = ' + transaction.log.substr(0, ix) + '];');
			eval('log.push(Base64.decode(transaction.log.substr(ix+1)));');
			var caret = chap.getCaretPosition();
			var new_caret = [null, caret[1]];
			if ( 1 == log[0] )
			{
				var ins_row = parseInt(log[1][0]);
				var ins_col = parseInt(log[1][1]);
				
				if ((ins_row < caret[0]) || (ins_row == caret[0] && ins_col < caret[1]))
				{
					new_caret[0] = caret[0];
					var lines = log[2].split('\n');
					var num_newlines = lines.length;
					// will insert content before caret - let's move it backwards
					if (1 < num_newlines)
					{
						new_caret[0] = caret[0] + num_newlines - 1;
					}
					if (ins_row == caret[0])
					{
						// newly inserted block will end at the line the caret is at, must move column position as well
						// console.log('Should shift by %i %s.', lines[num_newlines-1].length, lines[num_newlines-1]);
						new_caret[1] = caret[1] + lines[num_newlines-1].length;
					}
				}
				chap.insertIntoCharacterMap(log[2], log[1][0], log[1][1], false, transaction.collaborator_id);
				var num_chars = log[2].length;
				for (var i=0; i<num_chars; i++)
				{
					if (!changed_content.insert[log[1][0]])
					{
						changed_content.insert[log[1][0]] = [];
					}
					changed_content.insert[log[1][0]].push(parseInt(log[1][1])+i);
				}
			}
			else
			{
				if (!are_rows_copied)
				{
					for (var i in chap.views)
					{
						virtual_row_nodes[i] = chap.views[i].nodeEditArea.parentNode.appendChild(document.createElement('div'));
						virtual_row_nodes[i].style.position = 'absolute';
						virtual_row_nodes[i].style.left = chap.views[i].nodeEditArea.style.left;
						virtual_row_nodes[i].style.top = chap.views[i].nodeEditArea.style.top;
						var lst = chap.views[i].nodeEditArea.getElementsByTagName('pre');
						for (var ii=0; ii<lst.length; ii++)
						{
							var row_node = lst.item(ii).cloneNode(true);
							var row_index = parseInt(row_node.getAttribute('row-index'));
							row_node.id = 'virtual-node-' + document_id + '-' + i + '-' + row_index;
							row_node.style.visibility = 'hidden';
							virtual_row_nodes[i].appendChild(row_node);
							var str = chap.char_map[row_index];
							virtual_char_map[row_index] = str;
						}
					}
					are_rows_copied = true;
				}
				var ins_row_from = parseInt(log[1][0]);
				var ins_col_from = parseInt(log[1][1]);
				var ins_row_to = parseInt(log[1][2]);
				var ins_col_to = parseInt(log[1][3]);
				
				var last_line_offset = ins_col_to - (ins_row_from == ins_row_to ? ins_col_from : 0);
				
				var new_caret = [null, caret[1]];
				if (ins_row_from <= caret[0])
				{
					if ((ins_row_to > caret[0]) || (ins_row_to == caret[0] && ins_col_to >= caret[1]))
					{
						new_caret[0] = ins_row_from;
						new_caret[1] = ins_col_from;
					}
					else if (ins_row_to == caret[0] && ins_col_to < caret[1])
					{
						new_caret[0] = caret[0] - ins_row_to + ins_row_from;
						new_caret[1] -= last_line_offset;
					}
					else if (ins_row_to < caret[0])
					{
						new_caret[0] = caret[0] - ins_row_to + ins_row_from;
					}
				}
				var source = chap.removeFromCharacterMap(log[1][0], log[1][1], log[1][2], log[1][3], false, transaction.collaborator_id);
				if (!changed_content.remove[log[1][0]])
				{
					changed_content.remove[log[1][0]] = [];
				}
				// console.log('removed source: %s', source);
				var source_lines = source.split('\n');
				changed_content.remove[log[1][0]].push([log[1][1], 0, source_lines[0]]);
				for (var i=log[1][0]+1; i<log[1][2]; i++)
				{
					if (!changed_content.remove[i])
					{
						changed_content.remove[i] = [];
					}
					changed_content.remove[i].push([0, source_lines[i-log[1][0]].length, source_lines[i-log[1][0]]]);
				}
				var last_ix = changed_content.remove[log[1][0]].length;
				changed_content.remove[log[1][0]][last_ix-1][1] = log[1][3];
			}			
			if (null != new_caret[0])
			{
				// console.info('Shifting from %i,%i to %i, %i', caret[0], caret[1], new_caret[0], new_caret[1]);
				chap.setCaretPosition(new_caret[0], new_caret[1]);
			}
		}
		catch (e)
		{
			console.error('Error while processing collaboration transaction %o : %o', transaction, e);
		}
	});
	chap.processActionResult(true, true);
	chap.startTransactionLog();
	this.lastRemoteTransId = last_transid;
	
	
	var actual_collaboration_nodes = [];
	for (var i in chap.views)
	{
		if (!this.collaborationNodes[i])
		{
			var edit_node = chap.views[i].nodeEditArea;
			var node = edit_node.parentNode.appendChild(document.createElement('div'));
			node.style.position = edit_node.style.position;
			node.style.left = edit_node.style.left;
			node.style.top = edit_node.style.top;
			// node.style.width = edit_node.style.width;
			// node.style.height = edit_node.style.height;
			// node.style.background = 'red';
			node.style.opacity = 0.5;
			this.collaborationNodes[i] = node;
		}
		var a_node = this.collaborationNodes[i].appendChild(document.createElement('div'));
		
		a_node.style.position = 'absolute';
		a_node.style.left = '0';
		a_node.style.top = '0';
		// a_node.style.width = this.collaborationNodes[i].style.width;
		// a_node.style.height = this.collaborationNodes[i].style.height;
		
		actual_collaboration_nodes[i] = a_node;
	}
	// console.log('coll nodes: %o', this.collaborationNodes);
	
	// console.log('changed_content: %o', changed_content);
	// console.warn('insert');	
	for (i in changed_content.insert)
	{
		var info = changed_content.insert[i];
		info = info.sort(function(a, b)
		{
			if (a < b)
			{
				return -1;
			}
			if (b < a)
			{
				return 1;
			}
			return 0;
		});
		// console.log('info: %o', info);
		var regions = [];
		var last_col = -10;
		for (var ii in info)
		{
			var col = parseInt(info[ii]);
			if (last_col + 1 == col)
			{
				regions[regions.length-1][1] = col;
			}
			else
			{
				regions.push([col, col]);
			}
			last_col = col;
		}
		// console.log('regions: %o', regions);
		var row = parseInt(i);
		for (ii=0; ii<regions.length; ii++)
		{
			
			
			for (var iii in chap.views)
			{
				// console.log('call with %i, %i', row, regions[ii][0]);
				try
				{
					var render_info = chap.views[iii].getRenderedCharPosition(row, regions[ii][0]);
					// console.log('render info for %i : %o', ii, render_info);
					var hi_node = actual_collaboration_nodes[iii].appendChild(document.createElement('div'));
					hi_node.style.position = 'absolute';
					hi_node.style.left = (render_info[0] + 7) + 'px';
					hi_node.style.top = (($__tune.isSafari?0:-1)+render_info[1]) + 'px';
					hi_node.style.height = '11px';
					// console.log('width: %i', (7*(1 + regions[ii][1] - regions[ii][0])));
					hi_node.style.width = (7*(1 + regions[ii][1] - regions[ii][0])) + 'px';
					hi_node.style.background = '#ff0';
					// hi_node.style.opacity = 0.4;
					hi_node.style.borderBottom = '1px solid #aa0';
					hi_node.style.borderTop = '1px solid #aa0';
					hi_node.style.MozBorderRadius = '3px';
					hi_node.style.WebkitBorderRadius = '3px';
				}
				catch (e)
				{
					console.error('!!render_error: %o', e);
				}
			}
		}
		
	}
	// console.warn('remove');
	for (i in changed_content.remove)
	{
		var info = changed_content.remove[i];
		var row = parseInt(i);
		for (var ii=0; ii<info.length; ii++)
		{
			var col = info[ii][0];
			
			for (var iii in chap.views)
			{
				// console.log('call with %i, %i', row, col);
				try
				{
				//	var render_info = chap.activeView.getRenderedCharPosition(row, regions[ii][0]);
					var row_node = document.getElementById('virtual-node-' + this.documentId + '-' + iii + '-' + row);
					// console.log('node(%s) : %o', 'virtual-node-' + this.documentId + '-' + iii + '-' + row, row_node);
					if (null == row_node)
					{
						continue;
					}
					// console.log('char map: %s', virtual_char_map[row]);
					var render_info = chap.views[iii].getVirtualCharPosition(row_node, virtual_char_map[row], col);
					// console.log('virtual render info for %i : %o', ii, render_info);
				
					var hi_node = actual_collaboration_nodes[iii].appendChild(document.createElement('div'));
					hi_node.style.position = 'absolute';
					hi_node.style.left = (render_info[0] + 7) + 'px';
					hi_node.style.top = (($__tune.isSafari?0:-1)+render_info[1]) + 'px';
					hi_node.style.height = '11px';
					// console.log('width: %i', (7*(1 + regions[ii][1] - regions[ii][0])));
					hi_node.style.width = (7*(parseInt(info[ii][1]) - col)) + 'px';
					hi_node.style.background = '#f00';
					// hi_node.style.opacity = 0.4;
					hi_node.style.borderBottom = '1px solid #a00';
					hi_node.style.borderTop = '1px solid #a00';
					hi_node.style.MozBorderRadius = '3px';
					hi_node.style.WebkitBorderRadius = '3px';
					hi_node.style.opacity = 0.8;
					var text = hi_node.appendChild(document.createElement('pre'));
					text.style.fontSize = row_node.style.fontSize;
					text.style.fontFamily = row_node.style.fontFamily;
					text.style.fontWeight = row_node.style.fontWeight;
					text.style.fontStyle = row_node.style.fontStyle;
					text.style.lineHeight = row_node.style.lineHeight;
					if ($__tune.isSafari)
					{
						text.style.position = 'absolute';
						text.style.top = '-1px';
					}
					text.style.color = '#fff';
					text.innerHTML = info[ii][2];
				}
				catch (e)
				{
					console.error('!!remove render_error: %o', e);
				}
			}			
			
		}
	}	
	delete virtual_char_map;
	
	for (i in virtual_row_nodes)
	{
		$(virtual_row_nodes[i]).rs();
	}
	delete virtual_row_nodes;

	for (i in actual_collaboration_nodes)
	{
		fry.ui.effect.FadeOut($(actual_collaboration_nodes[i]), 120, function(node)
		{
			$(node).rs();
		});
	}
//	console.info('Last transid %s', this.lastRemoteTransId);
}

amy.Collaboration.prototype.addCollaborator = function(collaboratorId)
{
	this.collaborators.push({loaded:false, id:parseInt(collaboratorId), coll_user_id:0, amy_user_id:0, email:'', nickname:'', picture:'', joined_at:0, last_activity_at:0, is_master_user:false, last_activity_seconds_offset:0});
}

amy.Collaboration.prototype.removeCollaborator = function(collaboratorId)
{
	var index = -1;
	for (var i=0; i<this.collaborators.length; i++)
	{
		if (collaboratorId == this.collaborators[i].id)
		{
			index = i;
			break;
		}
	}
	if (-1 == index)
	{
		return false;
	}
	for (i=index; i<this.collaborators.length-1; i++)
	{
		this.collaborators[i] = this.collaborators[i+1];
	}
	this.collaborators[this.collaborators.length-1] = null;
	this.collaborators.length--;
	return true;
}

amy.Collaboration.prototype.updateCollaborator = function(info)
{
	var id = parseInt(info[0]);
	// console.log('will update: %i', id);
	for (var i=0; i<this.collaborators.length; i++)
	{
		// console.log('test: %i', this.collaborators[i].id);
		if (id == this.collaborators[i].id)
		{
			// console.log('found: %i', id);
			this.collaborators[i].coll_user_id = parseInt(info[1]);
			this.collaborators[i].joined_at = amy.util.get_parsed_date(info[2]);
			this.collaborators[i].last_activity_at = amy.util.get_parsed_date(info[3]);
			this.collaborators[i].is_master_user = 'true' == info[4];
			this.collaborators[i].amy_user_id = parseInt(info[5]);
			this.collaborators[i].email = info[6];
			this.collaborators[i].nickname = info[7];
			this.collaborators[i].picture = info[8];
			this.collaborators[i].last_activity_seconds_offset = info[9];
			this.collaborators[i].loaded = true;
			// console.log('collaborators info: %o', this.collaborators);
			break;
		}
	}
}

amy.Collaboration.prototype.start = function()
{
	if (!this.resource || !this.resource.editor)
	{
		var me = this;
		setTimeout(function()
		{
			me.start();
		}, 1200);
		return;
	}
	var chap = this.resource.editor;
	chap.setUserId(this.collaboratorId);
	this.resource.collaboration = this;
	this.resource.isCollaborating = true;
	this.lastLocalTransId = chap.transaction_log.length;
	this.started = true;
	client.controller.collaborationRenderUpdate = true;
}

amy.Collaboration.prototype.stop = function(pane)
{
	if (!this.started)
	{
		return;
	}
	console.warn('Stop collaboration.');
	this.started = false;
	// it's not that important to know result of the following - it will eventually die anywas, this is however better protocol-wise
	$rpost({a:'collaboration_stop', collaborator_id:this.collaboratorId}, function(r){}, function(e){console.log('Could not properly stop collaboration: %s', e)});
	client.controller.collaborationRenderUpdate = true;
}

client.model.collaborations = [];

client.model.runCollaborationsThreadFinished = true;

client.model.runCollaborationsThread = setInterval(function()
{
	if ( !client.model.runCollaborationsThreadFinished )
	{
		return;
	}
	var registered_colls = [];
	var map = {};
	for ( var i in client.model.collaborations )
	{
		var collaboration = client.model.collaborations[i];
		if ( collaboration.started )
		{
			map[collaboration.documentId] = registered_colls.length;
			registered_colls.push(collaboration);
		}
	}
	if ( 0 == registered_colls.length )
	{
		return;
	}
	client.model.runCollaborationsThreadFinished = false;
	// preparing parameters
	var params = {a:'collaboration_handle_transactions', colls:[]};
	for ( i=0; i<registered_colls.length; i++ )
	{
		params.colls[i] = registered_colls[i].getTransactionData();
	}
	$rpost
	(
		params,
		function(r)
		{
//			console.info(r);
			$foreach (r, function(transaction)
			{
				if ( 'object' == typeof transaction.transactions )
				{
//					console.warn(transaction);
					var collaboration = registered_colls[map[transaction.document_id]];
					collaboration.setTransactionData(transaction.transactions);					
				}
			});
			try
			{
				client.controller.renderCollaborationList();
			}
			catch (e)
			{
				console.warn(e);
			}
			client.model.runCollaborationsThreadFinished = true;
		},
		function(e)
		{
			console.warn(e);
			client.controller.renderCollaborationList();
			client.model.runCollaborationsThreadFinished = true;
		}
	)
}, 3000);

client.model.inviteCollaboration = function(resource, email, permission, message, callbackOk, callbackError)
{
	var pars = {
		a:'collaboration_invite',
		url:'',
		path:resource.path,
		email:email,
		permission:permission,
		message:message
	};

	var project = client.model.getProjectForResource(resource);
	if (null != project)
	{
		pars.url = project.url;
		pars['ticket'] = project.ticket;
	}
	else
	{
		// new or shared resource
		pars.path = resource.properties.label;
		pars.url = '';
		pars.content = resource.editor.getText();
	}
	$rpost
	(
		pars,
		function(ticket)
		{
			var index = client.model.collaborations.length;
			var collaboration = $new(amy.Collaboration, ticket.collaborator_id, true, ticket.document_id, ticket.invitation_id, ticket.invitation_hash, ticket.user_id, resource);
			client.model.collaborations[index] = collaboration;
			client.controller.collaborationRenderUpdate = true;
			client.controller.renderCollaborationList();
			callbackOk(collaboration);
		},
		function(e)
		{
			callbackError(e);
		}
	);
}

client.model.acceptCollaboration = function(hash, callbackOk, callbackError)
{
	$rpost
	(
		{a:'collaboration_accept', hash:hash},
		function(ticket)
		{
			var index = client.model.collaborations.length;
			var collaboration = $new(amy.Collaboration, ticket.collaborator_id, false, ticket.document_id, ticket.invitation_id, ticket.invitation_hash, ticket.user_id, ticket.external_document_ref);
			client.model.collaborations[index] = collaboration;
			callbackOk(collaboration);
		},
		function(e)
		{
			callbackError(e);
		}
	);
}

client.model.loadCollaborationMessages = function(ids, callbackOk, callbackError)
{
	$rpost
	(
		{a:'collaboration_get_unread_messages', receiver_ids:ids.join(',')},
		function(messages)
		{
			$foreach (messages, function(message, index)
			{
				callbackOk(message, index);				
			})
		},
		function(e)
		{
			callbackError(e);
		}
	);
}

client.model.getCollaboration = function(collaboratorId)
{
	for ( var i in client.model.collaborations )
	{
		var collaboration = client.model.collaborations[i];
		if (parseInt(collaboratorId) == parseInt(collaboration.collaboratorId))
		{
			// console.info('Found collaboration: %o', collaboration);
			return collaboration;
		}
	}
	return null;
}
