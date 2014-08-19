define(function(require, exports, module) {
    main.consumes = [
        "Plugin", "ui", "tabManager"
    ];
    main.provides = ["terminal.monitor.message_view"];
    return main;

    function main(options, imports, register) {
        var ui = imports.ui;
        var Plugin = imports.Plugin;
        var tabManager = imports.tabManager;
        
        /***** Initialization *****/

        var plugin = new Plugin("Ajax.org", main.consumes);
        var css = require("text!./message_view.css");
        
        tabManager.on("tabDestroy", function() {
            hide();
        });
        
        tabManager.on("tabBeforeReparent", function() {
            hide();
        });

        var containerNode, contentNode, isVisible = false;

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
            contentNode.addEventListener("click", handleClick);
        }
        
        function handleClick(e) {
            switch (e.target.getAttribute("data-type")) {
                case "preview": 
                    handlePreview(e);    
                default:
                    hide();
            }
        }
        
        function handlePreview(e) {
            e.preventDefault();
            tabManager.open({
                editorType : "preview",
                active     : true,
                document   : {
                    preview : {
                        path: e.target.innerText
                    }
                }
            }, function(err, tab) {});
        }
        
        function show(message, referenceNode) {
            if (!containerNode)
                return;

            var referenceBoundingRect = referenceNode.getBoundingClientRect();
            var offset = { top: 8, left: 8, right: 8 };
            var top = referenceBoundingRect.top + offset.top;
            var left = referenceBoundingRect.left + offset.left;
            var width = referenceBoundingRect.width - offset.right - offset.left;
            
            contentNode.innerHTML = message;
            containerNode.style.display = 'block';
            containerNode.style.top = top + 'px';
            containerNode.style.left = left + 'px';
            containerNode.style.width = width + 'px';
            
            setTimeout(function() {
                containerNode.style.opacity = 1;
            });
            
            document.addEventListener("mousedown", hide);
            document.addEventListener("click", hide);
            
            isVisible = true;
        }
        
        function hide() {
            if (!containerNode || !isVisible)
                return;
            
            containerNode.style.display = 'none';
            containerNode.style.opacity = 0;
            contentNode.innerHTML = '';
            
            document.removeEventListener("mousedown", hide);
            document.removeEventListener("click", hide);
            
            isVisible = false;
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
