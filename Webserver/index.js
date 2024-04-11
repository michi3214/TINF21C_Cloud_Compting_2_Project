const dotenv = require("dotenv");
const express = require('express');
const path = require("path");
const axios = require("axios").default;
const { Client } = require('pg');

let DBClient;
// Load global config from .env file
dotenv.config();

/*
############################
############################
##  Environment Variables ##
############################
############################
*/
const port = parseInt(process.env.SERVER_PORT) || 3000;
const API_KEY = process.env.API_KEY || "";
const SQL_IP =  process.env.SQL_IP_Server;
const SQL_Username =  process.env.SQL_User;
const SQL_Password =  process.env.SQL_Password;

if(API_KEY === ""){
  console.log("Could not find an api key for eden in .env file.");
  process.exit(1);
} else if(SQL_IP === ""){
  console.log("Could not find an ip for sql server.");
  process.exit(1);
}


/*
############################
############################
##  Image Generator (API) ##
############################
############################
*/

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



/*
############################
############################
##  Database Connection   ##
############################
############################
*/

const client = new Client({
	user: SQL_Username,
	password: SQL_Password,
	host: SQL_IP
});


async function connectDB(){
  try {
    DBClient = await client.connect()
    
  } catch (error) {
    console.log("Could not etablish connection to database: ", error)
    process.exit(1)
  }
}

async function readPicFromDB(){
  return ""
}

async function writePicToDB(){
  return ""
}

/*
############################
############################
##      Express Server    ##
############################
############################
*/
const app = express();

var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 



app.set("views", path.join(__dirname, "views"));
app.set("view engine","pug");

const pageTitel = "Text2Image";
const title = "Text to Image";

app.get("/", function(req, res){
  console.log("GET REQUEST")
	res.render("index", {title:title, pageTitle:pageTitel, text:"A small rice field. There are a few people working in the field and a path leads through the idyllic landscape" , picture:""});
})

app.post("/", async function(req, res){
  console.log("POST REQUEST")
  const description = req.body.pictureDiscription;
  console.log("Description: ",description)
  try {
    const picture = await createNewPhoto(description);
    res.render("index", {title:title, pageTitle:pageTitel, text:description, picture: "data:image/png;base64," + picture});
    console.log("Send picture")

  } catch (error) {
    res.status(500).render("index", {title:title, pageTitle:pageTitel, text:description, picture:"", error:true})
    console.log("Failure: ", error)
  }


 
})

app.listen(port, () => {
  console.log("Env: ")
  console.log("IP of SQL: ", process.env.SERVER_PORT)
  console.log("API KEY: ", process.env.API_KEY)
  console.log("Port: ", process.env.SERVER_PORT)
  console.log();
  connectDB();
  console.log(`Example app listening on port http://localhost:${port}/`);
})