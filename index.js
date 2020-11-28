
/*how to run app:
open cmd
cd C:\
cd Program Files\nodejs\apps\
C:\Program Files\nodejs\apps>node partOne*/



let express = require('express')
let app = express()
let bodyParser = require('body-parser')
app.use(bodyParser.raw({type:"*/*"}))
const cors = require('cors')
app.use(cors())
const port = 4000


let passwords = new Map()


let sessions = new Map()


let channel = new Map()


let channelUsers = new Map()


let channelMessages = new Map()


let channelUsersBan = new Map()


let counter = 144
let genSessionId = () => {
    counter = counter + 1
    return "sess" + counter
}

app.get("/sourcecode", (req, res) => {
res.send(require('fs').readFileSync(__filename).toString())
})

/*app.listen(port, () => {
  console.log(`partOne.js app listening at http://localhost:${port}`)
})*/

app.listen(process.env.PORT||4000)

app.post("/signup", (req, res) => {
	//this is creates a json object 
	let parsedBody = JSON.parse(req.body)
    // the has method returns true if the key is already in the map
    if (passwords.has(parsedBody.username)) {
        res.send(JSON.stringify({"success":false,"reason":"Username exists"}))
        return
    }else if(!parsedBody.hasOwnProperty('password')) {
        res.send(JSON.stringify({"success":false,"reason":"password field missing"}))
        return
    }else if(!parsedBody.hasOwnProperty('username'))  {
        res.send(JSON.stringify({"success":false,"reason":"username field missing"}))
        return
    }
    passwords.set(parsedBody.username, parsedBody.password)
    res.send(JSON.stringify({ success: true}))

})

app.post("/login", (req, res) => {
	//this is creates a json object 
	let parsedBody = JSON.parse(req.body)
    let usr = parsedBody.username
    let actualPassword = parsedBody.password
    let expectedPassword = passwords.get(usr)
	//let expectedUN = passwords.get(actualPassword)

    if(!parsedBody.hasOwnProperty('password')) {
		res.send(JSON.stringify({"success":false,"reason":"password field missing"}))
		return
	
	}else if(!parsedBody.hasOwnProperty('username'))  {	
		res.send(JSON.stringify({"success":false,"reason":"username field missing"}))
		return
	}else if(!passwords.has(parsedBody.username)) {
		res.send(JSON.stringify({"success":false,"reason":"User does not exist"}))
		return
	
	}else if (actualPassword === expectedPassword) {
        let sessId = genSessionId()
        sessions.set(sessId, usr)
        res.send(JSON.stringify({success: true, token: sessId}))
        return
		
    }
	res.send(JSON.stringify({"success":false,"reason":"Invalid password"}))
})

app.post("/create-channel", (req, res) => {		
	
	let parsedBody = JSON.parse(req.body)
    let sessId = req.headers.token
	//let expectedSessId = sessions.get(sessId)
	
	
    if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	
	}else if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	
	}else if(!parsedBody.hasOwnProperty('channelName'))  {	
		res.send(JSON.stringify({"success":false,"reason":"channelName field missing"}))
		return
	}else if(channel.has(parsedBody.channelName))  {	
		res.send(JSON.stringify({"success":false,"reason":"Channel already exists"}))
		return
	}
    channel.set(parsedBody.channelName, sessId)
    channelUsers.set(parsedBody.channelName,[])
    channelUsersBan.set(parsedBody.channelName,[])
    channelMessages.set(parsedBody.channelName,[])
	res.send(JSON.stringify({"success":true}))
	
	

})

app.post("/join-channel", (req, res) => {

	let parsedBody = JSON.parse(req.body)
    let sessId = req.headers.token
	let username = sessions.get(sessId)
	let channelName = parsedBody.channelName
	//let actualChannel= parsedBody.channelName
    let expectedChannel = channel.get(sessId)
	
    if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	
	}else if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	
	}else if(!parsedBody.hasOwnProperty('channelName'))  {	
		res.send(JSON.stringify({"success":false,"reason":"channelName field missing"}))
		return
	}else if(!channel.has(parsedBody.channelName))  {	
		res.send(JSON.stringify({"success":false,"reason":"Channel does not exist"}))
		return
	}else if(channelUsers.get(channelName).includes(username)){
		res.send(JSON.stringify({"success":false,"reason":"User has already joined"}))
		return
	}else if(channelUsersBan.get(channelName).includes(username)){
		res.send(JSON.stringify({"success":false,"reason":"User is banned"}))
		return
	}else if(channelUsers.has(channelName)){
    channelUsers.get(channelName).push(username)
		res.send(JSON.stringify({"success":true}))
	return
	}

  
	channelUsers.set(channelName,[username])
  //channelUsers.set("awesome-chatters", ["bob","bobr"])
	res.send(JSON.stringify({"success":true}))
  
	return
	

})

app.post("/leave-channel", (req, res) => {
  
  let parsedBody = JSON.parse(req.body)
  let sessId = req.headers.token
	let username = sessions.get(sessId)
	let channelName = parsedBody.channelName

  let expectedChannel = channel.get(sessId)
	
    if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	
	}else if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	
	}else if(!parsedBody.hasOwnProperty('channelName'))  {	
		res.send(JSON.stringify({"success":false,"reason":"channelName field missing"}))
		return
	}else if(!channel.has(parsedBody.channelName))  {	
		res.send(JSON.stringify({"success":false,"reason":"Channel does not exist"}))
		return
	}else if(!channelUsers.get(channelName).includes(username)){
		res.send(JSON.stringify({"success":false,"reason":"User is not part of this channel"}))
		return
	}

let arr = [];   
let users = channelUsers.get(channelName)
    for (let i = 0; i < users.length; i++) {
        let target = users[i]
        if (target !== username) {   
            arr.push(target)
        }
    }
  
	channelUsers.set(channelName,arr)
	res.send(JSON.stringify({"success":true}))
	return
	
})

app.get("/joined", (req, res) => {
    //let parsedBody = JSON.parse(req.body)
  let sessId = req.headers.token
	let username = sessions.get(sessId)
	//let channelName = parsedBody.channelName
  let channelQ = req.query.channelName

  //let expectedChannel = channel.get(sessId)
	
   if(!channel.has(channelQ))  {	
		res.send(JSON.stringify({"success":false,"reason":"Channel does not exist"}))
		return
	}else if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	}else if(!sessions.has(sessId)) {
        res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
        return
    
    }else if(!channelUsers.get(channelQ).includes(username)){
		res.send(JSON.stringify({"success":false,"reason":"User is not part of this channel"}))
		return
	}
  let users = channelUsers.get(channelQ)
	res.send(JSON.stringify({"success":true,"joined":users}))
	return
	
})


app.post("/delete", (req, res) => {
  
  let parsedBody = JSON.parse(req.body)
  let sessId = req.headers.token
   // let username = sessions.get(sessId)
    //let username = sessions.get(sessId)
	let channelName = parsedBody.channelName
  //channel.set("awesome-chatters", "sessid100")

  let expectedSess = channel.get(channelName)
	
    if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	
	}else if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	
	}else if(!parsedBody.hasOwnProperty('channelName'))  {	
		res.send(JSON.stringify({"success":false,"reason":"channelName field missing"}))
		return
	}else if(!channel.has(parsedBody.channelName))  {	
		res.send(JSON.stringify({"success":false,"reason":"Channel does not exist"}))
		return
	}else if(expectedSess!==sessId) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	
	}

  channel.delete(channelName)
  channelUsers.delete(channelName)
  channelMessages.delete(channelName)
  channelUsersBan.delete(channelName)
	res.send(JSON.stringify({"success":true}))
	return
	
})


app.post("/kick", (req, res) => {
  
  let parsedBody = JSON.parse(req.body)
  let sessId = req.headers.token
	let username = sessions.get(sessId)
	let channelName = parsedBody.channelName
  let pbTarget = parsedBody.target

  let expectedSess = channel.get(channelName)
	
    if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	
	}else if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	
	}else if(!parsedBody.hasOwnProperty('channelName'))  {	
		res.send(JSON.stringify({"success":false,"reason":"channelName field missing"}))
		return
	}else if(!parsedBody.hasOwnProperty('target'))  {	
		res.send(JSON.stringify({"success":false,"reason":"target field missing"}))
		return
	}else if(expectedSess!==sessId) {
		res.send(JSON.stringify({"success":false,"reason":"Channel not owned by user"}))
		return
	
	}

let arr = [];   
let users = channelUsers.get(channelName)
    for (let i = 0; i < users.length; i++) {
        let target = users[i]
        if (target !== pbTarget) {   
            arr.push(target)
        }
    }
  
	channelUsers.set(channelName,arr)
	res.send(JSON.stringify({"success":true}))
	return
	
})

app.post("/ban", (req, res) => {

  let parsedBody = JSON.parse(req.body)
  let sessId = req.headers.token
	let username = sessions.get(sessId)
	let channelName = parsedBody.channelName
  let pbTarget = parsedBody.target
  let expectedSess = channel.get(channelName)
  
	
    if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	
	}else if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	
	}else if(!parsedBody.hasOwnProperty('channelName'))  {	
		res.send(JSON.stringify({"success":false,"reason":"channelName field missing"}))
		return
	}else if(!parsedBody.hasOwnProperty('target'))  {	
		res.send(JSON.stringify({"success":false,"reason":"target field missing"}))
		return
	}else if(expectedSess!==sessId) {
		res.send(JSON.stringify({"success":false,"reason":"Channel not owned by user"}))
		return
	
	}else if(channelUsersBan.has(channelName)){
    channelUsersBan.get(channelName).push(pbTarget)
		res.send(JSON.stringify({"success":true}))
	return
	}

  
	channelUsers.set(channelName,[pbTarget])
  //channelUsers.set("awesome-chatters", ["bob","bobr"])
	res.send(JSON.stringify({"success":true}))
	return
  
})

app.post("/message", (req, res) => {

  let parsedBody = JSON.parse(req.body)
  let sessId = req.headers.token
	let username = sessions.get(sessId)
	let channelName = parsedBody.channelName
  let cont = parsedBody.contents

  let arr = channelUsers.get(channelName)
  //let expectedSess = channel.get(channelName)
  //console.log("what is this",!channelUsers.get(channelName).includes(username))

  

  console.log("parsedBody",parsedBody)
  console.log("sessId",sessId)
  console.log("username",username)
  console.log("channelName",channelName)
  console.log("cont",cont)
  console.log("arr",arr)
  console.log("channel",channel)
  console.log("channelUsers",channelUsers)
  console.log("channelUsersBan",channelUsersBan)
  //console.log("what is this",!channelUsers.get(channelName).includes(username))
	
    if(sessId===undefined){
		res.send(JSON.stringify({"success":false,"reason":"token field missing"}))
		return
	
	}else if(!sessions.has(sessId)) {
		res.send(JSON.stringify({"success":false,"reason":"Invalid token"}))
		return
	
	}else if(!parsedBody.hasOwnProperty('channelName'))  {	
		res.send(JSON.stringify({"success":false,"reason":"channelName field missing"}))
		return
    }else if(!parsedBody.hasOwnProperty('contents'))  {	
		res.send(JSON.stringify({"success":false,"reason":"contents field missing"}))
		return
    }
    var yes;
    if(channel.has(parsedBody.channelName)){
    yes = false;
    for(i=0; i <arr.length; i++){
      if(username === arr[i]){
          yes = true;
      }
  }
}
  if(!channel.has(parsedBody.channelName)){
    res.send(JSON.stringify({"success":false,"reason":"channel does not exist"}))
    return
}
    if(yes===false){
		res.send(JSON.stringify({"success":false,"reason":"User is not part of this channel"}))
		return
    }

    
    

    
    
   
   

    
    else if(channelMessages.has(parsedBody.channelName)){
    channelMessages.get(parsedBody.channelName).push({from:username, contents:cont})
		res.send(JSON.stringify({"success":true}))
	return
	}

  
	channelMessages.set(parsedBody.channelName,[{from:username, contents:cont}])
  //channelUsers.set("awesome-chatters", ["bob","bobr"])
	res.send(JSON.stringify({"success":true}))
	return

  
})

app.get("/messages", (req, res) => {

  //let parsedBody = JSON.parse(req.body)
  let sessId = req.headers.token
	let username = sessions.get(sessId)
	//let channelName = parsedBody.channelName
  //let cont = parsedBody.contents
  //let expectedSess = channel.get(channelName)
  let channelQ = req.query.channelName
  
	
   if(channelQ===undefined)  {	
		res.send(JSON.stringify({"success":false,"reason":"channelName field missing"}))
		return
	}else if(channelQ===undefined)  {	
		res.send(JSON.stringify({"success":false,"reason":"channelName field missing"}))
		return
	}else if(!channel.has(channelQ))  {	
		res.send(JSON.stringify({"success":false,"reason":"Channel does not exist"}))
		return
	}else if(!channelUsers.get(channelQ).includes(username)){
		res.send(JSON.stringify({"success":false,"reason":"User is not part of this channel"}))
		return
	}
  var mess = channelMessages.get(channelQ) 
	res.send(JSON.stringify({"success":true,"messages":mess}))
	return

  
})


