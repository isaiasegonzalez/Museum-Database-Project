import NavbarBlack from "../components/NavbarBlack.jsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SubtractIcon from '../components/SubtractIcon.jsx'
import AddIcon from '../components/AddIcon.jsx'
import { useAuth } from "../components/authentication"
import "../components/Modal.css"

const GiftShopProductPage = () => {
  const { userId } = useAuth()
  // Update form data whenever input changes. Don't allow values out of range 
  const handleChange = (e) => {
    let { name, value } = e.target;
    if(value > maxProduct){
      value = maxProduct;
    }
    else if(value < 0){
      value = 0;
    }
    
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Decrease ticket count by 1
  const handleDecrease = (e) => {
    e.preventDefault()
    let { name, value } = e.currentTarget;
    value--;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value >= maxProduct ? maxProduct : value <= 0 ? 0 : value
    }));

  };

  // Increase ticket count by 1
  const handleIncrease = (e) => {
    e.preventDefault()
    let { name, value } = e.currentTarget;
    value++;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value >= maxProduct ? maxProduct : value <= 0 ? 0 : value
    }));

  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/customer_product`,
        [{customer_id: userId, product_id: prodID, amount_spent: subtotal, quantity: formData.quantity}]
      );
    } catch (err) {
      console.log(err);
    }
    toggleModal();
  };

  const handleSubtotal = (formData) => {
    setSubtotal(productInfo.price * formData.quantity);
  };



  const { prodCatID, prodID } = useParams();
  const [productInfo, setProductInfo] = useState([]);
  const [formData, setFormData] = useState({quantity: 0});
  const [subtotal, setSubtotal] = useState(0);
  const maxProduct = 20;

  useEffect(() => {
    const fetchGiftShopProductInfo = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/product/${prodID}`
        );
        setProductInfo(response.data);
      } catch (error) {
        console.error("Error fetching product information", error);
      }
    };
    fetchGiftShopProductInfo();
  }, [prodID]);

  if (!productInfo)
    return <div className="text-center mt-20">Loading...</div>;

  useEffect(() => {
    console.log(userId, prodID, subtotal, formData.quantity)
    handleSubtotal(formData);
  }, [formData]);

  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
  };

  if(modal) {
    document.body.classList.add('active-modal')
  } else {
    document.body.classList.remove('active-modal')
  }
  
  return (
    <div>
      <NavbarBlack/>
      <div className="container mx-auto pb-12 p-1 flex flex-row">
        <div className="w-[45rem] h-[40rem] ml-20 mt-36">
        <img
            src={productInfo.image_path}
            alt={productInfo.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="w-[40rem] h-screen ml-5 mt-36">
          <h1 className="text-2xl font-medium">
            {productInfo.name}
          </h1>
          <h2 className="text-2xl mt-4 text-default-gray">
            ${productInfo.price?.toFixed(2)}
          </h2>
          <p className="mt-10">
            {productInfo.description}
          </p>
          <div className="mt-8 flex flex-row">
            <button name="quantity" value={formData.quantity} onClick={handleDecrease}>
              <SubtractIcon/>
            </button>
            <form className="p-1">
              <input
                type="number"
                name="quantity"
                id="quantity"
                min="0"
                max={maxProduct}
                placeholder="0"
                value={formData.quantity || 0}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if(e.key==='.'){e.preventDefault()} // Prevent decimal
                }}
                onInput={(e) => { // Remove leading zeros
                  if(e.target.value[0] == "0" && (e.target.value).length > 1){
                    e.target.value = e.target.value.replace("0", "");
                  }
                  e.target.value = e.target.value.replace(/[^0-9]*/g,''); // Do not allow "+" or "-"
                }} 
                className="w-9 h-8 text-center"
              />
            </form>

            {/* Add a ticket */}
            <button name="quantity" value={formData.quantity} onClick={handleIncrease}>
              <AddIcon/>
            </button>
          </div>
          <button
            className="w-full mt-4 bg-black text-white py-2 px-52 border-black rounded"
            onClick={toggleModal}
          >
            Purchase
          </button>
        </div>
      </div>
      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <h2>You are about to purchase:</h2>
            <p className="font-medium mt-10 mb-10">
              {productInfo.name} ({formData.quantity}x)<br/>
              ${(productInfo.price).toFixed(2)} <br/><br/>
              <span className="font-bold">Subtotal: ${subtotal.toFixed(2)}</span>
            </p>
            <div className="flex flex-row justify-center space-x-40">
              <button onClick={toggleModal}>
                Cancel
              </button>
              <button onClick={handleSubmit}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftShopProductPage;