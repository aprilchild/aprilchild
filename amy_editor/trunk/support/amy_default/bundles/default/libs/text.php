<?php
    /*
        Text support library for Amy Editor commands.
        Copyright (c)2007 Petr Krontorad, April-Child.com
    */

    // returns string encoded to base64 encoding
    function encode_base64($str)
    {
        return base64_encode($str);
    }

    // returns string decoded from base64 encoding
    function decode_base64($str)
    {
        return base64_decode($str);
    }

?>