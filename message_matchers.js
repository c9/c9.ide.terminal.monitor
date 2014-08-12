/**
 * Terminal Module for the Cloud9
 *
 * @copyright 2012, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

define(function(require, exports, module) {
    "use strict";
    
    module.exports = function(c9) {
        
        var wrongPortIP = "You may be using the wrong PORT & IP for your server application.\r\n";
        
        var messages = {
            generic: {
                wrongPortIP: wrongPortIP + "Try passing $PORT and $IP to properly launch your application.",
                appRunning: "Your code is running at \u001B[04;36m" + "https://" + c9.hostname,
                bindToInternalIP: wrongPortIP + "Only binding to the internal IP configured in $IP is supported."
            },
            rails: {
                wrongPortIP: wrongPortIP + "For rails, use: 'rails s -p $PORT -b $IP'\r\n" +
                    "For Sinatra, use: ruby app.rb -p $PORT -o $IP'"
            },
            node: {
                wrongPortIP: wrongPortIP + "Node: use 'process.env.PORT' as the port and 'process.env.IP' as the host in your scripts."
            },
            django: {
                wrongPortIP: wrongPortIP + "use './manage.py runserver $IP:$PORT' to run your Django application."
            }
            
        };
        
        var matchers = [
            {
                // Generic
                pattern: /server(?: is | )(?:listening|running) (?:at|on).*?(?=\d{4})(?!8080)/i,
                message: messages.generic.wrongPortIP
            },
            {
                // Generic correct port
                pattern: /server(?: is | )(?:listening|running) (?:at|on).*?(?=8080)/i,
                message: messages.generic.appRunning
            },
            {
                // Ionic, Meteor wrong port
                pattern: /(Running dev server:|App running at:).*?:(?=\d{4})(?!8080)/,
                message: messages.generic.wrongPortIP
            },
            {
                // Ionic, Meteor correct port
                pattern: /(Running dev server:|App running at:).*?:(?=8080)/,
                message: messages.generic.appRunning
            },
            {
                // WEBrick
                pattern: /INFO\ \ WEBrick::HTTPServer#start: pid=\d+ port=\d+/,
                message: messages.generic.appRunning
            },
            {
                // Rails or Sinatra
                pattern: /WARN {1,2}TCPServer Error: (?:Address already in use|Permission denied) - bind\(2\)/,
                message: messages.rails.wrongPortIP
            },
            {
                // Node app
                pattern: /Error: listen (?:EADDRINUSE|EACCES|EADDRNOTAVAIL)/,
                message: messages.node.wrongPortIP
            },
            {
                // Django app
                pattern: /Error: You don't have permission to access that port./,
                message: messages.django.wrongPortIP
            },
            {
                // FALLBACK/GENERIC
                pattern: /Permission denied for socket: 0\.0\.0\.0q/,
                message: messages.generic.bindToInternalIP
            }
        ];
        return {
            matchers: matchers,
            messages: messages
        };
    };
});
