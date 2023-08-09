import autobind from "autobind-decorator";
import { GameItem, GameItemStatus } from "../models/GameItem";
import _ from "lodash";
export class GameController{
    private items: GameItem[] = []; //luu danh sách các thanh phan trong game

    constructor(items: GameItem[], public element: HTMLElement){
        this.initGame(items); //khởi gán các thành phần hiển thị trong game
    }

    initGame(initData: GameItem[]): void{
        //gấp đôi số lượng truyền vào
        for (const item of initData) {
            this.items.push(item);
            this.items.push(new GameItem(item.id, item.divId, item.image));
        }

        
        let id: number = 1;
        this.items.forEach(it =>{
            it.status = GameItemStatus.Close;//xác định status của mỗi phần tử trong danh sách
            it.divId = 'd' + id;//khởi gán thuộc tính divId
            id ++;
        });
    }
    //gọi khi người dùng chơi lại khi kích vào nút reset game
    reinitGame(): void{
        this.items.forEach(item=>{
            item.imageElement = null;
            item.status = GameItemStatus.Close;
            item.isMatched = false;
        });
        this.shuffle();
    }
    //kiểm tra người dùng đã thắng game hay chưa
    isWinGame(): boolean{
        return this.items.filter(item => item.status === GameItemStatus.Open).length === this.items.length;
    }
    //hiển thị giao diện html với thành phần item truyền vào
    renderHTML(rootElement: HTMLElement, item: GameItem){
        // <div class="col-2 gameItem m-2 p-1 text-center">
        //     <img src="images/1.png" alt="" class="img-fluid">
        //  </div>
        //mô tả thẻ div và class
        const divItem : HTMLDivElement = document.createElement("div");
        divItem.className = 'col-2 gameItem m-2 p-1 text-center';
        divItem.id = item.divId;
        divItem.addEventListener("click", this.processGameItemClicked);

        //tạo ra thẻ img 
        const imgItem: HTMLImageElement = document.createElement('img');
        imgItem.src = `images/${item.image}`;
        imgItem.className = 'img-fluid invisible';


        item.imageElement = imgItem;
        divItem.appendChild(imgItem);
        rootElement.appendChild(divItem);
    }
    //hiển thị nút nhấn ở trong game
    renderResetButton(rootElement: HTMLElement): void{
        let button: HTMLButtonElement = rootElement.querySelector('#reset') as HTMLButtonElement;

        if (button){
            button.addEventListener('click', this.processGameItemClicked);
        }
    }
    //hiển thị toàn bộ nội dung ở trên game
    renderGameBoard(): void{
        this.shuffle();//xáo trộn thành phần danh sách trước khi hiển thị

        //tìm kiếm thẻ có id board
        let boardDiv: HTMLElement = this.element.querySelector('#board') as HTMLElement;

        if (boardDiv){
            //duyệt qua danh sách
            this.items.forEach(it =>{
                this.renderHTML(boardDiv, it);//hiển thị phần từ 
            });
        }
        this.renderResetButton(this.element);//hiển thị ra thông tin của nút reset
    }
    //kiểm tra thành phần với id và img có so khớp khi lật ra 
    isMatched(id: number, imgElement: HTMLImageElement): boolean{
        let openedItems : GameItem[] = this.items.filter(item => {
            if (item.status === GameItemStatus.Open && !item.isMatched){
                return item;
            }
        });

        if (openedItems.length == 2){
            let checkMatchedFilter = openedItems.filter(item => item.id == id);

            if (checkMatchedFilter.length == 2){
                openedItems.forEach(item =>{
                    this.changeMatchedBackground(item.imageElement, false);
                });
                setTimeout(() =>
                openedItems.forEach(item =>{
                    if (item.imageElement){
                        item.imageElement.className = 'img-fluid invisible';
                        item.status = GameItemStatus.Close;
                        item.isMatched = false;
                        
                        this.changeMatchedBackground(item.imageElement);
                    }
                }),600);
                
            }else{
                openedItems.forEach(item =>{
                    item.isMatched = true;
                    // item.imageElement?.parentElement?.remove();
                    this.changeMatchedBackground(item.imageElement);
                },600);
                return true;
            }
        }
        return false;
    }
    //thay đổi màu nền khi 2 thành phần k trùng nhau
    changeMatchedBackground(imgElement: HTMLImageElement | null, isMatched: boolean = true){
        if (imgElement?.parentElement){
            if (isMatched){
                imgElement.parentElement.className = 'col-2 gameItem m-1 p-1 text-center';
            }else{
                imgElement.parentElement.className = 
                'col-2 gameItem m-1 p-1 text-center unmatched';
            }
        }
    }
    @autobind
    //xử lí khi người dùng kích vào thành phần trong game
    processGameItemClicked(event: Event){
        let element : HTMLElement | null = event.target as HTMLImageElement;

        if(element.tagName === 'img'){
            element = element .parentElement;
        }

        for(const item of this.items){
            if (item.divId == element?.id && !item.isMatched && item.status === GameItemStatus.Close){
                item.status = GameItemStatus.Open;// đánh dấu thành phần được mở

                //lấy thành phần html được hiển thị trang html
                let imgElement =  element.querySelector('img');

                 
                if (imgElement){
                    imgElement.className = 'img-fluid visible';

                    this.isMatched(item.id, imgElement);
                }
            }
        }
    }
    // xử lí cho phép người dùng kích vào nút reset
    @autobind
    processResetButtonClicked(event: Event): void{
        this.reinitGame();

        const boardElement: HTMLElement = document.querySelector('#board') as HTMLElement;

        boardElement.innerHTML = '';

        this.renderGameBoard();
    }
    //cho phép xáo trộn nội dung của item
    shuffle(){
        this.items = _.shuffle(this.items);
    }
}