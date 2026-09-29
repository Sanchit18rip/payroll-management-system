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
            const width = Math.max((visibleWidth / totalWidth) * visibleWidth, 60);
            const left = totalWidth > visibleWidth ? (scrollLeft / (totalWidth - visibleWidth)) * (visibleWidth - width) : 0;
            setThumbWidth(width);
            setThumbLeft(left);
            const h = Math.max((visible / total) * visible, 50);
            const top = (total > visible) ? (scrollTop / (total - visible)) * (visible - h) : 0;
            setThumbHeight(h);
            setThumbTop(top);
            setShowBars(true);
            clearTimeout(timer);
            timer = setTimeout(() => setShowBars(false), 2000);
        };

        const handleMouseMove = (e) => {
            if (!dragging) return;
            const el = scrollRef.current;
            if (!el) return;
            const deltaY = e.clientY - dragStartY.current;
            const scrollRatio = (el.scrollHeight - el.clientHeight) / (el.clientHeight - thumbHeight);
            el.scrollTop = scrollStart.current + deltaY * scrollRatio;
        };

        const handleMouseUp = () => setDragging(false);

        element.addEventListener("scroll", handleScroll);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        handleScroll();

        return () => {
            element.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            clearTimeout(timer);
        };
    }, [dragging, thumbHeight]);

    return (
        <div
            style={{
                position: "relative",
                borderRadius: "20px",
                overflowY: "hidden",
                overflowX: "auto",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,.08)",
                height: height,
                ...style
            }}
        >
            <div
                ref={scrollRef}
                className={showBars ? "glass-scroll show" : "glass-scroll"}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const distanceBottom = rect.bottom - e.clientY;
                    const distanceRight = rect.right - e.clientX;
                    const distanceLeft = e.clientX - rect.left;
                    if (distanceBottom < 28 || distanceRight < 20 || distanceLeft < 20) {
                        setShowBars(true);
                    } else {
                        clearTimeout(window.scrollHideTimer);
                        window.scrollHideTimer = setTimeout(() => { setShowBars(false); }, 3000);
                    }
                }}
                onMouseLeave={() => {
                    setTimeout(() => setShowBars(false), 3000);
                }}
                style={{ overflow: "auto", height: "100%", width: "100%" }}
            >
                {children}
            </div>

            {/* Vertical Scrollbar */}
            <div
                style={{
                    position: "absolute",
                    top: 8,
                    right: 6,
                    width: "8px",
                    height: "calc(100% - 16px)",
                    borderRadius: "999px",
                    background: "rgba(0,0,0,.06)",
                    opacity: showBars ? 1 : 0,
                    transform: showBars ? "translateX(0)" : "translateX(12px)",
                    transition: "opacity .35s, transform .35s",
                    pointerEvents: "none",
                }}
            >
                <div
                    ref={thumbRef}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setDragging(true);
                        dragStartY.current = e.clientY;
                        scrollStart.current = scrollRef.current.scrollTop;
                    }}
                    style={{
                        position: "absolute",
                        width: dragging ? "10px" : "6px",
                        top: thumbTop,
                        height: thumbHeight,
                        borderRadius: "999px",
                        background: "#94a3b8",
                        transition: "top .08s linear, width .2s",
                        cursor: "pointer",
                        pointerEvents: showBars ? "auto" : "none",
                    }}
                />
            </div>

            {/* Horizontal Scrollbar */}
            <div
                style={{
                    position: "absolute",
                    bottom: 6,
                    left: 8,
                    height: "8px",
                    width: "calc(100% - 16px)",
                    borderRadius: "999px",
                    background: "rgba(0,0,0,.06)",
                    opacity: showBars ? 1 : 0,
                    transform: showBars ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity .35s, transform .35s",
                    pointerEvents: "none",
                }}
            >
                <div
                    onMouseDown={(e) => {
                        e.preventDefault();
                        const el = scrollRef.current;
                        if (!el) return;
                        const startX = e.clientX;
                        const startLeft = el.scrollLeft;
                        const onMove = (ev) => {
                            const dx = ev.clientX - startX;
                            const scrollRatio = (el.scrollWidth - el.clientWidth) / (el.clientWidth - thumbWidth);
                            el.scrollLeft = startLeft + dx * scrollRatio;
                        };
                        const onUp = () => {
                            window.removeEventListener("mousemove", onMove);
                            window.removeEventListener("mouseup", onUp);
                        };
                        window.addEventListener("mousemove", onMove);
                        window.addEventListener("mouseup", onUp);
                    }}
                    style={{
                        position: "absolute",
                        height: "6px",
                        left: thumbLeft,
                        width: thumbWidth,
                        borderRadius: "999px",
                        background: "#94a3b8",
                        transition: "left .08s linear, height .2s",
                        cursor: "pointer",
                        pointerEvents: showBars ? "auto" : "none",
                    }}
                />
            </div>
        </div>
    );
}

export default GlassScrollArea;
