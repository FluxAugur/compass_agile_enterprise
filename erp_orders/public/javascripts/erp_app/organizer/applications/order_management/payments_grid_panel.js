Ext.define("Compass.ErpApp.Organizer.Applications.OrderManagement.PaymentsGridPanel",{
    extend:"Ext.grid.Panel",
    alias:'widget.organizerordermanagement_paymentsgridpanel',
    constructor : function(config) {
        var store = Ext.create("Ext.data.Store",{
            proxy:{
                type:'ajax',
                url: '/erp_orders/erp_app/desktop/order_manager/payments',
                reader:{
                    type:'json',
                    root: 'payments'
                }
            },
            extraParam:{
                order_id:null
            },
            fields:[
            'authorization',
            'status',
            'created_at',
            {
                name:'amount',
                type:'float'
            },
            'currency_display',
            'id',
            'success'
            ]
        });

        config = Ext.apply({
            layout:'fit',
            columns: [
            {
                header:'Authorization Number',
                sortable: true,
                dataIndex: 'authorization'
            },
            {
                header:'Status',
                sortable: true,
                dataIndex: 'status'
            },
            {
                header:'Successful',
                sortable: true,
                dataIndex: 'success'
            },
            {
                header:'Amount',
                sortable: true,
                dataIndex: 'amount',
                renderer:function(v){
                    return v.toFixed(2);
                }

            },
            {
                header: 'Currency',
                width: 75,
                sortable: true,
                dataIndex: 'currency_display'

            },
            {
                header: 'Created At',
                sortable: true,
                dataIndex: 'created_at',
                renderer: Ext.util.Format.dateRenderer('m/d/Y  H:i:s')
            }
            ],
            loadMask: true,
            autoScroll:true,
            stripeRows: true,
            store:store,
            viewConfig:{
                forceFit:true
            },
            listeners:{
                activate:function(grid){
                    var layout = grid.findParentByType('organizer_orderslayout');
                    if(!Compass.ErpApp.Utility.isBlank(layout.orderId)){
                        var store = grid.getStore();
                        store.proxy.extraParams.order_id = layout.orderId;
                        store.load();
                    }
                }
            }
        }, config);

        Compass.ErpApp.Organizer.Applications.OrderManagement.PaymentsGridPanel.superclass.constructor.call(this, config);
    }
});