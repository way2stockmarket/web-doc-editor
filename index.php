<?php

session_start();

require_once './php/html.templates.php';

// Log the user in if needed
if (!isset($_SESSION['userID'])) {
    echo headerTemplate();
    echo cssLoadTemplate('js/extjs/resources/css/ext-all.css');
    echo cssLoadTemplate('themes/style.css');
    echo jsCallTemplate('document.getElementById("loading-msg").innerHTML = "Loading Core API...";');
    echo jsLoadTemplate('js/extjs/adapter/ext/ext-base.js');
    echo jsCallTemplate('document.getElementById("loading-msg").innerHTML = "Loading UI Components...";');
    echo jsLoadTemplate('js/extjs/ext-all.js');
    echo jsCallTemplate('document.getElementById("loading-msg").innerHTML = "Initializing...";');
    echo jsLoadTemplate('js/login_override.js');
    echo jsLoadTemplate('js/login.js');
    echo footerTemplate();
    exit;
}

echo headerTemplate();
echo cssLoadTemplate('js/extjs/resources/css/ext-all.css');
echo cssLoadTemplate('js/extjs/resources/css/xtheme-default.css', 'appTheme');
// Ext.ux Css files
echo cssLoadTemplate('js/ux/GridSummary/Ext.ux.grid.GridSummary.css');
echo cssLoadTemplate('js/ux/CheckTreePanel/Ext.ux.tree.CheckTreePanel.css');
echo cssLoadTemplate('themes/style.css');
// ExtJs Javascript core files
echo jsCallTemplate('document.getElementById("loading-msg").innerHTML = "Loading Core API...";');
echo jsLoadTemplate('js/extjs/adapter/ext/ext-base.js');
echo jsCallTemplate('document.getElementById("loading-msg").innerHTML = "Loading UI Components...";');
echo jsLoadTemplate('js/extjs/ext-all.js');
// Ext.ux Javascript files
echo jsCallTemplate('document.getElementById("loading-msg").innerHTML = "Initializing...";');
echo jsLoadTemplate('js/ux/GridSummary/Ext.ux.grid.GridSummary.js');
echo jsLoadTemplate('js/ux/miframe1_2/miframe.js');
echo jsLoadTemplate('js/ux/md5/md5.js');
echo jsLoadTemplate('js/ux/codemirror/js/codemirror.js');
echo jsLoadTemplate('js/ux/Ext.ux.CodeMirror.js');
echo jsLoadTemplate('js/ux/CheckTreePanel/Ext.ux.tree.CheckTreePanel.js');
echo jsLoadTemplate('js/main_override.js');
echo jsLoadTemplate('js/main.js');

if (isset($_SESSION['directAccess']) && is_object($_SESSION['directAccess'])) {
    $directAccess = 'var directAccess = {"lang":"'.$_SESSION['directAccess']->lang.'", "path":"'.$_SESSION['directAccess']->path.'", "name":"'.$_SESSION['directAccess']->name.'"}';
    $_SESSION['directAccess'] = '';
} else {
    $directAccess = 'var directAccess = false;';
}
echo jsCallTemplate($directAccess);

echo footerTemplate();