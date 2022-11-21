# macos-bluetooth-kvm-swap

##  bluetooth-kvm-swap.js
Quick script to detach some bluetooth devices (keyboard, mouse, tackpad, etc.) from one
Mac, and reattach them to another mac with a minimum amount of fuss.

NOTE:  MacOS should automatically do this, but it appears both of your Macs need to be on the same local network.

As a result, if you have a work laptop that connects througha VPN and a personal laptop, they probably can't
see each other.  Checkout `System Preferences > Displays > Advanced` and look for the switch to enable sharing 
of yourbluetooth devices.

Also, some bluetooth devices come preconfigured to support multiple hosts, so this script shouldn't be necessary
for them.

### Prerequisites:  NodeJS and blueutil
You need to install NodeJS and blueutil on your mac:
```bash
$ brew install node blueutil
```
If you need to install brew on your machine, see instructions at `https://brew.sh/`.

### Usage
#### Mac setup
You can make this script executable and run it directly via:
```bash
$ chmod +x bluetooth-kvm-swap.js
$ ./bluetooth-kvm-swap.js
```
Or you can run it using node explicitly via:
```bash
$ node ./bluetooth-kvm-swap.js
```
The first method is useful if you want to add this script to your path somewhere like ~/bin or /usr/local/bin.
It's just personal preference.
*
#### Add your Bluetooth devices to this script
You'll need to edit this script and add in your devices into the "bluetoothDevices" map:
```javascript
let bluetoothDevices = {
	"88-4d-7c-ef-e7-01": { name: "Magic Keyboard" },
	"c0-44-42-da-a1-02": { name: "Magic Mouse" },
	"d4-57-63-5c-4a-03": { name: "Magic Trackpad" },
};
```
### Swap your bluetooth devices from Mac A to Mac B
On Mac A, unpair the bluetooth devices via:
```bash
$ ./bluetooth-kvm-swap.js unpair
```
On Mac B, pair the bluetooth devices via:
```javascript
$ ./bluetooth-kvm-swap.js pair
```
