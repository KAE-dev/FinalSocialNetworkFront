export default class RegPage {
    constructor(context) {
        this._context = context;
        this._rootEl = context.rootEl();

    }

    init() {
        this._rootEl.innerHTML = `
<div>
        <div class="alert alert-info" role="alert" style="display: none" data-id="alert">
            <button type="button" class="close" data-dismiss="alert">×</button>
            <h4 class="alert-heading">
            <p class="text-center" >Вы зарегистрированы</p>
            <p class="text-center" href="/"><a class="txt-brand" href="/">
                  <font color="#29aafe">Войти</font>
                </a></p>
            </h4>
          </div>
        <div id="username-page">
		<div class="username-page-container">
			<h1 class="title">Регистрация</h1>
			<br>
			<form data-id="register-form" name="usernameForm">
			<input type="hidden" data-id="id-input" value="0">
			<div>
				<div class="form-group"  >
					<input data-id="name-input" type="text" id="name" placeholder="Введите имя"
						   autocomplete="off" class="form-control" minlength="2"/>
				</div>
				<div class="form-group"  >
					<input data-id="login-input" type="text" id="name" placeholder="Введите логин"
						   autocomplete="off" class="form-control" minlength="2"/>
				</div>
				<div class="form-group"  >
					<input data-id="phoneNumber-input" type="tel" id="name" placeholder="Введите номер телефона"
						   autocomplete="off" class="form-control" minlength="6"/>
				</div>
				<div class="form-group" >
					<input data-id="password-input" type="password" id="text" placeholder="Введите пароль"
						   autocomplete="off" class="form-control" minlength="6"/>
				</div>
				<div class="form-group">
					<button type="submit" class="accent username-submit">Войти
					</button>
				</div>
				</form>
				</div>
				<div class="form-group">
                      <p class="text-center" >Есть аккаунт? <a class="txt-brand" href="/" data-id="register">
                          войти
                        </a></p>
                </div>
			
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
        this._alertEl = $('[data-id="alert"]');
        this._errorModal = $('[data-id=error-modal]'); // jquery
        this._errorMessageEl = this._rootEl.querySelector('[data-id=error-message]');
        this._registerFormEl = this._rootEl.querySelector('[data-id=register-form]');
        this._nameInputEl = this._registerFormEl.querySelector('[data-id=name-input]');
        this._phoneNumberInputEl = this._registerFormEl.querySelector('[data-id=phoneNumber-input]');
        this._loginInputEl = this._registerFormEl.querySelector('[data-id=login-input]');
        this._passwordInputEl = this._registerFormEl.querySelector('[data-id=password-input]');
        this._idInputEl = this._registerFormEl.querySelector('[data-id=id-input]');






        this._registerFormEl.addEventListener('submit', evt => {
            evt.preventDefault();
            const data = {
                id: Number(this._idInputEl.value),
                name: this._nameInputEl.value,
                phoneNumber: this._phoneNumberInputEl.value || null,
                username: this._loginInputEl.value,
                password: this._passwordInputEl.value,

             };
            this._context.post('/users', JSON.stringify(data), {'Content-Type': 'application/json'},
                 text => {
                      this._idInputEl.value=0;
                      this._nameInputEl.value='';
                      this._phoneNumberInputEl.value='';
                      this._loginInputEl.value='';
                      this._passwordInputEl.value='';

                      this._alertEl.show();
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
