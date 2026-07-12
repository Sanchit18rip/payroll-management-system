import "./LoginAnimation.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sky from "./Sky";

function LoginAnimation() {
const [stage, setStage] = useState("loading");
const navigate = useNavigate();
const [flash, setFlash] = useState(false);
const [greeting, setGreeting] = useState("");
const [subtitle, setSubtitle] = useState("");
const [bgClass, setBgClass] = useState("");
const [fadeOut, setFadeOut] = useState(false);
const [blur, setBlur] = useState(false);
const [zoom, setZoom] = useState(false);

useEffect(() => {
  const hour = new Date().getHours();

if (hour >= 5 && hour < 12) {
  setGreeting("GOOD MORNING");
  setSubtitle("Welcome back.");
  setBgClass("morning");
}

else if (hour >= 12 && hour < 17) {
  setGreeting("GOOD AFTERNOON");
  setSubtitle("Hope your day is going well.");
  setBgClass("afternoon");
}

else if (hour >= 17 && hour < 21) {
  setGreeting("GOOD EVENING");
  setSubtitle("Let's finish strong.");
  setBgClass("evening");
}

else {
  setGreeting("GOOD NIGHT");
  setSubtitle("Time to wrap things up.");
  setBgClass("night");
}
  const t1 = setTimeout(() => {

    setFlash(true);

    setStage("success");

}, 4500);

const t2 = setTimeout(() => {

    setStage("preparing");

}, 6500);

const t3 = setTimeout(() => {

    setStage("greeting");

}, 9000);

const t4 = setTimeout(() => {

    setFadeOut(true);

}, 12500);

const t5 = setTimeout(() => {

    setBlur(true);

}, 12900);

const t6 = setTimeout(() => {

    setZoom(true);

}, 13100);

const t7 = setTimeout(() => {

    navigate("/dashboard");

}, 14000);

  return () => {

    clearTimeout(t1);
    clearTimeout(t2);
    clearTimeout(t3);
    clearTimeout(t4);
    clearTimeout(t5);
    clearTimeout(t6);
    clearTimeout(t7);
  };

}, [navigate]);


  return (

    <div
className={`

login-animation

${bgClass}

${flash ? "flash" : ""}

${fadeOut ? "fade-out" : ""}

${blur ? "blur-screen" : ""}

${zoom ? "zoom-screen" : ""}

`}
>
  <Sky type={bgClass} />
  {bgClass !== "night" && (
  <div className="god-rays"></div>
)}
  {bgClass !== "night" && (
  <>
    <div className="cloud cloud1"></div>
    <div className="cloud cloud2"></div>
    <div className="cloud cloud3"></div>
  </>
)}
{bgClass === "night" && (
  <div className="stars">
    {Array.from({ length: 70 }).map((_, i) => (
      <span
        key={i}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 70}%`,
          animationDelay: `${Math.random() * 5}s`
        }}
      />
    ))}
  </div>
)}

        <div className="particles">

  {[...Array(18)].map((_, i) => (

    <span
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${5 + Math.random() * 6}s`
      }}
    />

  ))}

</div>

    <div className="login-content">

     <div className="loader-container">

<div className="glass-glow"></div>

<div className="loader">

    {stage === "loading" ? (

        <svg
    className="loader-ring"
    viewBox="0 0 120 120"
>

<defs>

<linearGradient
id="loaderGradient"
x1="0%"
y1="0%"
x2="100%"
y2="100%"
>


<stop
offset="0%"
stopColor="var(--loader1)"
/>

<stop
offset="50%"
stopColor="var(--loader2)"
/>

<stop
offset="100%"
stopColor="var(--loader3)"
/>

</linearGradient>

<filter id="glow">

<feGaussianBlur
stdDeviation="4"
result="coloredBlur"
/>

<feMerge>

<feMergeNode in="coloredBlur"/>

<feMergeNode in="SourceGraphic"/>

</feMerge>

</filter>

</defs>

<circle
className="ring-bg"
cx="60"
cy="60"
r="48"
/>

<g className="spinner">

  <circle
    className="ring-progress"
    cx="60"
    cy="60"
    r="48"
  />

  <circle
    className="ring-head"
    cx="60"
    cy="12"
    r="6"
  />

</g>
</svg>

    ) : (

        <svg
            className="success-ring"
            viewBox="0 0 120 120"
        >

            <circle
                className="success-circle"
                cx="60"
                cy="60"
                r="48"
            />

            <path
                className="success-check"
                d="M38 62 L54 78 L84 45"
            />

        </svg>

    )}

</div>

</div>



      <h2
  className={
    stage === "greeting"
      ? "greeting-text"
      : "loading-text"
  }
>
  {
    stage === "loading"
      ? "Signing you in..."
      : stage === "success"
      ? "LOGIN SUCCESSFUL"
      : stage === "preparing"
      ? "Preparing your dashboard..."
      : greeting
  }
</h2>

{
stage === "greeting" && (

<p className="greeting-subtitle">

{subtitle}

</p>

)
}

      {stage === "loading" && (

<div className="dots">

        <span></span>
        <span></span>
        <span></span>

      </div>
    )}
    </div>
</div>
  );

}

export default LoginAnimation;