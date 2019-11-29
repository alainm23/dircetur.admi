import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
@Component({
  selector: 'ngx-editar-tipos-guiado',
  templateUrl: './editar-tipos-guiado.component.html',
  styleUrls: ['./editar-tipos-guiado.component.scss']
})
export class EditarTiposGuiadoComponent implements OnInit {
  subscribe_01: any;
  items: any [] = [];
  is_loading: boolean = true;
  show_nuevo: boolean = false;
  is_nuevo_loading: boolean = false;
  nuevo: string = "";
  constructor(private database: DatabaseService,) { }

  ngOnInit() {
    this.subscribe_01 = this.database.getGuia_Tipo_Guiado2 ().subscribe ((response: any []) => {
      this.items = response.reverse ();
      this.is_loading = false;
    });
  }

  ngOnDestroy () {
    if (this.subscribe_01 !== null && this.subscribe_01 !== undefined) {
      this.subscribe_01.unsubscribe ();
    }
  }

  eliminar (item: any) {
    var opcion = confirm("Eliminar?");
    if (opcion == true) {
      this.database.removeGuia_Tipo_Guiado (item);
    } else {
      console.log ("Cancelar");
    }
  }

  editar (item: any) {
    item.edit = true;
  }

  cancel (item: any) {
    item.edit = false;
  }

  guardar (item: any) {
    let name = (<HTMLInputElement> document.getElementById(item.id)).value;
    
    if (name !== "") {
      item.nombre = name;

      this.database.updateGuia_Tipo_Guiado (item)
        .then (() => {
          console.log ("Actualizado");
          item.edit = false;
        })
        .catch ((error) => {
          console.log ("error", error);
          item.edit = false;
        });
    } else {
    }
  }

  cancel_nuevo () {
    this.show_nuevo = false;
    this.nuevo = "";
  }

  guardar_nuevo () {
    if (this.nuevo != "") {
      this.is_nuevo_loading = true;
      this.database.addGuia_Tipo_Guiado (this.nuevo)
        .then (() => {
          this.nuevo = "";
          this.show_nuevo = false;
          this.is_nuevo_loading = false;
        })
        .catch (error => {

        });
    } else {

    }
  }

  agregar_nuevo () {
    this.show_nuevo = true;
  }
}
