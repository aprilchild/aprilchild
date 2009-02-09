<?php
/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Facebook page view

  *------------------------------------------------------------------------------------------
*/

	try
	{
		include_once dirname(__FILE__).'/conf/amy/configuration.php';
		include_once dirname(__FILE__).'/lib/amy.php';		
		include_once dirname(__FILE__).'/lib/facebook/facebook.php';	
	}
	catch (Exception $e)
	{
		if ('development' == $GLOBALS['_AMY_CONF']['environment'])
		{
			echo '<h1>Amy Editor Exception</h1>';
			echo $e->getMessage();
			echo '<hr/><pre>';
			print_r($e);
		}
	}
	
	$api_key = 'b6e480b7b1fc15724c81c1bcc1cfc544';
	$secret = 'e0cad4c537b04bc893dfcfebf7aed7f4';

	$facebook = new Facebook($api_key, $secret);
	$user = $facebook->require_login();

	$callback_url = 'http://www.april-child.com/amy/amy.php?act_as=facebook';

	try
	{
		if (!$facebook->api_client->users_isAppAdded()) 
		{
			$facebook->redirect($facebook->get_add_url());
		}
	}
	catch (Exception $e) 
	{
		// this will clear cookies for your application and 
		// redirect them to a login prompt
		$facebook->set_user(null, null);
		$facebook->redirect($callback_url);
	}
	

	if (!isset($_REQUEST['iframe_skipped']))
	{
		echo '<html><head><body><script type="text/javascript">top.location.href="' . $callback_url . '&auth_token=' . $_GET['auth_token'] . '&iframe_skipped=true' . '" + ((top.opener&&top.opener.location.host==\'www.april-child.com\') ? "&external_service=true" : "");</script></body></html>';
		exit();
	}
	
	
	$amy_user = new AmyUser($_AMY_CONF);
	try
	{
		$amy_user->authorize($user, null, 'facebook');
	}
	catch (Exception $e)
	{
	}
	if (!$amy_user->is_authorized())
	{
		// first time visit from Facebook
		// let's register user
		try
		{
			$user_info = $facebook->api_client->users_getInfo(array($user), array('name', 'pic_square'));
			$credentials = array(
				'nickname' => $user_info[0]['name'],
				'picture' => $user_info[0]['pic_square']
			);
			$amy_user->register($user, null, 'facebook', $credentials);
		}
		catch (Exception $e)
		{
		}
	}
	else
	{
		if ($_REQUEST['external_service'])
		{
			echo '<html><head><body><script type="text/javascript">';
			echo 'var user = {id:' . $amy_user->userId . ', username:"' . $amy_user->username .'", service:"' . $amy_user->service . '", credentials:{nickname:"' . $amy_user->credentials['nickname'] . '", picture:"' . $amy_user->credentials['picture'] . '", bio:""}};';
			echo 'top.opener.amy.wizards.user_sign_in.external_sign_in_completed(user);top.close();</script></body></html>';
			exit();
		}
	}
	
	$GLOBALS['amy_user'] = $amy_user;

	include_once 'amy_frame.php';