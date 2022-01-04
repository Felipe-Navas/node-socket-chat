const { Usuarios } = require('../clases/usuarios');
const { io } = require('../server');
const { crearMensaje } = require('../helpers/helpers');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre y la sala son necesarios',
            })
        };

        client.join(data.sala);

        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);
        
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