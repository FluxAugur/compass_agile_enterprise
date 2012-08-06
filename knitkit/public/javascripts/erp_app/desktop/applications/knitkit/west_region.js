Ext.define("Compass.ErpApp.Desktop.Applications.Knitkit.WestRegion",{
  extend:"Ext.tab.Panel",
  id:'knitkitWestRegion',
  itemId:'knitkitWestRegion',
  alias:'widget.knitkit_westregion',
  setWindowStatus : function(status){
    this.findParentByType('statuswindow').setStatus(status);
  },
    
  clearWindowStatus : function(){
    this.findParentByType('statuswindow').clearStatus();
  },

  deleteSection : function(node){
    var self = this;
    Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this section?<br> NOTE: Articles belonging to this section will be orphaned.', function(btn){
      if(btn == 'no'){
        return false;
      }
      else
      if(btn == 'yes')
      {
        self.setWindowStatus('Deleting Section...');
        Ext.Ajax.request({
          url: '/knitkit/erp_app/desktop/section/delete',
          method: 'POST',
          params:{
            id:node.data.id.split('_')[1]
          },
          success: function(response) {
            self.clearWindowStatus();
            var obj =  Ext.decode(response.responseText);
            if(obj.success){
              node.remove(true);
            }
            else{
              Ext.Msg.alert('Error', 'Error deleting section');
            }
          },
          failure: function(response) {
            self.clearWindowStatus();
            Ext.Msg.alert('Error', 'Error deleting section');
          }
        });
      }
    });
  },

  exportSite : function(id){
    var self = this;
    self.setWindowStatus('Exporting Website...');
    window.open('/knitkit/erp_app/desktop/site/export?id='+id,'mywindow','width=400,height=200');
    self.clearWindowStatus();
  },

  deleteSite : function(node){
    var self = this;
    Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this Website?', function(btn){
      if(btn == 'no'){
        return false;
      }
      else
      if(btn == 'yes')
      {
        self.setWindowStatus('Deleting Website...');
        Ext.Ajax.request({
          url: '/knitkit/erp_app/desktop/site/delete',
          method: 'POST',
          params:{
            id:node.data.id.split('_')[1]
          },
          success: function(response) {
            self.clearWindowStatus();
            var obj =  Ext.decode(response.responseText);
            if(obj.success){
              node.remove(true);
            }
            else{
              Ext.Msg.alert('Error', 'Error deleting Website');
            }
          },
          failure: function(response) {
            self.clearWindowStatus();
            Ext.Msg.alert('Error', 'Error deleting Website');
          }
        });
      }
    });
  },

  publish : function(node){
    var self = this;
    var publishWindow = new Compass.ErpApp.Desktop.Applications.Knitkit.PublishWindow({
      baseParams:{
        id:node.id.split('_')[1]
      },
      url:'/knitkit/erp_app/desktop/site/publish',
      listeners:{
        'publish_success':function(window, response){
          if(response.success){
            self.getPublications(node);
          }
          else{
            Ext.Msg.alert('Error', 'Error publishing Website');
          }
        },
        'publish_failure':function(window, response){
          Ext.Msg.alert('Error', 'Error publishing Website');
        }
      }
    });

    publishWindow.show();
  },

  editSectionLayout : function(sectionName, sectionId, websiteId){
    var self = this;
    self.selectWebsite(websiteId);
    self.setWindowStatus('Loading section template...');
    Ext.Ajax.request({
      url: '/knitkit/erp_app/desktop/section/get_layout',
      method: 'POST',
      params:{
        id:sectionId
      },
      success: function(response) {
        self.initialConfig['centerRegion'].editSectionLayout(
          sectionName,
          websiteId,
          sectionId,
          response.responseText,
          [{
            text: 'Insert Content Area',
            handler: function(btn){
              var codeMirror = btn.findParentByType('codemirror');
              Ext.MessageBox.prompt('New File', 'Please enter content area name:', function(btn, text){
                if(btn == 'ok'){
                  codeMirror.insertContent('<%=render_content_area(:'+text+')%>');
                }

              });
            }
          }]);
        self.clearWindowStatus();
      },
      failure: function(response) {
        self.clearWindowStatus();
        Ext.Msg.alert('Error', 'Error loading section layout.');
      }
    });
  },

  changeSecurityOnSection : function(node, secure){
    var self = this;
    self.setWindowStatus('Updating section...');
    Ext.Ajax.request({
      url: '/knitkit/erp_app/desktop/section/update_security',
      method: 'POST',
      params:{
        id:node.data.id.split('_')[1],
        site_id:node.data.siteId,
        secure:secure
      },
      success: function(response) {
        var obj = Ext.decode(response.responseText);
        if(obj.success){
          self.clearWindowStatus();
          if(secure){
            node.set('iconCls', 'icon-document_lock');
          }
          else{
            node.set('iconCls', 'icon-document');
          }
          node.set('isSecured',secure);
          node.commit();
        }
        else{
          Ext.Msg.alert('Error', 'Error securing section');
        }
      },
      failure: function(response) {
        self.clearWindowStatus();
        Ext.Msg.alert('Error', 'Error securing section.');
      }
    });
  },

  changeSecurityOnMenuItem : function(node, secure){
    var self = this;
    self.setWindowStatus('Updating menu item security...');
    Ext.Ajax.request({
      url: '/knitkit/erp_app/desktop/website_nav/update_security',
      method: 'POST',
      params:{
        id:node.data.websiteNavItemId,
        site_id:node.data.websiteId,
        secure:secure
      },
      success: function(response) {
        var obj = Ext.decode(response.responseText);
        if(obj.success){
          self.clearWindowStatus();
          if(secure){
            node.set('iconCls', 'icon-document_lock');
          }
          else{
            node.set('iconCls', 'icon-document');
          }
          node.set('isSecured',secure);
          node.commit();
        }
        else{
          Ext.Msg.alert('Error', 'Error securing menu item');
        }
      },
      failure: function(response) {
        self.clearWindowStatus();
        Ext.Msg.alert('Error', 'Error securing menu item');
      }
    });
  },

  selectWebsite : function(websiteId){
    var node = this.sitesTree.getStore().getNodeById("website_"+websiteId);
    if(node.data.iconCls != 'icon-globe'){
      node.set('iconCls', 'icon-globe');
      node.commit();
    }
    node.parentNode.eachChild(function(child){
      if(node.data.id != child.data.id){
        if(child.data.iconCls != 'icon-globe_disconnected'){
          child.set('iconCls', 'icon-globe_disconnected');
          child.commit();
        }
      }
    });
    var eastRegion = Ext.ComponentQuery.query('#knitkitEastRegion').first();
    eastRegion.fileAssetsPanel.selectWebsite(websiteId, node.data.text);
    eastRegion.imageAssetsPanel.selectWebsite(websiteId, node.data.text);
    Compass.ErpApp.Shared.FileManagerTree.extraPostData = {
      website_id:websiteId
    };
  },

  updateWebsiteConfiguration : function(rec){
    var configurationWindow = Ext.create("Ext.window.Window",{
      layout:'fit',
      width:600,
      title:'Configuration',
      height:400,
      autoScroll:true,
      plain: true,
      items:[{
        xtype:'sharedconfigurationpanel',
        configurationId:rec.get('configurationId')
      }]
    });

    configurationWindow.show();
  },

  initComponent: function() {
    var self = this;
        
    var store = Ext.create('Ext.data.TreeStore', {
      proxy:{
        type: 'ajax',
        url: '/knitkit/erp_app/desktop/websites',
        timeout: 90000
      },
      root: {
        text: 'Websites',
        expanded: true
      },
      fields:[
      {
        name:'canAddMenuItems'
      },
      {
        name:'isWebsiteNavItem'
      },
      {
        name:'text'
      },
      {
        name:'iconCls'
      },
      {
        name:'leaf'
      },
      {
        name:'isSection'
      },
      {
        name:'isDocument'
      },
      {
        name:'contentInfo'
      },
      {
        name:'isHost'
      },
      {
        name:'isSecured'
      },
      {
        name:'url'
      },
      {
        name:'path'
      },
      {
        name:'inMenu'
      },
      {
        name:'isBlog'
      },
      {
        name:'hasLayout'
      },
      {
        name:'siteId'
      },
      {
        name:'type'
      },
      {
        name:'isWebsite'
      },
      {
        name:'name'
      },
      {
        name:'title'
      },
      {
        name:'subtitle'
      },
      {
        name:'email'
      },
      {
        name:'autoActivatePublication'
      },
      {
        name:'emailInquiries'
      },
      {
        name:'isHostRoot'
      },
      {
        name:'websiteHostId'
      },
      {
        name:'host'
      },
      {
        name:'websiteId'
      },
      {
        name:'isSectionRoot'
      },
      {
        name:'isWebsiteNav'
      },
      {
        name:'isMenuRoot'
      },
      {
        name:'linkToType'
      },
      {
        name:'linkedToId'
      },
      {
        name:'websiteNavItemId'
      },
      {
        name:'type'
      },
      {
        name:'siteName'
      },
      {
        name:'websiteNavId'
      },
      {
        name:'internal_identifier'
      },
      {
        name:'configurationId'
      },
      {
        name:'renderWithBaseLayout'
      }
      ],
      listeners:{
        'load':function(store, node, records){
          var websiteId = records[0].id.split('_')[1];
          var westRegion = Ext.ComponentQuery.query('#knitkitWestRegion').first();
          westRegion.selectWebsite(websiteId);
        }
      }
    });

    var pluginItems = [];

    if (currentUser.hasApplicationCapability('knitkit', {
      capability_type_iid:'drag_item',
      resource:'WebsiteTree'
    }))

    {
      pluginItems.push({
        ptype: 'treeviewdragdrop'
      });
    }
    
    var viewConfigItems = {
      markDirty: false,
      plugins: pluginItems,
      listeners:{
        'beforedrop':function(node, data, overModel, dropPosition,dropFunction,options){
          if(overModel.data['isWebsiteNavItem']){
            return true;
          }
          else if(overModel.data['isSection']){
            if(overModel.parentNode.data['isSectionRoot']){
              return true;
            }
          }
          else if (overModel.data['isDocument']){
            return true;
          }
          return false;
        },
        'drop':function(node, data, overModel, dropPosition, options){
          var positionArray = [];
          var counter = 0;
          var dropNode = data.records[0];

          if(dropNode.data['isWebsiteNavItem']){
            overModel.parentNode.eachChild(function(node){
              positionArray.push({
                id:node.data.websiteNavItemId,
                position:counter,
                klass:'WebsiteNavItem'
              });
              counter++;
            });
          }
          else{
            overModel.parentNode.eachChild(function(node){
              positionArray.push({
                id:node.data.id.split('_')[1],
                position:counter,
                klass:'WebsiteSection'
              });
              counter++;
            });
          }

          Ext.Ajax.request({
            url:'/knitkit/erp_app/desktop/position/update',
            method: 'PUT',
            jsonData:{
              position_array:positionArray
            },
            success: function(response) {
              var obj = Ext.decode(response.responseText);
              if(obj.success){

              }
              else{
                Ext.Msg.alert("Error", obj.message);
              }
            },
            failure: function(response) {
              Ext.Msg.alert('Error', 'Error saving positions.');
            }
          });
        }
      }
    };

    this.sitesTree = new Ext.tree.TreePanel({
      viewConfig:viewConfigItems,
      store:store,
      region: 'center',
      rootVisible:false,
      enableDD :true,
      listeners:{
        'itemclick':function(view, record, htmlItem, index, e){
          e.stopEvent();
          if(record.data['isWebsite']){
            self.selectWebsite(record.data.id.split('_')[1]);
          }
          else
          if(record.data['isSection']){
            self.getArticles(record);
          }
          else
          if(record.data['isHost']){
            var webNavigator = window.compassDesktop.getModule('web-navigator-win');
            webNavigator.createWindow(record.data['url']);
          }
          else
          if(record.data['isDocument']){
            self.initialConfig['centerRegion'].editContent(record.data['contentInfo'].title, record.data['contentInfo'].id, record.data['contentInfo'].body_html, record.data['siteId'], 'article');
          }
        },
        'itemcontextmenu':function(view, record, htmlItem, index, e){
          e.stopEvent();
          var items = [];

          if(!Compass.ErpApp.Utility.isBlank(record.data['url'])){
            items.push({
              text:'View In Web Navigator',
              iconCls:'icon-globe',
              listeners:{
                'click':function(){
                  var webNavigator = window.compassDesktop.getModule('web-navigator-win');
                  webNavigator.createWindow(record.data['url']);
                }
              }
            });
          }

          if(record.data['canAddMenuItems']){

            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'create',
              resource:'MenuItem'
            }))

            {
              items.push({
                text:'Add Menu Item',
                iconCls:'icon-add',
                handler:function(btn){
                  var addMenuItemWindow = Ext.create("Ext.window.Window",{
                    layout:'fit',
                    width:375,
                    title:'New Menu Item',
                    height:175,
                    plain: true,
                    buttonAlign:'center',
                    items: new Ext.FormPanel({
                      labelWidth: 50,
                      frame:false,
                      bodyStyle:'padding:5px 5px 0',
                      url:'/knitkit/erp_app/desktop/website_nav/add_menu_item',
                      defaults: {
                        width: 225
                      },
                      items: [
                      {
                        xtype:'textfield',
                        fieldLabel:'Title',
                        allowBlank:false,
                        name:'title'
                      },
                      {
                        xtype:'combo',
                        fieldLabel:'Link to',
                        name:'link_to',
                        id:'knitkit_nav_item_link_to',
                        allowBlank:false,
                        forceSelection:true,
                        editable:false,
                        autoSelect:true,
                        typeAhead: false,
                        mode: 'local',
                        triggerAction: 'all',
                        store:[
                        ['website_section','Section'],
                        ['url','Url']
                        ],
                        value:'website_section',
                        listeners:{
                          'change':function(combo, newValue, oldValue){
                            switch(newValue){
                              case 'website_section':
                                Ext.getCmp('knitkit_create_website_nav_item_section').show();
                                Ext.getCmp('knitkit_create_website_nav_item_url').hide();
                                break;
                              case 'url':
                                Ext.getCmp('knitkit_create_website_nav_item_section').hide();
                                Ext.getCmp('knitkit_create_website_nav_item_url').show();
                                break;
                            }
                          }
                        }
                      },
                      {
                        xtype:'combo',
                        id:'knitkit_create_website_nav_item_section',
                        hiddenName:'website_section_id',
                        name:'website_section_id',
                        width:300,
                        loadingText:'Retrieving Sections...',
                        store:Ext.create("Ext.data.Store",{
                          proxy:{
                            type:'ajax',
                            url:'/knitkit/erp_app/desktop/section/existing_sections',
                            reader:{
                              type:'json'
                            },
                            extraParams:{
                              website_id:record.data.websiteId
                            }
                          },
                          autoLoad:true,
                          fields:[
                          {
                            name:'id'
                          },
                          {
                            name:'title_permalink'

                          }
                          ]
                        }),
                        forceSelection:true,
                        editable:false,
                        fieldLabel:'Section',
                        autoSelect:true,
                        typeAhead: false,
                        mode: 'local',
                        displayField:'title_permalink',
                        valueField:'id',

                        triggerAction: 'all'
                      },
                      {
                        xtype:'textfield',
                        fieldLabel:'Url',
                        id:'knitkit_create_website_nav_item_url',
                        hidden:true,
                        name:'url'
                      },
                      {
                        xtype:'hidden',
                        name:'klass',
                        value: ((record.data['websiteNavId']) ? 'WebsiteNav' : 'WebsiteNavItem')
                      },
                      {
                        xtype:'hidden',
                        name:'id',
                        value:record.data['websiteNavId'] || record.data['websiteNavItemId']
                      }
                      ]
                    }),
                    buttons: [{
                      text:'Submit',
                      listeners:{
                        'click':function(button){
                          var window = button.findParentByType('window');
                          var formPanel = window.query('form')[0];
                          self.setWindowStatus('Creating menu item...');
                          formPanel.getForm().submit({
                            reset:true,
                            success:function(form, action){
                              self.clearWindowStatus();
                              var obj = Ext.decode(action.response.responseText);
                              if(obj.success){
                                record.appendChild(obj.node);
                              }
                              else{
                                Ext.Msg.alert("Error", obj.msg);
                              }
                            },
                            failure:function(form, action){
                              self.clearWindowStatus();
                              if(action.response == null){
                                Ext.Msg.alert("Error", 'Could not create menu item');
                              }
                              else{
                                var obj = Ext.decode(action.response.responseText);
                                Ext.Msg.alert("Error", obj.msg);
                              }

                            }
                          });
                        }
                      }
                    },{
                      text: 'Close',
                      handler: function(){
                        addMenuItemWindow.close();
                      }
                    }]
                  });
                  addMenuItemWindow.show();
                }
              });
            }
          }

          if(record.data['isDocument']){
						
            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'create',
              resource:'Section'
            }))
            {
              items.push({
                text:'Add Document',
                iconCls:'icon-add',
                listeners:{
                  'click':function(){
                    var addSectionWindow = Ext.create("Ext.window.Window",{
                      layout:'fit',
                      width:375,
                      title:'New Document Section',
                      plain: true,
                      buttonAlign:'center',
                      items: new Ext.FormPanel({
                        labelWidth: 110,
                        frame:false,
                        bodyStyle:'padding:5px 5px 0',
                        url:'/knitkit/erp_app/desktop/online_document_sections/new',
                        defaults: {
                          width: 225
                        },
                        items: [
                        {
                          xtype:'textfield',
                          fieldLabel:'Title',
                          allowBlank:false,
                          name:'title'
                        },
                        {
                          xtype:'textfield',
                          fieldLabel:'Unique Name',
                          allowBlank:true,
                          name:'internal_identifier'
                        },
                        {
                          xtype: 'combo',
                          forceSelection:true,
                          store: [
                          ['OnlineDocumentSection','Online Document Section'],
                          ],
                          value:'OnlineDocumentSection',
                          fieldLabel: 'Type',
                          name: 'type',
                          allowBlank: false,
                          triggerAction: 'all'
                        },
                        {
                          xtype: 'combo',
                          forceSelection: true,
                          store:[
                          ['Content', 'Content']
                          ],
                          value: 'Content',
                          fieldLabel: 'Document Type',
                          name: 'documenttype',
                          allowBlank: false,
                          triggerAction: 'all'
                        },
                        {
                          xtype:'radiogroup',
                          fieldLabel:'Display in menu?',
                          name:'in_menu',
                          columns:2,
                          items:[
                          {
                            boxLabel:'Yes',
                            name:'in_menu',
                            inputValue: 'yes',
                            checked:true
                          },

                          {
                            boxLabel:'No',
                            name:'in_menu',
                            inputValue: 'no'
                          }]
                        },
                        {
                          xtype:'hidden',
                          name:'website_section_id',
                          value:record.data.id.split('_')[1]
                        },
                        {
                          xtype:'hidden',
                          name:'website_id',
                          value:record.data.siteId
                        }
                        ]
                      }),
                      buttons: [{
                        text:'Submit',
                        listeners:{
                          'click':function(button){
                            var window = button.findParentByType('window');
                            var formPanel = window.query('.form')[0];
                            self.setWindowStatus('Creating document section...');
                            formPanel.getForm().submit({
                              reset:true,
                              success:function(form, action){
                                self.clearWindowStatus();
                                var obj = Ext.decode(action.response.responseText);
                                if(obj.success){
                                  record.appendChild(obj.node);
                                  self.initialConfig['centerRegion'].editContent(obj.documented_content.title, obj.documented_content.id, obj.documented_content.body_html, record.data.siteId, 'article');
                                }
                                else{
                                  Ext.Msg.alert("Error", obj.message);
                                }
                              },
                              failure:function(form, action){
                                self.clearWindowStatus();
                                var obj = Ext.decode(action.response.responseText);
                                if(obj.message){
                                  Ext.Msg.alert("Error", obj.message);
                                }
                                else{
                                  Ext.Msg.alert("Error", "Error creating document.");
                                }
                              }
                            });
                          }
                        }
                      },{
                        text: 'Close',
                        handler: function(){
                          addSectionWindow.close();
                        }
                      }]
                    });
                    addSectionWindow.show();
                  }
                }
              });
            }
						
            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'edit',
              resource:'Section'
            }))
            {
              items.push({
                text:'Update Document',
                iconCls:'icon-edit',
                listeners:{
                  'click':function(){
                    var updateSectionWindow = Ext.create("Ext.window.Window",{
                      layout:'fit',
                      width:375,
                      title:'Update Document Section',
                      plain: true,
                      buttonAlign:'center',
                      items: new Ext.FormPanel({
                        labelWidth: 110,
                        frame:false,
                        bodyStyle:'padding:5px 5px 0',
                        url:'/knitkit/erp_app/desktop/section/update',
                        defaults: {
                          width: 225
                        },
                        items: [
                        {
                          xtype:'textfield',
                          fieldLabel:'Title',
                          value:record.data.text,
                          name:'title'
                        },
                        {
                          xtype:'textfield',
                          fieldLabel:'Unique Name',
                          allowBlank:true,
                          name:'internal_identifier',
                          value:record.data.internal_identifier
                        },
                        {
                          xtype:'radiogroup',
                          fieldLabel:'Display in menu?',
                          name:'in_menu',
                          columns:2,
                          items:[
                          {
                            boxLabel:'Yes',
                            name:'in_menu',
                            inputValue: 'yes',
                            checked:record.data.inMenu
                          },

                          {
                            boxLabel:'No',
                            name:'in_menu',
                            inputValue: 'no',
                            checked:!record.data.inMenu
                          }]
                        },
                        {
                          xtype:'hidden',
                          name:'id',
                          value:record.data.id.split('_')[1]
                        }
                        ]
                      }),
                      buttons: [{
                        text:'Submit',
                        listeners:{
                          'click':function(button){
                            var window = button.findParentByType('window');
                            var formPanel = window.query('.form')[0];
                            self.setWindowStatus('Updating document section...');
                            formPanel.getForm().submit({
                              success:function(form, action){
                                self.clearWindowStatus();
                                var values = formPanel.getValues();
                                record.set('title',values.title);
                                record.set('internal_identifier',values.internal_identifier);
                                record.set("inMenu",(values.in_menu == 'yes'));
                                record.commit();
                                updateSectionWindow.close();
                              },
                              failure:function(form, action){
                                self.clearWindowStatus();
                                var obj =  Ext.decode(action.response.responseText);
                                Ext.Msg.alert("Error", obj.msg);
                              }
                            });
                          }
                        }
                      },{
                        text: 'Close',
                        handler: function(){
                          updateSectionWindow.close();
                        }
                      }]
                    });
                    updateSectionWindow.show();
                  }
                }
              });
            }
						
            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'delete',
              resource:'Section'
            }))
            {
              items.push({
                text:'Delete Document Section',
                iconCls:'icon-delete',
                listeners:{
                  'click':function(){
                    self.deleteSection(record);
                  }
                }
              });
            }
          }

          if(record.data['isSection']){
            items.push({
              text:'View Articles',
              iconCls:'icon-document',
              listeners:{
                'click':function(){
                  self.getArticles(record);
                }
              }
            });

            if(record.data.isSecured){
              if (currentUser.hasApplicationCapability('knitkit', {
                capability_type_iid:'unsecure',
                resource:'Section'
              }))

              {
                items.push({
                  text:'Unsecure',
                  iconCls:'icon-document',
                  listeners:{
                    'click':function(){
                      self.changeSecurityOnSection(record, false);
                    }
                  }
                });
              }
            }
            else{
              if (currentUser.hasApplicationCapability('knitkit', {
                capability_type_iid:'secure',
                resource:'Section'
              }))

              {
                items.push({
                  text:'Secure',
                  iconCls:'icon-document_lock',
                  listeners:{
                    'click':function(){
                      self.changeSecurityOnSection(record, true);
                    }
                  }
                });
              }
            }

            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'create',
              resource:'Section'
            }))

            {
              items.push({
                text:'Add Section',
                iconCls:'icon-add',
                listeners:{
                  'click':function(){
                    var addSectionWindow = Ext.create("Ext.window.Window",{
                      layout:'fit',
                      width:375,
                      title:'New Section',
                      plain: true,
                      buttonAlign:'center',
                      items: new Ext.FormPanel({
                        labelWidth: 110,
                        frame:false,
                        bodyStyle:'padding:5px 5px 0',
                        url:'/knitkit/erp_app/desktop/section/new',
                        defaults: {
                          width: 225
                        },
                        items: [
                        {
                          xtype:'textfield',
                          fieldLabel:'Title',
                          allowBlank:false,
                          name:'title'
                        },
                        {
                          xtype:'textfield',
                          fieldLabel:'Unique Name',
                          allowBlank:true,
                          name:'internal_identifier'
                        },
                        {
                          xtype: 'combo',
                          forceSelection:true,
                          store: [
                          ['Page','Page'],
                          ['Blog','Blog'],
                          ],
                          value:'Page',
                          fieldLabel: 'Type',
                          name: 'type',
                          allowBlank: false,
                          triggerAction: 'all'
                        },
                        {
                          xtype:'radiogroup',
                          fieldLabel:'Display in menu?',
                          name:'in_menu',
                          columns:2,
                          items:[
                          {
                            boxLabel:'Yes',
                            name:'in_menu',
                            inputValue: 'yes',
                            checked:true
                          },

                          {
                            boxLabel:'No',
                            name:'in_menu',
                            inputValue: 'no'
                          }]
                        },
                        {
                          xtype:'radiogroup',
                          fieldLabel:'Render with Base Layout?',
                          name:'render_with_base_layout',
                          columns:2,
                          items:[
                          {
                            boxLabel:'Yes',
                            name:'render_with_base_layout',
                            inputValue: 'yes',
                            checked:true
                          },

                          {
                            boxLabel:'No',
                            name:'render_with_base_layout',
                            inputValue: 'no'
                          }]
                        },
                        {
                          xtype:'hidden',
                          name:'website_section_id',
                          value:record.data.id.split('_')[1]
                        },
                        {
                          xtype:'hidden',
                          name:'website_id',
                          value:record.data.siteId
                        }
                        ]
                      }),
                      buttons: [{
                        text:'Submit',
                        listeners:{
                          'click':function(button){
                            var window = button.findParentByType('window');
                            var formPanel = window.query('.form')[0];
                            self.setWindowStatus('Creating section...');
                            formPanel.getForm().submit({
                              reset:true,
                              success:function(form, action){
                                self.clearWindowStatus();
                                var obj = Ext.decode(action.response.responseText);
                                if(obj.success){
                                  record.appendChild(obj.node);
                                  addSectionWindow.close();
                                }
                                else{
                                  Ext.Msg.alert("Error", obj.message);
                                }
                              },
                              failure:function(form, action){
                                self.clearWindowStatus();
                                var obj =  Ext.decode(action.response.responseText);
                                if(obj.message){
                                  Ext.Msg.alert("Error", obj.message);
                                }
                                else{
                                  Ext.Msg.alert("Error", "Error creating section.");
                                }
                              }
                            });
                          }
                        }
                      },{
                        text: 'Close',
                        handler: function(){
                          addSectionWindow.close();
                        }
                      }]
                    });
                    addSectionWindow.show();
                  }
                }
              });
            }

            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'edit',
              resource:'Section'
            }))

            {
              items.push({
                text:'Update Section',
                iconCls:'icon-edit',
                listeners:{
                  'click':function(){
                    var updateSectionWindow = Ext.create("Ext.window.Window",{
                      layout:'fit',
                      width:375,
                      title:'Update Section',
                      plain: true,
                      buttonAlign:'center',
                      items: new Ext.FormPanel({
                        labelWidth: 110,
                        frame:false,
                        bodyStyle:'padding:5px 5px 0',
                        url:'/knitkit/erp_app/desktop/section/update',
                        defaults: {
                          width: 225
                        },
                        items: [
                        {
                          xtype:'textfield',
                          fieldLabel:'Title',
                          value:record.data.text,
                          name:'title'
                        },
                        {
                          xtype:'textfield',
                          fieldLabel:'Unique Name',
                          allowBlank:true,
                          name:'internal_identifier',
                          value:record.data.internal_identifier
                        },
                        {
                          xtype:'radiogroup',
                          fieldLabel:'Display in menu?',
                          name:'in_menu',
                          columns:2,
                          items:[
                          {
                            boxLabel:'Yes',
                            name:'in_menu',
                            inputValue: 'yes',
                            checked:record.data.inMenu
                          },

                          {
                            boxLabel:'No',
                            name:'in_menu',
                            inputValue: 'no',
                            checked:!record.data.inMenu
                          }]
                        },
                        {
                          xtype:'radiogroup',
                          fieldLabel:'Render with Base Layout?',
                          name:'render_with_base_layout',
                          columns:2,
                          items:[
                          {
                            boxLabel:'Yes',
                            name:'render_with_base_layout',
                            inputValue: 'yes',
                            checked:record.data.renderWithBaseLayout
                          },

                          {
                            boxLabel:'No',
                            name:'render_with_base_layout',
                            inputValue: 'no',
                            checked:!record.data.renderWithBaseLayout
                          }]
                        },
                        {
                          xtype: 'displayfield',
                          fieldLabel: 'Path',
                          name: 'path',
                          value: record.data.path
                        },
                        {
                          xtype:'hidden',
                          name:'id',
                          value:record.data.id.split('_')[1]
                        }
                        ]
                      }),
                      buttons: [{
                        text:'Submit',
                        listeners:{
                          'click':function(button){
                            var window = button.findParentByType('window');
                            var formPanel = window.query('.form')[0];
                            self.setWindowStatus('Updating section...');
                            formPanel.getForm().submit({
                              success:function(form, action){
                                self.clearWindowStatus();
                                var values = formPanel.getValues();
                                record.set('title',values.title);
                                record.set('text',values.title);
                                record.set('internal_identifier',values.internal_identifier);
                                record.set("inMenu",(values.in_menu == 'yes'));
                                record.set("renderWithBaseLayout",(values.render_with_base_layout == 'yes'));
                                record.commit();
                                updateSectionWindow.close();
                              },
                              failure:function(form, action){
                                self.clearWindowStatus();
                                var obj =  Ext.decode(action.response.responseText);
                                Ext.Msg.alert("Error", obj.msg);
                              }
                            });
                          }
                        }
                      },{
                        text: 'Close',
                        handler: function(){
                          updateSectionWindow.close();
                        }
                      }]
                    });
                    updateSectionWindow.show();
                  }
                }
              });
            }

            //no layouts for blogs.
            if(Compass.ErpApp.Utility.isBlank(record.data['isBlog']) && record.data['hasLayout']){
              if (currentUser.hasApplicationCapability('knitkit', {
                capability_type_iid:'edit',
                resource:'Layout'
              }))

              {
                items.push({
                  text:'Edit Layout',
                  iconCls:'icon-edit',
                  listeners:{
                    'click':function(){
                      self.editSectionLayout(record.data.text, record.data.id.split('_')[1], record.data.siteId);
                    }
                  }
                });
              }
            }
            else
            if(Compass.ErpApp.Utility.isBlank(record.data['isBlog'])){
              if (currentUser.hasApplicationCapability('knitkit', {
                capability_type_iid:'create',
                resource:'Layout'
              }))

              {
                items.push({
                  text:'Add Layout',
                  iconCls:'icon-add',
                  listeners:{
                    'click':function(){
                      var sectionId = record.data.id.split('_')[1];
                      Ext.Ajax.request({
                        url: '/knitkit/erp_app/desktop/section/add_layout',
                        method: 'POST',
                        params:{
                          id:sectionId
                        },
                        success: function(response) {
                          var obj =  Ext.decode(response.responseText);
                          if(obj.success){
                            record.data.hasLayout = true;
                            self.editSectionLayout(record.data.text, sectionId, record.data.siteId);
                          }
                          else
                          {
                            Ext.Msg.alert('Status', obj.message);
                          }
                        },
                        failure: function(response) {
                          Ext.Msg.alert('Status', 'Error adding layout.');
                        }
                      });
                    }
                  }
                });
              }
            }

            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'delete',
              resource:'Section'
            }))

            {
              items.push({
                text:'Delete ' + record.data["type"],
                iconCls:'icon-delete',
                listeners:{
                  'click':function(){
                    self.deleteSection(record);
                  }
                }
              });
            }
          }
          else
          if(record.data['isWebsite']){
            items.push({
              text:'Configure',
              iconCls:'icon-gear',
              listeners:{
                'click':function(){
                  self.updateWebsiteConfiguration(record);
                }
              }
            });

            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'publish',
              resource:'Website'
            }))

            {
              items.push({
                text:'Publish',
                iconCls:'icon-document_up',
                listeners:{
                  'click':function(){
                    self.publish(record);
                  }
                }
              });
            }

            items.push({
              text:'Publications',
              iconCls:'icon-documents',
              listeners:{
                'click':function(){
                  self.getPublications(record);
                }
              }
            });

            items.push({
              text:'View Inquiries',
              iconCls:'icon-document',
              listeners:{
                'click':function(){
                  self.initialConfig['centerRegion'].viewWebsiteInquiries(record.data.id.split('_')[1], record.data.title);
                }
              }
            });

            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'edit',
              resource:'Website'
            }))

            {
              items.push({
                text:'Update Website',
                iconCls:'icon-edit',
                listeners:{
                  'click':function(){
                    var editWebsiteWindow = Ext.create("Ext.window.Window",{
                      title:'Update Website',
                      plain: true,
                      buttonAlign:'center',
                      items: Ext.create("Ext.form.Panel",{
                        labelWidth: 110,
                        frame:false,
                        bodyStyle:'padding:5px 5px 0',
                        url:'/knitkit/erp_app/desktop/site/update',
                        defaults: {
                          width: 225
                        },
                        items: [
                        {
                          xtype:'textfield',
                          fieldLabel:'Name',
                          allowBlank:false,
                          name:'name',
                          value:record.data['name']
                        },
                        {
                          xtype:'textfield',
                          fieldLabel:'Title',
                          id:'knitkitUpdateSiteTitle',
                          allowBlank:false,
                          name:'title',
                          value:record.data['title']
                        },
                        {
                          xtype:'textfield',
                          fieldLabel:'Sub Title',
                          allowBlank:true,
                          name:'subtitle',
                          value:record.data['subtitle']

                        },
                        {
                          xtype:'textfield',
                          fieldLabel:'Email',
                          allowBlank:false,
                          name:'email',
                          value:record.data['email']
                        },
                        {
                          xtype:'radiogroup',
                          fieldLabel:'Auto Activate Publication?',
                          name:'auto_activate_publication',
                          id:'knitkitAutoActivatePublication',
                          columns:2,
                          items:[
                          {
                            boxLabel:'Yes',
                            name:'auto_activate_publication',
                            inputValue: 'yes',
                            checked:record.data['autoActivatePublication']
                          },
                          {
                            boxLabel:'No',
                            name:'auto_activate_publication',
                            inputValue: 'no',
                            checked:!record.data['autoActivatePublication']
                          }]
                        },
                        {
                          xtype:'radiogroup',
                          fieldLabel:'Email Inquiries?',
                          name:'email_inquiries',
                          id:'knitkitEmailInquiries',
                          columns:2,
                          items:[
                          {
                            boxLabel:'Yes',
                            name:'email_inquiries',
                            inputValue: 'yes',
                            checked:record.data['emailInquiries'],
                            listeners:{
                              scope:this,
                              'check':function(checkbox, checked){
                                if(checked)
                                {
                                  Ext.Msg.alert("Warning","ActionMailer must be setup to send emails");
                                }
                              }
                            }
                          },

                          {
                            boxLabel:'No',
                            name:'email_inquiries',
                            inputValue: 'no',
                            checked:!record.data['emailInquiries']
                          }]
                        },
                        {
                          xtype:'hidden',
                          name:'id',
                          value:record.data.id.split('_')[1]
                        }
                        ]
                      }),
                      buttons: [{
                        text:'Submit',
                        listeners:{
                          'click':function(button){
                            var window = button.findParentByType('window');
                            var formPanel = window.query('form')[0];
                            self.setWindowStatus('Updating website...');
                            formPanel.getForm().submit({
                              success:function(form, action){
                                self.clearWindowStatus();
                                record.data['name'] = form.findField('name').getValue();
                                record.data['title'] = form.findField('title').getValue();
                                record.data['subtitle'] = form.findField('subtitle').getValue();
                                record.data['email'] = form.findField('email').getValue();
                                //node.setText(node.attributes['title']);
                                record.data.emailInquiries = form.findField('knitkitEmailInquiries').getValue().inputValue == 'yes';
                                record.data.autoActivatePublication = form.findField('knitkitAutoActivatePublication').getValue().inputValue == 'yes';
                                editWebsiteWindow.close();
                              },
                              failure:function(form, action){
                                self.clearWindowStatus();
                                Ext.Msg.alert("Error", "Error updating website");
                              }
                            });
                          }
                        }
                      },{
                        text: 'Close',
                        handler: function(){
                          editWebsiteWindow.close();
                        }
                      }]
                    });
                    editWebsiteWindow.show();
                  }
                }
              });
            }

            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'delete',
              resource:'Website'
            }))

            {
              items.push({
                text:'Delete',
                iconCls:'icon-delete',
                listeners:{
                  'click':function(){
                    self.deleteSite(record);
                  }
                }
              });
            }

            items.push({
              text:'Export',
              iconCls:'icon-document_out',
              listeners:{
                'click':function(){
                  self.exportSite(record.data.id.split('_')[1]);
                }
              }
            });
          }
          else
          if(record.data['isHostRoot']){
            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'create',
              resource:'Host'
            }))

            {
              items.push({
                text:'Add Host',
                iconCls:'icon-add',
                listeners:{
                  'click':function(){
                    var addHostWindow = Ext.create("Ext.window.Window",{
                      layout:'fit',
                      width:310,
                      title:'Add Host',
                      height:100,
                      plain: true,
                      buttonAlign:'center',
                      items: Ext.create("Ext.form.Panel",{
                        labelWidth: 50,
                        frame:false,
                        bodyStyle:'padding:5px 5px 0',
                        width: 425,
                        url:'/knitkit/erp_app/desktop/site/add_host',
                        defaults: {
                          width: 225
                        },
                        items:[
                        {
                          xtype:'textfield',
                          fieldLabel:'Host',
                          name:'host',
                          allowBlank:false
                        },
                        {
                          xtype:'hidden',
                          name:'id',
                          value:record.data.websiteId
                        }
                        ]
                      }),
                      buttons: [{
                        text:'Submit',
                        listeners:{
                          'click':function(button){
                            var window = button.findParentByType('window');
                            var formPanel = window.query('form')[0];
                            self.setWindowStatus('Adding Host...');
                            formPanel.getForm().submit({
                              reset:true,
                              success:function(form, action){
                                self.clearWindowStatus();
                                var obj =  Ext.decode(action.response.responseText);
                                if(obj.success){
                                  addHostWindow.close();
                                  record.appendChild(obj.node);
                                }
                                else{
                                  Ext.Msg.alert("Error", obj.msg);
                                }
                              },
                              failure:function(form, action){
                                self.clearWindowStatus();
                                Ext.Msg.alert("Error", "Error adding Host");
                              }
                            });
                          }
                        }
                      },{
                        text: 'Close',
                        handler: function(){
                          addHostWindow.close();
                        }
                      }]
                    });
                    addHostWindow.show();
                  }
                }
              });
            }
          }
          else
          if(record.data['isHost']){
            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'edit',
              resource:'Host'
            }))

            {
              items.push({
                text:'Update',
                iconCls:'icon-edit',
                listeners:{
                  'click':function(){
                    var updateHostWindow = Ext.create("Ext.window.Window",{
                      layout:'fit',
                      width:310,
                      title:'Update Host',
                      height:100,
                      plain: true,
                      buttonAlign:'center',
                      items: Ext.create("Ext.form.Panel",{
                        labelWidth: 50,
                        frame:false,
                        bodyStyle:'padding:5px 5px 0',
                        width: 425,
                        url:'/knitkit/erp_app/desktop/site/update_host',
                        defaults: {
                          width: 225
                        },
                        items:[
                        {
                          xtype:'textfield',
                          fieldLabel:'Host',
                          id:'knitkitUpdateWebsiteHostHost',
                          name:'host',
                          value:record.data.host,
                          allowBlank:false
                        },
                        {
                          xtype:'hidden',
                          name:'id',
                          value:record.data.websiteHostId
                        }
                        ]
                      }),
                      buttons: [{
                        text:'Submit',
                        listeners:{
                          'click':function(button){
                            var window = button.findParentByType('window');
                            var formPanel = window.query('form')[0];
                            self.setWindowStatus('Updating Host...');
                            formPanel.getForm().submit({
                              reset:false,
                              success:function(form, action){
                                self.clearWindowStatus();
                                var obj =  Ext.decode(action.response.responseText);
                                if(obj.success){
                                  var newHost = Ext.getCmp('knitkitUpdateWebsiteHostHost').getValue();
                                  record.set('host',newHost);
                                  record.set('text',newHost);
                                  record.commit();
                                  updateHostWindow.close();
                                }
                                else{
                                  Ext.Msg.alert("Error", obj.msg);
                                }
                              },
                              failure:function(form, action){
                                self.clearWindowStatus();
                                Ext.Msg.alert("Error", "Error updating Host");
                              }
                            });
                          }
                        }
                      },{
                        text: 'Close',
                        handler: function(){
                          updateHostWindow.close();
                        }
                      }]
                    });
                    updateHostWindow.show();
                  }
                }
              });
            }

            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'delete',
              resource:'Host'
            }))

            {
              items.push({
                text:'Delete',
                iconCls:'icon-delete',
                listeners:{
                  'click':function(){
                    Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this Host?', function(btn){
                      if(btn == 'no'){
                        return false;
                      }
                      else
                      if(btn == 'yes')
                      {
                        self.setWindowStatus('Deleting Host...');
                        Ext.Ajax.request({
                          url: '/knitkit/erp_app/desktop/site/delete_host',
                          method: 'POST',
                          params:{
                            id:record.data.websiteHostId
                          },
                          success: function(response) {
                            self.clearWindowStatus();
                            var obj = Ext.decode(response.responseText);
                            if(obj.success){
                              record.remove(true);
                            }
                            else{
                              Ext.Msg.alert('Error', 'Error deleting Host');
                            }
                          },
                          failure: function(response) {
                            self.clearWindowStatus();
                            Ext.Msg.alert('Error', 'Error deleting Host');
                          }
                        });
                      }
                    });
                  }
                }
              });
            }
          }
          else if(record.data['isSectionRoot']){
            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'create',
              resource:'Section'
            }))

            {
              items.push({
                text:'Add Section',
                iconCls:'icon-add',
                listeners:{
                  'click':function(){
                    var addSectionWindow = Ext.create("Ext.window.Window",{
                      layout:'fit',
                      width:375,
                      title:'New Section',
                      plain: true,
                      buttonAlign:'center',
                      items: Ext.create("Ext.form.Panel",{
                        labelWidth: 110,
                        frame:false,
                        bodyStyle:'padding:5px 5px 0',
                        url:'/knitkit/erp_app/desktop/section/new',
                        defaults: {
                          width: 225
                        },
                        items: [
                        {
                          xtype:'textfield',
                          fieldLabel:'Title',
                          allowBlank:false,
                          name:'title'
                        },
                        {
                          xtype:'textfield',
                          fieldLabel:'Unique Name',
                          allowBlank:true,
                          name:'internal_identifier'
                        },
                        {
                          xtype: 'combo',
                          forceSelection:true,
                          store: [
                          ['Page','Page'],
                          ['Blog','Blog'],
                          ['OnlineDocumentSection', 'Online Document Section']
                          ],
                          value:'Page',
                          fieldLabel: 'Type',
                          name: 'type',
                          allowBlank: false,
                          triggerAction: 'all'
                        },
                        {
                          xtype:'radiogroup',
                          fieldLabel:'Display in menu?',
                          name:'in_menu',
                          columns:2,
                          items:[
                          {
                            boxLabel:'Yes',
                            name:'in_menu',
                            inputValue: 'yes',
                            checked:true
                          },

                          {
                            boxLabel:'No',
                            name:'in_menu',
                            inputValue: 'no'
                          }]
                        },
                        {
                          xtype:'radiogroup',
                          fieldLabel:'Render with Base Layout?',
                          name:'render_with_base_layout',
                          columns:2,
                          items:[
                          {
                            boxLabel:'Yes',
                            name:'render_with_base_layout',
                            inputValue: 'yes',
                            checked:true
                          },

                          {
                            boxLabel:'No',
                            name:'render_with_base_layout',
                            inputValue: 'no'
                          }]
                        },
                        {
                          xtype:'hidden',
                          name:'website_id',
                          value:record.data.websiteId
                        }
                        ]
                      }),
                      buttons: [{
                        text:'Submit',
                        listeners:{
                          'click':function(button){
                            var window = button.findParentByType('window');
                            var formPanel = window.query('form')[0];
                            self.setWindowStatus('Creating section...');
                            formPanel.getForm().submit({
                              reset:true,
                              success:function(form, action){
                                self.clearWindowStatus();
                                var obj = Ext.decode(action.response.responseText);
                                if(obj.success){
                                  record.appendChild(obj.node);
                                  addSectionWindow.close();
                                }
                                else{
                                  Ext.Msg.alert("Error", obj.msg);
                                }
                              },
                              failure:function(form, action){
                                self.clearWindowStatus();
                                var obj = Ext.decode(action.response.responseText);
                                if(obj.message){
                                  Ext.Msg.alert("Error", obj.message);
                                }
                                else{
                                  Ext.Msg.alert("Error", "Error creating section.");
                                }
                              }
                            });
                          }
                        }
                      },{
                        text: 'Close',
                        handler: function(){
                          addSectionWindow.close();
                        }
                      }]
                    });
                    addSectionWindow.show();
                  }
                }
              });
            }
          }
          else
          if(record.data['isMenuRoot']){
            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'create',
              resource:'Menu'
            }))

            {
              items.push({
                text:'Add Menu',
                iconCls:'icon-add',
                handler:function(btn){
                  var addMenuWindow = Ext.create("Ext.window.Window",{
                    layout:'fit',
                    width:375,
                    title:'New Menu',
                    height:100,
                    plain: true,
                    buttonAlign:'center',
                    items: Ext.create("Ext.form.Panel",{
                      labelWidth: 50,
                      frame:false,
                      bodyStyle:'padding:5px 5px 0',
                      url:'/knitkit/erp_app/desktop/website_nav/new',
                      defaults: {
                        width: 225
                      },
                      items: [
                      {
                        xtype:'textfield',
                        fieldLabel:'name',
                        allowBlank:false,
                        name:'name'
                      },
                      {
                        xtype:'hidden',
                        name:'website_id',
                        value:record.data.websiteId
                      }
                      ]
                    }),
                    buttons: [{
                      text:'Submit',
                      listeners:{
                        'click':function(button){
                          var window = button.findParentByType('window');
                          var formPanel = window.query('form')[0];
                          self.setWindowStatus('Creating menu...');
                          formPanel.getForm().submit({
                            reset:true,
                            success:function(form, action){
                              self.clearWindowStatus();
                              var obj = Ext.decode(action.response.responseText);
                              if(obj.success){
                                record.appendChild(obj.node);
                              }
                              else{
                                Ext.Msg.alert("Error", obj.msg);
                              }
                            },
                            failure:function(form, action){
                              self.clearWindowStatus();
                              var obj = Ext.decode(action.response.responseText);
                              Ext.Msg.alert("Error", obj.msg);
                            }
                          });
                        }
                      }
                    },{
                      text: 'Close',
                      handler: function(){
                        addMenuWindow.close();
                      }
                    }]
                  });
                  addMenuWindow.show();
                }
              });
            }
          }
          else
          if(record.data['isWebsiteNav']){
            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'edit',
              resource:'Menu'
            }))

            {
              items.push({
                text:'Update',
                iconCls:'icon-edit',
                handler:function(btn){
                  var updateMenuWindow = Ext.create("Ext.window.Window",{
                    layout:'fit',
                    width:375,
                    title:'Update Menu',
                    height:100,
                    plain: true,
                    buttonAlign:'center',
                    items: new Ext.FormPanel({
                      labelWidth: 50,
                      frame:false,
                      bodyStyle:'padding:5px 5px 0',
                      url:'/knitkit/erp_app/desktop/website_nav/update',
                      defaults: {
                        width: 225
                      },
                      items: [
                      {
                        xtype:'textfield',
                        fieldLabel:'Name',
                        value:record.data.text,
                        id:'knitkit_website_nav_update_name',
                        allowBlank:false,
                        name:'name'
                      },
                      {
                        xtype:'hidden',
                        name:'website_nav_id',
                        value:record.data.websiteNavId
                      }
                      ]
                    }),
                    buttons: [{
                      text:'Submit',
                      listeners:{
                        'click':function(button){
                          var window = button.findParentByType('window');
                          var formPanel = window.query('form')[0];
                          self.setWindowStatus('Creating menu...');
                          formPanel.getForm().submit({
                            reset:false,
                            success:function(form, action){
                              self.clearWindowStatus();
                              var obj = Ext.decode(action.response.responseText);
                              if(obj.success){
                                var newText = Ext.getCmp('knitkit_website_nav_update_name').getValue();
                                record.set('text',newText);
                                record.commit();
                              }
                              else{
                                Ext.Msg.alert("Error", obj.msg);
                              }
                            },
                            failure:function(form, action){
                              self.clearWindowStatus();
                              var obj = Ext.decode(action.response.responseText);
                              Ext.Msg.alert("Error", obj.msg);
                            }
                          });
                        }
                      }
                    },{
                      text: 'Close',
                      handler: function(){
                        updateMenuWindow.close();
                      }
                    }]
                  });
                  updateMenuWindow.show();
                }
              });
            }

            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'delete',
              resource:'Menu'
            }))

            {
              items.push({
                text:'Delete',
                iconCls:'icon-delete',
                handler:function(btn){
                  Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this menu?', function(btn){
                    if(btn == 'no'){
                      return false;
                    }
                    else
                    if(btn == 'yes')
                    {
                      self.setWindowStatus('Deleting menu...');
                      Ext.Ajax.request({
                        url: '/knitkit/erp_app/desktop/website_nav/delete',
                        method: 'POST',
                        params:{
                          id:record.data.websiteNavId
                        },
                        success: function(response) {
                          self.clearWindowStatus();
                          var obj = Ext.decode(response.responseText);
                          if(obj.success){
                            record.remove(true);
                          }
                          else{
                            Ext.Msg.alert('Error', 'Error deleting menu');
                          }
                        },
                        failure: function(response) {
                          self.clearWindowStatus();
                          Ext.Msg.alert('Error', 'Error deleting menu');
                        }
                      });
                    }
                  });
                }
              });
            }
          }
          else
          if(record.data['isWebsiteNavItem'])
          {
            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'edit',
              resource:'MenuItem'
            }))

            {
              items.push({
                text:'Update Menu Item',
                iconCls:'icon-edit',
                handler:function(btn){
                  var addMenuItemWindow = Ext.create("Ext.window.Window",{
                    layout:'fit',
                    width:375,
                    title:'Update Menu Item',
                    height:175,
                    plain: true,
                    buttonAlign:'center',
                    items: new Ext.FormPanel({
                      labelWidth: 50,
                      frame:false,
                      bodyStyle:'padding:5px 5px 0',
                      url:'/knitkit/erp_app/desktop/website_nav/update_menu_item',
                      defaults: {
                        width: 225
                      },
                      items: [
                      {
                        xtype:'textfield',
                        fieldLabel:'Title',
                        value:record.data.text,
                        allowBlank:false,
                        name:'title'
                      },
                      {
                        xtype:'combo',
                        fieldLabel:'Link to',
                        name:'link_to',
                        id:'knitkit_nav_item_link_to',
                        allowBlank:false,
                        forceSelection:true,
                        editable:false,
                        autoSelect:true,
                        typeAhead: false,
                        mode: 'local',
                        triggerAction: 'all',
                        store:[
                        ['website_section','Section'],
                        //['article','Article'],
                        ['url','Url']

                        ],
                        value:record.data.linkToType,
                        listeners:{
                          'change':function(combo, newValue, oldValue){
                            switch(newValue){
                              case 'website_section':
                                Ext.getCmp('knitkit_website_nav_item_section').show();
                                //Ext.getCmp('knitkit_website_nav_item_article').hide();
                                Ext.getCmp('knitkit_website_nav_item_url').hide();
                                break;
                              case 'article':
                                Ext.getCmp('knitkit_website_nav_item_section').hide();
                                //Ext.getCmp('knitkit_website_nav_item_article').show();
                                Ext.getCmp('knitkit_website_nav_item_url').hide();
                                break;
                              case 'url':
                                Ext.getCmp('knitkit_website_nav_item_section').hide();
                                //Ext.getCmp('knitkit_website_nav_item_article').hide();
                                Ext.getCmp('knitkit_website_nav_item_url').show();
                                break;
                            }
                          }
                        }
                      },
                      {
                        xtype:'combo',
                        width:300,
                        id:'knitkit_website_nav_item_section',
                        hiddenName:'website_section_id',
                        name:'website_section_id',
                        loadingText:'Retrieving Sections...',
                        store:Ext.create("Ext.data.Store",{
                          proxy:{
                            type:'ajax',
                            url:'/knitkit/erp_app/desktop/section/existing_sections',
                            reader:{
                              type:'json'
                            },
                            extraParams:{
                              website_id:record.data.websiteId
                            }
                          },
                          autoLoad:true,
                          fields:[
                          {
                            name:'id'
                          },
                          {
                            name:'title_permalink'

                          }
                          ],
                          listeners:{
                            'load':function(store, records, options){
                              Ext.getCmp('knitkit_website_nav_item_section').setValue(record.data.linkedToId);
                            }
                          }
                        }),
                        forceSelection:true,
                        editable:false,
                        fieldLabel:'Section',
                        autoSelect:true,
                        typeAhead: false,
                        queryMode: 'local',
                        displayField:'title_permalink',
                        valueField:'id',
                        hidden:(record.data.linkToType != 'website_section' && record.data.linkToType != 'article')
                      },
                      {
                        xtype:'textfield',
                        fieldLabel:'Url',
                        value:record.data.url,
                        id:'knitkit_website_nav_item_url',
                        hidden:(record.data.linkToType == 'website_section' || record.data.linkToType == 'article'),
                        name:'url'
                      },
                      {
                        xtype:'hidden',
                        name:'website_nav_item_id',
                        value:record.data.websiteNavItemId
                      }
                      ]
                    }),
                    buttons: [{
                      text:'Submit',
                      listeners:{
                        'click':function(button){
                          var window = button.findParentByType('window');
                          var formPanel = window.query('form')[0];
                          self.setWindowStatus('Updating menu item...');
                          formPanel.getForm().submit({
                            reset:false,
                            success:function(form, action){
                              self.clearWindowStatus();
                              var obj = Ext.decode(action.response.responseText);
                              if(obj.success){
                                record.data.linkedToId = obj.linkedToId;
                                record.data.linkToType = obj.linkToType;
                                record.data.url = obj.url;
                              //node.getUI().getTextEl().innerHTML = obj.title;
                              }
                              else{
                                Ext.Msg.alert("Error", obj.msg);
                              }
                            },
                            failure:function(form, action){
                              self.clearWindowStatus();
                              if(action.response == null){
                                Ext.Msg.alert("Error", 'Could not create menu item');
                              }
                              else{
                                var obj = Ext.decode(action.response.responseText);
                                Ext.Msg.alert("Error", obj.msg);
                              }

                            }
                          });
                        }
                      }
                    },{
                      text: 'Close',
                      handler: function(){
                        addMenuItemWindow.close();
                      }
                    }]
                  });
                  addMenuItemWindow.show();
                }
              });
            }

            if(record.data.isSecured){
              if (currentUser.hasApplicationCapability('knitkit', {
                capability_type_iid:'unsecure',
                resource:'MenuItem'
              }))

              {
                items.push({
                  text:'Unsecure',
                  iconCls:'icon-document',
                  listeners:{
                    'click':function(){
                      self.changeSecurityOnMenuItem(record, false);
                    }
                  }
                });
              }
            }
            else{
              if (currentUser.hasApplicationCapability('knitkit', {
                capability_type_iid:'secure',
                resource:'MenuItem'
              }))

              {
                items.push({
                  text:'Secure',
                  iconCls:'icon-document_lock',
                  listeners:{
                    'click':function(){
                      self.changeSecurityOnMenuItem(record, true);
                    }
                  }
                });
              }
            }

            if (currentUser.hasApplicationCapability('knitkit', {
              capability_type_iid:'delete',
              resource:'MenuItem'
            }))

            {
              items.push({
                text:'Delete',
                iconCls:'icon-delete',
                handler:function(btn){
                  Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this menu item?', function(btn){
                    if(btn == 'no'){
                      return false;
                    }
                    else
                    if(btn == 'yes')
                    {
                      self.setWindowStatus('Deleting menu item...');
                      Ext.Ajax.request({
                        url: '/knitkit/erp_app/desktop/website_nav/delete_menu_item',
                        method: 'POST',
                        params:{
                          id:record.data.websiteNavItemId
                        },
                        success: function(response) {
                          self.clearWindowStatus();
                          var obj = Ext.decode(response.responseText);
                          if(obj.success){
                            record.remove(true);
                          }
                          else{
                            Ext.Msg.alert('Error', 'Error deleting menu item');
                          }
                        },
                        failure: function(response) {
                          self.clearWindowStatus();
                          Ext.Msg.alert('Error', 'Error deleting menu item');
                        }
                      });
                    }
                  });
                }
              });
            }
          }
          if (items.length !=0){
            var contextMenu = Ext.create("Ext.menu.Menu",{
              items:items
            });
            contextMenu.showAt(e.xy);
          }
        }
      }
    });

    this.contentsCardPanel = new Ext.Panel({
      layout:'card',
      region:'south',
      autoDestroy:true,
      split:true,
      height:300,
      collapsible:false
    });

    var tbarItems = [];

    if (currentUser.hasApplicationCapability('knitkit', {
      capability_type_iid:'create',
      resource:'Website'
    }))
    {
      tbarItems.push({
        text:'New Website',
        iconCls:'icon-add',
        handler:function(btn){
          var addWebsiteWindow = Ext.create("Ext.window.Window",{
            title:'New Website',
            plain: true,
            buttonAlign:'center',
            items: new Ext.FormPanel({
              labelWidth: 110,
              frame:false,
              bodyStyle:'padding:5px 5px 0',
              url:'/knitkit/erp_app/desktop/site/new',
              defaults: {
                width: 225
              },
              items: [
              {
                xtype:'textfield',
                fieldLabel:'Name',
                allowBlank:false,
                name:'name'
              },
              {
                xtype:'textfield',
                fieldLabel:'Host',
                allowBlank:false,
                name:'host'
              },
              {
                xtype:'textfield',
                fieldLabel:'Title',
                allowBlank:false,
                name:'title'
              },
              {
                xtype:'textfield',
                fieldLabel:'Sub Title',
                allowBlank:true,
                name:'subtitle'
              },
              {
                xtype:'textfield',
                fieldLabel:'Email',
                allowBlank:false,
                name:'email'
              },
              {
                xtype:'radiogroup',
                fieldLabel:'Auto Activate Publication?',
                name:'auto_activate_publication',
                columns:2,
                items:[
                {
                  boxLabel:'Yes',
                  name:'auto_activate_publication',
                  inputValue: 'yes'
                },
                {
                  boxLabel:'No',
                  name:'auto_activate_publication',
                  inputValue: 'no',
                  checked:true
                }]
              },
              {
                xtype:'radiogroup',
                fieldLabel:'Email Inquiries',
                name:'email_inquiries',
                columns:2,
                items:[
                {
                  boxLabel:'Yes',
                  name:'email_inquiries',
                  inputValue: 'yes',
                  checked:false,
                  listeners:{
                    scope:this,
                    'check':function(checkbox, checked){
                      if(checked)
                      {
                        Ext.Msg.alert("Warning","ActionMailer must be setup to send emails");
                      }
                    }
                  }
                },
                {
                  boxLabel:'No',
                  name:'email_inquiries',
                  inputValue: 'no',
                  checked:true
                }
                ]
              }
              ]
            }),
            buttons: [{
              text:'Submit',
              listeners:{
                'click':function(button){
                  var window = button.findParentByType('window');
                  var formPanel = window.query('.form')[0];
                  self.setWindowStatus('Creating website...');
                  formPanel.getForm().submit({
                    success:function(form, action){
                      self.clearWindowStatus();
                      var obj = Ext.decode(action.response.responseText);
                      if(obj.success){
                        self.sitesTree.getStore().load();
                        addWebsiteWindow.close();
                      }
                    },
                    failure:function(form, action){
                      self.clearWindowStatus();
                      Ext.Msg.alert("Error", "Error creating website");
                    }
                  });
                }
              }
            },{
              text: 'Close',
              handler: function(){
                addWebsiteWindow.close();
              }
            }]
          });
          addWebsiteWindow.show();
        }
      }
      );
    }

    if (currentUser.hasApplicationCapability('knitkit', {
      capability_type_iid:'import',
      resource:'Website'
    }))
    {
      tbarItems.push({
        text:'Import Website',
        iconCls:'icon-globe',
        handler:function(btn){
          var importWebsiteWindow = Ext.create("Ext.window.Window",{
            layout:'fit',
            width:375,
            title:'Import Website',
            height:100,
            plain: true,
            buttonAlign:'center',
            items: new Ext.FormPanel({
              labelWidth: 110,
              frame:false,
              fileUpload: true,
              bodyStyle:'padding:5px 5px 0',
              url:'/knitkit/erp_app/desktop/site/import',
              defaults: {
                width: 225
              },
              items: [
              {
                xtype:'fileuploadfield',
                fieldLabel:'Upload Website',
                buttonText:'Upload',
                buttonOnly:false,
                allowBlank:false,
                name:'website_data'
              }
              ]
            }),
            buttons: [{
              text:'Submit',
              listeners:{
                'click':function(button){
                  var window = button.findParentByType('window');
                  var formPanel = window.query('form')[0];
                  self.setWindowStatus('Importing website...');
                  formPanel.getForm().submit({
                    success:function(form, action){
                      self.clearWindowStatus();
                      var obj =  Ext.decode(action.response.responseText);
                      if(obj.success){
                        self.sitesTree.getStore().load();
                        importWebsiteWindow.close();
                      }
                      else{
                        Ext.Msg.alert("Error", obj.message);
                      }
                    },
                    failure:function(form, action){
                      self.clearWindowStatus();
                      var obj =  Ext.decode(action.response.responseText);
                      if(obj != null){
                        Ext.Msg.alert("Error", obj.message);
                      }
                      else{
                        Ext.Msg.alert("Error", "Error importing website");
                      }
                    }
                  });
                }
              }
            },{
              text: 'Close',
              handler: function(){
                importWebsiteWindow.close();
              }
            }]
          });
          importWebsiteWindow.show();
        }
      });
    }

    var layout = new Ext.Panel({
      layout: 'border',
      autoDestroy:true,
      title:'Websites',
      items: [this.sitesTree,this.contentsCardPanel],
      tbar:{
        items:tbarItems
      }
    });

    if (currentUser.hasApplicationCapability('knitkit', {
      capability_type_iid:'view',
      resource:'Theme'
    }))

    {
      this.items = [layout,
      {
        xtype:'knitkit_themestreepanel',
        centerRegion:this.initialConfig['module'].centerRegion
      },
      {
        xtype:'knitkit_articlesgridpanel',
        centerRegion:this.initialConfig['module'].centerRegion
      }];
    } else {
      this.items = [layout,
      {
        xtype:'knitkit_articlesgridpanel',
        centerRegion:this.initialConfig['module'].centerRegion
      }];
    }
        
    this.callParent(arguments);
    this.setActiveTab(0);
  },

  getArticles : function(node){
    this.contentsCardPanel.removeAll(true);
    var xtype = 'knitkit_'+node.data.type.toLowerCase()+'articlesgridpanel';
    this.contentsCardPanel.add({
      xtype:xtype,
      title:node.data.siteName + ' - ' + node.data.text + ' - Articles',
      sectionId:node.data.id.split('_')[1],
      centerRegion:this.initialConfig['module'].centerRegion,
      siteId:node.data.siteId
    });
    this.contentsCardPanel.getLayout().setActiveItem(this.contentsCardPanel.items.length - 1);
  },

  getPublications : function(node){
    this.contentsCardPanel.removeAll(true);
    this.contentsCardPanel.add({
      xtype:'knitkit_publishedgridpanel',
      title:node.data.siteName + ' Publications',
      siteId:node.data.id.split('_')[1],
      centerRegion:this.initialConfig['module'].centerRegion
    });
    this.contentsCardPanel.getLayout().setActiveItem(this.contentsCardPanel.items.length - 1);
  },

  constructor : function(config) {
    config = Ext.apply({
      region:'west',
      split:true,
      width:350,
      collapsible:true
    }, config);

    this.callParent([config]);
  }
});
