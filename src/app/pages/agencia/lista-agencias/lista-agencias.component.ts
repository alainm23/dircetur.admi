import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
import { AgenciaDatabaseService } from '../../../services/agencia-database.service';
import { ExcelService } from '../../../services/excel.service';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'ngx-lista-agencias',
  templateUrl: './lista-agencias.component.html',
  styleUrls: ['./lista-agencias.component.scss']
})
export class ListaAgenciasComponent implements OnInit {
  form: FormGroup;

  provincia_seleccionada: any;
  distrito_seleccionado: any;
  provincias: any [];
  distritos: any [];
  items: any [];
  _items: any [];
  
  contador: number = 0;
  
  tipo_clasificaciones: any [];
  modalidad_turismo: any [];
  tipos_turismo: any [];
  
  clasificacion_seleccionado: any = "";
  modalidad_seleccionado: any = "";
  tipo_seleccionado: any = ""

  subscribe_01: any;
  subscribe_02: any;
  subscribe_03: any;

  view: string = "provincias";
  year_seleccionado: string = moment ().format ('[_]YYYY');
  mes_seleccionado: string = moment ().format ('[_]MM');

  provincias_cargando: boolean = false;
  distritos_cargando: boolean = false;
  lista_cargando: boolean = false;
  constructor(private database: DatabaseService,
              private agencia_db: AgenciaDatabaseService,
              private excelService:ExcelService,
              private router: Router) { }

  ngOnInit() {
    this.provincias_cargando = true;
    
    this.subscribe_01 = this.agencia_db.getEstadisticasPorProvincias ().subscribe ((response: any []) => {
      this.provincias = response;
      console.log (response);

      this.provincias_cargando = false;
    });

    this.agencia_db.getAgenciaTipo_Clasificaciones ().subscribe ((response: any []) => {
      this.tipo_clasificaciones = response;
    });

    this.agencia_db.getModalidad_Turismo ().subscribe ((response: any []) => {
      this.modalidad_turismo = response;
    });

    this.agencia_db.getTipos_Turismo ().subscribe ((res: any []) => {
      this.tipos_turismo = res;

      console.log (res);
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

  ver_distritos (item: any) {
    this.provincia_seleccionada = item;
    this.ir_vista ('distritos');
    this.distritos_cargando = true;

    console.log ('provincia_seleccionada', this.provincia_seleccionada);

    this.agencia_db.getEstadisticasPorDistrito (this.provincia_seleccionada.id).subscribe ((res: any []) => {
      this.distritos = res;
      this.distritos_cargando = false;
    });
  }

  get_items_por_provincia (item: any) {
    this.provincia_seleccionada = item;
    this.ir_vista ('lista');
    this.lista_cargando = true;

    console.log ()

    this.agencia_db.getAgenciasByProvincias (this.provincia_seleccionada.id).subscribe ((data: any []) => {
        console.log (data);
        
        this._items = data;
        this.items = data;
        
        this.contador = data.length;

        this.lista_cargando = false;
    });
  }
  
  get_items_por_distrito (item: any) {
    this.distrito_seleccionado = item;
    this.ir_vista ('lista');
    this.lista_cargando = true;

    console.log ('distrito_seleccionado', this.distrito_seleccionado);

    this.agencia_db.getAgenciasByDistritos (this.distrito_seleccionado.id).subscribe ((data: any []) => {
        console.log (data);

        this._items = data;
        this.items = data;
        
        this.contador = data.length;

        this.lista_cargando = false;
    });
  }

  ir_vista (view: string) {
    this.view = view;
  }

  year_changed () {
    if (this.year_seleccionado === '') {
      this.mes_seleccionado = '';
    }
  }

  get_cantidad (item: any) {
    let returned: number = 0;

    if (item ['total_agencias' + this.year_seleccionado + this.mes_seleccionado] != undefined) {
      returned = item ['total_agencias' + this.year_seleccionado + this.mes_seleccionado];
    }

    return returned;
  }

  /* Estadisticas */

  filtrar () {
    console.log ("Cambio mrd");
    this.items = this._items;

    this.items = this.items.filter ((item: any) => {
      console.log (item);
      return this.check_clasificacion (item) && this.check_modalidad (item) && this.check_tipo (item);
    });

    this.contador = this.items.length;
  }

  check_clasificacion (item: any): boolean {
    if (this.clasificacion_seleccionado === "") {
      return true
    }

    return this.clasificacion_seleccionado === item.clasificacion.id;
  }

  check_modalidad (item: any): boolean {
    if (this.modalidad_seleccionado === "") {
      return true
    }

    const found = item.modalidad_turismo.find ((element: any) => {
      return element.id === this.modalidad_seleccionado;
    });

    if (found === undefined) {
      return false;
    }

    return true;
  }

  check_tipo (item: any): boolean {
    if (this.tipo_seleccionado === "") {
      return true
    }

    const found = item.tipos_turismo.find ((element: any) => {
      return element.id === this.tipo_seleccionado;
    });

    if (found === undefined) {
      return false;
    }

    return true;
  }

  exportAsXLSX ():void {
    this.excelService.exportAsExcelFile(this.items, 'sample');
  }
} 
