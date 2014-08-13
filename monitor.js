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
            
            terminal.on('data', function(data) {
                messageHandler.handleMessage(data);
            });
        }
        
        plugin.freezePublicAPI({});
        
        /***** Register and define API *****/
        register(null, {
            "terminal.monitor": plugin
        });
    }
});
