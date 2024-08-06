const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = 'localhost';
const port = 1235;

const camino=path.join(__dirname, 'Usuarios.txt');
const datos=fs.readFileSync(camino,"utf8").split(" ");
const mapa=new Map;
for (let i=0;i<datos.length;i+=2){
    mapa.set(datos[i],datos[i+1]);
}

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    let info=""
    req.on("data",(chunk)=>{
        info+=chunk;
    });
    req.on("end",()=>{
        console.log("recibi esta info: "+info)
        info=JSON.parse(info);
        const peticion=info["accion"];
        switch(peticion){
            case "GET":
                get(info,res);
                break;
            case "POST":
                post(info,res);
                break;
            case "PUT":
                put(info,res);
                break;
            case "DELETE":
                del(info,res);
                break;
            default:
                res.statusCode=405
                res.end("accion no reconocida");  
                break;
        }
    })
});

server.listen(port, hostname, () => {
  console.log(`servidor corriendo http://${hostname}:${port}/`);
});

function validador(usuario){
    if (mapa.get(usuario[0])===usuario[1])
        return true
    else
        return false;
}
function registrarUsuario(user){
    const usuario=" "+user.join(" ");
    const camino=path.join(__dirname, 'Usuarios.txt');
    try{
        fs.appendFileSync(camino, usuario, 'utf8')
        mapa.set(user[0],user[1]);
        return true
    }catch(err){
        return false
    }
    
}
function get(info,respuesta){
    if (validador(info["usuario"])){
        const vec=info["path"].split("/");
        vec.shift();
        if (vec.length==1 && vec[0]=="task"){
            const camaux=path.join(__dirname, info["path"]);
            const arch=fs.readdirSync(camaux);
            const vector=new Array
            arch.forEach(elemento => {
                let camino=path.join(__dirname, info["path"]+"/"+elemento);
                let datos=fs.readFileSync(camino,"utf8").split(" ");
                let msj=datos.slice(3,datos.length-1).join(" ");
                vector.push({id:datos[0],fecha:datos[1],hora:datos[2],mensaje:msj,owner:datos[datos.length-1]});
            });
            console.log(JSON.stringify(vector));
            respuesta.end(JSON.stringify(vector));
        }else{
            if (vec.length==2 && vec[0]=="task"){
                const camino=path.join(__dirname, info["path"]);
                if (fs.existsSync(camino)){
                    let datos=fs.readFileSync(camino,"utf8").split(" ");
                    let msj=datos.slice(3,datos.length-1).join(" ");
                    const obj=[{id:datos[0],fecha:datos[1],hora:datos[2],mensaje:msj,owner:datos[datos.length-1]}];
                    respuesta.end(JSON.stringify(obj))
                }else{
                    respuesta.statusCode=404
                    respuesta.end("task inexistente");
                }
                
            }else{
                respuesta.statusCode=404
                respuesta.end("path no valido");
            }
        }
    }else{
        respuesta.statusCode=401
        respuesta.end("usuario no valido")
    }
}
function post(info,respuesta){
    if (info["path"]=="/usuario"){
        if (mapa.get(info["usuario"][0])){
            respuesta.statusCode=400
            respuesta.end("usuario ya se encuentra registrado");
        }else{
            if (registrarUsuario(info["usuario"])){
                respuesta.end("usuario registrado");
            }else{
                respuesta.statusCode=400
                respuesta.end("error de registro");
            }
            
        }
    }else{
        if (mapa.get(info["usuario"][0])){
            if (info["path"]=="/task"){
                if(createTask(info)){
                    respuesta.end("task creada");
                }else{
                    respuesta.statusCode=400;
                    respuesta.end("error de creacion de task")
                }
            }else{
                respuesta.statusCode=404
                respuesta.end("path invalido");
            }
        }else{
            respuesta.statusCode=401
            respuesta.end("usuario no registrado");
        }
        
    }
}
function createTask(info){
    const mensaje=info["mensaje"];
    const camaux=path.join(__dirname, info["path"]);
    let index=fs.readdirSync(camaux).length;
    const date=new Date();
    const fecha={
        año:date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate(),
        hora:date.getHours()+":"+date.getMinutes()+":"+date.getSeconds(),
        owner:info["usuario"][0]
    };
    let camino=path.join(__dirname, info["path"]+"/"+"task"+(index)+".txt");
    try{
        while (fs.existsSync(camino)){
            index+=1
            camino=path.join(__dirname, info["path"]+"/"+"task"+(index)+".txt");  
        }
        fs.writeFileSync(camino,index+" "+fecha.año+" "+fecha.hora+" "+mensaje+" "+fecha.owner);
        return true;
        
    }catch(err){
        return false;
    }
}
function put(info,respuesta){}
function del(info,respuesta){}