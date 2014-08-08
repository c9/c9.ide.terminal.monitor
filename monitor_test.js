/*global describe:false, it:false */

"use client";

require(["lib/architect/architect", "lib/chai/chai"], function (architect, chai) {
    var expect = chai.expect;

    expect.setupArchitectTest([
        "plugins/c9.core/ext",
        {
            packagePath: "plugins/c9.ide.terminal.monitor/monitor"
        },
        // Mock plugins
        {
            consumes: [],
            provides: ["c9"],
            setup: expect.html.mocked
        },
        {
            consumes: ["terminal.monitor"],
            provides: [],
            setup: main
        }
    ], architect);
    
    function main(options, imports, register) {
        var monitor = imports["terminal.monitor"];
        
        describe("monitor", function() {
            it("should work translate `Server running on 0.0.0.0:8080` to `Server running on https://undefined`", function() {
                var data = monitor.processData("Server running on 0.0.0.0:8080");
                expect(data).to.equal("Server running on https://undefined");
            });
            it("should work translate `Server running on http://0.0.0.0:8080` to `Server running on https://undefined`", function() {
                var data = monitor.processData("Server running on http://0.0.0.0:8080");
                expect(data).to.equal("Server running on https://undefined");
            });
            it("should work translate `Server running on https://0.0.0.0:8080` to `Server running on https://undefined`", function() {
                var data = monitor.processData("Server running on https://0.0.0.0:8080");
                expect(data).to.equal("Server running on https://undefined");
            });
            it("should work translate `Server running on localhost:3000` to `Server running on https://undefined`", function() {
                var data = monitor.processData("Server running on localhost:3000");
                expect(data).to.equal("Server running on https://undefined");
            });
            it("should work translate `Server running on http://localhost:3000` to `Server running on https://undefined`", function() {
                var data = monitor.processData("Server running on http://localhost:3000");
                expect(data).to.equal("Server running on https://undefined");
            });
            it("should work translate `Server running on https://localhost:3000` to `Server running on https://undefined`", function() {
                var data = monitor.processData("Server running on https://localhost:3000");
                expect(data).to.equal("Server running on https://undefined");
            });
            it("should work translate `Server running on https://localhost` to `Server running on https://undefined`", function() {
                var data = monitor.processData("Server running on https://localhosd9 t");
                expect(data).to.equal("Server running on https://undefined");
            });
        });
        
        onload && onload();
    }
});