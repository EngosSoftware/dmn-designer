import './Bottom.css';
import template from './Bottom.html';
import {Component} from 'simpa/lib/component';
import {$touch} from 'simpa/lib/utils';

export class Bottom extends Component {

    private readonly regulationsId = '';
    private readonly privacyPolicyId = '';

    constructor() {
        super('drg-bottom');
    }

    public doTemplate(): string {
        return template;
    }

    public doInit() {
        super.doInit();
        $touch(this.regulationsId, () => {
            // TODO app.showRegulationsView();
        });
        $touch(this.privacyPolicyId, () => {
            // TODO app.showPrivacyPolicyView();
        });
    }
}
