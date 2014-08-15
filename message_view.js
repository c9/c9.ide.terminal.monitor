define(function(require, exports, module) {
    main.consumes = [
        "Plugin", "ui"
    ];
    main.provides = ["terminal.monitor.message_view"];
    return main;

    function main(options, imports, register) {
        var ui = imports.ui;
        var Plugin = imports.Plugin;
        
        /***** Initialization *****/

        var plugin = new Plugin("Ajax.org", main.consumes);
        var css = require("text!./message_view.css");

        var containerNode, contentNode;

        var loaded = false;
        function load(){
            if (loaded) return false;
            loaded = true;
            
            // Load CSS
            ui.insertCss(css, plugin);
            
            draw();
        }

        function draw(){
            // Create HTML elements
            var html = require("text!./message_view.html");
            containerNode = ui.insertHtml(null, html, plugin)[0];
            contentNode = containerNode.querySelector(".message");

            apf.addEventListener("movefocus", hide);
        }
        
        function show(message, referenceNode) {
            if (!containerNode)
                return;
            
            var boundingRect = referenceNode.getBoundingClientRect();
            var offset = { top: 8, left: 12 };
            var top = boundingRect.top + boundingRect.height + offset.top;
            var left = boundingRect.left + offset.left;
            
            contentNode.innerHTML = message;
            containerNode.style.display = 'block';
            containerNode.style.top = top + 'px';
            containerNode.style.left = left + 'px';
            
            containerNode.focus();
        }
        
        function hide() {
            if (!containerNode)
                return;
            
            containerNode.style.display = 'none';
            contentNode.innerHTML = '';
        }
        
        plugin.on("load", function(){
            load();
        });
        
        plugin.freezePublicAPI({
            show: show,
            hide: hide
        });

        register(null, {
            "terminal.monitor.message_view": plugin
        });
    }
});