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
    
    
    // Mocks
    var terminal = {
        writeln: function() {}
    };
    
    var c9 = {
        hostname: 'c9.io'
    };
    
    var messageMatchers = messageMatchers(c9);
    var matchers = messageMatchers.matchers;
    var messages = messageMatchers.messages;
    
    describe("Message handler", function() {
        var messageHandler;
        var formatMessageSpy;
        beforeEach(function() {
            messageHandler = new MessageHandler(matchers);
            messageHandler.setTerminal(terminal);
            formatMessageSpy = sinon.spy(messageHandler, "formatMessage");
            
        });
        it("should translate `App running at: http://0.0.0.0:8080/`", function() {
            messageHandler.handleMessage("App running at: http://0.0.0.0:8080/");
            expect(formatMessageSpy.calledWith(messages.generic.appRunning)).to.equal(true)
        });
        it("should translate `App running at: http://0.0.0.0:8081/`", function() {
            messageHandler.handleMessage("App running at: http://0.0.0.0:8081/");
            expect(formatMessageSpy.calledWith(messages.generic.wrongPortIP)).to.equal(true)
        });
        it("should translate `Running dev server: http://0.0.0.0:8080`", function() {
            messageHandler.handleMessage("Server running on http://0.0.0.0:8080");
            expect(formatMessageSpy.calledWith(messages.generic.appRunning)).to.equal(true)
        });
        it("should translate `Running dev server: http://0.0.0.0:8081`", function() {
            messageHandler.handleMessage("Server running on http://0.0.0.0:8081");
            expect(formatMessageSpy.calledWith(messages.generic.wrongPortIP)).to.equal(true)
        });
        it("should translate `Running dev server: http://0.0.0.0:8081`", function() {
            messageHandler.handleMessage("Server running on http://0.0.0.0:8081");
            expect(formatMessageSpy.calledWith(messages.generic.wrongPortIP)).to.equal(true)
        });
    });
        
    onload && onload();
    
});