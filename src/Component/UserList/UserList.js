import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import { myFirestore} from '../../Config/MyFirebase'
import './UserList.css'
import {AppString} from './../Const'
import { reject } from 'q';


export default class UserList extends React.Component {
    constructor(props) {
        super(props)
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            isLoading: true,
            currentPeerUser: null,
            view:[]
        }
        this.currentUserId = localStorage.getItem(AppString.ID)
        this.currentUserNickname = localStorage.getItem(AppString.NICKNAME)
        this.listUser = []
       
    }
    componentDidMount(){
        this.actualList()
    }
    componentDidUpdate(prevProps, prevState){

    }

    actualList = async () => {
      await myFirestore.collection(AppString.NODE_USERS).onSnapshot(snapshot =>{
            let result= snapshot.docChanges()
            this.setState({isLoading: false})
            if(this.listUser.length===0){
                this.setState({view: result})
            }else{
                this.remplaceList(result)
            }
        })
    }
    remplaceList =  async (array)=>{
        let update=0
        const aux = []
        for(let i = 0; i<array.length;i++){
            for(let j=0; j<this.state.view.length;j++){
                if(array[i].doc.data().id === this.state.view[j].doc.data().id){
                    aux.push(array[0])
                    update=update+1
                }else{
                    aux.push(this.state.view[j])
                    console.log(aux)
                }
            }
            if( update ===0){
                aux.push(array[0])
            }
        }
        this.setState({view:aux})
    }
    handleClick(i) {
        this.props.updateUser(i);
      }

    renderListUser = () => {
        this.listUser = [...this.state.view]
        if (this.listUser.length > 0) {
            let viewListUser = []
            this.listUser.forEach((item, index) => {
                if (item.doc.data().id !== this.currentUserId) {
                    viewListUser.push(
                        <button
                            key={index}
                        
                            className={
                                this.state.currentPeerUser &&
                                this.state.currentPeerUser.id === item.doc.data().id
                                    ? 'viewWrapItemFocused'
                                    : 'viewWrapItem'
                            }
                            onClick={() => {
                                this.setState({
                                    currentPeerUser: item.doc.data(),
                                   })
                                this.handleClick(item.doc.data())
                            }}
                        >
                            <div className="viewWrapContentItem">
                            <span className="textItem">{`Nickname: ${
                                item.doc.data().nickname
                                }`}</span>
                                <span className="textItem">{`About me: ${
                                   item.doc.data().aboutMe ?item.doc.data().aboutMe : 'Not available'
                                    }`}</span>
                            </div>
                        </button>
                    )
                }
            })
            return viewListUser
        } else {
            return null
        }
    }
    

    render() {
        return (
            <div > 
                <div className="body">
                    <div > 
                        <div >{this.renderListUser()}</div>
                    </div>
                </div>
                
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

