/**
 * Terminal Module for the Cloud9
 *
 * @copyright 2012, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

define(function(require, exports, module) {
    "use strict";
    
    module.exports = function(c9) {
        
        var prefix = '<strong>Cloud9 Help</strong> ';
        var wrongPortIP = "You may be using the wrong PORT & IP for your server application.";
        
        var messages = {
            generic: {
                wrongPortIP: prefix + wrongPortIP + "Try passing $PORT and $IP to properly launch your application. You can find more information <a href='https://docs.c9.io/running_and_debugging_code.html'>in our docs.</a>",
                appRunning: prefix + "Your code is running at <a href='javascript://' data-type='preview'>https://" + c9.hostname + "</a>",
                bindToInternalIP: prefix + wrongPortIP + "Only binding to the internal IP configured in $IP is supported."
            },
            rails: {
                wrongPortIP: prefix + wrongPortIP + "For rails, use: 'rails s -p $PORT -b $IP'. For Sinatra, use: ruby app.rb -p $PORT -o $IP'."
            },
            node: {
                wrongPortIP: prefix + wrongPortIP + " Use 'process.env.PORT' as the port and 'process.env.IP' as the host in your scripts or <a href='https://docs.c9.io/running_and_debugging_code.html' target='_blank'>refer to the documentation for more information</a>."
            },
            django: {
                wrongPortIP: prefix + wrongPortIP + " Use './manage.py runserver $IP:$PORT' to run your Django application."
            }
            
        };
        
        //Starting development server at http://0.0.0.0:8080/
        
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
                // Django correct port
                patterm: /Starting development server at.*?(?=8080)/i,
                message: messages.generic.appRunning
            },
            {
                // Django app wrong port
                pattern: /Error: You don't have permission to access that port./,
                message: messages.django.wrongPortIP
            },
            {
                // Django app wrong port
                pattern: /Error: That port is already in use./,
                message: messages.django.wrongPortIP
            },
            {
                // FALLBACK/GENERIC
                pattern: /Permission denied for socket: 0\.0\.0\.0/,
                message: messages.generic.bindToInternalIP
            }
        ];
        return {
            matchers: matchers,
            messages: messages
        };
    };
});
