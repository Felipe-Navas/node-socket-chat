const { Usuarios } = require('../clases/usuarios');
const { io } = require('../server');
const { crearMensaje } = require('../helpers/helpers');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {
        if (!data.nombre) {
            return callback({
                error: true,
                mensaje: 'El nombre es necesario',
            })
        };
        
        let personas = usuarios.agregarPersona(client.id, data.nombre);
        
        client.broadcast.emit('listaPersona', usuarios.getPersonas());

        callback(personas);
    });

    client.on('crearMensaje', (data => {

        const persona = usuarios.getPersona(client.id);
        const mensaje = crearMensaje(persona.nombre, data.mensaje);

        client.broadcast.emit('crearMensaje', mensaje);
    }));

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona( client.id );

        client.broadcast.emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} salió`));
        client.broadcast.emit('listaPersona', usuarios.getPersonas());
    });

    // Mensajes privados
    client.on('mensajePrivado', data => {
        const persona = usuarios.getPersona(client.id);

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
    });
});