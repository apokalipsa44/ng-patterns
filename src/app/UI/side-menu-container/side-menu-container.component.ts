import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-side-menu-container',
  templateUrl: './side-menu-container.component.html',
  styleUrls: ['./side-menu-container.component.scss']
})
export class SideMenuContainerComponent implements OnInit {
searchForm!: FormGroup;
  constructor() { }

  ngOnInit(): void {
this.searchForm=new FormGroup({
  keywords:new FormControl('')
}) 
  }

}
