#!/usr/bin/env node
/**
 * bluetooth-kvm-swap.js - Quick script to detach some bluetooth devices (keyboard, mouse, tackpad, etc.) from one
 *	Mac, and reattach them to another mac with a minimum amount of fuss.
 *
 * NOTE:  MacOS should automatically do this, but it appears both of your Macs need to be on the same local network.
 *	As a result, if you have a work laptop that connects througha VPN and a personal laptop, they probably can't
 *	see each other.  Checkout System Preferences > Displays > Advanced to the switch to enable sharing of your
 *	bluetooth devices.
 *
 *	Also, some bluetooth devices come preconfigured to support multiple hosts, so this script shouldn't be necessary
 *	for them.
 *
 * Prerequisites:  NodeJS and blueutil
 *	You need to install NodeJS and blueutil on your mac:
 *		$ brew install node blueutil
 *
 *	If you need to install brew on your machine, see instructions at https://brew.sh/.
 *
 * Usage:
 *	Mac setup:
 *		You can make this script executable and run it directly via:
 *			$ chmod +x bluetooth-kvm-swap.js
 *			$ ./bluetooth-kvm-swap.js
 *
 *		Or you can run it using node explicitly via:
 *			$ node ./bluetooth-kvm-swap.js
 *
 *		The first method is useful if you want to add this script to your path somewhere like ~/bin or /usr/local/bin.
 *		It's just personal preference.
 *
 *  Add your Bluetooth devices to this script:
 *
 *		You'll need to edit this script and add in your devices into the "bluetoothDevices" map:
 *
 *          let bluetoothDevices = {
 *          	"88-4d-7c-ef-e7-01": { name: "Magic Keyboard" },
 *          	"c0-44-42-da-a1-02": { name: "Magic Mouse" },
 *          	"d4-57-63-5c-4a-03": { name: "Magic Trackpad" },
 *          };
 *
 *	Swap your bluetooth devices from Mac A to Mac B:
 *
 *      On Mac A, unpair the bluetooth devices via:
 *
 *          $ ./bluetooth-kvm-swap.js unpair
 *
 *		On Mac B, pair the bluetooth devices via:
 *
 *			$ ./bluetooth-kvm-swap.js pair
 *
 */

/**
 * List of bluetooth devices to swap.
 *
 * Use the blueutil command to get your device MAC addresses and names:
 *
 *  $ blueutil --paired
 *  
 * NOTE:  The name field is arbitrary.
 */
let bluetoothDevices = {
	"88-4d-7c-ef-e7-42": { name: "Ed’s Magic Keyboard #2" },
	"c0-44-42-da-a1-17": { name: "Ed’s Magic Mouse" },
	"d4-57-63-5c-4a-69": { name: "Ed’s Magic Trackpad" },
};

const { exec } = require("child_process");
const verbose = true;

const sleep = (milliseconds) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const commands = {
	"isConnected":	{ action: "Checking connection", shell: (device) => { return run(`blueutil --is-connected ${device}`); }, },
	"pair":			{ action: "Pairing", shell: (device) => { return run(`blueutil --pair ${device}`); }, },
	"unpair":		{ action: "Unpairing", shell: (device) => { return run(`blueutil --unpair ${device}`); }, },
	"connect":		{ action: "Connecting", shell: (device) => { return run(`blueutil --connect ${device}`); }, },
	"disconnect":	{ action: "Disconnecting", shell: (device) => { return run(`blueutil --disconnect ${device}`); }, },
	"info":			{ action: "Gathering Info", shell: (device) => { return run(`blueutil --info ${device}`); }, },
};

function run(shellCommand) {
	return new Promise((resolve, reject) => {
		exec(shellCommand, (error, stdout, stderr) => {
			if (error) {
				reject( { error, stdout, stderr } );
			}
			else {
				resolve( { error, stdout, stderr } );
			}
		});
	});
}

/**
 * Run the command against all of our listed bluetooth devices ...
 */
const allDevices = async (command) => {

	// Indicate the operation we're performing across all of the bluetooth devices ...
	console.log(commands[command].action);

	// Run command against all bluetooth devices and gather data ...
	let results = {};
	for (device in bluetoothDevices) {
		try {
			// Run the shell command and collect output ...
			results[device] = await commands[command].shell(device);

			// Post process results ...
			switch(command) {
				case "isConnected":
					bluetoothDevices[device].connected = (results[device].stdout.trim() == "1") ? true : false;
					break;
				default:
					break;
			}
		}
		catch(e) {
			console.log(e);
		}
	}

	return results;
}

/**
 * Go through the bluetooth list and try to connect all of the devices.
 */
const attachDevices = async () => {
	await allDevices("unpair");
	await sleep(2000);

	await allDevices("pair");
	await sleep(1000);

	await allDevices("connect");
	await sleep(1000);

	await allDevices("isConnected");
	console.log(bluetoothDevices);
}

/**
 * Go through the bluetooth list and try to disconnect all of the devices.
 */
const detachDevices = async () => {
	await allDevices("unpair");
	await sleep(2000);

	await allDevices("isConnected");
	console.log(bluetoothDevices);
}

async function printDeviceReport() {
	await allDevices("isConnected");
	console.log(bluetoothDevices);
}

async function main() {
	switch(process.argv[2]) {
		case 'attach':
			await attachDevices();
			break;

		case 'detach':
			await detachDevices();
			break;

		default:
			await printDeviceReport();
			break;
	}
}

try {
	main();
}
catch(e) {
	console.log(e);
}
