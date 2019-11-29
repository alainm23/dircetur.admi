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
export class AlojamientoDatabaseService {

  constructor(private afs: AngularFirestore) {}

  createId () {
    return this.afs.createId ();
  }
  
  async addHotel (data: any, representantes: any []) {
    data.id = this.afs.createId ();
    
    let batch = this.afs.firestore.batch ();

    const step_01 = this.afs.collection ('Alojamientos').doc (data.id).ref;

    batch.set (step_01, data);

    representantes.forEach ((r) => {
      r.id = this.afs.createId ();
      delete r._id;

      let step = this.afs.collection ('Alojamientos').doc (data.id).collection ('Socios').doc (r.id).ref;
      batch.set (step, r);
    });
    
    return await batch.commit ();  
  }

  async updateHotel (data: any, representantes: any []) {
    let batch = this.afs.firestore.batch ();
    const step_01 = this.afs.collection ("Alojamientos").doc (data.id).ref;
    batch.update (step_01, data);

    representantes.forEach ((r: any) => {
      if (r.id === "" || r.id === undefined || r.id === null) {
        r.id = this.createId ();

        let stepx = this.afs.collection ('Alojamientos').doc (data.id).collection ("Representantes").doc (r.id).ref;
        batch.set (stepx, r);
      } else {
        let stepx = this.afs.collection ('Alojamientos').doc (data.id).collection ("Representantes").doc (r.id).ref;
        batch.update (stepx, r);
      }
    });

    return await batch.commit ();
  }

  getHotelRepresentantes (id: string) {
    return this.afs.collection ('Alojamientos').doc (id).collection ('Representantes').valueChanges ();
  }

  getHotel (id: string) {
    return this.afs.collection ('Alojamientos').doc (id).valueChanges ();
  }

  getHotelByDistritos (id1: string, id2: string) {
    return this.afs.collection ("Provincias").doc (id1).collection ("Distritos").doc (id2).collection ("Lista_Alojamientos").valueChanges ();
  }

  /*
    Hotel Tios
  */

  getHotelTipo_Clasificaciones () {
    return this.afs.collection ('HotelTipo_Clasificaciones', ref => ref.orderBy ('date_added')).snapshotChanges().map(changes => {
      return changes.map(a => {
          const data = a.payload.doc.data();
          let edit = false;
          const id = a.payload.doc.id;
          return { id, edit, ...data };
      });
    });
  }

  updateHotelTipo_Clasificaciones (data: any) {
    return this.afs.collection ('HotelTipo_Clasificaciones').doc (data.id).update ({
      nombre: data.name
    });
  }

  addHotelTipo_Clasificaciones (data: any) {
    let id = this.afs.createId ();

    return this.afs.collection ('HotelTipo_Clasificaciones').doc (id).set ({
      id: id,
      nombre: data,
      date_added: new Date ().toISOString ()
    });
  }

  removeHotelTipo_Clasificaciones (data: any) {
    return this.afs.collection ('HotelTipo_Clasificaciones').doc (data.id).delete ();
  }
}
