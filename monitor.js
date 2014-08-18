define(function(require, exports, module) {
    main.consumes = [
        "c9", "Plugin", "editors", "dialog.error",
        "terminal.monitor.message_view", "tabManager"
    ];
    main.provides = ["terminal.monitor"];
    return main;

    function main(options, imports, register) {
        var c9 = imports.c9;
        var Plugin = imports.Plugin;
        var editors = imports.editors;
        var messageView = imports["terminal.monitor.message_view"];
        var tabManager = imports.tabManager;
        
        var MessageHandler = require("./message_handler");
        var messageMatchers = require("./message_matchers")(c9);
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        var messageHandler = new MessageHandler(messageMatchers.matchers, messageView);
        
        editors.on("create", function(e) {
            if (!e.editor || e.editor.type !== "terminal")
                return;
            
            e.editor.on("documentLoad", function(e) {
                setupTerminalMessageHandler(e.doc.getSession());
            });
        });
        
        function setupTerminalMessageHandler(session) {
            var terminal = session.terminal;
            var seenUpTo = 0;
            var hasResizeCompleted = false;
            
            // 1. On first draw we want the seenUpTo count reflect the amount of lines with output and not empty ones.
            
            // Make sure we mark newlines which we already received as already handled;
            terminal.on("newline", function(e) {
                var y = e.y;
                var linesIndex = y + e.ybase - 1;
                var line = e.lines[linesIndex].map(function(character) { return character[1]; }).join("");

                if (!hasResizeCompleted) {
                    if (line.length) {
                        seenUpTo = e.y;
                    }
                    return;
                }
                    
                if (y - 1 > seenUpTo) return;
                seenUpTo = y;
                
                var tab = session.tab;
                if (tab.isActive() && tabManager.focussedTab === tab) {
                    var referenceNode = tab.aml.$pHtmlNode.querySelector('.session_page.curpage');
                    messageHandler.handleMessage(line, referenceNode);
                }
            });
            
            var resizeTimeout;
            terminal.on("resizeStart", function() {
                hasResizeCompleted = false;
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }
                
                resizeTimeout = setTimeout(function() {
                    resizeTimeout = null;
                    hasResizeCompleted = true;
                }, 1000);
            });
        }
        
        plugin.freezePublicAPI({});
        
        /***** Register and define API *****/
        register(null, {
            "terminal.monitor": plugin
        });
    }
});
