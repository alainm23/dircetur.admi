import { Component, OnInit } from '@angular/core';

import { Directive, Output, Input, EventEmitter, HostBinding, HostListener } from '@angular/core';

import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { NbToastrService } from '@nebular/theme';

import { DatabaseService } from '../../../services/database.service';
import { AngularFireStorage } from '@angular/fire/storage';

import { finalize } from 'rxjs/operators';
import { Observable } from "rxjs"; 

@Component({
  selector: 'ngx-agregar-eventos',
  templateUrl: './agregar-eventos.component.html',
  styleUrls: ['./agregar-eventos.component.scss']
})
export class AgregarEventosComponent implements OnInit {
  form: FormGroup;

  files: any [] = [];
  imagenes: any [] = [];
  subidos: number = 0;

  subscribe_01: any;
  subscribe_02: any;
  subscribe_03: any;
  subscribe_04: any;
  is_loading: boolean = false;

  esta_distritos_cargando: boolean = true;
  provincias: any [];
  distritos: any [];
  tipos: any [];

  public Editor = ClassicEditor;
  config: any = {
    fillEmptyBlocks: false,
    tabSpaces: 0
  };
  constructor(public database: DatabaseService,
              private af_storage: AngularFireStorage,
              public toastrService: NbToastrService) { }

  ngOnInit() { 
    this.form = new FormGroup ({
      imagen: new FormControl (''),
      titulo: new FormControl ('', [Validators.required]),
      detalle: new FormControl ('', [Validators.required]),
      fecha: new FormControl ('', [Validators.required]),
      hora: new FormControl ('', [Validators.required]),
      organizador: new FormControl ('', [Validators.required]),
      provincia: new FormControl ('', [Validators.required]),
      distrito: new FormControl ('', [Validators.required]),
      direccion: new FormControl ('', [Validators.required]),
      tipo: new FormControl ('', [Validators.required])
    });

    this.subscribe_01 = this.database.getProvincias ().subscribe ((response: any []) => {
      console.log (response);
      
      this.provincias = response;
    });

    this.subscribe_03 = this.database.getEventosTipos ().subscribe ((r) => {
      this.tipos = r;
    });
  }

  ngOnDestroy () {
    if (this.subscribe_01 !== null && this.subscribe_01 !== undefined) {
      this.subscribe_01.unsubscribe ();
    }

    if (this.subscribe_02 !== null && this.subscribe_02 !== undefined) {
      this.subscribe_02.unsubscribe ();
    }
  }

  provinciaChanged (event: any) {
    console.log (event);

    this.esta_distritos_cargando = true;
    console.log (event);
    this.subscribe_02 = this.database.getDistritosByProvincias (event.id).subscribe ((response: any []) => {
      this.distritos = response;
      this.esta_distritos_cargando = false;
    }, (error: any) => {
      console.log ('getDistritosByProvincias', error);
      this.esta_distritos_cargando = true;
    });
  }

  submit () {
    console.log (this.form.value);

    let data: any = this.form.value;
    
    data.id = this.database.createId ();
    data.fecha = new Date(data.fecha).toISOString ();
    data.fecha_creado = new Date().toISOString ();

    this.is_loading = true;

    console.log (data);

    if (this.files.length > 0) {
      for (var i = 0; i < this.files.length; i++) {
        console.log ('Imagen data', this.files [i]);
        this.uploadImageAsPromise(this.files [i], data);
      }
    } else {
      this.database.addEvento (data)
        .then (() => {
          this.is_loading = false;
          this.showToast ('top-right');
          
          this.form.reset ();
        }).catch ((error: any) => {
          this.is_loading = false;
          console.log ("Error addAgencia", error);
        });
    }
  }

  showToast (position) {
    this.toastrService.show(
      '',
      'El evento: se agrego correctamente',
      { position });
  }

  uploadImageAsPromise (file: any, data: any) {
    const filePath = 'Eventos/' + data.id + "/" + file.id;
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
          data.imagen = this.imagenes [0].url;
          this.database.addEvento (data)
            .then (() => {
              this.is_loading = false;
              this.showToast ('top-right');
              
              this.form.reset ();
              this.files = [];
              this.imagenes = [];
              this.subidos = 0;
            }).catch ((error: any) => {
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
    for( var i = 0; i < this.files.length; i++) { 
      if ( this.files[i].id === item.id) {
        this.files.splice(i, 1); 
      }
    }
  }

  compareWith (item_01: any, item_02: any) {
    if (item_01 == null || item_02 == null) {
      return false;
    }

    return item_01.id === item_02.id;
  }
}
