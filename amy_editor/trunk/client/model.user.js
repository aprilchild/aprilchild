/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	User support models

  *------------------------------------------------------------------------------------------
*/


/*	USERS
	_______________________________________________________________ */



client.model.user = {rootMenuIdentityElement:null};

client.model.user.isDefault = function()
{
	return 'amy' == client.conf.user.service && 'default' == client.conf.user.username;
}

client.model.user.setIdentity = function(user, callbackBefore, callbackAfter)
{
	callbackBefore();
	client.conf.user = user;
	console.log('Set identity for user: %o', user);
	identity_elem = client.model.user.rootMenuIdentityElement;
	identity_elem.removeAllChildren();
	identity_elem.setState(identity_elem.STATE_WILL_LOAD);
	callbackAfter();
}

client.model.user.clearIdentity = function(callbackBefore, callbackAfter)
{
	callbackBefore();
	client.conf.user = {service:'amy', username:'default'};
	identity_elem = client.model.user.rootMenuIdentityElement;
	identity_elem.removeAllChildren();
	identity_elem.setState(identity_elem.STATE_WILL_LOAD);
	callbackAfter();
}

client.model.user.getIconUrl = function(skipDefault)
{
	if (skipDefault)
	{
		return client.conf.user.credentials['picture'];
	}
	var picture = client.conf.user.credentials['picture'];
 	return 0 == picture.trim().length ? 'mm/i/pictures/j.png' : picture;
}

client.model.user.updateRelation = function(email, item, callbackOk, callbackError)
{
	$rpost(
		{a:'user_update_relation', original_email:email, nickname:item.properties.nickname, email:item.properties.email},
		function(relation)
		{
			item.properties.user_id = relation.user_id;
			item.properties.nickname = relation.nickname;
			item.properties.email = relation.email;
			item.properties.icon = relation.picture;
			item.properties.isCustom = 0 == relation.user_id;
			callbackOk();
		},
		callbackError
	);
}

amy.MainMenuModel.prototype.loadIdentityElement = function(acElem, callbackOnSuccess, callbackOnError)
{
	if (client.model.user.isDefault())
	{
		var item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.label = $loc('mi_Identity_SignIn');
		item.properties.commandId = 'identity__sign_in';
		
		item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.isSeparator = true;
		
		item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.label = $loc('mi_Identity_Register');
		item.properties.commandId = 'identity__register';
	}
	else
	{
		var item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.label = client.conf.user.credentials['nickname'];
		item.properties.hasIcon = true;
		item.properties.isActive = false;

		item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.isSeparator = true;

		item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.label = $loc('mi_Identity_Notifications');
		item.properties.commandId = 'identity__notifications';		
		
		item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.label = $loc('mi_Identity_AddressBook');
		item.properties.commandId = 'identity__address_book';

		item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.isSeparator = true;

		item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.label = $loc('mi_Identity_ChangeIcon');
		item.properties.commandId = 'identity__change_icon';

		item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.isSeparator = true;
		
		item = acElem.appendChild($new(ACElement));
		item.isCollection = false;
		item.properties.label = $loc('mi_Identity_SignOut');
		item.properties.commandId = 'identity__sign_out';
	}
	callbackOnSuccess();
}

/*  ---------------------------------------------------------------- 
	amy.AddressBookModel < ac.TableViewWidgetModel
*/
$class('amy.AddressBookModel < ac.TableViewWidgetModel');

amy.AddressBookModel.prototype.addRecord = function()
{
	var item = this.widget.properties.actualListContainer.appendChild($new(ACElement));
	item.properties.nickname = "..";
	item.properties.email = "@";
	item.properties.icon = '';
	item.properties.isCustom = true;
}

amy.AddressBookModel.prototype.removeRecord = function(item, callbackOk, callbackError)
{
	$rpost({a:'user_remove_relation', user_id:item.properties.user_id, email:item.properties.email}, function(r){item.parentElement.removeChild(item);callbackOk();}, callbackError);
}

amy.AddressBookModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
	$rpost(
		{a:'user_find_relations'},
		function(relations)
		{
			$foreach(relations, function(relation)
			{
				var item = acElem.appendChild($new(ACElement));
				item.properties.user_id = relation.user_id;
				item.properties.nickname = relation.nickname;
				item.properties.email = relation.email;
				item.properties.icon = relation.picture;
				item.properties.isCustom = 0 == relation.user_id;
			});
			callbackOnSuccess();
		},
		function(e)
		{
			callbackOnError(e);
		}
	);
}
