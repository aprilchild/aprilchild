#!/bin/sh
set -v
phpdoc -p -t doc -d Services,admin/tutorials -ti "JanRain Yadis Library" \
    --ignore \*~,HTTPFetcher.php,ParanoidHTTPFetcher.php,PlainHTTPFetcher.php,ParseHTML.php \
    -dn "Yadis" -o "HTML:frames:phphtmllib"
