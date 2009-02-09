/*
 * AC Fry - JavaScript Framework v1.0
 *
 * UI core support extension
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 */

/*--------*/

if ( 'undefined' != typeof ACNode )
{
	/*  ---------------------------------------------------------------- 
		fry.ui namespace
	*/
	fry.ui = 
	{
		info:
		{
			// returns page scroll position
			page:
			{
				scroll:
				{
					left:0,
					top:0
				},
				width:0,
				height:0
			},
			isIE:$__tune.isIE,
			isSafari:$__tune.isSafari,
			isGecko:$__tune.isGecko
		},	
		util:
		{
			getMillis:function()
			{
				var d = new Date();
				return 60000*d.getMinutes()+1000*d.getSeconds()+d.getMilliseconds();
			}
		},
		format:
		{
			formatDateTime:function( timestamp, langCode )
			{
				var ret = '--';
				try
				{
					var s = parseInt( timestamp );
					var d = new Date( s*1000 );
					var m = d.getMinutes();
					var time_p = ' '+d.getHours()+':'+(10>m?'0':'')+m;
					switch ( langCode )
					{
						case 'cs':
						{
							ret = d.getDate()+'.'+(d.getMonth()+1)+' '+d.getFullYear()+time_p
						}; break;
						default:
						{
							ret = (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear()+time_p
						}
					}
				}
				catch (e)
				{
				}
				return ret;
			}			
		},
		drag:
		{
			MODE_STANDARD:0,
			MODE_HORIZONTAL:1,
			MODE_VERTICAL:2,
			
			state:{started:false, x:0, y:0, ix:0, iy:0, clickInterval:300, mdownMillis:0, usingCursor:false}
		},
		dnd:
		{
			MODE_DRAG:1,
			MODE_DROP:2,
			MODE_BOTH:3,
			MODE_DRAG_POINTER:17,	// pointer mode - will select target under mouse cursor, not using cursor node vs target node intersection
			MODE_BOTH_POINTER:19,

			state:{started:false, x:0, y:0, ix:0, iy:0, offsetX:0, offsetY:0, lastCheck:0, lastCheckInterval:100, mdownMillis:0, clickInterval:300},
			targets: []
		}
	}
	
	
	$class('fry.ui.DragAdapter',
	{
		construct:function(node)
		{
			this.node = 'undefined' == typeof node ? null : $(node);
		}
	});
	
	$class('fry.ui.DropAdapter',
	{
		construct:function(node)
		{
			this.node = 'undefined' == typeof node ? null : $(node);
		}
	});

	/* Extending ACNode capabilities to support drag and DnD (drag and drop) */
	/* Adapter API:
		drag/DnD.drag:
			node onGetRenderingNode()
			bool onDragStart(evt) - if true is returned and using cursor node, original node is not hidden
			{x:, y:} | null onDragMove(dragNode, nx, ny, offsetX, offsetY)
			[boolean] onDragStop()	- if true is returned, original node is left intact (it has no coordinates set after drag node)
			var onGetData()
			void onClick(evt)
			node onGetCursorNode(pageX, pageY, offsetX, offsetY)
			[top, right, bottom, left] onGetCursorPadding() - applies for DnD.drag only
			
		DnD.drop:
			node onGetRenderingNode()
			{x:, y:, w:, h:} onGetCoords()
			void onDragEnter(firstEnter, offsetX, offsetY, sourceNode, sourceAdapter, allTargets, targetIndex)
			void onDragLeave(lastLeave)
			void onPutData(data, sourceNode, sourceAdapter, offsetX, offsetY, controlKeyPressed, allTargets, targetIndex)
		
	*/
	/*  ---------------------------------------------------------------- 
		fry.ui.DragAdapter
	*/	
	fry.ui.DragAdapter.prototype.onGetRenderingNode = function()
	{
		return this.node;
	}
	fry.ui.DragAdapter.prototype.onDragStart = function(evt)
	{
	}
	fry.ui.DragAdapter.prototype.onDragMove = function(dragNode, nx, ny, offsetX, offsetY)
	{
		return null;
	}
	fry.ui.DragAdapter.prototype.onDragStop = function()
	{
	}
	fry.ui.DragAdapter.prototype.onGetData = function()
	{
		return null;
	}
	fry.ui.DragAdapter.prototype.onClick = function(evt)
	{
	}
	fry.ui.DragAdapter.prototype.onGetCursorNode = function()
	{
		return null;
	}
	fry.ui.DragAdapter.prototype.onGetCursorPadding = function()
	{
		return [0,0,0,0];
	}
	/*  ---------------------------------------------------------------- 
		fry.ui.DropAdapter
	*/		
	fry.ui.DropAdapter.prototype.onGetRenderingNode = function()
	{
		return this.node;
	}
	fry.ui.DropAdapter.prototype.onGetCoords = function()
	{
		var pos = this.node.abspos();
		return {x:pos.x, y:pos.y, w:this.node.w(), h:this.node.h()};
	}
	fry.ui.DropAdapter.prototype.onDragEnter = function(firstEnter, offsetX, offsetY, sourceNode, sourceAdapter, allTargets, targetIndex)
	{
	}
	fry.ui.DropAdapter.prototype.onDragLeave = function(lastLeave)
	{
	}
	fry.ui.DropAdapter.prototype.onPutData = function(data, sourceNode, sourceAdapter, offsetX, offsetY, controlKeyPressed, allTargets, targetIndex)
	{
	}	
	/*  ---------------------------------------------------------------- 
		Drag
	*/

	fry.ui.drag.start = function(mode, adapter, pageX, pageY)
	{
		$__tune.behavior.clearSelection();
		fry.ui.drag.node = adapter.node;
		fry.ui.drag.adapter = adapter;
		fry.ui.drag.mode = mode;
//		console.log('*DRAG* started.');
		with ( fry.ui.drag.state )
		{
			started = true;
			x = ix = pageX;
			y = iy = pageY;
			mdownMillis = fry.ui.util.getMillis();
		}
		fry.ui.drag.dragNode = null;
	}
	
	fry.ui.drag.move = function(evt)
	{
		$__tune.behavior.clearSelection();
		var state = fry.ui.drag.state;
		var millisOffset = fry.ui.util.getMillis() - state.mdownMillis;
		evt = $__tune.event.get(evt||self.event);
		if ( state.clickInterval > millisOffset && state.ix == evt.pageX && state.iy == evt.pageY )
		{
			// dragging not started yet
			evt.stop();
			evt = null;
//			console.log('*DRAG* not started yet');
			return;
		}
		if ( null == fry.ui.drag.dragNode )
		{
			// initializing cursor/drag node
			var not_hide = fry.ui.drag.adapter.onDragStart(evt);
			if ( fry.ui.drag.adapter.onGetCursorNode )
			{
				fry.ui.drag.dragNode = fry.ui.drag.adapter.onGetCursorNode(evt.pageX, evt.pageY, evt.getOffsetX(), evt.getOffsetY());
			}
			if ( null == fry.ui.drag.dragNode )
			{
				fry.ui.drag.dragNode = fry.ui.drag.node;
			}
			else
			{
				state.usingCursor = true;
				var pos = $(fry.ui.drag.node).abspos();
				fry.ui.drag.dragNode = $().a(fry.ui.drag.dragNode).pos(true).x(pos.x).y(pos.y);
				if ( !not_hide )
				{
					fry.ui.drag.node.v(false);					
				}
			}
			fry.ui.drag.dragNode.z(99999);
		}
		with ( state )
		{
			var ox = evt.pageX - x;
			var oy = evt.pageY - y;
			x = evt.pageX;
			y = evt.pageY;
			var nx = fry.ui.drag.dragNode.x() + ox;
			var ny = fry.ui.drag.dragNode.y() + oy;
			var coords = fry.ui.drag.adapter.onDragMove(fry.ui.drag.node, nx, ny, ox, oy);
			if ( null != coords )
			{
				if ( !isNaN(coords.x) )
				{
					nx = coords.x;
				}
				if ( !isNaN(coords.y) )
				{
					ny = coords.y;
				}
			}
			if ( fry.ui.drag.MODE_VERTICAL != (fry.ui.drag.MODE_VERTICAL & fry.ui.drag.mode) )
			{
				fry.ui.drag.dragNode.x(nx);
			}
			if ( fry.ui.drag.MODE_HORIZONTAL != (fry.ui.drag.MODE_HORIZONTAL & fry.ui.drag.mode) )
			{
				fry.ui.drag.dragNode.y(ny);
			}
		}
		evt.stop();
		evt = null;		
	}	
	fry.ui.drag.stop = function()
	{
//		console.log('*M* up');
		var state = fry.ui.drag.state;
		$__tune.behavior.clearSelection();
		state.started = false;
		var leave_node = fry.ui.drag.adapter.onDragStop();
		if ( state.usingCursor )
		{
			if ( null != fry.ui.drag.dragNode )
			{
				if ( !leave_node )
				{
					fry.ui.drag.node.x(fry.ui.drag.dragNode.x()).y(fry.ui.drag.dragNode.y());							
				}
				fry.ui.drag.dragNode.rs();
			}
			fry.ui.drag.node.v(true);
		}
		state.usingCursor = false;
		var millisOffset = fry.ui.util.getMillis() - state.mdownMillis;
		if ( state.clickInterval > millisOffset )
		{
			if ( fry.ui.drag.adapter.onClick )
			{
				fry.ui.drag.adapter.onClick();
			}
		}
		fry.ui.drag.node = null;
		fry.ui.drag.mode = null;
		fry.ui.drag.dragNode = null;
		fry.ui.drag.adapter = null;
	}
	

	ACNode.prototype.addDrag = function(mode, adapter)
	{
		if ( 2 > arguments.length )
		{
			throw new FryException(100, 'fry.ui: Drag adapter not specified.');
		}
		if ( 2 < arguments.length )
		{
			adapter = 
			{
				onGetRenderingNode:arguments[1],
				onDragStart:arguments[2],
				onDragMove:arguments[3],
				onDragStop:arguments[4],
				onClick:arguments[5],
				onGetCursorNode:arguments[6]
			};
		}
		// checking adapter
		if ( 'object' != typeof adapter )
		{
			throw new FryException(101, 'fry.ui: Drag adapter not an object.');
		}
		// optional methods
		$foreach ( ['onDragStart', 'onDragMove', 'onDragStop', 'onClick', 'onGetCursorNode'], function(method)
		{
			if ( !adapter[method] )
			{
				adapter[method] = function(){return null;};
			}				
		});
		adapter.node = adapter.onGetRenderingNode ? adapter.onGetRenderingNode() : this;
		if ( !adapter.node )
		{
			throw new FryException(102, 'fry.ui: Rendering node not specified.');			
		}
		this.e('mousedown', function(evt)
		{
			fry.ui.drag.start(mode, adapter, evt.pageX, evt.pageY);
			evt.stop();
			evt = null;
		});
		this.sa('frydrag', 1);
		return this;
	}
	ACNode.prototype.removeDrag = function()
	{
		this.e('mousedown');
		this.ra('frydrag');
		return this;
	}

	/*  ---------------------------------------------------------------- 
		DnD (Drag and Drop)
	*/
	
	// Helper method for clearing targets coordinates _during_ drag - there's an internal coordinates cache created right after new drag is started.
	// Sometimes it's necessary to clean it explicitly because position of elements change during drag. There's no need to call it if you 
	// have all drop targets sitting at their position during the drag (mouse) move! Typicall use is the OutlineView widget whose elements (drop targets)
	// may change position during "spring-loading".
	fry.ui.dnd.cleanTargetsCache = function()
	{
		for ( var i in fry.ui.dnd.targets )
		{
			var target = fry.ui.dnd.targets[i];
			if ( null != target.coordsCache )
			{
				target.coordsCache = null;
				if ( null == target.node || !target.node.is() )
				{
					target.adapter = null;
					target.node = null;
					target = null;
					delete fry.ui.dnd.targets[i];
				}				
			}
		}
	}
	
	fry.ui.dnd.start = function(mode, adapter, pageX, pageY, offsetX, offsetY, wasControlKey)
	{
		$__tune.behavior.clearSelection();
		fry.ui.dnd.node = adapter.node;
		fry.ui.dnd.adapter = adapter;
		fry.ui.dnd.mode = mode;		
		fry.ui.dnd.dragNode = null;
		fry.ui.dnd.wasControlKey = wasControlKey;
		
		fry.ui.dnd.state.started = true;
		fry.ui.dnd.state.x = fry.ui.dnd.state.ix = pageX;
		fry.ui.dnd.state.y = fry.ui.dnd.state.iy = pageY;
		fry.ui.dnd.state.offsetX = offsetX;
		fry.ui.dnd.state.offsetY = offsetY;
		fry.ui.dnd.state.mdownMillis = fry.ui.util.getMillis();
		fry.ui.dnd.state.checked = false;
		// cleaning targets caches
		for ( var i in fry.ui.dnd.targets )
		{
			var target = fry.ui.dnd.targets[i];
			target.coordsCache = null;
			target.isActive = false;
		}		
	}
	
	fry.ui.dnd.move = function(evt)
	{
		$__tune.behavior.clearSelection();
		var state = fry.ui.dnd.state;
		evt = $__tune.event.get(evt||self.event);
		if ( !state.started )
		{
			// false alarm, remove listener!
			evt.stop();
			evt = null;
			return;
		}
		var millisOffset = fry.ui.util.getMillis() - state.mdownMillis;
		if ( state.clickInterval > millisOffset && state.ix == evt.clientX && state.iy == evt.clientY )
		{
			// dragging not started yet
			evt.stop();
			evt = null;
			return;
		}
		if ( null == fry.ui.dnd.dragNode )
		{
			// initializing cursor/drag node
			fry.ui.dnd.adapter.onDragStart();
			if ( fry.ui.dnd.adapter.onGetCursorNode )
			{
				fry.ui.dnd.dragNode = fry.ui.dnd.adapter.onGetCursorNode(evt.pageX, evt.pageY, evt.getOffsetX(), evt.getOffsetY());
			}
			if ( null == fry.ui.dnd.dragNode )
			{
//				console.log('%d - %d', state.ix, state.offsetX);
				fry.ui.dnd.dragNode = $().a($(fry.ui.dnd.adapter.node).dup()).pos(true).x(state.ix-state.offsetX).y(state.iy-state.offsetY);
			}
			else
			{
				fry.ui.dnd.dragNode = $().a(fry.ui.dnd.dragNode);
				var pos = $(fry.ui.dnd.adapter.node).abspos();
//				console.log('%d - %d', evt.pageX, evt.pageY);
				fry.ui.dnd.dragNode.pos(true).x(evt.pageX-state.offsetX).y(evt.pageY-state.offsetY);
			}
			fry.ui.dnd.dragNode.z(99999);
		}
		fry.ui.dnd.pageX = evt.pageX;
		fry.ui.dnd.pageY = evt.pageY;
		fry.ui.dnd.controlKeyPressed = evt.isAnyControlKeyPressed();
		with ( state )
		{
			var ox = evt.pageX - x;
			var oy = evt.pageY - y;
			x = evt.pageX;
			y = evt.pageY;
			var nx = fry.ui.dnd.dragNode.x() + ox;
			var ny = fry.ui.dnd.dragNode.y() + oy;
			var coords = fry.ui.dnd.adapter.onDragMove(fry.ui.dnd.dragNode, nx, ny, ox, oy);
			if ( null != coords )
			{
				if ( coords.x )
				{
					nx = coords.x;
				}
				if ( coords.y )
				{
					ny = coords.y;
				}
			}
			fry.ui.dnd.dragNode.x(nx).y(ny);
			// checking for targets
			var millis = fry.ui.util.getMillis();
			if ( lastCheckInterval < millis - lastCheck || 0 > millis - lastCheck )
			{
				// time out, let's check targets
				lastCheck = millis;
				fry.ui.dnd.checkTargets(x, y);
			}						
		}
	}
	
	fry.ui.dnd.stop = function()
	{
		$__tune.behavior.clearSelection();
		var state = fry.ui.dnd.state;
		state.started = false;
		fry.ui.dnd.adapter.onDragStop(false);
		var millisOffset = fry.ui.util.getMillis() - state.mdownMillis;
		if ( state.clickInterval > millisOffset )
		{
			if ( fry.ui.dnd.adapter.onClick )
			{
				fry.ui.dnd.adapter.onClick();
			}
			if ( null != fry.ui.dnd.dragNode )
			{
				fry.ui.dnd.dragNode.rs();
				fry.ui.dnd.dragNode = null;				
			}
			fry.ui.dnd.node = null;
			fry.ui.dnd.adapter = null;
			return;
		}
		var active_targets = [];
		// not a click, checking for targets
		if ( fry.ui.dnd.MODE_DRAG_POINTER == (fry.ui.dnd.mode & fry.ui.dnd.MODE_DRAG_POINTER) )
		{
			active_targets = fry.ui.dnd.checkTargets(fry.ui.dnd.pageX, fry.ui.dnd.pageY);
		}
		else
		{
			active_targets = fry.ui.dnd.checkTargets(state.x, state.y);
		}
		for ( var index in active_targets )
		{
			var target = active_targets[index];
			target.t.adapter.onPutData(fry.ui.dnd.adapter.onGetData(), fry.ui.dnd.node, fry.ui.dnd.adapter, state.x-target.t.coordsCache.x, state.y-target.t.coordsCache.y, fry.ui.dnd.controlKeyPressed, active_targets, index);
			target.t.coordsCache = null;
			target.t.isActive = false;
			target.t.adapter.onDragLeave(true);
		}
		if ( null != fry.ui.dnd.dragNode )
		{
			fry.ui.dnd.dragNode.rs();			
		}
		fry.ui.dnd.dragNode = null;
		fry.ui.dnd.node = null;
		fry.ui.dnd.adapter = null;
	}
	
	fry.ui.dnd.checkTargets = function(x, y)
	{
		if ( !fry.ui.dnd.dragNode || !fry.ui.dnd.dragNode.is() )
		{
			return;
		}
		var points = [[x,y], [x+fry.ui.dnd.dragNode.w(),y], [x+fry.ui.dnd.dragNode.w(),y+fry.ui.dnd.dragNode.h()], [x, y+fry.ui.dnd.dragNode.h()]];
		if ( fry.ui.dnd.adapter.onGetCursorPadding )
		{
			var p = fry.ui.dnd.adapter.onGetCursorPadding();
			points[0][0] += p[3];
			points[0][1] += p[0];
			points[1][0] -= p[1];
			points[1][1] += p[0];
			points[2][0] -= p[1];
			points[2][1] -= p[2];
			points[3][0] += p[3];
			points[3][1] -= p[2];
		}
		var active_targets = [];
		var actual_node = fry.ui.dnd.node.$;
		for ( var i in fry.ui.dnd.targets )
		{
			var target = fry.ui.dnd.targets[i];
			if ( null == target.coordsCache )
			{
				var tc = target.adapter.onGetCoords();
				if ( fry.ui.dnd.MODE_DRAG_POINTER != (fry.ui.dnd.mode & fry.ui.dnd.MODE_DRAG_POINTER) )
				{
					tc.x += fry.ui.dnd.state.offsetX;
					tc.y += fry.ui.dnd.state.offsetY;							
				}
				target.coordsCache = tc;
			}
			var coords = target.coordsCache;
			if ( !coords )
			{
				fry.ui.dnd.targets[i].adapter = null;
				fry.ui.dnd.targets[i] = null;
				delete fry.ui.dnd.targets[i];
				continue;
			}
			//console.log('%', target.adapter)
			var node = $(target.adapter.onGetRenderingNode()).$;
			// GC check
			if ( !node || null == node.parentNode || null == target.adapter.node || !target.adapter.node.is() )
			{
				fry.ui.dnd.targets[i].adapter = null;
				fry.ui.dnd.targets[i].node = null;
				fry.ui.dnd.targets[i] = null;
				delete fry.ui.dnd.targets[i];
				continue;
			}
			else
			{
				var cn = node;
				while (null != cn.parentNode)
				{
					cn = cn.parentNode;
				}
				if ( document != cn )
				{
					node = null;
					delete node;
					fry.ui.dnd.targets[i].adapter = null;
					fry.ui.dnd.targets[i] = null;
					delete fry.ui.dnd.targets[i];
					cn = null;
					delete cn;
					continue;
				}
				cn = null;
				delete cn;
			}
			if ( node == actual_node && !fry.ui.dnd.wasControlKey )
			{
				// the same node serving as BOTH
				continue;
			}
			var intersected = false;
			if ( fry.ui.dnd.MODE_DRAG_POINTER == (fry.ui.dnd.mode & fry.ui.dnd.MODE_DRAG_POINTER) )
			{
				intersected = coords.x<x && coords.y<y && coords.x+coords.w>x && coords.y+coords.h>y;
			}
			else
			{
				// intersection drag mode
				for ( var ii=0; ii<4 && !intersected; ii++ )
				{
					intersected = coords.x<points[ii][0] && coords.y<points[ii][1] && coords.x+coords.w>points[ii][0] && coords.y+coords.h>points[ii][1];
				}							
			}
			if ( intersected )
			{
				active_targets.push({t:target, firstEnter:!target.isActive, offsetX:x-coords.x, offsetY:y-coords.y});
				target.isActive = true;
			}
			else
			{
				if ( target.isActive )
				{
					target.adapter.onDragLeave(false);
				}
				target.isActive = false;
			}
		}
		for ( var index in active_targets )
		{
			var trg = active_targets[index];
			trg.t.adapter.onDragEnter(trg.firstEnter, trg.offsetX, trg.offsetY, fry.ui.dnd.node, fry.ui.dnd.adapter, active_targets, index);
		}
		return active_targets;		
	}
	
	ACNode.prototype.addDnd = // common typos prevention...
	ACNode.prototype.addDnD = function(mode, adapter)
	{
		if ( 2 > arguments.length )
		{
			throw new FryException(110, 'fry.ui: DnD adapter not specified.');
		}
		if ( 2 < arguments.length )
		{
			var arg_offset = 1;
			adapter = {};
			if ( fry.ui.dnd.MODE_DRAG == (mode & fry.ui.dnd.MODE_DRAG) )
			{
				adapter = 
				{
					onGetRenderingNode:arguments[1],
					onDragStart:arguments[2],
					onDragMove:arguments[3],
					onDragStop:arguments[4],
					onGetData:arguments[5],
					onClick:arguments[6],
					onGetCursorNode:arguments[7],
					onGetCursorPadding:arguments[8]
				};
				arg_offset = 9;
			}
			if ( fry.ui.dnd.MODE_DROP == (mode & fry.ui.dnd.MODE_DROP) )
			{
				if ( 1 == arg_offset )
				{
					adapter.onGetRenderingNode = arguments[arg_offset++];
				}
				adapter.onGetCoords = arguments[arg_offset++];
				adapter.onDragEnter = arguments[arg_offset++];
				adapter.onDragLeave = arguments[arg_offset++];
				adapter.onPutData = arguments[arg_offset++];
			}
		}
		// checking adapter
		if ( fry.ui.dnd.MODE_DRAG == (mode & fry.ui.dnd.MODE_DRAG) )
		{
			if ( 'object' != typeof adapter )
			{
				throw new FryException(111, 'fry.ui: DnD adapter not an object.');
			}
			// required methods
			$foreach ( ['onGetData'], function(method)
			{
				if ( !adapter[method] )
				{
					throw new FryException(112, 'fry.ui: DnD `'+method+'` adapter method not specified.');
				}				
			});
			// optional methods
			$foreach ( ['onDragStart', 'onDragMove', 'onDragStop', 'onGetCursorNode'], function(method)
			{
				if ( !adapter[method] )
				{
					adapter[method] = function(){return null;};
				}				
			});
			if  ( !adapter.onGetCursorPadding )
			{
				adapter.onGetCursorPadding = function(){return [0,0,0,0];};
			}
		}
		// checking adapter for drop
		if ( fry.ui.dnd.MODE_DROP == (mode & fry.ui.dnd.MODE_DROP) )
		{
			if ( !adapter.onGetCoords )
			{
				adapter.node = this;
				adapter.onGetCoords = fry.ui.DropAdapter.prototype.onGetCoords;
			}			
			if ( !adapter.onDragEnter )
			{
				adapter.onDragEnter = function(firstEnter, offsetX, offsetY, sourceNode, sourceAdapter, originalMouseDownEvent, allTargets, targetIndex){};
			}
			if ( !adapter.onDragLeave )
			{
				adapter.onDragLeave = function(){};
			}
			if ( !adapter.onGetRenderingNode )
			{
				adapter.node = this;
				adapter.onGetRenderingNode = fry.ui.DragAdapter.prototype.onGetRenderingNode;
			}
			$foreach ( ['onPutData'], function(method)
			{
				if ( !adapter[method] )
				{
					throw new FryException(113, 'fry.ui: DnD `'+method+'` adapter method not specified.');
				}				
			});
			// check for existing target
			for ( var i in fry.ui.dnd.targets )
			{
				var target = fry.ui.dnd.targets[i];
				if ( $(target.adapter.onGetRenderingNode()).$ == this.$ )
				{
					// already existing for the node, removing
					fry.ui.dnd.targets[i] = null;
					delete fry.ui.dnd.targets[i];
				}
			}
			// registering drop target
			fry.ui.dnd.targets.push({adapter:adapter, coordsCache:null, isActive:false});
		}
		if ( fry.ui.dnd.MODE_DRAG == (mode & fry.ui.dnd.MODE_DRAG) )
		{
			// node is draggable
			adapter.node = adapter.onGetRenderingNode ? adapter.onGetRenderingNode() : this;
			this.e('mousedown', function(evt)
			{
//				console.log('%d x %d  offsets: %d x %d', evt.pageX, evt.pageY, evt.getOffsetX(), evt.getOffsetY());
				fry.ui.dnd.start(mode, adapter, evt.pageX, evt.pageY, evt.getOffsetX(), evt.getOffsetY(), evt.isAnyControlKeyPressed());
				evt = null;
			});
		}
		this.sa('frydnd', mode);
		return this;		
	}
	ACNode.prototype.removeDnd = // common typos prevention...
	ACNode.prototype.removeDnD = function()
	{
		if ( null == this.ga('frydnd') )
		{
			return this;
		}
		var mode = parseInt(this.ga('frydnd'));
		if ( fry.ui.dnd.MODE_DRAG == mode & fry.ui.dnd.MODE_DRAG )
		{
			this.e('mousedown');			
		}
		if ( fry.ui.dnd.MODE_DROP == mode & fry.ui.dnd.MODE_DROP )
		{
			for ( var index in fry.ui.dnd.targets )
			{
				var target = fry.ui.dnd.targets[index];
				if ( target.adapter.onGetRenderingNode() == this )
				{
					target.adapter = null;
					fry.ui.dnd.targets[index] = null;
					break;
				}
			}			
		}
		this.ra('frydnd');
		return this;
	}
}


fry_ui_init = function()
{
	fry.ui.info.page.width = document.documentElement.offsetWidth || document.body.offsetWidth;
	fry.ui.info.page.height = self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	var inf = $__tune.node.getPageScrollPosition();
	fry.ui.info.page.scroll = {left:inf[0], top:inf[1]};
	inf = null;
	$__tune.event.addListener(document.documentElement, 'mousemove', function(evt)
	{
		try
		{
			if ( !fry )
			{
				return;
			}
		}
		catch(e)
		{
			return;
		}
		if ( !fry.ui.drag.state.started )
		{
			if ( fry.ui.dnd.state.started )
			{
				fry.ui.dnd.move(evt);
			}
		}
		else
		{
			fry.ui.drag.move(evt);				
		}
		evt = null;	
	});

	$__tune.event.addListener(document.documentElement, 'mouseup', function(evt)
	{
		try
		{
			if ( !fry )
			{
				return;
			}
		}
		catch(e)
		{
			return;
		}		
		if ( !fry.ui.drag.state.started )
		{
			if ( fry.ui.dnd.state.started )
			{
				fry.ui.dnd.stop();
			}
		}
		else
		{
			fry.ui.drag.stop();
		}
		evt = null;
	});	
}


if ( !fry.__production_mode )
{
	$__tune.event.addListener(self, 'load', function(evt)
	{
		if ( evt.removeListener )
		{
			evt.removeListener();		
		}
		fry_ui_init();
		fry_ui_init = null;
	});	
}



/*--------*/

if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}