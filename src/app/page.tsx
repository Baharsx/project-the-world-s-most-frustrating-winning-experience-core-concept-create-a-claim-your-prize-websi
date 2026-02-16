"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [progress, setProgress] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [fakeCursors, setFakeCursors] = useState([
    { x: 0, y: 0, delay: 0 },
    { x: 0, y: 0, delay: 50 },
    { x: 0, y: 0, delay: 100 },
  ]);
  const [captchaSquares, setCaptchaSquares] = useState<boolean[]>(
    Array(9).fill(false)
  );
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Audio torture - high pitch sine wave
  useEffect(() => {
    if (!audioStarted) return;

    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);

    oscillator.start();

    // Warbling effect - pitch changes every 2 seconds
    const interval = setInterval(() => {
      const randomFreq = 950 + Math.random() * 100;
      oscillator.frequency.setValueAtTime(
        randomFreq,
        audioContext.currentTime
      );
    }, 2000);

    return () => {
      oscillator.stop();
      clearInterval(interval);
      audioContext.close();
    };
  }, [audioStarted]);

  // Fake progress bar that goes backwards after 99%
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          return Math.max(0, prev - 0.0167); // Go backwards at ~1% per minute
        }
        if (prev < 99) {
          return Math.min(99, prev + 0.825); // Reach 99% in ~2 seconds
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Inverted scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.scrollBy(0, -e.deltaY);
    };

    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel);
  }, []);

  // Multi-cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });

      setFakeCursors((prev) =>
        prev.map((cursor, i) => ({
          ...cursor,
          x: e.clientX + Math.sin(Date.now() / (200 + i * 100)) * (20 + i * 15),
          y: e.clientY + Math.cos(Date.now() / (200 + i * 100)) * (20 + i * 15),
        }))
      );
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Shy button that runs away
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;

      const button = buttonRef.current.getBoundingClientRect();
      const buttonCenter = {
        x: button.left + button.width / 2,
        y: button.top + button.height / 2,
      };

      const distance = Math.sqrt(
        Math.pow(e.clientX - buttonCenter.x, 2) +
          Math.pow(e.clientY - buttonCenter.y, 2)
      );

      if (distance < 150) {
        const angle = Math.atan2(
          buttonCenter.y - e.clientY,
          buttonCenter.x - e.clientX
        );
        const moveX = Math.cos(angle) * 50;
        const moveY = Math.sin(angle) * 50;

        const newX = button.left + moveX;
        const newY = button.top + moveY;

        buttonRef.current.style.position = "fixed";
        buttonRef.current.style.left = `${Math.max(0, Math.min(window.innerWidth - 200, newX))}px`;
        buttonRef.current.style.top = `${Math.max(0, Math.min(window.innerHeight - 60, newY))}px`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Navigation nightmare
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.open("", "_blank");
    setTimeout(() => {
      window.location.href = "/404";
    }, 100);
  };

  const startAudio = () => {
    setAudioStarted(true);
    setShowCaptcha(true);
  };

  const handleCaptchaClick = (index: number) => {
    alert("Incorrect. That square contained Despair. Try again.");
    window.location.reload();
  };

  return (
    <>
      {/* Custom cursors */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
        .custom-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          font-size: 24px;
        }
        .cursor-1 {
          transition: all 0.05s ease-out;
        }
        .cursor-2 {
          transition: all 0.08s ease-out;
        }
        .cursor-3 {
          transition: all 0.12s ease-out;
        }
      `}</style>

      {/* Multiple fake cursors */}
      <div
        className="custom-cursor cursor-1"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
          color: "#FF00FF",
        }}
      >
        ✦
      </div>
      <div
        className="custom-cursor cursor-2"
        style={{
          left: fakeCursors[0].x,
          top: fakeCursors[0].y,
          color: "#00FF00",
        }}
      >
        ⬡
      </div>
      <div
        className="custom-cursor cursor-3"
        style={{
          left: fakeCursors[1].x,
          top: fakeCursors[1].y,
          color: "#FFFF00",
        }}
      >
        ◇
      </div>

      {/* 90s tiled background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          backgroundColor: "#000",
          backgroundImage: `
            url("https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"),
            url("https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif"),
            url("https://media.giphy.com/media/l378giAZgxPw3eO52/giphy.gif")
          `,
          backgroundSize: "150px 150px",
          backgroundRepeat: "repeat",
          opacity: 0.3,
        }}
      />

      <div
        style={{
          minHeight: "200vh",
          padding: "20px",
          position: "relative",
        }}
      >
        {/* Chaotic overlapping elements */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "5px",
            backgroundColor: "#00FF00",
            color: "#FF00FF",
            padding: "30px",
            fontSize: "48px",
            fontFamily: "Impact, sans-serif",
            transform: "rotate(-5deg)",
            zIndex: 1,
            border: "5px solid #FF0000",
          }}
        >
          CONGRATULATIONS!!!
        </div>

        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "-20px",
            backgroundColor: "#FF00FF",
            color: "#00FF00",
            padding: "20px",
            fontSize: "32px",
            fontFamily: "Comic Sans MS, cursive",
            transform: "rotate(3deg)",
            zIndex: 2,
            border: "3px dashed #FFFF00",
          }}
        >
          YOU ARE THE 1,000,000th VISITOR!
        </div>

        <div
          style={{
            position: "absolute",
            top: "200px",
            left: "30px",
            backgroundColor: "#FFFF00",
            color: "#FF00FF",
            padding: "15px",
            fontSize: "24px",
            fontWeight: "bold",
            transform: "rotate(-2deg)",
            zIndex: 3,
          }}
        >
          ★★★ $1,000,000 CLAIM ★★★
        </div>

        {/* Main content area */}
        <div
          style={{
            marginTop: "350px",
            position: "relative",
            zIndex: 10,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "40px",
            border: "10px solid #FF00FF",
            borderRadius: "0",
          }}
        >
          <h1
            style={{
              color: "#00FF00",
              fontSize: "64px",
              textAlign: "center",
              textShadow: "3px 3px #FF00FF",
              marginBottom: "20px",
              fontFamily: "Papyrus, fantasy",
            }}
          >
            🎉 CLAIM YOUR PRIZE! 🎉
          </h1>

          <p
            style={{
              color: "#FFFF00",
              fontSize: "28px",
              textAlign: "center",
              marginBottom: "30px",
              backgroundColor: "#FF00FF",
              padding: "10px",
            }}
          >
            You have been selected to receive a FABULOUS PRIZE!
          </p>

          {/* Fake loading bar */}
          <div
            style={{
              width: "100%",
              height: "40px",
              backgroundColor: "#333",
              border: "3px solid #00FF00",
              marginBottom: "30px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: progress < 99 ? "#00FF00" : "#FF0000",
                transition: "width 0.1s linear",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#FFF",
                fontSize: "20px",
                fontWeight: "bold",
                textShadow: "2px 2px #000",
              }}
            >
              LOADING PRIZE: {progress.toFixed(1)}%
            </span>
          </div>

          {/* The Shy Button */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <button
              ref={buttonRef}
              onClick={startAudio}
              style={{
                backgroundColor: "#FF00FF",
                color: "#00FF00",
                border: "5px solid #FFFF00",
                padding: "20px 50px",
                fontSize: "36px",
                fontWeight: "bold",
                cursor: "pointer",
                fontFamily: "Impact, sans-serif",
                boxShadow: "10px 10px 0px #FF0000",
                transition: "transform 0.1s",
              }}
            >
              🔥 CLAIM PRIZE NOW! 🔥
            </button>
          </div>

          {/* Hidden emotional CAPTCHA */}
          {showCaptcha && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.95)",
                zIndex: 10000,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h2
                style={{
                  color: "#888",
                  fontSize: "36px",
                  marginBottom: "30px",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                CAPTCHA: Click all squares that contain Hope
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 150px)",
                  gap: "10px",
                }}
              >
                {captchaSquares.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleCaptchaClick(index)}
                    style={{
                      width: "150px",
                      height: "150px",
                      backgroundColor: "#666",
                      border: "2px solid #888",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Navigation nightmare links */}
          <div
            style={{
              marginTop: "40px",
              textAlign: "center",
            }}
          >
            <a
              href="#"
              onClick={handleLinkClick}
              style={{
                color: "#00FF00",
                fontSize: "20px",
                margin: "0 15px",
                textDecoration: "underline",
              }}
            >
              Terms of Service
            </a>
            <a
              href="#"
              onClick={handleLinkClick}
              style={{
                color: "#FFFF00",
                fontSize: "20px",
                margin: "0 15px",
                textDecoration: "underline",
              }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              onClick={handleLinkClick}
              style={{
                color: "#FF00FF",
                fontSize: "20px",
                margin: "0 15px",
                textDecoration: "underline",
              }}
            >
              Contact Support
            </a>
          </div>

          {/* More chaotic decorations */}
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              left: "-50px",
              backgroundColor: "#FF0000",
              color: "#00FF00",
              padding: "50px",
              fontSize: "40px",
              transform: "rotate(15deg)",
              zIndex: 5,
            }}
          >
            ★★★★★★★★★★★
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "-150px",
              right: "0",
              backgroundColor: "#0000FF",
              color: "#FF00FF",
              padding: "30px",
              fontSize: "28px",
              transform: "rotate(-10deg)",
              zIndex: 4,
              border: "5px double #FFFF00",
            }}
          >
            LIMITED TIME ONLY!!!
          </div>
        </div>

        {/* Scrolling message */}
        <div
          style={{
            marginTop: "100px",
            backgroundColor: "#FF0000",
            color: "#FFFF00",
            padding: "20px",
            fontSize: "24px",
            textAlign: "center",
            animation: "blink 0.5s infinite",
          }}
        >
          ↓ SCROLL DOWN TO CLAIM YOUR PRIZE ↓
        </div>

        <style jsx>{`
          @keyframes blink {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.3;
            }
          }
        `}</style>
      </div>
    </>
  );
}
