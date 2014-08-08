/**
 * Terminal Module for the Cloud9
 *
 * @copyright 2012, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

define(function(require, exports, module) {
    "use strict";
    
    module.exports = function(c9) {
        var portHostMsg = "Error: you may be using the wrong PORT & HOST for your server app\r\n";
        var messageMatchers = [
            {
                pattern: /Express server listening on port/,
                message: "Your application is running at \u001B[04;36m" + "https://" + c9.hostname
            }, 
            {
                pattern: /INFO\ \ WEBrick::HTTPServer#start: pid=\d+ port=\d+/,
                message: "Your application is running at \u001B[04;36m" + "https://" + c9.hostname
            }, 
            {
                pattern: /server(?: is | )(?:listening|running) (?:at|on)\b/i,
                message: "Your application is running at \u001B[04;36m" + "https://" + c9.hostname
            },
            {
                // Sudo not supported
                pattern: /bash: \/usr\/bin\/sudo: Permission denied/,
                message: "Sorry, you don't have sudo access on this machine"
            },
            {
                // Rails or Sinatra
                pattern: /WARN {1,2}TCPServer Error: (?:Address already in use|Permission denied) - bind\(2\)/,
                message: portHostMsg + "For rails, use: 'rails s -p $PORT -b $IP'\r\n" +
                    "For Sinatra, use: ruby app.rb -p $PORT -o $IP'"
            },
            {
                // Node app
                pattern: /Error: listen (?:EADDRINUSE|EACCES|EADDRNOTAVAIL)/,
                message: portHostMsg + "Node: use 'process.env.PORT' as the port and 'process.env.IP' as the host in your scripts. See also https://c9.io/site/blog/2013/05/can-i-use-cloud9-to-do-x/"
            },
            {
                // Django app
                pattern: /Error: You don't have permission to access that port./,
                message: portHostMsg + "use './manage.py runserver $IP:$PORT' to run your Django application"
            },
            {
                // Tunneling to some database provider
                pattern: /Errno: EACCES Permission Denied - bind\(2\)/,
                message: portHostMsg + "Only binding to the internal IP configured in $IP is supported. See also https://c9.io/site/blog/2013/05/can-i-use-cloud9-to-do-x/"
            },
            {
                // MongoDB
                pattern: /\[initandlisten\] ERROR: listen\(\): bind\(\) failed errno:13 Permission denied for socket: 0\.0\.0\.0:/,
                message: portHostMsg + "Please bind to the internal IP using --bind_ip=$IP"
            },
            {
                // Meteor/generic
                pattern: /Can't listen on port /,
                message: portHostMsg + "Please bind to IP $IP and port $PORT. See also https://c9.io/site/blog/2013/05/can-i-use-cloud9-to-do-x/" 
            },
            {
                // FALLBACK/GENERIC
                pattern: /Permission denied for socket: 0\.0\.0\.0:/,
                message: portHostMsg + "Only binding to the internal IP configured in $IP is supported. See also https://c9.io/site/blog/2013/05/can-i-use-cloud9-to-do-x/"
            }
        ];
        return messageMatchers;
    };
});