import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerSolicitudComponent } from './ver-solicitud.component';

describe('VerSolicitudComponent', () => {
  let component: VerSolicitudComponent;
  let fixture: ComponentFixture<VerSolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerSolicitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
