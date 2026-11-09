function Navbar() {
    return(
        <nav>
            <h3>Hello Nav</h3>
            <button>Login</button>
        </nav>
    );
}

function Login () {
    return (
        <fieldset className="field">
            <legend>Login</legend>
            <form >
                <fieldset className="field">
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
}

export { Navbar, Login, Course};