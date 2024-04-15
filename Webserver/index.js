const dotenv = require("dotenv");
const express = require('express');
const path = require("path");
const axios = require("axios").default;
const { Client } = require('pg');
const crypto = require('crypto')

let DBClient;
const hashFunction = crypto.createHash("sha256")
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
const SQL_DatabaseName =  process.env.SQL_DatabaseName;
const SQL_TableName =  process.env.SQL_TableName;

if(API_KEY === ""){
  console.log("Could not find an api key for eden in .env file.");
  process.exit(1);
} else if(SQL_IP === ""){
  console.log("Could not find an ip for sql server.");
  process.exit(1);
}


console.log("Env: ")
console.log("API KEY: ", API_KEY)
console.log("Webserver Port: ", port)
console.log("IP of SQL: ", SQL_IP)
console.log("SQL Username: ", SQL_Username)
console.log("SQL DatabaseName: ", SQL_DatabaseName)
console.log("SQL Table Name: ", SQL_TableName)


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
  console.log("Got photo from AI. Status: ", response.status)
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
	host: SQL_IP,
  database:SQL_DatabaseName,
});



async function connectDB(){
  try {
    DBClient = await client.connect()
    
  } catch (error) {
    console.log("Could not etablish connection to database: ", error)
    process.exit(1)
  }
}

async function readPicFromDB(descriptionHash){
  const res = await client.query('SELECT * FROM $1 WHERE description = $2', [SQL_TableName,descriptionHash])
  console.debug(res.rows)
  console.log(res.rows[0].picture)
  return res.rows[0].picture
}

async function writePicToDB(text, picture){
  const query = {
    text: 'INSERT INTO $1(description, picture) VALUES($1, $2)',
    values: [text, picture],
  }
   
  const res = await client.query(query)
  console.log("Added data to database: ", res.rows[0])
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
    hashDescription = hashFunction.update(description).digest('hex');
    console.log("Hashed description to ", hashDescription);
    const db_res = await readPicFromDB(hashDescription);


    const picture = await createNewPhoto(description);
    writePicToDB(hashDescription, picture);
    res.render("index", {title:title, pageTitle:pageTitel, text:description, picture: "data:image/png;base64," + picture});
    console.log("Send picture for ", description)

  } catch (error) {
    res.status(500).render("index", {title:title, pageTitle:pageTitel, text:description, picture:"", error:true})
    console.log("Failure: ", error)
  }


 
})

app.listen(port, async () => {

  console.log();
  await connectDB();
  console.log(`Example app listening on port http://localhost:${port}/`);
})