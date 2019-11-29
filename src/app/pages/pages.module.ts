import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { NotFoundModule } from './not-found/not-found.module';
import { HomeModule } from './home/home.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from '../services/auth.guard';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    FormsModule,
    ReactiveFormsModule,
    NotFoundModule,
    HomeModule
  ],
  declarations: [
    PagesComponent,
  ],
  providers: [
    AuthGuard
  ]
})
export class PagesModule {
}
