# Daily webinar app

## Getting started

Make sure you have a `.gitignore` file that includes `.env` and add a `.env` file with the following keys:

```
REACT_APP_BASE_URL=<-your Daily URL->
DAILY_API_KEY=<-your Daily API key->
REACT_APP_FORM_ID=<-Google form ID->
```

To get these values, please contact another dev rel team member or you get access them in the Netlify account under "Environment variables" for the repo.

Then run:

```
yarn
yarn start
```

This will run the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Features:

- one:many presentation mode for the room admin
- participants (non-admin) can message the admin directly
- admin can respond to individual participants or message the entire group
- lots of Daily links to help participants find what they need in our documentation

---

## Deployment

Commits to main are automatically deployed to [https://discover.daily.co](https://discover.daily.co) via Netlify.
