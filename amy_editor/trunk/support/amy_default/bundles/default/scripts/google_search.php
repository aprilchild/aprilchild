<?php
/*
  Amy script.
  
  Google search.

*/

function run_script($controller, $params)
{
    $out = array();
    $results = Google::search($params['query']);
    foreach ( $results as $result )
    {
        $out[] = $result['title']."\n\t".$result['url']."\n\t\t".$result['note'];
    }
    $controller->ok(implode("\n\n", $out));
}

?>