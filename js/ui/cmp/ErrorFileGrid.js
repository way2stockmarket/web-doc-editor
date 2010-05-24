Ext.namespace('ui', 'ui.cmp', 'ui.cmp._ErrorFileGrid');

//------------------------------------------------------------------------------
// ErrorFileGrid internals

// ErrorFileGrid store
ui.cmp._ErrorFileGrid.store = new Ext.data.GroupingStore({
    proxy: new Ext.data.HttpProxy({
        url: './do/getFilesError'
    }),
    reader: new Ext.data.JsonReader({
        root: 'Items',
        totalProperty: 'nbItems',
        idProperty: 'id',
        fields: [{
            name: 'id'
        }, {
            name: 'path'
        }, {
            name: 'name'
        }, {
            name: 'maintainer'
        }, {
            name: 'type'
        }, {
            name: 'value_en'
        }, {
            name: 'value_lang'
        }, {
            name: 'fileModifiedEN'
        }, {
            name: 'fileModifiedLang'
        }]
    }),
    sortInfo: {
        field: 'path',
        direction: 'ASC'
    },
    groupField: 'path',
    listeners: {
        datachanged: function(ds){
            Ext.getDom('acc-error-nb').innerHTML = ds.getCount();
        }
    }
});

// ErrorFileGrid columns definition
ui.cmp._ErrorFileGrid.columns = [{
    id: 'name',
    header: _('Files'),
    sortable: true,
    dataIndex: 'name',
    renderer: function(v, metada, r){
        var mess = '', infoEN, infoLang;
        
        if (r.data.fileModifiedEN) {
        
            infoEN = Ext.util.JSON.decode(r.data.fileModifiedEN);
            
            if (infoEN.user === PhDOE.user.login && infoEN.anonymousIdent === PhDOE.user.anonymousIdent) {
                mess = _('File EN modified by me') + "<br>";
            }
            else {
                mess = String.format(_('File EN modified by {0}'), infoEN.user.ucFirst()) + "<br>";
            }
        }
        
        if (r.data.fileModifiedLang) {
        
            infoLang = Ext.util.JSON.decode(r.data.fileModifiedLang);
            
            if (infoLang.user === PhDOE.user.login && infoLang.anonymousIdent === PhDOE.user.anonymousIdent) {
                mess += String.format(_('File {0} modified by me'), PhDOE.user.lang.ucFirst());
            }
            else {
                mess += String.format(_('File {0} modified by {1}'), PhDOE.user.lang.ucFirst(), infoLang.user.ucFirst());
            }
        }
        
        if (mess != '') {
            return "<span ext:qtip='" + mess + "'>" + v + "</span>";
        }
        else {
            return v;
        }
    }
}, {
    header: _('Type'),
    width: 45,
    sortable: true,
    dataIndex: 'type'
}, {
    header: _('Maintainer'),
    width: 45,
    sortable: true,
    dataIndex: 'maintainer'
}, {
    header: _('Path'),
    dataIndex: 'path',
    hidden: true
}];

// ErrorFileGrid view
ui.cmp._ErrorFileGrid.view = new Ext.grid.GroupingView({
    emptyText: '<div style="text-align: center;">' + _('No Files') + '</div>',
    deferEmptyText: false,
    forceFit: true,
    startCollapsed: true,
    groupTextTpl: '{[values.rs[0].data.path]} ' +
    '({[values.rs.length]} ' +
    '{[values.rs.length > 1 ? "' +
    _('Files') +
    '" : "' +
    _('File') +
    '"]})',
    getRowClass: function(r){
        if (r.data.fileModifiedEN || r.data.fileModifiedLang) {
        
            var infoEN = Ext.util.JSON.decode(r.data.fileModifiedEN), infoLang = Ext.util.JSON.decode(r.data.fileModifiedLang);
            
            return ((infoEN.user === PhDOE.user.login && infoEN.anonymousIdent === PhDOE.user.anonymousIdent) ||
            (infoLang.user === PhDOE.user.login && infoLang.anonymousIdent === PhDOE.user.anonymousIdent)) ? 'fileModifiedByMe' : 'fileModifiedByAnother';
        }
        return false;
    }
});

// ErrorFileGrid context menu
// config - { hideDiffMenu, grid, rowIdx, event, lang, fpath, fname }
ui.cmp._ErrorFileGrid.menu = function(config){
    Ext.apply(this, config);
    this.init();
    ui.cmp._ErrorFileGrid.menu.superclass.constructor.call(this);
};
Ext.extend(ui.cmp._ErrorFileGrid.menu, Ext.menu.Menu, {
    init: function(){
        Ext.apply(this, {
            items: [{
                scope: this,
                text: '<b>' + _('Edit in a new tab') + '</b>',
                iconCls: 'iconFilesError',
                handler: function(){
                    this.grid.fireEvent('rowdblclick', this.grid, this.rowIdx, this.event);
                }
            }, {
                scope: this,
                hidden: this.hideDiffMenu,
                text: _('View diff...'),
                iconCls: 'iconViewDiff',
                menu: new Ext.menu.Menu({
                    items: [{
                        scope: this,
                        hidden: (this.grid.store.getAt(this.rowIdx).data.fileModifiedEN === false),
                        text: String.format(_('... of the {0} file'), 'EN'),
                        handler: function(){
                            this.openTab(this.rowIdx, 'en', this.fpath, this.fname);
                        }
                    }, {
                        scope: this,
                        hidden: (this.grid.store.getAt(this.rowIdx).data.fileModifiedLang === false),
                        text: String.format(_('... of the {0} file'), PhDOE.user.lang.ucFirst()),
                        handler: function(){
                            this.openTab(this.rowIdx, PhDOE.user.lang, this.fpath, this.fname);
                        }
                    }]
                })
            }, '-', {
                text: _('About error type'),
                iconCls: 'iconHelp',
                handler: function(){
                    if (!Ext.getCmp('main-panel').findById('FE-help')) {
                    
                        Ext.getCmp('main-panel').add({
                            id: 'FE-help',
                            title: _('About error type'),
                            iconCls: 'iconHelp',
                            closable: true,
                            autoScroll: true,
                            autoLoad: './error'
                        });
                        
                    }
                    Ext.getCmp('main-panel').setActiveTab('FE-help');
                }
            }]
        });
    },
    
    openTab: function(rowIdx, lang, fpath, fname){
        // Render only if this tab don't exist yet
        if (!Ext.getCmp('main-panel').findById('diff_panel_' + lang + '_' + rowIdx)) {
        
            // Add tab for the diff
            Ext.getCmp('main-panel').add({
                xtype: 'panel',
                id: 'diff_panel_' + lang + '_' + rowIdx,
                title: _('Diff'),
                tabTip: String.format(_('Diff for file: {0}'), lang + fpath + fname),
                closable: true,
                autoScroll: true,
                iconCls: 'iconTabLink',
                html: '<div id="diff_content_' + lang + '_' + rowIdx +
                '" class="diff-content"></div>'
            });
            
            // We need to activate HERE this tab, otherwise, we can't mask it (el() is not defined)
            Ext.getCmp('main-panel').setActiveTab('diff_panel_' + lang + '_' + rowIdx);
            
            Ext.get('diff_panel_' + lang + '_' + rowIdx).mask('<img src="themes/img/loading.gif" ' +
            'style="vertical-align: middle;" />' +
            _('Please, wait...'));
            
            // Load diff data
            XHR({
                params: {
                    task: 'getDiff',
                    DiffType: 'file',
                    FilePath: lang + fpath,
                    FileName: fname
                },
                success: function(r){
                    var o = Ext.util.JSON.decode(r.responseText);
                    // We display in diff div
                    Ext.get('diff_content_' + lang + '_' + rowIdx).dom.innerHTML = o.content;
                    
                    Ext.get('diff_panel_' + lang + '_' + rowIdx).unmask();
                }
            });
        }
        else {
            Ext.getCmp('main-panel').setActiveTab('diff_panel_' + lang + '_' + rowIdx);
        }
    }
});

//------------------------------------------------------------------------------
// ErrorFileGrid
ui.cmp.ErrorFileGrid = Ext.extend(Ext.grid.GridPanel, {
    loadMask: true,
    border: false,
    autoExpandColumn: 'name',
    enableDragDrop: true,
    ddGroup: 'mainPanelDDGroup',
    view: ui.cmp._ErrorFileGrid.view,
    columns: ui.cmp._ErrorFileGrid.columns,
    listeners: {
        render: function(grid){
            grid.view.refresh();
        }
    },
    
    onRowContextMenu: function(grid, rowIndex, e){
        e.stopEvent();
        
        var data = grid.store.getAt(rowIndex).data, FilePath = data.path, FileName = data.name;
        
        grid.getSelectionModel().selectRow(rowIndex);
        
        new ui.cmp._ErrorFileGrid.menu({
            hideDiffMenu: (data.fileModifiedEN === false && data.fileModifiedLang === false),
            grid: grid,
            event: e,
            rowIdx: rowIndex,
            lang: PhDOE.user.lang,
            fpath: FilePath,
            fname: FileName
        }).showAt(e.getXY());
    },
    
    onRowDblClick: function(grid, rowIndex, e){
        this.openFile(grid.store.getAt(rowIndex).data.id);
    },
    
    openFile: function(rowId){
        var storeRecord = this.store.getById(rowId), FilePath = storeRecord.data.path, FileName = storeRecord.data.name, FileID = Ext.util.md5('FE-' + PhDOE.user.lang + FilePath + FileName), error = [], vcsPanel, filePanel;
        
        // Render only if this tab don't exist yet
        if (!Ext.getCmp('main-panel').findById('FE-' + FileID)) {
        
            // Find all error for this file to pass to error_type.php page
            error = [];
            
            this.store.each(function(record){
                if (record.data.path === FilePath && record.data.name === FileName && !error[record.data.type]) {
                    error.push(record.data.type);
                }
            });
            
            vcsPanel = (PhDOE.user.lang === 'en') ? [new ui.cmp.VCSLogGrid({
                layout: 'fit',
                title: String.format(_('{0} Log'), PhDOE.user.lang.ucFirst()),
                prefix: 'FE-LANG',
                fid: FileID,
                fpath: PhDOE.user.lang + FilePath,
                fname: FileName,
                loadStore: PhDOE.user.conf.errorLogLoadData
            })] : [new ui.cmp.VCSLogGrid({
                layout: 'fit',
                title: String.format(_('{0} Log'), PhDOE.user.lang.ucFirst()),
                prefix: 'FE-LANG',
                fid: FileID,
                fpath: PhDOE.user.lang + FilePath,
                fname: FileName,
                loadStore: PhDOE.user.conf.errorLogLoadData
            }), new ui.cmp.VCSLogGrid({
                layout: 'fit',
                title: String.format(_('{0} Log'), 'En'),
                prefix: 'FE-EN',
                fid: FileID,
                fpath: 'en' + FilePath,
                fname: FileName,
                loadStore: PhDOE.user.conf.errorLogLoadData
            })];
            
            filePanel = (PhDOE.user.lang === 'en') ? [new ui.cmp.FilePanel({
                id: 'FE-LANG-PANEL-' + FileID,
                region: 'center',
                title: String.format(_('{0} File: '), PhDOE.user.lang) + FilePath + FileName,
                prefix: 'FE',
                ftype: 'LANG',
                spellCheck: PhDOE.user.conf.errorSpellCheckLang,
                spellCheckConf: 'errorSpellCheckLang',
                fid: FileID,
                fpath: FilePath,
                fname: FileName,
                lang: PhDOE.user.lang,
                parser: 'xml',
                storeRecord: storeRecord,
                syncScrollCB: false,
                syncScroll: false
            })] : [new ui.cmp.FilePanel({
                id: 'FE-LANG-PANEL-' + FileID,
                region: 'center',
                title: String.format(_('{0} File: '), PhDOE.user.lang.ucFirst()) + FilePath + FileName,
                prefix: 'FE',
                ftype: 'LANG',
                spellCheck: PhDOE.user.conf.errorSpellCheckLang,
                spellCheckConf: 'errorSpellCheckLang',
                fid: FileID,
                fpath: FilePath,
                fname: FileName,
                lang: PhDOE.user.lang,
                parser: 'xml',
                storeRecord: storeRecord,
                syncScrollCB: true,
                syncScroll: true,
                syncScrollConf: 'errorScrollbars'
            }), new ui.cmp.FilePanel({
                id: 'FE-EN-PANEL-' + FileID,
                region: 'east',
                title: _('en File: ') + FilePath + FileName,
                prefix: 'FE',
                ftype: 'EN',
                spellCheck: PhDOE.user.conf.errorSpellCheckEn,
                spellCheckConf: 'errorSpellCheckEn',
                fid: FileID,
                fpath: FilePath,
                fname: FileName,
                lang: 'en',
                parser: 'xml',
                storeRecord: storeRecord,
                syncScroll: true,
                syncScrollConf: 'errorScrollbars'
            })];
            
            Ext.getCmp('main-panel').add({
                id: 'FE-' + FileID,
                title: FileName,
                layout: 'border',
                iconCls: 'iconTabError',
                closable: true,
                tabLoaded: false,
                panVCSLang: !PhDOE.user.conf.errorDisplayLog,
                panVCSEn: (PhDOE.user.lang === 'en') ? true : !PhDOE.user.conf.errorDisplayLog,
                panLANGLoaded: false,
                panENLoaded: (PhDOE.user.lang === 'en') ? true : false,
                originTitle: FileName,
                defaults: {
                    split: true
                },
                tabTip: String.format(_('File with error : in {0}'), FilePath),
                listeners: {
                    resize: function(panel){
                        (PhDOE.user.lang !== 'en') ? Ext.getCmp('FE-EN-PANEL-' + FileID).setWidth(panel.getWidth() / 2) : '';
                    }
                },
                items: [{
                    xtype: 'panel',
                    id: 'FE-error-desc-' + FileID,
                    region: 'north',
                    layout: 'fit',
                    title: _('Error description'),
                    iconCls: 'iconFilesError',
                    collapsedIconCls: 'iconFilesError',
                    plugins: [Ext.ux.PanelCollapsedTitle],
                    height: PhDOE.user.conf.errorDescPanelHeight || 150,
                    collapsible: true,
                    collapsed: !PhDOE.user.conf.errorDescPanel,
                    autoScroll: true,
                    autoLoad: './error?dir=' + FilePath +
                    '&file=' +
                    FileName,
                    listeners: {
                        collapse: function(){
                            if (this.ownerCt.tabLoaded) {
                                new ui.task.UpdateConfTask({
                                    item: 'errorDescPanel',
                                    value: false
                                });
                            }
                        },
                        expand: function(){
                            if (this.ownerCt.tabLoaded) {
                                new ui.task.UpdateConfTask({
                                    item: 'errorDescPanel',
                                    value: true
                                });
                            }
                        },
                        resize: function(a, b, newHeight){
                        
                            if (this.ownerCt.tabLoaded && newHeight && newHeight > 50 && newHeight != PhDOE.user.conf.errorDescPanelHeight) { // As the type is different, we can't use !== to compare with !
                                new ui.task.UpdateConfTask({
                                    item: 'errorDescPanelHeight',
                                    value: newHeight
                                });
                            }
                        }
                    }
                }, {
                    region: 'west',
                    xtype: 'panel',
                    title: _('Tools'),
                    iconCls: 'iconConf',
                    collapsedIconCls: 'iconConf',
                    plugins: [Ext.ux.PanelCollapsedTitle],
                    collapsible: true,
                    collapsed: !PhDOE.user.conf.errorLogPanel,
                    layout: 'fit',
                    bodyBorder: false,
                    width: PhDOE.user.conf.errorLogPanelWidth || 375,
                    listeners: {
                        collapse: function(){
                            if (this.ownerCt.tabLoaded) {
                                new ui.task.UpdateConfTask({
                                    item: 'errorLogPanel',
                                    value: false
                                });
                            }
                        },
                        expand: function(){
                            if (this.ownerCt.tabLoaded) {
                                new ui.task.UpdateConfTask({
                                    item: 'errorLogPanel',
                                    value: true
                                });
                            }
                        },
                        resize: function(a, newWidth){
                            if (this.ownerCt.tabLoaded && newWidth && newWidth != PhDOE.user.conf.errorLogPanelWidth) { // As the type is different, we can't use !== to compare with !
                                new ui.task.UpdateConfTask({
                                    item: 'errorLogPanelWidth',
                                    value: newWidth
                                });
                            }
                        }
                    },
                    items: {
                        xtype: 'tabpanel',
                        activeTab: 0,
                        tabPosition: 'bottom',
                        enableTabScroll: true,
                        defaults: {
                            autoScroll: true
                        },
                        items: [vcsPanel, new ui.cmp.DictionaryGrid({
                            layout: 'fit',
                            title: _('Dictionary'),
                            prefix: 'FE',
                            fid: FileID
                        }), {
                            title: _('Entities'),
                            layout: 'fit',
                            items: [new ui.cmp.EntitiesAcronymsPanel({
                                dataType: 'entities',
                                prefix: 'FE',
                                ftype: 'LANG',
                                fid: FileID,
                                loadStore: PhDOE.user.conf.errorEntitiesLoadData
                            })]
                        }, {
                            title: _('Acronyms'),
                            layout: 'fit',
                            items: [new ui.cmp.EntitiesAcronymsPanel({
                                dataType: 'acronyms',
                                prefix: 'FE',
                                ftype: 'LANG',
                                fid: FileID,
                                loadStore: PhDOE.user.conf.errorAcronymsLoadData
                            })]
                        }]
                    }
                }, filePanel]
            });
        }
        Ext.getCmp('main-panel').setActiveTab('FE-' + FileID);
    },
    
    initComponent: function(){
        Ext.apply(this, {
            store: ui.cmp._ErrorFileGrid.store,
            tbar: [_('Filter: '), ' ', new Ext.form.TwinTriggerField({
                id: 'FE-filter',
                width: 180,
                hideTrigger1: true,
                enableKeyEvents: true,
                
                validateOnBlur: false,
                validationEvent: false,
                
                trigger1Class: 'x-form-clear-trigger',
                trigger2Class: 'x-form-search-trigger',
                
                listeners: {
                    keypress: function(f, e){
                        if (e.getKey() === e.ENTER) {
                            this.onTrigger2Click();
                        }
                    }
                },
                onTrigger1Click: function(){
                    this.setValue('');
                    this.triggers[0].hide();
                    this.setSize(180, 10);
                    ui.cmp._ErrorFileGrid.instance.store.clearFilter();
                },
                onTrigger2Click: function(){
                    var v = this.getValue(), regexp;
                    
                    if (v === '' || v.length < 3) {
                        this.markInvalid(_('Your filter must contain at least 3 characters'));
                        return;
                    }
                    this.clearInvalid();
                    this.triggers[0].show();
                    this.setSize(180, 10);
                    
                    regexp = new RegExp(v, 'i');
                    
                    // We filter on 'path', 'name', 'maintainer' and 'type'
                    ui.cmp._ErrorFileGrid.instance.store.filterBy(function(record){
                    
                        if (regexp.test(record.data.path) ||
                        regexp.test(record.data.name) ||
                        regexp.test(record.data.maintainer) ||
                        regexp.test(record.data.type)) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }, this);
                }
            })]
        });
        ui.cmp.ErrorFileGrid.superclass.initComponent.call(this);
        
        this.on('rowcontextmenu', this.onRowContextMenu, this);
        this.on('rowdblclick', this.onRowDblClick, this);
        
        // For EN, we hide the column 'maintainer'
        if (PhDOE.user.lang === 'en') {
            this.getColumnModel().setHidden(2, true);
        }
        
    }
});

// singleton
ui.cmp._ErrorFileGrid.instance = null;
ui.cmp.ErrorFileGrid.getInstance = function(config){
    if (!ui.cmp._ErrorFileGrid.instance) {
        if (!config) {
            config = {};
        }
        ui.cmp._ErrorFileGrid.instance = new ui.cmp.ErrorFileGrid(config);
    }
    return ui.cmp._ErrorFileGrid.instance;
};
