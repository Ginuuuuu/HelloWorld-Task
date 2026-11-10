/* eslint-disable no-unused-vars */
import pic from "./assets/car.jpg"
import color from "./assets/color.jpg"
// eslint-disable-next-line no-unused-vars
import Product from "./Navbar";


function ProductList () {

    const prod = [
        {name : "shirt", price : "$2345", pic : pic},
        {name : "T-Shirt", price : "$345"},
        {name : "Pant", price : "$29455", pic : color},
        {name : "Pantsd", price : "$29455", pic : color},
        {name : "shirt", price : "$2345", pic : pic},
        {name : "T-Shirt", price : "$345"},
        {name : "Pantsd", price : "$29455", pic : color},
        {name : "shirt", price : "$2345", pic : pic},
        {name : "T-Shirt", price : "$345"},  
        {name : "Pantsd", price : "$29455", pic : color}
    ]

    const list = prod.map(
        (p) => <Product name = {p.name} price = {p.price} pic = {p.pic}></Product>
    )

    return (
        <>
            {list}
        </>
    );

}

export {ProductList};