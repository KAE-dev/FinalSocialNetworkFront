// TODO: remove code duplication
export default class MainPage {
    constructor(context) {
        this._context = context;
        this._rootEl = context.rootEl();
        this._firstId = 0;
        this._lastId = 0;
        this._postsCount = 5;
    }

    init() {
        this._rootEl.innerHTML = `
      <div class="container">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-supported-content">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbar-supported-content">
            <ul class="navbar-nav mr-auto">
              <li class="nav-item active">
                <a class="nav-link" data-id="menu-main" href="/posts">Посты</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-id="menu-messages" href="/messages">Сообщения</a>
              </li>
            </ul>
            <form data-id="search-form" class="form-inline my-2 my-lg-0">
              <input class="form-control mr-sm-2" type="search" placeholder="Что будем искать?" data-id="search-input">
              <button type="submit" class="btn btn-info" hidden>Поиск</button>
            </form>
            <form data-id="logout-form" class="form-inline my-2 my-lg-0">
              <button class="btn btn-outline-danger my-2 my-sm-0" type="submit">Выйти</button>
            </form>
          </div>
        </nav>
        
          <br>
          <div class="card">
             <div class="card-body" data-id="users-container"></div>
            </div>
         <br>
        
        
        <div class="row">
            <div class="col">
              <div class="card">
                <div class="card-body">
                  <form data-id="post-edit-form">
                    <input type="hidden" data-id="id-input" value="0">
                    <div class="form-group">
                      <input type="text" data-id="content-input" class="form-control" id="content-input" placeholder="Расскажите что у Вас нового?">
                    </div>
                    <div class="form-group">
                      <div class="custom-file">
                        <input type="hidden" data-id="media-name-input">
                        <input type="file" data-id="media-input" class="custom-file-input" id="media-input">
                        <label class="custom-file-label" for="media-input">Выберите файл</label>
                      </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Опубликовать</button>
                  </form>
                </div>
              </div>
              <div class="row" data-id="new-posts"></div>
      <div class="row" data-id="posts-container"></div> 
            </div>
            
        </div>
        
      </div>
      
      <!-- TODO: https://getbootstrap.com/docs/4.4/components/modal/ -->
      <div class="modal fade" data-id="error-modal" tabindex="-1">
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
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
            </div>
          </div>
        </div>
      </div>
    `;

        this._rootEl.querySelector('[data-id=menu-main]').addEventListener('click', evt => {
            evt.preventDefault();
        });
        this._rootEl.querySelector('[data-id=menu-messages]').addEventListener('click', evt => {
            evt.preventDefault();
            this._context.route(evt.currentTarget.getAttribute('href'));
        });

        this._logoutForm = this._rootEl.querySelector('[data-id=logout-form]');
        this._logoutForm.addEventListener('submit', evt => {
            evt.preventDefault();
            this._context.logout();
        });

        this._errorModal = $('[data-id=error-modal]'); // jquery
        this._errorMessageEl = this._rootEl.querySelector('[data-id=error-message]');
        this._postsContainerEl = this._rootEl.querySelector('[data-id=posts-container]');
        this._postCreateFormEl = this._rootEl.querySelector('[data-id=post-edit-form]');
        this._idInputEl = this._postCreateFormEl.querySelector('[data-id=id-input]');
        this._contentInputEl = this._postCreateFormEl.querySelector('[data-id=content-input]');
        this._mediaNameInputEl = this._postCreateFormEl.querySelector('[data-id=media-name-input]');
        this._mediaInputEl = this._postCreateFormEl.querySelector('[data-id=media-input]');
        this._newPostsEl = this._rootEl.querySelector('[data-id=new-posts]');
        this._searchFormEl = this._rootEl.querySelector('[data-id=search-form]');
        this._searchInputEl = this._searchFormEl.querySelector('[data-id="search-input"]');
        this._usersContainerEl = this._rootEl.querySelector('[data-id=users-container]');

        this.loadUserCard();

        this._searchFormEl.addEventListener('submit', evt => {
            evt.preventDefault();
            const str = '?q=' + this._searchInputEl.value;
            this._context.get('/posts' + str, {},
                text => {
                    const posts = JSON.parse(text);
                    this._postsContainerEl.innerHTML = ``;
                    this.rebuildList(posts);
                },
                error => {
                    this.showError(error);
                });
        });
        this._mediaInputEl.addEventListener('change', evt => {

            const [file] = Array.from(evt.currentTarget.files);

            const formData = new FormData();
            formData.append('file', file);
            this._context.post('/files/multipart', formData, {},
                text => {
                    const data = JSON.parse(text);
                    this._mediaNameInputEl.value = data.name;
                },
                error => {
                    this.showError(error);
                });
        });


        this._postCreateFormEl.addEventListener('submit', evt => {
            evt.preventDefault();
            const data = {
                id: Number(this._idInputEl.value),
                content: this._contentInputEl.value,
                media: this._mediaNameInputEl.value || null
            };
            this._context.post('/posts', JSON.stringify(data), {'Content-Type': 'application/json'},
                text => {
                    this._idInputEl.value = 0;
                    this._contentInputEl.value = '';
                    this._mediaNameInputEl.value = '';
                    this._mediaInputEl.value = '';
                    this._postsContainerEl.innerHTML = ``;
                    this._lastId++;
                    this.loadMorePosts(0, this._lastId);
                    this._postsContainerEl.innerHTML = ``;
                    this.getFirstPost();
                },
                error => {
                    this.showError(error);
                });
        });
        this.loadMorePosts(this._lastId, this._postsCount);
        this._lastId += this._postsCount;
        this.getFirstPost();

        this.pollNewPosts();

    }

    getFirstPost() {
        this._context.get("/posts", {},
            text => {
                const id = JSON.parse(text);
                this._firstId = id;
            },
            error => {
                this.showError(error);
            });
    }


    loadMorePosts(lastPost, i) {
          const str = "?lastPost=" + lastPost + "&i=" + i;
        this._context.get("/posts" + str, {},
            text => {
                const posts = JSON.parse(text);
                this.rebuildList(posts);
            },
            error => {
                this.showError(error);
            });
    }
    loadUserCard() {
        this._context.get("/users/me", {},
            text => {
                const user = JSON.parse(text);
                this.showUser(user);
            },
            error => {
                this.showError(error);
            });
    }

    showUser(user) {
        const userEl = document.createElement('div');
        userEl.className = 'col-12';
        userEl.innerHTML = `
                        
             <div>
             <h6>Имя:  ${user.name}</h>
             <h6>Логин: ${user.username}</h6>
              <h6>Номер телефона: ${user.phoneNumber}</h6>

            </div>
                           
          
                      

      `;
        this._usersContainerEl.appendChild(userEl);
    }

    rebuildList(posts) {
        for (const post of posts) {
            const postEl = document.createElement('div');
            postEl.className = 'col-4';
            let postMedia = '';
            if (post.media !== null) {
                if (post.media.endsWith('.png') || post.media.endsWith('.jpg')) {
                    postMedia += `
            <img src="${this._context.mediaUrl()}/${post.media}" class="card-img-top" alt="...">
          `;
                } else if (post.media.endsWith('.mp4') || post.media.endsWith('.webm')) {
                    postMedia = `
            <div class="card-img-topcard-img-top embed-responsive embed-responsive-16by9 mb-2">
              <video src="${this._context.mediaUrl()}/${post.media}" class="embed-responsive-item" controls>
            </div>
          `;
                } else if (post.media.endsWith('.mp3')) {
                    postMedia = `
            <div class = "alert alert-light">
              <audio src = "${this._context.mediaUrl()}/${post.media}" class = "embed-responsive-item" controls>
            </div>
          `;
                }
            }

            postEl.innerHTML = `
<br>
 <div class="card mb-3">
 <div class="card-footer">
 <div class="row">
 <div class="col text-right">
        <div class="dropdown">
             <a class="btn btn-secondary btn-sm dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                 ✎
                </a>

            <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
             <a class="dropdown-item" href="#" data-action="edit">Редактировать пост</a>
            <a class="dropdown-item" href="#"data-action="remove">Удалить пост</a>
            </div>
        </div>

              </div>
              </div>
 </div>
          ${postMedia}
          <div class="card-body">
            <p class="card-text">${post.content}</p>    
          </div>
          
          
           
          <div class="card-footer">
             <div class="row">
              <div class="col">
               <p class="card-text">Автор: ${post.authorName}</p>  
              </div>
              <div class="text-right">
                <a href="#" data-action="like" class="btn btn-sm btn-danger" >${post.likes} Нравится</a>
                <a href="#" data-action="dislike" class="btn btn-sm btn-dark">Не нравится</a>
              </div>              
            </div>
          </div>
        </div>
  
<br>

        
      `;


            postEl.querySelector('[data-action=like]').addEventListener('click', evt => {
                evt.preventDefault();
                this._context.post(`/posts/${post.id}/likes`, null, {},
                    () => {
                        this._postsContainerEl.innerHTML = ``;
                        this.loadMorePosts(0, this._lastId);
                    }, error => {
                        this.showError(error);
                    });
            });
            postEl.querySelector('[data-action=dislike]').addEventListener('click', evt => {
                evt.preventDefault();
                this._context.delete(`/posts/${post.id}/likes`, {},
                    () => {
                        this._postsContainerEl.innerHTML = ``;
                        this.loadMorePosts(0, this._lastId);
                    }, error => {
                        this.showError(error);
                    });
            });
            postEl.querySelector('[data-action=edit]').addEventListener('click', evt => {
                evt.preventDefault();
                this._idInputEl.value = post.id;
                this._contentInputEl.value = post.content;
                this._mediaNameInputEl.value = post.media;
                this._mediaInputEl.value = '';
            });
            postEl.querySelector('[data-action=remove]').addEventListener('click', evt => {
                evt.preventDefault();
                this._context.delete(`/posts/${post.id}`, {},
                    () => {
                        this._postsContainerEl.innerHTML = ``;
                        this._lastId--;
                        this.loadMorePosts(0, this._lastId);
                    }, error => {
                        this.showError(error);
                    });
            });
            this._postsContainerEl.appendChild(postEl);
        }


            const loadPostEl = document.createElement('div');
            loadPostEl.className = 'col-12';
            loadPostEl.innerHTML = `
             <div class="card">
                <a href="#" data-action="load-more" class="btn btn-sm btn-primary">Показать больше</a>
             </div> 
         `;
            loadPostEl.querySelector('[data-action=load-more]').addEventListener('click', evt => {
                evt.preventDefault();
                this._postsContainerEl.removeChild(loadPostEl);
                this.loadMorePosts(this._lastId, this._postsCount);
                this._lastId += this._postsCount;
            });
            this._postsContainerEl.appendChild(loadPostEl);

    }

    pollNewPosts() {
        this._timeout = setTimeout(() => {
            this.newPostsSearch();
            this.pollNewPosts();
        }, 5000);
    }

    newPostsSearch() {
        const str = "?firstPostId=" + this._firstId;
        this._context.get("/posts" + str, {},
            text => {
                const badge = JSON.parse(text);
                if (badge > 0) {
                    this.showNewPosts(badge);
                }
            },
            error => {
                this.showError(error);
            });
    }

    showNewPosts(badge) {
        this._newPostsEl.innerHTML = '';
        const newPostEl = document.createElement('div');
        newPostEl.className = 'col-12';
        newPostEl.innerHTML = `
                            <br>
                <div  class="card">
                    <button type="button" class="btn btn-primary" href="#" data-action="new-posts" >
                     Новые посты <span class="badge badge-secondary">${badge}</span>
                    </button>
                </div>
    `;
        newPostEl.querySelector('[data-action=new-posts]').addEventListener('click', evt => {
            evt.preventDefault();
            this._newPostsEl.removeChild(newPostEl);
            this._postsContainerEl.innerHTML = ``;
            this._lastId += badge;
            this.loadMorePosts(0, this._lastId);
            this.getFirstPost();
        });
        this._newPostsEl.appendChild(newPostEl);
    }

    showError(error) {
        const data = JSON.parse(error);
        const message = this._context.translate(data.message);
        this._errorMessageEl.textContent = message;
        this._errorModal.modal('show');
    }

    destroy() {
        clearTimeout(this._timeout);
    }
}
