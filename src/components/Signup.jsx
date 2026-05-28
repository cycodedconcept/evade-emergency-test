import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import '../style.css';
import { Logo, Side, Google } from '../assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../features/userSlice';
import Swal from 'sweetalert2';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [licenseKey, setLicenseKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const { loading } = useSelector((state) => state.user);

  // Check if all fields have values
  const isFormValid = licenseKey.trim() !== '' && email.trim() !== '' && phone.trim() !== '' && password.trim() !== '';

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!licenseKey || !email || !phone || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in your license key, email, phone number, and password.',
        confirmButtonColor: '#7A0091'
      });
      return;
    }

    try {
      Swal.fire({
        title: "Validating Credentials...",
        text: "Please wait while we process your request.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await dispatch(registerUser({
        license_key: licenseKey,
        email,
        phone,
        password
      })).unwrap();

      Swal.close();

      if (response.message === "Responder company signup successful") {
        navigate('/')
      }
    } catch (error) {
      let errorMessage = "Something went wrong";
            
      if (error && typeof error === "object") {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.payload && error.payload.message) {
          errorMessage = error.payload.message;
        }
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#1f81ec'
      });
    }
  }

  return (
    <>
        <div className="row">
            <div className="col-sm-12 col-md-12 col-lg-6">
                <img src={Logo} alt="" className='p-2'/>
                <div className="p-5">
                    <h4 style={{color: '#14181F', fontWeight: '700'}}>Sign Up</h4>
                    <p style={{color: '#707A8F'}}>Already have an account? <span style={{color: '#2E3192', fontWeight: '600'}}>Sign In Here</span></p>
                    
                    <form onSubmit={handleRegister}>
                        <div className="form-group mb-0">
                            <label htmlFor="exampleInputEmail1">license key <span style={{color: '#707A8F'}}>*</span></label>
                            <input 
                              type="text" 
                              placeholder='Type your Liscence key here. . .'
                              value={licenseKey}
                              onChange={(e) => setLicenseKey(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-0">
                            <label htmlFor="exampleInputEmail1">Email <span style={{color: '#707A8F'}}>*</span></label>
                            <input 
                              type="email" 
                              placeholder='Type email here. . .'
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-0">
                            <label htmlFor="exampleInputEmail1">Phone <span style={{color: '#707A8F'}}>*</span></label>
                            <input 
                              type="text" 
                              placeholder='Type phone number here. . .'
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label htmlFor="exampleInputPassword1">Password</label>
                            <input 
                              type={showPassword ? 'text' : 'password'} 
                              placeholder='Type password here. . .'
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                            <span
                            onClick={togglePasswordVisibility}
                            style={{
                                position: 'absolute',
                                top: '57%',
                                right: '10px',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer'
                            }}
                            >
                            {showPassword ? <FontAwesomeIcon icon={faEye} style={{ color: '#707A8F' }} /> : <FontAwesomeIcon icon={faEyeSlash} style={{ color: '#707A8F' }} />}
                            </span>
                        </div>
                        <button 
                          className='log-btn mt-2 w-100' 
                          disabled={!isFormValid}
                          style={{
                            backgroundColor: isFormValid ? '#2E3192' : '#cccccc',
                            cursor: isFormValid ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {
                            loading ? (
                            <>
                              <div className="spinner-border spinner-border-sm text-light" role="status">
                                <span className="sr-only"></span>
                              </div>
                              <span>Signing up... </span>
                            </>
                            ) : ('Sign Up')
                          }
                        </button>
                    </form>
                </div>
            </div>
            <div className="col-sm-12 col-md-12 col-lg-6">
                <img src={Side}  alt='' className='l-img'/>
            </div>
        </div>
    </>
  )
}

export default Signup
