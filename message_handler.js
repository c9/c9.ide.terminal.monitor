/**
 * Terminal Module for the Cloud9
 *
 * @copyright 2012, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

define(function(require, exports, module) {
    "use strict";
    
    var MessageHandler = function(messageMatchers) {
        this.messageMatchers = messageMatchers;
        this.queue = [];
    };
    
    var proto = MessageHandler.prototype;

    proto.setTerminal = function(terminal) {
        this.terminal = terminal;
    };
    
    proto.handleMessage = function(data) {
        if (!this.terminal) {
            this.queue.push(data);
            return;
        }
        
        if (this.queue.length) {
            this.matchMessage(this.queue.join());
            this.queue = [];
        }
        
        this.matchMessage(data);
    };
    
    proto.matchMessage = function(data) {
        this.messageMatchers.forEach(function(trigger) {
            trigger.pattern.test(data) && this.formatMessage(trigger.message);
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
        terminal.write("\u001B[00m\n");
    }
    
    module.exports = MessageHandler;
});