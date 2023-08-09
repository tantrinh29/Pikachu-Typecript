import autobind from "autobind-decorator";
import { validate} from 'class-validator';
import { User } from '../models/User';
export class UserController{//xử lí khi bấm vào nút play game
    constructor(public element: HTMLElement){
        const button = element.querySelector('#play');

        console.log("UserController constructor");

        button?.addEventListener('click', this.processPlayButtonClick);
        //phương thức xử lí sự kiên cho nút play game thì sẽ xử lí processPlayButtonClick
    }
    @autobind
    processPlayButtonClick(event: Event){
        event.preventDefault();//ngăn các phương thức xử lí sự kiện ngầm định của nút

        console.log("event .....");

        const form = this.element.querySelector('form') as HTMLFormElement;
        //tìm kiếm thành phần trên html
        const usernameElement = this.element.querySelector('#username') as HTMLInputElement;
        const helpId = this.element.querySelector('#UsernameHelpId');

        if (usernameElement){
            let user: User = new User(usernameElement.value);

            validate(user).then(error => {//kiểm tra ràng buộc dữ liệu của trường user
                if (error.length>0){
                    if (helpId){
                        helpId.className = 'form-text text-muted visible';
                    }
                }else{
                    form.submit();
                }
            })
        }
    }
}