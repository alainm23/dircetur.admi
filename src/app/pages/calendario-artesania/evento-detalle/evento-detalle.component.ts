import { Component, OnInit } from '@angular/core';

import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AngularFireStorage } from '@angular/fire/storage';

import { NbToastrService } from '@nebular/theme';
import { DatabaseService } from '../../../services/database.service';

import { finalize } from 'rxjs/operators';
import { Observable } from "rxjs";
@Component({
  selector: 'ngx-evento-detalle',
  templateUrl: './evento-detalle.component.html',
  styleUrls: ['./evento-detalle.component.scss']
})
export class EventoDetalleComponent implements OnInit {
  form: FormGroup;
  
  file: any;
  image: any = "";
  has_image: boolean = false;
  has_cambio: boolean = false;
  uploadPercent: number = 0;
  
  subscribe_01: any;
  subscribe_02: any;
  subscribe_03: any;
  subscribe_04: any;
  is_loading: boolean = true;

  esta_distritos_cargando: boolean = true;
  provincias: any [];
  distritos: any [];
  tipos: any [];
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

      this.database.getEventoArtesaniaById (this.id).subscribe ((data: any) => {
        if (data.imagen != "") {
          this.image = data.imagen;
          this.has_image = true;
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
        
        this.subscribe_03 = this.database.getEventosArtesaniaTipos ().subscribe ((r) => {
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
      this.database.deleteEventoArtesania (this.form.value)
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
    data.fecha_creado = new Date().toISOString ();

    this.is_loading = true;

    console.log ("data", data);
    console.log ("fecha_antigua", this.fecha_antigua);

    this.database.updateEventoArtesania (data, this.fecha_antigua)
      .then (() => {
        this.is_loading = false;
        this.showToast ('top-right');
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

  changeListener (event: any) : void {
    this.file = event.target.files[0];
    this.has_image = true;
    this.is_loading = true;
    
    this.getBase64 (this.file);

    const file = this.file
    const filePath = 'Eventos/' + this.id + "/" + "imagen";
    const fileRef = this.af_storage.ref (filePath);
    const task = this.af_storage.upload (filePath, file);

    // observe percentage changes
    task.percentageChanges().subscribe ((res) => {
      this.uploadPercent = res;
    });

    // get notified when the download URL is available
    task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL ().subscribe ((url: string) => {
            let data: any = this.form.value;
            data.imagen = url;
            this.database.updateEventoArtesania (data, this.fecha_antigua)
              .then (() => {
                this.is_loading = false;
                this.showToast ('top-right');
              }).catch ((error: any) => {
                this.is_loading = false;
                console.log ("Error updateEvento", error);
              });
          });
        })
    )
    .subscribe ();
  }

  getBase64(file: any) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      this.image = reader.result;
    };
    
    reader.onerror = (error) => {

    };
  }

  elimninarImahge () {
    this.image = "";
    this.is_loading = true;

    let data: any = this.form.value;
    data.imagen = "";

    this.database.updateEventoArtesania (data, this.fecha_antigua)
      .then (() => {
        this.is_loading = false;
        this.showToast ('top-right');
      }).catch ((error: any) => {
        this.is_loading = false;
        console.log ("Error updateEvento", error);
      });
  }

  compareWith (item_01: any, item_02: any) {
    if (item_01 == null || item_02 == null) {
      return false;
    }

    return item_01.id === item_02.id;
  }
}
