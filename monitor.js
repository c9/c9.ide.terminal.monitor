define(function(require, exports, module) {
    main.consumes = [
        "c9", "Plugin", "editors", "dialog.error"
    ];
    main.provides = ["terminal.monitor"];
    return main;

    function main(options, imports, register) {
        var c9 = imports.c9;
        var Plugin = imports.Plugin;
        var editors = imports.editors;
        var messageView = imports["dialog.error"];
        var MessageHandler = require("./message_handler");
        var messageMatchers = require("./message_matchers")(c9);
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        
        editors.on("create", function(e) {
            if (!e.editor || e.editor.type !== "terminal")
                return;
            
            setupTerminalMessageHandler(e.editor);    
        });
        
        function setupTerminalMessageHandler(terminal) {
            var messageHandler = new MessageHandler(messageMatchers.matchers, messageView);
            
            var seenUpTo = 0;
            var redraw = true;
            var initialize = true;
            
            // Make sure we mark newlines which we already received as already handled;
            terminal.on("newline", function(e) {
                var y = e.y;
                var linesY = y + e.ybase;
                
                var line = e.lines[linesY - 1].map(function(character) { return character[1]; }).join("");
                if (redraw && line.length) {
                    seenUpTo = e.y;
                }
                
                if (e.y - 1 > seenUpTo || redraw) return;
                
                var line = e.lines[linesY - 1].map(function(character) { return character[1]; }).join("");
                seenUpTo = e.y;
                
                messageHandler.handleMessage(line);
            });
            
            terminal.on("afterConnect", function() {
                redraw = false;
                initialize = false;
                console.log("afterConnect");
            });
            
            terminal.on("resize", function() {
                redraw = true;
                !initialize && setTimeout(function() {
                    redraw = false;
                }, 500);
            });
        }
        
        plugin.freezePublicAPI({});
        
        /***** Register and define API *****/
        register(null, {
            "terminal.monitor": plugin
        });
    }
});
