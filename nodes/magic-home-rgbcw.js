'use strict';

const { Control, Discovery } = require('magic-home');

module.exports = function(RED) {
    function exec_cmd(node, msg, send, success, error) {
	node.control = null;
	node.control = new Control(
	    node.deviceNode.ip,
	    {
		connect_timeout: parseInt(node.deviceNode.connectionTimeout),
		command_timeout: parseInt(node.deviceNode.commandTimeout),
		apply_masks: node.deviceNode.apply_masks
	    }
	);
	node.control.setColorAndWhites(
            msg.payload.r || 0,
            msg.payload.g || 0,
            msg.payload.b || 0,
            msg.payload.ww || 0,
            msg.payload.cw || 0,
	).then(state => {
            node.status({ fill: "green", shape: "ring", text: "ok" });
	    
            node.send({payload: state, input: msg});
	}).catch(err => {
            node.status({ fill: "red", shape: "ring", text: "error" });
	    
            node.error(err.message);
	});
    }
    function discover_exec(node, msg, send, done) {
	node.deviceNode.getip(node.deviceNode.deviceid).then((ip) => {
	    var context = node.context();
	    node.deviceNode.ip = ip;
	    context.set('address', ip);
	    exec_cmd(node, msg, send, function(state) {
		node.status({ fill: "green", shape: "ring", text: "ok" });
		node.send({payload: state, input: msg});
		if (done) {
		    done();
		}
 	    }, function(err) {
		node.status({ fill: "red", shape: "ring", text: "error" });
		node.error(err.message);
		if (done) {
		    done(err);
		}
	    });	
	});
    }

    function rgbcw(config) {
        RED.nodes.createNode(this, config);

        this.device = config.device;
        this.deviceNode = RED.nodes.getNode(this.device);

        let node = this;

        node.on("input", function(msg, send, done) {
	    var context = node.context();
	    var address = context.get('address');
	    if (address) {
		node.deviceNode.ip = address;
		exec_cmd(node, msg, send, function(state) {
		    node.status({ fill: "green", shape: "ring", text: "ok" });
		    node.send({payload: state, input: msg});
		    if (done) {
			done();
		    }
		}, function(err) {
		    discover_exec(node, msg, send, done);
		});	
	    }
	    else {
		discover_exec(node, msg, send, done);
	    }
	});
    }

    RED.nodes.registerType("magic-home-rgbcw", rgbcw);
}
