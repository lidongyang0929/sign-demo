var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  if (path === '/') {
    var string = fs.readFileSync('./index.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
  }
  else if (path === '/sign_up' && method === 'GET') {
    var string = fs.readFileSync('./sign_up.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()

  } else if (path === '/sign_up' && method === 'POST') {
    readBody(request).then((body)=>{
    let strings = body.split('&')
    let hash={}
    strings.forEach((string)=>{  
      let parts = string.split('=')
      let key = parts[0]
      let value =parts[1]
      hash[key]= decodeURIComponent(value)
    })
    let {email,password,password_confirmation} = hash
    if(email.indexOf ('@') === -1){
      response.statusCode = 400
      response.setHeader('Content-Type','application/json')
      response.write(`{"errors":{
        "email":"invalid"
      }}`)
    }else if(password !== password_confirmation){
      response.statusCode = 400
    }else{
      let users = fs.readFileSync('./db/users','utf8')
      try{
      users = JSON.parse(users)
      }catch(exception){
        users = []
      }
      let inuse = false
      for(let i =0;i<users.length;i++){
        let user = users[i]
        if(user.email === email){
          inuse = true
          break
        }}
       if(inuse){
        response.statusCode = 400
         response.write('email is used')
       }else{
        users.push({email: email,password: password})
        let usersString = JSON.stringify(users)
        fs.writeFileSync('./db/users',usersString)
        response.statusCode = 200
      }
      
    }
    response.end()
    }) 
    
  }else if(path === '/sign_in' && method === 'GET'){
    var string = fs.readFileSync('./sign_in.html', 'utf8')
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write(string)
    response.end()
   
  }else if (path === '/sign_in' && method === 'POST') {
    readBody(request).then((body)=>{
    let strings = body.split('&')
    let hash={}
    strings.forEach((string)=>{  
      let parts = string.split('=')
      let key = parts[0]
      let value =parts[1]
      hash[key]= decodeURIComponent(value)
    })
    let {email,password} = hash
    let users = fs.readFileSync('./db/users','utf8')
      try{
      users = JSON.parse(users)
      }catch(exception){
        users = []
      }
      let found = false
      for(let i=0;i<users.length;i++){
        if(users[i].email === email && users[i].password === password){
        found = true 
        break
        }
      }if(found){
        response.setHeader('Set-Cookie', `sign_in_email=${email}`)
        response.statusCode = 200
      }else{
        response.statusCode = 401
      }
      response.end()
  })}else if (path === '/style.css') {
    var string = fs.readFileSync('./style.css', 'utf8')
    response.setHeader('Content-Type', 'text/css')
    response.write(string)
    response.end()

  } else if (path === '/main.js') {
    var string = fs.readFileSync('./main.js', 'utf8')
    response.setHeader('Content-Type', 'application/javascript')
    response.write(string)
    response.end()
  } else if (path === '/xxx') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/json')
    response.write(`
       {
         "note":{
           "from":"frank",
           "to":"jack",
           "content":"hi"
         }
       }
   
   `)

    response.end()
  }



  /******** 代码结束，下面不要看 ************/

})
function readBody(request){
  return new Promise((resolve,reject)=>{
    let body = []
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      resolve(body)
    })
  })
    
    
    
    

   
  
    
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)
