/*global describe:false, it:false */

"use client";

require([
    "lib/architect/architect", 
    "lib/chai/chai", 
    "sinon",
    "./plugins/c9.ide.terminal.monitor/message_handler",
    "./plugins/c9.ide.terminal.monitor/message_matchers"
], function (architect, chai, sinon, MessageHandler, messageMatchers) {
    var expect = chai.expect;
    var c9 = {
        hostname: 'c9.io'
    };
    
    messageMatchers = messageMatchers(c9);
    var matchers = messageMatchers.matchers;
    var messages = messageMatchers.messages;
    
    describe("Message handler", function() {
        var messageHandler;
        var formatMessageSpy;
        var messageView;
        beforeEach(function() {
            messageView = { show: function() {} };
            messageHandler = new MessageHandler(matchers, messageView);
            formatMessageSpy = sinon.spy(messageView, "show");
            
        });
        it("catches generic (listening at) wrong port", function() {
            messageHandler.handleMessage("Server listening at http://localhost:3000/");
            expect(formatMessageSpy.calledWith(messages.generic.wrongPortIP)).to.equal(true);
        });
        it("catches generic (listening at) running", function() {
            messageHandler.handleMessage("Server listening at http://localhost:8080/");
            expect(formatMessageSpy.calledWith(messages.generic.appRunning)).to.equal(true);
        });
        it("catches generic (is listening at) wrong port", function() {
            messageHandler.handleMessage("Server is listening at http://localhost:3000/");
            expect(formatMessageSpy.calledWith(messages.generic.wrongPortIP)).to.equal(true);
        });
        it("catches generic (is listening at) running", function() {
            messageHandler.handleMessage("Server is listening at http://localhost:8080/");
            expect(formatMessageSpy.calledWith(messages.generic.appRunning)).to.equal(true);
        });
        it("catches generic (is running on) wrong port", function() {
            messageHandler.handleMessage("Server is running on http://localhost:3000/");
            expect(formatMessageSpy.calledWith(messages.generic.wrongPortIP)).to.equal(true);
        });
        it("catches generic (is running on) running", function() {
            messageHandler.handleMessage("Server is running on http://localhost:8080/");
            expect(formatMessageSpy.calledWith(messages.generic.appRunning)).to.equal(true);
        });
        it("catches ionic wrong port", function() {
            messageHandler.handleMessage("Running dev server: http://0.0.0.0:8081/");
            expect(formatMessageSpy.calledWith(messages.generic.wrongPortIP)).to.equal(true);
        });
        it("catches ionic running", function() {
            messageHandler.handleMessage("Running dev server: http://0.0.0.0:8080/");
            expect(formatMessageSpy.calledWith(messages.generic.appRunning)).to.equal(true);
        });
        it("catches meteor wrong port", function() {
            messageHandler.handleMessage("App running at: http://localhost:3000/");
            expect(formatMessageSpy.calledWith(messages.generic.wrongPortIP)).to.equal(true);
        });
        it("catches meteor running", function() {
            messageHandler.handleMessage("App running at: http://localhost:8080/");
            expect(formatMessageSpy.calledWith(messages.generic.appRunning)).to.equal(true);
        });
        it("catches Webrick running", function() {
            messageHandler.handleMessage("mostafaeweda@demo-project\r\n\
                INFO  WEBrick::HTTPServer#start: pid=5462 port=8080");
            expect(formatMessageSpy.calledWith(messages.generic.appRunning)).to.equal(true);
        });
        it("catches rails/sinatra address in use error", function() {
            messageHandler.handleMessage("WARN  TCPServer Error: Address already in use - bind(2)");
            expect(formatMessageSpy.calledWith(messages.rails.wrongPortIP)).to.equal(true);
        });
        it("catches node address in use error", function() {
            messageHandler.handleMessage("events.js:48\n\
                    throw arguments[1]; // Unhandled 'error' event\n\
                    Error: listen EADDRINUSE\n\
                    at errnoException (net.js:670:11)\n\
                    at Array.0 (net.js:771:26)\n\
                    at EventEmitter._tickCallback (node.js:190:38)\n");
            expect(formatMessageSpy.calledWith(messages.node.wrongPortIP)).to.equal(true);
        });
    
        it("catches node permission error", function() {
            messageHandler.handleMessage("events.js:48\n\
                    throw arguments[1]; // Unhandled 'error' event\n\
                    Error: listen EACCESS\n\
                    at errnoException (net.js:670:11)\n\
                    at Array.0 (net.js:771:26)\n\
                    at EventEmitter._tickCallback (node.js:190:38)\n");
            expect(formatMessageSpy.calledWith(messages.node.wrongPortIP)).to.equal(true);
        });
        
        it("catches django error", function () {
            messageHandler.handleMessage("Error: You don't have permission to access that port.\n");
            expect(formatMessageSpy.calledWith(messages.django.wrongPortIP)).to.equal(true);
        });
        
        it("catches permission denied for socket", function() {
            messageHandler.handleMessage("Permission denied for socket: 0.0.0.0\n");
            expect(formatMessageSpy.calledWith(messages.generic.bindToInternalIP)).to.equal(true);
        });
    });
        
    onload && onload();
    
});
