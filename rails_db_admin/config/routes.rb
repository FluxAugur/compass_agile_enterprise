Rails.application.routes.draw do
  match '/reports/display/:iid(.:format)' => "rails_db_admin/reports/base#index"
end

RailsDbAdmin::Engine.routes.draw do
  match '/erp_app/desktop/base(/:action(/:table(/:id)))' => "erp_app/desktop/base"
  match '/erp_app/desktop/queries(/:action(/:table(/:id)))' => "erp_app/desktop/queries"
  match '/erp_app/desktop/reports(/:action(/:table(/:id)))' => "erp_app/desktop/reports"
end
