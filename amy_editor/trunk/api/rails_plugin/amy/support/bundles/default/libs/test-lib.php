<?php

    function hello($txt)
    {
        return strtoupper($txt);
    }

    function validate_xml($xmlString)
    {
        libxml_use_internal_errors(true);
        $dom = new DomDocument();
        $dom->loadXML($xmlString);
        $errors = true;
        if (!@$dom->schemaValidate(''))
        {
            $errors = libxml_get_errors();
            if ( 0 == sizeof($errors) )
            {
                $errors = true;
            }
        }
        return $errors;
    }
    
    function validate_and_display_xml($xmlString)
    {
        $errors = validate_xml($xmlString);
        $out = '';
        if ( is_array($errors) )
        {
            foreach ($errors as $error)
            {
                $out .= _validate_and_display_xml($error, $xmlString);
            }
        }
        else
        {
            if ( true === $errors )
            {
                $out = 'No errors.';
            }
            else
            {
                $out = 'Could not validate.';
            }            
        }
        return $out;
    }
    
    function _validate_and_display_xml($error, $xmlString)
    {
        $out  = str_replace('<', '&lt;', str_replace('>', '&gt;', str_replace('&', '&amp;', $xmlString[$error->line - 1]))) . "\n";
        $out .= str_repeat('-', $error->column) . "^\n";

        switch ($error->level) 
        {
            case LIBXML_ERR_WARNING:
                $out .= "Warning $error->code: ";
                break;
             case LIBXML_ERR_ERROR:
                $out .= "Error $error->code: ";
                break;
            case LIBXML_ERR_FATAL:
                $out .= "Fatal Error $error->code: ";
                break;
        }
        $out .= trim($error->message) .
                   "\n  Line: $error->line" .
                   "\n  Column: $error->column";

        if ($error->file) {
            $out .= "\n  File: $error->file";
        }

        return "$out\n\n--------------------------------------------\n\n";
    }

?>