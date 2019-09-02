import firebase from 'firebase'
import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import {myFirebase, myFirestore} from '../../Config/MyFirebase'
import {AppString} from './../Const'
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth"
import { async } from 'q';


class Login extends Component { 
  state = {
    isSignedIn: false,
    success:false,
    user:null
  };
  uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        customParameters: {
          prompt: 'select_account'
        }
      },
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
          type: 'image', // 'audio'
          size: 'invisible', // 'invisible' or 'compact'
          badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
        },defaultCountry: 'BO'
      },
    ],
    
    callbacks: {
      signInSuccessWithAuthResult: () => false
    }
  };

  componentDidMount() {
    this.checkLogin()
    this.setState({user:firebase.auth().currentUser})
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
        (user) => this.setState({isSignedIn: !!user})
    );
  }
  componentDidUpdate(prevProp,prevState){
    if(this.state.user !== firebase.auth().currentUser)
      this.saveUser()
  }
  checkLogin = () => {
    if (localStorage.getItem(AppString.ID)) {
        this.setState({isSignedIn: false}, () => {
            this.setState({isSignedIn: false})
            this.props.showToast(1, 'Login success')
            this.props.history.push('/profile')
        })
    } else {
        this.setState({isSignedIn: false})
    }
    }
  componentWillUnmount() {
    this.unregisterAuthObserver();
    
  }
  renderLogin=()=>{
    return(   
        <div>      
        <h1>My App</h1>
        <p>Welcome {firebase.auth().currentUser.phoneNumber}! You are now signed-in!</p>
        <a onClick={() => firebase.auth().signOut()}>Sign-out</a>

        </div> );
    }
  saveUser= async()=>{
    let user = firebase.auth().currentUser
    if (user) {
        const result = await myFirestore
            .collection(AppString.NODE_USERS)
            .where(AppString.ID, '==', user.uid)
            .get()
            if (result.docs.length === 0) {
            // Set new data since this is a new user
            if(user.phoneNumber!==null){
            let nickname=user.phoneNumber
            myFirestore
                .collection('users')
                .doc(user.uid)
                .set({
                    id: user.uid,
                    nickname: nickname,
                    aboutMe: '',
                    photoUrl: 'https://image.shutterstock.com/image-illustration/default-avatar-profile-icon-grey-260nw-1403430347.jpg'
                })
                .then(data => {
                    // Write user info to local
                    localStorage.setItem(AppString.ID, user.uid)
                    localStorage.setItem(AppString.NICKNAME, nickname)
                    localStorage.setItem(AppString.PHOTO_URL, 'https://image.shutterstock.com/image-illustration/default-avatar-profile-icon-grey-260nw-1403430347.jpg')
                    this.setState({isLoading: false}, () => {
                        this.props.showToast(1, 'Login success')
                        this.props.history.push('/profile')
                    })
                })
            }else{
              let nickname=user.displayName
              myFirestore
              .collection('users')
              .doc(user.uid)
              .set({
                  id: user.uid,
                  nickname: nickname,
                  aboutMe: '',
                  photoUrl: user.photoURL
              })
              .then(data => {
                  // Write user info to local
                  localStorage.setItem(AppString.ID, user.uid)
                  localStorage.setItem(AppString.NICKNAME, nickname)
                  localStorage.setItem(AppString.PHOTO_URL, user.photoURL)
                  this.setState({isLoading: false}, () => {
                      this.props.showToast(1, 'Login success')
                      this.props.history.push('/profile')
                  })
              })
            }
            } else {
            // Write user info to local
            localStorage.setItem(AppString.ID, result.docs[0].data().id)
            localStorage.setItem(
                  AppString.NICKNAME,
                  result.docs[0].data().nickname
              )
              localStorage.setItem(
                  AppString.PHOTO_URL,
                  result.docs[0].data().photoUrl
              )
              localStorage.setItem(
                  AppString.ABOUT_ME,
                  result.docs[0].data().aboutMe
              )
              this.setState({isLoading: false}, () => {
                  this.props.showToast(1, 'Login success')
                  this.props.history.push('/profile')
              })
        }
    } else {
      this.props.showToast(0, 'User info not available')
  }

   }
  option(){
      console.log(this.user)
  }
  render() {
    if (!this.state.isSignedIn) {
      return (
        <div>
          <h1>My App</h1>
          <p>Please sign-in:</p>
          <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
        </div>
        
      )
    }
    return (
        (   
            <div>      

            </div> 
        )
    );
  }
}

export default withRouter(Login)
