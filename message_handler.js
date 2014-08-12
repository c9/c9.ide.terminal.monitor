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
        var terminal = this.terminal;
        var lines = message.split("\r\n");
        var cloudyMsg = ["\u001B[34m\u001B[1mCloud9\u001B[m: "];
        terminal.writeln("");
        var startLine = lines.length < cloudyMsg.length ? 1 : 0;
        for (var i = 0, n = Math.max(cloudyMsg.length, lines.length); i < n; i++) {
            terminal.writeln((cloudyMsg[i] || new Array(9).join(" ")) +
                "\u001B[00m" + (lines[i-startLine] || ""));
        }
        terminal.writeln("\u001B[00m");
    }
    
    module.exports = MessageHandler;
});