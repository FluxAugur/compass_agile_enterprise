class OrganizerApplicationGenerator < Rails::Generator::NamedBase
  def initialize(runtime_args, runtime_options = {})
    super
    raise "Must Include A Description For This Application Arg[1]" if runtime_args[1].blank?
    @description     = runtime_args[1]
    @erp_application = runtime_args[2].blank? ? 'erp_app' : runtime_args[2]
  end

  def manifest
    record do |m|

      #Controller
      m.directory "vendor/plugins/#{@erp_application}/app/controllers/erp_app/organizer/#{file_name}"
      m.template "controllers/controller_template.rb", "vendor/plugins/#{@erp_application}/app/controllers/erp_app/organizer/#{file_name}/base_controller.rb"

      #public
      m.directory "vendor/plugins/#{@erp_application}/public/javascripts/erp_app/organizer/applications/#{file_name}"
      m.template "public/base.js.erb", "vendor/plugins/#{@erp_application}/public/javascripts/erp_app/organizer/applications/#{file_name}/base.js"

      #Route
      m.template "routes/route_template.rb", "vendor/plugins/#{@erp_application}/config/#{file_name}_app_routes.rb"

      #Readme
      m.readme "INSTALL"
    end
  end

  def description
    @description
  end
end
