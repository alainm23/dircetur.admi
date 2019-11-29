import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { FormGroup , FormControl, Validators } from '@angular/forms';

import { Router } from '@angular/router';

@Component({
  selector: 'ngx-ver-eventos',
  templateUrl: './ver-eventos.component.html',
  styleUrls: ['./ver-eventos.component.scss']
})
export class VerEventosComponent implements OnInit {
  messelected: any = {
    mes: "Enero",
    value: "01"
  };

  meses: any[] = [
    {
      mes: "Enero",
      value: "01"
    }, 
    {
      mes: "Febrero",
      value: "02"
    }, 
    {
      mes: "Marzo",
      value: "03"
    }, 
    {
      mes: "Abril",
      value: "04"
    }, 
    {
      mes: "Mayo",
      value: "05"
    }, 
    {
      mes: "Junio",
      value: "06"
    }, 
    {
      mes: "Julio",
      value: "07"
    }, 
    {
      mes: "Agosto",
      value: "08"
    }, 
    {
      mes: "Septiembre",
      value: "09"
    }, 
    {
      mes: "Octubre",
      value: "10"
    }, 
    {
      mes: "Noviembre",
      value: "11"
    }, 
    {
      mes: "Diciembre",
      value: "12"
    }
  ];

  items: any[];
  constructor(public database: DatabaseService, private router: Router) { }

  ngOnInit() {
  }

  ngOnDestroy () {

  }

  elimninar (item: any) {
    var opcion = confirm("Eliminar?");
    if (opcion == true) {
      console.log (item);
      this.database.deleteEvento (item.ref)
      .then (() => {
        console.log ("Elininado");
      })
      .catch (error => {
        console.log ("error", error);
      });
    } else {
      console.log ("Cancelar");
    }
  }

  editar (item: any) {
    this.router.navigate(['/pages/eventos/evento-detalle', item.ref.id]);
  }

  submit () {
    console.log (this.messelected);

    this.database.getEventosMes (this.messelected.value).subscribe ((data) => {
      console.log (data);
      this.items = data;
    });
  }
}
