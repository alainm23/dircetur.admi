import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-listar-turismo-rural',
  templateUrl: './listar-turismo-rural.component.html',
  styleUrls: ['./listar-turismo-rural.component.scss']
})
export class ListarTurismoRuralComponent implements OnInit {
  items: any [];
  constructor (private database:DatabaseService, private router: Router) { }

  ngOnInit() {
    this.database.getTurismoRural ().subscribe ((res) => {
      this.items = res;
    });
  }

  elimninar (item: any) {
    var opcion = confirm("Eliminar?");
    if (opcion == true) {
      console.log (item);
      this.database.deleteCircuito (item.id)
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
    this.router.navigate(['/pages/turismo-rural/turismo-rural-detalle', item.id]);
  }
}
