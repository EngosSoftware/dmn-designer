import './Header.css';
import template from './Header.html';
import {Component} from 'simpa/lib/component';
import {$id} from 'simpa/lib/utils';

export class Header extends Component {

    private readonly containerId = '';

    constructor() {
        super('drg-header');
    }

    public doTemplate(): string {
        return template;
    }

    public doCreate() {
        super.doCreate();
    }

    public doBuild() {
        super.doBuild();
        const container = $id(this.containerId);
    }

    public doInit() {
        super.doInit();
    }
}
