import {Component, OnInit, ViewEncapsulation, ViewChild, ElementRef} from '@angular/core';
import * as io from 'socket.io-client';

@Component({
  selector: 'chat',
  styleUrls: [
    './chat.component.css'
  ],
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {
  @ViewChild('usera') userElement: ElementRef;

  private socket: any;
  public oldUserName: string = 'Anonymous' + this.getRandomInt(100, 999);
  public userName = this.oldUserName;
  public selUser: UserModel;
  public displayDetails = false;
  public message: string;
  public messages: ChatModel[] = [];
  public userMessages: ChatModel[] = [];
  public users: UserModel[] = [];

  constructor() {
    this.socket = io(process.env.CHATSERVER || "http://chatserver-181203.appspot.com/");
    
    let user = new UserModel();
    user.name = this.userName;
    this.socket.emit('new_user', user);
    this.displayDetails = false;
    
    this.socket.emit('get_users');

    this.socket.on('connect', () => { });

    this.socket.on('user_created', (user: UserModel) => {
        if(this.userName != user.name) {
          this.users.push(user);
        }
    });

    this.socket.on('user_changed', (userName: string, oldUserName: string) => {
        if(this.userName != userName) {
            let duser = this.users.find(a => a.name == oldUserName);
            duser.name = userName; 
        }
    });

    this.socket.on('message_received', (data: ChatModel) => {
        if(data.to) {
          this.notifyUser(data.from);
        }
        this.messages.push(data);
        this.updateMessages();
    });

    this.socket.on('users_list', (users: UserModel[]) => {
      this.users = users.filter(a => a.name != this.userName);
    });
  }

  ngOnInit() {
    this.socket.connect();
  }

  onUserChange() {
    if(this.userName != this.oldUserName) {
      this.socket.emit('user_change', this.userName, this.oldUserName);
      this.oldUserName = this.userName;
    }
  }

  onSelect(selUser: UserModel) {
    if(selUser) {
      selUser.notify = false;
    }
    this.selUser = selUser;
    this.updateMessages();
  }

  onSend() {
    if(this.message) {
      let message = new ChatModel();
      message.from = this.userName;
      if(this.selUser) {
        message.to = this.selUser.name;
        message.socket = this.selUser.socket;
      }
      message.message = this.message;
      message.datetime = Date.now();
      this.messages.push(message);
      this.userMessages.push(message);
      this.socket.emit('new_message', message);
      this.message = "";
    }
  }

  private updateMessages() {
    if(this.selUser) {
      this.userMessages = this.messages.filter(a => a.from == this.selUser.name && a.to);
    }
    else {
      this.userMessages = this.messages.filter(a => !a.to);
    }
  }

  private getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  private notifyUser(userName: string) {
    let user = this.users.find(a => a.name == userName);
    if(!this.selUser) {
      user.notify = true;
    }
    else {
      if(this.selUser.name != userName) {
        user.notify = true;
      }
    }
  }
}

export class ChatModel {
  from: string;
  to: string;
  socket: string;
  message: string;
  datetime: number;
}

export class UserModel {
  name: string;
  socket: string;
  notify: boolean = false;
}

