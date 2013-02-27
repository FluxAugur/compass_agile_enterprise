Rails.application.routes.draw do
  filter :section_router
  
  get 'pages/:section_id' => 'knitkit/website_sections#index', :as => 'page'
  get 'onlinedocumentsections/:section_id' => 'knitkit/online_document_sections#index', :as => 'document'
  #get 'onlinedocumentsections/:section_id/:id' => 'knitkit/online_document_sections#show', :as => 'document'
  get 'blogs/:section_id(.:format)' => 'knitkit/blogs#index', :as => 'blogs'
  get 'blogs/:section_id/:id' => 'knitkit/blogs#show', :as => 'blog_article'
  get 'blogs/:section_id/tag/:tag_id(.:format)' => 'knitkit/blogs#tag', :as => 'blog_tag'
  
  match '/comments/add' => 'knitkit/comments#add', :as => 'comments'
  match '/unauthorized' => 'knitkit/unauthorized#index', :as => 'knitkit/unauthorized'
  match '/view_current_publication' => 'knitkit/base#view_current_publication'
  match '/online_document_sections/build_tree' => 'knitkit/online_document_sections#build_tree'
end

Knitkit::Engine.routes.draw do
  #Desktop Applications
  #knitkit
  match '/erp_app/desktop/:action' => 'erp_app/desktop/app'
  match '/erp_app/desktop/image_assets/:context/:action' => 'erp_app/desktop/image_assets'
  match '/erp_app/desktop/file_assets/:context/:action' => 'erp_app/desktop/file_assets'
  #article
  match '/erp_app/desktop/articles/:action(/:section_id)' => 'erp_app/desktop/articles'
  #content
  match '/erp_app/desktop/content/:action' => 'erp_app/desktop/content'
  #website
  match '/erp_app/desktop/site(/:action)' => 'erp_app/desktop/website'
  #section
  match '/erp_app/desktop/section/:action' => 'erp_app/desktop/website_section'
  #document
  match '/erp_app/desktop/online_document_sections/:action' => 'erp_app/desktop/online_document_sections'
  #theme
  match '/erp_app/desktop/theme/:action' => 'erp_app/desktop/theme'
  #versions
  match '/erp_app/desktop/versions/:action' => 'erp_app/desktop/versions'
  #comments
  match '/erp_app/desktop/comments/:action(/:content_id)' => 'erp_app/desktop/comments'
  #inquiries
  match '/erp_app/desktop/inquiries/:action(/:website_id)' => 'erp_app/desktop/inquiries'
  #website_nav
  match '/erp_app/desktop/website_nav/:action' => 'erp_app/desktop/website_nav'
  #position
  match '/erp_app/desktop/position/:action' => 'erp_app/desktop/position'
end
