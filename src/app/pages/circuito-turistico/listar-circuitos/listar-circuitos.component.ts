import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-listar-circuitos',
  templateUrl: './listar-circuitos.component.html',
  styleUrls: ['./listar-circuitos.component.scss']
})
export class ListarCircuitosComponent implements OnInit {
  items: any [];
  constructor (private database:DatabaseService, private router: Router) { }

  ngOnInit() {
    this.database.getCircuitos ().subscribe ((res) => {
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
    this.router.navigate(['/pages/circuito-turistico/circuito-detalle', item.id]);
  }
}
