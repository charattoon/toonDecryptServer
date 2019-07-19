const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// const DecryptPayload = require('./DecryptPayload');

const app = express();
const PORT = process.env.PORT || 8001

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/lorawan", { useNewUrlParser: true }).then(
    () => { console.log('Database is connected' )},
    err => { console.log('Can not connect to the database'+ err )}
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var uplinkSchema = new mongoose.Schema({
    app_id: String,
    dev_id: String,
    hardware_serial: String,
    port: Number,
    counter: Number,
    payload_raw: String,
    metadata: {
        type: Object,
        time: Date,
        frequency: Number,
        modulation: String,
        ddata_rate: String,
        coding_rate: String,
        gateways: {
            type: Object,
            gtw_id: String,
            timestamp: Number,
            time: Date,
            channel: Number,
            rssi: Number,
            snr: Number,
            rf_chain: Number,
            latitude: Number,
            longitude: Number,
            altitude: Number 
        },
        latitude: Number,
        longitude: Number,
        location_source: String
    },
    downlink_url: String
});

var Uplink = mongoose.model("Uplink", uplinkSchema);

app.post("/", (req, res) => {
    var uplinkData = new Uplink(req.body);
    uplinkData.save()
        .then(item => {
            res.send("uplink saved to database");

            // call toonDecryption
            // var payload_raw = req.body.payload_raw;
            // console.log("payload_raw: "+payload_raw);
            // app.use(DecryptPayload.toonDecrypt(payload_raw));
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

app.listen(PORT, () => {
    console.log('Server is running on port:',PORT);
});