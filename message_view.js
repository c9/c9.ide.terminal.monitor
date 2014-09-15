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
        var handleEmit = plugin.getEmitter();
        var css = require("text!./message_view.css");
        var html = require("text!./message_view.html");
        
        var messageStack = [];

        var loaded = false;
        function load(){
            if (loaded) return false;
            loaded = true;
            
            // Load CSS
            ui.insertCss(css, plugin);
            draw();
        }

        function draw() {
            var beforeReparentNode, afterReparentNode;
            tabManager.on("tabBeforeReparent", function(tab) {
                beforeReparentNode = tab.tab.aml.$pHtmlNode.querySelector('.session_page.curpage');
            });
            
            tabManager.on("tabAfterReparent", function(tab) {
                afterReparentNode = tab.tab.aml.$pHtmlNode.querySelector('.session_page.curpage');
                moveMessages(beforeReparentNode, afterReparentNode);
            });
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
                editorType: "preview",
                active: true,
                document: {
                    preview: {
                        path: e.target.innerText
                    }
                }
            }, function(err, tab) {});
        }
        
        function isAlreadyShowingMessage(messages, text) {
            return messages.some(function(message) {
                return message.text == text;
            });
        }
        
        function showMessageNode(messageNode, referenceNode, referenceMessage) {
            var referenceBoundingRect = referenceNode.getBoundingClientRect();
            var offset = { top: 8, left: 8, right: 8, bottom: 8 };
            var width = referenceBoundingRect.width - offset.right - offset.left;
            var right = window.innerWidth - referenceBoundingRect.right + offset.right;
            var top;
            if (referenceMessage) {
                top = referenceMessage.domNode.getBoundingClientRect().bottom + offset.bottom;
            } else {
                top = referenceBoundingRect.top + offset.top;
            }
            messageNode.style.display = 'block';
            messageNode.style.top = top + 'px';
            messageNode.style.right = right + 'px';
            messageNode.style.width = width + 'px';
            
            setTimeout(function() {
                messageNode.style.opacity = 1;
            });
        }
        
        function createMessageNode(text) {
            var messageNode = ui.insertHtml(null, html, plugin)[0];
            var contentNode = messageNode.querySelector(".message");
            contentNode.innerHTML = text;
            return messageNode;
        }
        
        function setupMessageAction(messageNode, action) {
            if (!action)
                return;
            
            var actionNode = messageNode.querySelector(".cmd");
            actionNode.innerHTML = action.label;
            actionNode.onclick = function() {
                handleEmit('action', action.cmd);
            };
            actionNode.style.display = 'block';
        }
        
        function setupCloseHandler(message) {
            var closeNode = message.domNode.querySelector('.close');
            closeNode.onclick = function() {
                hide(message);
            };
        }
        
        function repositionMessages(referenceNode) {
            var messages = messageStack.filter(function(message) {
                return message.referenceNode == referenceNode;
            });
            
            messages.forEach(function(message, index) {
                if (message.referenceNode != referenceNode)
                    return;
                    
                showMessageNode(message.domNode, message.referenceNode, messageStack[index-1]);
            });
        }
        
        function moveMessages(beforeReparentNode, afterReparentNode) {
            messageStack.forEach(function(message) {
                if (message.referenceNode == beforeReparentNode) {
                    message.referenceNode = afterReparentNode;
                }
            });
            
            repositionMessages(afterReparentNode);
        }
        
        function show(text, action, referenceNode) {
            if (!referenceNode)
                return;

            var messages = messageStack.filter(function(message) {
                return message.referenceNode == referenceNode;
            });
            
            if (isAlreadyShowingMessage(messages, text))
                return;
                
            var messageNode = createMessageNode(text);
            var message = {
                referenceNode: referenceNode,
                domNode: messageNode,
                text: text
            };
            
            setupMessageAction(messageNode, action);
            setupCloseHandler(message);
            
            showMessageNode(messageNode, referenceNode, messages[messages.length-1]);
            
            messageStack.push(message);
        }
        
        function hide(message) {
            if (!messageStack.length)
                return;    
        
            var domNode = message.domNode;
            domNode.style.display = 'none';
            domNode.style.opacity = 0;
            domNode.innerHTML = '';
            domNode.parentNode.removeChild(domNode);
            
            messageStack = messageStack.filter(function(msg) {
                return msg.domNode != domNode;
            });
            
            repositionMessages(message.referenceNode);
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
