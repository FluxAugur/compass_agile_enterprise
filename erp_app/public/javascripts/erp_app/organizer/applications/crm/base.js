Ext.define("Compass.ErpApp.Organizer.Applications.Crm.Layout", {
    extend:"Ext.panel.Panel",
    alias:'widget.contactslayout',
    //private member partyId
    partyId:null,

    constructor:function (config) {
config = Ext.apply({
            layout:'border',
            frame:false,
            autoScroll:true,
            region:'center',
            items:[]

        }, config);

        this.callParent([config]);
    }
});

Ext.define("Compass.ErpApp.Organizer.Applications.Crm.PartyPanel", {
    extend:"Ext.panel.Panel",
    alias:'widget.crmpartypanel',
    //private member partyId
    partyId:null,

    constructor:function (config) {
        this.partyId = config.partyId;
        var self = this;
        var currentPartyGrid = config.currentPartyGrid;
        var currentPartyPanel = config.currentPartyPanel;

        var toolBar = Ext.create("Ext.toolbar.Toolbar", {
            items:[
                {
                    text:'Edit',
                    xtype:'button',
                    iconCls:'icon-edit',
                    handler:function (button) {
                        var rec = currentPartyGrid.store.getById(self.partyId);
                        currentPartyGrid.fireEvent('editpartybtnclick', this, rec);
                    }
                },
                '|',
                {
                    text:'Delete',
                    xtype:'button',
                    iconCls:'icon-delete',
                    handler:function (button) {
                        var rec = currentPartyGrid.store.getById(self.partyId);
                        if (!rec) {
                            return false;
                        }
                        var messageBox = Ext.MessageBox.confirm(
                            'Confirm', 'Are you sure?',
                            function (btn) {
                                if (btn == 'yes') {
                                    currentPartyGrid.store.remove(rec);
                                    Ext.getCmp('party_id_' + self.partyId).close();
                                }
                            }
                        );
                    }
                }
            ]
        });

        config = Ext.apply({
            title:config.tabtitle,
            xtype:'panel',
            layout:'border',
            partyType:config.party_type,
            id:'party_id_' + config.partyId,
            tbar:toolBar,
            closable:true,
            split:true,
            items:[
                {
                    id:'party_details_' + config.partyId,
                    region:'center',
                    xtype:'panel',
                    html:''
                },
                {
                    height:300,
                    collapsible:true,
                    region:'south',
                    xtype:'tabpanel',
                    id:'panelSouthItems_' + config.partyId,
                    items:config.panelSouthItems
                }
            ]

        }, config);

        this.callParent([config]);
    }
});

Compass.ErpApp.Organizer.Applications.Crm.Base = function (config) {
    /**
     * load details of party
     */
    loadPartyDetails = function (partyId) {
        widget_xtypes = individualsPanel.widget_xtypes;

        if (partyId == null) {
            Ext.Msg.alert('Error', 'Member partyId not set');
        }
        else {
            var tabPanel = Ext.getCmp('panelSouthItems_' + partyId);
            updatePartyDetails(partyId);

            for (i = 0; i < widget_xtypes.length; i += 1) {
                var widget = tabPanel.query(widget_xtypes[i]);
                if (widget.length > 0) {
                    widget[0].setParams({
                        partyId:partyId
                    });
                    widget[0].store.load();
                }
            }

            Ext.getCmp('panelSouthItems_' + partyId).setActiveTab(0);
        }
    };

    updatePartyDetails = function (partyId) {
        Ext.Ajax.request({
            url:'/erp_app/organizer/crm/get_party_details/' + partyId,
            disableCaching:false,
            method:'GET',
            success:function (response) {
                Ext.getCmp('party_details_' + partyId).update(response.responseText);
            }
        });
    };

    openPartyTab = function (partyId, party, party_type) {
        if (!party_type) {
            party_type = 'Individual';
        }
        if (party_type == 'Individual') {
            currentPartyPanel = Ext.getCmp('IndividualsCenterPanel');
            currentPartyGrid = Ext.getCmp('individualSearchGrid');
        } else {
            currentPartyPanel = Ext.getCmp('OrganizationsCenterPanel');
            currentPartyGrid = Ext.getCmp('organizationSearchGrid');
        }

        var panelSouthItems = [];
        var xtypes = [
            'phonenumbergrid',
            'emailaddressgrid',
            'postaladdressgrid',
            'shared_notesgrid'
        ];

        if (party_type == 'Individual') {
            for (i = 0; i < xtypes.length; i += 1) {
                panelSouthItems.push({
                    xtype:xtypes[i],
                    partyId:partyId
                });
            }

            var current_passport_expire_date = party.get('current_passport_expire_date');
            if (!Compass.ErpApp.Utility.isBlank(current_passport_expire_date)) {
                current_passport_expire_date = Ext.Date.format(current_passport_expire_date, 'm/d/Y');
            }

            tabtitle = party.get('current_first_name') + ' ' + party.get('current_last_name');
        }
        else {
            for (i = 0; i < xtypes.length; i += 1) {
                panelSouthItems.push({
                    xtype:xtypes[i]
                });
            }

            tabtitle = party.get('description');
        }

        var partyPanel = Ext.create("Compass.ErpApp.Organizer.Applications.Crm.PartyPanel", {
            party_type:party_type,
            panelSouthItems:panelSouthItems,
            tabtitle:tabtitle,
            party_details:'',
            partyId:partyId,
            currentPartyPanel:currentPartyPanel,
            currentPartyGrid:currentPartyGrid
        });

        currentPartyPanel.add(partyPanel);
        currentPartyPanel.setActiveTab('party_id_' + partyId);

        loadPartyDetails(partyId);
    };

    var individualFormFields = [
        {
            xtype:'textfield',
            fieldLabel:'Enterprise Identifier',
            allowBlank:true,
            name:'enterprise_identifier'
        },
        {
            xtype:'textfield',
            fieldLabel:'Title',
            allowBlank:true,
            name:'current_personal_title'
        },
        {
            xtype:'textfield',
            fieldLabel:'First Name',
            allowBlank:false,
            name:'current_first_name'
        },
        {
            xtype:'textfield',
            fieldLabel:'Middle Name',
            allowBlank:true,
            name:'current_middle_name'
        },
        {
            xtype:'textfield',
            fieldLabel:'Last Name',
            allowBlank:false,
            name:'current_last_name'
        },
        {
            xtype:'textfield',
            fieldLabel:'Suffix',
            allowBlank:true,
            name:'current_suffix'
        },
        {
            xtype:'textfield',
            fieldLabel:'Nickname',
            allowBlank:true,
            name:'current_nickname'
        },
        {
            xtype:'textfield',
            fieldLabel:'Passport Number',
            allowBlank:true,
            name:'current_passport_number'
        },
        {
            xtype:'datefield',
            fieldLabel:'Passport Expiration Date',
            allowBlank:true,
            name:'current_passport_expire_date'
        },
        {
            xtype:'datefield',
            fieldLabel:'DOB',
            allowBlank:false,
            name:'birth_date'
        },
        {
            xtype:'combobox',
            fieldLabel:'Gender',
            store:Ext.create('Ext.data.Store', {
                fields:['v', 'k'],
                data:[
                    {"v":"m", "k":"Male"},
                    {"v":"f", "k":"Female"}
                ]
            }),
            displayField:'k',
            valueField:'v',
            name:'gender'
        },
        {
            xtype:'textfield',
            fieldLabel:'Total Yrs Work Exp',
            allowBlank:true,
            name:'total_years_work_experience'
        },
        {
            xtype:'textfield',
            fieldLabel:'Marital Status',
            allowBlank:true,
            name:'marital_status'
        },
        {
            xtype:'textfield',
            fieldLabel:'Social Security Number',
            allowBlank:true,
            name:'social_security_number'
        }
    ];

    var editIndividualFormFields = [
        {
            xtype:'hiddenfield',
            name:'id'
        },
        {
            xtype:'hiddenfield',
            name:'business_party_id'
        }
    ];

    var addIndividualWindow = Ext.create("Ext.window.Window", {
        layout:'fit',
        width:375,
        title:'New Individual',
        height:500,
        buttonAlign:'center',
        items:new Ext.FormPanel({
            labelWidth:110,
            frame:false,
            bodyStyle:'padding:5px 5px 0',
            width:425,
            url:'/erp_app/organizer/crm/create_party',
            defaults:{
                width:225
            },
            items:[ individualFormFields ]
        }),
        buttons:[
            {
                text:'Submit',
                listeners:{
                    'click':function (button) {
                        var window = button.findParentByType('window');
                        var formPanel = window.query('form')[0];
                        formPanel.getForm().submit({
                            reset:true,
                            params:{
                                party_type:'Individual'
                            },
                            waitMsg:'Creating Individual',
                            success:function (form, action) {
                                var response = Ext.decode(action.response.responseText);
                                Ext.Msg.alert("Status", response.message);
                                if (response.success) {
                                    var individualName = response.individualName;
                                    addIndividualWindow.hide();
                                    var individualsSearchGrid = Ext.ComponentMgr.get('individualSearchGrid');
                                    individualsSearchGrid.store.proxy.extraParams.party_name = individualName;
                                    individualsSearchGrid.store.load();
                                }
                            },
                            failure:function (form, action) {
                                var message = 'Error adding individual';
                                if (action.response != null) {
                                    var response = Ext.decode(action.response.responseText);
                                    message = response.message;
                                }
                                Ext.Msg.alert("Status", message);
                            }
                        });
                    }
                }
            },
            {
                text:'Close',
                handler:function () {
                    addIndividualWindow.hide();
                }
            }
        ]
    });

    var editIndividualWindow = Ext.create("Ext.window.Window", {
        layout:'fit',
        width:375,
        title:'Edit Individual',
        height:500,
        buttonAlign:'center',
        items:new Ext.FormPanel({
            id:'editIndividualFormPanel',
            labelWidth:110,
            frame:false,
            bodyStyle:'padding:5px 5px 0',
            width:425,
            url:'/erp_app/organizer/crm/update_party',
            defaults:{
                width:225
            },
            items:[ individualFormFields.concat(editIndividualFormFields) ]
        }),
        buttons:[
            {
                text:'Submit',
                listeners:{
                    'click':function (button) {
                        partyId = Ext.getCmp('editIndividualFormPanel').getForm().findField('id').getValue();

                        var window = button.findParentByType('window');
                        var formPanel = window.query('form')[0];
                        formPanel.getForm().submit({
                            reset:true,
                            params:{
                                party_type:'Individual'
                            },
                            waitMsg:'Updating Individual',
                            success:function (form, action) {
                                var response = Ext.decode(action.response.responseText);
                                Ext.Msg.alert("Status", response.message);
                                if (response.success) {
                                    updatePartyDetails(partyId);
                                    editIndividualWindow.hide();
                                    Ext.getCmp('individualSearchGrid').store.load();
                                }
                            },
                            failure:function (form, action) {
                                var message = 'Error updating individual';
                                if (action.response != null) {
                                    var response = Ext.decode(action.response.responseText);
                                    message = response.message;
                                }
                                Ext.Msg.alert("Status", message);
                            }
                        });
                    }
                }
            },
            {
                text:'Close',
                handler:function () {
                    editIndividualWindow.hide();
                }
            }
        ]
    });

    var organizationFormFields = [
        {
            xtype:'textfield',
            fieldLabel:'Enterprise Identifier',
            allowBlank:true,
            name:'enterprise_identifier'
        },
        {
            xtype:'textfield',
            fieldLabel:'Tax ID',
            allowBlank:true,
            name:'tax_id_number'
        },
        {
            xtype:'textfield',
            fieldLabel:'Description',
            allowBlank:true,
            name:'description'
        }
    ];

    var editOrganizationFormFields = [
        {
            xtype:'hiddenfield',
            name:'id'
        },
        {
            xtype:'hiddenfield',
            name:'business_party_id'
        }
    ];

    var addOrganizationWindow = Ext.create("Ext.window.Window", {
        layout:'fit',
        width:375,
        title:'New Organization',
        height:160,
        buttonAlign:'center',
        items:new Ext.FormPanel({
            labelWidth:110,
            frame:false,
            bodyStyle:'padding:5px 5px 0',
            width:425,
            url:'/erp_app/organizer/crm/create_party',
            defaults:{
                width:225
            },
            items:[ organizationFormFields ]
        }),
        buttons:[
            {
                text:'Submit',
                listeners:{
                    'click':function (button) {
                        var window = button.findParentByType('window');
                        var formPanel = window.query('form')[0];
                        formPanel.getForm().submit({
                            reset:true,
                            waitMsg:'Creating Organization',
                            params:{
                                party_type:'Organization'
                            },
                            success:function (form, action) {
                                var response = Ext.decode(action.response.responseText);
                                Ext.Msg.alert("Status", response.message);
                                if (response.success) {
                                    var organizationName = response.organizationName;
                                    addOrganizationWindow.hide();
                                    var organizationSearchGrid = Ext.ComponentMgr.get('organizationSearchGrid');
                                    organizationSearchGrid.store.proxy.extraParams.party_name = organizationName;
                                    organizationSearchGrid.store.load();
                                }
                            },
                            failure:function (form, action) {
                                var message = "Error adding organization";
                                if (action.response != null) {
                                    var response = Ext.decode(action.response.responseText);
                                    message = response.message;
                                }
                                Ext.Msg.alert("Status", message);
                            }
                        });
                    }
                }
            },
            {
                text:'Close',
                handler:function () {
                    addOrganizationWindow.hide();
                }
            }
        ]
    });

    var editOrganizationWindow = Ext.create("Ext.window.Window", {
        layout:'fit',
        width:375,
        title:'Edit Organization',
        height:160,
        buttonAlign:'center',
        items:new Ext.FormPanel({
            id:'editOrganizationFormPanel',
            labelWidth:110,
            frame:false,
            bodyStyle:'padding:5px 5px 0',
            width:425,
            url:'/erp_app/organizer/crm/update_party',
            defaults:{
                width:225
            },
            items:[ organizationFormFields.concat(editOrganizationFormFields) ]
        }),
        buttons:[
            {
                text:'Submit',
                listeners:{
                    'click':function (button) {
                        partyId = Ext.getCmp('editOrganizationFormPanel').getForm().findField('id').getValue();

                        var window = button.findParentByType('window');
                        var formPanel = window.query('form')[0];
                        formPanel.getForm().submit({
                            reset:true,
                            waitMsg:'Updating Organization',
                            params:{
                                party_type:'Organization'
                            },
                            success:function (form, action) {
                                var response = Ext.decode(action.response.responseText);
                                Ext.Msg.alert("Status", response.message);
                                if (response.success) {
                                    updatePartyDetails(partyId);
                                    var organizationName = response.organizationName;
                                    editOrganizationWindow.hide();
                                    var organizationSearchGrid = Ext.ComponentMgr.get('organizationSearchGrid');
                                    organizationSearchGrid.store.proxy.extraParams.party_name = organizationName;
                                    organizationSearchGrid.store.load();
                                }
                            },
                            failure:function (form, action) {
                                var message = "Error adding organization";
                                if (action.response != null) {
                                    var response = Ext.decode(action.response.responseText);
                                    message = response.message;
                                }
                                Ext.Msg.alert("Status", message);
                            }
                        });
                    }
                }
            },
            {
                text:'Close',
                handler:function () {
                    editOrganizationWindow.hide();
                }
            }
        ]
    });

    var treeMenuStore = Ext.create('Compass.ErpApp.Organizer.DefaultMenuTreeStore', {
        url:'/erp_app/organizer/crm/menu',
        rootText:'Customers',
        rootIconCls:'icon-content',
        additionalFields:[
            {
                name:'businessPartType'
            }
        ]
    });

    var menuTreePanel = {
        xtype:'defaultmenutree',
        title:'CRM',
        store:treeMenuStore,
        listeners:{
            scope:this,
            'itemcontextmenu':function (view, record, htmlItem, index, e) {
                e.stopEvent();
                if (record.isLeaf()) {
                    var contextMenu = null;
                    if (record.data.businessPartType == "individual") {
                        contextMenu = new Ext.menu.Menu({
                            items:[
                                {
                                    text:"Add Individual",
                                    iconCls:'icon-add',
                                    listeners:{
                                        'click':function () {
                                            addIndividualWindow.show();
                                        }
                                    }
                                }
                            ]
                        });
                    }
                    else if (record.data.businessPartType == "organization") {
                        contextMenu = new Ext.menu.Menu({
                            items:[
                                {
                                    text:"Add Organization",
                                    iconCls:'icon-add',
                                    listeners:{
                                        'click':function () {
                                            addOrganizationWindow.show();
                                        }
                                    }
                                }
                            ]
                        });
                    }
                    contextMenu.showAt(e.xy);
                }
            }
        }
    };

    var individualsGrid = {
        id:'individualSearchGrid',
        title:'Search',
        xtype:'partygrid',
        partyType:'Individual',
        listeners:{
            'addpartybtnclick':function (btn, grid) {
                addIndividualWindow.show();
            },
            'editpartybtnclick':function (btn, rec) {
                //rec = grid.getSelectionModel().getSelection()[0];
                if (rec) {
                    Ext.getCmp('editIndividualFormPanel').getForm().loadRecord(rec);
                    editIndividualWindow.show();
                }
                else {
                    Ext.Msg.alert('Please select a record to edit.');
                }
            },
            'itemdblclick':function (view, record, item, index, e, options) {
                var partyId = record.get("id");
                var partyTab = Ext.getCmp('party_id_' + partyId);
                if (partyTab) {
                    Ext.getCmp('IndividualsCenterPanel').setActiveTab('party_id_' + partyId);
                }
                else {
                    openPartyTab(partyId, record, 'Individual');
                }
            }
        }
    };

    var organizationsGrid = {
        id:'organizationSearchGrid',
        title:'Search',
        xtype:'partygrid',
        partyType:'Organization',
        listeners:{
            'addpartybtnclick':function (btn, grid) {
                addOrganizationWindow.show();
            },
            'editpartybtnclick':function (btn, rec) {
                //rec = grid.getSelectionModel().getSelection()[0];
                if (rec) {
                    Ext.getCmp('editOrganizationFormPanel').getForm().loadRecord(rec);
                    editOrganizationWindow.show();
                }
                else {
                    Ext.Msg.alert('Please select a record to edit.');
                }
            },
            'itemdblclick':function (view, record, item, index, e, options) {
                var partyId = record.get("id");
                var partyTab = Ext.getCmp('party_id_' + partyId);
                if (partyTab) {
                    Ext.getCmp('OrganizationsCenterPanel').setActiveTab('party_id_' + partyId);
                }
                else {
                    openPartyTab(partyId, record, 'Organization');
                }
            }
        }
    };

    var individualsPanel = {
        xtype:'contactslayout',
        id:'individuals_search_grid',
        title:'Individuals',
        items:[
            {
                xtype:'tabpanel',
                layout:'fit',
                region:'center',
                id:'IndividualsCenterPanel',
                items:[individualsGrid]
            }
        ]
    };

    var organizationsPanel = {
        xtype:'contactslayout',
        id:'organizations_search_grid',
        title:'Organizations',
        items:[
            {
                xtype:'tabpanel',
                layout:'fit',
                region:'center',
                id:'OrganizationsCenterPanel',
                items:[organizationsGrid]
            }
        ]
    };

    this.setup = function () {
        config.organizerLayout.addApplication(menuTreePanel, [individualsPanel, organizationsPanel]);
    };

};

