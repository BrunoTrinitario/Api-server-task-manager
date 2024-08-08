const http = require('http');

const port=1234
const server = http.createServer((req,res) =>{
    const accion=req.method
    res.statusCode=200;
    res.setHeader('Content-Type', 'text/plain');
    const user=decodificarUser(req.headers.authorization);
    if (user!=undefined){
        if (datosValidos(user)){
            switch(accion){
                case "GET":
                    get(req,res,user);
                    break;
                case "POST":
                    post(req,res,user);
                    break;
                case "PUT":
                    put(req,res,user);
                    break;
                case "DELETE":
                    del(req,res,user);
                    break;
                default:
                    res.statusCode=405
                    res.end("accion no reconocida");  
                    break;
            } 
        }else{
            res.statusCode=401
            res.end("usuario invalido");   
        }
    }else{
        res.statusCode=401
        res.end("usuario en header invalido");
    }    
       
});

server.listen(port);

function get(req,res,user){
    const paquete=JSON.stringify({});
    //console.log("se envio el siguiente paquete: "+paquete)
    try{
        envio(paquete,req.url,"GET",user).then((data)=>{
            res.end(JSON.stringify(data));
        }).catch((err)=>{
            const e=JSON.parse(err)
            res.statusCode=e["error"]
            res.end(e["mensaje"]);
        })
    }catch(err){
        res.end(err);
    }  
}
function put(req,res,user){
    let info="";
    req.on("data",(chunk)=>{
        info+=chunk;
    })
    req.on("end",()=>{
        const data = JSON.parse(info);
        const msj = data.mensaje;
        const paquete=JSON.stringify({mensaje:msj});
        console.log("se envio el siguiente paquete: "+paquete)
        try{
            envio(paquete,req.url,"PUT",user).then((data)=>{
                res.end(data);
            }).catch((err)=>{
                const e=JSON.parse(err)
                res.statusCode=e["error"]
                res.end(e["mensaje"]);
            })
        }catch(err){
            res.end(err);
        }  
    })

}
function post(req,res,user){
    let info="";
    req.on("data",(chunk)=>{
        info+=chunk;
    })
    req.on("end",()=>{
        const data = JSON.parse(info);
        const msj = data.mensaje;
        const paquete=JSON.stringify({mensaje:msj});
        console.log("se envio el siguiente paquete: "+paquete)
        try{
            envio(paquete,req.url,"POST",user).then((data)=>{
                res.statusCode=201
                res.end(data);
            }).catch((err)=>{
                const e=JSON.parse(err)
                res.statusCode=e["error"]
                res.end(e["mensaje"]);
            })
        }catch(err){
            res.end(err);
        }  
    })
}
function del(req,res,user){
    const paquete=JSON.stringify({});
    console.log("se envio el siguiente paquete: "+paquete)
    try{
        envio(paquete,req.url,"DELETE",user).then((data)=>{
            res.end(data);
        }).catch((err)=>{
            if (err!=null && err!=undefined){
                const e=JSON.parse(err)
                res.statusCode=e["error"]
                res.end(e["mensaje"]);
            }else{
                res.statusCode=400
                res.end("error delete");
            }
            
        })
    }catch(err){
        res.end(err);
    }  
}
function decodificarUser(data){
    if (data==undefined)
        return undefined
    else{
        const authHeader = data || ''; // Recupera el header de autorización
        const base64Credentials = authHeader.split(' ')[1] || ''; // Obtiene la parte Base64 del header
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii'); // Decodifica Base64
        return credentials.split(':');    
    }
}
function datosValidos(user){
    const usuario=user[0];
    const contra=user[1];
    //contraseña y usuario de solo caracteres
    let i;
    for (i=0;i<usuario.length;i++){
        if (usuario.charCodeAt(i)<97 || usuario.charCodeAt(i)>122)
            break;
    }
    if (i!=usuario.length)
        return false
    else{ 
        for (i=0;i<contra.length;i++){
            if (contra.charCodeAt(i)<97 || contra.charCodeAt(i)>122)
                break;
        }
        if (i!=contra.length)
            return false
        else 
            return true
    }
    
}
function envio(paquete,url,metodo,usuario){
    return new Promise((resolve, reject) => {
        const userString=usuario[0]+":"+usuario[1]
        const options = {
            hostname: 'localhost',
            port: 1235,
            path: url,
            method: metodo,
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(paquete),
              'authorization': 'Basic ' + Buffer.from(userString).toString('base64')
            }
          };
        const envio=http.request(options, (res) => {
            let info="";
            res.on("data",(chunk)=>{
                info+=chunk
            });
            res.on("end",()=>{
                if (res.statusCode==200)
                    resolve(info);
                else{
                    const error=JSON.stringify({mensaje: "error de respuesta de servidor "+info,error: res.statusCode})
                    reject(error);
                }
            })
        });
        envio.on('error', (error) => {
            console.error('Error al enviar el usuario:', error);
        });
        envio.write(paquete);
        envio.end();
    })
    
}