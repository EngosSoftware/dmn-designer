import './Footer.css';
import template from './Footer.html';
import {Component} from 'simpa/lib/component';

export class Footer extends Component {

    constructor() {
        super('drg-footer');
    }

    public doTemplate(): string {
        return template;
    }

    public doInit(): void {
        super.doInit();
    }
}
