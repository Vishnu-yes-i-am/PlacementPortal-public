const express = require('express');
const router = express.Router();
// const path = require('path');
const { listEvents, addEvent, checkBusy, getClient } = require("../API/Calendar/api");
const { google } = require('googleapis');


router.get("/", async (req, res) => {
    // const auth = await getClient();
    // const calendar = google.calendar({ version: 'v3', auth });
    // const data = await listEvents(calendar);
    // console.log(data);
    res.render("calendar.ejs");

});

function addHours(numOfHours, date = new Date()) {
    date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

    return date.toISOString();
}

router.get("/getEvents", async (req, res) => {
    const auth = await getClient();
    const calendar = google.calendar({ version: 'v3', auth });
    const list = await listEvents(calendar);

    var data = { data: [] };
    if (!list) {
        res.status(400).send("No event or Improper call");
        return
    }

    list.map((e, index) => {
        const date = new Date(e.start.dateTime);
        const event_date = `${date.toLocaleString('default', { month: 'long' })}/${date.getDate()}/${date.getFullYear()}`;
        const start_time = new Date(e.start.dateTime).toLocaleString('en-US', { hour: 'numeric', hour12: true });
        const end_time = new Date(e.end.dateTime).toLocaleString('en-US', { hour: 'numeric', hour12: true });

        const event = {
            id: e.id,
            name: e.summary,
            date: event_date,
            badge: `${start_time} - ${end_time}`,
            description: e.description,
            type: "event",
            color: "#63d867"
        }
        data["data"].push(event);
    })
    res.status(200).json(data);
});

router.post("/addEvent", async (req, res) => {
    console.log(req.body);
    const auth = await getClient();

    const start = addHours(2);
    const end = addHours(3);
    const title = "Test Title";
    const summary = "Test Summary";

    const result = await addEvent(auth, start, end, title, summary);
    console.log(result);
    res.status(200).send("OK");
})


module.exports = router;

