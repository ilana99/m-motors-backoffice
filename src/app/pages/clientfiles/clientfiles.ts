import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Gallery } from './components/gallery/gallery';

@Component({
  selector: 'app-clientfiles',
  imports: [Gallery, RouterLink],
  templateUrl: './clientfiles.html',
  styleUrl: './clientfiles.scss',
})
export class Clientfiles {
  showDashboardBackButton = history.state?.fromDashboard === true;
}
