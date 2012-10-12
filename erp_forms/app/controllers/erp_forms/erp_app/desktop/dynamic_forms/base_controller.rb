class ErpForms::ErpApp::Desktop::DynamicForms::BaseController < ::ErpApp::Desktop::BaseController
  @@datetime_format = "%m/%d/%Y %l:%M%P"
  IGNORED_PARAMS = %w{action controller uuid widget_name widget_action dynamic_form_id dynamic_form_model_id model_name use_dynamic_form authenticity_token}

  protected
  def build_section_hash(website_section, website)
    website_section_hash = {
      :text => website_section.title,
      :siteName => website.title,
      :siteId => website.id,
      :type => website_section.type,
      :isSecured => !website_section.roles.empty?,
      :isSection => true,
      :inMenu => website_section.in_menu,
      :hasLayout => !website_section.layout.blank?,
      :id => "section_#{website_section.id}",
      :url => "http://#{website.hosts.first.host}/#{website_section.permalink}"
    }

    if website_section.is_a?(Blog) || website_section.type == 'Blog'
      website_section_hash[:isBlog] = true
      website_section_hash[:iconCls] = 'icon-blog'
      website_section_hash[:leaf] = true
    else
      unless website_section.children.empty?
        website_section_hash[:leaf] = false
        website_section_hash[:children] = []
        website_section.positioned_children.each do |child|
          website_section_hash[:children] << build_section_hash(child, website)
        end
      else
        website_section_hash[:leaf] = true
      end
      website_section_hash[:iconCls] = website_section_hash[:isSecured] ? 'icon-document_lock' : 'icon-document'
    end

    website_section_hash
  end
  
  def page
    offset = params[:start].to_f
    offset > 0 ? (offset / params[:limit].to_f).to_i + 1 : 1
  end
  
  def per_page
	 params[:limit].nil? ? 20 : params[:limit].to_i
  end  
end