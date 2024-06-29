import { validate } from "class-validator";
import { User } from "../models/User";
import autobind from "autobind-decorator";

export class UserController{
    constructor(public element: HTMLElement){
        const button = element.querySelector('#play');

        console.log('UserController constructor');
        button?.addEventListener('click', this.processPlayButtonClick);
    }
    // decorento người dùng click bắt đầu trò chơi
  @autobind
    processPlayButtonClick(event: Event){

    event.preventDefault();

    const form = this.element.querySelector('form') as HTMLFormElement;
    const usernameElement = this.element.querySelector('#username') as HTMLInputElement;
    const helpId = this.element.querySelector('#UsernameHelpId') as HTMLElement;

    if (usernameElement) {
      let username = usernameElement.value;

      if (username.length < 5) {
        if (helpId) {
          helpId.className = 'form-text text-danger visible'; // Hiển thị thông báo lỗi
        }
      } else {
        if (helpId) {
          helpId.className = 'form-text text-muted invisible';
        }
        sessionStorage.setItem('username', username); // Lưu tên người dùng vào sessionStorage
        form.submit();
      }
    }
    
  }
    }