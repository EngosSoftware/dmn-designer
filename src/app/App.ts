import './App.css';
import template from './App.html';
import {Application} from 'simpa/lib/application';
import {HomeView} from '../views/homeView/HomeView';
import {Header} from '../components/header/Header';
import {Footer} from '../components/footer/Footer';
import {Bottom} from '../components/bottom/Bottom';
import {$id} from 'simpa/lib/utils';

/**
 * Application class.
 */
class App extends Application {

    private readonly headerContainerId = '';
    private readonly viewContainerId = '';
    private readonly footerContainerId = '';

    private readonly header: Header;
    private readonly bottom: Bottom;
    private readonly footer: Footer;

    private readonly homeView: HomeView;

    private pageTitle = 'Designer';

    constructor(appContainerId: string, appClass: string) {
        super(appContainerId, appClass);
        this.homeView = new HomeView();
        this.addView(this.homeView);
        this.header = new Header();
        this.bottom = new Bottom();
        this.footer = new Footer();
    }

    public doTemplate(): string {
        return template;
    }

    public doCreate() {
        super.doCreate();
        this.header.doCreate();
        this.doCreateViews();
        this.bottom.doCreate();
        this.footer.doCreate();
    }

    public doBuild() {
        super.doBuild();
        $id(this.headerContainerId).appendChild(this.header.componentRoot);
        this.header.doBuild();
        this.views.forEach((view) => {
            $id(this.viewContainerId).appendChild(view.componentRoot);
        });
        this.doBuildViews();
        $id(this.footerContainerId).appendChild(this.bottom.componentRoot);
        this.bottom.doBuild();
        $id(this.footerContainerId).appendChild(this.footer.componentRoot);
        this.footer.doBuild();
    }

    public doInit(): void {
        const me = this;
        this.header.doInit();
        this.doInitViews();
        this.bottom.doInit();
        this.footer.doInit();
        this.showContentPointedByUrl();
        window.onhashchange = () => {
            me.showContentPointedByUrl();
        };
    };

    public showHomeView(pushState: boolean = true) {
        this.hideViews();
        this.homeView.show();
        if (pushState) {
            history.pushState({id: 'home-view'}, this.pageTitle, '#/');
        }
    }

    /**
     * Displays the content pointed by the URL after the hash character.
     */
    private showContentPointedByUrl() {
        let pointer = window.location.hash;
        if (pointer && pointer.length > 0) {
            if (pointer === '#/') {
                this.showHomeView(false);
                return;
            }
        }
        this.showHomeView();
        history.replaceState({id: 'home-view'}, this.pageTitle, '#/');
    }
}

const app = new App('appContainer', 'drg-app');
export default app;
