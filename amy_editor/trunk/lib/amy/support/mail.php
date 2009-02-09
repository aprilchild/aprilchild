<?php
/*
  *------------------------------------------------------------------------------------------
	Mail Library

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	
*/

class Mail
{
	private $from = '';
	private $to = '';

	public function __construct($from, $to)
	{
		$this->from = $from;
		$this->to = $to;
	}
	
	public function send($subject, $body)
	{
		$to = $this->to;
		$from = $this->from;
		$headers = 'From: ' . $this->from . "\r\n" .
		    'X-Mailer: PHP/' . phpversion();

		if (false === strpos($_SERVER['HTTP_HOST'], 'mac'))
		{
			@mail($this->to, $subject, $body, $headers);
		}
	}
}
