import { Component, OnInit, TemplateRef } from '@angular/core';

import { DatabaseService } from '../../../services/database.service';
import { NbToastrService, NbComponentStatus } from '@nebular/theme';
import { NbDialogService } from '@nebular/theme';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ViajeProgramadoPersonasComponent } from '../../../dialogs/viaje-programado-personas/viaje-programado-personas.component';

import * as moment from 'moment';

@Component({
  selector: 'ngx-viaje-programado-panel',
  templateUrl: './viaje-programado-panel.component.html',
  styleUrls: ['./viaje-programado-panel.component.scss']
})
export class ViajeProgramadoPanelComponent implements OnInit {
  items: any [] = [];
  form: FormGroup;

  historial: any [] = [];
  viajeros: any [] = [];

  item_selected: any;
  is_loading: boolean = false;
  viajeros_loading: boolean = false;

  view: string = "panel"; // historial, viajeros
  constructor (private database: DatabaseService, 
              private toastrService: NbToastrService,
              private dialogService: NbDialogService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      fecha_salida: new FormControl ('', [Validators.required]),
      fecha_limite: new FormControl ('', [Validators.required]),
      cupos: new FormControl ('', [Validators.required]),
      precio: new FormControl ('', [Validators.required]),
      tipo_registro: new FormControl ('', [Validators.required]),
    });

    this.database.getViajesProgramados ().subscribe ((res: any []) => {
      this.items = res;
      console.log (res);
    });
  }

  getDateFormat (date: string) {
    return moment (date).format ('LLL');
  }

  agregar_salida (item: any, dialog: TemplateRef<any>) {
    this.item_selected = item;
    this.dialogService.open(dialog);
  }

  crear_salida (ref: any) {
    if (this.item_selected != null) {
      this.is_loading = true;
      const data = this.form.value;

      console.log (data);
      
      data.fecha_salida = new Date(data.fecha_salida).toISOString ();
      data.fecha_limite = new Date(data.fecha_limite).toISOString ();
      data.fecha_creado = new Date().toISOString ();

      data.estado = 0;

      this.database.addSalidaViajeProgramado (this.item_selected, data)
        .then (() => {
          this.form.reset ();
          ref.close ();
          this.is_loading = false;

          this.showToast ('OK', 'La salida se registro exitosamente', 'success');
        })
        .catch ((error: any) => {
          this.is_loading = false;
          alert (error);
        });
    }
  }

  cerrar_dialog (ref: any) {
    this.item_selected = null;
    ref.close ();
  }

  checklist (item: any) {
    this.dialogService.open (ViajeProgramadoPersonasComponent, {
      context: {
        viaje_id: item.id,
        salida_id: item.ultimo_viaje_fecha_salida
      }
    });
  }

  showToast (title: any, body: string, status: NbComponentStatus) {
    const position: any = 'top-right';
    const duration: any = 3000;
    this.toastrService.show(
      body,
      title,
      { position, status, duration });
  }

  ver_historial (item: any) {
    console.log (item);

    this.item_selected = item;
    this.view = 'historial';
    this.is_loading = true;

    this.database.getViajesProgramadosHistorial (item.id).subscribe ((res) => {
      this.historial = res;
      this.is_loading = false;
    });
  }

  ver_pasajeros (item: any, dialog: any) {
    this.viajeros_loading = true;

    this.dialogService.open (dialog);

    this.database.getSalidasViaje (this.item_selected.id, item.fecha_salida).subscribe ((res: any []) => {
      this.viajeros = res;
      this.viajeros_loading = false;
    });
  }

  ir_vista (val: string) {
    this.view = val;
  }
}
