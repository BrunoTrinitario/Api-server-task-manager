const axios=require("axios");
const url="http://localhost:1234/"
const config = {
    auth: {
        username: 'bruno',
        password: 'bruno'
    }
};
let task
const flag=process.argv[2]
if (process.argv[3]!=undefined)
    task=process.argv[3]//string vacio para todo, si no "/[task deseado].txt" para get "?[parametros query]"
else
    task=""
let mensaje//para post y put
if (process.argv[4]!=undefined)
    mensaje=process.argv[4]//string vacio para todo, si no "/[task deseado].txt" para get "?[parametros query]"
else
    mensaje=""

switch(flag){
    case "get":
        get(task);
        break;
    case "post":
        post1(mensaje,task);
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

function post1(msj,tsk){
    const data = {
        mensaje: msj
    };
    axios.post(url+tsk,data,config).then(response=>{
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