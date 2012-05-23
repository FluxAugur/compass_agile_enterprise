Ext.define("Compass.ErpApp.Desktop.Applications.CompassDrive",{
  extend:"Ext.ux.desktop.Module",
  id:'compass_drive-win',
  init : function(){
    this.launcher = {
      text: 'CompassDrive',
      iconCls:'icon-harddrive',
      handler: this.createWindow,
      scope: this
    }
  },

  createWindow : function(){
    var desktop = this.app.getDesktop();
    var win = desktop.getWindow('compass_drive');
    if(!win){

      var repositoryTree = {
        xtype:'compassdrive-repositorytreepanel',
        region:'west',
        split:true,
        width:300,
        collapsible:true
      };

      var detailsTabPanel = {
        xtype:'tabpanel',
        plugins: Ext.create('Ext.ux.TabCloseMenu', {
          extraItemsTail: [
          '-',
          {
            text: 'Closable',
            checked: true,
            hideOnClick: true,
            handler: function (item) {
              currentItem.tab.setClosable(item.checked);
            }
          }
          ],
          listeners: {
            aftermenu: function () {
              currentItem = null;
            },
            beforemenu: function (menu, item) {
              var menuitem = menu.child('*[text="Closable"]');
              currentItem = item;
              menuitem.setChecked(item.closable);
            }
          }
        }),
        region:'center',
        split:true
      };

      win = desktop.createWindow({
        id: 'compass_drive',
        title:'CompassDrive',
        itemId:'compassDriveWindow',
        width:1000,
        height:550,
        iconCls: 'icon-harddrive',
        shim:false,
        animCollapse:false,
        constrainHeader:true,
        layout: 'border',
        items:[repositoryTree, detailsTabPanel]
      });
    }
    win.show();
  }
});
