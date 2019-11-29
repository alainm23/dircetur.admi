import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

// Services
import { DatabaseService } from '../../../services/database.service';
import { AgenciaDatabaseService } from '../../../services/agencia-database.service';

import { FormGroup , FormControl, Validators } from '@angular/forms';

import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-agencia-detalle',
  templateUrl: './agencia-detalle.component.html',
  styleUrls: ['./agencia-detalle.component.scss']
})
export class AgenciaDetalleComponent implements OnInit {
  id: string;
  form: FormGroup;

  subscribe_01: any;
  subscribe_02: any;
  subscribe_03: any;
  subscribe_04: any;
  subscribe_05: any;
  subscribe_06: any;

  tipo_clasificaciones: any [];
  tipos_turismo: any [] = [];
  provincias: any [];
  distritos: any [];

  esta_distritos_cargando: boolean = true;
  representates: any [] = [];
  is_loading: boolean = false;
  is_email_valid: boolean = false;
  constructor(private route: ActivatedRoute,
              private agencia_db: AgenciaDatabaseService,
              private toastrService: NbToastrService,
              private database: DatabaseService,) { }

  ngOnInit() {
    this.form = new FormGroup ({
      id: new FormControl (''),
      nombre_comercial: new FormControl ('', [Validators.required]),
      razon_social: new FormControl ('', Validators.required),
      ruc: new FormControl ('', Validators.required),
      direccion: new FormControl ('', Validators.required),
      telefono: new FormControl ('', Validators.required),
      pagina_web: new FormControl (''),
      numero_certificado: new FormControl ('', Validators.required),
      fecha_ins: new FormControl ('', Validators.required),
      fecha_exp: new FormControl ('', Validators.required),
      clasificacion: new FormControl ('', Validators.required),
      provincia: new FormControl ('', Validators.required),
      distrito: new FormControl ('', Validators.required),
      servicios_complementarios: new FormControl (''),
      observaciones: new FormControl ('')
    });

    this.route.params.subscribe(params => {
      this.id = params['id'];

      this.subscribe_05 = this.agencia_db.getAgencia (this.id).subscribe ((data: any) => {
        console.log (data);
    
        this.form.patchValue (data);

        this.form.controls ["fecha_ins"].setValue (new Date (data.fecha_ins));
        this.form.controls ["fecha_exp"].setValue (new Date (data.fecha_exp));

        this.subscribe_01 = this.agencia_db.getAgenciaTipo_Clasificaciones ().subscribe ((response: any []) => {
          this.tipo_clasificaciones = response;
        });
    
        this.subscribe_02 = this.agencia_db.getTipos_Turismo ().subscribe ((response: any []) => {
          response.forEach ((a) => {
            let item = data.tipos_turismo.find ((i: any) => {
              return i.id === a.id;
            });

            if (item !== undefined) {
              a = item;
            }

            this.tipos_turismo.push (a);
          });
        });
    
        this.subscribe_03 = this.database.getProvincias ().subscribe ((response: any []) => {
          this.provincias = response;

          this.provinciaChanged (data.provincia);
        });

        this.subscribe_06 = this.agencia_db.getAgenciaRepresentantes (this.id).subscribe ((res: any []) => {
          this.representates = res;
        })
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

    if (this.subscribe_03 !== null && this.subscribe_03 !== undefined) {
      this.subscribe_03.unsubscribe ();
    }

    if (this.subscribe_04 !== null && this.subscribe_04 !== undefined) {
      this.subscribe_04.unsubscribe ();
    }

    if (this.subscribe_05 !== null && this.subscribe_05 !== undefined) {
      this.subscribe_05.unsubscribe ();
    }

    if (this.subscribe_06 !== null && this.subscribe_06 !== undefined) {
      this.subscribe_06.unsubscribe ();
    }
  }

  provinciaChanged (event: any) {
    this.esta_distritos_cargando = true;
    console.log (event);
    this.subscribe_04 = this.database.getDistritosByProvincias (event.id).subscribe ((response: any []) => {
      this.distritos = response;
      this.esta_distritos_cargando = false;
    }, (error: any) => {
      console.log ('getDistritosByProvincias', error);
      this.esta_distritos_cargando = true;
    });
  }

  compareWith (item_01: any, item_02: any) {
    if (item_01 == null || item_02 == null) {
      return false;
    }

    return item_01.id === item_02.id;
  }
  
  agregarRepresentante () {
    this.representates.push ({
      _id:  Math.random(),
      nombre: '',
      email: '',
      tdoc: 'DNI',
      ndoc: '',
      direccion: '',
      telefono: ''
    });
  }

  eliminarRepresentante (item: any) {
    for( var i = 0; i < this.representates.length; i++){ 
      if ( this.representates[i]._id === item._id) {
        this.representates.splice(i, 1); 
      }
    }
  }

  submit () {
    this.is_loading = true;

    let data: any = this.form.value;
    data.tipos_turismo = this.tipos_turismo.filter ((x: any) => {
      return x.checked === true;
    });

    data.fecha_exp = new Date(data.fecha_exp).toISOString ();
    data.fecha_ins = new Date(data.fecha_ins).toISOString ();
    
    console.log (data);

    this.representates.forEach ((d) => {
      console.log (d);
    });

    this.agencia_db.updateAgencia (data, this.representates)
      .then (() => {
        this.is_loading = false;;
        this.showToast ('top-right');
      }).catch ((error: any) => {
        this.is_loading = false;
        console.log ("Error addAgencia", error);
      });
  }

  checkedChanged (item: any) {
    item.checked = !item.checked;
  }
  
  validChanged () {
    if (this.form.value.correo != "") {
      this.database.is_email_valid (this.form.value.correo).subscribe ((data) => {
        if (data === undefined || data === null) {
          this.is_email_valid = true;
        } else {
          this.is_email_valid = false;
        }
      });
    }
  }

  showToast (position) {
    this.toastrService.show(
      '',
      'La Agencia: ' + this.form.value.nombre_comercial + ' se actualizo correctamente',
      { position });
  }
}
