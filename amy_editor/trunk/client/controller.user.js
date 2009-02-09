/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	User related controller support

  *------------------------------------------------------------------------------------------
*/

client.controller.userSignIn = function()
{
    client.view.showWizardDialogWindow($loc('wt_user_sign_in'), 'user_sign_in', {callbackComplete:function(user)
	{
		if (null == user)
		{
			return;
		}
		client.model.user.setIdentity(user, function()
		{
			// before setting up
			client.widgets.menuTop.hide();
		},
		function()
		{
			// after setting up
			client.widgets.menuTop.show();
			client.view.showFlashMessage($loc('fm_user_signed_in', {nickname:user.credentials['nickname']}), 2);
		});		
	}}, client.conf.locale, {width:800, height:450});
}

client.controller.userSignOut = function()
{
	var nickname = client.conf.user.credentials['nickname'];
	client.view.showWizardDialogWindow($loc('wt_user_sign_out'), 'user_sign_out', {callbackComplete:function()
	{
		client.model.user.clearIdentity(function()
		{
			// before clearing up
			client.widgets.menuTop.hide();
		},
		function()
		{
			// after clearing up
			client.widgets.menuTop.show();
			client.view.showFlashMessage($loc('fm_user_signed_out', {nickname:nickname}), 2);
		});
	}}, client.conf.locale, {width:450, height:300});
}

client.controller.userRegister = function()
{
	client.view.showWizardDialogWindow($loc('wt_user_register'), 'user_register', {callbackComplete:function(user)
	{
		if (null == user)
		{
			return;
		}
		client.model.user.setIdentity(user, function()
		{
			// before setting up
			client.widgets.menuTop.hide();
		},
		function()
		{
			// after setting up
			client.widgets.menuTop.show();
			client.view.showFlashMessage($loc('fm_user_registered', {nickname:user.credentials['nickname']}), 2);
		});		
	}}, client.conf.locale, {width:800, height:550});
}

client.controller.userChangeIcon = function()
{
	client.view.showWizardDialogWindow($loc('wt_user_change_icon'), 'user_change_icon', {callbackComplete:function(user)
		{
			client.model.user.setIdentity(user, function()
			{
				// before setting up
				client.widgets.menuTop.hide();
			},
			function()
			{
				// after setting up
				client.widgets.menuTop.show();
				client.view.showFlashMessage($loc('fm_user_changed_icon'), 2);
			});			
		}}, client.conf.locale, {width:800, height:520});
}


client.controller.showAddressBook = function(actAs, callbackOnSelection)
{
	if ('undefined' == typeof(actAs))
	{
		actAs = 'standard';
	}
	var width = 'standard' == actAs ? 800 : 470;
	var height = 'standard' == actAs ? 550 : 580;
    var win = client.view.showDialogWindow($loc('wt_address_book'), {width:width, height:height}, function(widget, node)
    {
        if ( $notset(client.widgets.addressBook) )
        {
			var root = $new(ACElement);
			root.setState(root.STATE_WILL_LOAD);
			root.isCollection = true;
        	var widget = $new
        	(
        		ac.TableViewWidget,
        		$new(amy.AddressBookModel, root),
        		$new(amy.AddressBookView),
        		$new(amy.AddressBookController),
        		client.widgets.winDialog
        	);
			widget.addColumn( 'icon', client.lc.get('h_icon'), '70', function(acElem)
			{
				return acElem.properties.icon;
			}, false, false);
			widget.addColumn( 'nickname', $loc('h_nickname'), '50%', function(acElem)
			{
				return acElem.properties.nickname.toLowerCase();
			}, false, true);
			widget.addColumn( 'email', $loc('h_email'), '40%', function(acElem)
			{
				return acElem.properties.email.toLowerCase();
			}, false, true);
			widget.addColumn( 'info', $loc('h_info'), '50', null, true);
			client.widgets.addressBook = widget;
        }
		client.widgets.addressBook.properties.actAs = actAs;
		client.widgets.addressBook.properties.callbackOnSelection = callbackOnSelection;
		var main_node = node.a($$()).pos(true).x(8).y(8).w(width-20).h(height-('standard'==actAs?72:48)).s('background:#fff;border:1px solid #ddd');
		client.widgets.addressBook.show(main_node);
		if ('standard' == actAs)
		{
			var butt_node = node.a($$()).pos(true).x(8).y(node.h()-32).w(node.w()-20).h(24);
	    	butt_node.a($$()).pos(true).w(22).h(22).y(0).x(0).s('background-image:url(mm/i/single-b-add.png)').e('click', function(evt)
	    	{
				evt.stop();
				client.widgets.addressBook.hide();
				client.widgets.addressBook.model.addRecord();
				client.widgets.addressBook.show();
			});
	    	butt_node.a($$()).pos(true).w(22).h(22).y(0).x(22).s('background-image:url(mm/i/single-b-remove.png)').e('click', function(evt)
	    	{
				evt.stop();
				var selection = client.widgets.addressBook.getSelection();
				if ( null != selection && 0 != selection.length )
				{
					client.view.showFlashMessage($loc('flash_removing_relation'));
					client.widgets.addressBook.model.removeRecord(selection[0], 
						function()
						{
							client.widgets.addressBook.hide();
							client.widgets.addressBook.show();
							client.view.hideFlashMessage();
						},
						function(e)
						{
							client.view.showFlashMessage($loc('flash_removing_relation_failed'), 2);
						}
					);
				}
			});			
		}
    }, function()
    {
		var widget = client.widgets.addressBook;
        widget.hide();
		if ('standard' == widget.properties.actAs)
		{
			return;
		}
		// var selection = widget.getSelection();
		// if ('function' == typeof widget.properties.callbackOnSelection && null != selection && 0 != selection.length)
		// {
		// 	var info = {user_id:selection[0].properties.user_id, nickname:selection[0].properties.nickname, email:selection[0].properties.email};
		// 	widget.properties.callbackOnSelection(info);
		// }
    });
}


/*  ---------------------------------------------------------------- 
	amy.AddressBookController < ac.TableViewWidgetController
*/

$class('amy.AddressBookController < ac.TableViewWidgetController');

amy.AddressBookController.prototype.onGetElementValueForEditing = function(acElem, colId)
{
	return acElem.properties[colId];
}

amy.AddressBookController.prototype.onElementDblClick = function(acElem, evt)
{
	if ('standard' == this.widget.properties.actAs)
	{
		return;
	}
	if ('function' == typeof client.widgets.addressBook.properties.callbackOnSelection)
	{
		var user = {user_id:acElem.properties.user_id, nickname:acElem.properties.nickname, email:acElem.properties.email};
		client.widgets.winDialog.close();
		client.widgets.addressBook.properties.callbackOnSelection(user);
	}
}

amy.AddressBookController.prototype.onElementValueEdited = function(acElem, colId, value, callbackOk, callbackError)
{
	var email = acElem.properties.email;
	acElem.properties[colId] = value;
	if (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(acElem.properties.email))
	{
		client.view.showFlashMessage($loc('flash_updating_relation'));
		client.model.user.updateRelation(email, acElem,
			function()
			{
				client.widgets.addressBook.hide();
				client.widgets.addressBook.show();
				client.view.hideFlashMessage();
				callbackOk();
			},
			function(e)
			{
				client.view.showFlashMessage($loc('flash_updating_relation_failed'), 2);
				callbackError();
			}
		)
	}
	else
	{
		callbackOk();
	}
}

amy.AddressBookController.prototype.onGetElementValueEditor = function(acElem, colId)
{
	if (!acElem.properties.isCustom || 'standard' != this.widget.properties.actAs)
	{
		return null;
	}
	return $new(ac.ValueEditorText);
}

