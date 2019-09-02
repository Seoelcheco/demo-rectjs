import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import {myFirebase, myFirestore, myStorage} from '../../Config/MyFirebase'
import images from './../Themes/Images'
import {AppString} from './../Const'

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            isOpenDialogConfirmLogout: false,
            id: localStorage.getItem(AppString.ID),
            nickname: localStorage.getItem(AppString.NICKNAME),
            aboutMe: localStorage.getItem(AppString.ABOUT_ME),
            photoUrl: localStorage.getItem(AppString.PHOTO_URL)
        }
        this.newAvatar = null
        this.newPhotoUrl = ''
    }


    onChangeNickname = event => {
        this.setState({nickname: event.target.value})
            localStorage.setItem(AppString.NICKNAME, this.state.nickname)
          
 
    }

    onChangeAboutMe = event => {
        this.setState({aboutMe: event.target.value})
        localStorage.setItem(AppString.ABOUT_ME, this.state.aboutMe)
    }

    onChangeAvatar = event => {
        if (event.target.files && event.target.files[0]) {
            // Check this file is an image?
            const prefixFiletype = event.target.files[0].type.toString()
            if (prefixFiletype.indexOf(AppString.PREFIX_IMAGE) !== 0) {
                this.props.showToast(0, 'This file is not an image')
                return
            }
            this.newAvatar = event.target.files[0]
            this.setState({photoUrl: URL.createObjectURL(event.target.files[0])})
        } else {
            this.props.showToast(0, 'Something wrong with input file')
        }
    }

    uploadAvatar = () => {
        this.setState({isLoading: true})
        if (this.newAvatar) {
            const uploadTask = myStorage
                .ref()
                .child(this.state.id)
                .put(this.newAvatar)
            uploadTask.on(
                AppString.UPLOAD_CHANGED,
                null,
                err => {
                    this.props.showToast(0, err.message)
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                        this.updateUserInfo(true, downloadURL)
                    })
                }
            )
        } else {
            this.updateUserInfo(false, null)
        }
         this.props.history.push('/main')
    }

    updateUserInfo = (isUpdatePhotoUrl, downloadURL) => {
        let newInfo
        if (isUpdatePhotoUrl) {
            newInfo = {
                nickname: this.state.nickname,
                aboutMe: this.state.aboutMe,
                photoUrl: downloadURL
            }
        } else {
            newInfo = {
                nickname: this.state.nickname,
                aboutMe: this.state.aboutMe
            }
        }
        myFirestore
            .collection(AppString.NODE_USERS)
            .doc(this.state.id)
            .update(newInfo)
            .then(data => {
                localStorage.setItem(AppString.NICKNAME, this.state.nickname)
                localStorage.setItem(AppString.ABOUT_ME, this.state.aboutMe)
                if (isUpdatePhotoUrl) {
                    localStorage.setItem(AppString.PHOTO_URL, downloadURL)
                }
                this.setState({isLoading: false})
                this.props.showToast(1, 'Update info success')
            })
    }
    hideDialogConfirmLogout = () => {
        this.setState({
            isOpenDialogConfirmLogout: false
        })
    }

    onProfileClick = () => {
        this.props.history.push('/main')
    }
    onLogoutClick = () => {
        this.setState({
            isOpenDialogConfirmLogout: true
        })
    }
    render() {
        return (
            <div className="root">
                <div className>
                    <span>PROFILE</span>
                    <img
                        className="icProfile"
                        alt="An icon default avatar"
                        src={images.ic_default_avatar}
                        onClick={this.onProfileClick}
                    />
                    <img
                        className="icLogout"
                        alt="An icon logout"
                        src={images.ic_logout}
                        onClick={this.onLogoutClick}
                    />
                </div>
                <img width="100" height="100" className="avatar" alt="Avatar" src={this.state.photoUrl}/>

                <div className="viewWrapInputFile">
                    <img
                        className="imgInputFile"
                        alt="icon gallery"
                        src={images.ic_input_file}
                        onClick={() => this.refInput.click()}
                    />
                    <input
                        ref={el => {
                            this.refInput = el
                        }}
                        accept="image/*"
                        className="viewInputFile"
                        type="file"
                        onChange={this.onChangeAvatar}
                    />
                </div>

                <span className="textLabel">Nickname:</span>
                <input
                    className="textInput"
                    value={this.state.nickname ? this.state.nickname : ''}
                    placeholder="Your nickname..."
                    onChange={this.onChangeNickname}
                />
                <span className="textLabel">About me:</span>
                <input
                    className="textInput"
                    value={this.state.aboutMe ? this.state.aboutMe : ''}
                    placeholder="Tell about yourself..."
                    onChange={this.onChangeAboutMe}
                />

                <button className="btnUpdate" onClick={this.uploadAvatar}>
                    UPDATE
                </button>

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
                
                {/* Dialog confirm */}
                {this.state.isOpenDialogConfirmLogout ? (
                    <div className="viewCoverScreen">
                        {this.renderDialogConfirmLogout()}
                    </div>
                ) : null}

                {/* Loading */}
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
    doLogout = () => {
        this.setState({isLoading: true})
        myFirebase
            .auth()
            .signOut()
            .then(() => {
                this.setState({isLoading: false}, () => {
                    localStorage.clear()
                    this.props.showToast(1, 'Logout success')
                    this.props.history.push('/')
                })
            })
            .catch(function (err) {
                this.setState({isLoading: false})
                this.props.showToast(0, err.message)
            })
    }
    renderDialogConfirmLogout = () => {
        return (
            <div>
                <div className="viewWrapTextDialogConfirmLogout">
                    <span className="titleDialogConfirmLogout">Are you sure to logout?</span>
                </div>
                <div className="viewWrapButtonDialogConfirmLogout">
                    <button className="btnYes" onClick={this.doLogout}>
                        YES
                    </button>
                    <button className="btnNo" onClick={this.hideDialogConfirmLogout}>
                        CANCEL
                    </button>
                   
                </div>
            </div>
        )
    }
}

export default withRouter(Profile)
