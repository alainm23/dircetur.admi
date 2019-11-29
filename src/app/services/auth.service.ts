import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { DatabaseService } from "../services/database.service";
import { Router } from '@angular/router';
import { NbMenuService } from '@nebular/theme';

import { first } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  logeado: boolean = true;
  usuario: any;
  menu: any [];
  constructor(public afAuth: AngularFireAuth,
              public router: Router,
              private menuService: NbMenuService,
              public database: DatabaseService) {
    this.initMenu ();         
  }

  initMenu () {
    this.menu = [
    {
        acceso: ['admi'],
        title: 'Principal',
        icon: 'home-outline',
        link: '/pages/home',
    },
    {
        acceso: ['admi'],
        title: 'Prestadores turísticos',
    icon: 'map',
    children: [
        {
        title: 'Agencia',
        icon: 'map',
        children: [
            {
            title: 'Listar Agencias',
            link: '/pages/agencia/lista-agencias',
            },
            {
            title: 'Agregar Agencia de Turismo',
            link: '/pages/agencia/agregar-agencia',
            },
            {
            title: 'Gestionar clasificaciones',
            link: '/pages/agencia/editar-clasificacion',
            },
            {
            title: 'Gestionar tipos de turismo',
            link: '/pages/agencia/editar-tipos-turismo',
            },
        ]
        },
        {
        title: 'Alojamiento',
        icon: 'home',
        children: [
            {
            title: 'Listar Alojamientos',
            link: '/pages/alojamiento/lista-alojamientos',
            },
            {
            title: 'Agregar Alojamiento',
            link: '/pages/alojamiento/agregar-hotel',
            },
            {
            title: 'Gestionar Clasificaciones',
            link: '/pages/alojamiento/editar-clasificacion',
            }
        ]
        },
        {
        title: 'Restaurante',
        icon: 'star',
        children: [
            {
            title: 'Listar Restaurante',
            link: '/pages/restaurante/lista-restaurantes',
            },
            {
            title: 'Agregar restaurante',
            link: '/pages/restaurante/agregar-restaurante',
            },
            {
            title: 'Gestionar clasificaciones',
            link: '/pages/restaurante/editar-clasificacion',
            },
            {
            title: 'Gestionar categorias',
            link: '/pages/restaurante/editar-categoria',
            }
        ]
        },
        {
        title: 'Guías oficiales de turismo',
        icon: 'people',
        children: [
            {
            title: 'Listar Guias',
            link: '/pages/guia/lista-guias',
            },
            {
            title: 'Agregar guía oficiales de turismo',
            link: '/pages/guia/agregar-guia',
            },
            {
            title: 'Gestionar idiomas',
            link: '/pages/guia/editar-idioma',
            },
            {
            title: 'Gestionar asociaciones / colegios',
            link: '/pages/guia/editar-asociacion-colegio',
            },
            {
            title: 'Gestionar centro de formacion',
            link: '/pages/guia/editar-centro-formacion',
            },
            {
            title: 'Gestionar tipos de guiado',
            link: '/pages/guia/editar-tipos-guiado',
            }
        ]
        }
    ]
    },
    {
    acceso: ['admi'],
    title: 'Viajes programados',
    icon: 'map',
    children: [
        {
          title: 'Panel general',
          link: '/pages/viaje-programado/viaje-programado-panel',
        },
        {
          title: 'Procesar viajeros',
          link: '/pages/viaje-programado/personas',
        },
    ]
    },
    {
    acceso: ['admi', 'etiquetas'],
    title: 'Pagina web',
    icon: 'map',
    children: [
        {
        title: 'Administras Web',
        icon: 'edit-outline',
        url: 'https://web-edit-dirceturcuscoapp.firebaseapp.com'
        },
        {
        title: 'Sobre Dircetur',
        icon: 'layers',
        children: [
            {
            title: 'Junta Directiva',
            link: '/pages/sobre-dircetur/junta-directiva',
            },
            {
            title: 'Funciones',
            link: '/pages/sobre-dircetur/funciones',
            }
        ]
        },
        {
        title: 'Preguntas Frecuentes',
        icon: 'question-mark-circle',
        children: [
            {
            title: 'Gestionar preguntas',
            link: '/pages/FAQ/listar-faq',
            },
            {
            title: 'Gestionar categorias',
            link: '/pages/FAQ/editar-categorias',
            }
        ]
        },
        {
        title: 'Calendario',
        icon: 'calendar',
        children: [
            {
            title: 'Agregar Eventos',
            link: '/pages/eventos/agregar-eventos',
            },
            {
            title: 'Listar Eventos',
            link: '/pages/eventos/ver-eventos',
            }
            ,
            {
            title: 'Gestionar Tipos',
            link: '/pages/eventos/editar-tipos', 
            }
        ]
        },
        {
        title: 'Blog',
        icon: 'text',
        children: [
            {
            title: 'Agregar Blog',
            link: '/pages/blog/agregar-blog',
            },
            {
            title: 'Listar Blogs',
            link: '/pages/blog/ver-blog', 
            },
            {
            title: 'Gestionar Categorias',
            link: '/pages/blog/editar-etiquetas', 
            }
        ]
        },
        {
        title: 'Circuito Turistico',
        icon: 'navigation-2',
        children: [
            {
            title: 'Agregar Circuito Tiristico',
            link: '/pages/circuito-turistico/agregar-circuito-turistico',
            },
            {
            title: 'Listar Circuito Tiristico',
            link: '/pages/circuito-turistico/listar-circuitos',
            },
            {
            title: 'Gestionar etiquetas',
            link: '/pages/circuito-turistico/editar-tags',
            }
        ]
        },   
        {
        title: 'Turismo Rural',
        icon: 'navigation-2',
        children: [
            {
            title: 'Agregar Turismo Rural',
            link: '/pages/turismo-rural/agregar-turismo-rural',
            },
            {
            title: 'Listar Turismo Rura',
            link: '/pages/turismo-rural/listar-turismo-rural',
            }
        ]
        },
        {
        title: 'Boleto turistico',
        icon: 'navigation-2',
        children: [
            {
            title: 'Boletos turisticos',
            group: true,
            },
            {
            title: 'Agregar boleto tiristico',
            link: '/pages/boleto-turistico/agregar-boleto',
            },
            {
            title: 'Museos',
            group: true,
            },
            {
            title: 'Agregar Museo',
            link: '/pages/boleto-turistico/agregar-museo',
            },
            {
            title: 'Parques arqueológicos',
            group: true,
            },
            {
            title: 'Agregar parque arqueologico',
            link: '/pages/boleto-turistico/agregar-parques-arqueologico',
            }
        ]
        }
    ]
    },
    {
        acceso: ['admi', 'presupuesto'],
        title: 'Control presupuestal',
        icon: 'map',
        children: [
            {
                title: 'Reporte general',
                icon: 'navigation-2',
                link : '/pages/solicitudes/reporte-general'
            },
            {
                title: 'Registrar solicitud',
                icon: 'navigation-2',
                link: '/pages/solicitudes/registrar-solicitudv2',
            },
            {
                title: 'Procesar solicitudes',
                icon: 'navigation-2',
                link: '/pages/solicitudes/procesar-solicitudes',
            },
            {
                title: 'Historial beneficiario',
                icon: 'navigation-2',
                link: '/pages/solicitudes/buscar-solicitante',
            },
            {
                title: 'Data interna',
                icon: 'navigation-2',
                children: [
                    {
                        title: 'Asuntos',
                        icon: 'navigation-2',
                        link: '/pages/asuntos/listar-asuntos',
                    },
                    {
                      title: 'Capacitaciones',
                      icon: 'navigation-2',
                      link: '/pages/capacitaciones/listar-capas',
                    },
                ]
            },
            
        ] 
    }
];
  }

  async isLogin (){
    return await this.afAuth.authState.pipe(first()).toPromise();  
  }
  
  public authState () {
    return this.afAuth.authState;
  }

  public signInWithEmailAndPassword (email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword (email, password);
  }

  public signOut () {
    return this.afAuth.auth.signOut ();
  }

  set_usuario (user: any) {
    this.usuario = user;
    
    this.menu.forEach ((item: any) => {
      if (item.acceso.includes (this.usuario.tipo_usuario) === false) {
        item.hidden = true;
      }
    });
  }
}
