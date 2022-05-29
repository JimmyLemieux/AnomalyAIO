const express = require('express');
const bot = require('./bot');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
// const multer = require('multer');
// const upload = multer({ dest: './uploads/' })
const jsonParser = bodyParser.json();



const app = express();
const port = 3000;

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json());


app.get('/', async (req, res) => {
  console.log("hit!");
  await bot.session(res);
  res.end();
})

app.post('/test', async(req, res) => {
//  console.log('test');
  await bot.session(req.body, res); 
  res.end();
});

app.post('/checkout', async(req, res) => {
  await bot.checkout(req.body.session);
  res.send(JSON.stringify({status: 200}));
});

app.post('/setup', async (req, res) => {
  let uploadFile = req.files.file;

  await uploadFile.mv('uploads/' + 'users.csv', (error) => {
    if (error) {
      console.log('Some error went on!');
    } else {
    }
  });

  let data = JSON.parse(req.body.data);
  await bot.test(data, res);
  res.send(JSON.stringify({status: "start"}));
  res.end();
});

app.get('/status', async (req, res) => {
  let sessions = await bot.getSessions();
  let newSessions = sessions.map(x => {
    return {"id": x.id, "type": x.type, "status": x.status, "info": x.info}
  });
  res.send(JSON.stringify({sessions: newSessions}));
});

app.get('/kill', async (req, res) => {
  await bot.killAll();
  res.send(JSON.stringify({status: "done"}));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})