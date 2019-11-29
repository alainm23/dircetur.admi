import { Component, OnInit } from '@angular/core';

// Services
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';

import { Router } from '@angular/router';

@Component({
  selector: 'ngx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public auth: AuthService, 
              public database: DatabaseService,
              public router: Router) { }

  ngOnInit() {

  }

  ngOnDestroy () {
    
  }

  ver (val: string) {
    
  }
}