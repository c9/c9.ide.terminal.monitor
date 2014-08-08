define(function(require, exports, module) {
    main.consumes = [
        "c9", "Plugin", "editors"
    ];
    main.provides = ["terminal.monitor"];
    return main;

    function main(options, imports, register) {
        var c9 = imports.c9;
        var Plugin = imports.Plugin;
        var editors = imports.editors;
        
        var plugin = new Plugin("Ajax.org", main.consumes);
        
        var servers = [
            /Express server listening on port/,
            /INFO\ \ WEBrick::HTTPServer#start: pid=\d+ port=\d+/,
            /server(?: is | )(?:listening|running) (?:at|on)\b/i
        ];
        
        /***** Lifecycle *****/
        editors.on("create", function(e) {
            if (!e.editor || e.editor.type !== "terminal")
                return;
                
            var terminal = e.editor;
            var monitor = new Monitor();
            
            terminal.on('data', function(data) {
                monitor.testServerMessages(data);
            });
            
            terminal.on("documentLoad", function(e) {
                monitor.setTerminal(e.doc.getSession().terminal);
            });
        });
        
        var Monitor = function() {};
        
        var proto = Monitor.prototype;

        proto.applicationMessage = "Your application is running at \u001B[04;36m" + "https://" + c9.hostname;
        
        proto.setTerminal = function(terminal) {
            this.terminal = terminal;
        };
        
        proto.testServerMessages = function(data) {
            servers.forEach(function(server) {
                server.test(data) && this.formatMessage(this.applicationMessage);
            }, this);
        };
        
        proto.formatMessage = function(message) {
            var terminal = window.tr = this.terminal;
            var lines = message.split("\r\n");
            var cloudyMsg = [" \u001B[30;47m\u001B[01;38;7;32m      \u001B[00m  ",
            "\u001B[00m\u001B[30;47m\u001B[01;38;7;32m Cloud9 \u001B[00m ",
            "\u001B[00m \u001B[30;47m\u001B[01;38;7;32m      \u001B[00m  "];
            terminal.writeln("");
            var startLine = lines.length < cloudyMsg.length ? 1 : 0;
            for (var i = 0, n = Math.max(cloudyMsg.length, lines.length); i < n; i++) {
                terminal.writeln((cloudyMsg[i] || new Array(7).join(" ")) +
                    "\u001B[36m" + (lines[i-startLine] || ""));
            }
            terminal.write("\u001B[00m");
        }
        
        plugin.freezePublicAPI({});
        
        /***** Register and define API *****/
        register(null, {
            "terminal.monitor": plugin
        });
    }
});
