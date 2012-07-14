module Widgets
  module ContactUs
    class Base < ErpApp::Widgets::Base
      include ActionView::Helpers::SanitizeHelper

      def index
        @use_dynamic_form = params[:use_dynamic_form]

        render
      end

      def new
        @is_html_form = params[:is_html_form]
        @validation = {}
        @validation[:first_name] = "First Name Cannot be Blank" if params[:first_name].blank?
        @validation[:last_name] = "Last Name Cannot be Blank" if params[:last_name].blank?
        @validation[:message] = "Message Cannot be Blank" if params[:message].blank?
        @validation[:email] = "Please Enter a Valid Email Address" unless /^.+@.+\..+$/.match(params[:email])
			
        if @is_html_form and !@validation.empty?
          return render :update => {:id => "#{@uuid}_result", :view => :error}
        end
			
        @website = Website.find_by_host(request.host_with_port)
        @website_inquiry = WebsiteInquiry.new

        subject = strip_tags(params[:email_subject])
        params.delete(:email_subject)
        params[:created_by] = current_user unless current_user.nil?
        params[:created_with_form_id] = params[:dynamic_form_id] if params[:dynamic_form_id] and params[:is_html_form].blank?
        params[:website_id] = @website.id
        @website_inquiry = DynamicFormModel.save_all_attributes(@website_inquiry, params, ErpApp::Widgets::Base::IGNORED_PARAMS)
				
        if @website_inquiry
          if @website.email_inquiries?
            @website_inquiry.send_email(subject)
          end
			  
          if @is_html_form
            render :update => {:id => "#{@uuid}_result", :view => :success}
          else
            render :json => {
              :success => true,
              :response => render_to_string(:template => "success", :layout => false)
            }
          end
        else
          if @is_html_form
            render :update => {:id => "#{@uuid}_result", :view => :error}
          else
            render :json => {
              :success => false,
              :response => render_to_string(:template => "error", :layout => false)
            }
          end
        end
      end

      #should not be modified
      #modify at your own risk
      def locate
        File.dirname(__FILE__)
      end
        
      class << self
        def title
          "Contact Us"
        end
          
        def widget_name
          File.basename(File.dirname(__FILE__))
        end
          
        def base_layout
          begin
            file = File.join(File.dirname(__FILE__),"/views/layouts/base.html.erb")
            IO.read(file)
          rescue
            return nil
          end
        end
      end
        
    end#Base
  end#ContactUs
end#Widgets
