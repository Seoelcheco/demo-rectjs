import React, {Component} from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { myFirestore} from '../../Config/MyFirebase'
import {AppString} from './../Const'

export default class Game extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      time : 0,
      score : 0,
      itPlay : false,
      word: '_______',
      round:0,
      winner:'',
      canPlay:false,
      limit:0,
      aux:null
      
    }
    this.creator = null
    this.length = 0
    this.inputValue =''
    this.listWord = []
    this.textRef=React.createRef()
    this.id = localStorage.getItem(AppString.ID)
    this.nickname = localStorage.getItem(AppString.NICKNAME)
    this.currentGame = this.props.currentGame
    this.listGame=[]
    this.winner=''
  }
  componentDidMount() {
    this.creator=(this.id===this.currentGame)
    this.typeUser();
    this.getListWord();
    setInterval(this.checkStatus(), 300);
    this.checkLogin();
    this.getGame();
    this.setState({aux:this.currentGame.creator===this.id})
  }

  getNum =async ()=>
    {
      if(this.creator){
      let rand = this.chooseNumber();
      this.currentGame.listNumber = rand
      await myFirestore
       .collection('game')
       .doc(this.currentGame.id)
       .update({listNumber: this.currentGame.listNumber})
    }
  }
  autoUpdate= async()=>{
    if(this.creator){
      const creator = {
      itsPlay:this.listGame.itsPlay,
      creatorPoint: this.listGame.creatorPoint,
      finishC:this.listGame.finishC,
      }
      await myFirestore
       .collection('game')
       .doc(this.currentGame.id)
       .update(creator)
   }else{
    const invited = {
      acept:this.listGame.acept,
      invitedPoint:this.listGame.invitedPoint,
      finishI:this.listGame.finishI,
     }
      await myFirestore
       .collection('game')
       .doc(this.currentGame.id)
       .update(invited)
    }
  
  }
  updateWinner= async(result)=>{
        await myFirestore
         .collection('game')
         .doc(this.currentGame.id)
         .update({winner:result})
    }
  chooseNumber(){
    const numRand=[];
    for(let i=0; i<this.listWord.length;i++){
      const randIndex = Math.floor(Math.random() * this.listWord.length);
      numRand.push(randIndex);
    }
    return numRand;
  }

  componentWillReceiveProps(newProps) {
    if (newProps.currentGame) {
        this.currentGame = newProps.currentGame
        this.getListWord()
        this.setState({aux:this.currentGame.creator===this.id})
    }
  }
  componentWillUnmount() {
  clearInterval(this.interval);
  clearInterval(this.interval2);
  }
  componentDidUpdate(){
    clearInterval(this.interval);
    clearInterval(this.interval2);
    this.interval = setInterval(
      () => this.countdown(), 1000);
    this.interval2= setInterval(
      () =>  this.checkStatus(),300);
  }
  comparePoint=  ()=> {
    const creator =  this.listGame.creatorPoint;
    const invited =  this.listGame.invitedPoint;
    if(creator >invited)
      this.listGame.winner=this.listGame.nameCreator
    if(creator<invited)
      this.listGame.winner = this.listGame.nameInvited
    if(creator===invited)
     this.listGame.winner='is a tie'
  }
  getListWord = async () => {
    const result = await myFirestore.collection('word').get()
     if (result.docs.length > 0) {
        this.listWord = [...result.docs]
    }
    this.listWord =(this.listWord[0].data().contend)
    this.getNum();
  }
  getGame =  () =>{
     myFirestore.collection('game').onSnapshot(snapshot =>{
      let result = snapshot.docChanges()
      result.forEach( (childSnap )=>{
        if(childSnap.doc.data().id===this.currentGame.id){
          this.listGame=childSnap.doc.data()
          this.setState({
            canPlay:(this.listGame.acept&&this.listGame.itsPlay),
          })
        }
      });
      }
    )
  }
  
  typeUser =  ()=>{
    const comp =  this.currentGame.creator
    if(comp===this.id)
      this.creator = true
    else
      this. creator = false
  }
  updateScore = async()=>{
    if(this.creator)
      this.listGame.creatorPoint =this.state.score
    else
      this.listGame.invitedPoint =this.state.score
    
  }
  updateGame = async(boolean)=>{
    if(this.creator){
      this.listGame.finishC = boolean
    }else{
      this.listGame.finishI = boolean
    } 
  }
  forceWinner(){
   console.log('force')
    this.updateWinner(this.nickname)
  }
  

  declareWinner =  async() =>{
    const finish = this.currentGame.finishC && this.currentGame.finishI
    await this.comparePoint()
    
    for(let i=0;i<5;i++){
      if(finish){
        await this.updateWinner(this.listGame.winner);
      }
      if(!this.currentGame.finishI) {
        await setTimeout(()=>{
          i===4?this.forceWinner():
          console.log('await'+i)
        },5000)
      if(!this.currentGame.finishC){
        await setTimeout(()=>{
          (i===4 &&!finish )?this.forceWinner():
          console.log('await creator'+i)
        },5000)
      }
      }
    }
    this.autoUpdate()
    this.finishGame()
  }
  

  countdown() {
    if (this.state.time > 0) {
      this.setState(prevState => ({
        time: prevState.time -1
      }));
      } else {
      this.setState(()=>({
        itPlay : false}));
      } 
  }
  checkLogin = () => {
    if (!localStorage.getItem(AppString.ID)) {
        this.setState({isLoading: false}, () => {
            this.props.history.push('/')
        })
    }
    
  }
  checkStatus= ()=> {
    
    if(this.state.itPlay){
      this.autoUpdate()
      if (this.state.round < 10 && this.state.time > 0)  
      {
        if (this.state.word === this.pl) {
        this.setState({
          score: this.state.score + 1 ,
          time: 5,
          round: this.state.round + 1
        })
        this.onContiue();
        }
      }else if (this.state.time === 0 & this.state.round < 10){
        this.setState({
          time: 5,
          round: this.state.round + 1
        })
        this.onContiue();
      }else if (this.state.round >=10){
        this.updateGame(true);
        this.textRef.current.value = '';
        this.inputValue="Espere al oponente";
        this.setState({itPlay:false})
        this.autoUpdate()
         setTimeout(()=>{
          this.declareWinner()},5000)
        }
      
    }
  }
  finishGame= async()=>{
    this.setState({time : 0,
      score : 0,
      itPlay : false,
      word: '_______',
      round:0,
      canPlay:false})
    await myFirestore
       .collection('game')
       .doc(this.currentGame.id)
       .update({
         itsPlay:true,
         acept:true,
         finishI: false,
         FinishC: false,
       })
    this.inputValue ='Fin del juego, Vuelva a retar al oponente'
  }  

  onChange(e){
    this.pl =e.target.value
  }
  onContiue() {
    const newWord= this.listWord[this.currentGame.listNumber[this.state.round]]
    this.setState({
      word:newWord,
      time:5,
    })
    this.textRef.current.value = '';
    this.updateScore()
  }

  sendChallenge= async ()=>{
    this.currentGame.itsPlay=true
    await this.autoUpdate()
  }
  acceptChallenge= async ()=>{
    this.currentGame.acept=true
    await this.autoUpdate()
  }
  renderChallenge=()=>{
    if(this.state.aux){
    return (
      <button onClick={this.sendChallenge.bind(this)} disabled= {this.currentGame.acept}>sendChallenge</button>
      )
    }else{
      return (<button onClick={this.acceptChallenge.bind(this)} disabled= {this.acceptChallenge.itsPlay}>acceptChallenge</button>)
    }
  }
  handleClick() {
    this.currentGame.itsPlay=true
    const newWord= this.listWord[this.currentGame.listNumber[this.state.round]]
    this.setState({
      word: newWord,
      time:5,
      itPlay:true,
      score:0,
      round:0
    });
    this.textRef.current.focus();
  }

  console(){
    console.log(this.listGame)
  }
  render(){

    return (
      <div>
        <h1>{this.state.itPlay ? 'TypeFast' : 'Click "Star Over" to begin'}</h1>
        {this.renderChallenge()}
        <section > nickname: {this.nickname}
        <ol>
          <li>Round {this.state.round}</li>
          <li>Score: {this.state.score}</li>
          <li >{this.state.word}</li>
          <li>{this.inputValue}</li>
          <li>{this.state.itPlay? 'Escriba rapido':'Espere al rival'}</li>
        </ol>
        </section>
        
        <label >Seconds : {this.state.time}</label>
        <button 
          onClick={this.handleClick.bind(this)} 
          > START OVER
        </button>
        <button 
          onClick={this.console.bind(this)} > CONSOLE
        </button>
        <hr/>
        <input
          id='myText'
          type='text'
          onChange={this.onChange.bind(this)}
          ref={this.textRef} 
        /> 
        
        <h1 >The last Winner : {this.listGame.winner}</h1>
        <h3> {this.currentGame.nameCreator} </h3>
        <h4>VS</h4>
        <h3>{this.currentGame.nameInvited}</h3> 
        {this.state.aux?'true':'false'}
      </div>
    )
  }
}