import { NgModule } from '@angular/core';

import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule, 
  NbIconModule,
  NbInputModule,
  NbRadioModule,
  NbSelectModule,
  NbUserModule,
  NbSpinnerModule,
  NbListModule
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { AgenciaRoutingModule } from './agencia-routing.module';
import { AgenciaComponent } from './agencia.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgregarAgenciaComponent } from './agregar-agencia/agregar-agencia.component';
import { EditarClasificacionComponent } from './editar-clasificacion/editar-clasificacion.component';
import { EditarTiposTurismoComponent } from './editar-tipos-turismo/editar-tipos-turismo.component';
import { ListaAgenciasComponent } from './lista-agencias/lista-agencias.component';
import { AgenciaDetalleComponent } from './agencia-detalle/agencia-detalle.component';

@NgModule({
  imports: [
    ThemeModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbUserModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    NbListModule,
    AgenciaRoutingModule,
    NbSelectModule,
    NbIconModule,
    NbSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    AgenciaComponent,
    AgregarAgenciaComponent,
    EditarClasificacionComponent,
    EditarTiposTurismoComponent,
    ListaAgenciasComponent,
    AgenciaDetalleComponent,
  ],
})

export class AgenciaModule { }