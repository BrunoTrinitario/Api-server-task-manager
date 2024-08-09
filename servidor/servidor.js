const http = require('http');
const fs = require('fs');
const path = require('path');
const e = require('express');

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
        info+=chunk.toString();
    });
    req.on("end",()=>{
        const metodo=req.method;
        info=JSON.parse(info);
        const user=decodificarUser(req.headers.authorization);
        //quitar usuario de paquete y trabajarlo con esto
        switch(metodo){
            case "DELETE":
                del(res,req);
                break;
            case "POST":
                post(info,res,req,user);
                break;
            case "PUT":
                put(info,res,req,user);
                break;
            case "GET":
                get(res,req);
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
function get(respuesta,req){
    const url=req.url.toString().split("/");
    url.shift();
    if (url.length==1){
        if (url[0]=="task"){
            console.log(req.url.toString())
            const camino=path.join(__dirname,req.url.toString());
            const arch=fs.readdirSync(camino);
            const vec=[];
            arch.forEach(elemento=>{
                let camaux=path.join(__dirname,req.url.toString()+"/"+elemento);
                vec.push(obtenerTask(camaux));
            })
            respuesta.end(JSON.stringify(vec));
        }else{
            const aux1=url[0].split("?");
            if (aux1[0]=="task"){
                const aux=aux1[1].split("=");
                if (aux[0]=="user"){
                    const user=aux[1];
                    const camino=path.join(__dirname,"/"+aux1[0]);
                    const arch=fs.readdirSync(camino);
                    const vec=[];
                    arch.forEach(elemento=>{
                        let camaux=path.join(__dirname,"/"+aux1[0]+"/"+elemento);
                        const obj=obtenerTask(camaux);
                        if (obj.owner==user)
                            vec.push(obj)
                    })
                respuesta.end(JSON.stringify(vec));
                }else{
                    respuesta.statusCode=404;
                    respuesta.end("filtro inexistente");
                }
            }else{
                respuesta.statusCode=404;
                respuesta.end("path no valido");
            }
        }
    }else{
        if (url[0]=="task" && url[1]!=""){
            const camino=path.join(__dirname,req.url.toString());
            const obj=obtenerTask(camino)
            if (obj!=null){
                const vec=[obj]
                respuesta.end(JSON.stringify(vec));
            }else{
                respuesta.statusCode=404;
                respuesta.end("task no encontrado");
            }
        }else{
            respuesta.statusCode=404;
            respuesta.end("path no valido");
        }
    }
}
function obtenerTask(path){
    if (fs.existsSync(path)){
        let datos=fs.readFileSync(path,"utf8").split(" ");
        let msj=datos.slice(3,datos.length-1).join(" ");
        return obj={
            id:datos[0],
            fecha:datos[1],
            hora:datos[2],
            mensaje:msj,
            owner:datos[datos.length-1]};
    }else
        return null;
}
function post(info,respuesta,req,usuario){
    if (req.url=="/usuario"){
        if (mapa.get(usuario[0])){
            respuesta.statusCode=400
            respuesta.end("usuario ya se encuentra registrado");
        }else{
            if (registrarUsuario(usuario)){
                respuesta.end("usuario registrado");
            }else{
                respuesta.statusCode=400
                respuesta.end("error de registro");
            }
        }
    }else{
        if (mapa.get(usuario[0])){
            if (req.url=="/task"){
                if(createTask(info,req.url,usuario)){
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
function createTask(info,url,usuario){
    const mensaje=info["mensaje"];
    const camaux=path.join(__dirname, "/task");
    let index=fs.readdirSync(camaux).length;
    const date=new Date();
    const fecha={
        año:date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate(),
        hora:date.getHours()+":"+date.getMinutes()+":"+date.getSeconds(),
        owner:usuario[0]
    };
    let camino=path.join(__dirname, url+"/"+"task"+(index)+".txt");
    try{
        while (fs.existsSync(camino)){
            index+=1
            camino=path.join(__dirname, url+"/"+"task"+(index)+".txt");  
        }
        fs.writeFileSync(camino,index+" "+fecha.año+" "+fecha.hora+" "+mensaje+" "+fecha.owner);
        return true;
    }catch(err){
        return false;
    }
}
function put(info,respuesta,req,usuario){
    const url=req.url.toString().split("/")
    url.shift();
    if (url[0]=="task"){
        const camino=path.join(__dirname, req.url.toString());
        if (fs.existsSync(camino)){
            modificarTask(info,respuesta,camino);
        }else{
            crearTaskDirecto(info,respuesta,camino,usuario);
        }
    }else{
        respuesta.statusCode=400
        respuesta.end("path no valido")
    }

    
}
function modificarTask(info,resp,camino){
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
        resp.end("task modificada");
    }catch(err){
        resp.statusCode=400
        resp.end("Error al modificar task");
    }
}
function crearTaskDirecto(info,res,camino,usuario){
    try{
        const index=camino.match(/\d+/)[0];;
        const date=new Date();
        const obj={
            año:date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate(),
            hora:date.getHours()+":"+date.getMinutes()+":"+date.getSeconds(),
            mensaje:info["mensaje"],
            owner:usuario[0]
        };
        let aux=index+" "+obj.año+" "+obj.hora+" "+obj.mensaje+" "+obj.owner;
        fs.writeFileSync(camino,aux)
        res.end("task directa creada")
    }catch(err){
        res.statusCode=400;
        res.end("error al crear task")
    }
}
function del(respuesta,req){
    const vec=req.url.toString().split("/");
    vec.shift();
    if (vec.length==1){
        if (vec[0]=="task"){
            const camino=path.join(__dirname,req.url);
            const arch=fs.readdirSync(camino)
            arch.forEach(elemento=>{
                const cam=path.join(__dirname,req.url+"/"+elemento);
                eliminarTask(cam);
            })
            respuesta.end("todos los task fueron eliminados correctamente");
        }else{
            const aux1=vec[0].split("?");
            if (aux1[0]=="task"){
                const aux=aux1[1].split("=");
                if (aux[0]=="user"){
                    const user=aux[1];
                    const camino=path.join(__dirname,"/"+aux1[0]);
                    const arch=fs.readdirSync(camino);
                    const vec=[];
                    arch.forEach(elemento=>{
                        let camaux=path.join(__dirname,"/"+aux1[0]+"/"+elemento);
                        const obj=obtenerTask(camaux);
                        if (obj.owner==user)
                            eliminarTask(camaux);
                        })
                        respuesta.end("task filtrados eliminados");
                }else{
                    respuesta.statusCode=404;
                    respuesta.end("filtro inexistente");
                }
            }else{
                respuesta.statusCode=404;
                respuesta.end("path no valido");
            }
        }
    }else{
        if (vec[0]=="task"){
            const camino=path.join(__dirname,req.url.toString());
            if (eliminarTask(camino)){
                respuesta.end("task eliminada");
            }else{
                respuesta.statusCode=400;
                respuesta.end("no se pudo eliminar el task")
            }
        }else{
            respuesta.statusCode=404;
            respuesta.end("path no valido");
        }
    }
    //if (mapa.get(user[0])==user[1] && user[0]=="admin"){
    //    if (vec.length==1 && vec[0]=="task"){
    //        const camaux=path.join(__dirname, req.url);
    //        const arch=fs.readdirSync(camaux);
    //        arch.forEach(elemento => {
    //            let camino=path.join(__dirname, req.url+"/"+elemento);
    //            fs.unlinkSync(camino);
    //        });
    //        respuesta.end("se borraron todos los task de forma correcta");
    //    }else{
    //        if (vec.length==2 && vec[0]=="task"){
    //            const camino=path.join(__dirname, req.url);
    //            if (fs.existsSync(camino)){
    //                fs.unlinkSync(camino)
    //                respuesta.end("se borro correctamente el task")
    //            }else{
    //                respuesta.statusCode=404
    //                respuesta.end("task inexistente");
    //            }
    //        }else{
    //            const aux=vec[0].split("?");
    //            if (aux[0]=="task"){
    //                const filtro=aux[1].split("=");
    //                if (filtro[0]=="user"){
    //                    const str0="/"+aux[0]
    //                    const camino=path.join(__dirname, str0);
    //                    const arch=fs.readdirSync(camino);
    //                    arch.forEach(elemento=>{
    //                        let cam=path.join(__dirname, str0+"/"+elemento);
    //                        let dato=fs.readFileSync(cam,"utf8");
    //                        dato=dato.split(" ");
    //                        if (dato[dato.length-1]==filtro[1]){
    //                            fs.unlinkSync(cam);
    //                        }
    //                    })
    //                    respuesta.end("borrado con filtro exitoso")
    //                }else{
    //                    respuesta.statusCode=404
    //                    respuesta.end("filtro no valido");    
    //                }
    //            }else{
    //                respuesta.statusCode=404
    //                respuesta.end("path no valido");
    //            }
    //        }
    //    }
    //}else{
    //    respuesta.statusCode=401
    //    respuesta.end("usuario no autorizado")
    //}
}

function eliminarTask(camino){
    if (fs.existsSync(camino)){
        fs.unlinkSync(camino);
        return true;
    }else{
        return false;
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