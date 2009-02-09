#++
#     ------------------------------------------------------------------------------------------
#     == Amy Editor ==
#     Collaborative Text and Source Code Editor for Developers
# 
#     Built on the technologies developed and maintained by April-Child.com
#     Copyright (c)2007,2008 Petr Krontorad, April-Child.com.
# 
#     Author: Petr Krontorad, petr@krontorad.com
# 
#     All rights reserved.
#     *------------------------------------------------------------------------------------------
# 
#     Library loader
# 
#     *------------------------------------------------------------------------------------------
#--

# loading Fry plugin - we must load it prior amy plugin
require File.join(RAILS_ROOT, 'vendor/plugins/fry/init.rb')

require "rexml/document"

# loading library
%w(support/simple_http support/google support/yaml support/mail base helpers bundle user logger projects/remote_project projects/abstract_resource_manager projects/file_resource_manager support/dav_client support/ftp_client).each {|library| require File.join(File.dirname(__FILE__), "lib/#{library}") }

# setting up
Amy::Base.setup