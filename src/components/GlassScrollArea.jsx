import { useRef, useEffect, useState } from "react";

function GlassScrollArea({
    children,
    height = 650,
    style = {}
}) {

    const scrollRef = useRef(null);

    const [showBars, setShowBars] = useState(false);
    const [thumbHeight, setThumbHeight] = useState(60);
const [thumbTop, setThumbTop] = useState(0);
const [thumbWidth, setThumbWidth] = useState(80);
const [thumbLeft, setThumbLeft] = useState(0);
const [dragging, setDragging] = useState(false);

const dragStartY = useRef(0);

const scrollStart = useRef(0);

const thumbRef = useRef(null);
const [showHorizontal, setShowHorizontal] = useState(false);

    useEffect(() => {

        const element = scrollRef.current;

        if (!element) return;

        let timer;

const handleScroll = () => {

    const el = scrollRef.current;

    if (!el) return;

    const visible = el.clientHeight;

    const total = el.scrollHeight;

    const scrollTop = el.scrollTop;

    const visibleWidth = el.clientWidth;

const totalWidth = el.scrollWidth;

const scrollLeft = el.scrollLeft;

const width = Math.max(
    (visibleWidth / totalWidth) * visibleWidth,
    60
);

const left = totalWidth > visibleWidth
    ? (scrollLeft / (totalWidth - visibleWidth)) *
    (visibleWidth - width)
    : 0;

setThumbWidth(width);

setThumbLeft(left);

    const height =
        Math.max(
            (visible / total) * visible,
            50
        );

    const top = (total > visible)
        ? (scrollTop / (total - visible))
        * (visible - height)
        : 0;

    setThumbHeight(height);

    setThumbTop(top);

    setShowBars(true);

    clearTimeout(timer);

    timer = setTimeout(() => {

        setShowBars(false);

    },2000);

};

        

 const handleMouseMove = (e) => {

    if (!dragging) return;

    const el = scrollRef.current;

    if (!el) return;

    const deltaY = e.clientY - dragStartY.current;

    const scrollRatio =
        (el.scrollHeight - el.clientHeight) /
        (el.clientHeight - thumbHeight);

    el.scrollTop =
        scrollStart.current + deltaY * scrollRatio;

};

const handleMouseUp = () => {

    setDragging(false);

};     
element.addEventListener(
            "scroll",
            handleScroll
        );

        window.addEventListener(
    "mousemove",
    handleMouseMove
);

window.addEventListener(
    "mouseup",
    handleMouseUp
);

handleScroll();

return () => {

    element.removeEventListener(
        "scroll",
        handleScroll
    );

    window.removeEventListener(
        "mousemove",
        handleMouseMove
    );

    window.removeEventListener(
        "mouseup",
        handleMouseUp
    );

    clearTimeout(timer);

};

    },[]);

   return (

    <div
        style={{
            position: "relative",
            borderRadius: "24px",
            overflowY: "hidden",
            overflowX: "auto",
            background:
                "linear-gradient(180deg,#1e293b,#172033)",
            border:
                "1px solid rgba(255,255,255,.08)",
            boxShadow:
                "0 18px 40px rgba(0,0,0,.35)",
            height: height,
            ...style
        }}
    >

        <div
    ref={scrollRef}
    className={
        showBars
            ? "glass-scroll show"
            : "glass-scroll"
    }

    onMouseMove={(e) => {

    const rect = e.currentTarget.getBoundingClientRect();

    const distanceBottom = rect.bottom - e.clientY;
    const distanceRight = rect.right - e.clientX;

    setShowHorizontal(distanceBottom < 28);

    if (distanceRight < 20) {

        setShowBars(true);

    } else {

        clearTimeout(window.scrollHideTimer);

        window.scrollHideTimer = setTimeout(() => {

            setShowBars(false);

        },3000);

    }

}}

    onMouseLeave={() => {

    setShowHorizontal(false);

    setTimeout(() => {

        setShowBars(false);

    },3000);

}}

    style={{
        overflow: "auto",
        height: "100%",
        width: "100%"
    }}
>

            {children}

        </div>

        {/* Cyberpunk Scrollbar */}

        <div
            style={{
                position: "absolute",
                top: 8,
                right: 6,
                width: "8px",
                height: "calc(100% - 16px)",
                borderRadius: "999px",
                background: "rgba(255,255,255,.05)",
                opacity: showBars ? 1 : 0,

transform: showBars
    ? "translateX(0)"
    : "translateX(12px)",

transition: "opacity .35s, transform .35s", 
                pointerEvents:"none",
            }}
        >

            <div
    ref={thumbRef}

    onMouseDown={(e) => {

        e.preventDefault();

        setDragging(true);

        dragStartY.current = e.clientY;

        scrollStart.current =
            scrollRef.current.scrollTop;

    }}

    style={{
                    position: "absolute",
                    width: dragging ? "12px" : "8px",
                    top: thumbTop,
                    height: thumbHeight,
                    borderRadius: "999px",
                    background:
                        "linear-gradient(180deg,#37FFD7,#0EA5E9)",
                    boxShadow: dragging
    ? "0 0 18px #37FFD7,0 0 45px rgba(55,255,215,.9)"
    : "0 0 10px #37FFD7,0 0 20px rgba(55,255,215,.45)",
                    transition: "top .08s linear",
                    cursor: "pointer",
                    pointerEvents: showBars ? "auto" : "none",
                }}
            />

        </div>

    </div>

);
}

export default GlassScrollArea;