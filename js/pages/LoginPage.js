export default class LoginPage {
    constructor(context) {
        this._context = context;
        this._rootEl = context.rootEl();

    }

    init() {
        this._rootEl.innerHTML = `

<div id="username-page">
		<div class="username-page-container">
			<h1 class="title">Вход</h1>
			<br>
			<form data-id="login-form" name="usernameForm">
				<div class="form-group"  >
					<input data-id="login-input" type="text" id="name" placeholder="Введите имя"
						   autocomplete="off" class="form-control" minlength="2"/>
				</div>
				<div class="form-group" >
					<input data-id="password-input" type="password" id="name" placeholder="Введите пароль"
						   autocomplete="off" class="form-control" minlength="6"/>
				</div>
				<div class="form-group">
					<button type="submit" class="accent username-submit">Войти
					</button>
				</div>
				</form>
				<div class="form-group">
                      <p class="text-center" >Еще нет аккаунта? <a class="txt-brand" href="/register" data-id="register">
                          Зарегистрируйтесь
                        </a></p>
                </div>
			
		</div>
	</div>

          
            <div class="modal fade" data-id="error-modal" tabindex="-1" >
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Ошибка!</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div data-id="error-message" class="modal-body">
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-info" data-dismiss="modal">Закрыть</button>
                </div>
              </div>
            </div>
          </div>
    `;

        this._rootEl.querySelector('[data-id=register]').addEventListener('click', evt => {
            evt.preventDefault();
            this._context.route(evt.currentTarget.getAttribute('href'));
        });

        this._errorModal = $('[data-id=error-modal]'); // jquery
        this._errorMessageEl = this._rootEl.querySelector('[data-id=error-message]');
        this._loginFormEl = this._rootEl.querySelector('[data-id=login-form]');
        this._loginInputEl = this._loginFormEl.querySelector('[data-id=login-input]');
        this._passwordInputEl = this._loginFormEl.querySelector('[data-id=password-input]');

        this._loginFormEl.addEventListener('submit', evt => {
            evt.preventDefault();
            const login = this._loginInputEl.value;
            const password = this._passwordInputEl.value;


            this._context.get('/users/me',  {'Authorization': `Basic ${btoa(login + ':' + password)}`},
                text => {
                    this._context.login(login, password, text);
                },
                error => {
                    this.showError(error);
                });
        });
    }

    showError(error) {
        const data = JSON.parse(error);
        const message = this._context.translate(data.message);
        this._errorMessageEl.textContent = message;
        this._errorModal.modal('show');
    }

    destroy() {
    }
}
