class CreateOrganizerApp<%=class_name %>
  def self.up
    OrganizerApplication.create(
      :description => '<%=description %>',
      :icon => '<%=icon %>',
      :javascript_class_name => 'Compass.ErpApp.Desktop.Applications.<%=class_name %>',
      :internal_identifier => '<%=file_name %>'
    )
  end

  def self.down
    OrganizerApplication.destroy_all(:conditions => ['internal_identifier = ?','<%=file_name %>'])
  end
end