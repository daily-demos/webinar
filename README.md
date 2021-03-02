# Daily webinar app

## Getting started

Make sure you have a `.gitignore` file that includes `.env` and add a `.env` file with the following keys:

```
REACT_APP_BASE_URL=<-your Daily URL->
DAILY_API_KEY=<-your Daily API key->
```

To get these values, create a Daily account at [https://dashboard.daily.co/signup](https://dashboard.daily.co/signup). Your API key will be available under the `Developers` tab. Your "base URL" can be the domain you chose when you set up your account (e.g. `https://webinar-demo.daily.co`).

Then run:

```
yarn
yarn start
```

This will run the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

use [http://localhost:3000/[room-name]](http://localhost:3000/[room-name]) to go enter your webinar room.

## Features:

- one:many presentation mode for the room admin
- participants (non-admin) can message the admin directly
- admin can respond to individual participants or message the entire group
- lots of Daily links to help participants find what they need in our documentation
