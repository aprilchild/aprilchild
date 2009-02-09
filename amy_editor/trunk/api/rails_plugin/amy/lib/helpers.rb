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
#     Helper extensions
# 
#     *------------------------------------------------------------------------------------------
#--


module Amy
  module Helpers

    # Helpers are subject to change in next releases! Highly temporary design...

    def render_amy_init_editing_component(component)
      out =  component[:theme]
      out << "\n\n"
      out << component[:bundle]
      out
    end

    def render_amy_editing_component(component)
      out = '<script type="text/javascript">function init_chap_component(){'
      out << render_amy_init_editing_component(component)
      out << "}\n</script>"
      out << '<style type="text/css">'
      # out << ".acw-chap pre, .acw-chap pre span,  span.acw-char-check, .acw-chap .selection-area div {"
      # if 'Mac' == component[:host_os]
      #   out << "font:11px 'Courier', monospaced;"
      #       else
      #         out << "font:11px 'Courier New', 'Courier', monospaced;"
      #       end
      #       out << "line-height:11px;margin:0;padding:0;border:0;}"
	    out << "\n.acw-chap .wrapped-row { background-image:url('/javascripts/fry/mm/i/theme/apple/chap-wrapped-row.gif');background-repeat:no-repeat;background-position:25px 4px;}"
	    out << "\n.acw-chap .sidebar { background-image:url('/javascripts/fry/mm/i/theme/apple/chap-bg-sidebar.gif');}"
      # out << "\n.acw-chap .sidebar .row-number { font-family:'Lucida Grande', Tahoma, Arial, helvetica, sans-serif; text-align:right; font-size:10px; color:#999; }"
			out << "\n.acw-chap .folding-expand-inner	{ width:14px; height:10px; margin-left:2px;	display:inline; background-image: url('/javascripts/fry/mm/i/theme/apple/chap-folding-expand-inner.gif');	}"
			out << "\n.acw-chap .folding-expand	{ background-image:url('/javascripts/fry/mm/i/theme/apple/chap-folding-expand.gif'); }"
			out << "\n.acw-chap .folding-start { background-image:url('/javascripts/fry/mm/i/theme/apple/chap-folding-start.gif'); }"
			out << "\n.acw-chap .folding-stop	{	background-image:url('/javascripts/fry/mm/i/theme/apple/chap-folding-stop.gif'); }"
			out << "\n.acw-chap .bookmark-default	{	background-image:url('/javascripts/fry/mm/i/theme/apple/chap-bookmark-default.gif'); }"
			out << "\n.acw-chap .void	{	background-image:url('/javascripts/fry/mm/i/theme/void.gif');	}"
	    out << "</style>"
      out
    end
    
    
    def render_amy_addview(component, options={})
      "chap.addView($('#{options[:node]}'), {theme:ac.chap.theme.#{component[:theme_name]}, wordWrap:true, tabelator:'#{options[:tabelator]}'});"
    end
  end

end

