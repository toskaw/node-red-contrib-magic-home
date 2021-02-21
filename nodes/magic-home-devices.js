'use strict';

const { Control, Discovery } = require('magic-home');

module.exports = function (RED) {
    async function getip(id) {
	let devices = await Discovery.scan(2000);
	if (devices) {
	    let device = devices.find((device) => device.id === id);
	    if (device) {
		return device.address;
	    }
	    else {
		return null;
	    }
	}
	return null;
    };
    function devices(config) {
        RED.nodes.createNode(this, config);

        this.deviceid = config.deviceid;
        this.commandTimeout = config.commandtimeout;
        this.connectionTimeout = config.connectiontimeout;
        this.apply_masks = config.applymasks;
	this.getip = getip;
    }

    RED.httpAdmin.get("/magic-home/devices", RED.auth.needsPermission("magic.home.devices.read"), async function (req, res) {
        return res.json(await Discovery.scan(2000).then(devices => {
            return devices;

        }).catch(err => {
            RED.log.error(err.message);

            return {};
        }));
    });

    RED.httpAdmin.get("/magic-home/patterns", RED.auth.needsPermission("magic.home.patterns.read"), function (req, res) {
        return res.json(Control.patternNames);
    });

    RED.nodes.registerType("magic-home-devices", devices);
}

