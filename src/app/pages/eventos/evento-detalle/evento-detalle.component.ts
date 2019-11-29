import { Component, OnInit, TemplateRef } from '@angular/core';

import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AngularFireStorage } from '@angular/fire/storage';

import { NbToastrService } from '@nebular/theme';
import { DatabaseService } from '../../../services/database.service';

import { finalize } from 'rxjs/operators';
import { Observable } from "rxjs";
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'ngx-evento-detalle',
  templateUrl: './evento-detalle.component.html',
  styleUrls: ['./evento-detalle.component.scss']
})
export class EventoDetalleComponent implements OnInit {
  form: FormGroup;
  
  is_upload: boolean = false;
  uploadPercent: number = 0;
  imagen_preview: any;
  file: any;
  imagenes: any [] = [];
  
  subscribe_01: any;
  subscribe_02: any;
  subscribe_03: any;
  subscribe_04: any;
  is_loading: boolean = true;

  esta_distritos_cargando: boolean = true;
  provincias: any [];
  distritos: any [];
  tipos: any [];
  categorias: any [];
  selectedItem: any;

  public Editor = ClassicEditor;
  config: any = {
    fillEmptyBlocks: false,
    tabSpaces: 0
  };
  
  id: string;

  fecha_antigua: string;

  compareFn = (a: any, b: any) => a.status === b.status;

  constructor(public database: DatabaseService,
              private route: ActivatedRoute,
              private router: Router,
              private dialogService: NbDialogService,
              private af_storage: AngularFireStorage,
              public toastrService: NbToastrService) { }

  async ngOnInit() { 
    this.form = new FormGroup ({
      id: new FormControl (''),
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
    
    this.route.params.subscribe(params => {
      this.id = params['id'];

      this.database.getEventoById (this.id).subscribe ((data: any) => {
        if (data.imagenes.length > 0) {
          this.imagenes = data.imagenes;
        }

        console.log (data);

        this.form.patchValue (data);
        

        this.form.controls ["fecha"].setValue (new Date (data.fecha));
        this.fecha_antigua = data.fecha;

        this.is_loading = false;

        this.subscribe_01 = this.database.getProvincias ().subscribe ((response: any []) => {
          this.provincias = response;
          this.provinciaChanged (data.provincia);
        });
        
        this.subscribe_03 = this.database.getEventosTipos ().subscribe ((r) => {
          this.tipos = r;
        });
      });
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

  elimninar () {
    var opcion = confirm("¿Eliminar?");
    if (opcion == true) {
      this.database.deleteEvento (this.form.value)
      .then (() => {
        console.log ("Elininado");
        this.router.navigate(['/pages/eventos/ver-eventos']);
      })
      .catch (error => {
        console.log ("error", error);
      });
    } else {
      console.log ("Cancelar");
    }
  }

  provinciaChanged (event: any) {
    this.esta_distritos_cargando = true;
    console.log (event);
    this.subscribe_02 = this.database.getDistritosByProvincias (event.id).subscribe ((response: any []) => {
      this.distritos = response;
      this.esta_distritos_cargando = false;

      this.form.controls ["distrito"].setValue (this.form.value.distrito);
    }, (error: any) => {
      console.log ('getDistritosByProvincias', error);
      this.esta_distritos_cargando = true;
    });
  }

  submit () {
    console.log (this.form.value);

    let data: any = this.form.value;

    data.fecha = new Date(data.fecha).toISOString ();
    data.imagenes = this.imagenes;

    this.is_loading = true;

    console.log ("data", data);
    console.log ("fecha_antigua", this.fecha_antigua);

    this.database.updateEvento (data, this.fecha_antigua)
      .then (() => {
        this.is_loading = false;
        this.showToast ('top-right');
        this.uploadPercent = 0;
      }).catch ((error: any) => {
        this.is_loading = false;
        console.log ("Error updateEvento", error);
      });
  }

  showToast (position) {
    this.toastrService.show(
      '',
      'El evento: ' + this.form.value.titulo + ' se actualizo correctamente',
      { position });
  }

  eliminarImagen (item: any) {
    var opcion = confirm("Eliminar?");
    if (opcion == true) {
      console.log ("Ruta:" + "/Eventos/" + this.id + "/" + item.id);

      this.af_storage.storage.ref ("/Eventos/" + this.id + "/" + item.id).delete ()
        .then (() => {
          console.log ("se elimino");
          for( var i = 0; i < this.imagenes.length; i++) { 
            if ( this.imagenes[i].id === item.id) {
              this.imagenes.splice(i, 1); 
            }
          }

          this.submit ();
        })
        .catch (error => {
          console.log ("error", error);
        });
    } else {
      console.log ("Cancelar");
    }
  }
  
  changeListener (event: any, dialog: TemplateRef<any>) {
    this.file = event.target.files [0];
    this.getBase64 (this.file);
    this.open (dialog);
  }

  subir (dialog: any) {
    this.is_upload = true;

    let id = this.database.createId ();

    const filePath = '/Eventos/' + this.id + "/" + id;
    const fileRef = this.af_storage.ref (filePath);
    const task = this.af_storage.upload (filePath, this.file);

    task.percentageChanges().subscribe ((res: any) => {
      this.uploadPercent = res;
    });

    task.snapshotChanges().pipe(
      finalize(async () => {
        let downloadURL = await fileRef.getDownloadURL ().toPromise();
        console.log ("downloadURL", downloadURL);

        let image: any = {
          id: id,
          url: downloadURL
        }

        dialog.close ();
        this.is_upload = false;
        this.imagenes.push (image);
        this.submit ();
      })
    )
    .subscribe ();
  }
  
  open (dialog: TemplateRef<any>) {
    this.dialogService.open(dialog, { context: 'this is some additional data passed to dialog' });
  }

  getBase64(file: any) {
    var reader = new FileReader ();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      this.imagen_preview = reader.result;
    };
    
    reader.onerror = (error) => {

    };
  }

  compareWith (item_01: any, item_02: any) {
    if (item_01 == null || item_02 == null) {
      return false;
    }

    return item_01.id === item_02.id;
  }
}
