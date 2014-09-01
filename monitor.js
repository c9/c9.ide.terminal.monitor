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
        var _ = require('lodash');
        
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
            
            function handleMessage(message) {
                var tab = session.tab;
                if (tab.isActive() && tabManager.focussedTab === tab) {
                    var referenceNode = tab.aml.$pHtmlNode.querySelector('.session_page.curpage');
                    messageHandler.handleMessage(message, referenceNode);
                }
            }
            
            terminal.on("newline", function(e) {
                var y = e.y;
                var linesIndex = y + e.ybase - 1;
                
                if (!_.isArray(e.lines[linesIndex]))
                    return;
                
                var line = e.lines[linesIndex].map(function(character) { return character[1]; }).join("");
                
                if (!hasResizeCompleted) {
                    if (line.length) {
                        seenUpTo = e.y;
                    }
                    return;
                }
                
                // There are cases where newline doesn't fire for a "rendered" newline.
                // Making sure that we check lines when we encounter these gaps.
                while (seenUpTo < y) {
                    seenUpTo++;
                    var tmpLinesIndex = seenUpTo + e.ybase - 1;
                    var tmpLine = e.lines[tmpLinesIndex].map(function(character) { return character[1]; }).join("");
                    handleMessage(tmpLine);
                }

                if (y - 1 > seenUpTo) return;
                seenUpTo = y;
                
                handleMessage(line);
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
