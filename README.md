# toonServer-ExpressJS
for receive lorawan uplink packet from The Things Network and LoRa IoT by CAT

Change toonKey to your key in DecryptPayload.js

For The Things Network (TTN)
1. variable toonKey, change to your key in DecryptPayload.js file
example: var toonKey =  Buffer.from('0D5B411174F7F3543FBD006ABC1F716E', 'hex'); // 128-bits
2. run "sudo node serverTTN.js". And without encryption run "sudo node serverTTN-raws.js".


For LoRa IoT by CAT
1. variable toonKey, change to your key in DecryptPayloadHex.js file
example: var toonKey =  Buffer.from('0D5B411174F7F3543FBD006ABC1F716E', 'hex'); // 128-bits
2. run "sudo node serverCAT.js". And without encryption run "sudo node serverCAT-raws.js"
