/*
 * AC Fry - JavaScript Framework v1.0
 *
 * Form UI Support extension - easier handling of forms
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*--------*/

// declaring default `fry.ui.form` namespace
fry.ui.form = 
{
	create:function(definition)
	{
		var form = $new(ACForm, definition);
		return form;
	},
	generateDefaultMapping:function(id)
	{
		return {get:function(obj){return obj[id]}, set:function(obj, value){obj[id]=value}};		
	}
}

$class('ACForm',
{
	construct:function(definition)
	{
		this.setDefinition(definition);
		this.cssClassName = '';
		this.containerNode = null;
		this.renderingNode = null;
	}
});

ACForm.prototype.setDefinition = function(definition)
{
	this.items = {};
	this.layout = [];
	for ( var id in definition )
	{
		if ( id in this.items )
		{
			throw new FryException(764, 'Duplicate form item `?`.'.embed(id));
		}
		var item = definition[id];
		eval('var item_class_name = ACFormItem?'.embed('-?'.embed(item.type).camelize()));
		this.items[id] = $new(item_class_name, id, this, item.params, item.style);
		if ( 'string' != typeof item.position )
		{
			throw new FryException(893, 'Missing position parameter for `?`.'.embed(id));
		}
		var ix = item.position.indexOf('x');
		if ( -1 == ix )
		{
			throw new FryException(893, 'Invalid position declaration `?` for `?`. Must be in form N[|..]xN[|..][{w:[, h:]...}].'.embed(item.position, id));			
		}
		var pos = [item.position.substr(0,ix), item.position.substr(ix+1)];
		var render_info = {w:false, h:false, ha:false, va:false, s:false, c:false, cs:false, rs:false};
		ix = pos[1].indexOf('{');
		if ( -1 != ix )
		{
			var rend_parts = pos[1].substr(ix+1).split(',');
			pos[1] = pos[1].substr(0,ix);
			for ( var i=0; i<rend_parts.length; i++ )
			{
				var rend_part = rend_parts[i];
				if ( '}' == rend_part.charAt(rend_part.length-1) )
				{
					rend_part = rend_part.substr(0, rend_part.length-1);
				}
				var ixp = rend_part.indexOf(':');
				if ( -1 != ixp )
				{
					render_info[rend_part.substr(0,ixp)] = rend_part.substr(ixp+1);
				}
			}
		}
		ix = pos[0].indexOf('|');
		if ( -1 != ix )
		{
			render_info.rs = pos[0].substr(ix+1);
			pos[0] = pos[0].substr(0, ix);
		}
		ix = pos[1].indexOf('|');
		if ( -1 != ix )
		{
			render_info.cs = pos[1].substr(ix+1);
			pos[1] = pos[1].substr(0, ix);
		}
//		console.log('%o', pos);
//		console.log('%o', render_info);
		if ( !this.layout[pos[0]-1] )
		{
			this.layout[pos[0]-1] = [];
		}
		if ( !this.layout[pos[0]-1][pos[1]-1] )
		{
			this.layout[pos[0]-1][pos[1]-1] = [];
		}
		this.layout[pos[0]-1][pos[1]-1][this.layout[pos[0]-1][pos[1]-1].length] = {id:id, item:this.items[id], render:render_info};
	}
}

ACForm.prototype.setParams = function(params)
{
	if ( 'object' != typeof params )
	{
		params = {};
	}
	if ( 'map' in params )
	{
		this.liveUpdateActive = true;
		this.liveUpdateAutomated = 'auto' in params && params.auto;
	}
	this.liveDefaultValues = {};
	if ( 'values' in params )
	{
		this.liveDefaultValues = params.values;
	}
	this.setMapping(params.map||{});
}

ACForm.prototype.setMapping = function(mapping)
{
	for ( var id in this.liveObject )
	{
		if ( !mapping[id] && this.items[id] )
		{
			mapping[id] = fry.ui.form.generateDefaultMapping(id);
		}
	}
	this.liveUpdateMap = mapping;
}

ACForm.prototype.setItemValue = function(item, value)
{
	if ( this.liveUpdateAutomated && this.liveUpdateMap[item.id] && 'set' in this.liveUpdateMap[item.id] )
	{
		this.liveUpdateMap[item.id].set(this.liveObject, value);
	}
	item.value = value;
	var caller = this;
	var c_item = 
	{
		id:function()
		{
			return item.id;
		},
		is:function(id)
		{
			return item.id == id;
		},
		contains:function(v)
		{
			return item.value == v;
		},
		value:function(v)
		{
			if ( 'undefined' == typeof v )
			{
				return item.value;
			}
			else
			{
				item.setValue(v, true);
			}
		},
		other:function(id, v)
		{
			if ( id in caller.items )
			{
				if ( 'undefined' == typeof v )
				{
					return caller.items[id].value;
				}
				else
				{
					caller.items[id].setValue(v, true);
				}
				return;
			}
			throw new FryException(236, 'Form does not contain field with ID `?`.'.embed(id));
			
		}
	}
	this.onChange(c_item);
	if ( !this.renderingRunning )
	{
		for ( var id in this.items )
		{
			if ( this.liveUpdateMap[id] && 'set' in this.liveUpdateMap[id] )
			{
				this.liveUpdateMap[id].set(this.liveObject, this.items[id].getValue());
			}
		}		
	}
}

ACForm.prototype.submit = function(item)
{
	var handler_name = 'on-?'.embed(item.id).camelize();
	if ( !this[handler_name] )
	{
		throw new FryException(543, 'Submit handler for button `?` not defined `?`.'.embed(item.id, handler_name));
	}
	var values = {};
	for ( var id in this.items )
	{
		values[id] = this.items[id].getValue();
		if ( item.params && item.params.liveUpdate && this.liveUpdateActive && this.liveUpdateMap[id] && 'set' in this.liveUpdateMap[id] )
		{
			this.liveUpdateMap[id].set(this.liveObject, values[id]);
		}
	}	
	this[handler_name](values);
}

// causes original values to be reverted to the state before showing the form - useful for live objects
ACForm.prototype.rollback = function()
{
	for ( var id in this.items )
	{
		var value = this.liveObjectState[id];
		if ( this.liveUpdateActive && this.liveUpdateMap[id] && 'set' in this.liveUpdateMap[id] )
		{
			this.liveUpdateMap[id].set(this.liveObject, value);
		}
	}
	this.render(this.renderingNode, this.liveObject, this.cssClassName);
}

ACForm.prototype.show = function(node, values, params, cssClassName)
{
	this.liveObject = values;
	this.setParams(params||{});
	cssClassName = cssClassName || '';
	if ( this.liveUpdateActive )
	{
		this.liveObject = values;
	}
	this.cssClassName = cssClassName;
	this.containerNode = node;
	this.renderingNode = null;
	this.liveObjectState = {};
	this.render(node, values, cssClassName);
}

ACForm.prototype.hide = function()
{
	this.renderingNode.rs();
}

ACForm.prototype.render = function(node, values, cssClassName)
{
	this.renderingRunning = true;
	if ( null == this.renderingNode )
	{
		this.renderingNode = node.a($$());		
	}
	var tbody = this.renderingNode.t('').a($$('table')).n('acform ?'.embed(''!=cssClassName?cssClassName:'')).sa('cellSpacing',0).a($$('tbody'));
	var num_rows = 0;
	var num_cols = 0;
	for ( var r in this.layout )
	{
		for ( var c in this.layout[r] )
		{
			num_cols = Math.max(parseInt(c)+1, num_cols);
		}
		num_rows++;
	}
	for ( var r in this.layout )
	{
		var tr = tbody.a($$('tr'));
		for ( var c=0; c<num_cols; c++ )
		{
			var td = tr.a($$('td'));
			if ( !this.layout[r][c] )
			{
				td.t('&nbsp;')
			}
			else
			{
				var items = this.layout[r][c];
				var tr_inner = null;
				if ( 1 < items.length )
				{
					tr_inner = td.a($$('table')).n('cell-inner').sa('cellSpacing',0).a($$('tbody')).a($$('tr'));
				}
				for ( var i=0; i<items.length; i++ )
				{
					if ( 0 == i )
					{
						var col_span = items[0].render.cs;
						if ( col_span )
						{
							td.sa('colSpan', col_span);
							c += parseInt(col_span)-1;
						}
					}
					var item = items[i];
					var value = null;
					if ( this.liveUpdateActive )
					{
						// live update activated
						if ( this.liveUpdateMap[item.id] && 'get' in this.liveUpdateMap[item.id] )
						{
							// found getter callback
							value = this.liveUpdateMap[item.id].get(this.liveObject);
						}
						else
						{
							// using default value
							value = item.id in this.liveDefaultValues ? this.liveDefaultValues[item.id] : null;
						}
					}
					else
					{
						value = (values && item.id in values)?values[item.id]:value;
					}
					if ( !this.liveObjectState[item.id] )
					{
						this.liveObjectState[item.id] = value;						
					}
					item.item.setValue(value);
					var node = 1 == items.length ? td : tr_inner.a($$('td'));
					// applying cell grid render properties if any
					var render_info = item.render;
					if ( render_info.w )
					{
						node.w(render_info.w);
					}
					if ( render_info.h )
					{
						node.h(render_info.h);
					}
					if ( render_info.ha )
					{
						node.sa('align', render_info.ha);
					}
					if ( render_info.s )
					{
						node.s(render_info.s);
					}
					if ( render_info.va )
					{
						node.s('vertical-align:?'.embed(render_info.va));
					}
					if ( render_info.c )
					{
						node.n(render_info.c);
					}
					item.item.render(node);
				}
			}
		}
	}
	this.renderingRunning = false;
}

/* Event listeners */
ACForm.prototype.onChange = function(item)
{
}


$class('ACFormItem',
{
	construct:function(id, form, params, style)
	{
		this.id = id;
		this.form = form;
		this.params = params || {};
		this.style = style || '';
		this.value = null;
	}
})

ACFormItem.prototype.render = function(node)
{
}

ACFormItem.prototype.getValue = function()
{
	return this.value;
}
ACFormItem.prototype.setValue = function(value, setDirectly)
{
	if ( setDirectly )
	{
		this.value = value;
		this.updateValue();
	}
	else
	{
		this.form.setItemValue(this, value);		
	}
}

// called to re-render value that has been changed externally
ACFormItem.prototype.updateValue = function()
{
}

/* ______ Label ________ */

$class('ACFormItemLabel < ACFormItem')

ACFormItemLabel.prototype.render = function(node)
{
	this.node = node.a($$('span')).n('label').t($getdef(this.value, '&lt;Empty label&gt;'));
}

ACFormItemLabel.prototype.updateValue = function()
{
	this.node.fc().t(this.value);
}

/* ______ Text ________ */

$class('ACFormItemText < ACFormItem')

ACFormItemText.prototype.render = function(node)
{
	var subtype = this.params ? this.params.subtype : null;
	if ( 'area' == subtype )
	{
		node.t('<textarea class="?" style="width:?px;height:?px;?" ?>?</textarea>'.embed($getdef(this.params['className'], 'text'), $getdef(this.params['width'], ''), $getdef(this.params['height'], ''), $getdef(this.style, ''), $getdef(this.params['inline'],''), $getdef(this.value, '').encodeMarkup()));
	}
	else
	{
		node.t('<input type="?" class="?" value="?" style="width:?px;?"/>'.embed($getdef(subtype, 'text'), $getdef(this.params['className'], 'text'), $getdef(this.value, '').encodeMarkup().replace(/"/g, '&quot;'), $getdef(this.params['width'], ''), $getdef(this.style, '')));		
	}
	this.node = node.fc();
	var caller = this;
	node.fc().e('change', function(evt)
	{
		evt.stop();
		caller.form.setItemValue(caller, evt.$.$.value);
	});
}

ACFormItemText.prototype.updateValue = function()
{
	this.node.$.value = this.value;
}

/* ______ Checkbox ________ */

$class('ACFormItemCheckbox < ACFormItem')

ACFormItemCheckbox.prototype.render = function(node)
{
	node.t('<input type="checkbox" class="checkbox" ? value="?" style="width:?"/>'.embed(this.value?'checked="checked"':'', $getdef(this.params['width'], 'auto')));
	this.node = node.fc();
	var caller = this;
	node.fc().e('click', function(evt)
	{
		evt.stop();
		caller.form.setItemValue(caller, evt.$.$.checked);
	})
}

ACFormItemCheckbox.prototype.updateValue = function()
{
	this.node.$.checked = this.value;
}


/* ______ Radio ________ */

$class('ACFormItemRadio < ACFormItem');

ACFormItemRadio.prototype.render = function(node)
{
	this.nodes = {};
	if ( null != this.params && this.params.items )
	{
		var caller = this;
		var tbody = node.a($$('table')).sa('cellSpacing', 0).n('radio-group').a($$('tbody'));
		for ( var key in this.params.items )
		{
			var tr = tbody.a($$('tr'));
			this.nodes[key] = tr.a($$('td')).t('<input type="radio" class="radio" name="?" value="?" ?/>'.embed(this.id, key, key==this.value?'checked="checked"':''));
			this.nodes[key] = this.nodes[key].fc();
			this.nodes[key].e('click', function(evt)
			{
				evt.stop();
				if ( evt.$.$.checked )
				{
					caller.form.setItemValue(caller, evt.$.$.value);
				}
			});
			tr.a($$('td')).t(this.params.items[key]);
		}
	}
}

ACFormItemRadio.prototype.updateValue = function()
{
	for ( var key in this.nodes )
	{
		this.nodes[key].$.checked = key == this.value;
	}
}


/* ______ Combo ________ */

$class('ACFormItemCombo < ACFormItem')

ACFormItemCombo.prototype.getValue = function()
{
	return $comboget(this.node);
}

ACFormItemCombo.prototype.render = function(node)
{
	node.t('<select class="combo" style="width:?px;?"></select>'.embed($getdef(this.params['width'], ''), $getdef(this.style, '')));
	this.node = node.fc();
	var caller = this;
	this.node.e('change', function(evt)
	{
		evt.stop();
		caller.form.setItemValue(caller, caller.getValue());
	})
	$combofill(this.node, this.params.fillHandler);
	this.updateValue();
}

ACFormItemCombo.prototype.updateValue = function()
{
	$comboset(this.node, this.value);
}

/* ______ Button ________ */

$class('ACFormItemButton < ACFormItem')

ACFormItemButton.prototype.render = function(node)
{
	var caller = this;
	if ( this.params.renderer )
	{
		var params = [];
		var command_params = [];
		$foreach ( this.params.rendererParams, function(param)
		{
			if ( ':label' == param )
			{
				params[params.length] = $getdef(caller.value);
			}
			else if ( ':callback' == param )
			{
				params[params.length] = function(evt)
				{
					evt.stop();
					caller.form.submit(caller);
				}
			}
			else
			{
				params[params.length] = param;
			}
			command_params[command_params.length] = 'params[?]'.embed(command_params.length);
		});
		eval('node.a(this.params.renderer(?));'.embed(command_params.join(',')));
	}
	else
	{
		node.t('<input type="button" class="button" value="?" />'.embed($getdef(this.value, '')));
		this.node = node.fc();
		this.node.s($getdef(this.style, '')).e('click', function(evt)
		{
			evt.stop();
			caller.form.submit(caller);
		});
	}
}

ACFormItemButton.prototype.updateValue = function()
{	
	if ( !this.params.renderer )
	{
		this.node.$.value = this.value;
	}
}




/*--------*/

if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}