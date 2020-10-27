import { Component } from '@angular/core';
import { DecisionTableService } from './decision-table/decision-table.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  editable = false;
  fullscreen = false;

  constructor (private decisionTableService: DecisionTableService) { }

  refresh () {
    window.location.reload();
  }

  editTable () {
    this.editable = !this.editable;
    this.decisionTableService.sendMessage('edit');
  }

  showHelp () {
    this.decisionTableService.sendMessage('help');
  }

  turnFullScreen () {
    this.fullscreen = !this.fullscreen;
    this.decisionTableService.sendMessage('fullscreen');
  }
}
