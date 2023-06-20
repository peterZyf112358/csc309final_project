import Locbar from "../navbar";
import ReservList from "./ReservList";
import Footer from "../footer"
const Reservation_page = () => {
    return <>
        <header>
            <Locbar/>
        </header>
        <main>
            <ReservList/>
        </main>
            <Footer></Footer>
        </>
}

export default Reservation_page
