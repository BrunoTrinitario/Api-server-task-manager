## Introduccion:
Este proyecto surgio de la idea de tener algo como carta de presentacion a quien soy, y de lo que pudeo ser capaz de hacer. Trata de un pequeno y muy reducido proyecto para implementar un sistema de "to do", en el cual podemos crear y eliminar listas contenedores de estos "to dos" y anadir contribuidores para que nos ayuden en la labor. 

## Tech stack
- Express, para crear la API REST
- BCrypt, para hashear, almacenar y comparar contraseñas
- jsonwebtoken, para gestionar los JWT
- dotenv, para gestionar las variables de entorno

## Como ejecutar el proyecto

Requisitos: Docker (para deploy completo) o Node.js v20 o superior (para deploy parcial)

1. Deploy completo<br></br>
    0. Clonar el repositorio mediante `https://github.com/BrunoTrinitario/Api-server-task-manager`

    Configuracion previa
    Vemos en la ruta del proyecto nuestros 2 archivos de configuracion `./docker-compose.yml` y `./API/.env`
    para el primer archivo, es el que dara las directivas para levantar el proyecto con docker,
    las configuraciones que vamos a cambiar si quisieramos son las siguientes:
        
        mariadb:
        ...
        environment:
        MARIADB_ALLOW_EMPTY_ROOT_PASSWORD: 'yes'
        MARIADB_USER: 'root'
        MARIADB_PASSWORD: ''
        ports:
        - "3306:3306"
        ...

        backend:
        ...
        ports:
        - "3000:3000"
        ...
    En `enviroment` podemos seleccionar el usuario y contrasena para la creacion de la base de datos, se puede encontrar mas informacion en `https://hub.docker.com/_/mariadb`.
    En `ports` sera el mapeo de puertos para poder conectarnos tanto a la base de datos si es sobre el servicio `mariadb` o para la API si es `backend` siendo `[puerto_maquina_host]:[puerto_docker]` recomiendo hacer un mapeo simetrico.
    En el segundo archivo `.env` se encuentran las variables de entorno que utilizara la api para operar.

        PORT = [puerto para conectarse a la api (si se configuro docker, el que esta en el lado izquierdo)]

        IP_DB = [IP para conectarse a la base de datos]

        PORT_DB = [puerto para conectarse a la base de datos (si se configuro docker, el que esta en el lado izquierdo)]

        USER_DB = [usuario para conectarse a la base de datos (especificado en docker)] 

        PASS_DB = [contrasena para conectarse a la base de datos (especificado en docker)]

        DB_NAME = 'listas' [nombre de la base de datos a la que se quiere conectar]

        SECRET = [clave secreta para firmar los json web tokens]
   
    1. ejecutar el proyecto, sobre la ruta donde se encuentra ejecutar en la linea de comandos `docker compose up`

2. Deploy parcial
- Consta de ejecutar la api en la computadora host ya teniendo una base de datos mariadb instalada en el ordenador, para ello, se requiere configurar la base de datos `./database/init.sql` se encuentra el script sql para crear la base de datos adecuada.
- Una vez configurado el archivo `./API/.env` con los puertos, usuarios, contrasenas e ips adecuadas ya se puede desplegar el proyecto
    1. Con la linea de comandos se accede a `./API` 
    2. Se instalan las dependecias `node install`
    3. Se ejecuta la api `node server.js`



## Endpoints de la API
### PATH: `./login`

| Método | Tipo      | Parámetros                          | Respuesta                                                                                       |
|--------|-----------|-------------------------------------|------------------------------------------------------------------------------------------------|
| **GET**  | Header    | `authorization: username:password` | **200:** OK<br>**400:** Encabezado mal formado<br>**401:** Contraseña incorrecta<br>**404:** Usuario no encontrado<br>**500:** Error en la base de datos |
|        |  Respuesta      | <br>`{`<br> `"id_user": [id_usuario],`<br>`"acc_token": [token_jwt_acceso],`<br>`"ref_tok": [token_jwt_refresco]`<br>`}` |                                                                 |
| **POST** | Body      | `{ "username": [nombre_usuario], "password": [contraseña] }` | **200:** OK<br>**400:** Datos de registro inválidos<br>**409:** Usuario existente<br>**500:** Error en la base de datos |
| **PATCH**| Body      | `{ "username": [nombre_usuario], "password": [contraseña_actual], "newpassword": [nueva_contraseña] }` | **200:** OK<br>**400:** Datos o credenciales inválidas<br>**404:** Usuario no encontrado<br>**500:** Error en la base de datos |
| **DELETE**| Body      | `{ "username": [nombre_usuario], "password": [contraseña_actual] }` | **200:** OK<br>**400:** Datos o credenciales inválidas<br>**404:** Usuario no encontrado<br>**500:** Error en la base de datos |

### PATH: `./refresh`

| Método | Tipo   | Parámetros                          | Respuesta                                                                                       |
|--------|--------|-------------------------------------|------------------------------------------------------------------------------------------------|
| **GET**  | Header | `authorization: bearer [refresh_token]` | **200:** OK<br>**400:** Encabezado mal formado<br>**401:** JWT error<br>**403:** Error al verificar el token |
|        |   respuesta     | <br>`{`<br>`"acc_token": [token_jwt_acceso],`<br>`"ref_tok": [mismo_token_jwt_refresco]`<br>`}` |                                                                 |

### PATH: `./list`

##### **GET** `/lists`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |
| **Respuesta**         | JSON   | Lista de objetos:<br>`[{`<br>`"id_list": [id_lista],`<br>`"name": [nombre_lista],`<br>`"id_administrator": [id_administrador],`<br>`"creation_date": [fecha_creacion]`<br>`}, ...]` |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Datos para GET inválidos         |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **500**| Error en la base de datos        |

---

##### **POST** `/lists`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |
| **Body**              | JSON   | `{ "name": [nombre_lista] }`            |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Datos de registro inválidos      |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **404**| Usuario no encontrado            |
| **500**| Error en la base de datos        |

---

##### **PATCH** `/lists/:id_list`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |
| **Body**              | JSON   | `{ "newname": [nuevo_nombre_lista] }`   |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Datos de modificación inválidos  |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **403**| Usuario sin permisos             |
| **404**| Lista no encontrada              |
| **500**| Error en la base de datos        |

---

##### **DELETE** `/lists/:id_list`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Datos de eliminación inválidos   |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **403**| Usuario sin permisos             |
| **404**| Lista no encontrada              |
| **500**| Error en la base de datos        |

### PATH: `./list/:id_list/todo`

##### **GET** `/todos`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |
| **Respuesta**         | JSON   | Lista de objetos:<br>`[{`<br>`"id_todo": [identificador_todo],`<br>`"id_list": [identificador_lista],`<br>`"creation_date": [fecha_creacion],`<br>`"deleted": [fue_eliminado],`<br>`"_text": [texto_contenido]`<br>`}, ...]` |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Usuario ingresado inválido       |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **403**| Usuario sin permisos             |
| **404**| Lista no encontrada              |
| **500**| Error en la base de datos        |

---

##### **POST** `/todos`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |
| **Body**              | JSON   | `{ "text": [texto_todo] }`              |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Datos de registro inválidos      |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **403**| Usuario sin permisos             |
| **404**| Lista no encontrada              |
| **500**| Error en la base de datos        |

---

##### **PATCH** `/todos/:id_todo`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |
| **Body**              | JSON   | `{ "newtext": [nuevo_texto_todo] }`     |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Datos de modificación inválidos  |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **403**| Usuario sin permisos             |
| **404**| Lista no encontrada              |
| **404**| Todo no encontrado               |
| **500**| Error en la base de datos        |

---

##### **DELETE** `/todos/:id_todo`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |
| **Body**              | JSON   | `{ "action": [accion_para_todo] }`      |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Datos de eliminación inválidos   |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **403**| Usuario sin permisos             |
| **404**| Lista no encontrada              |
| **404**| Todo no encontrado               |
| **405**| Acción inválida                  |
| **500**| Error en la base de datos        |

### PATH `./list/:id_list/contributors`

##### **GET** `/contributors`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |
| **Respuesta**         | JSON   | Lista de objetos:<br>`[{`<br>`"id_user": [id_usuario],`<br>`"_user": [nombre_usuario],`<br>`"permission": [permisos]`<br>`}, ...]` |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **403**| Usuario sin permisos             |
| **404**| Lista no encontrada              |
| **500**| Error en la base de datos        |

---

##### **POST** `/contributors/generate-link`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |
| **Body**              | JSON   | `{ "permission": [permisos] }`          |
| **Respuesta**         | JSON   | `{ "link": "http:/[host:port]/list/:id_list/contributors/:random_number" }` |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Datos de generación de link inválidos |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **403**| Usuario sin permisos             |
| **404**| Lista no encontrada              |
| **500**| Error en la base de datos        |

---

##### **POST** `/contributors/link`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Datos de usuario enviados inválidos |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **404**| Link no encontrado               |
| **404**| Usuario no encontrado            |
| **404**| Lista no encontrada              |
| **410**| Link expirado                    |
| **500**| Error en la base de datos        |

---

##### **DELETE** `/contributors`
| Parámetro             | Tipo   | Descripción                             |
|-----------------------|--------|-----------------------------------------|
| **Header**            | `authorization: bearer [access_token]` | Token de acceso para autenticación.      |
| **Body**              | JSON   | `{ "contributor": [usuario_contribuidor] }` |

| Código | Descripción                      |
|--------|----------------------------------|
| **200**| OK                               |
| **400**| Datos de eliminación inválidos   |
| **401**| Token JWT inválido               |
| **403**| Token JWT expirado               |
| **403**| Usuario sin permisos             |
| **404**| Lista no encontrada              |
| **500**| Error en la base de datos        |

## Flujo de la api
El usuario debe crear su cuenta, y logearse, al logearse el servidor le entrega al navegador dos cosas muy importantes, el id del usuario y sus respectivos tokens, estos, principalmente el de acceso, cumple un rol muy importante en las peticiones, ya que, parte de su carga util es el nombre de usuario del que inicio la sesion y muchos metodos aprovechan esta informacion para operar.
Una vez logeado y con los tokens guardados ya se puede utilzar libremente la API, respetando los metodos y formatos de los endpoints.

## Arquitectura
### Diagrama de entidad relacion
![](images/DER.png)
### Diagrama de componentes
![](images/Components_micro.png)
![](images/Components_macro.png)
### interfaces
#### iDatabase_manager

| Método                                |
|---------------------------------------|
| `executeQuery(query, params)`         |
| `getUser(username)`                   |
| `regUser(user, pass)`                 |
| `modUser(user, pass)`                 |
| `delUser(user)`                       |
| `getListId(id)`                       |
| `getListUser(username)`               |
| `newList(username, name)`             |
| `modList(id, newname)`                |
| `delList(id)`                         |
| `getPermission(id_user, id_list)`     |
| `getTodoList(id_list)`                |
| `getTodoById(id_list, id_todo)`       |
| `newTodo(id_list, text)`              |
| `modTodo(id_list, id_todo, newText)`  |
| `delTodo(id_list, id_todo)`           |
| `notDelTodo(id_list, id_todo)`        |
| `getAllContributors(id_list)`         |
| `delContributor(id_list, user_contributor)` |
| `newContributor(id_list, id_user, permission)` |
| `getIdFromUser(username)`             |

#### iList_manager

| Método                                |
|---------------------------------------|
| `executeQuery(query, params)`         |
| `getUser(username)`                   |
| `regUser(user, pass)`                 |
| `modUser(user, pass)`                 |
| `delUser(user)`                       |
| `getListId(id)`                       |
| `getListUser(username)`               |
| `newList(username, name)`             |
| `modList(id, newname)`                |
| `delList(id)`                         |
| `getPermission(id_user, id_list)`     |
| `getTodoList(id_list)`                |
| `getTodoById(id_list, id_todo)`       |
| `newTodo(id_list, text)`              |
| `modTodo(id_list, id_todo, newText)`  |
| `delTodo(id_list, id_todo)`           |
| `notDelTodo(id_list, id_todo)`        |
| `getAllContributors(id_list)`         |
| `delContributor(id_list, user_contributor)` |
| `newContributor(id_list, id_user, permission)` |
| `getIdFromUser(username)`             |

#### iTodo_manager

| Método                                |
|---------------------------------------|
| `getAlltodo(username, id_list)`       |
| `createTodo(username, id_list, text)` |
| `patchTodo(username, id_list, id_todo, newText)` |
| `deleteTodo(username, id_list, id_todo, action)` |
| `getOneTODObyID(id_todo, id_list)`    |

#### iUser_manager

| Método                                |
|---------------------------------------|
| `getContributors(username, id_list)`  |
| `deleteContributors(user_admin, id_list, user_contributor)` |
| `generateLink(user_admin, id_list, permission)` |
| `registerContributor(id_list, permission, username)` |

#### iContributors_manager

| Método                                          |
|-------------------------------------------------|
| `getContributors(username, id_list)`            |
| `deleteContributors(user_admin, id_list, user_contributor)` |
| `generateLink(user_admin, id_list, permission)` |
| `registerContributor(id_list, permission, username)` |

#### iToken_manager

| Método                                |
|---------------------------------------|
| `getToken(req)`                       |
| `getUsernameFromToken(token)`         |
| `verifyToken(token)`                  |
| `tokenGenerator(username, seconds)`   |