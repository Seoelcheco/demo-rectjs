import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import 'react-toastify/dist/ReactToastify.css'
import './WelcomeBoard.css'
import { myFirestore, myFirebase} from '../../Config/MyFirebase'
import {AppString} from './../Const'
import { async } from 'q';
import UserList from '../UserList/UserList'


export default class WelcomeBoard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            currentPeerUser: null,
        }
    this.currentUserId = localStorage.getItem(AppString.ID)
    this.currentUserNickname = localStorage.getItem(AppString.NICKNAME)
    this.changeUser = this.changeUser.bind(this);
    }
    componentDidMount() {

    }

    componentWillUnmount(){
    }
    updateUser(){
        this.setState({currentPeerUser:this.user})
    }

    createRoom=async()=>{
    const vs = this.currentUserId+'vs'+this.state.currentPeerUser.id
    myFirestore
        .collection('game')
        .doc(vs)
        .set({
            id:vs,
            acept:true,
            creator: this.currentUserId,
            invited: this.state.currentPeerUser.id,
            creatorPoint: 0,
            invitedPoint:0,
            nameCreator:this.currentUserNickname,
            nameInvited:this.state.currentPeerUser.nickname,
            finishC:false,
            finishI:false,
            listNumber:[],
            winner:'',
            itsPlay: true

        })
  
    /*
        myFirestore
        .collection('word')
        .doc('list')
        .set({
           contend: [
                'hat',
                'river',
                'lucky',
                'statue',
                'generate',
                'stubborn',
                'cocktail',
                'runaway',
                'joke',
                'developer',
                'establishment',
                'hero',
                'javascript',
                'nutrition',
                'revolver',
                'echo',
                'siblings',
                'investigate',
                'horrendous',
                'symptom',
                'laughter',
                'magic',
                'master',
                'space',
                'definition'
            ]
            
        })*/
    }
   
    changeUser(newUser) {
        this.setState({
          currentPeerUser: newUser
        });
    }
    console(){
        console.log(this.state.currentPeerUser)
    }
    render() {
        return (
            <div className="viewWelcomeBoard">
            <span className="textTitleWelcome">{`Welcome, ${
            this.props.currentUserNickname
            }`}</span>
                <img
                    className="avatarWelcome"
                    src={this.props.currentUserAvatar}
                    alt="icon avatar"
                />
                <div className="listUser"><UserList  updateUser={this.changeUser} /></div>
                <span className="textDesciptionWelcome">
          <button onClick={this.createRoom.bind(this)} disabled={this.state.currentPeerUser===null} > createRoom
          </button>
          <button onClick={this.console.bind(this)}  > console
          </button>
        </span>
        {this.state.isLoading ? (
                    <div className="viewLoading">
                        <ReactLoading
                            type={'spin'}
                            color={'#203152'}
                            height={'3%'}
                            width={'3%'}
                        />
                    </div>
                ) : null}
            </div>
        )
    }
}
