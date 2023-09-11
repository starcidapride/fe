import { initializeApp } from 'firebase/app'

const firebaseConfig = {
    apiKey: 'AIzaSyDBHGocNYdnhISZNzi4XBndtjzGL7hqO88',
    authDomain: 'supple-century-363201.firebaseapp.com',
    projectId: 'supple-century-363201',
    storageBucket: 'supple-century-363201.appspot.com',
    messagingSenderId: '577757506042',
    appId: '1:577757506042:web:ba57cb7724b70280f31c43',
    measurementId: 'G-BXPZL0Z2F4'
}



const initializeFirebase = () => initializeApp(firebaseConfig)

export default initializeFirebase