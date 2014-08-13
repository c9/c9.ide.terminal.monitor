/**
 * Terminal Module for the Cloud9
 *
 * @copyright 2012, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

define(function(require, exports, module) {
    "use strict";
    
    var MessageHandler = function(messageMatchers, messageView) {
        this.messageMatchers = messageMatchers;
        this.messageView = messageView;
    };
    
    var proto = MessageHandler.prototype;

    proto.handleMessage = function(data) {
        this.messageMatchers.forEach(function(trigger) {
            trigger.pattern.test(data) && this.formatMessage(trigger.message);
        }, this);
    };
    
    proto.formatMessage = function(message) {
        this.messageView.show('Cloud9 Help: ' + message);
    };
    
    module.exports = MessageHandler;
});
