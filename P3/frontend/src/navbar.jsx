import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import "./navbar.css";
import { faMagnifyingGlass, faHouse, faBell, faBars, faUser} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { apiUrl} from './constants';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import UserContext from './context/userContext';

function Locbar(){
  const [searchModal, setSearchModal] = useState(false);
  const [signupModal, setSignupModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [moreless, setMoreless] = useState("Show more");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRePwd, setRegisterRePwd] = useState("");
  const [registerAvatar, setRegisterAvatar] = useState(null);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [registerEmailError, setRegisterEmailError] = useState("");
  const [registerPswError, setRegisterPswError] = useState("");
  const [registerRePswError, setRegisterRePswError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem("isAuth"));
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [changePswModal, setChangePswModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRePsw, setNewRePsw] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [newRePswError, setNewRePswError] = useState("");
  const [notData, setNotData] = useState([]);
  const [notPage, setNotPage] = useState(null);
  const [notNext, setNotNext] = useState(true);
  const [location, setLocation] = useState("");
  const [numGuest, setNumGuest] = useState("");
  const [priceOrder, setPriceOrder] = useState("");
  const [ratingOrder, setRatingOrder] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [amentities, setAmentities] = useState([]);
  const [timeError, setTimeError] = useState("");
  const [userId, setUserId] = useState(null);
  const { user , setUser} = useContext(UserContext);
  const [notRefresh, setNotRefresh] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if(notRefresh){
    fetch(`${apiUrl}notifications/list/?page=1`, {
      method : "GET",
      headers : {
        Authorization : "Bearer " + sessionStorage.getItem("access_token"),
      },
    })
      .then(response => response.json())
      .then(data => {
        var newData = [];
        let count = data.count;
        if(count >= 10){
          count = 10;
        }
        for(let i = 0; i < count; i++){
          if(!newData.includes(data.results[i])){
            newData.push(data.results[i]);
          }
        }
        setNotData(newData);
        if(data.next === null){
          setNotNext(false);
        }else{
          setNotNext(true);
        }
        setNotRefresh(false);
      });
    }
  }, [notRefresh]);

  useEffect(() => {
    fetchNotData();
  }, [notPage]);

  const fetchNotData = () => {
    if(isAuthenticated && notPage !== null && notPage !== 1){
    fetch(`${apiUrl}notifications/list/?page=${notPage}`, {
      method : "GET",
      headers : {
        Authorization : "Bearer " + sessionStorage.getItem("access_token"),
      },
    })
      .then(response => response.json())
      .then(data => {
        var newData = [];
        let count = data.count;
        if(count >= notPage * 10){
          count = 10;
        }else{
          count = count % 10;
        }
        for(let i = 0; i < count; i++){
          if(!newData.includes(data.results[i])){
            newData.push(data.results[i]);
          }
        }
        setNotData(prevData => [...prevData, ...newData]);
        if(data.next === null){
          setNotNext(false);
        }else{
          setNotNext(true);
        }
      });
    }
  };

  useEffect(() => {
    if(user){
      fetch(`${apiUrl}accounts/detail/`, {
        method : "GET",
        headers : {
          Authorization : "Bearer " + sessionStorage.getItem("access_token"),
        },
      })
      .then(response => response.json())
      .then(json => {
        setAvatar(json.avatar);
        setName(json.first_name + " " + json.last_name);
        if(json.first_name + " " + json.last_name === ""){
          setName("Unknown");
        }
        sessionStorage.setItem("user_id", json.id);
        setUserId(json.id);
      })
      .catch(error => {
        if(error.response){
        alert(error.response.data);
      }
      })
      setUser(false)
    }
  }, [user])

  const handleScroll = e => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && notNext) {
      setNotPage(prevPage => prevPage + 1);
    }
  };

  const showChangePswModal = () => {
    setChangePswModal(true);
    };

  const hideChangePswModal = () => {
    setOldPassword("")
    setNewPassword("")
    setNewRePsw("")
    setChangePswModal(false);
    };

    const oldPswHandler = (e) => {
      setOldPassword(e.target.value);
    }

    const newPswHandler = (e) => {
      if(e.target.value.length < 8 && e.target.value.length != 0){
        setNewPasswordError("This password is too short. It must contain at least 8 characters");
      }else{
        setNewPasswordError("");
      }
      setNewPassword(e.target.value);
    }

    const newRePswHandler = (e) => {
      if(e.target.value.length < 8 && e.target.value.length != 0){
        setNewRePswError("This password is too short. It must contain at least 8 characters");
      }else{
        setNewRePswError("");
      }
      setNewRePsw(e.target.value);
    }

  const showSearchModal = () => {
    setSearchModal(true);
    };

  const hideSearchModal = () => {
    setLocation("")
    setNumGuest("");
    setPriceOrder("");
    setRatingOrder("");
    setStartTime(null);
    setEndTime(null);
    setAmentities([]);
    setTimeError("");
    setSearchModal(false);
    };

    const showSignupModal = () => {
      setSignupModal(true);
      };
  
    const hideSignupModal = () => {
      setRegisterEmailError("");
      setRegisterPswError("");
      setNewRePswError("");
      setRegisterEmail("");
      setRegisterPhone("");
      setRegisterPassword("");
      setRegisterRePwd("");
      setRegisterAvatar(null);
      setSignupModal(false);
      };

      const showLoginModal = () => {
        setLoginModal(true);
        };
    
      const hideloginModal = () => {
        setLoginModal(false);
        setLoginError("");
        setLoginEmail("");
        setLoginPassword("");
        };

    const loginEmailHandler = (e) => {
      setLoginEmail(e.target.value);
    }

    const loginPasswordHandler = (e) => {
      setLoginPassword(e.target.value);
    }

    const registerEmailHandler = (e) => {
      setRegisterEmail(e.target.value);
    }

    const registerFirstNameHandler = (e) => {
      setFirstname(e.target.value);
    }

    const registerLastNameHandler = (e) => {
      setLastname(e.target.value);
    }

    const registerPasswordHandler = (e) => {
      if(e.target.value.length < 8 && e.target.value.length != 0){
        setRegisterPswError("This password is too short. It must contain at least 8 characters");
      }else{
        setRegisterPswError("");
      }
      setRegisterPassword(e.target.value);
    }

    const registerPhoneHandler = (e) => {
      setRegisterPhone(e.target.value);
    }

    const registerRePwdHandler = (e) => {
      if(e.target.value.length < 8 && e.target.value.length != 0){
        setRegisterRePswError("This password is too short. It must contain at least 8 characters");
      }else{
        setRegisterRePswError("");
      }
      setRegisterRePwd(e.target.value);
    }

    const registerAvatarHandler = (e) => {
      setRegisterAvatar(e.target.files[0]);
    }

    function logoutHandler(event){
      event.preventDefault();
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("isAuth");
      sessionStorage.removeItem("user_id");
      setIsAuthenticated(false);
      setAvatar(null);
      setName("");
      setNotData([]);
      setNotPage(null);
      setUserId(null);
      setNotRefresh(false);
      navigate('/search');
    }

    useEffect(() => {
      if(isAuthenticated){
        fetch(`${apiUrl}accounts/detail/`, {
          method : "GET",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
        .then(response => response.json())
        .then(json => {
          setAvatar(json.avatar);
          setName(json.first_name + " " + json.last_name);
          if(json.first_name + " " + json.last_name === ""){
            setName("Unknown");
          }
          sessionStorage.setItem("user_id", json.id);
          setUserId(json.id);
        })
        .catch(error => {
          if(error.response){
          alert(error.response.data);
        }
        })
        fetch(`${apiUrl}notifications/notupcoming/`, {
          method : "POST",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
        .catch(error => {
          if(error.response){
          alert(error.response.data);
        }
        });
        fetch(`${apiUrl}reservations/markExpired/`, {
          method : "POST",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
        .catch(error => {
          if(error.response){
          alert(error.response.data);
        }
        });
        fetch(`${apiUrl}reservations/markCompleted/`, {
          method : "POST",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
        .catch(error => {
          if(error.response){
          alert(error.response.data);
        }
        });
        setNotRefresh(true);
        setNotPage(1);
      }
    }, [isAuthenticated]);

    function changePswHandler(event){
      event.preventDefault();
      if(newPassword !== newRePsw){
        setNewPasswordError("The two password fields didn\'t match");
        setNewRePswError("The two password fields didn\'t match");
      }else if(newPassword.length < 8){
        setNewPasswordError("This password is too short. It must contain at least 8 characters");
      }else if(newRePsw.length < 8){
        setNewRePswError("This password is too short. It must contain at least 8 characters");
      }else{
        let formData = new FormData();
      formData.append("old_password", oldPassword);
      formData.append("password1", newPassword);
      formData.append("password2", newRePsw);
      fetch(`${apiUrl}accounts/change_password/`, {
        method : "PUT",
        body : formData,
        headers : {
          Authorization : "Bearer " + sessionStorage.getItem("access_token"),
        },
      })
      .then((response) => {
        if(response.ok){
          setNewPassword("");
          setNewRePsw("");
          setOldPassword("");
          setNewPasswordError("");
          setNewRePswError("");
          setOldPasswordError("");
          hideChangePswModal();
        }else{
          setOldPasswordError("Old password is not correct");
        }
      }).catch((error) => {
        if(error.response){
          hideChangePswModal();
          alert(error.response.data);
        }
      })
      }
    }

    function loginHandler(event){
      event.preventDefault();
      let formData = new FormData();
      formData.append("email", loginEmail);
      formData.append("password" ,  loginPassword);
      fetch(`${apiUrl}accounts/obtainToken/`, {
        method : "POST",
        body : formData,
      })
      .then((response) => {
        if(response.ok){
          return response.json()
        }else{
          setLoginError("The email or password is wrong. Please check your email and password");
        }
      })
      .then(json => {
        sessionStorage.setItem("isAuth", true);
        sessionStorage.setItem("access_token", json.access);
        setLoginEmail("");
        setLoginPassword("");
        setLoginError("");
        hideloginModal();
        setIsAuthenticated(true);
      })
      .catch((error) => {
        if(error.response){
          hideloginModal();
          alert(error.response.data);
        }
      });
    }

    function registerHandler(event){
      event.preventDefault();
      if(registerPassword !== registerRePwd){
        setRegisterPswError("The two password fields didn\'t match");
        setRegisterRePswError("The two password fields didn\'t match");
      }else if(registerPassword.length < 8){
        setRegisterPswError("This password is too short. It must contain at least 8 characters");
      }else if(registerRePwd.length < 8){
        setRegisterRePswError("This password is too short. It must contain at least 8 characters");
      }else{
      let formData = new FormData();
      formData.append("email", registerEmail);
      formData.append("first_name", firstname);
      formData.append("last_name", lastname);
      formData.append("password1", registerPassword);
      formData.append("password2", registerRePwd);
      formData.append("phone", registerPhone);
      if(registerAvatar !== null){
        formData.append("avatar", registerAvatar);
      }
      fetch(`${apiUrl}accounts/register/`, {
        method : "POST",
        body : formData,
      })
      .then((response) => {
        if(response.ok){
          setRegisterEmail("");
          setFirstname("");
          setLastname("");
          setRegisterPassword("");
          setRegisterPhone("");
          setRegisterRePwd("");
          setRegisterAvatar(null);
          setRegisterEmailError("");
          setRegisterPswError("");
          setRegisterRePswError("");
          hideSignupModal();
          showLoginModal();
        }else{
          setRegisterEmailError("A user with this email already exists");
        }
      }).catch((error) => {
        if(error.response){
          hideSignupModal();
          alert(error.response.data);
        }
      })
    }
    }

    function handleNotClick(id, object_id, type, item){
      if(type === 11){
        fetch(`${apiUrl}notifications/clear/${id}/`, {
          method : "DELETE",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
        .then((response) => {
          setNotRefresh(true);
          navigate("/reservation")
        }).catch((error) => {
          if(error.response){
            alert(error.response.data);
          }
        })
      }else if(type === 9){
        fetch(`${apiUrl}notifications/clear/${id}/`, {
          method : "DELETE",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
        .then((response) => {
          setNotRefresh(true);
          navigate(`/property/details/${object_id}`)
        }).catch((error) => {
          if(error.response){
            alert(error.response.data);
          }
        })
      }else{
        fetch(`${apiUrl}notifications/clear/${id}/`, {
          method : "DELETE",
          headers : {
            Authorization : "Bearer " + sessionStorage.getItem("access_token"),
          },
        })
        .then((response) => {
          setNotRefresh(true);
          navigate(`/profile/${object_id}`)
        }).catch((error) => {
          if(error.response){
            alert(error.response.data);
          }
        })
      }
    }

    function handleSearch(event){
      event.preventDefault();
        if(startTime > endTime){
          setTimeError("Your start time must be before or the same as your end time");
        }else{
          hideSearchModal();
          navigate('/search', {state : {location : location, numGuest : numGuest, priceOrder : priceOrder, ratingOrder : ratingOrder, startTime : startTime, endTime : endTime, amentities : amentities}});
          setLocation("");
          setNumGuest("");
          setPriceOrder("");
          setRatingOrder("");
          setStartTime(null);
          setEndTime(null);
          setAmentities([]);
        }
    }

    function changeLocation(e){
      setLocation(e.target.value);
    }

    function changeNumGuest(e){
      setNumGuest(e.target.value);
    }

    function changePriceOrder(e){
      setPriceOrder(e.target.value);
    }

    function changeRatingOrder(e){
      setRatingOrder(e.target.value);
    }

    function changeStartTime(e){
      setStartTime(e.target.value);
    }

    function changeEndTime(e){
      setEndTime(e.target.value);
    }

    function changeAmen(e){
      if(e.target.checked){
        setAmentities(prevAmen => [...prevAmen, e.target.value]);
      }else{
        setAmentities(prevAmen => prevAmen.filter(item => item !== e.target.value));
      }
    }
    
    return <>
    <nav className="header">
    {isAuthenticated ? 
    <><div className="menu">
            <button className="menu_btn">
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="menu_content">
              <Link to={`/search`} className='list'>Home</Link>
              <Link to={`/profile/${userId}`} className="list">My Property</Link>
              <Link to={`/reservation`} className='list'>My Reservation</Link>
              <Link to={`/property/create`} className='list'>Create Property</Link>
            </div>
          </div><Link to={`/search`} className='list'>
              <FontAwesomeIcon icon={faHouse} />
            </Link><Link to={`/profile/${userId}`} className="list">My Property</Link><Link to={`/reservation`} className="list">My Reservation</Link><Link to={`/property/create`} className="list">Create Property</Link>
            <div className="profile">
              <button className="user-nav">
                <img src={avatar} className="avatar"></img>
              </button>
              <div className="profile_content">
                <span className="name">Name: <br></br>{name}</span>
                <Link to={`/profile/${userId}`}>Edit Profile</Link>
                <a href="#" onClick={showChangePswModal}>
                  Change Password
                </a>
                <a href="#" onClick={logoutHandler}>Log out</a>
              </div>
            </div>
            <div className="notification">
              <button className="notbtn">
                <FontAwesomeIcon icon={faBell} />
                {notData.length !== 0 ? <span className="icon-button__badge"></span> : <></>}
              </button>
              <div className="not_content" onScroll = {handleScroll}>
              {notData.map(item => (
                  <a href='#' key={item.id} onClick={() => handleNotClick(item.id, item.object_id, item.content_type, item)}>{item.content}</a>
                ))}
              </div>
            </div><button className="search_button" onClick={showSearchModal}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button></>
    :  
    <><div className="profile">
      <button className="user-nav">
      <FontAwesomeIcon icon={faUser} style={{fontSize:'25px'}} />
      </button>
      <div className="profile_content">
      <a href="#" onClick={showSignupModal}>
      Sign Up
      </a>
      <a href="#" onClick={showLoginModal}>
      Login
      </a>
      </div>
      </div>
        <button className="search_button" onClick={showSearchModal}>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
        </>}   
    </nav>


    <Modal show={searchModal} onHide={hideSearchModal}>
        <Modal.Header closeButton>
          <Modal.Title>Search Property</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSearch}>
        <Modal.Body>
        <div className="modal-body">
          <div className="category"><p className="label">Location:</p><input className="search_field" rows="1" onChange={changeLocation}></input></div>
          <div className="category"><p className="label">Number of Guest:</p>
            <select name="num_guest" id="num_guest" className="search_field" onChange={changeNumGuest}>
              <option value="" disabled selected>Select your option</option>
              <option value="1" className="op">1</option>
              <option value="2" className="op">2</option>
              <option value="3" className="op">3</option>
              <option value="4" className="op">4</option>
              <option value="5" className="op">5</option>
              <option value="6" className="op">6</option>
              <option value="7" className="op">7</option>
              <option value="8" className="op">8</option>
              <option value="8+" className="op">8+</option>
            </select>
          </div>
          <div className="category"><p className="label">Sort By Price:</p>
            <select name="num_guest" id="num_guest" className="search_field" onChange={changePriceOrder}>
            <option value="" disabled selected>Select your option</option>
              <option value="price" className="op">Increasing</option>
              <option value="-price" className="op">Decreasing</option>
            </select>
          </div>
          <div className="category"><p className="label">Sort By Rating:</p>
          <select name="num_guest" id="num_guest" className="search_field" onChange={changeRatingOrder}>
              <option value="" disabled selected>Select your option</option>
              <option value="rating" className="op">Increasing</option>
              <option value="-rating" className="op">Decreasing</option>
            </select>
          </div>
          <div className="category"><p className="label">Start Time:</p><input type = "date" className="search_field" rows="1" onChange={changeStartTime} min={new Date().toISOString().split("T")[0]}></input></div>
          <div className="category"><p className="label">End Time:</p><input type = "date" className="search_field" rows="1" onChange={changeEndTime} min={new Date().toISOString().split("T")[0]}></input></div>
          <p className="error">{timeError}</p>
          <div className="amentities"><p className="label">Amentities:</p></div>
          <div className="amentities">
            <input type="checkbox" id="wifi" name="wifi" value="wifi" className="check" onChange={changeAmen}></input>
            <label htmlFor="wifi" className="label">Wifi</label>
            <input type="checkbox" id="kitchen" name="kitchen" value="kitchen" className="check" onChange={changeAmen}></input>
            <label htmlFor="kitchen" className="label">Kitchen</label>
          </div>
          <div className="amentities">
            <input type="checkbox" id="washer" name="washer" value="washer" className="check" onChange={changeAmen}></input>
            <label htmlFor="washer" className="label">Washer</label>
            <input type="checkbox" id="dryer" name="dryer" value="dryer" className="check" onChange={changeAmen}></input>
            <label htmlFor="dryer" className="label">Dryer</label>
          </div>
          <div className="amentities">
            <input type="checkbox" id="air_cond" name="air_cond" value="air_cond" className="check" onChange={changeAmen}></input>
            <label htmlFor="air_cond" className="label">Air Conditioning</label>
            <input type="checkbox" id="heating" name="heating" value="heating" className="check" onChange={changeAmen}></input>
            <label htmlFor="heating" className="label">Heating</label>
          </div>
          <div className="more_con">
            <details>
              <summary className="sum" onClick={() => moreless === "Show more" ? setMoreless("Show less") : setMoreless("Show more")}>{moreless}</summary>
                <ul className="more">
                  <li  className="amen">
                    <div className="amentities">
                      <input type="checkbox" id="hair_dryer" name="hair_dryer" value="hair_dryer" className="check" onChange={changeAmen}></input>
                      <label htmlFor="hair_dryer" className="label">Hair Dryer</label>
                      <input type="checkbox" id="TV" name="TV" value="TV" className="check" onChange={changeAmen}></input>
                      <label htmlFor="TV" className="label">TV</label>
                    </div>
                  </li>
                  <li className="amen">
                    <div className="amentities">
                      <input type="checkbox" id="pool" name="pool" value="pool" className="check" onChange={changeAmen}></input>
                      <label htmlFor="pool" className="label">Pool</label>
                      <input type="checkbox" id="hot_tub" name="hot_tub" value="hot_tub" className="check" onChange={changeAmen}></input>
                      <label htmlFor="hot_tub" className="label">Hot Tub</label>
                    </div>
                  </li>
                  <li className="amen">
                    <div className="amentities">
                      <input type="checkbox" id="bbq" name="bbq" value="bbq" className="check" onChange={changeAmen}></input>
                      <label htmlFor="bbq" className="label">BBQ Grill</label>
                      <input type="checkbox" id="gym" name="gym" value="gym" className="check" onChange={changeAmen}></input>
                      <label htmlFor="gym" className="label">Gym</label>
                    </div>
                  </li>
                </ul>
            </details>
          </div>
        </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideSearchModal}>
            Close
          </Button>
          <Button variant="primary" type='submit'>
            Search
          </Button>
        </Modal.Footer>
        </form>
      </Modal>


      <Modal show={signupModal} onHide={hideSignupModal}>
        <Modal.Header closeButton>
          <Modal.Title>Sign Up</Modal.Title>
        </Modal.Header>
        <form onSubmit={registerHandler}>
        <Modal.Body>
        <div className="signup-body">
            <label htmlFor="first_name"><b>First Name:</b></label>
            <input type="text" placeholder="Firstname" name="first_name" onChange={registerFirstNameHandler}></input>

            <label htmlFor="last_name"><b>Last Name:</b></label>
            <input type="text" placeholder="Lastname" name="last_name" onChange={registerLastNameHandler}></input>

            <label htmlFor="email"><b>Email Address:</b></label>
            <input type="email" placeholder="Enter Email Address" name="email" onChange={registerEmailHandler} required></input>
            <p className="error" id = "RegisterEmail">{registerEmailError}</p>

            <label htmlFor="phone"><b>Phone Number:</b></label>
            <input type="tel" placeholder="Enter Phone Number (XXX)-XXX-XXXX" name="phone" onChange={registerPhoneHandler}></input>

            <label htmlFor="psw"><b>Password:</b></label>
            <input type="password" placeholder="Enter Password" name="psw" onChange={registerPasswordHandler} required></input>
            <p className="error" id = "RegisterPsw">{registerPswError}</p>

            <label htmlFor="re-psw"><b>Repeat Password:</b></label>
            <input type="password" placeholder="Repeat Password" name="re-psw" onChange={registerRePwdHandler} required></input>
            <p className="error" id = "RegisterRePsw">{registerRePswError}</p>

            <label htmlFor="avatar">Avatar/Portrait:</label>
            <input type="file" name="avatar" onChange={registerAvatarHandler}></input>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideSignupModal}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Sign Up
          </Button>
        </Modal.Footer>
        </form>
      </Modal>


      <Modal show={loginModal} onHide={hideloginModal}>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <form onSubmit={loginHandler}>
        <Modal.Body>
        <div className="login-body">
            <p className="error" id="LoginError">{loginError}</p>
            <label htmlFor="email"><b>Email Address:</b></label>
            <input type="email" placeholder="Enter Email Address" name="email" onChange={loginEmailHandler} required></input>

            <label htmlFor="psw"><b>Password:</b></label>
            <input type="password" placeholder="Enter Password" name="psw" onChange={loginPasswordHandler} required></input>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideloginModal}>
            Cancel
          </Button>
          <Button variant="primary" type='submit'>
            Login
          </Button>
        </Modal.Footer>
        </form>
      </Modal>


      <Modal show={changePswModal} onHide={hideChangePswModal}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <form onSubmit={changePswHandler}>
        <Modal.Body>
        <div className="login-body">
            <label htmlFor="old_password"><b>Old Password:</b></label>
            <input type="password" placeholder="Enter Your Old Password" name="email" onChange={oldPswHandler} required></input>
            <p className="error" id="LoginError">{oldPasswordError}</p>

            <label htmlFor="psw"><b>New Password:</b></label>
            <input type="password" placeholder="Enter New Password" name="psw" onChange={newPswHandler} required></input>
            <p className="error" id="NewPswError">{newPasswordError}</p>

            <label htmlFor="re-psw"><b>Repeat New Password:</b></label>
            <input type="password" placeholder="Reenter New Password" name="psw" onChange={newRePswHandler} required></input>
            <p className="error" id="NewRePswError">{newRePswError}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideChangePswModal}>
            Cancel
          </Button>
          <Button variant="primary" type='submit'>
            Change Password
          </Button>
        </Modal.Footer>
        </form>
      </Modal>
  </>
}

export default Locbar;