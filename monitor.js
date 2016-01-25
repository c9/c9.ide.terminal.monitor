define(function(require, exports, module) {
    main.consumes = [
        "c9", "Plugin", "editors", "dialog.error",
        "terminal.monitor.message_view", "tabManager", "error_handler",
        "proc"
    ];
    main.provides = ["terminal.monitor"];
    return main;

    function main(options, imports, register) {
        var BASHBIN = options.bashBin ||  "/bin/bash";
        
        var c9 = imports.c9;
        var Plugin = imports.Plugin;
        var editors = imports.editors;
        var messageView = imports["terminal.monitor.message_view"];
        var tabManager = imports.tabManager;
        var errorHandler = imports.error_handler;
        var proc = imports.proc;
        
        var MessageHandler = require("./message_handler");
        var messageMatchers = require("./message_matchers")(c9);
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        var messageHandler = new MessageHandler(messageMatchers.matchers, messageView);
        
        var loaded = false;
        function load() {
            if (loaded) return false;
            loaded = true;
            
            messageView.on("action", function(cmd, message) {
                proc.execFile(BASHBIN, {
                    args: ["--login", "-c", cmd]
                }, function() {
                    messageHandler.hide(message);
                });
            }, plugin);
            
            editors.on("create", function(e) {
                if (!e.editor || e.editor.type !== "terminal" && e.editor.type !== "output")
                    return;
                
                e.editor.on("documentLoad", onDocumentLoad);
            }, plugin);
            
            function onDocumentLoad(e) {
                var session = e.doc.getSession();
                session.once("terminalReady", setupTerminalMessageHandler);
            }
        }
        
        function setupTerminalMessageHandler(session) {
            var terminal = session.terminal;
            var seenUpTo = 0;
            var lastNewLine = 0;
            var hasResizeCompleted = false;
            var timer = null;
            
            function handleMessage(message) {
                var tab = session.tab;
                if (tab.isActive() && tabManager.focussedTab === tab) {
                    messageHandler.handleMessage(message, tab);
                }
            }
            terminal.on("discardOldScrollback",  function(e) {
                seenUpTo = Math.max(seenUpTo - e, 0);
                if (lastNewLine) 
                    lastNewLine -= e;
            });
            terminal.on("newline", function(e) {
                lastNewLine = e.y + e.ybase - 1;
                if (!timer)
                    timer = setTimeout(checkNewText);
            });
            function checkNewText() {
                timer = null;
                if (!hasResizeCompleted) {
                    return;
                }
                var lines = terminal.lines;
                if (lastNewLine >= lines.length) lastNewLine = lines.length - 1;
                var lineContents = "";
                for (var i = Math.min(seenUpTo + 1, lastNewLine); i <= lastNewLine; i++) {
                    var line = lines[i];
                    if (!line)
                        continue;
                    lineContents += lineToString(line);
                    if (line.wrapped)
                        continue;
                    seenUpTo = i;
                    handleMessage(lineContents);
                    lineContents = "";
                }
            }
            
            var resizeTimeout;
            terminal.on("resizeStart", function() {
                hasResizeCompleted = false;
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }
                
                messageHandler.reposition(session.tab);
                
                resizeTimeout = setTimeout(function() {
                    resizeTimeout = null;
                    hasResizeCompleted = true;
                }, 1000);
            });
        }
        
        function lineToString(line) {
            return line.map(function(character) {
                return character && character[1];
            }).join("");
        }
        
        /***** Lifecycle *****/
        
        plugin.on("load", function() {
            load();
        });
        
        plugin.on("unload", function() {
             loaded = false;
        });
        
        plugin.freezePublicAPI({});
        
        /***** Register and define API *****/
        register(null, {
            "terminal.monitor": plugin
        });
    }
});
