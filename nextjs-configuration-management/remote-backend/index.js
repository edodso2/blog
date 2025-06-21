const express = require('express');
const app = express();
const port = 3004;

let counter = 0;

app.get('/config', (req, res) => {
  const subdomain = req.query.subdomain;

  console.log(`Fetching config. subdomain: ${subdomain} count: ${counter++}`);

  res.json({
    title: `Hello ${subdomain} World!`,
    proEnabled: subdomain === 'demo3', // only enable pro mode for demo3 subdomain
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
