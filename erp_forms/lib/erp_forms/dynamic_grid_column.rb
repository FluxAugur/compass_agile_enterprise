class DynamicGridColumn
  
  def self.build_column(field_hash, options={})
    field_hash.symbolize_keys!
    header = field_hash[:fieldLabel]
    type = DynamicGridColumn.convert_xtype_to_column_type(field_hash[:xtype])
    data_index = (field_hash[:dataIndex] ? field_hash[:dataIndex] : field_hash[:name])
    
    if type == 'date'
      renderer = "Ext.util.Format.dateRenderer('m/d/Y')"
    else
      renderer = ''
    end
    
    col = "{
        \"header\":\"#{header}\",
        \"type\":\"#{type}\",
        \"dataIndex\":\"#{data_index}\""
   
    
    col << ",\"width\":#{field_hash[:width]}" if field_hash[:width]

    sortable = field_hash[:sortable].nil? ? true : field_hash[:sortable]
    col << ",\"sortable\":#{sortable}"

    col += ",
        \"renderer\": #{renderer}" if renderer != ''

    if options[:editor]
      readonly = field_hash[:readOnly].blank? ? false : field_hash[:readOnly]
      col += ",
      {
        \"xtype\": \"#{field_hash[:xtype]}\",
        \"readOnly\": \"#{readonly}\""
        
        if field_hash[:validation_regex] and field_hash[:validation_regex] != ''
          col += ",    
            \"validateOnBlur\": true,
            \"validator\": function(v){
              var pattern = /#{field_hash[:validation_regex]}/;
              var regex = new RegExp(pattern);
              return regex.test(v);          
            }"
        end
      col += "}"
    end    
        
    col += "}"
    
    col
  end
  
  def self.build_delete_column(action='')
    action = "var messageBox = Ext.MessageBox.confirm(
      'Confirm', 'Are you sure?', 
      function(btn){
        if (btn == 'yes'){ 
          #{action}               
        }
      });"    
    DynamicGridColumn.build_action_column("Delete", "/images/icons/delete/delete_16x16.png", action)
  end
  
  def self.build_view_column(action='')    
    DynamicGridColumn.build_action_column("View", "/images/icons/document_view/document_view_16x16.png", action)
  end

  def self.build_edit_column(action='')    
    DynamicGridColumn.build_action_column("Edit", "/images/icons/document_edit/document_edit_16x16.png", action)
  end
  
  def self.build_action_column(header, icon, action)    
    col = '{
        "menuDisabled":true,
        "resizable":false,
        "xtype":"actioncolumn",
        "header":"'+header+'",
        "align":"center",
        "width":50,
        "items":[{
            "icon":"'+icon+'",
            "tooltip":"'+header+'",
            "handler" :function(grid, rowIndex, colIndex){
                var rec = grid.getStore().getAt(rowIndex);
                '+action+'
            }
        }]
    }'
    
    col
  end
  
  def self.convert_xtype_to_column_type(xtype)
    case xtype
    when 'textfield'
      return 'string'
    when 'datefield'
      return 'date'
    when 'textarea'
      return 'string'
    when 'numberfield'
      return 'number'
    when 'actioncolumn'
      return 'actioncolumn'
    else
      return 'string'
    end
  end
  
end