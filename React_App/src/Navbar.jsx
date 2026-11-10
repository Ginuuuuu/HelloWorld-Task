
/* import PropsType from "prop-type" */

/* function Navbar() {
    return(
        <nav>
            <h3>Hello Nav</h3>
            <button>Login</button>
        </nav>
    );
}

const styles = {
    backgroundColor: "blueviolet",
    
}

function Login () {
    return (
        <fieldset className="field">
            <legend>Login</legend>
            <form >
                <fieldset style={styles}>
                    <legend>Credentials</legend>
                    <br />
                    <label>Unsername <input type="text" required /></label>
                    <br /> <br />
                    <label>Password <input type="password" required /></label>
                </fieldset>
                <br />
                <button type="submit">LogIn</button>
            </form>
        </fieldset>
    );
}

const course1 = "HTML"

function Course () {

    return(
        <fieldset className="field">
            <legend>{course1}</legend>
            <form>
                <img src="./assets/hero.png" alt="image not found" />
                <br />
                <h3>This is {course1}</h3>
                <br /><br />
                <label>Review<input type="text" /></label> <br /> <br />
                <input type="Submit" />
            </form>
        </fieldset>
    );
} */

function Product (props) {

    return(
        <div className='card'>
            <img src={props.pic} alt="image not found" /> 
            <h3>{props.name}</h3>
            <p>{props.price}</p>
        </div>
    );

}

/* Product.defaultProps = {
    image: pic,
    name: "Unavailable",
    price : "Not Found"
} */

/* Product.propsType = {
    name : PropsType.string,
    price : PropsType.number,
    
} */

export default Product;