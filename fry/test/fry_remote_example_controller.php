<?php
/*
	 * AC Fry - JavaScript Framework v1.0
	 *
	 * Remote backend example - PHP 5+
	 *
	 * (c)2006 Petr Krontorad, April-Child.com
	 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
	 * http://www.april-child.com. All rights reserved.
	 * See the license/license.txt for additional details regarding the license.
	 * Special thanks to Matt Groening and David X. Cohen for all the robots.
	
 */
	include dirname(__FILE__).'/../remote/ac_backend.php';
	
	class FryRemoteExampleController extends ACBackend
	{
		public function on_reverse_string($pars)
		{
			self::setResult(strrev($pars['str']));
		}
		
		public function on_no_data($pars)
		{
			// we return nothing, it is considered a MISTAKE and will result in error on client-side
		}
		
		public function on_invalid_action($pars)
		{
			self::raiseError('Error when performing: '.$pars['str']);
		}
		
		public function on_set_array($pars)
		{
			// there's an array passed as parameter
			$sent_array = $pars['my_array'];
			self::setResult($sent_array);
		}
		
		public function on_set_object($pars)
		{
			$person = $pars['myself'];
			self::setResult($person);
		}
		
		public function on_get_array($pars)
		{
			$r = array('first', 'second', 'third');
			self::setResult($r);
		}

		public function on_get_nested_array($pars)
		{
			$r = array('is'=>'this?', 'nested'=>array('first', 'second', 'third'));
			self::setResult($r);
		}
		
		public function on_get_assoc_array($pars)
		{
			$r = array('first'=>'AAA', 'second'=>'BBB', 'third'=>'CCC');
			self::setResult($r);
		}

		public function on_get_object($pars)
		{
			$obj = new stdClass;
			$obj->greetings = 'Hello from PHP object... !';
			self::setResult($obj);
		}
		
		public function on_get_basket($pars)
		{
			$basket = new stdClass;
			$obj->orderId = 'JB-007';
			$obj->products = array
			(
				array('productId'=>2, 'quantity'=>56, 'name'=>'Aston Martin'),
				array('productId'=>6, 'quantity'=>22, 'name'=>'BMW'),
				array('productId'=>7, 'quantity'=>18, 'name'=>'Fry'),
				array('productId'=>1, 'quantity'=>98, 'name'=>'Leela')
			);
			self::setResult($obj);
		}
		
		public function on_upload($pars)
		{
			self::setResult(true);
		}
	}
	
	try
	{
		$action = new FryRemoteExampleController();
		$action->process( $_REQUEST['a'] );
	}
	catch ( Exception $e )
	{
		FryRemoteExampleController::raiseError( $e->getMessage() );
	}
	
?>