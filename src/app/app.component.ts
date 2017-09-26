import {Component , OnInit, ViewEncapsulation} from '@angular/core';
import * as io from 'socket.io-client';

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: [
      '../../node_modules/font-awesome/css/font-awesome.css',
      '../../node_modules/bootstrap/dist/css/bootstrap.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  
}
