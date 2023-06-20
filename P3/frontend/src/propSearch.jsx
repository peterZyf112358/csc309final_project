import { useEffect, useState } from "react";
import Locbar from "./navbar";
import Footer from "./footer";
import { useLocation } from 'react-router-dom';
import "./home.css";
import { apiUrl } from "./constants";
import { Link } from 'react-router-dom';

function Search() {
    const [properties, setProperties] = useState([]);
    const webLocation = useLocation();
    const {location = "", numGuest = "", priceOrder = "", ratingOrder = "-rating", startTime = null, endTime = null, amentities = []} = webLocation.state || {};
    const [query, setQuery] = useState({location, numGuest, priceOrder, ratingOrder, startTime, endTime, amentities});
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    useEffect(() => {
        setQuery({location, numGuest, priceOrder, ratingOrder, startTime, endTime, amentities});
        setPage(1);
    }, [webLocation]);

    useEffect(() => {
        const params = new URLSearchParams();
        params.append("address", query.location);
        if(query.numGuest === "8+"){
            params.append("num_guest", 9);
        }else{
            params.append("num_guest" , query.numGuest);
        }
        if(query.startTime !== null){
            params.append("available_start", query.startTime);
        }
        if(query.endTime !== null){
            params.append("available_end", query.endTime);
        }
        params.append("order_by", query.priceOrder + "," + query.ratingOrder);
        params.append("amenities", query.amentities.join(','));
        params.append("page", page);
        fetch(`${apiUrl}property/all/?${params}`, {
            method : "GET",
        })
        .then((response) => {
            return response.json()
        })
        .then(json => {
            setTotalPage(Math.ceil(json.count / 10));
            setProperties(json.results);
        })
        .catch((error) => {
            if(error.response){
              alert(error.response.data);
            }
          });
    }, [query, page]);

    return <>
        <Locbar />
        <main className="search-main">
        <div className="filterSet">
            {location === "" ? <></> : <div className="cond">Location: {location}</div>}
            {numGuest === "" ? <></> : <div className="cond">Number of Guest : {numGuest}</div>}
            {ratingOrder === "" ? <></> : <div className="cond">Sort By {ratingOrder === "rating" ? "Increasing" : "Decreasing"} Rating</div>}
            {priceOrder === "" ? <></> : <div className="cond">Sort By {priceOrder === "price" ? "Increasing" : "Decreasing"} Price</div>}
            {startTime === null ? <></> : <div className="cond">Start Time: {startTime}</div>}
            {endTime === null ? <></> : <div className="cond">End Time: {endTime}</div>}
            {amentities.map(amen => (
                <div className="cond">{amen}</div>
            ))}
        </div>
            { totalPage === 0 ? 
            <div className="nothing_text">
            <div><h1 className="nothing_mess">Sorry, we can't find any property with the filter</h1></div>
            <div><p className="remind">Please check your spelling to make sure everything is entered correctly and try search again.</p></div>
            </div>
          : <>
            <div className="cards">
            {properties.map(property => (
                <Link to={`/property/details/${property.pk}`} className="property" key={property.pk}>
                    <img src={property.image_cover} className="pic"></img>
                    <div>
                    <p className="location">{property.address}</p>
                    <p className="avaliable">{property.available_start} - {property.available_end}</p>
                    <p className="price">${property.price} CAD per night</p>
                    <div>
                        <p>☆ {property.rating.toFixed(2)}</p>
                    </div>
                    </div>
                </Link>
                ))}
            </div>


            <nav aria-label="Page navigation example" className="page">
                <ul className="pagination">
                    <li className="page-item">
                    <button className="page-link" onClick={() => setPage(1)}>
                        First
                    </button>
                    </li>
                    <li className="page-item">
                    <button
                        className="page-link"
                        onClick={() =>
                        setPage(prevPage => (prevPage > 1 ? prevPage - 1 : 1))
                        }
                        aria-label="Previous"
                    >
                        <span aria-hidden="true">&laquo;</span>
                        <span className="sr-only">Previous</span>
                    </button>
                    </li>
                    <li className="page-item">
                    <p className="page-link">
                        Page {page} out of {totalPage}
                    </p>
                    </li>
                    <li className="page-item">
                    <button
                        className="page-link"
                        onClick={() =>
                        setPage(prevPage => (prevPage < totalPage ? prevPage + 1 : totalPage))
                        }
                        aria-label="Next"
                    >
                        <span aria-hidden="true">&raquo;</span>
                        <span className="sr-only">Next</span>
                    </button>
                    </li>
                    <li className="page-item">
                    <button className="page-link" onClick={() => setPage(totalPage)}>
                        Last
                    </button>
                    </li>
                </ul>
            </nav>
            </>}
        </main>
        <Footer />
    </>
}

export default Search;