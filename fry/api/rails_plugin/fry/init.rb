#++
#  Fry Framework - JavaScript library
#  Rails plugin
#  Copyright(c)2007 Petr Krontorád, AprilChild.com
#--

# Loading library
require File.join(RAILS_ROOT, 'vendor/plugins/fry/lib/fry')
require File.join(RAILS_ROOT, 'vendor/plugins/fry/lib/fry_helpers')

#require 'fry'
#require 'fry_helpers'

# Extending Rails
ActionController::Base.send(:include, Fry)
ActionView::Base.send(:include, Fry::Helpers)
