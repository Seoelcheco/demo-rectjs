
import React, {Component} from 'react'
import 'react-toastify/dist/ReactToastify.css'



export default class Game extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      itPlay : false,
    }
    this.time=this.props.time
  }

  componentWillUnmount() {
  clearInterval(this.interval);
  }
  componentDidUpdate(){
    clearInterval(this.interval);
    this.interval = setInterval(
      () => this.countdown(), 1000);
  }
  countdown() {
    if (this.time > 0) {
        this.time--;
    }
}


  render(){

    return (
      <div>
          Timer {this.time}
      </div>
    )
  }
}