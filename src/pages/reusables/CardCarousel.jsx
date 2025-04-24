import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import CardComponent from './CardComponent';
import { Com, Pad, Pink, Pink2, Org, Org2, Act, Act2 } from '../../assets';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Custom styles for the carousel
const customStyles = {
  navigationButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    cursor: 'pointer',
    background: '#fff',
    border: 'none',
    borderRadius: '50%',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  navigationButtonPrev: {
    left: '5px',
  },
  navigationButtonNext: {
    right: '5px',
  },
  paginationContainer: {
    position: 'relative',
    bottom: '15px',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  paginationDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#ccc',
    margin: '0 5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  paginationDotActive: {
    background: '#2E3192',
    width: '12px',
    height: '12px',
  },
  carouselContainer: {
    position: 'relative',
    padding: '20px 5px',
    margin: '20px 0',
  }
};

const CardCarousel = ({ devices }) => {
  const swiperRef = useRef(null);
  const totalSlides = 9; // Total number of slides
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Check if devices is available and has required properties
  const onlineDevices = devices?.counts?.onlinedevice || 0;
  const offlineDevices = devices?.counts?.offlinedevice || 0;
  const sosCount = devices?.counts?.sos || 0;
  const accidentCount = devices?.counts?.accident_detected || 0;
  const manualCount = devices?.counts?.manualscan || 0;
  const pendingCase = devices?.counts?.pending_case || 0;
  const responders = devices?.counts?.responders || 0;
  const attendingCase = devices?.counts?.attended_case || 0;
  const awayCase = devices?.counts?.awaycase || 0;

  const cardItems = [
    {
      title: "Online Devices",
      imageBase: Pad,
      image: Com,
      value: onlineDevices
    },
    {
      title: "Offline Devices",
      imageBase: Act2,
      image: Act,
      value: offlineDevices
    },
    {
      title: "SOS",
      imageBase: Org2,
      image: Org,
      value: sosCount
    },
    {
      title: "Accident Detected",
      imageBase: Pink2,
      image: Pink,
      value: accidentCount
    },
    {
      title: "Manual Scan",
      imageBase: Pad,
      image: Com,
      value: manualCount
    },
    {
      title: "Pending Case",
      imageBase: Act2,
      image: Act,
      value: pendingCase
    },
    {
      title: "Responders",
      imageBase: Org2,
      image: Org,
      value: responders
    },
    {
      title: "Attended Cases",
      imageBase: Pink2,
      image: Pink,
      value: attendingCase
    },
    {
      title: "Away Cases",
      imageBase: Org2,
      image: Org,
      value: awayCase
    },
  ];

  // Navigation handlers
  const handlePrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.activeIndex);
  };

  // Create custom pagination dots
  const renderPagination = () => {
    // Calculate maximum visible slides based on breakpoints
    const getVisibleSlides = () => {
      const width = window.innerWidth;
      if (width >= 1280) return 4;
      if (width >= 1024) return 3;
      if (width >= 640) return 2;
      return 1;
    };

    const visibleSlides = getVisibleSlides();
    const totalPages = Math.ceil(cardItems.length / visibleSlides);
    
    // Create array of pages
    const pages = Array.from({ length: totalPages }, (_, i) => i);
    
    return (
      <div style={customStyles.paginationContainer}>
        {pages.map((page) => (
          <div
            key={page}
            style={{
              ...customStyles.paginationDot,
              ...(Math.floor(activeIndex / visibleSlides) === page ? customStyles.paginationDotActive : {})
            }}
            onClick={() => {
              if (swiperRef.current && swiperRef.current.swiper) {
                swiperRef.current.swiper.slideTo(page * visibleSlides);
              }
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={customStyles.carouselContainer} className="mt-5">
      {/* Custom previous button */}
      <button
        onClick={handlePrev}
        style={{ ...customStyles.navigationButton, ...customStyles.navigationButtonPrev }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} color="#2E3192" />
      </button>

      <Swiper
        ref={swiperRef}
        slidesPerView={1}
        spaceBetween={20}
        onSlideChange={handleSlideChange}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1280: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
        }}
        modules={[Pagination, Navigation, Autoplay]}
        className="mySwiper"
        style={{ padding: '0 10px' }}
      >
        {cardItems.map((card, index) => (
          <SwiperSlide key={index}>
            <CardComponent
              title={card.title}
              imageBase={card.imageBase}
              image={card.image}
              value={card.value}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom next button */}
      <button
        onClick={handleNext}
        style={{ ...customStyles.navigationButton, ...customStyles.navigationButtonNext }}
        aria-label="Next slide"
      >
        <ChevronRight size={24} color="#2E3192" />
      </button>

      {/* Custom pagination */}
      {renderPagination()}
    </div>
  );
};

export default CardCarousel;