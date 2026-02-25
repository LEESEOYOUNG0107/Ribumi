// src/components/WavesBackground.jsx

const WavesBackground = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        /* 화면 크기에 맞춰 비율을 유지하며 꽉 차도록 설정 */
        width="100%"
        height="100%"
        viewBox="0 0 1920 822"
        fill="none"
        preserveAspectRatio="xMidYMax slice" 
      >
        <g filter="url(#filter0_f_206_2168)">
          <path
            d="M354.763 248.695C165.545 266.812 -38 144.237 -38 144.237V742H1998L1998 157.731C1998 157.731 1760.35 441.92 1516.07 412.13C1290.8 384.659 1200.27 98.5914 969.388 81.2615C738.511 63.9315 543.982 230.578 354.763 248.695Z"
            fill="url(#paint0_linear_206_2168)"
            fillOpacity="0.82" /* 리액트용 문법으로 수정 */
          />
        </g>
        <defs>
          <filter
            id="filter0_f_206_2168"
            x="-118"
            y="0"
            width="2196"
            height="822"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB" /* 리액트용 문법으로 수정 */
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" /> /* 리액트용 문법으로 수정 */
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="40" result="effect1_foregroundBlur_206_2168" />
          </filter>
          <linearGradient
            id="paint0_linear_206_2168"
            x1="973.056"
            y1="89.6251"
            x2="973.056"
            y2="741.999"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1E2A78" /> 
            <stop offset="1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default WavesBackground;