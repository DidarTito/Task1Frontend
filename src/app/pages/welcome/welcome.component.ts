import { Component } from '@angular/core';
import {NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-welcome',
  imports: [NzCardModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  constructor() {}
}
