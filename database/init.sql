CREATE DATABASE listas;

USE listas;

CREATE TABLE users(
	id_user int AUTO_INCREMENT PRIMARY KEY,
    _user varchar(256),
    _password varchar(1024)
);

CREATE TABLE _list(
	id_list int AUTO_INCREMENT PRIMARY KEY,
    name varchar(256),
    id_administrator int,
	creation_date date,
    FOREIGN KEY (id_administrator) REFERENCES users(id_user)
);

CREATE table contributes(
	id_user int,
    id_list int,
    permission varchar(8),
    PRIMARY key (id_user,id_list),
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_list) REFERENCES _list(id_list) ON DELETE CASCADE
);

CREATE table todo(
	id_todo int AUTO_INCREMENT not null,
    id_list int not null,
    creation_date date,
    deleted boolean,
    _text text,
    PRIMARY KEY (id_todo,id_list),
    FOREIGN KEY (id_list) REFERENCES _list(id_list) ON DELETE CASCADE
);