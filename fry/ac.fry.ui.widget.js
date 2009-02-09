/*
 * AC Fry - JavaScript Framework v1.0
 *
 * UI Widgets extension
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*--------*/

// declaring default namespace
var ac = 
{
	init:function()
	{
		// registering default click listener for widget focusing 
		$(document.documentElement).e('click', function(evt)
		{
			var el = evt.target;
			var focused = false;
			while ( !focused && el && document.documentElement != el )
			{
				if ( null != el.getAttribute('widget-ident') )
				{
					var ident = el.getAttribute('widget-ident');
					var searchWidget = function(widget)
					{
						if ( widget.ident != ident )
						{
							return false;
						}
						ac.widget.focus(widget);
						focused = true;
						return true;
					}
					ac.widget.rootWidget.listChildWidgets(searchWidget, false, true);
				}
				el = el.parentNode;
			}
			if ( !focused )
			{
				ac.widget.focus(ac.widget.rootWidget);
			}
		});
		if (fry.keyboard)
		{
			fry.keyboard.initialize();
			fry.keyboard.addListener(ac.widget.keyboardListener);
		}
		ac.widget.rootWidget = $new(ac.Widget, $new(ac.WidgetModel), $new(ac.WidgetView), $new(ac.WidgetController), null);
		ac.widget.rootWidget.show($());
		ac.widget.rootWidget.renderingNode.d(false);
	},
	widget:
	{
		// root widget
		rootWidget:null,
		// focus/blur support
		focusedWidget:null,
		focus:function(widget)
		{
			if ( !widget || 'object' != typeof widget || !widget.onFocus)
			{
				return;
			}
			if ( ac.widget.focusedWidget )
			{
				if ( ac.widget.focusedWidget == widget )
				{
					return;
				}
				var w = widget;
				var do_blur = true;
				while ( null != w.parentWidget )
				{
					if ( ac.widget.focusedWidget == w )
					{
						do_blur = false;
						break;
					}
					w = w.parentWidget;
				}
				if ( do_blur )
				{
					ac.widget.focusedWidget.onBlur();					
				}
			}
			ac.widget.focusedWidget = widget;
			widget.onFocus();
		},
		blur:function()
		{
			if ( ac.widget.focusedWidget )
			{
				ac.widget.focusedWidget.onBlur();
			}
			ac.widget.focusedWidget = null;
		},
		isFocused:function(widget)
		{
			return ac.widget.focusedWidget == widget;
		},
		// resizing
		resize:function(widget, width, height)
		{
			widget.onResize(width, height);
			var resizeWidget = function(widget)
			{
				if ( widget.containerNode )
				{
					widget.onResize(widget.containerNode.w(), widget.containerNode.h());
				}
				else
				{
					widget.onResize(width, height);
				}
				return false;
			}
			widget.listChildWidgets(resizeWidget, false, false);			
		},
		// key actions support
		keyActions:[],
		keyActionsMapShown:false,
		keysNodes:[],
		keyboardListener:function(code, mask)
		{
			if (fry.keyboard.CONTROL_CODE == (mask & fry.keyboard.CONTROL_CODE))
			{
				if (fry.keyboard.PASTE == (mask & fry.keyboard.PASTE))
				{
					// pasted text from clipboard received
					if (ac.widget.focusedWidget)
					{
						ac.widget.focusedWidget.onSystemClipboardPaste(fry.keyboard.getClipboardContent());
					}
					return false;
				}
				else if (fry.keyboard.CUT == (mask & fry.keyboard.CUT))
				{
					// cut, let's clear selection if it exists
					if (ac.widget.focusedWidget)
					{
						ac.widget.focusedWidget.onSystemClipboardCut();
					}
					return false;
				}
				else if (fry.keyboard.SIG_CLIPBOARD_GET == (mask & fry.keyboard.SIG_CLIPBOARD_GET))
				{
					// need to return selected content, ask focused widget if it has anything to put into clipboard
					if (ac.widget.focusedWidget)
					{
						return ac.widget.focusedWidget.onSystemClipboardCopy();
					}
					// no, let's just use what user supposedly selected and copied on the page
					return null;
				}
				else
				{
					code = -code;
				}
			}
			// let's filter default Fry actions
			if ((75 == code || 11 == code) && 14 == mask)
			{
				// ctrl+alt+shift+K - displays active keymap (reflecting actual focused widget)
				return ac.widget.showKeyMap();
			}
			// first let's see if there's a focused widget with own active keyboardListener
			if (ac.widget.focusedWidget && ac.widget.focusedWidget.hasKeyboardListenerActive())
			{
				return ac.widget.focusedWidget.keyboardListener(code, mask);
			}
			// let's look trough the key map - looking for scope `local' and `parent'
			var key_actions = ac.widget.keyActions;
			var num_actions = key_actions.length;
			var i = 0;
			var action = null;
			if (ac.widget.focusedWidget)
			{
				var widget = ac.widget.focusedWidget;
				do
				{
					for (i=0; i<num_actions; i++)
					{
						action = key_actions[i];
						if (!action || !action['code'])
						{
							continue;
						}
						if (!action['scope'])
						{
							action['scope'] = 'local';
						}
						if (widget.ident == action.widgetIdent && code == action.code && (action.mask == (mask & action.mask)))
						{
							if (!('local' == action.scope && widget.ident != ac.widget.focusedWidget.ident))
							{
								// found match
								if ('function' == typeof action.params['__callback'])
								{
									return action.params['__callback']({}, code, mask);
								}
								return ac.widget.focusedWidget.runAction(action.params, code, mask);
							}
						}
					}
					widget = widget.parentWidget;
				}
				while (widget);
			}
			// looking through global scope key actions
			for (i=0; i<num_actions; i++)
			{
				action = key_actions[i];
				if (!action || !action['code'] || 'global' != action['scope'])
				{
					continue;
				}
				if (code == action.code && (action.mask == (mask & action.mask)))
				{
					// found match
					if (action.widget)
					{
						if ('function' == typeof action.params['__callback'])
						{
							return action.params['__callback']({}, code, mask);
						}
						return action.widget.runAction(action.params, code, mask);
					}
				}
			}
			return false;
		},
		// keystring format: CODE[+ctrl[+meta[+shift[+alt]]]] where positive code means non-control code (in fry.keyboard). eg 65 matches A, -27 matches Esc
		// node is used when displaying keyMap (visible guide to shortcuts) and is optional
		addKeyAction:function(widget, keyString, params, text, scope, node)
		{
			if (!keyString || isNaN(keyString.split('+')[0]))
			{
				throw new FryException(5456, 'Invalid keyString code (' + keyString + ') in ac.widget.addKeyAction for widget: ' + widget.ident);
			}
			var action = {code:-1, mask:0, widgetIdent:null, widget:null, scope:'local', text:'', params:{}, node:null};
			if (node)
			{
				action.node = node;
			}
			if (scope)
			{
				action.scope = scope;
			}
			if (text)
			{
				action.text = text;
			}
			action.params = params;
			keyString = keyString.toLowerCase();
			if (-1 != keyString.indexOf('+alt'))
			{
				action.mask += fry.keyboard.ALT_KEY;
			}
			if (-1 != keyString.indexOf('+ctrl'))
			{
				action.mask += fry.keyboard.CTRL_KEY;
			}
			if (-1 != keyString.indexOf('+shift'))
			{
				action.mask += fry.keyboard.SHIFT_KEY;
			}
			if (-1 != keyString.indexOf('+meta'))
			{
				action.mask += fry.keyboard.META_KEY;
			}
			action.code = parseInt(keyString.split('+')[0]);
			if ('global' == action.scope)
			{
				action.widget = widget;
			}
			else
			{
				action.widgetIdent = widget.ident;
			}
			ac.widget.keyActions.push(action);
		},
		showKeyMap:function()
		{
			if (ac.widget.keyActionsMapShown)
			{
				return;
			}
			var key_actions = ac.widget.keyActions;
			var num_actions = key_actions.length;
			var i = 0;
			var action = null;
			var widget = ac.widget.focusedWidget || ac.widget.rootWidget;
			do
			{
				for (i=0; i<num_actions; i++)
				{
					action = key_actions[i];
					if (!action || !action['code'])
					{
						continue;
					}
					if (!action['scope'])
					{
						action['scope'] = 'local';
					}
					if (widget.ident == action.widgetIdent && 'global' != action.scope)
					{
						// found match
						ac.widget.showWidgetKeyActionMap(action);
					}
				}
				widget = widget.parentWidget;
			}
			while (widget);
			for (i=0; i<num_actions; i++)
			{
				action = key_actions[i];
				if ('global' == action.scope)
				{
					ac.widget.showWidgetKeyActionMap(action);
				}
			}
			ac.widget.keyActionsMapShown = true;
			$runafter(3000, function()
			{
				ac.widget.hideKeyMap();
			});
		},
		showWidgetKeyActionMap:function(action)
		{
			if (action.node && action.node.is() && action.node.v())
			{
				var key_string = '';
				if (32 <= action.code)
				{
					key_string = String.fromCharCode(action.code).toUpperCase();
				}
				else if (-13 == action.code)
				{
					key_string = 'ENTER';
				}
				else if (-27 == action.code)
				{
					key_string = 'ESC';
				}
				else if (-9 == action.code)
				{
					key_string = 'TAB';
				}
				control_keys = [];
				if (fry.keyboard.CTRL_KEY == (action.mask & fry.keyboard.CTRL_KEY))
				{
					control_keys.push('Ctrl');
				}
				if (fry.keyboard.ALT_KEY == (action.mask & fry.keyboard.ALT_KEY))
				{
					control_keys.push('Alt');
				}
				if (fry.keyboard.SHIFT_KEY == (action.mask & fry.keyboard.SHIFT_KEY))
				{
					control_keys.push('Shift');
				}
				if (fry.keyboard.META_KEY == (action.mask & fry.keyboard.META_KEY))
				{
					control_keys.push('Command');
				}
				if (0 < control_keys.length)
				{
					key_string = control_keys.join('+') + '+' + key_string;
				}
				var pos = action.node.abspos();
				var node = $().a($$()).n('acw-keymap-info?'.embed('global'!=action.scope?' local':'')).pos(true).x(pos.x+38).y(pos.y+24);
				node.t('<img src="mm/i/theme/?/keymap-pointer.gif" width="16" height="16"/><h3>?</h3><p>?</p>'.embed(fry.ui.theme.name, key_string, action.text));
				node.o(0.9).fc().pos(true).x(-16).y(-16);
				ac.widget.keysNodes.push(node);
			}
		},
		hideKeyMap:function()
		{
			$foreach (ac.widget.keysNodes, function(node)
			{
				node.rs();
			})
			ac.widget.keyActionsMapShown = false;
			ac.widget.keysNodes = [];
		},
		// clipboard support, this not the system clipboard! it's a messaging system among widgets
		clipboard:[],
		clipboardCutWidget:null,
		putClipboard:function(selection, onCutWidget)
		{
			ac.widget.clipboardCutWidget = onCutWidget || null;
			if ( !(selection instanceof Array) )
			{
				selection = [selection];
			}
			ac.widget.clipboard = selection;
		},
		getClipboard:function()
		{
			if ( 0 == ac.widget.clipboard.length )
			{
				return null;
			}
			return ac.widget.clipboard;
		},
		pasteClipboard:function(toWidget)
		{
			toWidget = toWidget || ac.widget.focusedWidget;
			if ( null == toWidget )
			{
				throw new FryException(72, 'fry/widget: Invalid widget object passed as parameter to `ac.widget.pasteClipboard` method or no widget focused. Must be a widget.');				
			}
			var clipboard = ac.widget.getClipboard();
			if ( null != ac.widget.clipboardCutWidget && 'object' == typeof ac.widget.clipboardCutWidget )
			{
				if ( 'function' != typeof ac.widget.clipboardCutWidget.onCut )
				{
					throw new FryException(76, 'fry/widget: Invalid onCutWidget object passed as parameter to `ac.widget.putClipboard` method. Must be a widget.');
				}
				ac.widget.clipboardCutWidget.onCut(clipboard, function()
				{
					toWidget.onPaste(clipboard, true);								
				});
			}
			else
			{
				toWidget.onPaste(clipboard, false);
			}
		}
	}
};

/*  ---------------------------------------------------------------- 
	ac.Widget
*/
$class('ac.Widget',
{
	construct:function(model, view, controller, parentWidget)
	{
		this.model = model || null;
		this.view = view || null;
		this.controller = controller || null;
		if ( this.model )
		{
			model.widget = this;
		}
		if ( this.view )
		{
			view.widget = this;
		}
		if ( this.controller )
		{
			controller.widget = this;
		}
		this.properties = {};
		this.containerNode = null;
		this.renderingNode = null;
		this.parentWidget = null;
		if ( 'undefined' == typeof parentWidget )
		{
			parentWidget = ac.widget.rootWidget;
		}
		if ( null != parentWidget )
		{
			parentWidget.registerChildWidget(this);			
		}
		this.childWidgets = [];
		this.isVisible = false;
		this.cssClassName = '';
		this.ident = 'ac-?-?'.embed(new Date().getMilliseconds(), $_(Math.random()).substr(2,5));
		this.keyActionsMap = {};
    	this.selection = []
	},
	destruct:function()
	{
		$foreach (this.childWidgets, function(widget)
		{
			$delete(widget);
		});
		this.unregisterAllKeyActions();
		$delete(this.model);
		$delete(this.view);
		$delete(this.controller);
	}
});

ac.Widget.prototype.genUniqIdent = function(template, id)
{
	id = id || '';
 	return template.embed(this.ident, id);
}

ac.Widget.prototype.show = function(containerNode, cssClassName)
{
	this.cssClassName = cssClassName || '';
	if ( 'undefined' != typeof containerNode )
	{
		this.containerNode = $(containerNode);
	}
	this.render();
	this.setVisibility(true);
	if ( this.renderingNode )
	{
		this.renderingNode.sa('widget-ident', this.ident);
	}
}

ac.Widget.prototype.hide = function()
{
	if ( this.renderingNode && this.renderingNode.is() )
	{
		this.renderingNode.rs();		
	}
}

ac.Widget.prototype.showFrom = function(acElem)
{
}

ac.Widget.prototype.getVisibility = function()
{
	return this.isVisible;
}

ac.Widget.prototype.setVisibility = function(visibility)
{
	this.isVisible = visibility;
	if ( this.renderingNode )
	{
		this.renderingNode.d(visibility);
	}
}

ac.Widget.prototype.render = function()
{
	this.renderingNode = $(this.containerNode).a($$()).w(this.containerNode.w()).h(this.containerNode.h());
}

ac.Widget.prototype.onResize = function(width, height)
{	
}

ac.Widget.prototype.onFocus = function()
{
}

ac.Widget.prototype.onBlur = function()
{
}

ac.Widget.prototype.hasKeyboardListenerActive = function()
{
	return false;
}

ac.Widget.prototype.keyboardListener = function(code, mask)
{
}

ac.Widget.prototype.onSystemClipboardCopy = function()
{
	return null;
}

ac.Widget.prototype.onSystemClipboardCut = function()
{
	return null;
}

ac.Widget.prototype.onSystemClipboardPaste = function(content)
{
}

ac.Widget.prototype.onCut = function(selection, callbackOk)
{
}

ac.Widget.prototype.onPaste = function(selection, wasCut)
{
}

ac.Widget.prototype.runAction = function(params, code, mask)
{
}

ac.Widget.prototype.registerKeyAction = function(keyString, params, text, scope, node)
{
	node = node || this.renderingNode;
	scope = scope || 'local';
	text = text || '';
	if ('function' == typeof params)
	{
		// passed callback instead of set of params - will cause the callback code to be executed directly instead passing the call to .runAction() method
		params = {__callback:params};
	}
	ac.widget.addKeyAction(this, keyString, params, text, scope, node);
}

ac.Widget.prototype.unregisterAllKeyActions = function()
{
	var num_actions = ac.widget.keyActions;
	for (var i=0; i<num_actions; i++)
	{
		if (ac.widget.keyActions[i] && (ac.widget.keyActions[i].widget == this || ac.widget.keyActions[i].widgetIdent == this.ident))
		{
			ac.widget.keyActions[i] = null;
			delete ac.widget.keyActions[i];
		}
	}
}

ac.Widget.prototype.registerChildWidget = function(widget)
{
	for ( var i in this.childWidgets )
	{
		if ( this.childWidgets[i] == widget )
		{
			return;
		}
	}
	widget.parentWidget = this;
	this.childWidgets.push(widget);
}

ac.Widget.prototype.unregisterChildWidget = function(widget)
{
	for ( var i in this.childWidgets )
	{
		if ( this.childWidgets[i] == widget )
		{
			delete this.childWidgets[i];
			return;
		}
	}
}

ac.Widget.prototype.listChildWidgets = function(callback, includeSelf, stoppable)
{
	if ( includeSelf )
	{
		var r = callback(this);
		if ( stoppable && r )
		{
			return true;
		}
	}
	for ( var i in this.childWidgets )
	{
		var r = callback(this.childWidgets[i]);
		if ( stoppable && r )
		{
			return true;
		}
		this.childWidgets[i].listChildWidgets(callback, false, stoppable);
	}
	return false;
}

ac.Widget.prototype.getSelection = function()
{
	return this.selection;
}

ac.Widget.prototype.addSelection = function(items, removePreviousSelection, selectionCallback)
{
	if ( removePreviousSelection )
	{
		if ( selectionCallback )
		{
			var caller = this;
			$foreach ( this.selection, function(item)
			{
				selectionCallback(item, false);
			});
		}
		this.selection = [];
	}
	if ( 'array' != typeof items )
	{
		items = [items];
	}
	var caller = this;
	$foreach ( items, function(item)
	{
		caller.selection.push(item);
		if ( selectionCallback )
		{
			selectionCallback(item, true);
		}
	});
	this.controller.onSelectionChanged(this.selection);
}

ac.Widget.prototype.removeSelection = function(item)
{
	if ( 'undefined' == typeof item )
	{
		this.selection = [];
		this.controller.onSelectionChanged(this.selection);
		return;
	}
	var caller = this;
	$foreach ( this.selection, function(selItem, i, control)
	{
		if ( item == selItem )
		{
			control.remove(true);
			caller.controller.onSelectionChanged(caller.selection);
		}
	});
}

ac.Widget.prototype.isInSelection = function(item)
{
	var result = false;
	$foreach ( this.selection, function(selItem, i, control)
	{
		while ( selItem.parentElement && selItem != item )
		{
			selItem = selItem.parentElement;
		}
		if ( selItem == item )
		{
			result = true;
			control.stop();
		}
	});
	return result;
}

ac.Widget.prototype.getLastSelection = function()
{
	var selection = this.getSelection();
	for ( var i=selection.length-1; i>=0; i-- )
	{
		if ( 'object' == typeof selection[i] )
		{
			return selection[i];
		}
	}
	return null;
}

ac.Widget.prototype.getElementWidgetProperty = function(acElem, name, defaultValue)
{
	var id = name+this.ident;
	if ( !(id in acElem.widgetProperties) )
	{
		acElem.widgetProperties[id] = defaultValue;
	}
	return acElem.widgetProperties[id];
}

ac.Widget.prototype.setElementWidgetProperty = function(acElem, name, value)
{
	var id = name+this.ident;
	acElem.widgetProperties[id] = value;
}

ac.Widget.prototype.getElementNode = function(acElem)
{
	var id = 'node'+this.ident;
	var node = null;
	if ( acElem.widgetProperties[id] && null != acElem.widgetProperties[id] )
	{
		node = acElem.widgetProperties[id];
	}
	else
	{
		node = $(this.genUniqIdent('ec-?-?', acElem.id));
	}
	if ( null != node && !node.is() )
	{
		node = null;
	}
	acElem.widgetProperties[id] = node;		
	return node;
}

ac.Widget.prototype.setElementNode = function(acElem, node)
{
	acElem.widgetProperties['node'+this.ident] = node;
}

ac.Widget.prototype.getElementChildrenSum = function(acElem)
{
	return acElem.widgetProperties.childSum;
}

ac.Widget.prototype.setElementChildrenSum = function(acElem)
{
	acElem.widgetProperties.childSum = acElem.getChildrenStamp();
}



/*  ---------------------------------------------------------------- 
	ac.WidgetModel
*/
$class('ac.WidgetModel',
{
	construct:function()
	{
		this.widget = null;
		this.properties = {};
	}
});

ac.WidgetModel.prototype.loadElements = function(rootElem, callbackOnSuccess, callbackOnError)
{
	callbackOnError();
}

ac.WidgetModel.prototype.getElementById = function(id)
{
	return null;
}


/*  ---------------------------------------------------------------- 
	ac.WidgetView
*/
$class('ac.WidgetView',
{
	construct:function(options)
	{
		this.widget = null;
		this.options = {};
		if ( 'undefined' != typeof options )
		{
			this.setOptions(options);
		}
	}
});

ac.WidgetView.prototype.setOptions = function(options)
{
	for ( var key in options )
	{
		this.options[key] = options[key];
	}
}

ac.WidgetView.prototype.renderElementLoadError = function(acElem, error, node)
{
	node.t('Error while loading children of #?. Message: ?.'.embed(acElem.id, error));
}



/*  ---------------------------------------------------------------- 
	ac.HierarchicalWidgetModel < ac.WidgetModel
*/
$class('ac.HierarchicalWidgetModel < ac.WidgetModel',
{
	construct:function(rootElement)
	{
		this.rootElement = rootElement || null;
		if (null != this.rootElement)
		{
			var me = this;
			this.rootElement.onAfterAppend = function(newElem) { me.onAppendElement(newElem); }
		}
	},
	destruct:function()
	{
		$delete(this.rootElement);
	}
});

ac.HierarchicalWidgetModel.prototype.onAppendElement = function(newElem)
{
}

ac.HierarchicalWidgetModel.prototype.getElementLevel = function(acElem)
{
	var el = acElem;
	var level = 0;
	while (this.rootElement != el && null != el)
	{
		el = el.parentElement
		level++;
	}
	return level;
}

ac.HierarchicalWidgetModel.prototype.getElementById = function(id)
{
	if ( null != this.rootElement )
	{
		return this.rootElement.getElementById(id);
	}
	return null;
}


/*  ---------------------------------------------------------------- 
	ac.HierarchicalWidgetView < ac.WidgetView
*/
$class('ac.HierarchicalWidgetView < ac.WidgetView');

ac.HierarchicalWidgetView.prototype.renderElementSelection = function(acElem, node, mode)
{
}

ac.HierarchicalWidgetView.prototype.renderLoadingMessage = function(acElem, node, marginLeft)
{
	return null;
}




/*  ---------------------------------------------------------------- 
	ac.WidgetController
*/
$class('ac.WidgetController',
{
	construct:function()
	{
		this.widget = null;
	}
});

ac.WidgetController.prototype.allowMultipleSelection = function()
{
	return true;
}

ac.WidgetController.prototype.onSelectionChanged = function(selection)
{
}

ac.WidgetController.prototype.onDnDTransformSource = function(targetDnDAdapter, source)
{
	return source;
}

ac.WidgetController.prototype.onAfterRenderElement = function(acElem)
{
}

ac.WidgetController.prototype.onAfterShowFrom = function(acElem)
{
}

/*  ---------------------------------------------------------------- 
	ac.IEditableWidgetController
	
	Widget controller interface for support of editing elements within widget.
*/
$class('ac.IEditableWidgetController');


ac.IEditableWidgetController.prototype.onGetElementValueForEditing = function(acElem, colId)
{
	return acElem.id;
}

ac.IEditableWidgetController.prototype.onGetElementValueForSorting = function(acElem)
{
	return acElem.id;
}

ac.IEditableWidgetController.prototype.onElementValueEdited = function(acElem, colId, value, callbackOk, callbackError)
{
	callbackError();
}

ac.IEditableWidgetController.prototype.onElementValueCanceled = function(acElem, colId, value)
{
}

ac.IEditableWidgetController.prototype.onGetElementValueEditor = function(acElem, colId)
{
	return $new(ac.ValueEditorText);
}

/*  ---------------------------------------------------------------- 
	ac.IEditableWidget
	
	Widget interface for support of editing elements within widget.
*/

$class('ac.IEditableWidget',
{
	construct:function()
	{
		this.valueEditor = null;
	}
});

ac.IEditableWidget.prototype.valueEditGet = function()
{
	if ( null == this.valueEditor )
	{
		return '';
	}
	return this.valueEditor.value;
}

ac.IEditableWidget.prototype.valueEditCommited = function(canceled)
{
	if ( null == this.valueEditor )
	{
		return;
	}
	var caller = this;
	var postRender = function()
	{
		if ( null == caller.valueEditor )
		{
			// alredy rendered before (caused by cancel or something else)
			return;
		}
		caller.postValueEditing();
		$delete(caller.valueEditor.editor);
		caller.valueEditor = null;
		ac.widget.focus(caller);
	}
	if ( canceled )
	{
		this.controller.onElementValueCanceled(this.valueEditor.acElem, this.valueEditor.colId, this.valueEditor.editor.getValue());
		postRender();
	}
	else
	{
		this.controller.onElementValueEdited(this.valueEditor.acElem, this.valueEditor.colId, this.valueEditor.editor.getValue(), postRender, postRender);
	}
}

ac.IEditableWidget.prototype.valueEditCanceled = function()
{
	this.valueEditCommited(true);
}

ac.IEditableWidget.prototype.postValueEditing = function()
{
}

/*  ---------------------------------------------------------------- 
	ac.IOperationsWidgetController < ac.IEditableWidgetController
	
	Interface supporting elements operations (filter/rename/move/copy/duplicate) within widget. Includes IEditableWidgetController interface.
*/
$class('ac.IOperationsWidgetController < ac.IEditableWidgetController');

// return false to disable all operations
ac.IOperationsWidgetController.prototype.allowOperations = function()
{
	return true;
}

// return true to allow renaming of elements
ac.IOperationsWidgetController.prototype.allowRename = function()
{
	return false;
}

ac.IOperationsWidgetController.prototype.onElementFilter = function(acElem)
{
	return true;
}

ac.IOperationsWidgetController.prototype.onElementDuplicate = function(newElement, oldLabel, newParentElement, duplicitIteration)
{
}

// isCopy is set to true if COPY (selection then contains duplicated elements), false if CUT
// in order to prevent copying selection to clipboard, do NOT call the callbackOk function
ac.IOperationsWidgetController.prototype.onElementClipboardCopy = function(acElemLst, isCopy, callbackOk)
{
}

// in order to prevent copying selection to clipboard, do NOT call the callbackOk function
ac.IOperationsWidgetController.prototype.onElementClipboardCut = function(acElemLst, callbackOk)
{
}

ac.IOperationsWidgetController.prototype.onElementMoveCopy = function(acElemLst, targetElement, isMove, callbackOk)
{
}

ac.IOperationsWidgetController.prototype.onElementRename = function(acElem, label, callbackOk, callbackError)
{
	callbackError();
}


/*  ---------------------------------------------------------------- 
	ac.IOperationsWidget
	
	Widget interface supporting elements operations (filter/rename/move/copy/duplicate) within widget.

*/

$class('ac.IOperationsWidget');


$class('ac.IOperationsWidget < ac.IEditableWidget',
{
	construct:function()
	{
	    this.properties = 
		{
	    	selectionPath:[]
		};
	}
});

ac.IOperationsWidget.prototype.isRootElementSelectable = function()
{
	return false;
}

ac.IOperationsWidget.prototype.isSelectionCollapsedAfterDehighlighting = function()
{
	return true;
}

ac.IOperationsWidget.prototype.changeSelection = function(acElemLst, removePrevious)
{
	removePrevious = removePrevious || !this.controller.allowMultipleSelection();
	this.highliteSelection(true);
	this.addSelection(acElemLst, removePrevious);		
	this.highliteSelection(false, true);
}

ac.IOperationsWidget.prototype.highliteSelection = function(hidePrevious, showActual)
{
	var has_root_rendered = this.isRootElementSelectable()
	var is_selection_collapsed = this.isSelectionCollapsedAfterDehighlighting();
	var caller = this;
	if ( hidePrevious )
	{
		// remove all higlighting
		$foreach ( this.getSelection(), function(acElem)
		{
			// removing selection down to root
			while ( null != acElem && (has_root_rendered || caller.model.rootElement != acElem ) )
			{
				if ( is_selection_collapsed )
				{
					acElem.setStateCollapsed();
				}
				var node = caller.getElementNode(acElem);
				if ( null != node )
				{
					caller.highliteElementNode(acElem, node, true);
				}
				if ( has_root_rendered && caller.model.rootElement == acElem )
				{
					break;
				}
				acElem = acElem.parentElement;
			}
		});		
	}
	if ( showActual )
	{
		// add highlighting
		$foreach ( this.getSelection(), function(acElem)
		{
			var node = caller.getElementNode(acElem);
			if ( null != node )
			{
				caller.highliteElementNode(acElem, node, 'active');
			}
			caller.postHighliteSelection(acElem);
		});		
	}
}

ac.IOperationsWidget.prototype.postHighliteSelection = function(acElem)
{
}

ac.IOperationsWidget.prototype.highliteElementNode = function(acElem, node, hiOff)
{
	if ( null == node )
	{
		return;
	}
	var mode = $isset(hiOff) ? ('string' == typeof hiOff ? hiOff : 'inactive' ) : 'active';
	if ( mode == node.ga('himode') )
	{
		// already highlighted
		return;
	}
	this.view.renderElementSelection(acElem, node, mode);
	node.sa('himode', mode);
}

ac.IOperationsWidget.prototype.onFocus = function()
{
	var caller = this;
	$foreach (this.getSelection(), function(acElem)
	{
		caller.highliteElementNode(acElem, caller.getElementNode(acElem));		
	});
}

ac.IOperationsWidget.prototype.onBlur = function()
{
	var caller = this;
	$foreach (this.getSelection(), function(acElem)
	{
		caller.highliteElementNode(acElem, caller.getElementNode(acElem), 'midactive');
	});
}

ac.IOperationsWidget.prototype.copySelectionToClipboard = function(isCopy)
{
	this.copyElementsToClipboard(this.getSelection(), isCopy);
}

ac.IOperationsWidget.prototype.copyElementsToClipboard = function(elements, isCopy)
{
	if  ( 0 == elements.length )
	{
		return;
	}
	var dup_elements = [];
	var caller = this;
	if ( isCopy )
	{
		// we must duplicate selection
		$foreach ( elements, function(acElem)
		{
			dup_elements.push(acElem.cloneElement(true));
		});
	}
//	ac.widget.putClipboard(isCopy?dup_elements:elements, isCopy?null:caller);		
	this.controller.onElementClipboardCopy(isCopy?dup_elements:elements, isCopy, function()
	{
		// registering onCutWidget for cut operation
		ac.widget.putClipboard(isCopy?dup_elements:elements, isCopy?null:caller);
	});		
}

ac.IOperationsWidget.prototype.onCut = function(selection, callbackOk)
{
	var caller = this;
	this.controller.onElementClipboardCut(selection, function()
	{
		// CUT successful
		callbackOk();
	})
}

ac.IOperationsWidget.prototype.onPaste = function(selection, wasCut)
{
	var parentElement = this.getLastSelection();
	if ( null == parentElement )
	{
		parentElement = this.model.rootElement;
	}
	if ( !parentElement.isCollection )
	{
		parentElement = parentElement.parentElement;
	}
	var caller = this;
	var adj_selection = [];
	// adjusting selection for cut operation - cannot move to itself etc., copy - check for duplicates
	for ( var i in selection )
	{
		var add = true;
		if ( wasCut )
		{
			if ( selection[i].parentElement == parentElement )
			{
				add = false;
			}
			else
			{
				var elem = parentElement;
				while ( null != elem )
				{
					if ( elem == selection[i] )
					{
						add = false;
						break;
					}
					elem = elem.parentElement;
				}				
			}
		}
		else
		{
			// checking whether need to create duplicate
			var check = function(label)
			{
				for ( var ii=0; ii<parentElement.elements.length; ii++ )
				{
					if ( label == caller.controller.onGetElementValueForEditing(parentElement.elements[ii], '') )
					{
						return true;
					}
				}
				return false;
			}
			var c_iter = 1;
			var old_label = this.controller.onGetElementValueForEditing(selection[i], '');
			while ( false != check(this.controller.onGetElementValueForEditing(selection[i], '')) && 500 > c_iter )
			{
				this.controller.onElementDuplicate(selection[i], old_label, parentElement, c_iter);
				c_iter++;
			}
		}
		if ( add )
		{
			adj_selection.push(selection[i]);
		}
	}
	if ( 0 == adj_selection.length )
	{
		return;
	}
	this.controller.onElementMoveCopy(adj_selection, parentElement, wasCut, function()
	{
		// returned on success
		caller.removeSelection();
		$foreach ( adj_selection, function(acElem)
		{
			try
			{
				caller.addSelection(parentElement.appendChild(acElem));				
			}
			catch (e)
			{
			}
		});
		caller.showFrom(parentElement);
		// redraw highlighting
		caller.highliteSelection(true,true);
		// setting new clipboard
		caller.copySelectionToClipboard(!wasCut, true);
	});
}



/*  ---------------------------------------------------------------- 
	ac.HierarchicalWidgetController < ac.WidgetController, ac.IOperationsWidgetController
	
	Controller for hierarchical widgets (those working with tree of elements). Includes elements operations and editing capabilities.
*/
$class('ac.HierarchicalWidgetController < ac.WidgetController, ac.IOperationsWidgetController');

ac.HierarchicalWidgetController.prototype.onElementClick = function(acElem, evt)
{
}

ac.HierarchicalWidgetController.prototype.onElementDblClick = function(acElem, evt)
{
}


/*  ---------------------------------------------------------------- 
	ac.HierarchicalDnDAdapter < fry.ui.DragAdapter, fry.ui.DropAdapter
	
	Serves as DnD adapter allowing operations among widget elements.
*/
$class('ac.HierarchicalDnDAdapter < fry.ui.DragAdapter, fry.ui.DropAdapter',
{
	construct:function(node, widget, acElem)
	{
	    this.widget = widget;
		this.acElem = acElem;
		this.expandCommandRunning = false;
		this.cannotAppendNew = false;
		this.data = null;
	}
});

ac.HierarchicalDnDAdapter.prototype.onGetCursorNode = function()
{
	this.data = {widget:this.widget, nodes:[], elements:[]};
	var selection = this.widget.getSelection();
	var cursor_nodes = [];
	var caller = this;
	var selected_cursor_node = null;
	if ( 0 < selection.length )
	{
		$foreach ( selection, function(elem)
		{
			if ( elem == elem.rootElement && !caller.widget.isRootElementSelectable() )
			{
				return;
			}
			var node = caller.getElementNode(elem);
			cursor_nodes[cursor_nodes.length] = node;
			caller.data.elements[caller.data.elements.length] = elem;
			if ( elem == caller.acElem )
			{
				selected_cursor_node = node;
			}
		});
	}
	var cursor_node = $$().n(this.getCursorCssClassName());
	if ( null != selected_cursor_node && 1 < cursor_nodes.length )
	{
		// user is dragging selection consisting of more than one elements - the cursor will be combined
		var sel_pos = selected_cursor_node.abspos();
		for ( var i=0; i<cursor_nodes.length; i++ )
		{
			var node = cursor_nodes[i];
			var pos = node.abspos();
			var part_node = cursor_node.a($$()).pos(true).x(pos.x-sel_pos.x).y(pos.y-sel_pos.y);
			caller.createCursorNode(part_node, node, caller.data.elements[i], false);
		}
		this.data.nodes = cursor_nodes;
		return cursor_node;
	}
	else
	{
		this.data = {widget:this.widget, nodes:[this.getElementNode(this.acElem)], elements:[this.acElem]};
//		var cursor_node = $$().n(this.getCursorCssClassName());
		this.createCursorNode(cursor_node, this.data.nodes[0], this.acElem, true);
	}
	return cursor_node;
}

ac.HierarchicalDnDAdapter.prototype.getCursorCssClassName = function()
{
	return 'acw-generic-dnd-cursor';
}

ac.HierarchicalDnDAdapter.prototype.getElementNode = function(acElem)
{
	return this.widget.getElementNode(acElem);
}

ac.HierarchicalDnDAdapter.prototype.getHighlightingNode = function(node)
{
	return node;
}

ac.HierarchicalDnDAdapter.prototype.createCursorNode = function(cursorNode, node, acElem, isSingleSection)
{
	cursorNode.w(node.w()).t(node.t());
}

ac.HierarchicalDnDAdapter.prototype.expandElement = function(acElem)
{
	this.widget.showFrom(acElem);
	this.widget.changeSelection(acElem, true);
	fry.ui.dnd.cleanTargetsCache();
}

ac.HierarchicalDnDAdapter.prototype.onGetCursorPadding = function()
{
	return [0, 0, 0, 0];
}

ac.HierarchicalDnDAdapter.prototype.onDragEnter = function(firstEnter, offsetX, offsetY, sourceNode, sourceAdapter)
{
	if ( this.acElem.isCollection && firstEnter)
	{
		var orig_mode = this.getHighlightingNode(this.node).ga('himode');
		if ( null == orig_mode )
		{
			orig_mode = 'inactive';
		}
		this.widget.setElementWidgetProperty(this.acElem, 'dnd-orig-mode', orig_mode);
		this.widget.highliteElementNode(this.acElem, this.getHighlightingNode(this.node), 'drop-over');
		this.widget.properties.lastDropOverTarget = this;
		if ( this.expandCommandRunning || this.acElem.hasState(this.acElem.STATE_EXPANDED) )
		{
			return;
		}
		var caller = this;
		this.expandCommandRunning = true;
		this.cannotAppendNew = false;
		$runafter(1000, function()
		{
			this.cannotAppendNew = true;
			if ( caller == caller.widget.properties.lastDropOverTarget )
			{
				$runinterval(0,6,100,function(step)
				{
					if ( caller != caller.widget.properties.lastDropOverTarget )
					{
						return;
					}
					caller.widget.highliteElementNode(caller.acElem, caller.getHighlightingNode(caller.node), 1==step%2 ? 'drop-over':'inactive');
					if ( 6 == step )
					{
						caller.expandCommandRunning = true;
						caller.expandElement(caller.acElem);
						caller.cannotAppendNew = false;
					}
				});
			}
		})
	}
}

ac.HierarchicalDnDAdapter.prototype.onDragLeave = function(lastLeave)
{
	if ( this.acElem.isCollection )
	{
		this.widget.properties.lastDropOverTarget = null;
		this.expandCommandRunning = false;
		this.widget.highliteElementNode(this.acElem, this.getHighlightingNode(this.node), this.widget.getElementWidgetProperty(this.acElem, 'dnd-orig-mode', ''));
	}
}

ac.HierarchicalDnDAdapter.prototype.onPutData = function(data, sourceNode, sourceAdapter, offsetX, offsetY, controlKeyPressed)
{
	if ( this.cannotAppendNew )
	{
		return;
	}
	var acElem = this.acElem.isCollection ? this.acElem : this.acElem.parentElement;
	if ( acElem.hasState(acElem.STATE_WILL_LOAD) || acElem.hasState(acElem.STATE_LOADING) )
	{
		// cannot perform operation until loading of target element contents is finished
		return;
	}
	this.widget.copyElementsToClipboard(data.elements, controlKeyPressed);
	this.widget.changeSelection(acElem, true);
	ac.widget.pasteClipboard(this.widget);
/*
	TODO: eventually add some animation code, nodes are stored in data.nodes
	
	var trg_node = this.widget.getElementNode(this.acElem).g('td:1');
	var trg_pos = trg_node.abspos();
	$dotimes( data.nodes.length, function(i)
	{
		var src_node = data.nodes[i];
		var src_pos = src_node.abspos();
		var anim_node = $().a($$()).w(src_node.w()).pos(true).x(src_pos.x).y(src_pos.y).t(src_node.t()).s('background:white;border:1px solid black;padding:2px').z('99999');
		var num_steps = 10;
		var dx = Math.floor(trg_pos.x-src_pos.x)/num_steps;
		var dy = Math.floor(trg_pos.y-src_pos.y)/num_steps;
		$runinterval(1,num_steps,100,function(step)
		{
			anim_node.x(src_pos.x+dx*step).y(src_pos.y+dy*step);
			if ( num_steps == step )
			{
				$runafter(50, function(){anim_node.rs();});
			}
		});			
	});
//		alert('paste:'+data.id);
*/	
}

ac.HierarchicalDnDAdapter.prototype.onGetData = function()
{
	return this.data;
}


/*  ---------------------------------------------------------------- 
	ac.HierarchicalWidget < ac.Widget, ac.IOperationsWidget
*/
$class('ac.HierarchicalWidget < ac.Widget, ac.IOperationsWidget');


/*  ---------------------------------------------------------------- 
	ac.ListWidgetModel < ac.WidgetModel
*/
$class('ac.ListWidgetModel < ac.WidgetModel',
{
	construct:function(items)
	{
		this.items = [];
		this.isLoaded = false;
		var caller = this;
		if ( items )
		{
			$foreach ( items, function(item, i)
			{
				caller.addItem(item, i);
			});
			caller.isLoaded = true;
		}
	},
	destruct:function()
	{
		$foreach ( this.items, function(item)
		{
			$delete(item);
		});
	}
});

ac.ListWidgetModel.prototype.addItem = function(item, index)
{
	var n = this.items.length;
	if ( 'undefined' == index || 'undefined' == typeof this.items[index] )
	{
		index = n;
	}
	else
	{
		for ( var i=n; i>index; i-- )
		{
			this.items[i] = this.items[i-1];
			this.items[i].index = i;
		}
	}
	if ( 'object' != typeof item )
	{
		throw new FryException(500, 'fry.ui: ListWidgetModel, invalid item #? specified. Needs object structure.'.embed(index));
	}
	item.index = index;
	this.items[index] = item;
	return index;
}

ac.ListWidgetModel.prototype.removeItem = function(index)
{
	var num_items = this.items.length;
	for ( var i=index; i<num_items-1; i++ )
	{
		this.items[i] = this.items[i+1];
		this.items[i].index = i;
	}
	$delete(this.items[num_items-1]);
	this.items.length = num_items-1;
}

ac.ListWidgetModel.prototype.getElementById = function(id)
{
	var n = this.items.length;
	for ( var i=0; i<n; i++ )
	{
		if ( this.items[i] && this.items[i].id == id)
		{
			return this.items[i];
		}
	}
	return null;
}


/*  ---------------------------------------------------------------- 
	ac.ListWidget < ac.Widget, ac.IOperationsWidget
*/
$class('ac.ListWidget < ac.Widget, ac.IOperationsWidget');


/*  ---------------------------------------------------------------- 
	ac.ContainerWidgetModel < ac.WidgetModel
*/
$class('ac.ContainerWidgetModel < ac.WidgetModel',
{
	construct:function(panes)
	{
		this.panes = [];
		var caller = this;
		$foreach ( panes, function(pane, i)
		{
			caller.addPane(pane, i);
		});
	},
	destruct:function()
	{
		$foreach( this.panes, function(pane)
		{
			$delete(pane);
		});
	}
});

ac.ContainerWidgetModel.prototype.addPane = function(pane, index)
{
	var n = this.panes.length;
	if ( 'undefined' == index || 'undefined' == typeof this.panes[index] )
	{
		index = n;
	}
	else
	{
		for ( var i=n; i>index; i-- )
		{
			this.panes[i] = this.panes[i-1];
			this.panes[i].index = i;
		}
	}
	if ( 'string' == typeof pane )
	{
		pane = {label:pane};
	}
	if ( 'object' != typeof pane )
	{
		throw new FryException(400, 'fry.ui: ContainerWidgetModel, invalid pane item #? specified. Needs {label:, adapter:} structure.'.embed(index));
	}
	if ( !pane.label )
	{
		pane.label = 'Unknown';
	}
	if ( !pane.adapter )
	{
		pane.adapter = {};
	}
	// checking adapter methods
	pane = this.checkPaneAdapter(pane);
	pane.model = this;
	pane.isOpen = false;
	pane.index = index;
	this.panes[index] = pane;
	return index;
}

ac.ContainerWidgetModel.prototype.removePane = function(index)
{
	var num_panes = this.panes.length;
	for ( var i=index; i<num_panes-1; i++ )
	{
		this.panes[i] = this.panes[i+1];
		this.panes[i].index = i;
	}
	delete this.panes[num_panes-1];
	this.panes.length = num_panes-1;
}

ac.ContainerWidgetModel.prototype.checkPaneAdapter = function(pane)
{
	return pane;
}

/*  ---------------------------------------------------------------- 
	ac.ContainerWidgetController < ac.WidgetController
*/
$class('ac.ContainerWidgetController < ac.WidgetController');


ac.ContainerWidgetController.prototype.onOpen = function(pane, index, node)
{
	node.t('Unknown content for pane #?.'.embed(index));
}

ac.ContainerWidgetController.prototype.onClose = function(pane, index)
{
	return true;
}

ac.ContainerWidgetController.prototype.onShow = function(pane, index, fromIndex)
{
	return true;
}

ac.ContainerWidgetController.prototype.onHide = function(pane, index)
{
}

ac.ContainerWidgetController.prototype.isContentScrollable = function(pane, index)
{
	return true;
}

/*  ---------------------------------------------------------------- 
	ac.ContainerWidgetView < ac.WidgetView
*/
$class('ac.ContainerWidgetView < ac.WidgetView');

ac.ContainerWidgetView.prototype.renderEmptyPane = function(node)
{
	node.t('');
}

/*  ---------------------------------------------------------------- 
	ac.ContainerWidget < ac.Widget
*/
$class('ac.ContainerWidget < ac.Widget',
{
	construct:function()
	{
		this.activePaneIndex = -1;
	}
});

ac.ContainerWidget.prototype.getActivePane = function()
{
	return this.model.panes[this.activePaneIndex] || null;
}

ac.ContainerWidget.prototype.addPane = function(pane, afterIndex)
{
	if ( 'undefined' == typeof afterIndex )
	{
		afterIndex = 0 <= this.activePaneIndex ? this.activePaneIndex+1 : 0;
	}
	var content_panes = this.renderingNode.fc();	
	if ( 0 == this.model.panes.length )
	{
		// removing empty node
		content_panes.t('');
	}
	var index = this.model.addPane(pane, afterIndex);
	// creating stub content node
	if ( index == this.model.panes.length-1 )
	{
		// last tab
		content_panes.a($$()).n('content').h(content_panes.h()).w(content_panes.w()).pos(true).d(false);
	}
	else
	{
		// inserting before
		content_panes.ib($$(), content_panes.$.childNodes.item(index)).n('content').h(content_panes.h()).w(content_panes.w()).pos(true).d(false);
	}
	this.renderPane(index);
	this.activePaneIndex = index;
	this.renderAfterAddPane();
}

ac.ContainerWidget.prototype.closePane = function(index)
{
	if ( 'undefined' == typeof index )
	{
		index = this.activePaneIndex;
	}
	var num_panes = this.model.panes.length;
	var pane = this.model.panes[index];
	if ( !pane.adapter.onClose(pane, index) )
	{
		return;
	}
	var content_panes = this.renderingNode.fc();
	// removing content node
	$(content_panes.$.childNodes.item(index)).rs();
	this.model.removePane(index);
	if ( this.activePaneIndex == index )
	{
		if ( num_panes-1 == index )
		{
			this.activePaneIndex--;
		}
		if ( 0 <= this.activePaneIndex )
		{
			this.renderPane(this.activePaneIndex);
		}
		else
		{
			// rendering empty node
			this.renderWhenEmpty();
			this.view.renderEmptyPane(content_panes.a($$()));
		}
	}
	else if ( this.activePaneIndex > index )
	{
		this.activePaneIndex--;
	}
	this.renderAfterClosePane();
}

ac.ContainerWidget.prototype.switchPane = function(index)
{
	if ( !this.model.panes[index] )
	{
		return;
	}
	if ( this.activePaneIndex == index )
	{
		return;
	}
	this.renderPane(index);
	this.activePaneIndex = index;
	this.renderAfterSwitchPane();
}

ac.ContainerWidget.prototype.hasPane = function(label)
{
	for ( var i in this.model.panes )
	{
		if ( this.model.panes[i].label == pane )
		{
			return true;
		}
	}
	return false;
}

ac.ContainerWidget.prototype.resizeContents = function(offsetY, offsetHeight)
{
	var y = this.renderingNode.fc().y()+offsetY;
	var h = this.renderingNode.fc().h()+offsetHeight;
	this.renderingNode.fc().y(y).h(h);
	$foreach ( this.renderingNode.fc().$.childNodes, function(node)
	{
		$(node).h(h);
	});
}

ac.ContainerWidget.prototype.render = function()
{
	var caller = this;
	this.renderingNode = this.containerNode.a($$()).n('acw-container ?'.embed(this.cssClassName)).pos(true).w(this.containerNode.w()).h(this.containerNode.h());
	var has_panes = 0 != this.model.panes.length;
	if ( has_panes )
	{
		this.activePaneIndex = 0;
	}
	// creating content panes container
	var content_panes = this.renderingNode.a($$()).n('contents').pos(true).x(0).y(0).h(this.renderingNode.h()-2).w(this.renderingNode.w()-2);
	if ( !has_panes )
	{
		this.renderAdditional();
		this.view.renderEmptyPane(content_panes.a($$()));
		return;
	}

	// creating content stubs
	$foreach ( this.model.panes, function(pane)
	{
		content_panes.a($$()).n('content').h(content_panes.h()).w(content_panes.w()).pos(true).d(false);
	});
	// rendering additional stuff - usually used in inherited widgets
	this.renderAdditional();
	// rendering active pane content
	this.renderPane();
}

ac.ContainerWidget.prototype.renderAdditional = function()
{
}

ac.ContainerWidget.prototype.renderWhenEmpty = function()
{	
}

ac.ContainerWidget.prototype.renderAfterAddPane = function()
{
}

ac.ContainerWidget.prototype.renderAfterClosePane = function()
{
}

ac.ContainerWidget.prototype.renderAfterSwitchPane = function()
{
}

ac.ContainerWidget.prototype.renderPane = function(index)
{
	if ( 'undefined' == typeof index )
	{
		index = this.activePaneIndex;		
	}
	var pane = this.model.panes[index];
	if ( pane.isOpen && pane.adapter.onShow )
	{
		if ( !pane.adapter.onShow(pane, index, this.activePaneIndex) )
		{
			return;
		}
	}
	var content_panes = this.renderingNode.fc();
	if ( null == content_panes.$.childNodes.item(index) )
	{
		return;
	}
	
	var inner = null;
	if ( !pane.isOpen )
	{
		// first show
		var is_scrollable = pane.adapter.isContentScrollable && pane.adapter.isContentScrollable(pane, index);
		inner = $(content_panes.$.childNodes.item(index)).d(true).a($$()).n('inner-content').s('overflow:?'.embed(is_scrollable?'auto':'hidden'));
		pane.widget = this;
		pane.adapter.onOpen(pane, index, inner);
		pane.isOpen = true;
	}
	else
	{
		inner = $(content_panes.$.childNodes.item(index)).d(true).x(0).y(0).fc();
	}
	if ( index != this.activePaneIndex && 0 <= this.activePaneIndex )
	{
		// hiding previous content
		$(content_panes.$.childNodes.item(this.activePaneIndex)).d(false).x(10000).y(10000);
		pane = this.model.panes[this.activePaneIndex];
		if ( pane.adapter.onHide )
		{
			pane.adapter.onHide(pane, this.activePaneIndex);
		}
	}	
	/*
	var inner = null;
	if ( !pane.isOpen )
	{
		// first show
		var is_scrollable = pane.adapter.isContentScrollable && pane.adapter.isContentScrollable(pane, index);
		
		inner = this.contentNodes[index].d(true).a($$()).n('inner-content').s('overflow:?'.embed(is_scrollable?'auto':'hidden'));
		
		pane.widget = this;
		pane.adapter.onOpen(pane, index, inner);
		pane.isOpen = true;
	}
	else
	{
		inner = this.contentNodes[index].d(true).fc();
	}
	if ( index != this.activePaneIndex && 0 <= this.activePaneIndex )
	{
		// hiding previous content
		this.contentNodes[this.activePaneIndex].d(false);
		pane = this.model.panes[this.activePaneIndex];
		if ( pane.adapter.onHide )
		{
			pane.adapter.onHide(pane, this.activePaneIndex);
		}
	}
	*/
	this.activePaneIndex = index;
}



/*  ---------------------------------------------------------------- 
	ac.ValueEditor
	
	Base class for value editors - used in IEditableWidgetController interface methods.
*/
$class('ac.ValueEditor',
{
	construct:function()
	{
		this.node = null;
	},
	destruct:function()
	{
		if ( null != this.node )
		{
			this.node.rs();
		}
	}
});

ac.ValueEditor.prototype.setOwnerWidget = function(widget)
{
	this.ownerWidget = widget;
}

ac.ValueEditor.prototype.render = function(node, width, value)
{
	node.t(this.ownerWidget.valueEditGet());
}

ac.ValueEditor.prototype.getValue = function()
{
	return '';
}

ac.ValueEditor.prototype.commit = function()
{
	this.ownerWidget.valueEditCommited();
}

ac.ValueEditor.prototype.rollback = function()
{
	this.ownerWidget.valueEditCanceled();
}

/*  ---------------------------------------------------------------- 
	ac.ValueEditorText
	
	Basic one-line text editor. Typically used for renaming of elements and such.
	
*/
$class('ac.ValueEditorText < ac.ValueEditor');

ac.ValueEditorText.prototype.render = function(node, width, value)
{
	node.t('<input type="text" value="?" />'.embed(value));
	var input = node.fc().w(width);
	var caller = this;
	input.e('keypress', function(evt)
	{
		evt.stop();
		if ( evt.KEY_ESCAPE == evt.keyCode )
		{
			caller.rollback();
		}
		else if ( evt.KEY_ENTER == evt.keyCode )
		{
			input.sa('norollback', 1);
			caller.commit();
		}
	});
	// supressing other events
	input.es('keydown');
	input.es('keyup');
	input.es('mousedown');
	input.es('mouseup');
	input.es('click');
	input.es('dblclick');
	input.es('mousemove');
	input.$.select();
	input.$.focus();
	input.e('blur', function(evt)
	{
		if ( null != input && input.is() && null == input.ga('norollback') )
		{
			caller.rollback();
		}
	});
	this.node = input;
}

ac.ValueEditorText.prototype.getValue = function()
{
	if ( null == this.node || !this.node.is() )
	{
		return null;
	}
	return this.node.$.value;
}

// -----------------------------------------------------------------
// creating default theme configuration
fry.ui.theme = 
{
	name:'apple',
	conf:
	{
		selection:
		{
			active:
			{
				color:'#fff',
				backgroundColor:'#aaa'
			},
			midactive:
			{
				color:'#000',
				backgroundColor:'#ddd'
			},
			inactive:
			{
				color:'#000',
				backgroundColor:'#fff'
			}
		}
	}
};

if ( !fry.__production_mode )
{
	ac.init();	
}


/*--------*/

if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}