import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as moment from 'moment';
import * as algoliasearch from 'algoliasearch';

const env = functions.config ();
admin.initializeApp (env.firebase);

const nodemailer = require('nodemailer');
const cors = require('cors');

// Initialize the Algolia Client
const client = algoliasearch (env.algolia.appid, env.algolia.apikey);
const index = client.initIndex ('dircetur');

const app = express ();
app.use(cors({ origin: true }))

const main = express ();

main.use('/api/v1', app);
main.use(bodyParser.json ());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dirceturapp@gmail.com',
        pass: 'sjrwxsgfigyzxivo'
    }
});

moment.locale('es');

export const webApi = functions.https.onRequest (main);

const db = admin.firestore();

exports.addAgenciaAlgolia = functions.firestore.document ('Agencias/{id}').onCreate ((snapshot: any, context: any) => {
  const data: any = {
    'nombre_comercial': snapshot.data ().nombre_comercial,
    'ruc': snapshot.data ().ruc,
    'razon_social': snapshot.data ().razon_social,
    'tipo': 'agencia'
  };
  const objectID = snapshot.id;

  return index.addObject({
    objectID,
    ...data
  });
});

exports.addAgencia = functions.firestore.document ('Agencias/{id}').onCreate ((snapshot: any, context: any) => {
  const data_creada = snapshot.data ();
  const batch = db.batch ();

  const ref = db.collection ('Estadisticas_Prestadores_Provincias').doc (data_creada.provincia.id);

  return db.runTransaction((t: any) => {
    return t.get (ref).then ((doc: any) => {
      const data = doc.data ();        

      const update: any = {};

      if (doc.exists === false) {
        update ['id'] = data_creada.provincia.id;
        update ['nombre'] = data_creada.provincia.nombre;
        
        update ['total_agencias'] = 1;
        update [moment ().format ('[total_agencias_]YYYY')] = 1;
        update [moment ().format ('[total_agencias_]YYYY[_]MM')] = 1;

        update ['total_alojamientos'] = 0;
        update [moment ().format ('[total_alojamientos_]YYYY')] = 0;
        update [moment ().format ('[total_alojamientos_]YYYY[_]MM')] = 0;

        update ['total_restaurantes'] = 0;
        update [moment ().format ('[total_restaurantes_]YYYY')] = 0;
        update [moment ().format ('[total_restaurantes_]YYYY[_]MM')] = 0;

        update ['total_guias'] = 0;
        update [moment ().format ('[total_guias_]YYYY')] = 0;
        update [moment ().format ('[total_guias_]YYYY[_]MM')] = 0;

        t.set(ref, update);
      } else {
        update ['total_agencias'] = data ['total_agencias'] + 1;
        update [moment ().format ('[total_agencias_]YYYY')] = data [moment ().format ('[total_agencias_]YYYY')] + 1;
        update [moment ().format ('[total_agencias_]YYYY[_]MM')] = data [moment ().format ('[total_agencias_]YYYY[_]MM')] + 1;

        t.update (ref, update);
      }
    });
  })
  .then (() => {
    const ref_02 = db.collection ('Estadisticas_Prestadores_Distritos').doc (data_creada.distrito.id);

    return db.runTransaction((t: any) => {
      return t.get (ref_02).then ((doc: any) => {
        const data = doc.data ();        

        const update: any = {};

        if (doc.exists === false) {
          update ['id'] = data_creada.distrito.id;
          update ['nombre'] = data_creada.distrito.nombre;
          update ['provincia_id'] = data_creada.provincia.id;

          update ['total_agencias'] = 1;
          update [moment ().format ('[total_agencias_]YYYY')] = 1;
          update [moment ().format ('[total_agencias_]YYYY[_]MM')] = 1;

          update ['total_alojamientos'] = 0;
          update [moment ().format ('[total_alojamientos_]YYYY')] = 0;
          update [moment ().format ('[total_alojamientos_]YYYY[_]MM')] = 0;

          update ['total_restaurantes'] = 0;
          update [moment ().format ('[total_restaurantes_]YYYY')] = 0;
          update [moment ().format ('[total_restaurantes_]YYYY[_]MM')] = 0;

          update ['total_guias'] = 0;
          update [moment ().format ('[total_guias_]YYYY')] = 0;
          update [moment ().format ('[total_guias_]YYYY[_]MM')] = 0;

          t.set(ref_02, update);
        } else {
          update ['total_agencias'] = data ['total_agencias'] + 1;
          update [moment ().format ('[total_agencias_]YYYY')] = data [moment ().format ('[total_agencias_]YYYY')] + 1;
          update [moment ().format ('[total_agencias_]YYYY[_]MM')] = data [moment ().format ('[total_agencias_]YYYY[_]MM')] + 1;
          
          t.update (ref_02, update);
        }
      });
    })
    .then (() => {
      const step_1 = db.collection ('Users').doc (data_creada.id);
      batch.set (step_1, { 
          'id': data_creada.id,
          'correo': data_creada.correo, 
          'contraseña': data_creada.contraseña,
          'producto_tipo': 'agencia',
          'tipo_usuario': 'proveedor'
      });

      const step_2 = db.collection ('Correos_Usados').doc (data_creada.correo);
      batch.set (step_2, { 
          'id': data_creada.correo
      });

      return batch.commit ();
    });
  });
});

exports.addAlojamientoAlgolia = functions.firestore.document ('Alojamientos/{id}').onCreate ((snapshot: any, context: any) => {
  const data: any = {
    'nombre_comercial': snapshot.data ().nombre_comercial,
    'ruc': snapshot.data ().ruc,
    'razon_social': snapshot.data ().razon_social,
    'tipo': 'alojamiento'
  };
  const objectID = snapshot.id;

  return index.addObject({
    objectID,
    ...data
  });
});

exports.addAlojamiento = functions.firestore.document ('Alojamientos/{id}').onCreate ((snapshot: any, context: any) => {
  const data_creada = snapshot.data ();
  const batch = db.batch ();

  const ref = db.collection ('Estadisticas_Prestadores_Provincias').doc (data_creada.provincia.id);

  return db.runTransaction((t: any) => {
    return t.get (ref).then ((doc: any) => {
      const data = doc.data ();        

      const update: any = {};

      if (doc.exists === false) {
        update ['id'] = data_creada.provincia.id;
        update ['nombre'] = data_creada.provincia.nombre;
        
        update ['total_agencias'] = 0;
        update [moment ().format ('[total_agencias_]YYYY')] = 0;
        update [moment ().format ('[total_agencias_]YYYY[_]MM')] = 0;

        update ['total_alojamientos'] = 1;
        update [moment ().format ('[total_alojamientos_]YYYY')] = 1;
        update [moment ().format ('[total_alojamientos_]YYYY[_]MM')] = 1;

        update ['total_restaurantes'] = 0;
        update [moment ().format ('[total_restaurantes_]YYYY')] = 0;
        update [moment ().format ('[total_restaurantes_]YYYY[_]MM')] = 0;

        update ['total_guias'] = 0;
        update [moment ().format ('[total_guias_]YYYY')] = 0;
        update [moment ().format ('[total_guias_]YYYY[_]MM')] = 0;

        t.set(ref, update);
      } else {
        update ['total_alojamientos'] = data ['total_alojamientos'] + 1;
        update [moment ().format ('[total_alojamientos_]YYYY')] = data [moment ().format ('[total_alojamientos_]YYYY')] + 1;
        update [moment ().format ('[total_alojamientos_]YYYY[_]MM')] = data [moment ().format ('[total_alojamientos_]YYYY[_]MM')] + 1;

        t.update (ref, update);
      }
    });
  })
  .then (() => {
    const ref_02 = db.collection ('Estadisticas_Prestadores_Distritos').doc (data_creada.distrito.id);

    return db.runTransaction((t: any) => {
      return t.get (ref_02).then ((doc: any) => {
        const data = doc.data ();        

        const update: any = {};

        if (doc.exists === false) {
          update ['id'] = data_creada.distrito.id;
          update ['nombre'] = data_creada.distrito.nombre;
          update ['provincia_id'] = data_creada.provincia.id;

          update ['total_agencias'] = 0;
          update [moment ().format ('[total_agencias_]YYYY')] = 0;
          update [moment ().format ('[total_agencias_]YYYY[_]MM')] = 0;

          update ['total_alojamientos'] = 1;
          update [moment ().format ('[total_alojamientos_]YYYY')] = 1;
          update [moment ().format ('[total_alojamientos_]YYYY[_]MM')] = 1;

          update ['total_restaurantes'] = 0;
          update [moment ().format ('[total_restaurantes_]YYYY')] = 0;
          update [moment ().format ('[total_restaurantes_]YYYY[_]MM')] = 0;

          update ['total_guias'] = 0;
          update [moment ().format ('[total_guias_]YYYY')] = 0;
          update [moment ().format ('[total_guias_]YYYY[_]MM')] = 0;

          t.set(ref_02, update);
        } else {
          update ['total_alojamientos'] = data ['total_alojamientos'] + 1;
          update [moment ().format ('[total_alojamientos_]YYYY')] = data [moment ().format ('[total_alojamientos_]YYYY')] + 1;
          update [moment ().format ('[total_alojamientos_]YYYY[_]MM')] = data [moment ().format ('[total_alojamientos_]YYYY[_]MM')] + 1;
          
          t.update (ref_02, update);
        }
      });
    })
    .then (() => {
      const step_1 = db.collection ('Users').doc (data_creada.id);
      batch.set (step_1, { 
          'id': data_creada.id,
          'correo': data_creada.correo, 
          'contraseña': data_creada.contraseña,
          'producto_tipo': 'alojamiento',
          'tipo_usuario': 'proveedor'
      });

      const step_2 = db.collection ('Correos_Usados').doc (data_creada.correo);
      batch.set (step_2, { 
          'id': data_creada.correo
      });

      return batch.commit ();
    });
  });
});

exports.addRestaurante = functions.firestore.document ('Restaurantes/{id}').onCreate ((snapshot: any, context: any) => {
  const data_creada = snapshot.data ();
  const batch = db.batch ();

  const ref = db.collection ('Estadisticas_Prestadores_Provincias').doc (data_creada.provincia.id);

  return db.runTransaction((t: any) => {
    return t.get (ref).then ((doc: any) => {
      const data = doc.data ();        

      const update: any = {};

      if (doc.exists === false) {
        update ['id'] = data_creada.provincia.id;
        update ['nombre'] = data_creada.provincia.nombre;
        
        update ['total_agencias'] = 0;
        update [moment ().format ('[total_agencias_]YYYY')] = 0;
        update [moment ().format ('[total_agencias_]YYYY[_]MM')] = 0;

        update ['total_alojamientos'] = 0;
        update [moment ().format ('[total_alojamientos_]YYYY')] = 0;
        update [moment ().format ('[total_alojamientos_]YYYY[_]MM')] = 0;

        update ['total_restaurantes'] = 1;
        update [moment ().format ('[total_restaurantes_]YYYY')] = 1;
        update [moment ().format ('[total_restaurantes_]YYYY[_]MM')] = 1;

        update ['total_guias'] = 0;
        update [moment ().format ('[total_guias_]YYYY')] = 0;
        update [moment ().format ('[total_guias_]YYYY[_]MM')] = 0;

        t.set(ref, update);
      } else {
        update ['total_restaurantes'] = data ['total_restaurantes'] + 1;
        update [moment ().format ('[total_restaurantes_]YYYY')] = data [moment ().format ('[total_restaurantes_]YYYY')] + 1;
        update [moment ().format ('[total_restaurantes_]YYYY[_]MM')] = data [moment ().format ('[total_restaurantes_]YYYY[_]MM')] + 1;

        t.update (ref, update);
      }
    });
  })
  .then (() => {
    const ref_02 = db.collection ('Estadisticas_Prestadores_Distritos').doc (data_creada.distrito.id);

    return db.runTransaction((t: any) => {
      return t.get (ref_02).then ((doc: any) => {
        const data = doc.data ();        

        const update: any = {};

        if (doc.exists === false) {
          update ['id'] = data_creada.distrito.id;
          update ['nombre'] = data_creada.distrito.nombre;
          update ['provincia_id'] = data_creada.provincia.id;

          update ['total_agencias'] = 0;
          update [moment ().format ('[total_agencias_]YYYY')] = 0;
          update [moment ().format ('[total_agencias_]YYYY[_]MM')] = 0;

          update ['total_alojamientos'] = 0;
          update [moment ().format ('[total_alojamientos_]YYYY')] = 0;
          update [moment ().format ('[total_alojamientos_]YYYY[_]MM')] = 0;

          update ['total_restaurantes'] = 1;
          update [moment ().format ('[total_restaurantes_]YYYY')] = 1;
          update [moment ().format ('[total_restaurantes_]YYYY[_]MM')] = 1;

          update ['total_guias'] = 0;
          update [moment ().format ('[total_guias_]YYYY')] = 0;
          update [moment ().format ('[total_guias_]YYYY[_]MM')] = 0;

          t.set(ref_02, update);
        } else {
          update ['total_restaurantes'] = data ['total_restaurantes'] + 1;
          update [moment ().format ('[total_restaurantes_]YYYY')] = data [moment ().format ('[total_restaurantes_]YYYY')] + 1;
          update [moment ().format ('[total_restaurantes_]YYYY[_]MM')] = data [moment ().format ('[total_restaurantes_]YYYY[_]MM')] + 1;
          
          t.update (ref_02, update);
        }
      });
    })
    .then (() => {
      const step_1 = db.collection ('Users').doc (data_creada.id);
      batch.set (step_1, { 
          'id': data_creada.id,
          'correo': data_creada.correo, 
          'contraseña': data_creada.contraseña,
          'producto_tipo': 'restaurante',
          'tipo_usuario': 'proveedor'
      });

      const step_2 = db.collection ('Correos_Usados').doc (data_creada.correo);
      batch.set (step_2, { 
          'id': data_creada.correo
      });

      return batch.commit ();
    });
  });
});

exports.addGuia = functions.firestore.document ('Guias/{id}').onCreate ((snapshot: any, context: any) => {
  const data_creada = snapshot.data ();
  const batch = db.batch ();

  const ref = db.collection ('Estadisticas_Prestadores_Provincias').doc (data_creada.provincia.id);

  return db.runTransaction((t: any) => {
    return t.get (ref).then ((doc: any) => {
      const data = doc.data ();        

      const update: any = {};

      if (doc.exists === false) {
        update ['id'] = data_creada.provincia.id;
        update ['nombre'] = data_creada.provincia.nombre;
        
        update ['total_agencias'] = 0;
        update [moment ().format ('[total_agencias_]YYYY')] = 0;
        update [moment ().format ('[total_agencias_]YYYY[_]MM')] = 0;

        update ['total_alojamientos'] = 0;
        update [moment ().format ('[total_alojamientos_]YYYY')] = 0;
        update [moment ().format ('[total_alojamientos_]YYYY[_]MM')] = 0;

        update ['total_restaurantes'] = 0;
        update [moment ().format ('[total_restaurantes_]YYYY')] = 0;
        update [moment ().format ('[total_restaurantes_]YYYY[_]MM')] = 0;

        update ['total_guias'] = 1;
        update [moment ().format ('[total_guias_]YYYY')] = 1;
        update [moment ().format ('[total_guias_]YYYY[_]MM')] = 1;

        t.set(ref, update);
      } else {
        update ['total_guias'] = data ['total_guias'] + 1;
        update [moment ().format ('[total_guias_]YYYY')] = data [moment ().format ('[total_guias_]YYYY')] + 1;
        update [moment ().format ('[total_guias_]YYYY[_]MM')] = data [moment ().format ('[total_guias_]YYYY[_]MM')] + 1;

        t.update (ref, update);
      }
    });
  })
  .then (() => {
    const ref_02 = db.collection ('Estadisticas_Prestadores_Distritos').doc (data_creada.distrito.id);

    return db.runTransaction((t: any) => {
      return t.get (ref_02).then ((doc: any) => {
        const data = doc.data ();        

        const update: any = {};

        if (doc.exists === false) {
          update ['id'] = data_creada.distrito.id;
          update ['nombre'] = data_creada.distrito.nombre;
          update ['provincia_id'] = data_creada.provincia.id;

          update ['total_agencias'] = 0;
          update [moment ().format ('[total_agencias_]YYYY')] = 0;
          update [moment ().format ('[total_agencias_]YYYY[_]MM')] = 0;

          update ['total_alojamientos'] = 0;
          update [moment ().format ('[total_alojamientos_]YYYY')] = 0;
          update [moment ().format ('[total_alojamientos_]YYYY[_]MM')] = 0;

          update ['total_restaurantes'] = 0;
          update [moment ().format ('[total_restaurantes_]YYYY')] = 0;
          update [moment ().format ('[total_restaurantes_]YYYY[_]MM')] = 0;

          update ['total_guias'] = 1;
          update [moment ().format ('[total_guias_]YYYY')] = 1;
          update [moment ().format ('[total_guias_]YYYY[_]MM')] = 1;

          t.set(ref_02, update);
        } else {
          update ['total_guias'] = data ['total_guias'] + 1;
          update [moment ().format ('[total_guias_]YYYY')] = data [moment ().format ('[total_guias_]YYYY')] + 1;
          update [moment ().format ('[total_guias_]YYYY[_]MM')] = data [moment ().format ('[total_guias_]YYYY[_]MM')] + 1;
          
          t.update (ref_02, update);
        }
      });
    })
    .then (() => {
      const step_1 = db.collection ('Users').doc (data_creada.id);
      batch.set (step_1, { 
          'id': data_creada.id,
          'correo': data_creada.correo, 
          'contraseña': data_creada.contraseña,
          'producto_tipo': 'guia',
          'tipo_usuario': 'proveedor'
      });

      const step_2 = db.collection ('Correos_Usados').doc (data_creada.correo);
      batch.set (step_2, { 
          'id': data_creada.correo
      });

      return batch.commit ();
    });
  });
});

exports.addEvento = functions.firestore.document ('Eventos/{id}').onCreate ((snapshot: any, context: any) => {
    const data = snapshot.data ();
    const batch = db.batch ();

    const step_1 = db.collection ('Provincias').doc (data.provincia.id).collection ('Lista_Eventos').doc (data.id);
    batch.set (step_1, { 
        'id': data.id,
        'titulo': data.titulo,
        'fecha': data.fecha,
        'organizador': data.organizador
    });

    const step_2 = db.collection ('Provincias').doc (data.provincia.id)
        .collection ('Distritos').doc (data.distrito.id).collection ('Lista_Eventos').doc (data.id);
    batch.set (step_2, { 
        'id': data.id,
        'titulo': data.titulo,
        'fecha': data.fecha,
        'organizador': data.organizador
    });

    const step_03 = db.collection ('Eventos_Fechas').doc (moment(data.fecha).format('MM')).collection ("Eventos").doc (data.id);
    batch.set (step_03, {
      id: data.id
    });
    
    return batch.commit ();
});

exports.addEventoArtesania = functions.firestore.document ('Eventos_Artesania/{id}').onCreate ((snapshot: any, context: any) => {
    const data = snapshot.data ();
    const batch = db.batch ();

    const step_1 = db.collection ('Provincias').doc (data.provincia.id).collection ('Lista_Eventos_Artesania').doc (data.id);
    batch.set (step_1, { 
        'id': data.id,
        'titulo': data.titulo,
        'fecha': data.fecha,
        'organizador': data.organizador
    });

    const step_2 = db.collection ('Provincias').doc (data.provincia.id)
        .collection ('Distritos').doc (data.distrito.id).collection ('Lista_Eventos_Artesania').doc (data.id);
    batch.set (step_2, { 
        'id': data.id,
        'titulo': data.titulo,
        'fecha': data.fecha,
        'organizador': data.organizador
    });

    const step_03 = db.collection ('Eventos_Artesania_Fechas').doc (moment(data.fecha).format('MM')).collection ("Eventos").doc (data.id);
    batch.set (step_03, {
      id: data.id
    });

    return batch.commit ();
});

exports.createUser = functions.firestore.document ('Users/{user}').onCreate ((snapshot: any, context: any) => {
    const id = snapshot.data ().id;
    const email = snapshot.data ().correo;
    const password = snapshot.data ().contraseña;
  
    return admin.auth ().createUser ({
      uid: id,
      email: email,
      password: password
    });
});

exports.addCountViajeProgramadoSalidas = functions.firestore.document ('Viajes_Programados/{viaje_id}/Salidas/{salida_id}').onCreate ((snapshot: any, context: any) => {
    const viaje_id = context.params.viaje_id;
  
    const ref = db.collection ('Viajes_Programados').doc (viaje_id);
  
    return db.runTransaction((t: any) => {
      return t.get (ref).then ((doc: any) => {
        const update = doc.data ();
        let new_count: number;

        if (update ['nro_salidas'] === undefined) {
          new_count = 1;
        } else {
          new_count = update ['nro_salidas'] + 1;
        }

        update ['nro_salidas'] = new_count;
        t.update (ref, update);
      });
    });            
});

exports.addCountViajeroProgramadoSalidas = functions.firestore.document ('Viajes_Programados/{viaje_id}/Salidas/{salida_id}/Viajeros/{viajero_id}').onCreate (async (snapshot: any, context: any) => {
  const viaje_id = context.params.viaje_id;
  const salida_id = context.params.salida_id;
  
  const data = snapshot.data ();
  const viaje_data: any = await db.collection ('Viajes_Programados').doc (viaje_id).get ();
  const salida: any = await db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id).get ();

  console.log ('viaje_data', viaje_data.data ());
  console.log ('salida', salida.data ());

  // Send Email
  const dest = data.correo;
  const mailOptions = {
      from: 'Dircetu <dirceturapp@gmail.com>',
      to: dest,
      subject: 'Dircetur | Registro turismo social',
      html: `
          <h3>Hola ${data.nombre_completo}<h3>
          <p>Te haz registrado en el viaje <b>${viaje_data.data ().nombre}</b> para la salida del ${moment (salida.data ().fecha_salida).format ('LLL')}</p>
      `
  };

  transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
          console.log ('sendMail error', error);
      } else {
          console.log ('Sended', info);
      }
  });

  const ref = db.collection ('Viajes_Programados').doc (viaje_id);
  let new_count: number;

  if (viaje_data.data ().ultimo_viaje_nro_incritos >= viaje_data.data ().ultimo_viaje_cupos) {
    if (viaje_data.data ().ultimo_viaje_nro_pendientes < 10 || viaje_data.data ().ultimo_viaje_nro_pendientes === undefined) {
      return db.runTransaction((t: any) => {
        return t.get (ref).then (async (doc: any) => {
          const data_viaje = doc.data ();
          const update: any = {};
    
          if (data_viaje ['ultimo_viaje_nro_pendientes'] === undefined) {
            new_count = 1;
            update ['ultimo_viaje_nro_pendientes'] = 1;
          } else {
            new_count = data_viaje ['ultimo_viaje_nro_pendientes'] + 1;
            update ['ultimo_viaje_nro_pendientes'] = new_count;
          }

          const batch = db.batch ();
  
          const step_1 = db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id);
          batch.update (step_1, { 
            'nro_pendientes': new_count
          });
  
          const step_2 = db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id).collection ('Viajeros').doc (data.dni);
            batch.update (step_2, { 
            'esta_cola': true
          });
  
          await batch.commit ();
          t.update (ref, update);
        });           
      });
    }
  } else {
    console.log ("Entro en false, inicicia trans");

    const ref_2 = db.collection ('Viajes_Programados').doc (viaje_id);

    return db.runTransaction((t: any) => {
      return t.get (ref_2).then (async (doc: any) => {
        const data_viaje = doc.data ();
        const update: any = {};

        new_count = data_viaje ['ultimo_viaje_nro_incritos'] + 1;
        update ['ultimo_viaje_nro_incritos'] = new_count;

        console.log ('Ver actualizado', update);

        const batch = db.batch ();

        const step_1 = db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id);
        batch.update (step_1, { 
          'nro_inscritos': new_count
        });

        if (new_count >= viaje_data.data ().ultimo_viaje_cupos) {
          update ['estado'] = 1;

          const step_3 = db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id);
          batch.update (step_3, { 
            'estado': 1
          });
        }

        await batch.commit ();
        t.update (ref_2, update);
      });           
    }); 
  }
});

exports.checkSalidaActualizada = functions.firestore.document ('Viajes_Programados/{viaje_id}/Salidas/{salida_id}').onUpdate (async (snapshot: any, context: any) => {
    const data_before = snapshot.before.data ();  
    const data = snapshot.after.data ();
    

    const viaje_id = context.params.viaje_id;
    const viaje_data: any = await db.collection ('Viajes_Programados').doc (viaje_id).get ();


    console.log ('data_after', data)

    if (data.eliminado === true) {
        const collection = await db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (data.id).collection ('Viajeros').get ();

        let emails: string = "";

        collection.forEach((doc: any) => {
          emails = emails + doc.data ().correo + ', ';
        });

        console.log ('emails', emails);

        if (emails.length > 0) {
          const dest = emails;
          const mailOptions = {
              from: 'Dircetu <dirceturapp@gmail.com>',
              to: dest,
              subject: 'Viaje cancelado | Turismo social',
              html: `
                  <p>Tu viaje a sido cancelado. lo sentimos...</p>
              `
          };

          return transporter.sendMail(mailOptions, (error: any, info: any) => {
              if (error) {
                  console.log ('sendMail error', error);
              } else {
                  console.log ('Sended', info);
              }
          });
        }

        return 0;
    } else if (data.estado === 2) {
      console.log ("Se ejecuto aqui... cerrar viaje");

      const collection = await db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (data.id).collection ('Viajeros').get ();

      collection.forEach (async (doc: any) => {
        const usuario = doc.data ();

        console.log ('Usuario', usuario);

        if (usuario.esta_cola === false || usuario.esta_cola === undefined) {
          /* Esto es para sumar el nmero de viajes del usuario */

          const batch = db.batch ();

          const step_01 = db.collection ('Usuarios_Viajes_Programados').doc (usuario.dni).collection ('Viajes_Inscritos').doc (viaje_id);  
          batch.set (step_01, {
            id: viaje_id,
            nombre: viaje_data.data ().nombre,
            ultima_salida: data.fecha_salida
          });

          const step_02 = db.collection ('Usuarios_Viajes_Programados').doc (usuario.dni).collection ('Viajes_Inscritos').doc (viaje_id).collection ('Salidas').doc (data.id);   
          batch.set (step_02, {
            id: data.id,
            checked:  usuario.checked,
            fecha: data.fecha_salida
          });

          const _ref = db.collection ('Usuarios_Viajes_Programados').doc (usuario.dni);

          await db.runTransaction((t: any) => {
            return t.get (_ref).then (async (_doc: any) => {
              const update = _doc.data ();
              let new_count;

              if (update ['nro_viajes'] === undefined) {
                new_count = 1
              } else {
                new_count = update ['nro_viajes'] + 1;
              }

              update ['nro_viajes'] = new_count;

              if (new_count >= 2) {
                const date = moment ().add (6, 'months').format ('YYYY[-]MM[-]DD');
                const step_03 = db.collection ('Usuarios_Limite_Superado').doc (date).collection ('Usuarios').doc (usuario.dni)  
                batch.set (step_03, {
                  dni: usuario.dni,
                  fecha: moment ().format ('YYYY[-]MM[-]DD')
                });
                
                const step_04 = db.collection ('Usuarios_Limite_Superado').doc (date).collection ('Usuarios').doc (usuario.dni)  
                batch.set (step_04, {
                  dni: usuario.dni,
                  fecha: moment ().format ('YYYY[-]MM[-]DD')
                });
              }

              t.update (_ref, update);
            });
          }).then (async () => {
            return await batch.commit ();
          });
        }
      });
    } else if (data_before.fecha_salida !== data.fecha_salida) {
        console.log ("Enviar correo por cambiar la fecha");

        let emails: string = "";

        const collection = await db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (data.id).collection ('Viajeros').get ();

        collection.forEach((doc: any) => {
          emails = emails + doc.data ().correo + ', ';
        });

        console.log ('emails', emails);

        if (emails.length > 0) {
          const mailOptions = {
              from: 'Dircetu <dirceturapp@gmail.com>',
              to: emails,
              subject: 'Viaje reprogramado | Turismo social',
              html: `
                  <p>Tu viaje a sido reprogramado para el ${moment (data.fecha_salida).format ('LLL')}. lo sentimos...</p>
              `
          };

          return transporter.sendMail(mailOptions, (error: any, info: any) => {
              if (error) {
                  console.log ('sendMail error', error);
              } else {
                  console.log ('Sended', info);
              }
          });
        }

        return 0;
    } else if (data_before.cupos !== data.cupos) {
      console.log ("La cantidad de cupos cambio");

      const collection = await db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (data.id).collection ('Viajeros').where ('esta_cola', '==', true).orderBy ('fecha_agregado').get ();
      const cupos: number = data.cupos - data_before.cupos;
      let diferencia: number = 0;

      /*
          Antes:             2  
          Despues:           3
          Cupos disponibles: 1
          Pendientes:        5
      */

      console.log ('cupos', cupos);


      let emails: string = "";
      const batch = db.batch ();

      if (cupos > 0) {
        collection.forEach (async (i: any) => { // 4 veces
          const viajero = i.data ();

          if (diferencia < cupos) {
            console.log ("Agregamos como viajero: ", viajero.nombre_completo);
            
            emails = emails + viajero.correo + ',';

            diferencia = diferencia + 1;
            console.log ('diferencia', diferencia);

            const step = db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (data.id).collection ('Viajeros').doc (viajero.dni);
            batch.update (step, { 
              esta_cola: false
            });
          }
        });

        /*
        if (emails.length > 0) {
          const mailOptions = {
              from: 'Dircetu <dirceturapp@gmail.com>',
              to: emails,
              subject: 'Tu viaje a sido aprovado',
              html: `
                  <p>Ya te encuentras registrado del viaje</p>
              `
          };

          await transporter.sendMail(mailOptions, (error: any, info: any) => {
              if (error) {
                  console.log ('sendMail error', error);
              } else {
                  console.log ('Sended', info);
              }
          });
        }
        */

        let nuevo_pendientes = data.nro_pendientes - diferencia;
        if (nuevo_pendientes < 0) {
          nuevo_pendientes = 0;
        }

        const step_01 = db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (data.id);
        batch.update (step_01, { 
          nro_pendientes: nuevo_pendientes,
          nro_inscritos: data.nro_inscritos + diferencia
        });

        const step_02 = db.collection ('Viajes_Programados').doc (viaje_id);
        batch.update (step_02, { 
          ultimo_viaje_nro_pendientes: nuevo_pendientes,
          ultimo_viaje_nro_incritos: data.nro_inscritos + diferencia
        });

        // Actualizar nmero de incritos
        console.log ("Actualizamos numero de pendientes a:", (nuevo_pendientes));

        return batch.commit ();
      }
    }

    return 0;
});

exports.onDeleteViajero = functions.firestore.document ('Viajes_Programados/{viaje_id}/Salidas/{salida_id}/Viajeros/{viajero_id}').onDelete (async (snapshot: any, context: any) => {
  const data = snapshot.data ();

  const salida_id = context.params.salida_id;
  const viaje_id = context.params.viaje_id;

  const salida_data: any = await db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id).get ();

  const batch = db.batch ();

  console.log ('data', data);

  if (data.esta_cola === true) {
    const ref_1 = db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id);

    return db.runTransaction((t: any) => {
      return t.get (ref_1).then (async (doc: any) => {
        const _data = doc.data ();
        const update: any = {};
        let new_count: number;

        new_count = _data ['nro_pendientes'] - 1;
        update ['nro_pendientes'] = new_count;

        console.log ('nro_pendientes', update);

        t.update (ref_1, update);
      });
    }).then (() => {
      const ref_2 = db.collection ('Viajes_Programados').doc (viaje_id);

      return db.runTransaction((t: any) => {
        return t.get (ref_2).then (async (doc: any) => {
          const _data = doc.data ();
          const update: any = {};
          let new_count: number;

          new_count = _data ['ultimo_viaje_nro_pendientes'] - 1;
          update ['ultimo_viaje_nro_pendientes'] = new_count;

          console.log ('ultimo_viaje_nro_pendientes', update);

          t.update (ref_2, update);
        });
      });
    });
  } else {
    if (salida_data.data ().nro_pendientes > 0) {
      const ultimo_viajero_cola: any = await db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id).collection ('Viajeros').where ('esta_cola', '==', true).orderBy ('fecha_agregado').limit (1).get ();

      ultimo_viajero_cola.forEach((element: any) => {
          const viajero = element.data ();

          console.log ("El usuario se elimino de la cola", viajero.nombre_completo);

          const step = db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id).collection ('Viajeros').doc (viajero.dni)
          batch.update (step, { 
            esta_cola: false
          });

          /* Enviar correo de que se registro */
      });

      await batch.commit ();

      const ref_1 = db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id);

      return db.runTransaction((t: any) => {
        return t.get (ref_1).then (async (doc: any) => {
          const _data = doc.data ();
          const update: any = {};
          let new_count: number;

          new_count = _data ['nro_pendientes'] - 1;
          update ['nro_pendientes'] = new_count;

          t.update (ref_1, update);
        });
      }).then (() => {
        const ref_2 = db.collection ('Viajes_Programados').doc (viaje_id);

        return db.runTransaction((t: any) => {
          return t.get (ref_2).then (async (doc: any) => {
            const _data = doc.data ();
            const update: any = {};
            let new_count: number;

            new_count = _data ['ultimo_viaje_nro_pendientes'] - 1;
            update ['ultimo_viaje_nro_pendientes'] = new_count;

            t.update (ref_2, update);
          });
        });
      });
    } else {
      const ref_1 = db.collection ('Viajes_Programados').doc (viaje_id).collection ('Salidas').doc (salida_id);

      return db.runTransaction((t: any) => {
        return t.get (ref_1).then (async (doc: any) => {
          const _data = doc.data ();
          const update: any = {};
          let new_count: number;

          new_count = _data ['nro_inscritos'] - 1;
          update ['nro_inscritos'] = new_count;

          t.update (ref_1, update);
        });
      }).then (() => {
        const ref_2 = db.collection ('Viajes_Programados').doc (viaje_id);

        return db.runTransaction((t: any) => {
          return t.get (ref_2).then (async (doc: any) => {
            const _data = doc.data ();
            const update: any = {};
            let new_count: number;

            new_count = _data ['ultimo_viaje_nro_incritos'] - 1;
            update ['ultimo_viaje_nro_incritos'] = new_count;

            t.update (ref_2, update);
          });
        });
      });
    }
  }
});

// Fuciones de Jose
exports.actualizarEstadisticasSolicitudes = functions.firestore.document ('Solicitudes/{solicitud_id}').onUpdate ((snapshot: any, context: any) => {
    const data_after = snapshot.after.data ();

    console.log ('data_after', data_after);

    if (data_after.estado === 2) {
      const ref = db.collection ('Estadisticas_Solicitudes_Provincias').doc (data_after.provincia.id);

      return db.runTransaction((t: any) => {
        return t.get (ref).then ((doc: any) => {
          const data = doc.data ();        

          const update: any = {};

          console.log ("Existe", doc.exists);

          if (doc.exists === false) {
            update ['tabla_' + data_after.ano] = data_after.monto;
            update ['tabla_' + data_after.ano + '_' + data_after.mes] = data_after.monto;

            update ['cantidad_' + data_after.ano] = 1;
            update ['cantidad_' + data_after.ano + '_' + data_after.mes] = 1;

            console.log ('update', update);

            t.set(ref, update);
          } else {
            const new_count = data ['tabla_' + data_after.ano] + data_after.monto;
            update ['tabla_' + data_after.ano] = new_count;

            const new_count_2 = data ['tabla_' + data_after.ano + '_' + data_after.mes] + data_after.monto;
            update ['tabla_' + data_after.ano + '_' + data_after.mes] = new_count_2;

            const new_count_3 = data ['cantidad_' + data_after.ano] + 1;
            update ['cantidad_' + data_after.ano] = new_count_3;

            const new_count_4 = data ['cantidad_' + data_after.ano + '_' + data_after.mes] + 1;
            update ['cantidad_' + data_after.ano + '_' + data_after.mes] = new_count_4;

            console.log ('update', update);

            t.update (ref, update);
          }
        });
      }).then (() => {
        const ref_02 = db.collection ('Estadisticas_Solicitudes_Distritos').doc (data_after.distrito.id);

        return db.runTransaction((t: any) => {
          return t.get (ref_02).then ((doc: any) => {
            const data = doc.data ();        

            const update: any = {};

            if (doc.exists === false) {
              update ['tabla_' + data_after.ano] = data_after.monto;
              update ['tabla_' + data_after.ano + '_' + data_after.mes] = data_after.monto;

              update ['cantidad_' + data_after.ano] = 1;
              update ['cantidad_' + data_after.ano + '_' + data_after.mes] = 1;

              t.set(ref_02, update);
            } else {
              const new_count = data ['tabla_' + data_after.ano] + data_after.monto;
              update ['tabla_' + data_after.ano] = new_count;

              const new_count_2 = data ['tabla_' + data_after.ano + '_' + data_after.mes] + data_after.monto;
              update ['tabla_' + data_after.ano + '_' + data_after.mes] = new_count_2;

              const new_count_3 = data ['cantidad_' + data_after.ano] + 1;
              update ['cantidad_' + data_after.ano] = new_count_3;

              const new_count_4 = data ['cantidad_' + data_after.ano + '_' + data_after.mes] + 1;
              update ['cantidad_' + data_after.ano + '_' + data_after.mes] = new_count_4;

              t.update (ref_02, update);
            }
          });
        });
      });
    }

    return 0;
});

// REST API

app.get ('/get_custom_token/:uuid', (request, response) => {
  try {
    const uuid = request.params.uuid;
    
    admin.auth ().createCustomToken (uuid)
      .then((customToken) => {
        response.json({
            token: customToken
        });
      })
      .catch((error) => {
          console.log('Error creating custom token:', error);
      });
  } catch(error){
    response.status (500).send (error);
  }
});

app.get ('/check_usuarios_limite_superado', async (request, response) => {
  try {
    const date = moment ().format('YYYY[-]MM[-]DD');

    const collection = await db.collection ('Usuarios_Limite_Superado').doc (date).collection ('Usuarios').get ();

    collection.forEach(async (doc: any) => {
        const usuario = doc.data ();
        await db.collection ('Usuarios_Viajes_Programados').doc (usuario.dni).update ({
          nro_viajes: 0
        });

        await db.collection ('Usuarios_Limite_Superado').doc (date).collection ('Usuarios').doc (usuario.dni).delete ();
    });

    response.json({
      status: 'OK'
    });
  } catch(error){
    response.status (500).send (error);
  }
});