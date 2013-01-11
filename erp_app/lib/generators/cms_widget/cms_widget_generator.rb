class CmsWidgetGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('../templates', __FILE__)
  argument :description, :type => :string 
  argument :icon_url, :type => :string
  
  def generate_widget
    #engine
    template "engine/engine_template.erb", "app/widgets/#{file_name}/base.rb"
    
    #javascript
    template "javascript/base.js.erb", "app/widgets/#{file_name}/javascript/#{file_name}.js"
    
    #views
    template "views/index.html.erb", "app/widgets/#{file_name}/views/index.html.erb"
    
    #helpers
    template "helpers/view/view_helper_template.erb", "app/widgets/#{file_name}/helpers/view/#{file_name}_view_helper.rb"
    template "helpers/controller/controller_helper_template.erb", "app/widgets/#{file_name}/helpers/controller/#{file_name}_controller_helper.rb"
  end
  
end
