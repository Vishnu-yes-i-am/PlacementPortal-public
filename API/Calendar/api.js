const authorize = require("./authorize");
const { google, calendar_v3 } = require('googleapis');

async function listEvents(calendar) {

    // const data = await calendar.calendarList.list();
    // console.log(data.data.items)


    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        // maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });

    const events = res.data.items;
    if (!events || events.length === 0) {
        console.log('No upcoming events found.');
        return;
    }
    // console.log('Upcoming 10 events:');
    // console.log(events);
    return events
}




async function updateEvent(auth, event_id, startTime, endTime, summary, description) {
    const calendar = google.calendar({ version: 'v3', auth });
    // var date = new Date();
    const event = {
        'summary': summary,
        'description': description,
        'start': {
            'dateTime': startTime,
        },
        'end': {
            'dateTime': endTime,
        },
    };
    // console.log(event_id);
    let res = await calendar.events.update({
        eventId: event_id,
        calendarId: 'primary',
        auth: auth,
        requestBody: event
    })
    // console.log(res);
    return res.data.id;
}

async function addEvent(auth, startTime, endTime, summary, description) {
    const calendar = google.calendar({ version: 'v3', auth });
    // var date = new Date();
    const event = {
        'summary': summary,
        'description': description,
        'start': {
            'dateTime': startTime,
        },
        'end': {
            'dateTime': endTime,
        },
    };
    var ans;
    var res = await calendar.events.insert({
        calendarId: 'primary',
        auth: auth,
        resource: event
    });
    // console.log(res);
    return res.data.id;
}


async function checkBusy(auth) {
    const calendar = google.calendar({ version: "v3", auth });
    const res = await calendar.freebusy.query({
        requestBody: {
            timeMin: addHours(0),
            timeMax: addHours(10),
            items: [{ id: 'primary' }],
        }
    })

    console.log(res.data.calendars.primary.busy);
}


async function getClient() {
    const auth = await authorize();
    if (auth) {
        return auth;
    }
    else {
        console.log("Error on authorization of google API.");
    }
}

module.exports = { listEvents, addEvent, checkBusy, getClient, updateEvent };