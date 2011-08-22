class ErpApp::Widgets::ContactUs::Base < ErpApp::Widgets::Base

  def self.title
    "Contact Us"
  end
  
  def index
    @use_dynamic_form = params[:use_dynamic_form]

    render
  end

  def new
    @website = Website.find_by_host(request.host_with_port)    
    @website_inquiry = WebsiteInquiry.new

    params[:created_by] = current_user unless current_user.nil?
    params[:created_with_form_id] = params[:dynamic_form_id] if params[:dynamic_form_id] and params[:is_html_form].blank?
    params[:website_id] = @website.id
    @website_inquiry = DynamicFormModel.save_all_attributes(@website_inquiry, params, ErpApp::Widgets::Base::IGNORED_PARAMS)
        
    if @website_inquiry
      if @website.email_inquiries?
        @website_inquiry.send_email
      end
      render :view => :success
    else
      render :view => :error
    end
  end

  def self.name
    File.dirname(__FILE__).split('/')[-1]
  end

  #if module lives outside of erp_app plugin this needs to be overriden
  #get location of this class that is being executed
  def locate
    File.dirname(__FILE__)
  end
end
