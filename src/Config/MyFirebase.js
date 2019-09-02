import firebase from 'firebase'

const config = {
  apiKey: "AIzaSyBlwZrWVCH_b0_nlqmRkqJLY-oybsxi3BQ",
    authDomain: "demo1-6fcaf.firebaseapp.com",
    databaseURL: "https://demo1-6fcaf.firebaseio.com",
    projectId: "demo1-6fcaf",
    storageBucket: "",
    messagingSenderId: "102285762772",
    appId: "1:102285762772:web:46712ab121466aeb"
}
firebase.initializeApp(config)
firebase.firestore().settings({
    timestampsInSnapshots: true
})

export const myFirebase = firebase
export const myFirestore = firebase.firestore()
export const myStorage = firebase.storage()
