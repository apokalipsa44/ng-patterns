import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideMenuContainerComponent } from './side-menu-container/side-menu-container.component';
import { SideMenuComponent } from './side-menu-container/side-menu/side-menu.component';



@NgModule({
  declarations: [
    SideMenuContainerComponent,
    SideMenuComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    SideMenuContainerComponent
  ]
})
export class SideMenuModule { }
