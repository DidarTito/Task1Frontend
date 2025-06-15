import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import {NzCardModule } from 'ng-zorro-antd/card';
// import { ApplicationTableComponent } from "./pages/application-table/application-table.component";


@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule, NzCardModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isCollapsed = false;
}
