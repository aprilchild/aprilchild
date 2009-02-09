/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Bundles controller

  *------------------------------------------------------------------------------------------
*/

client.controller.showBundleEditor = function()
{
    var win = client.view.showDialogWindow($loc('wt_bundle_editor'), {width:800, height:550}, function(widget, node)
    {
        if ( $notset(client.widgets.bundleEditor) )
        {
        	client.widgets.bundleEditor = $new
        	(
        		ac.TreeWidget,
        		$new(amy.BundleEditorTreeModel, $new(ACElement)),
        		$new(amy.BundleEditorTreeView, {showRootElement:false, hasElementIcon:true}),
        		$new(amy.BundleEditorTreeController),
        		client.widgets.winDialog
        	);
        }
        var root_item = client.widgets.bundleEditor.model.rootElement;
        root_item.setState(root_item.STATE_WILL_LOAD);
        root_item.isCollection = true;
        var w = node.w()-16;
        var h = node.h()-16;
        var left_w = Math.floor(w/4);

        var left_node = node.a($$()).pos(true).x(8).y(8).n('bundle-editor-left').w(left_w-2).h(h);
        var right_node = node.a($$()).n('bundle-editor-right').pos(true).w(w-left_w-8).h(h-8).x(left_w+16).y(8);
        
    	right_node.a(fry.ui.snippet.RoundBoxTransparent(w-left_w-8, 20, 'rbox-be', function(node)
    	{
    		node.h(h-40);
    	}, 'transparent').o(0.35));
    	
    	client.nodes.bundleEditorEditNode = right_node.a($$()).pos(true).x(14).y(14).w(w-left_w-28).h(h-28).s('overflow:auto').n('edit-inn');
        
        
    	client.widgets.bundleEditor.show(left_node.a($$()).n('ntree').pos(true).w(left_node.w()).h(left_node.h()-32), 'bundle-editor');
    	left_node.a($$()).pos(true).w(28).h(22).y(left_node.h()-26).x(0).n('bundle-editor-b-add').e('click', function(evt)
    	{
    	    evt.stop();
       		client.controller.showPopupMenu(evt.$.fc(),
       			function(acElem)
       			{
       				acElem.removeAllChildren();
					$foreach( ['snippet', 'command', 'language', '', 'bundle'], function(mid)
					{
       					var child_elem = acElem.appendChild($new(ACElement));
       					child_elem.isCollection = false;
       					child_elem.properties.isSeparator = '' == mid;
       					child_elem.properties.label = $loc('mi_add_?'.embed(mid));
       					child_elem.mid = mid;
					});
       			},
       			function(acElem)
       			{
					var getBundle = function()
					{
						var selection = client.widgets.bundleEditor.getSelection();
						if ( null != selection && 0 != selection.length )
						{
							selection = selection[0];
							if ( 'bundle' != selection.type)
							{
								selection = selection.parentElement;
							}
							if ( 'bundle' == selection.type )
							{
							    if ( 1 == client.model.bundles[selection.properties.bundle.id].state )
							    {
    								return [selection, client.model.bundles[selection.properties.bundle.id]];							        
							    }
							}
						}
						return null;
					}
					var updateWidget = function(new_item)
					{
	                    // updating bundle editor tree
	                    var bundle_editor = client.widgets.bundleEditor
						bundle_editor.hide();
						bundle_editor.show(client.widgets.bundleEditor.containerNode.rc(), 'bundle-editor');
						bundle_editor.changeSelection(new_item, true);
						bundle_editor.controller.onElementClick(new_item, null);					    
					}
					switch ( acElem.mid )
					{
						case 'snippet':
						{
							var result = getBundle();
							if ( null == result )
							{
								return;
							}
							var tree_item = result[0];
							var bundle = result[1];
							var snippet = client.model.createSnippet(bundle);
							var child_item = tree_item.appendChild($new(ACElement));
		                    child_item.isCollection = false;
		                    child_item.type = 'snippet';
		                    child_item.properties.snippet = snippet;
		                    child_item.properties.bundleId = bundle.id;
		                    child_item.properties.label = snippet.name.encodeMarkup();
		                    updateWidget(child_item);
							
						};break;
						case 'command':
						{
							var result = getBundle();
							if ( null == result )
							{
								return;
							}
							var tree_item = result[0];
							var bundle = result[1];
							var command = client.model.createCommand(bundle);
							var child_item = tree_item.appendChild($new(ACElement));
		                    child_item.isCollection = false;
		                    child_item.type = 'command';
		                    child_item.properties.command = command;
		                    child_item.properties.bundleId = bundle.id;
		                    child_item.properties.label = command.name;
		                    updateWidget(child_item);

						};break;
						case 'language':
						{
							
						};break;
						case 'bundle':
						{
							
						};break;
					}
       			}
       		);
    	}).a($$().pos(true).y(20));
    	left_node.a($$()).pos(true).w(23).h(22).y(left_node.h()-26).x(28).n('bundle-editor-b-remove').e('click', function(evt)
    	{
    	   evt.stop();
			var selection = client.widgets.bundleEditor.getSelection();
			if ( null != selection && 0 != selection.length )
			{
				selection = selection[0];
				var parent_item = selection.parentElement;
				var updateWidget = function()
				{
                    // updating bundle editor tree
                    var bundle_editor = client.widgets.bundleEditor
					bundle_editor.hide();
					bundle_editor.show(client.widgets.bundleEditor.containerNode.rc(), 'bundle-editor');
					bundle_editor.changeSelection(parent_item, true);
					bundle_editor.controller.onElementClick(parent_item, null);
				}
				switch ( selection.type )
				{
				    case 'snippet':
				    {
                	    client.view.showFlashMessage($loc('fm_DeletingSnippet'));
                	    client.model.deleteSnippet(selection.properties.bundleId, selection.properties.snippet.index, function(result)
                	    {
                	        if ( !result )
                	        {
                        	    client.view.showFlashMessage($loc('fm_e_DeletingSnippet'), 2);
                	        }
                	        else
                	        {
                	            client.view.hideFlashMessage();
                	            parent_item.removeChild(selection);
                	            updateWidget();
                	        }
                	    });
				    };break;
				    case 'command':
				    {
                	    client.view.showFlashMessage($loc('fm_DeletingCommand'));
                	    client.model.deleteSnippet(selection.properties.bundleId, selection.properties.command.index, function(result)
                	    {
                	        if ( !result )
                	        {
                        	    client.view.showFlashMessage($loc('fm_e_DeletingCommand'), 2);
                	        }
                	        else
                	        {
                	            client.view.hideFlashMessage();
                	            parent_item.removeChild(selection);
                	            updateWidget();
                	        }
                	    });
				    };break;
				    case 'bundle':
				    {
				        
				    };break;
				}
            }
    	});
    }, function()
    {
        client.widgets.bundleEditor.hide();
    });
}

client.controller.showBundleEditorEditArea = function(callbackOnRender)
{
    callbackOnRender(client.nodes.bundleEditorEditNode.rc());
    //fry.ui.effect.FadeIn(client.nodes.bundleEditorEditNode, 4);
}

/*  ---------------------------------------------------------------- 
	amy.BundleEditorTreeController < ac.TreeWidgetController
*/
$class('amy.BundleEditorTreeController < ac.TreeWidgetController');

amy.BundleEditorTreeController.prototype.onElementClick = function(acElem, evt)
{
    var cmd = 'edit_?'.embed(acElem.type);
    if ( this[cmd] )
    {
        var callback = this[cmd];
        client.controller.showBundleEditorEditArea(function(node)
        {
            callback(acElem, node);
        });        
    }
}

amy.BundleEditorTreeController.prototype.edit_bundle = function(acElem, node)
{
    var bundle = client.model.bundles[acElem.properties.bundle.id];
    console.log(bundle);
    
    var info = bundle.info;
    var ht = '<h3>?</h3><div class="note">?</div>'.embed(info.name, info.note);
    node.t(ht);
    
	var values = [];
	values.push([$loc('version'), info.version]);
	values.push([$loc('author'), info.author]);
	values.push([$loc('url'), '<a href="?" target="ref">?</a>'.embed(info.url,info.url)]);
	values.push([$loc('dependencies'), info.dependencies.dependencies]);
	fry.ui.snippet.TablePairedInfo(node, '', values);        
}

amy.BundleEditorTreeController.prototype.edit_keymap = function(acElem, node)
{
    var w = node.w();
    var h = node.h();
    node.t('<textarea class="editable" wrap="off" style="width:?px;height:?px"></textarea>'.embed(w-10, h-40));
    node.fc().$.value = acElem.properties.source;
}

amy.BundleEditorTreeController.prototype.edit_language = function(acElem, node)
{
    var language_id = acElem.properties.language_id;
    client.model.loadLanguageDefinitionSource(language_id, function(source)
    {
        if ( null == source )
        {
            
        }
        else
        {
            var w = node.w();
            var h = node.h();
            node.t('<textarea class="editable" wrap="off" style="width:?px;height:?px"></textarea>'.embed(w-10, h-40));
            node.fc().$.value = source;
        }
    })
}


amy.BundleEditorTreeController.prototype.edit_snippet = function(acElem, node)
{
    var w = node.w();
    var h = node.h();
    var snippet = acElem.properties.snippet;
    
	var form = fry.ui.form.create(
	{
		l_snippet_name: 	{position:'1x1{w:90}', type:'label'},
		snippet_name:	    {position:'1x2|2', type:'text', params:{width:w-124}},
		snippet_code:	    {position:'2x1|3', type:'text', params:{subtype:'area', inline:'wrap="off"', width:w-28, height:h-120, className:'editable'}},
		l_activation: 	    {position:'3x1', type:'label'},
		activation_type:    {position:'3x2{w:120}', type:'combo', params:{width:110,
			fillHandler:function(index)
			{
				if ( 2 == index )
				{
				    return false;
				}
				return [index, $loc('activation_type_?'.embed(index))];
			}}
		},
		activation_key:	    {position:'3x3', style:'height:14px;padding-top:1px;margin-left:66px', type:'text', params:{width:w-312}},
		butt_save_snippet:	{position:'4x1|3{ha:right}', style:'margin-top:6px', type:'button', params:{}}
	});
	var form_params = {};
	for (var id in form.items)
	{
	    form_params[id] = $loc(id);
	}
	form_params.snippet_name = snippet.name;
	form_params.snippet_code = snippet.code;
	form_params.activation_type = '' == snippet.key_activation ? 0 : 1;
	form_params.activation_key = '' == snippet.key_activation ? snippet.tab_activation : String.fromCharCode(snippet.key_activation.split('+')[0]);
	
	form.show(node, form_params);
	var td = node.g('table:0/tr:2/td:2').pos(true).x(216);
	var node_keys = td.a($$()).pos(true).x(0).y(4).w(62).h(16).s('border:1px solid #bbb;background:#fff').v(''!=snippet.key_activation);
	$foreach (['meta', 'shift', 'alt', 'ctrl'], function(key, index)
	{
	    node_keys.a($$()).pos(true).x(3+index*14).y(1).w(14).h(16).s('cursor:default').t('<img src="mm/i/key-?-?active.gif" title="?"/>'.embed(key, -1==snippet.key_activation.indexOf(key) ? 'in': '', key)).e('click', function(evt)
	    {
	        evt.stop();
	        var img = evt.$.gp('div').g('img:0');
	        var img_src = img.$.src;
	        var is_active = -1 != img_src.indexOf('-active.');
	        img_src = is_active ? img_src.replace(/-active/, '-inactive') : img_src.replace(/-inactive/, '-active');
	        img.$.src = img_src;
	    });
	});
	node.g('select').e('change', function(evt)
	{
	    node_keys.v(1==evt.$.$.selectedIndex);
	});
	form.onButtSaveSnippet = function(values)
	{
	    if ( '' == values.activation_key.trim() || '' == values.snippet_name.trim() || '' == values.snippet_code.trim() )
	    {
	        return;
	    }
	    var key = '';
	    var res_snippet = null;
	    if ( 1 == values.activation_type )
	    {
        	var lst = td.g('img');
        	var keys = ['meta', 'shift', 'alt', 'ctrl'];
        	for ( var i=0; i<keys.length; i++ )
        	{
        	    if ( -1 != lst[i].$.src.indexOf('-active.') )
        	    {
        	        key += '+'+keys[i];
        	    }
        	}
        	key = values.activation_key.toUpperCase().charCodeAt(0) + key;
        	res_snippet = client.model.updateSnippet(acElem.properties.bundleId, snippet.index, values.snippet_name, values.snippet_code, '', key);
	    }
	    else
	    {
        	res_snippet = client.model.updateSnippet(acElem.properties.bundleId, snippet.index, values.snippet_name, values.snippet_code, values.activation_key, '');
	    }
	    if ( null == res_snippet )
	    {
	        return;
	    }
	    client.view.showFlashMessage($loc('fm_SavingSnippet'));
	    client.model.saveSnippets(acElem.properties.bundleId, function(result)
	    {
	        if ( !result )
	        {
        	    client.view.showFlashMessage($loc('fm_e_SavingSnippet'), 2);
	        }
	        else
	        {
	            client.view.hideFlashMessage();
	        }
	    });
	    //console.log(res_snippet);
	}
	
}




amy.BundleEditorTreeController.prototype.edit_command = function(acElem, node)
{
    var w = node.w();
    var h = node.h();
    var command = acElem.properties.command;
    
    var create_key = function(key, index)
    {
        return $loc(key+index, 'en').replace(/ /g, '_').toLowerCase();
    }
    
	var form = fry.ui.form.create(
	{
		l_command_name: 	{position:'1x1{w:90}', type:'label'},
		command_name:	    {position:'1x2|3', type:'text', params:{width:w-124}},
		command_code:	    {position:'2x1|4', type:'text', params:{subtype:'area', inline:'wrap="off"', width:w-28, height:h-180, className:'editable'}},
		l_command_input:    {position:'3x1', type:'label'},
		input_type:         {position:'3x2{w:120}', type:'combo', params:{width:110,
			fillHandler:function(index)
			{
				if ( 3 == index )
				{
				    return false;
				}
				return [create_key('input_type_', index), $loc('input_type_?'.embed(index))];
			}}
		},
		l_command_input_or:   {position:'3x3{w:40}', type:'label'},
		input_type_or:      {position:'3x4', type:'combo', params:{width:140,
			fillHandler:function(index)
			{
				if ( 5 == index )
				{
				    return false;
				}
				return [create_key('input_type_or_', index), $loc('input_type_or_?'.embed(index))];
			}}
		},
		l_command_output:   {position:'4x1', type:'label'},
		output_type:        {position:'4x2|3', type:'combo', params:{width:240,
			fillHandler:function(index)
			{
				if ( 8 == index )
				{
				    return false;
				}
				return [create_key('output_type_', index), $loc('output_type_?'.embed(index))];
			}}
		},
		l_activation: 	    {position:'5x1', type:'label'},
		activation_type:    {position:'5x2{w:120}', type:'combo', params:{width:110,
			fillHandler:function(index)
			{
				if ( 2 == index )
				{
				    return false;
				}
				return [index, $loc('activation_type_?'.embed(index))];
			}}
		},
		activation_key:	    {position:'5x3|2', style:'height:14px;padding-top:1px;margin-left:66px', type:'text', params:{width:w-312}},
		butt_save_command:	{position:'6x1|4{ha:right}', style:'margin-top:6px', type:'button', params:{}}
	});
	var form_params = {};
	for (var id in form.items)
	{
	    form_params[id] = $loc(id);
	}
	form_params.command_name = command.name;
	form_params.command_code = command.code;
	form_params.activation_type = '' == command.key_activation ? 0 : 1;
	form_params.activation_key = '' == command.key_activation ? command.tab_activation : String.fromCharCode(command.key_activation.split('+')[0]);
	form_params.input_type = command.input_type;
	form_params.input_type_or = command.input_type_or;
	form_params.output_type = command.output_type;
	
	form.show(node, form_params);
	var td = node.g('table:0/tr:4/td:2').pos(true).x(216);
	var node_keys = td.a($$()).pos(true).x(0).y(4).w(62).h(16).s('border:1px solid #bbb;background:#fff').v(''!=command.key_activation);
	$foreach (['meta', 'shift', 'alt', 'ctrl'], function(key, index)
	{
	    node_keys.a($$()).pos(true).x(3+index*14).y(1).w(14).h(16).s('cursor:default').t('<img src="mm/i/key-?-?active.gif" title="?"/>'.embed(key, -1==command.key_activation.indexOf(key) ? 'in': '', key)).e('click', function(evt)
	    {
	        evt.stop();
	        var img = evt.$.gp('div').g('img:0');
	        var img_src = img.$.src;
	        var is_active = -1 != img_src.indexOf('-active.');
	        img_src = is_active ? img_src.replace(/-active/, '-inactive') : img_src.replace(/-inactive/, '-active');
	        img.$.src = img_src;
	    });
	});
	node.g('select:3').e('change', function(evt)
	{
	    node_keys.v(1==evt.$.$.selectedIndex);
	});
	form.onButtSaveCommand = function(values)
	{
	    if ( '' == values.activation_key.trim() || '' == values.command_name.trim() || '' == values.command_code.trim() )
	    {
	        return;
	    }
	    var key = '';
	    var res_snippet = null;
	    if ( 1 == values.activation_type )
	    {
        	var lst = td.g('img');
        	var keys = ['meta', 'shift', 'alt', 'ctrl'];
        	for ( var i=0; i<keys.length; i++ )
        	{
        	    if ( -1 != lst[i].$.src.indexOf('-active.') )
        	    {
        	        key += '+'+keys[i];
        	    }
        	}
        	key = values.activation_key.toUpperCase().charCodeAt(0) + key;
        	res_command = client.model.updateCommand(acElem.properties.bundleId, command.index, values.command_name, values.command_code, '', key, values.input_type, values.input_type_or, values.output_type);
	    }
	    else
	    {
        	res_command = client.model.updateCommand(acElem.properties.bundleId, command.index, values.command_name, values.command_code, values.activation_key, '', values.input_type, values.input_type_or, values.output_type);
	    }
	    if ( null == res_command )
	    {
	        return;
	    }
	    client.view.showFlashMessage($loc('fm_SavingCommand'));
	    client.model.saveCommands(acElem.properties.bundleId, function(result)
	    {
	        if ( !result )
	        {
        	    client.view.showFlashMessage($loc('fm_e_SavingCommand'), 2);
	        }
	        else
	        {
	            client.view.hideFlashMessage();
	        }
	    });
	    //console.log(res_snippet);
	}
	
}