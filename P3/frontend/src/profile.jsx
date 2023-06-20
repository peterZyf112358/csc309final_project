import React, { useState, useEffect } from "react";
import "./account.css";
import Button from 'react-bootstrap/Button';
import Locbar from "./navbar";
import Footer from "./footer";
import { useParams } from "react-router-dom";
import { apiUrl } from "./constants";
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import UserContext from "./context/userContext";
import UserComments from "./comments/UserComments";

function Profile(){
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [changeAvatar, setChangeAvatar] = useState(null);
    const [rating, setRating] = useState(0);
    const userId = sessionStorage.getItem("user_id");
    const [avatarChange, setAvatarChange] = useState(false);
    const { userID } = useParams();
    const [propData, setPropData] = useState([]);
    const [propPage, setPropPage] = useState(null);
    const [propNext, setPropNext] = useState(true);
    const [totalProp, setTotalProp] = useState(0);
    const [canSee, setCanSee] = useState(null);
    const { user, setUser } = useContext(UserContext);

    useEffect(() => {
        fetchPropData();
      }, [propPage]);

    const fetchPropData = () => {
        if(propPage !== null && propPage !== 1){
        fetch(`${apiUrl}property/getProperty/${userID}/?page=${propPage}`, {
          method : "GET",
        })
          .then(response => response.json())
          .then(data => {
            var newData = [];
            let count = data.count;
            setTotalProp(count);
            if(count >= propPage * 10){
              count = 10;
            }else{
              count = count % 10;
            }
            for(let i = 0; i < count; i++){
              if(!newData.includes(data.results[i])){
                newData.push(data.results[i]);
              }
            }
            setPropData(prevData => [...prevData, ...newData]);
            if(data.next === null){
              setPropNext(false);
            }else{
              setPropNext(true);
            }
          });
        }
      };

      const handleScroll = e => {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom && propNext) {
          setPropPage(prevPage => prevPage + 1);
        }
      };

    useEffect(() => {
        fetch(`${apiUrl}accounts/getUser/${userID}/`, {
            method : "GET",
          })
          .then(response => response.json())
          .then(json => {
            setAvatar(json.avatar);
            if(json.first_name !== null){
                setFirstname(json.first_name);
            }
            if(json.last_name !== null){
                setLastname(json.last_name);
            }
            setEmail(json.email);
            if(json.phone !== null){
                setPhone(json.phone);
            }
            setRating(json.rating);
            setPropPage(1);
          })
          .catch(error => {
            if(error.response){
            alert(error.response.data);
          }
          })
          fetch(`${apiUrl}property/getProperty/${userID}/?page=1`, {
            method : "GET",
          })
            .then(response => response.json())
            .then(data => {
              var newData = [];
              let count = data.count;
              setTotalProp(count);
              if(count >= 10){
                count = 10;
              }
              for(let i = 0; i < count; i++){
                if(!newData.includes(data.results[i])){
                  newData.push(data.results[i]);
                }
              }
              setPropData(newData);
              if(data.next === null){
                setPropNext(false);
              }else{
                setPropNext(true);
              }
            });
            fetch(`${apiUrl}comments/user/${userID}/?page=1`, {
              method : "GET",
              headers : {
                Authorization : "Bearer " + sessionStorage.getItem("access_token"),
              },
            })
            .then((response) => {
              if(response.ok){
                setCanSee(true);
              }else{
                setCanSee(false);
              }
            });
    }, [userID])

    const firstnameHandler = (e) => {
        setFirstname(e.target.value);
    }

    const lastnameHandler = (e) => {
        setLastname(e.target.value);
    }

    const emailHandler = (e) => {
        setEmail(e.target.value);
    }

    const phoneHandler = (e) => {
        setPhone(e.target.value);
    }

    const avatarHandler = (e) => {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
  
      reader.addEventListener('load', () => {
        setAvatar(reader.result);
        setAvatarChange(true);
        setChangeAvatar(selectedFile);
      });
  
      reader.readAsDataURL(selectedFile);
    }

    function updateProfile(event){
        event.preventDefault();
        let formData = new FormData();
        if(avatarChange){
            formData.append('avatar', changeAvatar);
        }
        formData.append('first_name', firstname);
        formData.append('last_name', lastname);
        formData.append('email', email);
        formData.append('phone', phone);
        fetch(`${apiUrl}accounts/update/`, {
            method : "PUT",
            headers : {
              Authorization : "Bearer " + sessionStorage.getItem("access_token"),
            },
            body : formData,
          })
          .then(response => setUser(true))
          .catch(error => {
            if(error.response){
            alert(error.response.data);
          }
          })
    }

    return (
        <>
            <Locbar />
            <main className="profile-main">
            {canSee ? 
                <div className="info" style={{width: "30%"}}>
                {userID === userId ? <><div><img src={avatar} className="main-img" width="200" height="200"></img></div>
                <div className="uploadDiv"><input type="file" className="upload-bottun" onChange={avatarHandler}></input></div>
                <div><h1>Rating : {rating}</h1></div>
                
                <div className="col-lg-8">
                    <div className="profileCard mb-4">
                        <div className="card-body">
                            <div className="row">
                                <div className="col-sm-3">
                                    <p className="mb-0">Firstname</p>
                                </div>
                                <div className="col-sm-9" id="text-container">
                                  <input className="textfield" type="text" value={`${firstname}`} onChange={firstnameHandler}></input>
                                </div>
                                </div>
                            <hr />
                            <div className="row">
                                <div className="col-sm-3">
                                    <p className="mb-0">Lastname</p>
                                </div>
                                <div className="col-sm-9" id="text-container1">
                                  <input className="textfield" type="text" value={`${lastname}`} onChange={lastnameHandler}></input>
                                </div>
                                </div>
                            <hr />
                            <div className="row">
                                <div className="col-sm-3">
                                    <p className="mb-0">Email</p>
                                </div>
                                <div className="col-sm-9" id="text-container2">
                                  <input className="textfield" type="email" value={`${email}`} onChange={emailHandler}></input>
                                </div>
                                </div>
    
    
                            <hr />
                            <div className="row">
                                <div className="col-sm-3">
                                    <p className="mb-0">Phone</p>
                                </div>
                                <div className="col-sm-9" id="text-container3">
                                  <input className="textfield" type="tel" value={`${phone}`} onChange={phoneHandler}></input>
                                </div>
                            </div>
                            <hr />
                            <div className="row updateDiv">
                                <div className="col-sm-3">
                                    <Button className="mb-0" variant="primary" onClick={updateProfile}>Update</Button>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div></>
                    : 
                    <>
                    <img src={avatar} className="main-img" width="200" height="200"></img>
            
            <div className="col-lg-8">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-3">
                                <p className="mb-0">Firstname</p>
                            </div>
                            <div className="col-sm-9" id="text-container">
                              <p className="text-muted mb-0" id="text">{firstname}</p>
                            </div>
                            </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <p className="mb-0">Lastname</p>
                            </div>
                            <div className="col-sm-9" id="text-container1">
                              <p className="text-muted mb-0" id="text">{lastname}</p>
                            </div>
                            </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <p className="mb-0">Email</p>
                            </div>
                            <div className="col-sm-9" id="text-container2">
                              <p className="text-muted mb-0" id="text">{email}</p>
                            </div>
                            </div>


                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <p className="mb-0">Phone</p>
                            </div>
                            <div className="col-sm-9" id="text-container3">
                              <p className="text-muted mb-0" id="text">{phone}</p>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
                    </>
                    }
                </div>
            :
            <div className="info" style={{width: "50%"}}>
            <img src={avatar} className="main-img" width="200" height="200"></img>
            
            <div className="col-lg-8">
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-sm-3">
                                <p className="mb-0">Firstname</p>
                            </div>
                            <div className="col-sm-9" id="text-container">
                              <p className="text-muted mb-0" id="text">{firstname}</p>
                            </div>
                            </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <p className="mb-0">Lastname</p>
                            </div>
                            <div className="col-sm-9" id="text-container1">
                              <p className="text-muted mb-0" id="text">{lastname}</p>
                            </div>
                            </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <p className="mb-0">Email</p>
                            </div>
                            <div className="col-sm-9" id="text-container2">
                              <p className="text-muted mb-0" id="text">{email}</p>
                            </div>
                            </div>


                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <p className="mb-0">Phone</p>
                            </div>
                            <div className="col-sm-9" id="text-container3">
                              <p className="text-muted mb-0" id="text">{phone}</p>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            }

            {canSee ? <UserComments data={userID}/> : <></>}

            {canSee ? 
            <div className="container-profile border-right border-left" style={{width: "40%"}}>
                <div className="headings d-flex justify-content-between align-items-center mb-3">
                    <h5>Host({totalProp})</h5>
                </div>
                <div className="scroll_box_profile" onScroll = {handleScroll}>
                    <div className="col-md-8">
                                {propData.map(item => (
                                    <div className="card p-3" key={item.pk}>
                                    <div className="d-flex justify-content-between align-items-center">
                                    <div className="user2-profile d-flex flex-row align-items-center">
                                    <Link to={`/property/details/${item.pk}`}><img src={`${item.image_cover}`} width="70" height="70" className="user-img rounded-circle mr-2"></img></Link>
                                    <span>
                                    <div className="font-weight">{item.address}</div>
                                    </span>
                                    </div>
                                    </div>
                                    </div>
                                ))}
                    </div>
                </div>
            </div>
            :
            <div className="container-profile border-right border-left" style={{width: "50%"}}>
                <div className="headings d-flex justify-content-between align-items-center mb-3">
                    <h5>Host({totalProp})</h5>
                </div>
                <div className="scroll_box_profile" onScroll = {handleScroll}>
                    <div className="col-md-8">
                    {propData.map(item => (
                                    <div className="card p-3" key={item.pk}>
                                    <div className="d-flex justify-content-between align-items-center">
                                    <div className="user2-profile d-flex flex-row align-items-center">
                                    <Link to={`/property/details/${item.pk}`}><img src={`${item.image_cover}`} width="70" height="70" className="user-img rounded-circle mr-2"></img></Link>
                                    <span>
                                    <div className="font-weight">{item.address}</div>
                                    </span>
                                    </div>
                                    </div>
                                    </div>
                                ))}
                    </div>
                </div>
            </div>}
        </main>
        <Footer />       
        </>
    )
}

export default Profile;