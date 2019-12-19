export default class Translator {
  constructor() {
    this.init();
  }

  init() {
    this.lang = languages[0];
    for (const language of languages) {
      if (navigator.languages.includes(language)) {
        this.lang = language;
        break;
      }
    }
  }

  translate(code) {
    return translations[this.lang][code] || translations[this.lang]['error.unknown'];
  }
}

const languages = ['ru', 'en'];

const translations = {
  ru: {
    'error.network': 'Ошибка сети. Проверьте подключение',
    'error.unknown': 'Неизвестная ошибка',
    'error.message_send': 'Не удалось отправить сообщение',
    'error.validation': 'Неверные данные',
    'error.validation.min_size':'Слишком короткая запись',
    'error.validation.phoneNumber':'Неверно указан номер телефона',
    'error.bad_filetype': 'Формат не поддерживается',
    'error.not_found': 'Не найдено',
    'error.authorized': 'Ошибка авторизации',
    'error.access_denied': 'Отказано в доступе',

  },
  en: {
    'error.network': 'Network error',
    'error.unknown': 'Unknown error',
    'error.message_send': 'Cant send message',
    'error.validation': 'Wrong data',
    'error.validation.min_size':'Record Too Short',
    'error.validation.phoneNumber':'Invalid phone number',
    'error.bad_filetype': 'Format not supported',
    'error.not_found': 'Not found',
    'error.authorized': 'Authorisation Error',
    'error.access_denied': 'Access denied',
  }
};
