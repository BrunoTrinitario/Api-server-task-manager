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
        obtenerTask(info,respuesta);
    }else{
        respuesta.statusCode=401
        respuesta.end("usuario no valido")
    }
}

function obtenerTask(info,respuesta){
    const vec=info["path"].split("/");
    vec.shift();
    if (vec.length==1){
        const aux=vec[0].split("?");
        if (aux.length==1){
            const camaux=path.join(__dirname, info["path"]);
            const arch=fs.readdirSync(camaux);
            const vector=new Array
            arch.forEach(elemento => {
                let camino=path.join(__dirname, info["path"]+"/"+elemento);
                let datos=fs.readFileSync(camino,"utf8").split(" ");
                let msj=datos.slice(3,datos.length-1).join(" ");
                vector.push({id:datos[0],fecha:datos[1],hora:datos[2],mensaje:msj,owner:datos[datos.length-1]});
            });
            respuesta.end(JSON.stringify(vector));
        }else{
            const tipo=aux[1].split("=");
            if (tipo[0]=="user"){
                const user=tipo[1];
                const camaux=path.join(__dirname, "/task");
                const arch=fs.readdirSync(camaux);
                const vector=new Array
                arch.forEach(elemento => {
                    let camino=path.join(__dirname,"/task/"+elemento);
                    let datos=fs.readFileSync(camino,"utf8").split(" ");
                    let msj=datos.slice(3,datos.length-1).join(" ");
                    let own=datos[datos.length-1]
                    if (own==user){
                        vector.push({id:datos[0],fecha:datos[1],hora:datos[2],mensaje:msj,owner:own});
                    }
                });
                respuesta.end(JSON.stringify(vector));
            }else{
                respuesta.statusCode=404
                respuesta.end("filtro no valido")
            }
        }
    }else{
        if (vec[0]=="task"){
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
function put(info,respuesta){
    const camino=path.join(__dirname, info["path"]);
    if (fs.existsSync(camino)){
        modificarTask(info,respuesta);
    }else{
        crearTaskDirecto(info,respuesta);
    }
    
}

function modificarTask(info,resp){
    const camino=path.join(__dirname, info["path"]);
    try{
        let vec=new Array;
        let archivo=fs.readFileSync(camino,"utf8");
        const aux=archivo.split(" ");
        vec.push(aux[0]);
        vec.push(aux[1]);
        vec.push(aux[2]);
        vec.push(info["mensaje"]);
        vec.push(aux[aux.length-1]);
        const msj=vec.join(" ");
        fs.writeFileSync(camino,msj);
        resp.end("task modificada")
    }catch(err){
        resp.statusCode=400
        resp.end("Error al modificar task");
    }
}

function crearTaskDirecto(info,res){
    const camino=path.join(__dirname, info["path"]);
    try{
        const index=camino[camino.length-5];
        const date=new Date();
        const obj={
            año:date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate(),
            hora:date.getHours()+":"+date.getMinutes()+":"+date.getSeconds(),
            mensaje:info["mensaje"],
            owner:info["usuario"][0]
        };
        let aux=index+" "+obj.año+" "+obj.hora+" "+obj.mensaje+" "+obj.owner;
        fs.writeFileSync(camino,aux)
        res.end("task directa creada")
    }catch(err){
        res.statusCode=400;
        res.end("error al crear task xdxd")
    }
}

function del(info,respuesta){
    const vec=info["path"].split("/");
    vec.shift();
    if (mapa.get(info["usuario"][0])==info["usuario"][1] && info["usuario"][0]=="admin"){
        if (vec.length==1 && vec[0]=="task"){
            const camaux=path.join(__dirname, info["path"]);
            const arch=fs.readdirSync(camaux);
            arch.forEach(elemento => {
                let camino=path.join(__dirname, info["path"]+"/"+elemento);
                fs.unlinkSync(camino);
            });
            respuesta.end("se borraron todos los task de forma correcta");
        }else{
            if (vec.length==2 && vec[0]=="task"){
                const camino=path.join(__dirname, info["path"]);
                if (fs.existsSync(camino)){
                    fs.unlinkSync(camino)
                    respuesta.end("se borro correctamente el task")
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
        respuesta.end("usuario no autorizado")
    }
}