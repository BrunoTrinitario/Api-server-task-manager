const axios=require("axios");
const url="http://localhost:1234/"
const config = {
    auth: {
        username: 'admin',
        password: 'admin'
    }
};
const flag="get"
const task="?user=admin"//string vacio para todo, si no "/[task deseado].txt"
const mensaje="mensaje ejemplo 8";//para post y put
switch(flag){
    case "get":
        get(task);
        break;
    case "postTASK":
        post1(mensaje);
        break;
    case "postUSER":
        post2();
        break;
    case "delete":
        del(task);
        break;
    case "put":
        put(mensaje,task);
        break;
}

function get(tsk){
    axios.get(url+"task"+tsk,config).then((response)=>{
        const data=JSON.parse(response.data)
        for (let i=0;i<data.length;i++){
            const task={
                id:data[i].id,
                fecha:data[i].fecha,
                hora:data[i].hora,
                desc:data[i].mensaje,
                own:data[i].owner
            }
            console.log(task)
        }
    }).catch(err=>{
        if (err.response!=undefined)
            console.log("error: "+err.response.data);
        else
            console.log("error: "+err)
    })
}

function post1(msj){
    const data = {
        mensaje: msj
    };
    axios.post(url+"task",data,config).then(response=>{
        console.log(response.data);
    }).catch(err=>{
        if (err.response!=undefined)
            console.log("error: "+err.response.data);
        else
            console.log("error: "+err)
    })
}

function post2(){
    const data = {
        mensaje: 'usuario'
    };
    axios.post(url+"usuario",data,config).then(response=>{
        console.log(response.data);
    }).catch(err=>{
        if (err.response!=undefined)
            console.log("error: "+err.response.data);
        else
            console.log("error: "+err)
    })
}

function del(tsk){
    axios.delete(url+"task"+tsk,config).then(response=>{
        console.log(response.data);
    }).catch(err=>{
        if (err.response!=undefined)
            console.log("error: "+err.response.data);
        else
            console.log("error: "+err)
    })
}

function put(msj,tsk){
    const data = {
        mensaje: msj
    };
    axios.put(url+"task"+tsk,data,config).then(response=>{
        console.log(response.data);
    }).catch(err=>{
        if (err.response!=undefined)
            console.log("error: "+err.response.data);
        else
            console.log("error: "+err)
    })
}