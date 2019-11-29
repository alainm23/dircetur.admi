import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { first, map } from 'rxjs/operators';
import { combineLatest, of } from "rxjs";
import * as firebase from 'firebase/app'; 
import 'firebase/firestore';

import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AgenciaDatabaseService {
  items: any [] = [];

  constructor(private afs: AngularFirestore) {}

  createId () {
    return this.afs.createId ();
  }

  async addAgencia (data: any, representantes: any []) {
    data.id = this.afs.createId ();
    
    let batch = this.afs.firestore.batch ();

    const step_01 = this.afs.collection ('Agencias').doc (data.id).ref;

    batch.set (step_01, data);

    representantes.forEach ((r) => {
      r.id = this.afs.createId ();
      delete r._id;

      let step = this.afs.collection ('Agencias').doc (data.id).collection ('Socios').doc (r.id).ref;
      batch.set (step, r);
    });
    
    return await batch.commit ();  
  }

  async updateAgencia (data: any, representantes: any []) {
    let batch = this.afs.firestore.batch ();
    const step_01 = this.afs.collection ("Agencias").doc (data.id).ref;
    batch.update (step_01, data);

    representantes.forEach ((r: any) => {
      if (r.id === "" || r.id === undefined || r.id === null) {
        r.id = this.createId ();

        let stepx = this.afs.collection ('Agencias').doc (data.id).collection ("Representantes").doc (r.id).ref;
        batch.set (stepx, r);
      } else {
        let stepx = this.afs.collection ('Agencias').doc (data.id).collection ("Representantes").doc (r.id).ref;
        batch.update (stepx, r);
      }
    });

    return await batch.commit ();
  }

  getAgenciaRepresentantes (id: string) {
    return this.afs.collection ('Agencias').doc (id).collection ('Representantes').valueChanges ();
  }

  getAgencia (id: string) {
    return this.afs.collection ('Agencias').doc (id).valueChanges ();
  }

  getAgenciasByDistritos (distrito_id: string) {
    return this.afs.collection ("Agencias", ref => ref.where ('distrito.id', '==', distrito_id)).valueChanges ();
  }

  getAgenciasByProvincias (provincia_id: string) {
    return this.afs.collection ("Agencias", ref => ref.where ('provincia.id', '==', provincia_id)).valueChanges ();
  }
  
  getAllAgencias () {
    return this.afs.collection ('Agencias').valueChanges ();
  }
  
  /*
    CRUD Clasificaciones
  */

  getAgenciaTipo_Clasificaciones () {
    return this.afs.collection ('AgenciaTipo_Clasificaciones', ref => ref.orderBy ('date_added')).snapshotChanges().map(changes => {
      return changes.map(a => {
          const data = a.payload.doc.data();
          let edit = false;
          const id = a.payload.doc.id;
          return { id, edit, ...data };
      });
    });
  }
  
  updateAgenciaTipo_Clasificaciones (data: any) {
    return this.afs.collection ('AgenciaTipo_Clasificaciones').doc (data.id).update ({
      nombre: data.nombre
    });
  }

  addAgenciaTipo_Clasificaciones (data: any) {
    let id = this.afs.createId ();

    return this.afs.collection ('AgenciaTipo_Clasificaciones').doc (id).set ({
      id: id,
      nombre: data,
      date_added: new Date ().toISOString ()
    });
  }
  
  removeAgenciaTipo_Clasificaciones (data: any) {
    return this.afs.collection ('AgenciaTipo_Clasificaciones').doc (data.id).delete ();
  }

  /*
    CRUD Modalidad Turismo
  */

  getModalidad_Turismo () { 
    return this.afs.collection ('Modalidad_Turismo', ref => ref.orderBy ('date_added')).snapshotChanges().map(changes => {
      return changes.map(a => {
          const data = a.payload.doc.data();
          let checked = false;
          const id = a.payload.doc.id;
          return { id, checked, ...data };
      });
    });
  }

  updateModalidad_Turismo (data: any) {
    return this.afs.collection ('Modalidad_Turismo').doc (data.id).update ({
      nombre: data.nombre
    });
  }

  addModalidad_Turismo (data: any) {
    let id = this.afs.createId ();

    return this.afs.collection ('Modalidad_Turismo').doc (id).set ({
      id: id,
      nombre: data,
      date_added: new Date ().toISOString ()
    });
  }

  removeModalidad_Turismo (data: any) {
    return this.afs.collection ('Modalidad_Turismo').doc (data.id).delete ();
  }

  /*
    Tipos de turismo
  */

  getTipos_Turismo () {
    return this.afs.collection ('Tipos_Turismo').snapshotChanges().map(changes => {
      return changes.map(a => {
          const data = a.payload.doc.data();
          let checked = false;
          const id = a.payload.doc.id;
          return { id, checked, ...data };
      });
    });
  }

  /*
    Estadisticas  
  */

  getEstadisticasPorProvincias () {
    return this.afs.collection ('Estadisticas_Prestadores_Provincias').valueChanges ();
  }

  getEstadisticasPorDistrito (provincia_id: string) {
    return this.afs.collection ('Estadisticas_Prestadores_Distritos', ref => ref.where ('provincia_id', '==', provincia_id)).valueChanges ();
  }
}
