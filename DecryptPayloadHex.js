var CryptoJS = require("crypto-js");

var toonKey =  Buffer.from('0D5B411174F7F3543FBD006ABC1F716E', 'hex'); // 128-bits
// var toonKey = Buffer.from('53CAB0AF4141FDC3AB973F1107678B27EFAC7F4549FCCB72', 'hex'); // 192-bits
// var toonKey = Buffer.from('326A1EBC882487370500E84D0DDA81F46F69F67552648F9EF20252FDCD895808', 'hex'); // 256-bits

var LORA_IV = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');

var mtype = [null, null, 'up', 'down', 'up', 'down', null, null];

var payload64;

// var raw_payload = "vDgS4YS2dyj0sKCPBATAdzBnnAkEFOTlOOsYBCZlAEA="; // for debugging

function getDevAddr(){
    return BufferReverse(BufferReverse(payload64).slice(3, 7));
}

function getFCnt() {
    return BufferReverse(BufferReverse(payload64).slice(1, 3));
}

function getMessageDirection() {
    var status_ind = ((payload64.slice(payload64.length - 1)).readUInt8(0) & 0xff) >> 5;
    return mtype[status_ind];
}

function BufferReverse (src) {
  var buffer = Buffer.alloc(src.length);

  for (var i = 0, j = src.length - 1; i <= j; ++i, --j) {
    buffer[i] = src[j];
    buffer[j] = src[i];
  }
  return buffer;
}

function toonDecrypt(payload){
	convert64(payload);
  decryptWithKeys();
}

function convert64(payload) {
    // console.log(payload);
    // payload64 = Buffer.from(payload.toString(), 'base64');
    payload64 = Buffer.from(payload, 'hex');
    // console.log("payload64: ", payload64);
}

function decryptWithKeys() {

    // console.log("getMessageDirection: ", getMessageDirection());
    // console.log("getFCnt: ", getFCnt());
    // console.log("getDevAddr: ", getDevAddr());

    var real_payload = payload64.slice(0, payload64.length-7);
    // console.log("real_payload: ",real_payload);
    // console.log("payload64: ", payload64);
    // console.log("real_payload.length: ", real_payload.length);

  if (real_payload) {

    var blocks = Math.ceil(real_payload.length / 16); // calc number of (16-byte/128-bit) blocks
    var plainBlocks = Buffer.alloc(16 * blocks);

    for (var block = 0; block < blocks; block++) {

      var blockMetadata = Buffer.concat([
        Buffer.from([ 1, 0, 0, 0, 0]), // as spec
        getMessageDirection() == "up" ? Buffer.from([0]) : Buffer.from([1]), // direction ('Dir')
        getDevAddr(),
        getFCnt(),
        Buffer.from([0,0]), // upper 2 bytes of FCnt (zeroes)
        Buffer.from([0]), // 0x00
        Buffer.from([block+1]), // block number
      ]);

      blockMetadata.copy(plainBlocks, block * 16);
    }

    var key = toonKey;
    // console.log("toonKey: ", key);
    // console.log("plaintext: ", plainBlocks);
    // console.log("real_payload.length: ", real_payload.length);   

    var cipherstream_base64 = CryptoJS.AES.encrypt(
        CryptoJS.enc.Hex.parse(plainBlocks.toString('hex')),
        CryptoJS.enc.Hex.parse(key.toString('hex')), {
            mode: CryptoJS.mode.ECB,
            iv: LORA_IV,
            padding: CryptoJS.pad.NoPadding
        });

    var cipherstream = Buffer.from(cipherstream_base64.toString(), 'base64');

    // create buffer for decrypted message
    var plaintextPayload = Buffer.alloc(real_payload.length);

    // xor the cipherstream with payload to create plaintext
    for (var i = 0; i < real_payload.length; i++) {
        var Si = cipherstream.readUInt8(i);
        plaintextPayload.writeUInt8(Si ^ real_payload.readUInt8(i), i);
    }
    // console.log("hex: ",plaintextPayload);

    console.log("text: ", plaintextPayload.toString('utf8'), " || ", plaintextPayload.length, "bytes");
    return plaintextPayload;
  }
}

// console.log("\ntoonDecrypt\n");

// toonDecrypt(raw_payload);

module.exports.toonDecrypt = toonDecrypt;
