import autobind from "autobind-decorator";
import { GameItem, GameItemStatus } from "../models/GameItems";
import _, { remove } from 'lodash';
export class GameController{
    private score: number = 0;
    private items: GameItem[] = [];
    private username: string | null;
    private startTime: number = 0;
    private gameTime: number = 0;
    private countdown: number = 150; // Thời gian đếm ngược ban đầu
    constructor(items: GameItem[], public element: HTMLElement) {
       this.initGame(items);

       this.startGameTime();
        this.updateGameTime(); // Hiển thị thời gian ban đầu
        setInterval(() => {
            this.updateCountdown();
        }, 1000); // Cập nhật thời gian mỗi giây
       this.username = sessionStorage.getItem('username'); // Lấy tên người dùng từ sessionStorage
    this.renderUsername(); // Gọi hàm renderUsername ở đây để hiển thị tên người dùng

    }
    startGameTime(): void {
      this.startTime = Date.now();
  }
  restartGame(): void {
    this.score = 0;
    this.gameTime = 0;
    this.countdown = 150;
    this.reinitGame();
    this.updateScoreDisplay();
    this.updateGameTime();
}


// startNewRound(): void {
//   this.reinitGame();
//   this.gameTime = 0; 
//   this.updateGameTime(); // Reset the game time for the new round
//   this.renderGameBoard(); // Render the game board for the next round
 
// }


    renderUsername(): void {
      const usernameElement = document.querySelector('.username') as HTMLElement;
      console.log(usernameElement, this.username);
  
      if (usernameElement && this.username) {
        usernameElement.textContent = `Welcome, ${this.username}!`;
      }
    }
    initGame(initData: GameItem[]): void{
      for (const item of initData) {
        this.items.push(item);
        this.items.push(new GameItem(item.id, item.divId, item.image));
      }
      let id: number =1;
      this.items.forEach(it =>{
        it.status = GameItemStatus.Close;
        it.divId = 'd' + id;
        id++;
      });
    }
    reinitGame(): void{
      this.items.forEach(item=>{
        item.imageElement = null;
        item.status = GameItemStatus.Close;
      });
      this.shuffle();
    }

    
    isWinGame(): boolean{
      return this.items.filter(item => item.status === GameItemStatus.Open).length 
      === this.items.length;

      
    }
    renderHTML(rootElement: HTMLElement, item: GameItem){
    //     <div class="col-2 gameItem m-2 p1 text-center">
    //     <img src="/image/img1.png" alt="" class="img-fluid">
    // </div>

    const divItem: HTMLDivElement = document.createElement('div');
    divItem.className = 'col-2 gameItem m-2 p1 text-center';
    divItem.id = item.divId;
    divItem.addEventListener('click', this.processGameItemClicked);
    const imgItem: HTMLImageElement = document.createElement('img');
    imgItem.src =  `image/${item.image}`;
    imgItem.className = 'img-fluid invisible';

    item.imageElement = imgItem;
    divItem.appendChild(imgItem);
    rootElement.appendChild(divItem);
    }
    renderResetButton(rootElement: HTMLElement):void{
       let button: HTMLButtonElement = rootElement.querySelector('button#reset') as HTMLButtonElement;
       if(button){
        button.addEventListener('click', this.processResetButtonClicked);
       }
    }
    renderGameBoard(): void{
       this.shuffle();

       let boardDiv: HTMLElement = this.element.querySelector('#board') as HTMLElement;

       if(boardDiv){
        this.items.forEach(it =>{
            this.renderHTML(boardDiv, it);
        });
       }
       this.renderResetButton(this.element);
    }
    isMatched(id: number, imgElement: HTMLIFrameElement): boolean{
       let openedItems: GameItem[] = this.items.filter(item=>{
        if(item.status === GameItemStatus.Open && !item.isMatched){
          return item;
        }
       });
       if(openedItems.length == 2){
        let checkMatchedFilter = openedItems.filter(item=> item.id == id);

        if(checkMatchedFilter.length < 2){
          openedItems.forEach(item=>{
            this.changeMatchedBackground(item.imageElement, false);
          
          });
          setTimeout(()=>
          openedItems.forEach(item=>{
            if(item.imageElement){
              item.imageElement.className = 'img-fluid invisible';
              item.status = GameItemStatus.Close;
              item.isMatched = false;

              this.changeMatchedBackground(item.imageElement);
            }
          }), 600);
        }else{
          openedItems.forEach(item=>{
            item.isMatched = true;
            this.changeMatchedBackground(item.imageElement);
            
          });
          this.increaseScore();
          return true;
        }
       }
       return false;
    }

   
   
    changeMatchedBackground(imgElement: HTMLElement | null, isMatched: boolean = true){
        if(imgElement?.parentElement){
          if(isMatched){
            imgElement.parentElement.className = 'col-2 gameItem m-1 p-1 text-center';
            
          }else{
            imgElement.parentElement.className = 
            'col-2 gameItem m-1 p-1 text-center unmatched';
          }
        }
    }
 
    @autobind
    processGameItemClicked(event: Event){
       let element : HTMLElement | null = event.target as HTMLElement;
       if(element.tagName === 'img'){
        element = element .parentElement;
       }
       for(const item of this.items){
        if(item.divId == element?.id && !item.isMatched
          && item.status === GameItemStatus.Close){
            item.status = GameItemStatus.Open;

            let imgElement = element.querySelector('img');
            if(imgElement){
              imgElement.className = 'img-fluid visible';
              if (this.isMatched(item.id, imgElement)) {
                this.checkGameCompletion(); // Kiểm tra kết thúc trò chơi sau mỗi lần chọn hình
              };
              
            }
          }
       }
    }
    @autobind
    processResetButtonClicked(event: Event): void{
      this.reinitGame();
      const boardElement: HTMLElement = document.querySelector('#board') as HTMLElement;

      boardElement.innerHTML = '';

      this.renderGameBoard();
    }
    shuffle(){
        this.items = _.shuffle(this.items);
    }
    // // kiểm tra kết thúc game
    checkGameCompletion(): void {
      if (this.isWinGame()) {
        alert('Chúc mừng bạn thắng trò chơi và bắt đầu lại');
          // this.increaseScore(); // Increase score after winning
          this.updateScoreDisplay(); // Update the score display
          // this.startNewRound(); // Start a new round after winning
      }
  }

  // // Tăng điểm
  increaseScore(): void {
    this.score = this.score + 20; // Tăng điểm lên 20
    this.updateScoreDisplay(); // Cập nhật hiển thị điểm trên giao diện
  }

  // // Cập nhật hiển thị điểm trên giao diện
  updateScoreDisplay(): void {
    const scoreElement = document.querySelector('.countGame') as HTMLElement;
    if (scoreElement) {
      scoreElement.textContent = this.score.toString(); // Hiển thị điểm mới
    }
  }

  // Cập nhật mốc thời gian từ khi bắt đầu trò chơi
  
  updateGameTime(): void {
    const timeElement = document.querySelector('.time') as HTMLElement;
    if (timeElement) {
        timeElement.textContent = this.gameTime.toString() + ' giây';
    }
}
updateCountdown(): void {
  const timeElement = document.querySelector('.time') as HTMLElement;
  if (timeElement) {
      timeElement.textContent = this.countdown.toString() + ' giây';
      this.countdown--; // Giảm thời gian đếm ngược mỗi giây
      if (this.countdown < 0) {
          this.gameOver(); // Xử lý hành động khi hết thời gian
      }
  }
}
gameOver(): void {
  alert('Hết thời gian! Trò chơi đã kết thúc.'); // Hiển thị thông báo
  this.restartGame(); // Bắt đầu lại trò chơi khi kết thúc
}
}