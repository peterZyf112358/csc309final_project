import "./createproperty.css"
import { useState , useEffect} from 'react';
import { apiUrl} from './constants';
import Locbar from "./navbar";
import Footer from "./footer";
import Button from "react-bootstrap/esm/Button";
import { useNavigate, useParams } from "react-router-dom";

function UpdateProperty(){
    const {propID} = useParams();
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState(0);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [description, setDescription] = useState("");
    const [cover, setCover] = useState("");
    const [images, setImages] = useState([])
    const [fileInputs, setFileInputs] = useState([{ id: Date.now() }]);
    const [error, setError] = useState("")
    const [guestError, setGuestError] = useState("")
    const [priceError, setPriceError] = useState("")
    const [numGuest, setNumGuest] = useState(0);
    const [moreless, setMoreless] = useState("Show more");
    const [amentities, setAmentities] = useState([]);
    const [numBed, setNumBed] = useState(0)
    const [numBath, setNumBath] = useState(0)
    const [bedError, setBedError] = useState("")
    const [bathError, setBathError] = useState("")
    const [coverChanged, setCoverChanged] = useState(false);
    const [changedCover, setChangedCover] = useState("");
    const [updateError, setUpdateError] = useState("");
    const regex = /^[0-9]+$/;
    const navigate = useNavigate()

    useEffect(() => {
        fetch(`${apiUrl}property/details/${propID}/`, {
            method : "GET",
            headers : {
              Authorization : "Bearer " + sessionStorage.getItem("access_token"),
            },
          })
          .then(response => response.json())
          .then(json => {
            setLocation(json.address);
            setPrice(json.price);
            setStart(json.available_start);
            setEnd(json.available_end);
            setDescription(json.description);
            setImages(json.images_id);
            setCover("http://localhost:8000" + json.image_cover);
            setNumGuest(json.num_guest);
            setAmentities(json.amenities.split(","));
            setNumBed(json.num_bed);
            setNumBath(json.num_bath);
          })
          .catch(error => {
            if(error.response){
            alert(error.response.data);
          }
          })
    }, [])

    function changeAmen(e){
        if(e.target.checked){
          setAmentities(prevAmen => [...prevAmen, e.target.value]);
        }else{
          setAmentities(prevAmen => prevAmen.filter(item => item !== e.target.value));
        }
      }

    const handleAddInput = () => {
        setFileInputs([...fileInputs, { id: Date.now() }]);
    };

    const handleDeleteInput = (id) => {
        setFileInputs(fileInputs.filter((input) => input.id !== id));
    };

    const handleFileInputChange = (id, event) => {
        const file = event.target.files[0];

        setFileInputs((prevInputs) =>
        prevInputs.map((input) => {
            if (input.id === id) {
            return { ...input, file };
            }

            return input;
        })
        );
    };


    function changeLocation(e){
        setLocation(e.target.value)
    }

    function changeNumBed(e){
        if((regex.test(e.target.value) && parseInt(e.target.value) > 0) || e.target.value === ""){
            setBedError("")
        }else{
            setBedError("The number of bedroom must be an integer greater than 0")
        }
        setNumBed(e.target.value);
    }

    function changeNumBath(e){
        if((regex.test(e.target.value) && parseInt(e.target.value) > 0) || e.target.value === ""){
            setBathError("")
        }else{
            setBathError("The number of bathroom must be an integer greater than 0")
        }
        setNumBath(e.target.value);
    }

    function changePrice(e){
        if(parseFloat(e.target.value) > 0 && e.target.value !== ""){
            setPriceError("")
        }else{
            setPriceError("Your price must be greater than 0")
        }
        setPrice(e.target.value)
    }

    function changeStart(e){
        setStart(e.target.value)
    }

    function changeEnd(e){
        setEnd(e.target.value)
    }

    function chnageDescription(e){
        setDescription(e.target.value)
    }

    const changeCover = (e) => {
        const selectedFile = e.target.files[0];
        const reader = new FileReader();
    
        reader.addEventListener('load', () => {
          setCover(reader.result);
          setCoverChanged(true);
          setChangedCover(selectedFile);
        });
    
        reader.readAsDataURL(selectedFile);
      }

    function changeNumGuest(e){
        if((regex.test(e.target.value) && parseInt(e.target.value) > 0) || e.target.value === ""){
            setGuestError("")
        }else{
            setGuestError("The number of guest must be an integer greater than 0")
        }
        setNumGuest(e.target.value);
    }

    function updateProp(event){
        event.preventDefault()
        if(start > end){
            setError("Your start time must be before or the same as your end time")
        }else if(priceError !== "" || guestError !== "" || bedError !== "" || bathError !== ""){
            
        }else{
            let formData = new FormData();
            if(coverChanged){
                formData.append("image_cover", changedCover);
            }
            formData.append("address", location)
            formData.append("price", price)
            formData.append("available_start", start)
            formData.append("available_end", end)
            formData.append("num_guest", numGuest)
            formData.append("amenities", amentities.filter(amen => amen !== "").join(","))
            formData.append("description", description)
            fileInputs.filter(image => image.file !== undefined).map(image => formData.append("images", image.file))
            formData.append("num_bed", numBed)
            formData.append("num_bath", numBath);
            images.map((image) => formData.append("uploaded_images", image.id))
            fetch(`${apiUrl}property/update/${propID}/`, {
                method : "PUT",
                body : formData,
                headers : {
                    Authorization : "Bearer " + sessionStorage.getItem("access_token"),
                },
              })
              .then((response) => {
                if(response.ok){
                    return response.json();
                }else{
                    return {error : "You have some active reservation that is outside of this new available interval. Please terminate all those reservation before making this update to the property"}
                }
              })
              .then(json => {
                if(json.error){
                    setUpdateError(json.error);
                }else{
                    setUpdateError("");
                    setError("");
                    setLocation("");
                    setPrice(0);
                    setStart("");
                    setEnd("");
                    setDescription("");
                    setCover("");
                    setFileInputs([{ id: Date.now() }]);
                    setNumGuest(0);
                    setMoreless("Show more");
                    setAmentities([]);
                    setBedError("")
                    setBathError("")
                    setNumBath(0)
                    setNumBed(0)
                    navigate(`/property/details/${propID}`);
                }
              })
              .catch((error) => {
                if(error.response){
                  alert(error.response.data);
                }
              });
        }
    }

    function handleDeleteImage(id){
        setImages(images.filter((input) => input.id !== id));
    }

    return <>
        <Locbar />
         <main className="main">
            <div className="create">
                <h2>Update Property</h2>
                <form className="formstyle" onSubmit={updateProp}>
                    <div className="formbold-mb-3">
                    <label htmlFor="address" className="formbold-form-label"> Address </label>
                    <input
                        type="text"
                        name="address"
                        id="address"
                        placeholder="Street address"
                        className="formbold-form-input formbold-mb-3"
                        onChange={changeLocation}
                        value={location}
                        required
                    ></input>
                    <label htmlFor="numBed" className="formbold-form-label"> Number of Bedroom </label>
                    <input
                        type="text"
                        name="numBed"
                        id="numBed"
                        placeholder="Number of Bedroom"
                        className="formbold-form-input formbold-mb-3"
                        onChange={changeNumBed}
                        value={numBed}
                        required
                    ></input>
                    <p className="error">{bedError}</p>
                    <label htmlFor="numBath" className="formbold-form-label"> Number of Bathroom </label>
                    <input
                        type="text"
                        name="numBath"
                        id="numBath"
                        placeholder="Number of Bathroom"
                        className="formbold-form-input formbold-mb-3"
                        onChange={changeNumBath}
                        value={numBath}
                        required
                    ></input>
                    <p className="error">{bathError}</p>
                    </div>

                    <div className="formbold-mb-3">
                        <label htmlFor="price" className="formbold-form-label">Price </label>
                        <input
                        type="text"
                        name="price"
                        id="price"
                        placeholder="500"
                        className="formbold-form-input formbold-mb-3"
                        onChange={changePrice}
                        value={price}
                        required
                        ></input>
                        <p className="error">{priceError}</p>

                        <label htmlFor="numGuest" className="formbold-form-label">Number of Guest Allowed</label>
                        <input
                        type="text"
                        name="numGuest"
                        id="numGuest"
                        placeholder="EX. 4"
                        className="formbold-form-input formbold-mb-3"
                        onChange={changeNumGuest}
                        value={numGuest}
                        required
                        ></input>
                        <p className="error">{guestError}</p>
                    </div>

                    <div className="formbold-mb-3">
                        <label htmlFor="start" className="formbold-form-label"> Start Available Date </label>
                        <input
                        type="date"
                        name="start"
                        id="start"
                        className="formbold-form-input formbold-w-45"
                        min={new Date().toISOString().split("T")[0]}
                        onChange={changeStart}
                        value={start}
                        required
                        />
                        <p className="error">{error}</p>

                        <label htmlFor="end" className="formbold-form-label"> Last Available Date </label>
                        <input
                        type="date"
                        name="end"
                        id="end"
                        min={new Date().toISOString().split("T")[0]}
                        className="formbold-form-input formbold-w-45"
                        onChange={changeEnd}
                        value={end}
                        required
                        />
                    </div>

                    <div className="formbold-mb-3">
                        <label className="formbold-form-label">Amentities:</label></div>
                        <div className="amentities">
                            <input type="checkbox" id="wifi" name="wifi" value="wifi" className="check" onChange={changeAmen} checked={amentities.includes("wifi")}></input>
                            <label htmlFor="wifi" className="label">Wifi</label>
                            <input type="checkbox" id="kitchen" name="kitchen" value="kitchen" className="check" onChange={changeAmen} checked={amentities.includes("kitchen")}></input>
                            <label htmlFor="kitchen" className="label">Kitchen</label>
                        </div>
                        <div className="amentities">
                            <input type="checkbox" id="washer" name="washer" value="washer" className="check" onChange={changeAmen} checked={amentities.includes("washer")}></input>
                            <label htmlFor="washer" className="label">Washer</label>
                            <input type="checkbox" id="dryer" name="dryer" value="dryer" className="check" onChange={changeAmen} checked={amentities.includes("dryer")}></input>
                            <label htmlFor="dryer" className="label">Dryer</label>
                        </div>
                        <div className="amentities">
                            <input type="checkbox" id="air_cond" name="air_cond" value="air_cond" className="check" onChange={changeAmen} checked={amentities.includes("air_cond")}></input>
                            <label htmlFor="air_cond" className="label">Air Conditioning</label>
                            <input type="checkbox" id="heating" name="heating" value="heating" className="check" onChange={changeAmen} checked={amentities.includes("heating")}></input>
                            <label htmlFor="heating" className="label">Heating</label>
                        </div>
                        <div className="more_con">
                            <details>
                            <summary className="sum" onClick={() => moreless === "Show more" ? setMoreless("Show less") : setMoreless("Show more")}>{moreless}</summary>
                                <ul className="more">
                                <li  className="amen">
                                    <div className="amentities">
                                    <input type="checkbox" id="hair_dryer" name="hair_dryer" value="hair_dryer" className="check" onChange={changeAmen} checked={amentities.includes("hair_dryer")}></input>
                                    <label htmlFor="hair_dryer" className="label">Hair Dryer</label>
                                    <input type="checkbox" id="TV" name="TV" value="TV" className="check" onChange={changeAmen} checked={amentities.includes("TV")}></input>
                                    <label htmlFor="TV" className="label">TV</label>
                                    </div>
                                </li>
                                <li className="amen">
                                    <div className="amentities">
                                    <input type="checkbox" id="pool" name="pool" value="pool" className="check" onChange={changeAmen} checked={amentities.includes("pool")}></input>
                                    <label htmlFor="pool" className="label">Pool</label>
                                    <input type="checkbox" id="hot_tub" name="hot_tub" value="hot_tub" className="check" onChange={changeAmen} checked={amentities.includes("hot_tub")}></input>
                                    <label htmlFor="hot_tub" className="label">Hot Tub</label>
                                    </div>
                                </li>
                                <li className="amen">
                                    <div className="amentities">
                                    <input type="checkbox" id="bbq" name="bbq" value="bbq" className="check" onChange={changeAmen} checked={amentities.includes("bbq")}></input>
                                    <label htmlFor="bbq" className="label">BBQ Grill</label>
                                    <input type="checkbox" id="gym" name="gym" value="gym" className="check" onChange={changeAmen} checked={amentities.includes("gym")}></input>
                                    <label htmlFor="gym" className="label">Gym</label>
                                    </div>
                                </li>
                                </ul>
                            </details>
                        </div>
            
                    <div className="formbold-mb-3">
                    <label htmlFor="message" className="formbold-form-label">
                        Description
                    </label>
                    <textarea
                        rows="6"
                        name="message"
                        id="message"
                        className="formbold-form-input"
                        onChange={chnageDescription}
                        value={description}
                        required
                    ></textarea>
                    </div>
            
                    <div className="formbold-form-file-flex">
                    <label htmlFor="upload" className="formbold-form-label">
                        Uploaded Image Cover
                    </label>
                    <div><img src={cover} className="main-img" width="200" height="200" style={{marginBottom : "10px"}}></img></div>
                    <input
                        type="file"
                        className="formbold-form-file"
                        onChange={changeCover}
                    />
                    </div>

                    <div className="formbold-form-file-flex">
                    <label htmlFor="upload" className="formbold-form-label">
                        Uploaded Images
                    </label>
                    {images.map((image) => (
                        <><div><img src={"http://localhost:8000" + image.image} className="main-img" width="200" height="200" style={{marginBottom : "10px"}}></img></div>
                        <Button variant="danger" onClick={() => handleDeleteImage(image.id)}>Delete</Button></>
                    ))}
                    </div>

                    <div className="formbold-form-file-flex">
                        <label htmlFor="upload" className="formbold-form-label">
                            Upload New Images
                        </label>
                        {fileInputs.map((input) => (
                            <div key={input.id} style={{ marginBottom: '10px' , display: 'flex'}}>
                            <input type="file" onChange={(event) => handleFileInputChange(input.id, event)} style={{ flexGrow: 1 }}/>
                            <Button variant="danger" onClick={() => handleDeleteInput(input.id)}>Delete</Button>
                            </div>
                        ))}
                        <Button variant="primary" onClick={handleAddInput}>Add Input</Button>
                    </div>
                    <p className="error">{updateError}</p>
                    <button className="button" type="submit">Update Property</button>
                </form>
            </div>
        </main>
        <Footer />
    </>
}

export default UpdateProperty;