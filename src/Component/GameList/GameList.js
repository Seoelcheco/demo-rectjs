import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import { myFirestore} from '../../Config/MyFirebase'
import './GameList.css'
import {AppString} from './../Const'
import { reject } from 'q';


export default class GameList extends React.Component {
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
        this.listGame = []
       
    }
    componentDidMount(){
        this.actualList()
    }
    componentDidUpdate(prevProps, prevState){

    }

    actualList = async () => {
      await myFirestore.collection('game').onSnapshot(snapshot =>{
            let result= snapshot.docChanges()
            this.setState({isLoading: false})
            if(this.listGame.length===0){
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
                if(array[i].doc.data().creator === this.state.view[j].doc.data().creator&&
                array[i].doc.data().invited === this.state.view[j].doc.data().invited){
                    aux.push(array[0])
                    update=update+1
                }else{
                    aux.push(this.state.view[j])
                }
            }
            if( update ===0){
                aux.push(array[0])
            }
        }
        this.setState({view:aux})
    }

    renderListGame = () => {
        this.listGame = [...this.state.view]
        if (this.listGame.length > 0) {
            let viewlistIvited = [ <h3>Game Invited<hr/></h3>]
            let viewListeCreator = [<h3>Game Created<hr/></h3>]
            this.listGame.forEach((item, index) => {
                if (item.doc.data().invited === this.currentUserId) {
                    viewlistIvited.push(
                        <button
                            key={index}
                            className={
                                this.state.currentGame &&
                                this.state.currentGame.invited === item.doc.data().invited
                                    ? 'viewWrapItemFocused'
                                    : 'viewWrapItem'
                            }
                            onClick={() => {
                                this.setState({currentGame: item.doc.data()})
                                this.handleClick(item.doc.data())
                            }}>   
                            <div className="viewWrapContentItem">
                            <span className="textItem">{`Creator: ${
                                item.doc.data().nameCreator }`}</span>
                            <span className="textItem">{`Playable?: ${
                                item.doc.data().acept && item.doc.data().itsPlay? "Avalible" : 'Not available'
                                }`}</span>
                            <span className="textItem">{`Vs: ${
                                item.doc.data().nameInvited }`}</span>
                            </div>
                        </button>
                    )
                }
                else if(item.doc.data().creator === this.currentUserId){
                    viewListeCreator.push(
                        <button
                            key={index}
                            className={
                                this.state.currentGame &&
                                this.state.currentGame.creator === item.doc.data().creator
                                    ? 'viewWrapItemFocused'
                                    : 'viewWrapItem'
                            }
                            onClick={() => {
                                this.setState({currentGame: item.doc.data()})
                                this.handleClick(item.doc.data())
                            }}>   
                            <div className="viewWrapContentItem">
                            <span className="textItem">{`Creator: ${
                                item.doc.data().nameCreator }`}</span>
                            <span className="textItem">{`About me: ${
                               item.doc.data().acept && item.doc.data().itsPlay? "Avalible" : 'Not available'
                                }`}</span>
                            <span className="textItem">{`Vs: ${
                                item.doc.data().nameInvited }`}</span>
                            </div>
                        </button>
                    )
                }
            })
            viewlistIvited.push(viewListeCreator)
            return (viewlistIvited)
        } else {
            return null
        }

    }
    handleClick(i) {
        this.props.updateGame(i);
      }
    render() {
        return (
            <div > 
                <div className="body">
                    <div > 
                        {this.renderListGame()}
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

