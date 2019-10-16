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
    },
    server_time: {
        type: Date,
        default: Date.now
    },
    plaintext: {
        type: String,
        default: 0
    }
});

var Uplink = mongoose.model("Uplink", uplinkSchema);

app.post("/", (req, res) => {
    let requestPayload = {
        ...req.body
    }
    requestPayload.plaintext = DecryptPayload.toonDecrypt(req.body.DevEUI_uplink.payload_hex);

    var uplinkData = new Uplink(requestPayload);
    uplinkData.save()
        .then(item => {
            res.send("uplink saved to database");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

app.listen(PORT, () => {
    console.log('Server is running on port:',PORT);
});