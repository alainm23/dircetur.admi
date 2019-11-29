import { Component, OnInit } from '@angular/core';
import { FormGroup , FormControl, Validators } from '@angular/forms';

import { DatabaseService } from '../../../services/database.service';
import { NbToastrService } from '@nebular/theme';
import { AngularFireStorage } from '@angular/fire/storage';

import { finalize } from 'rxjs/operators';
import { Observable } from "rxjs";

@Component({
  selector: 'ngx-agregar-circuito-turistico',
  templateUrl: './agregar-circuito-turistico.component.html',
  styleUrls: ['./agregar-circuito-turistico.component.scss']
})
export class AgregarCircuitoTuristicoComponent implements OnInit {
  form: FormGroup;
  is_loading: boolean = false;

  files: any [] = [];
  imagenes: any [] = [];
  subidos: number = 0;

  dias: any [] = [];
  constructor(public database: DatabaseService,
              private af_storage: AngularFireStorage,
              public toastrService: NbToastrService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      imagenes: new FormControl (''),
      nombre: new FormControl ('', [Validators.required]),
      descripcion: new FormControl ('', [Validators.required]),
      donde: new FormControl ('', [Validators.required]),
      altitud: new FormControl ('', [Validators.required]),
      tags: new FormControl (''),
      incluye: new FormControl ('', [Validators.required]),
      no_incluye: new FormControl ('', [Validators.required])
    });

    this.dias.push ({
      id:  this.database.createId (),
      nombre: "Dia 1",
      actividades: [{
        id:  this.database.createId (),
        nombre: "",
        detalle: ""
      }]
    });
  }

  agregarDia () {
    this.dias.push ({
      id:  this.database.createId (),
      nombre: "Dia " + (this.dias.length + 1),
      actividades: []
    });
  }

  eliminarDia (item: any) {
    for( var i = 0; i < this.dias.length; i++){ 
      if (this.dias[i].id === item.id) {
        this.dias.splice(i, 1); 
      }
    }
  }

  agregarActividad (d: any) {
    d.actividades.push ({
      id: this.database.createId (),
      nombre: "",
      detalle: ""
    });
  }

  eliminarActividad (a: any, actividades: any []) {
    for( var i = 0; i < actividades.length; i++){ 
      if (actividades [i].id === a.id) {
        actividades.splice(i, 1); 
      }
    }
  }

  submit () {
    let data = this.form.value;
    data.id = this.database.createId ();

    this.is_loading = true;
    
    if (this.files.length > 0) {
      for (var i = 0; i < this.files.length; i++) {
        console.log ('Imagen data', this.files [i]);
        this.uploadImageAsPromise(this.files [i], data);
      }
    } else {
      this.database.addCircuito (data, this.dias)
        .then ((res) => {
          this.is_loading = false;
          this.showToast ('top-right');
          
          this.form.reset ();

          this.dias = [];

          this.dias.push ({
            id: this.database.createId (),
            nombre: "Dia 1",
            actividades: [{
              id: this.database.createId (),
              nombre: "",
              detalle: ""
            }]
          });
        })
        .catch (error => {
          this.is_loading = false;
          console.log ("Error addAgencia", error);
        });
    }
  }

  showToast (position) {
    this.toastrService.show(
      '',
      'El evento: ' + this.form.value.name + ' se agrego correctamente',
      { position });
  }

  uploadImageAsPromise (file: any, data: any) {
    const filePath = 'Circuitos_Turisticos/' + data.id + "/" + file.id;
    const fileRef = this.af_storage.ref (filePath);
    const task = this.af_storage.upload (filePath, file.file);

    task.percentageChanges().subscribe ((res: any) => {
      file.uploadPercent = res;
    });

    task.snapshotChanges().pipe(
      finalize(async () => {
        let downloadURL = await fileRef.getDownloadURL ().toPromise();
        console.log ("downloadURL", downloadURL);

        this.subidos++;
        this.imagenes.push ({
          id: file.id,
          url: downloadURL
        });

        if (this.subidos === this.files.length) {
          data.imagenes = this.imagenes;

          this.database.addCircuito (data, this.dias)
            .then ((res) => {
              this.is_loading = false;
              this.showToast ('top-right');
              
              this.form.reset ();

              this.dias = [];
              this.files = [];
              this.imagenes = [];
              this.subidos = 0;

              this.dias.push ({
                id: this.database.createId (),
                nombre: "Dia 1",
                actividades: [{
                  id: this.database.createId (),
                  nombre: "",
                  detalle: ""
                }]
              });
            })
            .catch (error => {
              this.is_loading = false;
              console.log ("Error addAgencia", error);
            });
        }
      })
    )
    .subscribe ();
  }
  
  changeListener (event: any) {
    let file = {
      id: this.database.createId (),
      file: event.target.files[0],
      image: '',
      uploadPercent: 0
    };

    this.files.push (file);
    this.getBase64 (file);
  }

  getBase64(file: any) {
    var reader = new FileReader ();
    reader.readAsDataURL(file.file);
    
    reader.onload = () => {
      file.image = reader.result;
    };
    
    reader.onerror = (error) => {

    };
  }

  eliminarImagen (item: any) {
    for (var i = 0; i < this.files.length; i++) { 
      if (this.files[i].id === item.id) {
        this.files.splice(i, 1); 
      }
    }
  }
}
