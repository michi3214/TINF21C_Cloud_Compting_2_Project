const dotenv = require("dotenv");
const express = require('express');
const path = require("path");
const axios = require("axios").default;


// Load global config from .env file
dotenv.config();


const app = express();
const port = parseInt(process.env.SERVER_PORT) || 3000;
const API_KEY = process.env.API_KEY || "";

if(API_KEY === ""){
  console.log("Could not find an api key for eden in .env file.");
  process.exit(1);
}



var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 



app.set("views", path.join(__dirname, "views"));
app.set("view engine","pug");

const pageTitel = "Text2Image";
const title = "Text to Image";

async function createNewPhoto(description){
  const url = "https://api.edenai.run/v2/image/generation";
  const data = {
    providers: "replicate",
    text: description,
    resolution: "256x256",
    fallback_providers: ""
  };
  const headers = {
      authorization: API_KEY,
    }

  const response = await axios.post(url, data,{headers});
  if(response.status !== 200){
    console.log("Could not create new image! Status: " + response.status);
    throw new Error("Could not create new image!")
  }
  console.log("Status: ", response.status)
  return response.data.replicate.items[0].image; 
}



app.get("/", function(req, res){
	res.render("index", {title:title, pageTitle:pageTitel, text:"A small rice field. There are a few people working in the field and a path leads through the idyllic landscape" , picture:""});
})



app.post("/", async function(req, res){

  console.log(req.body);
  const description = req.body.pictureDiscription;
  try {
    const picture = await createNewPhoto(description);
    res.render("index", {title:title, pageTitle:pageTitel, text:description, picture: "data:image/png;base64," + picture});

  } catch (error) {
    res.status(500).render("index", {title:title, pageTitle:pageTitel, text:description, picture: "", error:true})
  }


 
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`);
})