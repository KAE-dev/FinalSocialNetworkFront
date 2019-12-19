import Api from './http.js';
import Translator from './translator.js';
import Router from './router.js';
import MainPage from './pages/MainPage.js'
import LoginPage from './pages/LoginPage.js'
import RegPage from './pages/RegPage.js'
import MessagesPage from './pages/MessagesPage.js'

class Context {
  constructor(rootEl, api, router, translator, mediaUrl, websocketUrl) {
    this._rootEl = rootEl;
    this._api = api;
    this._router = router;
    this._router.onUserGoBack(path => {
      this.route(path, false);
    });
    this._translator = translator;
    this._auth = localStorage.getItem('auth');
    this._profile = JSON.parse(localStorage.getItem('profile'));
    if (!this._auth) {
      this._path = '/';
    } else {
      this._path = '/posts';
    }
    this._pathParams = {};
    this._component = null;
    this._mediaUrl = mediaUrl;
    this._websocketUrl = websocketUrl;
    this.route(this._path);
  }

  rootEl() {
    return this._rootEl;
  }

  translate(code) {
    console.log(code);
    return this._translator.translate(code);
  }

  route(path, push = true) {
    this.destroyComponent();
    this._path = path;
    const {component, params} = this._router.route(path, push);
    this._component = new component(this);
    this._pathParams = params;
    this.initComponent();
  }

  pathParams() {
    return this._pathParams;
  }
  login(login, password, profile) {
    this._auth = btoa(`${login}:${password}`);
    this._profile = profile;
    localStorage.setItem('auth', this._auth);
    localStorage.setItem('profile', profile);
    this.route('/posts');
  }

  logout() {
    this._auth = null;
    localStorage.clear();
    this.route('/');
  }


  get(path, headers = {}, onSuccess = null, onFail = null) {
    if (this._auth) {
      headers['Authorization'] = `Basic ${this._auth}`;
    }
    this._api.get(path, headers, onSuccess, onFail);
  };

  post(path, data, headers = {}, onSuccess = null, onFail = null) {
    if (this._auth) {
      headers['Authorization'] = `Basic ${this._auth}`;
    }
    this._api.post(path, data, headers, onSuccess, onFail);
  };

  delete(path, headers = {}, onSuccess = null, onFail = null) {
    if (this._auth) {
      headers['Authorization'] = `Basic ${this._auth}`;
    }
    this._api.delete(path, headers, onSuccess, onFail);
  };

  mediaUrl() {
    return this._mediaUrl;
  }

  webSocketUrl() {
    return this._websocketUrl;
  }

  initComponent() {
    if (!this._component) {
      return;
    }
    if (typeof this._component.init !== 'function') {
      return;
    }
    this._component.init();
  }

  destroyComponent() {
    if (!this._component) {
      return;
    }
    if (typeof this._component.destroy !== 'function') {
      return;
    }
    this._component.destroy();
  }
}


const translator = new Translator();
const router = new Router();

router.register('/', LoginPage);
router.register('/register', RegPage);
router.register('/posts', MainPage);
router.register('/messages', MessagesPage);


const [backendUrl, websocketUrl] = ['localhost', '127.0.0.1'].includes(window.location.hostname) ?
  ['http://localhost:9999', 'ws://localhost:9999/ws'] : ['https://final-network-back.herokuapp.com', 'wss://final-network-back.herokuapp.com/ws'];

const api = new Api(`${backendUrl}/api`);
new Context(document.getElementById('root'), api, router, translator, `${backendUrl}/api/files/entity`, websocketUrl);

