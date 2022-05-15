import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatChipsModule } from '@angular/material/chips';
import { SideMenuContainerComponent } from './UI/side-menu-container/side-menu-container.component';
import { SideMenuComponent } from './UI/side-menu-container/side-menu/side-menu.component';





@NgModule({
  declarations: [
    AppComponent,
    SideMenuContainerComponent,
    SideMenuComponent
  ],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatSidenavModule,
    MatChipsModule,

  ],
  providers: [],
  bootstrap: [AppComponent],

})
export class AppModule { }
