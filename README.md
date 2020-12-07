# Daily webinar app

To use:

Make sure you have a `.gitignore` file that includes `.env` and add a `.env` file with the following keys:

```
REACT_APP_BASE_URL=<-your Daily URL->
DAILY_API_KEY=<-your Daily API key->
```

Then run:

```
yarn
yarn start
```

This will run the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Features:

- one:many presentation mode for the room admin
- participants (non-admin) can message the admin directly
- admin can respond to individual participants or message the entire group
