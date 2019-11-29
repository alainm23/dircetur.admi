import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'ngx-lista-guias',
  templateUrl: './lista-guias.component.html',
  styleUrls: ['./lista-guias.component.scss']
})
export class ListaGuiasComponent implements OnInit {
  form: FormGroup;

  provincias: any [];
  distritos: any [];
  esta_distritos_cargando: boolean = true;

  subscribe_01: any;
  subscribe_02: any;
  subscribe_03: any;

  items: any [];
  constructor(private database: DatabaseService,
              private router: Router) { }

  ngOnInit() {
    this.form = new FormGroup ({
      provincia: new FormControl ('', Validators.required),
      distrito: new FormControl ('', Validators.required)
    });

    this.subscribe_01 = this.database.getProvincias ().subscribe ((response: any []) => {
      this.provincias = response;
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
  }

  provinciaChanged (event: any) {
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

    this.database.getGuiasByDistritos (this.form.value.provincia.id, this.form.value.distrito.id)
      .subscribe ((data: any []) => {
        console.log (data);
        this.items = data;
      });
  }

  getData (item: any) {
    return item.direccion + ' - ' + item.telefono;
  }

  detalle (item: any) {
    this.router.navigate(['/pages/guia/guia-detalle', item.id]);
  }
}
