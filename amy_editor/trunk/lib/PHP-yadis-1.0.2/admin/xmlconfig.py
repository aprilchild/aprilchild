
"""
This is the package.xml data needed for the PHP Yadis PEAR package.xml
file.  Use the 'packagexml.py' program to generate a package.xml file
for a release of this library.
"""

# This is a list of dicts describing the project leads.  This will be
# used to generate <lead> XML elements.
leads = [
    {'name': 'Jonathan Daugherty',
     'user': 'cygnus',
     'email': 'cygnus@janrain.com',
     'active': 'yes'}
    ]

# The package name.
package_name = 'Services_Yadis'

# The package description.
package_description = 'An implementation of the Yadis service discovery protocol'

# Package summary.
package_summary = 'PHP Yadis'

# License string.
license_name = 'LGPL'

# License URI.
license_uri = 'http://www.gnu.org/copyleft/lesser.txt'

# Director(ies) containing package source, relative to the admin/
# directory.  All .php files in these directories will be included in
# the <contents> element of the output XML and will be assigned the
# role 'php'.
contents_dirs = ['../Services']

# Director(ies) containing package documentation.  All files and
# subdirectories in these directories will be included in the
# <contents> element in the output XML and will be assigned the role
# 'doc'.
docs_dirs = ['../doc']

# The HTTP package base URI.  This is the place on the web where the
# PEAR-installable tarballs will live, and this (plus the package
# tarball name) will be the URL that users pass to "pear install".
package_base_uri = 'http://www.openidenabled.com/resources/downloads/php-yadis/pear/'

# The release stability.  Maybe this should be a commandline parameter
# since it might differ from release to release.
release_stability = 'stable'
