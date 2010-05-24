Ext.namespace('ui', 'ui.task');

// config - {prefix, ftype, fid, fpath, fname, lang, storeRecord}
ui.task.SaveFileTask = function(config)
{
    Ext.apply(this, config);

    var id_prefix = this.prefix + '-' + this.ftype,
        msg       = Ext.MessageBox.wait(_('Saving data...'));

    XHR({
        scope  : this,
        params : {
            task        : 'saveFile',
            filePath    : this.fpath,
            fileName    : this.fname,
            fileLang    : this.lang,
            fileContent : Ext.getCmp(this.prefix + '-' + this.ftype +
                                        '-FILE-' + this.fid).getCode()
        },
        success : function(r)
        {
            var o = Ext.util.JSON.decode(r.responseText);

            if (this.prefix === 'FNU') {
                // Update our store
                if( this.ftype === 'EN' ) {
                    this.storeRecord.set('en_revision', o.revision);
                    this.storeRecord.set('fileModifiedEN', '{"user":"' + PhDOE.user.login + '", "anonymousIdent":"' + PhDOE.user.anonymousIdent + '"}');
                } else {
                    this.storeRecord.set('revision', o.en_revision);
                    this.storeRecord.set('fileModifiedLang', '{"user":"' + PhDOE.user.login + '", "anonymousIdent":"' + PhDOE.user.anonymousIdent + '"}');
                    this.storeRecord.set('maintainer', o.maintainer);
                }
                this.storeRecord.commit();
            }

            if (this.prefix === 'FE') {
                // Update our store
                if( this.ftype === 'EN' ) {
                    this.storeRecord.set('fileModifiedEN', '{"user":"' + PhDOE.user.login + '", "anonymousIdent":"' + PhDOE.user.anonymousIdent + '"}');
                    this.storeRecord.commit();
                } else {
                    this.storeRecord.set('maintainer', o.maintainer);
                    this.storeRecord.set('fileModifiedLang', '{"user":"' + PhDOE.user.login + '", "anonymousIdent":"' + PhDOE.user.anonymousIdent + '"}');
                    this.storeRecord.commit();
                }
            }
            
            if (this.prefix === 'FNR') {
                // Update our store
                if( this.ftype === 'EN' ) {
                    this.storeRecord.set('reviewed', o.reviewed);
                    this.storeRecord.set('fileModifiedEN', '{"user":"' + PhDOE.user.login + '", "anonymousIdent":"' + PhDOE.user.anonymousIdent + '"}');
                    this.storeRecord.commit();
                } else {
                    this.storeRecord.set('maintainer', o.maintainer);
                    this.storeRecord.set('fileModifiedLang', '{"user":"' + PhDOE.user.login + '", "anonymousIdent":"' + PhDOE.user.anonymousIdent + '"}');
                    this.storeRecord.commit();

                }
            }

            if (this.prefix === 'AF') {
                this.storeRecord.getUI().addClass('fileModifiedByMe'); // tree node
            }

            // Add this files into WorkTreeGrid. Before, we delete it from WorkTreeGrid if this file have been same by anothers users.
            ui.cmp.WorkTreeGrid.getInstance().delRecord(o.id);
			ui.cmp.PatchesTreeGrid.getInstance().delRecord(o.id);
			
            ui.cmp.WorkTreeGrid.getInstance().addRecord(
                o.id, this.lang + this.fpath, this.fname, 'update'
            );

            // reset file
            Ext.getCmp(id_prefix + '-FILE-' + this.fid + '-btn-save').disable();
            Ext.getCmp(id_prefix + '-FILE-' + this.fid).isModified = false;

            Ext.getCmp(id_prefix + '-PANEL-' + this.fid).setTitle(
                Ext.getCmp(id_prefix + '-PANEL-' + this.fid).permlink +
                Ext.getCmp(id_prefix + '-PANEL-' + this.fid).originTitle
            );

            var cmp;
            if( this.lang === 'en' ) {
                cmp = Ext.getCmp(this.prefix + '-LANG-FILE-' + this.fid);
            } else {
                cmp = Ext.getCmp(this.prefix + '-EN-FILE-' + this.fid);
            }

            if (this.ftype === 'ALL' || !cmp.isModified) {
                // reset tab-panel
                Ext.getCmp(this.prefix + '-' + this.fid).setTitle(
                    Ext.getCmp(this.prefix + '-' + this.fid).originTitle
                );
            }

            // Remove wait msg
            msg.hide();

            // Notify
            PhDOE.notify('info', _('Document saved'), String.format(_('Document <br><br><b>{0}</b><br><br> was saved successfully !'), this.lang + this.fpath + this.fname));
        },
        failure : function(r)
        {
            var o = Ext.util.JSON.decode(r.responseText);

            // Remove wait msg
            msg.hide();
            if( o.type ) {
                PhDOE.winForbidden(o.type);
            } else {
                PhDOE.winForbidden();
            }
        }
    });
};