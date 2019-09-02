import React, {Component} from 'react'
import 'react-toastify/dist/ReactToastify.css'
import {myFirebase, myFirestore} from '../../Config/MyFirebase'


class functionDB extends Component{
  constructor(){
    this.state = {
      time : 0,
      score : 0,
      itPlay : false,
      word: '_______',
      round:0,
    }
  }
  chooseNumber(){
    const numRand=[];
    for(let i=0; i<this.listWord.length;i++){
      const randIndex = Math.floor(Math.random() * this.listWord.length);
      numRand.push(randIndex);
    }
    return numRand;
  }
    createRoom(){
        const roomGame= {
        creator: this.id,
        creatorPoint: 0,
        invited: this.currentPeerUser.id,
        invitedPoints:0,
        numRandom:[],
        canPlay: false,
        finishC: false,
        finishI:false,
        acept:false,
        winner:null
    }
        myFirestore
            .collection('game')
            .doc(this.id)
            .set(roomGame)
  }
  
  comparePoint=  ()=> {
    const creator =  this.listGame.creatorPoint;
    const invited =  this.listGame.invitedPoints;
    if(creator >invited)
      this.winner=this.nickname
    if(creator<invited)
      this.winner = this.currentPeerUser.nickname
    if(creator===invited)
     this.winner='is a tie'
  }
  getListWord = async () => {
    const result = await myFirestore.collection('word').get()
     if (result.docs.length > 0) {
        this.listWord = [...result.docs]
    }
    this.listWord =(this.listWord[0].data().contend)
    this.updateNum(this.chooseNumber());

  }
  getListGame = async () =>{
    const result = await myFirestore.collection('game').get()
     if (result.docs.length > 0) {
        this.listGame = [...result.docs]
    }
    this.listGame =(this.listGame[0].data())
  }
  getTypeuser =  ()=>{
    const comp =  this.listGame.creator
    if(comp===this.id)
      return true
    else
      return false
  }
  getFinishGame =  ()=>{
    if(this.getTypeuser())
      return this.listGame.finishI
    else
      return this.listGame.finishC
  }
  updateNum = async(array)=>{
   if(this.getTypeuser){
    await myFirestore
      .collection('game')
      .doc(this.id)
      .update({numRandom :array})
      .then(data=>{
        array.forEach(element => {
          this.listNumber.push(element)
        });;
      })}
  }
  updateScore = async()=>{
    if(this.getTypeuser()){
      await myFirestore
       .collection('game')
       .doc(this.id)
       .update({creatorPoint :this.state.score})
    }else{
      await myFirestore
       .collection('game')
       .doc(this.id)
       .update({invitedPoints :this.state.score})
    }
  }
  updateGame = async(boolean)=>{
    if(this.getTypeuser()){
      await myFirestore
       .collection('game')
       .doc(this.id)
       .update({finishC :boolean})
    }else{
      await myFirestore
       .collection('game')
       .doc(this.id)
       .update({finishI :boolean})
    } 
  }
  updateWinner = async () =>{
    await myFirestore
       .collection('game')
       .doc(this.id)
       .update({winner :this.winner})
  }
  

  
  
  render(){

    return (
      <div>
        
      </div>
    )
  }
  
}
export {createRoom} 