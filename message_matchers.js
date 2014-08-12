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
                appRunning: "Your code is running at \u001B[04;36m" + "https://" + c9.hostname
            },
            rails: {
                wrongPortIP: wrongPortIP + "For rails, use: 'rails s -p $PORT -b $IP'\r\n" +
                    "For Sinatra, use: ruby app.rb -p $PORT -o $IP'"
            }
            
        };
        
        var matchers = [
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
                message: wrongPortIP + "Node: use 'process.env.PORT' as the port and 'process.env.IP' as the host in your scripts."
            },
            {
                // Django app
                pattern: /Error: You don't have permission to access that port./,
                message: wrongPortIP + "use './manage.py runserver $IP:$PORT' to run your Django application."
            },
            {
                // Tunneling to some database provider
                pattern: /Errno: EACCES Permission Denied - bind\(2\)/,
                message: wrongPortIP + "Only binding to the internal IP configured in $IP is supported."
            },
            {
                // MongoDB
                pattern: /\[initandlisten\] ERROR: listen\(\): bind\(\) failed errno:13 Permission denied for socket: 0\.0\.0\.0:/,
                message: wrongPortIP + "Please bind to the internal IP using --bind_ip=$IP"
            },
            {
                // Meteor/generic
                pattern: /Can't listen on port /,
                message: wrongPortIP + "Please bind to IP $IP and port $PORT." 
            },
            {
                // FALLBACK/GENERIC
                pattern: /Permission denied for socket: 0\.0\.0\.0:/,
                message: wrongPortIP + "Only binding to the internal IP configured in $IP is supported."
            }
        ];
        return {
            matchers: matchers,
            messages: messages
        };
    };
});