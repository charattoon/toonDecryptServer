const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const DecryptPayload = require('./DecryptPayloadHex');

const app = express();
const PORT = process.env.PORT || 80

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/lorawan", { useNewUrlParser: true }).then(
    () => { console.log('Database is connected' )},
    err => { console.log('Can not connect to the database'+ err )}
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var uplinkSchema = new mongoose.Schema({
    DevEUI_uplink: {
        type: Object,
        Time: Date,
        DevEUI: String,
        DevAddr: String,
        FPort: Number,
        FCntUp: Number,
        ADRbit: Number,
        MType: Number,
        FCntDn: Number,
        payload_hex: String,
        mic_hex: String,
        Lrcid: Number,
        LrrRSSI: Number,
        LrrSNR: Number,
        SpFact: Number,
        SubBand: String,
        Channel: String,
        DevLrrCnt: Number,
        Lrrid: String,
        Late: Number,
        LrrLAT: Number,
        LrrLON: Number,
        Lrrs: {
            type: Object,
            Lrr: {
                type: Object,
                0: {
                    type: Object,
                    Lrrid: String,
                    Chain: Number,
                    LrrRSSI: Number,
                    LrrSNR: Number,
                    LrrESP: Number
                },
                1: {
                    type: Object,
                    Lrrid: String,
                    Chain: Number,
                    LrrRSSI: Number,
                    LrrSNR: Number,
                    LrrESP: Number
                },
                2: {
                    type: Object,
                    Lrrid: String,
                    Chain: Number,
                    LrrRSSI: Number,
                    LrrSNR: Number,
                    LrrESP: Number
                }
            }
        },
        CustomerID: Number,
        CustomerData: {
            type: Object,
            alr: {
                type: Object,
                pro: String,
                ver: Number
            }
        },
        ModelCfg: Number,
        InstantPER: Number,
        MeanPER: Number
    }
});

var Uplink = mongoose.model("Uplink", uplinkSchema);

app.post("/", (req, res) => {
    var uplinkData = new Uplink(req.body);
    uplinkData.save()
        .then(item => {
            // call toonDecryption
            if(req.body.payload_raw=undefined){
                var payload_raw = req.body.payload_raw;
                console.log("payload_raw: "+payload_raw);
            } else {
                var payload_raw = req.body.DevEUI_uplink.payload_hex;
                console.log("payload_hex: "+payload_raw);
            }

            var plaintextPayload = app.use(DecryptPayload.toonDecrypt(payload_raw));
            console.log("plaintextPayload: "+plaintextPayload);

            res.send("uplink saved to database");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

app.listen(PORT, () => {
    console.log('Server is running on port:',PORT);
});